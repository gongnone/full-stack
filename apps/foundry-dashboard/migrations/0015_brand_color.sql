-- Migration: 0015_brand_color.sql
ALTER TABLE clients ADD COLUMN brand_color TEXT DEFAULT '#1D9BF0';
