import { DrizzleD1Database } from "drizzle-orm/d1";
import { Auth } from "better-auth";
import { UserRole } from "../../models";

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI?: string;
  FRONTEND_URL?: string;
  BASE_URL: string;
};

export type Variables = {
  db: DrizzleD1Database<Record<string, never>>;
  jwtPayload?: { id: string; role?: UserRole; schoolId?: string };
  auth?: Auth;
};
