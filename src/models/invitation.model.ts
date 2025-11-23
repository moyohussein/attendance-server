import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuid } from "uuid";

export enum InvitationStatus {
  Pending = "pending",
  Accepted = "accepted",
  Expired = "expired",
}

export const invitationTokens = sqliteTable("invitation_tokens", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$default(() => uuid()),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  schoolId: text("school_id").notNull(),
  inviterId: text("inviter_id").notNull(), // Who sent the invitation
  status: text("status", { enum: ["pending", "accepted", "expired"] })
    .notNull()
    .$default(() => InvitationStatus.Pending),
  expiresAt: int("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: int("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});