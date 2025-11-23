import { OpenAPIHono } from "@hono/zod-openapi";
import { Bindings, Variables } from "../../core/configs/workers";
import { auth } from "../../core/middlewares/auth.middleware";
import { TeachersService } from "./teachers.service";
import { InviteTeacherOpenAPI, AcceptInvitationOpenAPI, GetTeachersOpenAPI } from "./openapi/teacher.openapi";
import { UserRole } from "../../models";

const routes = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Invite teacher route - only for school owners
routes.openapi(InviteTeacherOpenAPI, async (ctx) => {
  const { email, firstName, lastName } = ctx.req.valid("json");
  const userId = ctx.var.jwtPayload?.id;
  const userSchoolId = ctx.var.jwtPayload?.schoolId;

  // Check if user is authorized to invite teachers
  if (!userId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  const userRole = ctx.var.jwtPayload?.role;
  if (userRole !== UserRole.SchoolOwner && userRole !== UserRole.SuperAdmin) {
    return ctx.json({ message: "Only school owners or super admins can invite teachers" }, 403);
  }

  try {
    // If user is school owner, they can only invite to their school
    let schoolId = userSchoolId;
    if (userRole === UserRole.SuperAdmin) {
      // For super admins, we need to know which school to invite to
      // In a real app, this would come from the request body
      return ctx.json({ message: "Super admin must specify school ID" }, 400);
    }

    const teachersService = TeachersService.getInstance(ctx.var.db, ctx.env.JWT_SECRET);
    const result = await teachersService.inviteTeacher(
      { email, firstName, lastName },
      schoolId!,
      userId
    );
    return ctx.json(result, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Accept invitation route - no auth required as this is for new users
routes.openapi(AcceptInvitationOpenAPI, async (ctx) => {
  const { token, password } = ctx.req.valid("json");

  try {
    const teachersService = TeachersService.getInstance(ctx.var.db, ctx.env.JWT_SECRET);
    const result = await teachersService.acceptInvitation({ token, password });
    return ctx.json(result, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

// Get teachers route - only for school owners/admins of the same school
routes.openapi(GetTeachersOpenAPI, async (ctx) => {
  const userId = ctx.var.jwtPayload?.id;
  const userRole = ctx.var.jwtPayload?.role;
  let userSchoolId = ctx.var.jwtPayload?.schoolId;

  if (!userId) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  try {
    // Super admins might need to specify which school
    if (userRole === UserRole.SuperAdmin) {
      // In a real app, we would get schoolId from query params
      return ctx.json({ message: "Super admin must specify school" }, 400);
    }

    if (!userSchoolId) {
      return ctx.json({ message: "User does not belong to any school" }, 400);
    }

    const teachersService = TeachersService.getInstance(ctx.var.db, ctx.env.JWT_SECRET);
    const teachers = await teachersService.getTeachersBySchool(userSchoolId);
    return ctx.json({ teachers }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});

export { routes as TeachersRoutes };