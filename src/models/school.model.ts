import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuid } from "uuid";

export const schools = sqliteTable("schools", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$default(() => uuid()),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(), // Reference to user who owns the school
  address: text("address"),
  createdAt: int("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});