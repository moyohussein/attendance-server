import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { UsersRoutes } from "./api/users/users.routes";
import { SchoolsRoutes } from "./api/schools/schools.routes";
import { TeachersRoutes } from "./api/teachers/teachers.routes";
import { ClassesRoutes } from "./api/classes/classes.routes";
import { StudentsRoutes } from "./api/students/students.routes";
import { AttendanceRoutes } from "./api/attendance/attendance.routes";
import { AnalyticsRoutes } from "./api/analytics/analytics.routes";
import { Bindings, Variables } from "./core/configs/workers";
import { DrizzleDB } from "./core/database/drizzle";

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});
app.doc("/openapi", {
  info: { title: "Attendance Management API", version: "1.0" },
  openapi: "3.1.0",
});

app.get("/", (c) => c.text("Attendance Management API"));
app.get("/swagger", swaggerUI({ url: "/openapi" }));

app.use(async (ctx, next) => {
  ctx.set("db", DrizzleDB.getInstance(ctx.env.DB));
  await next();
});

app.route("/api/users", UsersRoutes);
app.route("/api/schools", SchoolsRoutes);
app.route("/api/teachers", TeachersRoutes);
app.route("/api/classes", ClassesRoutes);
app.route("/api/students", StudentsRoutes);
app.route("/api/attendance", AttendanceRoutes);
app.route("/api/analytics", AnalyticsRoutes);

export default app;
