import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuid } from "uuid";

export const students = sqliteTable("students", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$default(() => uuid()),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  classId: text("class_id").notNull(),
  schoolId: text("school_id").notNull(),
  parentEmail: text("parent_email"),
  parentPhone: text("parent_phone"),
  createdAt: int("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});