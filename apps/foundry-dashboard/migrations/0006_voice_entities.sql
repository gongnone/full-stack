-- Story 2.2: Voice Entity Persistence
-- Adds columns to store voice-extracted entities (banned words, voice markers, stances)

-- Add voice_entities JSON column for extracted entities from voice notes
ALTER TABLE brand_dna ADD COLUMN voice_entities TEXT DEFAULT '{"bannedWords":[],"voiceMarkers":[],"stances":[]}';

-- Add last_voice_recording timestamp for rate limiting
ALTER TABLE brand_dna ADD COLUMN last_voice_recording_at INTEGER DEFAULT 0;
