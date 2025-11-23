import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuid } from "uuid";

export const classes = sqliteTable("classes", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$default(() => uuid()),
  name: text("name").notNull(),
  schoolId: text("school_id").notNull(),
  teacherId: text("teacher_id"), // Optional - assigned teacher
  createdAt: int("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});