import { and, eq, gte, lte, count, avg, sql } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { attendanceLogs, students, classes, schools, users, UserRole } from "../../models";

export class AnalyticsService {
  private static instance: AnalyticsService;

  constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

  public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
    if (!this.instance) this.instance = new AnalyticsService(db);
    return this.instance;
  }

  // Get school-wide attendance statistics
  public async getSchoolAttendanceStats(schoolId: string, dateRange?: { startDate?: string; endDate?: string }) {
    let query = this.db
      .select({ count: count() })
      .from(attendanceLogs)
      .where(eq(attendanceLogs.schoolId, schoolId));

    if (dateRange?.startDate) {
      const startDate = new Date(dateRange.startDate);
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        query = this.db
          .select({ count: count() })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate),
              lte(attendanceLogs.date, endDate)
            )
          );
      } else {
        query = this.db
          .select({ count: count() })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate)
            )
          );
      }
    } else if (dateRange?.endDate) {
      const endDate = new Date(dateRange.endDate);
      query = this.db
        .select({ count: count() })
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.schoolId, schoolId),
            lte(attendanceLogs.date, endDate)
          )
        );
    }

    const totalAttendanceRecords = await query.get();

    // Get attendance by status
    let statusQuery = this.db
      .select({
        status: attendanceLogs.status,
        count: count(),
      })
      .from(attendanceLogs)
      .where(eq(attendanceLogs.schoolId, schoolId))
      .groupBy(attendanceLogs.status);

    if (dateRange?.startDate) {
      const startDate = new Date(dateRange.startDate);
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        statusQuery = this.db
          .select({
            status: attendanceLogs.status,
            count: count(),
          })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate),
              lte(attendanceLogs.date, endDate)
            )
          )
          .groupBy(attendanceLogs.status);
      } else {
        statusQuery = this.db
          .select({
            status: attendanceLogs.status,
            count: count(),
          })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate)
            )
          )
          .groupBy(attendanceLogs.status);
      }
    } else if (dateRange?.endDate) {
      const endDate = new Date(dateRange.endDate);
      statusQuery = this.db
        .select({
          status: attendanceLogs.status,
          count: count(),
        })
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.schoolId, schoolId),
            lte(attendanceLogs.date, endDate)
          )
        )
        .groupBy(attendanceLogs.status);
    }

    const attendanceByStatus = await statusQuery.all();

    // Get total students in school
    const totalStudents = await this.db
      .select({ count: count() })
      .from(students)
      .where(eq(students.schoolId, schoolId))
      .get();

    // Get total classes in school
    const totalClasses = await this.db
      .select({ count: count() })
      .from(classes)
      .where(eq(classes.schoolId, schoolId))
      .get();

    return {
      totalAttendanceRecords: totalAttendanceRecords?.count || 0,
      totalStudents: totalStudents?.count || 0,
      totalClasses: totalClasses?.count || 0,
      attendanceByStatus: attendanceByStatus.reduce((acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Get class attendance statistics
  public async getClassAttendanceStats(classId: string, schoolId: string, dateRange?: { startDate?: string; endDate?: string }) {
    let query = this.db
      .select({ count: count() })
      .from(attendanceLogs)
      .where(and(eq(attendanceLogs.classId, classId), eq(attendanceLogs.schoolId, schoolId)));

    if (dateRange?.startDate) {
      const startDate = new Date(dateRange.startDate);
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        query = this.db
          .select({ count: count() })
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
          .select({ count: count() })
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
        .select({ count: count() })
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.classId, classId),
            eq(attendanceLogs.schoolId, schoolId),
            lte(attendanceLogs.date, endDate)
          )
        );
    }

    const totalAttendanceRecords = await query.get();

    // Get attendance by status
    let statusQuery = this.db
      .select({
        status: attendanceLogs.status,
        count: count(),
      })
      .from(attendanceLogs)
      .where(and(eq(attendanceLogs.classId, classId), eq(attendanceLogs.schoolId, schoolId)))
      .groupBy(attendanceLogs.status);

    if (dateRange?.startDate) {
      const startDate = new Date(dateRange.startDate);
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        statusQuery = this.db
          .select({
            status: attendanceLogs.status,
            count: count(),
          })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.classId, classId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate),
              lte(attendanceLogs.date, endDate)
            )
          )
          .groupBy(attendanceLogs.status);
      } else {
        statusQuery = this.db
          .select({
            status: attendanceLogs.status,
            count: count(),
          })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.classId, classId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate)
            )
          )
          .groupBy(attendanceLogs.status);
      }
    } else if (dateRange?.endDate) {
      const endDate = new Date(dateRange.endDate);
      statusQuery = this.db
        .select({
          status: attendanceLogs.status,
          count: count(),
        })
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.classId, classId),
            eq(attendanceLogs.schoolId, schoolId),
            lte(attendanceLogs.date, endDate)
          )
        )
        .groupBy(attendanceLogs.status);
    }

    const attendanceByStatus = await statusQuery.all();

    // Get total students in class
    const totalStudents = await this.db
      .select({ count: count() })
      .from(students)
      .where(and(eq(students.classId, classId), eq(students.schoolId, schoolId)))
      .get();

    // Calculate average attendance rate
    const presentCount = attendanceByStatus.find(item => item.status === 'present')?.count || 0;
    const totalPossible = totalStudents?.count ? totalStudents.count * (totalAttendanceRecords?.count || 1) : 0; // Total possible attendance records
    const attendanceRate = totalPossible > 0 ? (presentCount / totalPossible) * 100 : 0;

    return {
      totalAttendanceRecords: totalAttendanceRecords?.count || 0,
      totalStudents: totalStudents?.count || 0,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      attendanceByStatus: attendanceByStatus.reduce((acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Get student attendance statistics
  public async getStudentAttendanceStats(studentId: string, schoolId: string, dateRange?: { startDate?: string; endDate?: string }) {
    let query;

    if (dateRange?.startDate && dateRange.endDate) {
      // Both start and end date provided
      const startDate = new Date(dateRange.startDate);
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
        )
        .orderBy(attendanceLogs.date);
    } else if (dateRange?.startDate) {
      // Only start date provided
      const startDate = new Date(dateRange.startDate);
      query = this.db
        .select()
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.studentId, studentId),
            eq(attendanceLogs.schoolId, schoolId),
            gte(attendanceLogs.date, startDate)
          )
        )
        .orderBy(attendanceLogs.date);
    } else if (dateRange?.endDate) {
      // Only end date provided
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
        )
        .orderBy(attendanceLogs.date);
    } else {
      // No date range provided
      query = this.db
        .select()
        .from(attendanceLogs)
        .where(and(eq(attendanceLogs.studentId, studentId), eq(attendanceLogs.schoolId, schoolId)))
        .orderBy(attendanceLogs.date);
    }

    const attendanceRecords = await query.all();

    // Get attendance by status
    let statusQuery;

    if (dateRange?.startDate && dateRange.endDate) {
      // Both start and end date provided
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      statusQuery = this.db
        .select({
          status: attendanceLogs.status,
          count: count(),
        })
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.studentId, studentId),
            eq(attendanceLogs.schoolId, schoolId),
            gte(attendanceLogs.date, startDate),
            lte(attendanceLogs.date, endDate)
          )
        )
        .groupBy(attendanceLogs.status);
    } else if (dateRange?.startDate) {
      // Only start date provided
      const startDate = new Date(dateRange.startDate);
      statusQuery = this.db
        .select({
          status: attendanceLogs.status,
          count: count(),
        })
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.studentId, studentId),
            eq(attendanceLogs.schoolId, schoolId),
            gte(attendanceLogs.date, startDate)
          )
        )
        .groupBy(attendanceLogs.status);
    } else if (dateRange?.endDate) {
      // Only end date provided
      const endDate = new Date(dateRange.endDate);
      statusQuery = this.db
        .select({
          status: attendanceLogs.status,
          count: count(),
        })
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.studentId, studentId),
            eq(attendanceLogs.schoolId, schoolId),
            lte(attendanceLogs.date, endDate)
          )
        )
        .groupBy(attendanceLogs.status);
    } else {
      // No date range provided
      statusQuery = this.db
        .select({
          status: attendanceLogs.status,
          count: count(),
        })
        .from(attendanceLogs)
        .where(and(eq(attendanceLogs.studentId, studentId), eq(attendanceLogs.schoolId, schoolId)))
        .groupBy(attendanceLogs.status);
    }

    const attendanceByStatus = await statusQuery.all();

    // Calculate attendance rate
    const presentCount = attendanceByStatus.find(item => item.status === 'present')?.count || 0;
    const totalCount = attendanceRecords.length;
    const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

    return {
      totalAttendanceRecords: totalCount,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      attendanceByStatus: attendanceByStatus.reduce((acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      attendanceHistory: attendanceRecords,
    };
  }

  // Get teacher activity statistics (attendance logs created by teacher)
  public async getTeacherActivityStats(teacherId: string, schoolId: string, dateRange?: { startDate?: string; endDate?: string }) {
    let query = this.db
      .select({ count: count() })
      .from(attendanceLogs)
      .where(and(eq(attendanceLogs.teacherId, teacherId), eq(attendanceLogs.schoolId, schoolId)));

    if (dateRange?.startDate) {
      const startDate = new Date(dateRange.startDate);
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        query = this.db
          .select({ count: count() })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.teacherId, teacherId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate),
              lte(attendanceLogs.date, endDate)
            )
          );
      } else {
        query = this.db
          .select({ count: count() })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.teacherId, teacherId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate)
            )
          );
      }
    } else if (dateRange?.endDate) {
      const endDate = new Date(dateRange.endDate);
      query = this.db
        .select({ count: count() })
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.teacherId, teacherId),
            eq(attendanceLogs.schoolId, schoolId),
            lte(attendanceLogs.date, endDate)
          )
        );
    }

    const totalRecords = await query.get();

    // Get attendance by status
    let statusQuery = this.db
      .select({
        status: attendanceLogs.status,
        count: count(),
      })
      .from(attendanceLogs)
      .where(and(eq(attendanceLogs.teacherId, teacherId), eq(attendanceLogs.schoolId, schoolId)))
      .groupBy(attendanceLogs.status);

    if (dateRange?.startDate) {
      const startDate = new Date(dateRange.startDate);
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        statusQuery = this.db
          .select({
            status: attendanceLogs.status,
            count: count(),
          })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.teacherId, teacherId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate),
              lte(attendanceLogs.date, endDate)
            )
          )
          .groupBy(attendanceLogs.status);
      } else {
        statusQuery = this.db
          .select({
            status: attendanceLogs.status,
            count: count(),
          })
          .from(attendanceLogs)
          .where(
            and(
              eq(attendanceLogs.teacherId, teacherId),
              eq(attendanceLogs.schoolId, schoolId),
              gte(attendanceLogs.date, startDate)
            )
          )
          .groupBy(attendanceLogs.status);
      }
    } else if (dateRange?.endDate) {
      const endDate = new Date(dateRange.endDate);
      statusQuery = this.db
        .select({
          status: attendanceLogs.status,
          count: count(),
        })
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.teacherId, teacherId),
            eq(attendanceLogs.schoolId, schoolId),
            lte(attendanceLogs.date, endDate)
          )
        )
        .groupBy(attendanceLogs.status);
    }

    const attendanceByStatus = await statusQuery.all();

    return {
      totalAttendanceRecords: totalRecords?.count || 0,
      attendanceByStatus: attendanceByStatus.reduce((acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}