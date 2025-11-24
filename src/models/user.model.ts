import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuid } from "uuid";

export enum UserRole {
  SuperAdmin = "super_admin",
  SchoolOwner = "school_owner",
  Teacher = "teacher",
}

export const users = sqliteTable("users", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$default(() => uuid()),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  password: text("password"), // Can be null for Google OAuth users
  role: text("role", { enum: ["super_admin", "school_owner", "teacher"] })
    .notNull()
    .$default(() => UserRole.Teacher),
  schoolId: text("school_id"),
  googleId: text("google_id"), // For Google OAuth users
  createdAt: int("created_at", { mode: "timestamp" }).$default(
    () => new Date()
  ).$onUpdate(() => new Date()),
});