import { and, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { v7 as uuid } from "uuid";
import { CreateClassDto, UpdateClassDto } from "./dto/class.dto";
import { classes, users, schools, UserRole } from "../../models";

export class ClassesService {
  private static instance: ClassesService;

  constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

  public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
    if (!this.instance) this.instance = new ClassesService(db);
    return this.instance;
  }

  public async createClass(data: CreateClassDto, schoolId: string) {
    const { name, teacherId } = data;

    // If a teacher is assigned, verify they belong to the school
    if (teacherId) {
      const teacher = await this.db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, teacherId),
            eq(users.schoolId, schoolId),
            eq(users.role, UserRole.Teacher)
          )
        )
        .get();

      if (!teacher) {
        throw new Error("Teacher does not exist in this school");
      }
    }

    const newClass = await this.db
      .insert(classes)
      .values({
        id: uuid(),
        name,
        schoolId,
        teacherId: teacherId || null,
      })
      .returning()
      .get();

    return newClass;
  }

  public async getClassesBySchool(schoolId: string) {
    const classList = await this.db
      .select()
      .from(classes)
      .where(eq(classes.schoolId, schoolId));

    return classList;
  }

  public async getClassById(id: string, schoolId: string) {
    const classRecord = await this.db
      .select()
      .from(classes)
      .where(and(eq(classes.id, id), eq(classes.schoolId, schoolId)))
      .get();

    if (!classRecord) {
      throw new Error("Class not found");
    }

    return classRecord;
  }

  public async updateClass(id: string, data: UpdateClassDto, schoolId: string) {
    const { name, teacherId } = data;

    // If a teacher is assigned, verify they belong to the school
    if (teacherId) {
      const teacher = await this.db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, teacherId),
            eq(users.schoolId, schoolId),
            eq(users.role, UserRole.Teacher)
          )
        )
        .get();

      if (!teacher) {
        throw new Error("Teacher does not exist in this school");
      }
    }

    const updatedClass = await this.db
      .update(classes)
      .set({
        name: name || undefined,
        teacherId: teacherId !== undefined ? teacherId : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(classes.id, id), eq(classes.schoolId, schoolId)))
      .returning()
      .get();

    if (!updatedClass) {
      throw new Error("Class not found");
    }

    return updatedClass;
  }

  public async deleteClass(id: string, schoolId: string) {
    const deletedClass = await this.db
      .delete(classes)
      .where(and(eq(classes.id, id), eq(classes.schoolId, schoolId)))
      .returning()
      .get();

    if (!deletedClass) {
      throw new Error("Class not found");
    }

    return { message: "Class deleted successfully" };
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
}