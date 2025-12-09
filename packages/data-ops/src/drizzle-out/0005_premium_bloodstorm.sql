ALTER TABLE `generations` ADD `usage_prompt_tokens` integer;--> statement-breakpoint
ALTER TABLE `generations` ADD `usage_completion_tokens` integer;--> statement-breakpoint
ALTER TABLE `generations` ADD `cost_estimated_usd` real;--> statement-breakpoint
ALTER TABLE `generations` ADD `provider_metadata` text;