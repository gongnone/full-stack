CREATE TABLE `generated_content` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`content` text NOT NULL,
	`cited_source_id` text,
	`status` text DEFAULT 'DRAFT',
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cited_source_id`) REFERENCES `research_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `research_sources` ADD `is_excluded` integer DEFAULT false;