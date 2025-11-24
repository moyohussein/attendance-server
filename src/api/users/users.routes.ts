import { OpenAPIHono } from "@hono/zod-openapi";
import { Bindings, Variables } from "../../core/configs/workers";
import { auth } from "../../core/middlewares/auth.middleware";
import {
  ProfileOpenAPI,
  SigninOpenAPI,
  SignupOpenAPI,
  RegisterSchoolOwnerOpenAPI,
  GoogleOAuthRoute,
  GoogleOAuthCallbackRoute,
  GoogleLoginRoute
} from "./openapi";
import { UsersService } from "./users.service";
import { GoogleOAuthService } from "./google-oauth.service";
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

//#region Google OAuth
routes.get("/google", (ctx) => {
  try {
    const redirectUri = ctx.req.query("redirect_uri") || ctx.env.GOOGLE_REDIRECT_URI || `${new URL(ctx.req.url).origin}/api/users/google/callback`;
    const state = ctx.req.query("state"); // Optional state for CSRF protection

    if (!ctx.env.GOOGLE_CLIENT_ID || !ctx.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    }

    const googleOAuthService = GoogleOAuthService.getInstance(
      ctx.var.db,
      ctx.env.JWT_SECRET,
      ctx.env.GOOGLE_CLIENT_ID,
      ctx.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const authUrl = googleOAuthService.getAuthUrl(state);
    return ctx.redirect(authUrl);
  } catch (error: any) {
    console.error("Error in Google OAuth init:", error);
    return ctx.json({ message: error.message || "Internal Server Error" }, 500);
  }
});

routes.get("/google/callback", async (ctx) => {
  try {
    const { code, state } = ctx.req.query();

    if (!code) {
      return ctx.json({ message: "Missing authorization code" }, 400);
    }

    if (!ctx.env.GOOGLE_CLIENT_ID || !ctx.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    }

    const redirectUri = ctx.env.GOOGLE_REDIRECT_URI || `${new URL(ctx.req.url).origin}/api/users/google/callback`;

    const googleOAuthService = GoogleOAuthService.getInstance(
      ctx.var.db,
      ctx.env.JWT_SECRET,
      ctx.env.GOOGLE_CLIENT_ID,
      ctx.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const result = await googleOAuthService.authenticate(code, state);

    // Redirect to frontend with token
    const frontendUrl = ctx.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = new URL(frontendUrl);
    redirectUrl.searchParams.set("token", result.token);
    redirectUrl.searchParams.set("user", JSON.stringify(result.user));

    return ctx.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error("Error in Google OAuth callback:", error);
    return ctx.json({ message: error.message || "Google authentication failed" }, 401);
  }
});

routes.openapi(GoogleLoginRoute, async (ctx) => {
  try {
    const { code, state } = ctx.req.valid("json");

    if (!code) {
      return ctx.json({ message: "Missing authorization code" }, 400);
    }

    if (!ctx.env.GOOGLE_CLIENT_ID || !ctx.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    }

    const redirectUri = ctx.env.GOOGLE_REDIRECT_URI || `${new URL(ctx.req.url).origin}/api/users/google/callback`;

    const googleOAuthService = GoogleOAuthService.getInstance(
      ctx.var.db,
      ctx.env.JWT_SECRET,
      ctx.env.GOOGLE_CLIENT_ID,
      ctx.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const result = await googleOAuthService.authenticate(code, state);

    return ctx.json(result, 200);
  } catch (error: any) {
    console.error("Error in Google OAuth login API:", error);
    return ctx.json({ message: error.message || "Google authentication failed" }, 401);
  }
});
//#endregion

export { routes as UsersRoutes };
