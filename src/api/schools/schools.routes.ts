import { OpenAPIHono } from "@hono/zod-openapi";
import { Bindings, Variables } from "../../core/configs/workers";
import { auth } from "../../core/middlewares/auth.middleware";
import { SchoolsService } from "./schools.service";
import { CreateSchoolOpenAPI, GetSchoolOpenAPI, UpdateSchoolOpenAPI } from "./openapi/school.openapi";
import { UserRole } from "../../models";

const routes = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Create school route - only for school owners
routes.openapi(CreateSchoolOpenAPI, async (ctx) => {
  const { name, address } = ctx.req.valid("json");
  const userId = ctx.var.jwtPayload?.id;

  // Check if user is authorized to create a school
  if (!userId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  // Only school owners or super admins can create schools
  const userRole = ctx.var.jwtPayload?.role; // Assuming role is in jwt payload
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.SuperAdmin) {
    return ctx.json({ message: "Only school owners or super admins can create schools" }, 403);
  }

  try {
    const schoolsService = SchoolsService.getInstance(ctx.var.db);
    const school = await schoolsService.createSchool({ name, address }, userId);
    return ctx.json({ id: school.id }, 201);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get school by ID route
routes.openapi(GetSchoolOpenAPI, async (ctx) => {
  const { id } = ctx.req.valid("param");
  const userId = ctx.var.jwtPayload?.id;

  try {
    const schoolsService = SchoolsService.getInstance(ctx.var.db);
    const school = await schoolsService.getSchoolById(id);

    // Check if the user has access to this school
    if (school.ownerId !== userId) {
      const userRole = ctx.var.jwtPayload?.role;
      if (userRole !== UserRole.SuperAdmin) {
        return ctx.json({ message: "Access denied" }, 403);
      }
    }

    return ctx.json({ school }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 404);
  }
});

// Update school route
routes.openapi(UpdateSchoolOpenAPI, async (ctx) => {
  const { id } = ctx.req.valid("param");
  const { name, address } = ctx.req.valid("json");

  try {
    const userId = ctx.var.jwtPayload?.id;
    const userRole = ctx.var.jwtPayload?.role;

    const schoolsService = SchoolsService.getInstance(ctx.var.db);

    // Check if user has permission to update the school
    if (userRole !== UserRole.SuperAdmin) {
      const isOwner = await schoolsService.isUserSchoolOwner(userId!, id);
      if (!isOwner) {
        return ctx.json({ message: "Access denied" }, 403);
      }
    }

    const updatedSchool = await schoolsService.updateSchool(id, { name, address });
    return ctx.json({ school: updatedSchool }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

export { routes as SchoolsRoutes };