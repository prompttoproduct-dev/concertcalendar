import { render, screen, fireEvent } from '@testing-library/react';
import { ConcertCard } from '@/components/ConcertCard';

describe('ConcertCard', () => {
  const mockProps = {
    artist: 'The Strokes',
    venue: 'The Bowery Ballroom',
    date: 'Dec 15, 2024',
    location: 'Manhattan, NY',
    price: '$45',
    image: 'https://example.com/image.jpg',
    genres: ['indie rock', 'alternative'],
    ticketUrl: 'https://tickets.com/strokes',
    description: 'An amazing indie rock concert'
  };

  it('renders concert information correctly', () => {
    render(<ConcertCard {...mockProps} />);
    
    expect(screen.getByText('The Strokes')).toBeInTheDocument();
    expect(screen.getByText('The Bowery Ballroom')).toBeInTheDocument();
    expect(screen.getByText('Dec 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Manhattan, NY')).toBeInTheDocument();
    expect(screen.getByText('$45')).toBeInTheDocument();
  });

  it('displays genres correctly', () => {
    render(<ConcertCard {...mockProps} />);
    
    expect(screen.getByText('indie rock')).toBeInTheDocument();
    expect(screen.getByText('alternative')).toBeInTheDocument();
  });

  it('shows free badge for free concerts', () => {
    const freeProps = { ...mockProps, price: 'FREE' };
    render(<ConcertCard {...freeProps} />);
    
    const freeBadges = screen.getAllByText('FREE');
    expect(freeBadges.length).toBeGreaterThan(0);
  });

  it('opens ticket URL when get tickets button is clicked', () => {
    const mockOpen = jest.fn();
    global.open = mockOpen;
    
    render(<ConcertCard {...mockProps} />);
    
    const ticketButton = screen.getByText('Get Tickets');
    fireEvent.click(ticketButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://tickets.com/strokes',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('shows "Tickets TBA" when no ticket URL provided', () => {
    const propsWithoutTickets = { ...mockProps, ticketUrl: undefined };
    render(<ConcertCard {...propsWithoutTickets} />);
    
    expect(screen.getByText('Tickets TBA')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tickets TBA' })).toBeDisabled();
  });

  it('displays description when provided', () => {
    render(<ConcertCard {...mockProps} />);
    
    expect(screen.getByText('An amazing indie rock concert')).toBeInTheDocument();
  });

  it('limits genre display to 2 with overflow indicator', () => {
    const propsWithManyGenres = {
      ...mockProps,
      genres: ['indie rock', 'alternative', 'post-punk', 'garage rock']
    };
    
    render(<ConcertCard {...propsWithManyGenres} />);
    
    expect(screen.getByText('indie rock')).toBeInTheDocument();
    expect(screen.getByText('alternative')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('applies hover effects correctly', () => {
    render(<ConcertCard {...mockProps} />);
    
    const card = screen.getByText('The Strokes').closest('.group');
    expect(card).toHaveClass('group');
    expect(card).toHaveClass('hover:scale-[1.02]');
  });
});