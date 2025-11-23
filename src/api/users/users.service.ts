import { and, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { sign } from "hono/jwt";
import { md5 } from "hono/utils/crypto";
import { v7 as uuid } from "uuid";
import { users, UserRole, schools } from "../../models";

export class UsersService {


  constructor(
    private readonly db: DrizzleD1Database<Record<string, never>>,
    private readonly jwtSecret: string
  ) { }

  public static getInstance(
    db: DrizzleD1Database<Record<string, never>>,
    jwtSecret: string
  ) {
    return new UsersService(db, jwtSecret);
  }

  public async emailExists(email: string) {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    return !!user;
  }

  public async signUp(data: { email: string; password: string; firstName?: string; lastName?: string; role?: UserRole; schoolId?: string }) {
    const { email, password, firstName, lastName, role, schoolId } = data;

    const hashedPassword = await md5(password);

    const user = await this.db
      .insert(users)
      .values({
        email,
        password: hashedPassword!,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || UserRole.Teacher, // Default to Teacher
        schoolId: schoolId || null,
      })
      .returning({ id: users.id })
      .get();

    return user.id;
  }

  public async registerSchoolOwner(data: { email: string; password: string; firstName?: string; lastName?: string; schoolName: string }) {
    const { email, password, firstName, lastName, schoolName } = data;

    const hashedPassword = await md5(password);
    const userId = uuid();
    const schoolId = uuid();

    await this.db.batch([
      // 1. Create User
      this.db.insert(users).values({
        id: userId,
        email,
        password: hashedPassword!,
        firstName: firstName || null,
        lastName: lastName || null,
        role: UserRole.SchoolOwner,
        schoolId: schoolId, // Link to school immediately
      }),

      // 2. Create School
      this.db.insert(schools).values({
        id: schoolId,
        name: schoolName,
        ownerId: userId,
      })
    ]);

    return userId;
  }

  public async signIn(data: { email: string; password: string }) {
    const { email, password } = data;

    const hashedPassword = await md5(password);

    const user = await this.db
      .select({ id: users.id, role: users.role, schoolId: users.schoolId })
      .from(users)
      .where(and(eq(users.email, email), eq(users.password, hashedPassword!)))
      .get();

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const token = await sign({ id: user.id }, this.jwtSecret);
    return { token };
  }

  public async profile(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .get();

    if (!result) {
      throw new Error("User not found");
    }

    const { password, ...user } = result;

    return user;
  }
}
