import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Lucia Auth tables
export const authUser = sqliteTable("auth_user", {
  id: text("id").notNull().primaryKey(),
  email: text("email").notNull().unique(),
  googleId: text("google_id"), // For OAuth
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role", { enum: ["super_admin", "school_owner", "teacher"] })
    .notNull()
    .$default(() => "teacher"),
  schoolId: text("school_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => new Date()),
});

export const userKey = sqliteTable("user_key", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id").notNull(),
  hashedPassword: text("hashed_password"),
  providerId: text("provider_id").notNull(), // 'email' for password, 'google' for OAuth, etc.
  providerUserId: text("provider_user_id"), // The external provider's user ID
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => new Date()),
});

export const userSession = sqliteTable("user_session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  idleExpiresAt: integer("idle_expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => new Date()),
});