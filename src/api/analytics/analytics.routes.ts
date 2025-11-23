import { OpenAPIHono } from "@hono/zod-openapi";
import { Bindings, Variables } from "../../core/configs/workers";
import { auth } from "../../core/middlewares/auth.middleware";
import { AnalyticsService } from "./analytics.service";
import { UserRole, students, classes } from "../../models";
import { and, eq } from "drizzle-orm";
import { GetSchoolAnalyticsOpenAPI, GetClassAnalyticsOpenAPI, GetStudentAnalyticsOpenAPI } from "./openapi/analytics.openapi";

const routes = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Get school analytics
routes.openapi(GetSchoolAnalyticsOpenAPI, async (ctx) => {
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Only school owners and super admins can view school analytics
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.SuperAdmin) {
    return ctx.json({ message: "Access denied" }, 403);
  }

  try {
    // Get date range from query params
    const { startDate, endDate } = ctx.req.valid("query");

    const dateRange = startDate || endDate ? { startDate, endDate } : undefined;

    const analyticsService = AnalyticsService.getInstance(ctx.var.db);
    const stats = await analyticsService.getSchoolAttendanceStats(userSchoolId, dateRange);
    return ctx.json({ stats }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get class analytics
routes.openapi(GetClassAnalyticsOpenAPI, async (ctx) => {
  const { classId } = ctx.req.valid("param");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  try {
    // Check if user has permission to view this class analytics
    if (userRole !== UserRole.SchoolOwner) {
      // For teachers, verify they teach this class
      const classRecord = await ctx.var.db
        .select()
        .from(classes)
        .where(and(eq(classes.id, classId), eq(classes.schoolId, userSchoolId), eq(classes.teacherId, userId)))
        .get();

      if (!classRecord) {
        return ctx.json({ message: "Access denied" }, 403);
      }
    }

    // Get date range from query params
    const { startDate, endDate } = ctx.req.valid("query");

    const dateRange = startDate || endDate ? { startDate, endDate } : undefined;

    const analyticsService = AnalyticsService.getInstance(ctx.var.db);
    const stats = await analyticsService.getClassAttendanceStats(classId, userSchoolId, dateRange);
    return ctx.json({ stats }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get student analytics
routes.openapi(GetStudentAnalyticsOpenAPI, async (ctx) => {
  const { studentId } = ctx.req.valid("param");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
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
        return ctx.json({ message: "Access denied" }, 403);
      }
    }

    // Get date range from query params
    const { startDate, endDate } = ctx.req.valid("query");

    const dateRange = startDate || endDate ? { startDate, endDate } : undefined;

    const analyticsService = AnalyticsService.getInstance(ctx.var.db);
    const stats = await analyticsService.getStudentAttendanceStats(studentId, userSchoolId, dateRange);
    return ctx.json({ stats }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

export { routes as AnalyticsRoutes };