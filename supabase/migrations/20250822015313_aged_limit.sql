/*
  # Sample Data for CitySounds NYC

  1. Sample Venues
    - Manhattan venues (9 venues)
    - Brooklyn venues (7 venues)
    - Covers major concert venues across NYC
  
  2. Sample Concerts
    - Mix of free and paid shows
    - Various genres and dates
    - Realistic pricing and descriptions
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

-- Insert sample concerts
INSERT INTO concerts (artist, venue_id, date, time, price, genres, description, ticket_url, image_url, source) VALUES
-- Free concerts
('Phoebe Bridgers', (SELECT id FROM venues WHERE name = 'SummerStage (Rumsey)'LIMIT 1), '2024-07-15', '19:00', 'free', ARRAY['indie rock', 'folk'], 'Free summer concert in Central Park', 'https://cityparksfoundation.org/summerstage/', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'manual'),
('Local Jazz Ensemble', (SELECT id FROM venues WHERE name = 'Prospect Park Bandshell'LIMIT 1), '2024-06-20', '18:30', 'free', ARRAY['jazz'], 'Free evening jazz performance in Prospect Park', 'https://bricartsmedia.org/celebrate-brooklyn', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&q=80', 'manual'),

-- Paid concerts
('Arctic Monkeys', (SELECT id FROM venues WHERE name = 'Barclays Center'LIMIT 1), '2024-08-22', '20:00', '85', ARRAY['indie rock', 'alternative'], 'Arctic Monkeys world tour stop in Brooklyn', 'https://www.ticketmaster.com', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop&q=80', 'ticketmaster'),
('Kamasi Washington', (SELECT id FROM venues WHERE name = 'Blue Note'LIMIT 1), '2024-07-08', '21:00', '45', ARRAY['jazz', 'experimental'], 'Intimate jazz performance at the legendary Blue Note', 'https://www.bluenotejazz.com/nyc/', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'manual'),
('The National', (SELECT id FROM venues WHERE name = 'Beacon Theatre'LIMIT 1), '2024-09-12', '20:00', '75', ARRAY['indie rock', 'alternative'], 'The National performs their latest album', 'https://www.msg.com/beacon-theatre/', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop&q=80', 'ticketmaster'),
('Vampire Weekend', (SELECT id FROM venues WHERE name = 'Brooklyn Steel'LIMIT 1), '2024-06-30', '19:30', '55', ARRAY['indie rock', 'pop'], 'Vampire Weekend summer show in Williamsburg', 'https://www.bowerypresents.com', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'eventbrite'),
('Thundercat', (SELECT id FROM venues WHERE name = 'Music Hall of Williamsburg'LIMIT 1), '2024-07-25', '20:30', '40', ARRAY['jazz', 'electronic', 'funk'], 'Thundercat brings his unique sound to Brooklyn', 'http://musichallofwilliamsburg.com', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&q=80', 'manual'),
('FKA twigs', (SELECT id FROM venues WHERE name = 'Terminal 5'), '2024-08-15', '21:00', '65', ARRAY['electronic', 'experimental', 'r&b'], 'FKA twigs immersive performance experience', 'https://www.terminal5nyc.com', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop&q=80', 'ticketmaster'),
('Yo La Tengo', (SELECT id FROM venues WHERE name = 'The Bowery Ballroom'LIMIT 1), '2024-07-18', '20:00', '35', ARRAY['indie rock', 'experimental'], 'Legendary indie band at iconic Lower East Side venue', 'https://www.boweryballroom.com', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80', 'manual'),
('Brad Mehldau Trio', (SELECT id FROM venues WHERE name = 'Village Vanguard'LIMIT 1), '2024-06-28', '20:00', '50', ARRAY['jazz'], 'Intimate jazz performance at the legendary Village Vanguard', 'https://villagevanguard.com', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&q=80', 'manual');