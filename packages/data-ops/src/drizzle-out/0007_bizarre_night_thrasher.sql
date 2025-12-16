CREATE TABLE `competitor_offer_map` (
	`id` text PRIMARY KEY NOT NULL,
	`competitor_id` text,
	`hvco` text,
	`primary_cta` text,
	`guarantee` text,
	`scarcity` text,
	`value_build` text,
	`bonuses` text,
	`pricing` text,
	`payment_plan` text,
	`strengths` text,
	`weaknesses` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`competitor_id`) REFERENCES `competitors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `competitors` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`name` text NOT NULL,
	`website_url` text,
	`ad_library_url` text,
	`years_advertising` integer,
	`entry_product_url` text,
	`entry_product_price` real,
	`phone_number` text,
	`status` text DEFAULT 'identified',
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dream_buyer_avatar` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`demographics` text,
	`psychographics` text,
	`day_in_the_life` text,
	`media_consumption` text,
	`buying_behavior` text,
	`summary_paragraph` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `godfather_offer` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`rationale` text,
	`value_build` text,
	`pricing_tiers` text,
	`payment_options` text,
	`premiums` text,
	`power_guarantee` text,
	`guarantee_name` text,
	`scarcity` text,
	`offer_paragraph` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `golden_pheasant_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`competitor_id` text,
	`upload_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`extracted_content` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`competitor_id`) REFERENCES `competitors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `halo_analysis` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`hopes_and_dreams` text,
	`pains_and_fears` text,
	`barriers_and_uncertainties` text,
	`vernacular` text,
	`unexpected_insights` text,
	`visual_cues` text,
	`primal_desires` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `hvco_titles` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`title` text NOT NULL,
	`formula` text,
	`critic_score` real,
	`critic_feedback` text,
	`iteration` integer DEFAULT 1,
	`is_winner` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `research_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`source_type` text NOT NULL,
	`source_url` text,
	`raw_content` text,
	`processed_content` text,
	`sophistication_class` text,
	`sophistication_score` real,
	`status` text DEFAULT 'pending',
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vector_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`vector_id` text NOT NULL,
	`source_id` text,
	`content_type` text,
	`sophistication_class` text,
	`emotional_trigger` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `research_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workflow_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`workflow_type` text NOT NULL,
	`cloudflare_workflow_id` text,
	`status` text DEFAULT 'running',
	`current_step` text,
	`hitl_request` text,
	`error_message` text,
	`started_at` integer DEFAULT (unixepoch()),
	`completed_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `brand_pillars`;--> statement-breakpoint
DROP TABLE `content_ideas`;--> statement-breakpoint
DROP TABLE `market_research`;--> statement-breakpoint
DROP TABLE `offers`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
DROP TABLE `campaigns`;--> statement-breakpoint
DROP TABLE `generations`;--> statement-breakpoint
DROP TABLE `user_credits`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`name` text NOT NULL,
	`industry` text NOT NULL,
	`target_market` text,
	`value_proposition` text,
	`status` text DEFAULT 'research',
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "account_id", "name", "industry", "target_market", "value_proposition", "status", "created_at", "updated_at") SELECT "id", "account_id", "name", "industry", "target_market", "value_proposition", "status", "created_at", "updated_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;