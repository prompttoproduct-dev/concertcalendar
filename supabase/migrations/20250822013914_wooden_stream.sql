/*
  # Seed sample data for development

  1. Sample Venues
    - Add popular NYC venues across all boroughs
    
  2. Sample Concerts
    - Add upcoming concerts with variety of genres and prices
    - Include both free and paid shows
*/

-- Insert sample venues
INSERT INTO venues (name, address, borough, capacity, website) VALUES
  ('Baby''s All Right', '146 Broadway, Brooklyn, NY 11211', 'brooklyn', 300, 'https://babysallright.com'),
  ('Music Hall of Williamsburg', '66 N 6th St, Brooklyn, NY 11249', 'brooklyn', 550, 'https://www.musichallofwilliamsburg.com'),
  ('Prospect Park Bandshell', '9th St &, Prospect Park W, Brooklyn, NY 11215', 'brooklyn', 5000, 'https://www.bricartsmedia.org'),
  ('The Bowery Ballroom', '6 Delancey St, New York, NY 10002', 'manhattan', 575, 'https://www.boweryballroom.com'),
  ('Webster Hall', '125 E 11th St, New York, NY 10003', 'manhattan', 1400, 'https://www.websterhall.com'),
  ('Brooklyn Steel', '319 Frost St, Brooklyn, NY 11222', 'brooklyn', 1800, 'https://www.brooklynsteel.com'),
  ('Elsewhere', '599 Johnson Ave, Brooklyn, NY 11237', 'brooklyn', 800, 'https://www.elsewherebrooklyn.com'),
  ('The Apollo Theater', '253 W 125th St, New York, NY 10027', 'manhattan', 1506, 'https://www.apollotheater.org'),
  ('Forest Hills Stadium', '1 Tennis Pl, Forest Hills, NY 11375', 'queens', 14000, 'https://www.foresthillsstadium.com'),
  ('Knockdown Center', '52-19 Flushing Ave, Maspeth, NY 11378', 'queens', 3000, 'https://knockdown.center');

-- Insert sample concerts
INSERT INTO concerts (artist, venue_id, date, time, price, genres, description, ticket_url, image_url, source) VALUES
  (
    'Pom Pom Squad',
    (SELECT id FROM venues WHERE name = 'Baby''s All Right'),
    '2024-12-15',
    '20:00',
    'free',
    ARRAY['indie rock', 'grunge'],
    'Brooklyn-based indie rock band with grunge influences',
    'https://babysallright.com/events',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    'manual'
  ),
  (
    'wednesday',
    (SELECT id FROM venues WHERE name = 'Music Hall of Williamsburg'),
    '2024-12-22',
    '19:30',
    '15',
    ARRAY['shoegaze', 'indie rock'],
    'Shoegaze revival band from North Carolina',
    'https://www.musichallofwilliamsburg.com',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
    'manual'
  ),
  (
    'Dijon',
    (SELECT id FROM venues WHERE name = 'Prospect Park Bandshell'),
    '2025-01-05',
    '18:00',
    'free',
    ARRAY['r&b', 'indie pop'],
    'Free outdoor concert at Prospect Park',
    'https://www.bricartsmedia.org',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
    'manual'
  ),
  (
    'Black Midi',
    (SELECT id FROM venues WHERE name = 'Brooklyn Steel'),
    '2024-12-28',
    '20:00',
    '35',
    ARRAY['experimental', 'math rock'],
    'Experimental rock band from London',
    'https://www.brooklynsteel.com',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
    'manual'
  ),
  (
    'Clairo',
    (SELECT id FROM venues WHERE name = 'The Bowery Ballroom'),
    '2025-01-12',
    '19:00',
    '45',
    ARRAY['indie pop', 'bedroom pop'],
    'Indie pop sensation with dreamy vocals',
    'https://www.boweryballroom.com',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    'manual'
  ),
  (
    'Free Jazz Collective',
    (SELECT id FROM venues WHERE name = 'The Apollo Theater'),
    '2024-12-20',
    '20:30',
    'free',
    ARRAY['jazz', 'experimental'],
    'Community jazz night featuring local musicians',
    'https://www.apollotheater.org',
    'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop',
    'manual'
  ),
  (
    'Turnstile',
    (SELECT id FROM venues WHERE name = 'Webster Hall'),
    '2025-01-18',
    '19:30',
    '40',
    ARRAY['hardcore', 'punk'],
    'Baltimore hardcore punk band',
    'https://www.websterhall.com',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
    'manual'
  ),
  (
    'Ambient Nights',
    (SELECT id FROM venues WHERE name = 'Elsewhere'),
    '2024-12-30',
    '21:00',
    'free',
    ARRAY['ambient', 'electronic'],
    'New Year''s Eve ambient music showcase',
    'https://www.elsewherebrooklyn.com',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
    'manual'
  );