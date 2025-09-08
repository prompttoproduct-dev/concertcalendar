/*
  # Seed Sample Data for CitySounds NYC

  1. Sample Venues
    - Comprehensive list of NYC venues across Manhattan and Brooklyn
    - Real venues with accurate addresses, capacities, and websites
    
  2. Sample Concerts
    - Realistic concert data using the seeded venues
    - Mix of free and paid shows across different genres
    - Proper venue_id references using single-row subqueries

  3. Security
    - Uses existing RLS policies from create_venues_and_concerts.sql
*/

-- Insert sample venues
INSERT INTO venues (name, address, borough, capacity, website) VALUES
-- Manhattan Venues
('The Bowery Ballroom', '6 Delancey St, New York, NY 10002', 'manhattan', 575, 'https://www.boweryballroom.com'),
('Irving Plaza', '17 Irving Pl, New York, NY 10003', 'manhattan', 1100, 'https://www.irvingplaza.com'),
('Terminal 5', '610 W 56th St, New York, NY 10019', 'manhattan', 3000, 'https://www.terminal5nyc.com'),
('Webster Hall', '125 E 11th St, New York, NY 10003', 'manhattan', 1500, 'https://www.websterhall.com'),
('Beacon Theatre', '2124 Broadway, New York, NY 10023', 'manhattan', 2894, 'https://www.msg.com/beacon-theatre/'),
('Carnegie Hall', '57th St and 7th Ave, New York, NY 10019', 'manhattan', 2804, 'https://www.carnegiehall.org'),
('SummerStage (Rumsey)', 'Rumsey Playfield, Central Park, NY 10021', 'manhattan', 5500, 'https://cityparksfoundation.org/summerstage/'),
('Blue Note', '131 W 3rd St, New York, NY 10012', 'manhattan', 300, 'https://www.bluenotejazz.com/nyc/'),
('Village Vanguard', '178 7th Ave S, New York, NY 10014', 'manhattan', 130, 'https://villagevanguard.com'),

-- Brooklyn Venues
('Barclays Center', '620 Atlantic Ave, Brooklyn, NY 11217', 'brooklyn', 19000, 'https://www.barclayscenter.com'),
('Brooklyn Steel', '319 Frost St, Brooklyn, NY 11222', 'brooklyn', 1800, 'https://www.bowerypresents.com/new-york-metro/shows/brooklyn-steel'),
('Music Hall of Williamsburg', '66 N 6th St, Brooklyn, NY 11211', 'brooklyn', 650, 'http://musichallofwilliamsburg.com'),
('Kings Theatre', '1027 Flatbush Ave, Brooklyn, NY 11226', 'brooklyn', 3212, 'https://www.kingstheatre.com'),
('Coney Island Amphitheater', '3052 W 21st St, Brooklyn, NY 11224', 'brooklyn', 5000, 'https://www.coneyislandamp.com'),
('Brooklyn Paramount', '385 Flatbush Ave Ext, Brooklyn, NY 11201', 'brooklyn', 2900, 'https://www.brooklynparamount.com'),
('Prospect Park Bandshell', 'Prospect Park West & 9th St, Brooklyn, NY 11215', 'brooklyn', 7000, 'https://bricartsmedia.org/celebrate-brooklyn');

-- Insert sample concerts with proper venue_id references
INSERT INTO concerts (artist, venue_id, date, time, price, genres, description, ticket_url, image_url, source) VALUES
-- Free concerts
('Phoebe Bridgers', (SELECT id FROM venues WHERE name = 'SummerStage (Rumsey)' LIMIT 1), '2024-07-15', '19:00', 'free', ARRAY['indie rock', 'folk'], 'Free summer concert in Central Park', 'https://cityparksfoundation.org/summerstage/', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'manual'),

