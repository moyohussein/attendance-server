import { OpenAPIHono } from "@hono/zod-openapi";
import { Bindings, Variables } from "../../core/configs/workers";
import { auth } from "../../core/middlewares/auth.middleware";
import { ProfileOpenAPI, SigninOpenAPI, SignupOpenAPI, RegisterSchoolOwnerOpenAPI } from "./openapi";
import { UsersService } from "./users.service";
import { UserRole } from "../../models";

const routes = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

//#region Sign up
routes.openapi(SignupOpenAPI, async (ctx) => {
  const { email, password, firstName, lastName } = ctx.req.valid("json");

  if (!ctx.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const usersService = UsersService.getInstance(ctx.var.db, ctx.env.JWT_SECRET);
  const userExists = await usersService.emailExists(email);

  if (userExists) {
    return ctx.json({ message: "Email already in use" }, 400);
  }

  // Default to Teacher role for regular signups
  const id = await usersService.signUp({
    email,
    password,
    firstName,
    lastName,
    role: UserRole.Teacher
  });
  return ctx.json({ id }, 200);
});
//#endregion

//#region Register School Owner
routes.openapi(RegisterSchoolOwnerOpenAPI, async (ctx) => {
  try {
    const { email, password, firstName, lastName, schoolName } = ctx.req.valid("json");

    if (!ctx.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const usersService = UsersService.getInstance(ctx.var.db, ctx.env.JWT_SECRET);

    const userExists = await usersService.emailExists(email);

    if (userExists) {
      return ctx.json({ message: "Email already in use" }, 400);
    }

    const id = await usersService.registerSchoolOwner({
      email,
      password,
      firstName,
      lastName,
      schoolName,
    });
    return ctx.json({ id }, 201);
  } catch (e: any) {
    console.error("Error in register-school-owner:", e);
    return ctx.json({ message: e.message || "Internal Server Error" }, 500);
  }
});
//#endregion

//#region Sign in
routes.openapi(SigninOpenAPI, async (ctx) => {
  const { email, password } = ctx.req.valid("json");

  try {
    if (!ctx.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const usersService = UsersService.getInstance(ctx.var.db, ctx.env.JWT_SECRET);
    const { token } = await usersService.signIn({
      email,
      password,
    });

    return ctx.json({ token }, 200);
  } catch (err: any) {
    return ctx.json({ message: err.message }, 400);
  }
});
//#endregion

//#region Profile
routes.use("/profile", auth);
routes.openapi(ProfileOpenAPI, async (ctx) => {
  const userId = ctx.var.jwtPayload.id!;

  if (!ctx.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const usersService = UsersService.getInstance(ctx.var.db, ctx.env.JWT_SECRET);
  const user = await usersService.profile(userId);

  return ctx.json(
    {
      user: {
        ...user,
        createdAt: !!user.createdAt ? user.createdAt : undefined,
      },
    },
    200
  );
});
//#endregion

export { routes as UsersRoutes };
