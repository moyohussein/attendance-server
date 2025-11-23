import { and, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { v7 as uuid } from "uuid";
import { CreateStudentDto, UpdateStudentDto } from "./dto/student.dto";
import { students, users, classes, schools, UserRole } from "../../models";

export class StudentsService {
  private static instance: StudentsService;

  constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

  public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
    if (!this.instance) this.instance = new StudentsService(db);
    return this.instance;
  }

  public async createStudent(data: CreateStudentDto, schoolId: string) {
    const { firstName, lastName, classId, parentEmail, parentPhone } = data;

    // Verify that the class belongs to the school
    const classRecord = await this.db
      .select()
      .from(classes)
      .where(and(eq(classes.id, classId), eq(classes.schoolId, schoolId)))
      .get();

    if (!classRecord) {
      throw new Error("Class does not exist in this school");
    }

    const newStudent = await this.db
      .insert(students)
      .values({
        id: uuid(),
        firstName,
        lastName,
        classId,
        schoolId,
        parentEmail: parentEmail || null,
        parentPhone: parentPhone || null,
      })
      .returning()
      .get();

    return newStudent;
  }

  public async getStudentsBySchool(schoolId: string, classId?: string) {
    let query = this.db.select().from(students).where(eq(students.schoolId, schoolId));

    if (classId) {
      query = this.db.select().from(students).where(and(eq(students.schoolId, schoolId), eq(students.classId, classId)));
    }

    const studentsList = await query.all();
    return studentsList;
  }

  public async getStudentById(id: string, schoolId: string) {
    const student = await this.db
      .select()
      .from(students)
      .where(and(eq(students.id, id), eq(students.schoolId, schoolId)))
      .get();

    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  }

  public async updateStudent(id: string, data: UpdateStudentDto, schoolId: string) {
    const { firstName, lastName, classId, parentEmail, parentPhone } = data;

    // If classId is being updated, verify that the class belongs to the school
    if (classId) {
      const classRecord = await this.db
        .select()
        .from(classes)
        .where(and(eq(classes.id, classId), eq(classes.schoolId, schoolId)))
        .get();

      if (!classRecord) {
        throw new Error("Class does not exist in this school");
      }
    }

    const updatedStudent = await this.db
      .update(students)
      .set({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        classId: classId || undefined,
        parentEmail: parentEmail !== undefined ? parentEmail : undefined,
        parentPhone: parentPhone !== undefined ? parentPhone : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(students.id, id), eq(students.schoolId, schoolId)))
      .returning()
      .get();

    if (!updatedStudent) {
      throw new Error("Student not found");
    }

    return updatedStudent;
  }

  public async deleteStudent(id: string, schoolId: string) {
    const deletedStudent = await this.db
      .delete(students)
      .where(and(eq(students.id, id), eq(students.schoolId, schoolId)))
      .returning()
      .get();

    if (!deletedStudent) {
      throw new Error("Student not found");
    }

    return { message: "Student deleted successfully" };
  }

  public async isUserSchoolOwner(userId: string, schoolId: string): Promise<boolean> {
    const school = await this.db
      .select()
      .from(schools)
      .where(and(eq(schools.id, schoolId), eq(schools.ownerId, userId)))
      .get();

    return !!school;
  }

  public async isUserTeacherInSchool(userId: string, schoolId: string): Promise<boolean> {
    const user = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.schoolId, schoolId),
          eq(users.role, UserRole.Teacher)
        )
      )
      .get();

    return !!user;
  }

  public async isStudentInSchool(studentId: string, schoolId: string): Promise<boolean> {
    const student = await this.db
      .select()
      .from(students)
      .where(and(eq(students.id, studentId), eq(students.schoolId, schoolId)))
      .get();

    return !!student;
  }
}