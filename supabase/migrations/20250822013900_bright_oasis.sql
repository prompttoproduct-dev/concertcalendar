/*
  # Create venues and concerts tables

  1. New Tables
    - `venues`
      - `id` (uuid, primary key)
      - `name` (text, venue name)
      - `address` (text, venue address)
      - `borough` (enum, NYC borough)
      - `capacity` (integer, optional)
      - `website` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `concerts`
      - `id` (uuid, primary key)
      - `artist` (text, artist/band name)
      - `venue_id` (uuid, foreign key to venues)
      - `date` (date, concert date)
      - `time` (time, optional concert time)
      - `price` (text, price or 'free')
      - `genres` (text array, music genres)
      - `description` (text, optional)
      - `ticket_url` (text, optional)
      - `image_url` (text, optional)
      - `source` (enum, data source)
      - `external_id` (text, optional external API ID)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated insert/update (for admin features)
*/

-- Create borough enum
CREATE TYPE borough_type AS ENUM (
  'manhattan',
  'brooklyn',
  'queens',
  'bronx',
  'staten_island'
);

-- Create source enum
CREATE TYPE source_type AS ENUM (
  'manual',
  'ticketmaster',
  'eventbrite'
);

-- Create venues table
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  borough borough_type NOT NULL,
  capacity integer,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create concerts table
CREATE TABLE IF NOT EXISTS concerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist text NOT NULL,
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time,
  price text NOT NULL DEFAULT 'TBA',
  genres text[] DEFAULT '{}',
  description text,
  ticket_url text,
  image_url text,
  source source_type DEFAULT 'manual',
  external_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;

-- Create policies for venues
CREATE POLICY "Venues are viewable by everyone"
  ON venues
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Venues can be inserted by authenticated users"
  ON venues
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Venues can be updated by authenticated users"
  ON venues
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for concerts
CREATE POLICY "Concerts are viewable by everyone"
  ON concerts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Concerts can be inserted by authenticated users"
  ON concerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Concerts can be updated by authenticated users"
  ON concerts
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS concerts_date_idx ON concerts(date);
CREATE INDEX IF NOT EXISTS concerts_venue_id_idx ON concerts(venue_id);
CREATE INDEX IF NOT EXISTS concerts_genres_idx ON concerts USING GIN(genres);
CREATE INDEX IF NOT EXISTS concerts_source_idx ON concerts(source);
CREATE INDEX IF NOT EXISTS venues_borough_idx ON venues(borough);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concerts_updated_at
  BEFORE UPDATE ON concerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();