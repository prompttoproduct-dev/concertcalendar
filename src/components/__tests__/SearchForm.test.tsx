import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchForm } from '@/components/SearchForm';
import { type SearchFilters } from '@/hooks/useConcerts';

describe('SearchForm', () => {
  const mockOnSearch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and basic elements', () => {
    render(<SearchForm onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText('Search artists, venues, or genres...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
  });

  it('calls onSearch when typing in search input', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('Search artists, venues, or genres...');
    await user.type(searchInput, 'indie rock');
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({ query: 'indie rock' });
    });
  });

  it('shows advanced filters when filter button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);
    
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);
    
    expect(screen.getByText('Genre')).toBeInTheDocument();
    expect(screen.getByText('Borough')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
  });

  it('updates filters when selections are made', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);
    
    // Open advanced filters
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);
    
    // Select a genre
    const genreSelect = screen.getByRole('combobox', { name: /genre/i });
    await user.click(genreSelect);
    await user.click(screen.getByText('indie rock'));
    
    expect(mockOnSearch).toHaveBeenCalledWith({ genre: 'indie rock' });
  });

  it('displays active filters with remove buttons', async () => {
    const user = userEvent.setup();
    const initialFilters: SearchFilters = {
      query: 'test',
      genre: 'indie rock',
      borough: 'brooklyn'
    };
    
    render(<SearchForm onSearch={mockOnSearch} initialFilters={initialFilters} />);
    
    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText('"test"')).toBeInTheDocument();
    expect(screen.getByText('indie rock')).toBeInTheDocument();
    expect(screen.getByText('Brooklyn')).toBeInTheDocument();
  });

  it('removes individual filters when X button is clicked', async () => {
    const user = userEvent.setup();
    const initialFilters: SearchFilters = {
      query: 'test',
      genre: 'indie rock'
    };
    
    render(<SearchForm onSearch={mockOnSearch} initialFilters={initialFilters} />);
    
    // Find and click the X button for the query filter
    const queryFilter = screen.getByText('"test"').closest('div');
    const removeButton = queryFilter?.querySelector('button');
    
    if (removeButton) {
      await user.click(removeButton);
    }
    
    expect(mockOnSearch).toHaveBeenCalledWith({ genre: 'indie rock' });
  });

  it('clears all filters when "Clear all" is clicked', async () => {
    const user = userEvent.setup();
    const initialFilters: SearchFilters = {
      query: 'test',
      genre: 'indie rock',
      borough: 'brooklyn'
    };
    
    render(<SearchForm onSearch={mockOnSearch} initialFilters={initialFilters} />);
    
    const clearAllButton = screen.getByText('Clear all');
    await user.click(clearAllButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith({});
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('Search artists, venues, or genres...');
    await user.type(searchInput, 'jazz');
    
    // Submit the form
    fireEvent.submit(searchInput.closest('form')!);
    
    expect(mockOnSearch).toHaveBeenCalledWith({ query: 'jazz' });
  });
});