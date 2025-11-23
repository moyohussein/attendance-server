import { and, eq, gte, lte } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { v7 as uuid } from "uuid";
import { MarkAttendanceDto, GetAttendanceDto } from "./dto/attendance.dto";
import { attendanceLogs, users, students, classes, schools, UserRole } from "../../models";

export class AttendanceService {
  private static instance: AttendanceService;

  constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

  public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
    if (!this.instance) this.instance = new AttendanceService(db);
    return this.instance;
  }

  public async markAttendance(data: MarkAttendanceDto, teacherId: string, schoolId: string) {
    const { studentId, classId, status, note } = data;
    const date = data.date ? new Date(data.date) : new Date(); // Use provided date or current date

    // Verify that the student belongs to the school and class
    const student = await this.db
      .select()
      .from(students)
      .where(
        and(
          eq(students.id, studentId),
          eq(students.schoolId, schoolId),
          eq(students.classId, classId)
        )
      )
      .get();

    if (!student) {
      throw new Error("Student does not exist in this class/school");
    }

    // Verify that the class belongs to the school
    const classRecord = await this.db
      .select()
      .from(classes)
      .where(and(eq(classes.id, classId), eq(classes.schoolId, schoolId)))
      .get();

    if (!classRecord) {
      throw new Error("Class does not exist in this school");
    }

    // Check if attendance for this student and date already exists
    const existingAttendance = await this.db
      .select()
      .from(attendanceLogs)
      .where(
        and(
          eq(attendanceLogs.studentId, studentId),
          eq(attendanceLogs.classId, classId),
          eq(attendanceLogs.schoolId, schoolId),
          eq(attendanceLogs.date, date)
        )
      )
      .get();

    if (existingAttendance) {
      // Update existing attendance record
      const updatedAttendance = await this.db
        .update(attendanceLogs)
        .set({
          status,
          note: note || null,
          teacherId,
          updatedAt: new Date(),
        })
        .where(eq(attendanceLogs.id, existingAttendance.id))
        .returning()
        .get();

      return updatedAttendance;
    } else {
      // Create new attendance record
      const newAttendance = await this.db
        .insert(attendanceLogs)
        .values({
          id: uuid(),
          studentId,
          classId,
          schoolId,
          teacherId,
          date,
          status,
          note: note || null,
        })
        .returning()
        .get();

      return newAttendance;
    }
  }

  public async getAttendanceByClass(classId: string, schoolId: string, dateRange?: { startDate?: string; endDate?: string }) {
    let query = this.db
      .select()
      .from(attendanceLogs)
      .where(and(eq(attendanceLogs.classId, classId), eq(attendanceLogs.schoolId, schoolId)));

    if (dateRange?.startDate) {
      const startDate = new Date(dateRange.startDate);
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        query = this.db
          .select()
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.classId, classId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate),
              lte(attendanceLogs.date, endDate)
            )
          );
      } else {
        query = this.db
          .select()
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.classId, classId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate)
            )
          );
      }
    } else if (dateRange?.endDate) {
      const endDate = new Date(dateRange.endDate);
      query = this.db
        .select()
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.classId, classId),
            eq(attendanceLogs.schoolId, schoolId),
            lte(attendanceLogs.date, endDate)
          )
        );
    }

    const attendanceRecords = await query.all();
    return attendanceRecords;
  }

  public async getAttendanceByStudent(studentId: string, schoolId: string, dateRange?: { startDate?: string; endDate?: string }) {
    let query = this.db
      .select()
      .from(attendanceLogs)
      .where(and(eq(attendanceLogs.studentId, studentId), eq(attendanceLogs.schoolId, schoolId)));

    if (dateRange?.startDate) {
      const startDate = new Date(dateRange.startDate);
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        query = this.db
          .select()
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.studentId, studentId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate),
              lte(attendanceLogs.date, endDate)
            )
          );
      } else {
        query = this.db
          .select()
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.studentId, studentId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate)
            )
          );
      }
    } else if (dateRange?.endDate) {
      const endDate = new Date(dateRange.endDate);
      query = this.db
        .select()
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.studentId, studentId),
            eq(attendanceLogs.schoolId, schoolId),
            lte(attendanceLogs.date, endDate)
          )
        );
    }

    const attendanceRecords = await query.all();
    return attendanceRecords;
  }

  public async isUserSchoolOwner(userId: string, schoolId: string): Promise<boolean> {
    const school = await this.db
      .select()
      .from(schools)
      .where(and(eq(schools.id, schoolId), eq(schools.ownerId, userId)))
      .get();

    return !!school;
  }

  public async isUserTeacherInClass(userId: string, classId: string): Promise<boolean> {
    const user = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.role, UserRole.Teacher),
          eq(classes.id, classId),
          eq(classes.teacherId, userId)
        )
      )
      .leftJoin(classes, eq(users.schoolId, classes.schoolId))
      .get();

    return !!user;
  }
}