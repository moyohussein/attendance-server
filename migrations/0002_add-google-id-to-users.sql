PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text,
	`last_name` text,
	`email` text NOT NULL,
	`password` text,
	`role` text NOT NULL,
	`school_id` text,
	`google_id` text,
	`created_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "first_name", "last_name", "email", "password", "role", "school_id", "google_id", "created_at") SELECT "id", "first_name", "last_name", "email", "password", "role", "school_id", NULL, "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);