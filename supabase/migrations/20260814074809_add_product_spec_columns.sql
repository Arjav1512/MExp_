-- Add Amazon-source product specification fields to the catalog.
-- All columns are additive with safe defaults; no existing data is modified or lost.
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS flavour text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_size text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp_cents integer NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS packer text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS packer_contact text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS package_weight_grams integer NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shelf_life text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS storage text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS generic_name text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS dietary text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS nutrition_basis text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS claims jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS how_to_use jsonb NOT NULL DEFAULT '[]'::jsonb;
