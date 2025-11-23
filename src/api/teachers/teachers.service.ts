import { and, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { v7 as uuid } from "uuid";
import { md5 } from "hono/utils/crypto";
import { sign } from "hono/jwt";
import { CreateTeacherDto, InviteTeacherDto, AcceptInvitationDto } from "./dto/teacher.dto";
import { users, invitationTokens, schools, UserRole, InvitationStatus } from "../../models";

export class TeachersService {
  private static instance: TeachersService;

  constructor(
    private readonly db: DrizzleD1Database<Record<string, never>>,
    private readonly jwtSecret: string
  ) {}

  public static getInstance(
    db: DrizzleD1Database<Record<string, never>>,
    jwtSecret: string
  ) {
    if (!this.instance) this.instance = new TeachersService(db, jwtSecret);
    return this.instance;
  }

  public async inviteTeacher(data: InviteTeacherDto, schoolId: string, inviterId: string) {
    const { email, firstName, lastName } = data;

    // Check if user already exists
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await this.db
      .select()
      .from(invitationTokens)
      .where(
        and(
          eq(invitationTokens.email, email),
          eq(invitationTokens.schoolId, schoolId),
          eq(invitationTokens.status, InvitationStatus.Pending)
        )
      )
      .get();

    if (existingInvitation) {
      throw new Error("An invitation already exists for this email");
    }

    // Create invitation token
    const token = uuid(); // UUID as token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days

    await this.db
      .insert(invitationTokens)
      .values({
        id: uuid(),
        token,
        email,
        schoolId,
        inviterId,
        status: InvitationStatus.Pending,
        expiresAt,
      });

    // In a real app, you would send an email here with the token
    console.log(`Invitation sent to ${email} with token: ${token}`);

    return { message: "Teacher invited successfully" };
  }

  public async acceptInvitation(data: AcceptInvitationDto) {
    const { token, password } = data;

    // Find the invitation
    const invitation = await this.db
      .select()
      .from(invitationTokens)
      .where(eq(invitationTokens.token, token))
      .get();

    if (!invitation || invitation.status !== InvitationStatus.Pending) {
      throw new Error("Invalid or expired invitation token");
    }

    // Check if token is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      await this.db
        .update(invitationTokens)
        .set({ status: InvitationStatus.Expired })
        .where(eq(invitationTokens.id, invitation.id));
      throw new Error("Invitation token has expired");
    }

    // Hash password
    const hashedPassword = await md5(password);

    // Get school info
    const school = await this.db
      .select()
      .from(schools)
      .where(eq(schools.id, invitation.schoolId))
      .get();

    if (!school) {
      throw new Error("School not found");
    }

    // Create the user
    const newUser = await this.db
      .insert(users)
      .values({
        id: uuid(),
        email: invitation.email,
        password: hashedPassword!,
        firstName: invitation.email.split('@')[0], // Using part of email as first name if not provided
        lastName: "",
        role: UserRole.Teacher,
        schoolId: invitation.schoolId,
      })
      .returning({ id: users.id })
      .get();

    // Update invitation status
    await this.db
      .update(invitationTokens)
      .set({ status: InvitationStatus.Accepted })
      .where(eq(invitationTokens.id, invitation.id));

    // Generate JWT token
    const jwtToken = await sign({ id: newUser.id }, this.jwtSecret);

    return { token: jwtToken };
  }

  public async getTeachersBySchool(schoolId: string) {
    const teachers = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        schoolId: users.schoolId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.schoolId, schoolId), eq(users.role, UserRole.Teacher)));

    return teachers;
  }

  public async removeTeacher(userId: string, schoolId: string) {
    // Verify that the user is a teacher in the specified school
    const teacher = await this.db
      .select()
      .from(users)
      .where(and(
        eq(users.id, userId),
        eq(users.schoolId, schoolId),
        eq(users.role, UserRole.Teacher)
      ))
      .get();

    if (!teacher) {
      throw new Error("Teacher not found in this school");
    }

    // In a real app, you might want to archive instead of delete
    await this.db
      .update(users)
      .set({ schoolId: null })
      .where(eq(users.id, userId));
  }

  public async isUserSchoolOwner(userId: string, schoolId: string): Promise<boolean> {
    const school = await this.db
      .select()
      .from(schools)
      .where(and(eq(schools.id, schoolId), eq(schools.ownerId, userId)))
      .get();

    return !!school;
  }
}