/*
  # Add Ticketmaster integration fields to concerts table

  1. New Columns
    - `external_id` (text, unique identifier from Ticketmaster API)
    - `title` (text, event title from API)
    - `image_url` (text, event image URL)
    - `source` (enum, data source - manual, ticketmaster)

  2. Schema Updates
    - Change `price` from text to numeric for proper sorting
    - Add unique constraint on (external_id, source) to prevent duplicates
    - Update existing data to use numeric prices

  3. Security
    - Maintain existing RLS policies
    - Add indexes for performance
*/

-- Create source_type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_type') THEN
    CREATE TYPE source_type AS ENUM ('manual', 'ticketmaster');
  END IF;
END $$;

-- Add new columns to concerts table
DO $$
BEGIN
  -- Add external_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'concerts' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE concerts ADD COLUMN external_id text;
  END IF;

  -- Add title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'concerts' AND column_name = 'title'
  ) THEN
    ALTER TABLE concerts ADD COLUMN title text;
  END IF;

  -- Add image_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'concerts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE concerts ADD COLUMN image_url text;
  END IF;

  -- Add source column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'concerts' AND column_name = 'source'
  ) THEN
    ALTER TABLE concerts ADD COLUMN source source_type DEFAULT 'manual';
  END IF;
END $$;

-- Update price column to numeric (handle existing text values)
DO $$
BEGIN
  -- First, update 'free' values to 0
  UPDATE concerts SET price = 0 WHERE price = 'free' OR price = 'TBA';
  
  -- Remove any non-numeric characters except decimal points
  UPDATE concerts SET price = regexp_replace(price::text, '[^0-9.]', '', 'g') WHERE price::text ~ '[^0-9.]';
  
  -- Set empty or invalid prices to 0
  UPDATE concerts SET price = 0 WHERE price IS NULL OR price::text = '';
  
  -- Change column type to numeric if it's not already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'concerts' AND column_name = 'price' AND data_type != 'numeric'
  ) THEN
    ALTER TABLE concerts ALTER COLUMN price TYPE numeric USING price::numeric;
  END IF;
  
  -- Set default value
  ALTER TABLE concerts ALTER COLUMN price SET DEFAULT 0;
END $$;

-- Add unique constraint to prevent duplicates from external APIs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'concerts_external_id_source_unique'
  ) THEN
    ALTER TABLE concerts 
    ADD CONSTRAINT concerts_external_id_source_unique 
    UNIQUE (external_id, source);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS concerts_external_id_idx ON concerts(external_id);
CREATE INDEX IF NOT EXISTS concerts_source_idx ON concerts(source);
CREATE INDEX IF NOT EXISTS concerts_title_idx ON concerts(title);
CREATE INDEX IF NOT EXISTS concerts_price_idx ON concerts(price);

-- Update existing manual entries to have titles
UPDATE concerts 
SET title = artist || ' at ' || venue 
WHERE title IS NULL AND (source = 'manual' OR source IS NULL);

-- Set source for existing records
UPDATE concerts 
SET source = 'manual' 
WHERE source IS NULL;