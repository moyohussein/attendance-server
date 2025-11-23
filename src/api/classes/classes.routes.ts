import { OpenAPIHono } from "@hono/zod-openapi";
import { Bindings, Variables } from "../../core/configs/workers";
import { auth } from "../../core/middlewares/auth.middleware";
import { ClassesService } from "./classes.service";
import { CreateClassOpenAPI, GetClassesOpenAPI, GetClassByIdOpenAPI, UpdateClassOpenAPI, DeleteClassOpenAPI } from "./openapi/class.openapi";
import { UserRole } from "../../models";

const routes = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Create class route - only for school owners or teachers
routes.openapi(CreateClassOpenAPI, async (ctx) => {
  const { name, teacherId } = ctx.req.valid("json");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Only school owners and teachers can create classes
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.Teacher) {
    return ctx.json({ message: "Only school owners and teachers can create classes" }, 403);
  }

  try {
    const classesService = ClassesService.getInstance(ctx.var.db);
    const newClass = await classesService.createClass(
      { name, teacherId },
      userSchoolId
    );
    return ctx.json({ id: newClass.id }, 201);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get classes route - for school owners or assigned teachers
routes.openapi(GetClassesOpenAPI, async (ctx) => {
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  try {
    const classesService = ClassesService.getInstance(ctx.var.db);
    const classes = await classesService.getClassesBySchool(userSchoolId);
    return ctx.json({ classes }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get class by ID route
routes.openapi(GetClassByIdOpenAPI, async (ctx) => {
  const { id } = ctx.req.valid("param");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  try {
    const classesService = ClassesService.getInstance(ctx.var.db);
    const classRecord = await classesService.getClassById(id, userSchoolId);
    return ctx.json({ class: classRecord }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 404);
  }
});

// Update class route - only for school owners or teachers of the same school
routes.openapi(UpdateClassOpenAPI, async (ctx) => {
  const { id } = ctx.req.valid("param");
  const { name, teacherId } = ctx.req.valid("json");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Only school owners and teachers can update classes
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.Teacher) {
    return ctx.json({ message: "Only school owners and teachers can update classes" }, 403);
  }

  try {
    const classesService = ClassesService.getInstance(ctx.var.db);
    const updatedClass = await classesService.updateClass(
      id,
      { name, teacherId },
      userSchoolId
    );
    return ctx.json({ class: updatedClass }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Delete class route - only for school owners
routes.openapi(DeleteClassOpenAPI, async (ctx) => {
  const { id } = ctx.req.valid("param");
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId || !userSchoolId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Only school owners can delete classes
  if (userRole !== UserRole.SchoolOwner) {
    return ctx.json({ message: "Only school owners can delete classes" }, 403);
  }

  try {
    const classesService = ClassesService.getInstance(ctx.var.db);
    const result = await classesService.deleteClass(id, userSchoolId);
    return ctx.json(result, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 404);
  }
});

export { routes as ClassesRoutes };