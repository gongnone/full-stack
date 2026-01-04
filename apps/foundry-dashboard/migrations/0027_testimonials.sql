-- Migration 0027: Add sentiment and snooze_count columns to testimonials table
-- FR-1.5.16: Track user sentiment and snooze count for testimonial requests

-- Add sentiment column to track initial user feedback (excited/solid/needs_work)
ALTER TABLE testimonials ADD COLUMN sentiment TEXT CHECK (sentiment IN ('excited', 'solid', 'needs_work'));

-- Add snooze_count column to limit reminders (max 2 snoozes)
ALTER TABLE testimonials ADD COLUMN snooze_count INTEGER DEFAULT 0;
