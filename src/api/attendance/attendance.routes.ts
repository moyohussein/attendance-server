import { OpenAPIHono } from "@hono/zod-openapi";
import { Bindings, Variables } from "../../core/configs/workers";
import { auth } from "../../core/middlewares/auth.middleware";
import { AttendanceService } from "./attendance.service";
import { MarkAttendanceOpenAPI, GetAttendanceByClassOpenAPI, GetAttendanceByStudentOpenAPI } from "./openapi/attendance.openapi";
import { UserRole, students, classes } from "../../models";
import { and, eq } from "drizzle-orm";

const routes = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Mark attendance route - only for teachers
routes.openapi(MarkAttendanceOpenAPI, async (ctx) => {
  const { studentId, classId, date, status, note } = ctx.req.valid("json");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Only teachers can mark attendance
  if (userRole !== UserRole.Teacher) {
    return ctx.json({ message: "Only teachers can mark attendance" }, 403);
  }

  try {
    const attendanceService = AttendanceService.getInstance(ctx.var.db);
    const attendance = await attendanceService.markAttendance(
      { studentId, classId, date, status, note },
      userId,
      userSchoolId
    );
    return ctx.json({ id: attendance.id }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get attendance by class route - for school owners or teachers of that class
routes.openapi(GetAttendanceByClassOpenAPI, async (ctx) => {
  const { classId } = ctx.req.valid("param");
  const { startDate, endDate } = ctx.req.valid("query");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Check if user has permission to access this class attendance
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.Teacher) {
    return ctx.json({ message: "Access denied" }, 403);
  }

  try {
    // If user is teacher, check if they teach this class
    if (userRole === UserRole.Teacher) {
      const classRecord = await ctx.var.db
        .select()
        .from(classes)
        .where(and(eq(classes.id, classId), eq(classes.schoolId, userSchoolId), eq(classes.teacherId, userId)))
        .get();

      if (!classRecord) {
        return ctx.json({ message: "Access denied - not authorized to view this class attendance" }, 403);
      }
    }

    const attendanceService = AttendanceService.getInstance(ctx.var.db);
    const dateRange = startDate || endDate ? { startDate, endDate } : undefined;
    const attendance = await attendanceService.getAttendanceByClass(classId, userSchoolId, dateRange);
    return ctx.json({ attendance }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get attendance by student route - for school owners or teachers of that student's class
routes.openapi(GetAttendanceByStudentOpenAPI, async (ctx) => {
  const { studentId } = ctx.req.valid("param");
  const { startDate, endDate } = ctx.req.valid("query");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Check if user has permission to access this student's attendance
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.Teacher) {
    return ctx.json({ message: "Access denied" }, 403);
  }

  try {
    // Verify the student belongs to the user's school
    const student = await ctx.var.db
      .select()
      .from(students)
      .where(and(eq(students.id, studentId), eq(students.schoolId, userSchoolId)))
      .get();

    if (!student) {
      return ctx.json({ message: "Student not found in your school" }, 404);
    }

    // If user is teacher, check if they teach the student's class
    if (userRole === UserRole.Teacher) {
      const classRecord = await ctx.var.db
        .select()
        .from(classes)
        .where(and(eq(classes.id, student.classId), eq(classes.teacherId, userId)))
        .get();

      if (!classRecord) {
        return ctx.json({ message: "Access denied - not authorized to view this student's attendance" }, 403);
      }
    }

    const attendanceService = AttendanceService.getInstance(ctx.var.db);
    const dateRange = startDate || endDate ? { startDate, endDate } : undefined;
    const attendance = await attendanceService.getAttendanceByStudent(studentId, userSchoolId, dateRange);
    return ctx.json({ attendance }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

export { routes as AttendanceRoutes };