('Kamasi Washington', (SELECT id FROM venues WHERE name = 'Prospect Park Bandshell' LIMIT 1), '2024-07-20', '20:00', 'free', ARRAY['jazz', 'experimental'], 'Free jazz performance at Celebrate Brooklyn!', 'https://bricartsmedia.org/celebrate-brooklyn', 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&h=600&fit=crop&q=80', 'manual'),

('Local Natives', (SELECT id FROM venues WHERE name = 'SummerStage (Rumsey)' LIMIT 1), '2024-08-05', '19:30', 'free', ARRAY['indie rock', 'alternative'], 'Free indie rock show in Central Park', 'https://cityparksfoundation.org/summerstage/', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop&q=80', 'manual'),

-- Paid concerts
('Vampire Weekend', (SELECT id FROM venues WHERE name = 'Barclays Center' LIMIT 1), '2024-06-28', '20:00', '85', ARRAY['indie rock', 'pop'], 'Vampire Weekend returns to Brooklyn', 'https://www.ticketmaster.com', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'ticketmaster'),

('Thundercat', (SELECT id FROM venues WHERE name = 'Brooklyn Steel' LIMIT 1), '2024-07-10', '21:00', '45', ARRAY['jazz', 'electronic', 'funk'], 'Bass virtuoso live in Williamsburg', 'https://www.ticketmaster.com', 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&h=600&fit=crop&q=80', 'ticketmaster'),

('Japanese Breakfast', (SELECT id FROM venues WHERE name = 'The Bowery Ballroom' LIMIT 1), '2024-07-25', '20:30', '35', ARRAY['indie rock', 'dream pop'], 'Intimate show at iconic Lower East Side venue', 'https://www.boweryballroom.com', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'manual'),

('Brad Mehldau Trio', (SELECT id FROM venues WHERE name = 'Village Vanguard' LIMIT 1), '2024-08-12', '20:00', '55', ARRAY['jazz'], 'Jazz piano trio at legendary Greenwich Village club', 'https://villagevanguard.com', 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&h=600&fit=crop&q=80', 'manual'),

('Clairo', (SELECT id FROM venues WHERE name = 'Music Hall of Williamsburg' LIMIT 1), '2024-08-18', '19:30', '40', ARRAY['bedroom pop', 'indie pop'], 'Dreamy indie pop in intimate Brooklyn venue', 'http://musichallofwilliamsburg.com', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'manual'),

('Herbie Hancock', (SELECT id FROM venues WHERE name = 'Blue Note' LIMIT 1), '2024-09-05', '20:00', '75', ARRAY['jazz', 'fusion'], 'Jazz legend at iconic Greenwich Village club', 'https://www.bluenotejazz.com/nyc/', 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&h=600&fit=crop&q=80', 'manual'),

('The National', (SELECT id FROM venues WHERE name = 'Beacon Theatre' LIMIT 1), '2024-09-15', '20:00', '95', ARRAY['indie rock', 'alternative'], 'Brooklyn band returns to Manhattan stage', 'https://www.msg.com/beacon-theatre/', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'ticketmaster'),

('FKA twigs', (SELECT id FROM venues WHERE name = 'Terminal 5' LIMIT 1), '2024-09-22', '21:00', '65', ARRAY['electronic', 'r&b', 'experimental'], 'Avant-garde R&B performance', 'https://www.terminal5nyc.com', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'ticketmaster'),

('Yo-Yo Ma', (SELECT id FROM venues WHERE name = 'Carnegie Hall' LIMIT 1), '2024-10-08', '20:00', '125', ARRAY['classical'], 'World-renowned cellist at prestigious venue', 'https://www.carnegiehall.org', 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&h=600&fit=crop&q=80', 'manual'),

('King Gizzard & The Lizard Wizard', (SELECT id FROM venues WHERE name = 'Kings Theatre' LIMIT 1), '2024-10-20', '19:30', '50', ARRAY['psychedelic rock', 'garage rock'], 'Australian psych rock at restored Brooklyn theater', 'https://www.kingstheatre.com', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'ticketmaster'),

('Beach House', (SELECT id FROM venues WHERE name = 'Webster Hall' LIMIT 1), '2024-11-02', '20:00', '42', ARRAY['dream pop', 'shoegaze'], 'Ethereal dream pop duo live', 'https://www.websterhall.com', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'manual'),

('Tyler, The Creator', (SELECT id FROM venues WHERE name = 'Barclays Center' LIMIT 1), '2024-11-15', '20:00', '110', ARRAY['hip-hop', 'alternative hip-hop'], 'Grammy-winning rapper and producer', 'https://www.barclayscenter.com', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'ticketmaster');