import { OpenAPIHono } from "@hono/zod-openapi";
import { Bindings, Variables } from "../../core/configs/workers";
import { auth } from "../../core/middlewares/auth.middleware";
import { StudentsService } from "./students.service";
import { CreateStudentOpenAPI, GetStudentsOpenAPI, GetStudentByIdOpenAPI, UpdateStudentOpenAPI, DeleteStudentOpenAPI } from "./openapi/student.openapi";
import { UserRole } from "../../models";

const routes = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Create student route - only for school owners or teachers
routes.openapi(CreateStudentOpenAPI, async (ctx) => {
  const { firstName, lastName, classId, parentEmail, parentPhone } = ctx.req.valid("json");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Only school owners and teachers can create students
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.Teacher) {
    return ctx.json({ message: "Only school owners and teachers can create students" }, 403);
  }

  try {
    const studentsService = StudentsService.getInstance(ctx.var.db);
    const newStudent = await studentsService.createStudent(
      { firstName, lastName, classId, parentEmail, parentPhone },
      userSchoolId
    );
    return ctx.json({ id: newStudent.id }, 201);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get students route - for school owners or teachers
routes.openapi(GetStudentsOpenAPI, async (ctx) => {
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Check if user has permission to access students
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.Teacher) {
    return ctx.json({ message: "Access denied" }, 403);
  }

  // Get classId from query parameters if provided
  const classId = ctx.req.query("classId");

  try {
    const studentsService = StudentsService.getInstance(ctx.var.db);
    const students = await studentsService.getStudentsBySchool(userSchoolId, classId || undefined);
    return ctx.json({ students }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get student by ID route
routes.openapi(GetStudentByIdOpenAPI, async (ctx) => {
  const { id } = ctx.req.valid("param");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  try {
    const studentsService = StudentsService.getInstance(ctx.var.db);
    const student = await studentsService.getStudentById(id, userSchoolId);
    return ctx.json({ student }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 404);
  }
});

// Update student route - only for school owners or teachers of the same school
routes.openapi(UpdateStudentOpenAPI, async (ctx) => {
  const { id } = ctx.req.valid("param");
  const { firstName, lastName, classId, parentEmail, parentPhone } = ctx.req.valid("json");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Only school owners and teachers can update students
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.Teacher) {
    return ctx.json({ message: "Only school owners and teachers can update students" }, 403);
  }

  try {
    const studentsService = StudentsService.getInstance(ctx.var.db);
    const updatedStudent = await studentsService.updateStudent(
      id,
      { firstName, lastName, classId, parentEmail, parentPhone },
      userSchoolId
    );
    return ctx.json({ student: updatedStudent }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Delete student route - only for school owners
routes.openapi(DeleteStudentOpenAPI, async (ctx) => {
  const { id } = ctx.req.valid("param");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Only school owners can delete students
  if (userRole !== UserRole.SchoolOwner) {
    return ctx.json({ message: "Only school owners can delete students" }, 403);
  }

  try {
    const studentsService = StudentsService.getInstance(ctx.var.db);
    const result = await studentsService.deleteStudent(id, userSchoolId);
    return ctx.json(result, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 404);
  }
});

export { routes as StudentsRoutes };