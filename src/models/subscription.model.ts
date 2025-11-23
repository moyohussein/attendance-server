import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuid } from "uuid";

export enum SubscriptionPlan {
  Free = "free",
  Premium = "premium",
}

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$default(() => uuid()),
  schoolId: text("school_id").notNull(),
  plan: text("plan", { enum: ["free", "premium"] })
    .notNull()
    .$default(() => SubscriptionPlan.Free),
  startDate: int("start_date", { mode: "timestamp" }).notNull(),
  endDate: int("end_date", { mode: "timestamp" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status", { enum: ["active", "cancelled", "expired"] })
    .notNull()
    .$default(() => "active"),
  createdAt: int("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});