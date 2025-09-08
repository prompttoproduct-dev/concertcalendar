import { render, screen } from '@testing-library/react';
import { ConcertList } from '@/components/ConcertList';
import { type Concert, type Venue } from '@/lib/supabase';

// Mock the ConcertCard component
jest.mock('@/components/ConcertCard', () => ({
  ConcertCard: ({ artist, venue }: { artist: string; venue: string }) => (
    <div data-testid="concert-card">
      {artist} at {venue}
    </div>
  )
}));

describe('ConcertList', () => {
  const mockVenue: Venue = {
    id: '1',
    name: 'The Bowery Ballroom',
    address: '6 Delancey St',
    borough: 'manhattan',
    capacity: 575,
    website: 'https://boweryballroom.com',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  const mockConcerts: (Concert & { venue: Venue })[] = [
    {
      id: '1',
      artist: 'The Strokes',
      venue_id: '1',
      venue: mockVenue,
      date: '2024-12-15',
      time: '20:00:00',
      price: '45',
      genres: ['indie rock'],
      description: 'Great show',
      ticket_url: 'https://tickets.com',
      image_url: 'https://image.com',
      source: 'manual',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '2',
      artist: 'Vampire Weekend',
      venue_id: '1',
      venue: mockVenue,
      date: '2024-12-20',
      time: '19:30:00',
      price: 'free',
      genres: ['indie pop'],
      description: 'Free show',
      ticket_url: 'https://tickets.com',
      image_url: 'https://image.com',
      source: 'manual',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ];

  it('renders concert cards when concerts are provided', () => {
    render(<ConcertList concerts={mockConcerts} />);
    
    expect(screen.getByText('The Strokes at The Bowery Ballroom')).toBeInTheDocument();
    expect(screen.getByText('Vampire Weekend at The Bowery Ballroom')).toBeInTheDocument();
  });

  it('shows loading skeletons when isLoading is true', () => {
    render(<ConcertList concerts={[]} isLoading={true} />);
    
    const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays error message when error is provided', () => {
    const error = new Error('Failed to load concerts');
    render(<ConcertList concerts={[]} error={error} />);
    
    expect(screen.getByText('Error loading concerts')).toBeInTheDocument();
    expect(screen.getByText('Failed to load concerts')).toBeInTheDocument();
  });

  it('shows empty state when no concerts are provided', () => {
    render(<ConcertList concerts={[]} />);
    
    expect(screen.getByText('No concerts found')).toBeInTheDocument();
    expect(screen.getByText('No concerts found')).toBeInTheDocument(); // Default empty message
  });

  it('shows custom empty message when provided', () => {
    const customMessage = 'No indie rock concerts found';
    render(<ConcertList concerts={[]} emptyMessage={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ConcertList concerts={mockConcerts} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders correct number of concert cards', () => {
    render(<ConcertList concerts={mockConcerts} />);
    
    const concertCards = screen.getAllByTestId('concert-card');
    expect(concertCards).toHaveLength(2);
  });

  it('renders loading skeletons with correct count', () => {
    render(<ConcertList concerts={[]} isLoading={true} />);
    
    // Should render 6 skeleton cards by default
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });
});