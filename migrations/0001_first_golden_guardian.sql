ALTER TABLE `users` RENAME COLUMN "fist_name" TO "first_name";--> statement-breakpoint
CREATE TABLE `attendance_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`class_id` text NOT NULL,
	`school_id` text NOT NULL,
	`teacher_id` text NOT NULL,
	`date` integer NOT NULL,
	`status` text NOT NULL,
	`note` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`school_id` text NOT NULL,
	`teacher_id` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `invitation_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`email` text NOT NULL,
	`school_id` text NOT NULL,
	`inviter_id` text NOT NULL,
	`status` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_tokens_token_unique` ON `invitation_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `schools` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_id` text NOT NULL,
	`address` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`class_id` text NOT NULL,
	`school_id` text NOT NULL,
	`parent_email` text,
	`parent_phone` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`plan` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`status` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
ALTER TABLE `users` ADD `role` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `school_id` text;