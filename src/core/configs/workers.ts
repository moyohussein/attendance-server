import { DrizzleD1Database } from "drizzle-orm/d1";
import { UserRole } from "../../models";

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

export type Variables = {
  db: DrizzleD1Database<Record<string, never>>;
  jwtPayload?: { id: string; role?: UserRole; schoolId?: string };
};
