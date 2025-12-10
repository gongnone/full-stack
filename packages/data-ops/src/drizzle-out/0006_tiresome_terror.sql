CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`research_data` text,
	`offer_data` text,
	`brand_voice` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `generations` ADD `campaign_id` text REFERENCES campaigns(id);