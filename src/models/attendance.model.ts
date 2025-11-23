import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuid } from "uuid";

export const attendanceLogs = sqliteTable("attendance_logs", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$default(() => uuid()),
  studentId: text("student_id").notNull(),
  classId: text("class_id").notNull(),
  schoolId: text("school_id").notNull(),
  teacherId: text("teacher_id").notNull(),
  date: int("date", { mode: "timestamp" }).notNull(), // Date of attendance
  status: text("status", { enum: ["present", "absent", "late"] })
    .notNull()
    .$default(() => "present"),
  note: text("note"),
  createdAt: int("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});