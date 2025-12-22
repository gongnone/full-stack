-- Story 2.4: Brand DNA Report Dashboard
-- Adds topics_to_avoid column for storing detected topics/words to avoid
-- Displayed as red pills in the UI

ALTER TABLE brand_dna ADD COLUMN topics_to_avoid TEXT DEFAULT '[]';
