import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuid } from "uuid";
import { users, UserRole } from "./user.model";
import { schools } from "./school.model";
import { classes } from "./class.model";
import { students } from "./student.model";
import { attendanceLogs } from "./attendance.model";
import { subscriptions, SubscriptionPlan } from "./subscription.model";
import { invitationTokens, InvitationStatus } from "./invitation.model";

// Export all models for use in the application
export {
  users,
  schools,
  classes,
  students,
  attendanceLogs,
  subscriptions,
  invitationTokens,
  UserRole,
  SubscriptionPlan,
  InvitationStatus,
};