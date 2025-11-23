import { Context, Next } from "hono";
import { decode, verify } from "hono/jwt";
import { Bindings, Variables } from "../configs/workers";
import { users } from "../../models";
import { eq } from "drizzle-orm";

export const auth = async (
  ctx: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) => {
  const authorization = ctx.req.header("Authorization");
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  const isValid = await verify(token, ctx.env.JWT_SECRET);

  if (!isValid) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  const { payload } = decode(token);

  // Fetch user to get role information
  const db = ctx.get("db");
  const user = await db.select({ role: users.role, schoolId: users.schoolId }).from(users).where(eq(users.id, payload.id as string)).get();

  if (!user) {
    return ctx.json({ message: "Unauthorized" }, 401);
  }

  ctx.set("jwtPayload", { ...payload, role: user.role, schoolId: user.schoolId });
  await next();
};
