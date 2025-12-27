CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
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
	`competitor_gaps_they_feel` text,
	`media_consumption` text,
	`buying_behavior` text,
	`summary_paragraph` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `extracted_pillars` (
	`id` text PRIMARY KEY NOT NULL,
	`hub_id` text,
	`client_id` text,
	`name` text NOT NULL,
	`psychological_angle` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`hub_id`) REFERENCES `hub_registry`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feedback_log` (
	`id` text PRIMARY KEY NOT NULL,
	`spoke_id` text NOT NULL,
	`client_id` text NOT NULL,
	`gate_type` text NOT NULL,
	`score` integer,
	`result` text,
	`violations_json` text,
	`suggestions` text,
	`healing_attempt` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`spoke_id`) REFERENCES `spokes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
	`primal_desires` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `hub_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
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
	`isWinner` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
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
CREATE TABLE `research_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`source_type` text NOT NULL,
	`source_url` text,
	`raw_content` text,
	`processed_content` text,
	`sophistication_class` text,
	`sophistication_score` real,
	`review_rating` real,
	`what_was_missing` text,
	`review_title` text,
	`status` text DEFAULT 'pending',
	`metadata` text,
	`is_excluded` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spoke_evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`spoke_id` text NOT NULL,
	`client_id` text NOT NULL,
	`g2_score` integer,
	`g2_breakdown` text,
	`g4_result` text,
	`g4_violations` text,
	`g4_similarity_score` real,
	`g5_result` text,
	`g5_violations` text,
	`overall_pass` integer DEFAULT 0,
	`evaluated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`spoke_id`) REFERENCES `spokes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spoke_evaluations_spoke_id_unique` ON `spoke_evaluations` (`spoke_id`);--> statement-breakpoint
CREATE TABLE `spokes` (
	`id` text PRIMARY KEY NOT NULL,
	`hub_id` text NOT NULL,
	`pillar_id` text NOT NULL,
	`client_id` text NOT NULL,
	`platform` text NOT NULL,
	`content` text NOT NULL,
	`psychological_angle` text NOT NULL,
	`status` text DEFAULT 'pending',
	`generation_attempt` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`hub_id`) REFERENCES `hub_registry`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pillar_id`) REFERENCES `extracted_pillars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`stripe_customer_id` text,
	`credits` integer DEFAULT 10 NOT NULL
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
