import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import SearchResults from '@/pages/SearchResults';
import { concertQueries } from '@/lib/supabase';

// Mock the supabase queries
jest.mock('@/lib/supabase', () => ({
  concertQueries: {
    search: jest.fn(),
  }
}));

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockConcertQueries = concertQueries as jest.Mocked<typeof concertQueries>;

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Search Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes full search flow from input to results', async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        id: '1',
        artist: 'The Strokes',
        venue: {
          id: '1',
          name: 'The Bowery Ballroom',
          borough: 'manhattan',
          address: '6 Delancey St',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        date: '2024-12-15',
        price: '45',
        genres: ['indie rock'],
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ];

    mockConcertQueries.search.mockResolvedValue(mockResults as any);

    render(
      <TestWrapper>
        <SearchResults />
      </TestWrapper>
    );

    // Initial state - no search performed
    expect(screen.getByText('Enter search terms or select filters to find concerts.')).toBeInTheDocument();

    // Perform search
    const searchInput = screen.getByPlaceholderText('Search artists, venues, or genres...');
    await user.type(searchInput, 'indie rock');

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
    });

    expect(screen.getByText('Found 1 concert')).toBeInTheDocument();
    expect(mockConcertQueries.search).toHaveBeenCalledWith({ query: 'indie rock' });
  });

  it('handles search with multiple filters', async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        id: '1',
        artist: 'Brooklyn Band',
        venue: {
          id: '1',
          name: 'Brooklyn Steel',
          borough: 'brooklyn',
          address: '319 Frost St',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        date: '2024-12-15',
        price: 'free',
        genres: ['indie rock'],
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ];

    mockConcertQueries.search.mockResolvedValue(mockResults as any);

    render(
      <TestWrapper>
        <SearchResults />
      </TestWrapper>
    );

    // Open advanced filters
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);

    // Set multiple filters
    const genreSelect = screen.getByRole('combobox', { name: /genre/i });
    await user.click(genreSelect);
    await user.click(screen.getByText('indie rock'));

    const boroughSelect = screen.getByRole('combobox', { name: /borough/i });
    await user.click(boroughSelect);
    await user.click(screen.getByText('Brooklyn'));

    const priceSelect = screen.getByRole('combobox', { name: /price range/i });
    await user.click(priceSelect);
    await user.click(screen.getByText('Free'));

    // Verify search was called with all filters
    await waitFor(() => {
      expect(mockConcertQueries.search).toHaveBeenCalledWith({
        genre: 'indie rock',
        borough: 'brooklyn',
        priceRange: 'free'
      });
    });

    // Verify active filters are displayed
    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText('indie rock')).toBeInTheDocument();
    expect(screen.getByText('Brooklyn')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('handles empty search results', async () => {
    const user = userEvent.setup();
    mockConcertQueries.search.mockResolvedValue([]);

    render(
      <TestWrapper>
        <SearchResults />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search artists, venues, or genres...');
    await user.type(searchInput, 'nonexistent band');

    await waitFor(() => {
      expect(screen.getByText('Found 0 concerts')).toBeInTheDocument();
    });

    expect(screen.getByText('No concerts match your search criteria. Try adjusting your filters.')).toBeInTheDocument();
  });

  it('handles search errors gracefully', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Search failed');
    mockConcertQueries.search.mockRejectedValue(mockError);

    render(
      <TestWrapper>
        <SearchResults />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search artists, venues, or genres...');
    await user.type(searchInput, 'test');

    await waitFor(() => {
      expect(screen.getByText('Error loading concerts')).toBeInTheDocument();
    });

    expect(screen.getByText('Search failed')).toBeInTheDocument();
  });

  it('allows clearing individual filters', async () => {
    const user = userEvent.setup();
    mockConcertQueries.search.mockResolvedValue([]);

    render(
      <TestWrapper>
        <SearchResults />
      </TestWrapper>
    );

    // Add a search query
    const searchInput = screen.getByPlaceholderText('Search artists, venues, or genres...');
    await user.type(searchInput, 'test query');

    // Open filters and add genre
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);

    const genreSelect = screen.getByRole('combobox', { name: /genre/i });
    await user.click(genreSelect);
    await user.click(screen.getByText('indie rock'));

    // Verify both filters are active
    await waitFor(() => {
      expect(screen.getByText('"test query"')).toBeInTheDocument();
      expect(screen.getByText('indie rock')).toBeInTheDocument();
    });

    // Remove the query filter
    const queryFilter = screen.getByText('"test query"').closest('div');
    const removeButton = queryFilter?.querySelector('button');
    if (removeButton) {
      await user.click(removeButton);
    }

    // Verify only genre filter remains
    await waitFor(() => {
      expect(mockConcertQueries.search).toHaveBeenLastCalledWith({
        genre: 'indie rock'
      });
    });
  });
});