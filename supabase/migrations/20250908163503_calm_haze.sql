/*
  # Create concerts table

  1. New Tables
    - `concerts`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `artist` (text, artist/band name)
      - `venue` (text, venue name)
      - `date` (date, concert date)
      - `time` (text, concert time)
      - `price` (numeric, ticket price)
      - `ticketUrl` (text, URL to purchase tickets)

  2. Security
    - Enable RLS on concerts table
    - Add policy for public read access
    - Add policy for authenticated insert/update
*/

-- Create concerts table
CREATE TABLE IF NOT EXISTS concerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist text NOT NULL,
  venue text NOT NULL,
  date date NOT NULL,
  time text,
  price numeric,
  ticketUrl text
);

-- Enable Row Level Security
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX IF NOT EXISTS concerts_artist_idx ON concerts(artist);
CREATE INDEX IF NOT EXISTS concerts_venue_idx ON concerts(venue);