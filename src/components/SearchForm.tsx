import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchAutocomplete, type SearchSuggestion } from "@/components/ui/search-autocomplete";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { SortDropdown, type SortOption } from "@/components/ui/sort-dropdown";
import { RecentSearches } from "@/components/ui/recent-searches";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriceFilter, type PriceRange } from "@/components/ui/price-filter";
import { Search, Filter, X, Calendar, ArrowUpDown } from "lucide-react";
import { type SearchFilters, type Borough } from "@/hooks/useConcerts";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  className?: string;
  showRecentSearches?: boolean;
  showSorting?: boolean;
}

const genres = [
  // Rock
  'Classic Rock', 'Hard Rock', 'Progressive Rock', 'Post-Rock', 'Math Rock', 'Rock Fusion',
  // Pop
  'Indie Pop', 'Synth-Pop', 'Bedroom Pop',
  // Hip Hop
  'East Coast Hip Hop', 'West Coast Hip Hop', 'Trap', 'Cloud Rap', 'Abstract Hip Hop',
  // Electronic
  'Ambient', 'Drone', 'Noise', 'Vaporwave', 'Lo-fi Hip Hop', 'Early Synth Styles', 'Contemporary Digital Production',
  // Jazz
  'Bebop', 'Cool Jazz', 'Free Jazz', 'Nu-Jazz', 'Jazz Fusion',
  // Classical
  'Baroque', 'Romantic', 'Contemporary Classical', 'Neo-Classical', 'Minimalism'
];

const boroughs: { value: Borough; label: string }[] = [
  { value: 'manhattan', label: 'Manhattan' },
  { value: 'brooklyn', label: 'Brooklyn' },
  { value: 'queens', label: 'Queens' },
  { value: 'bronx', label: 'Bronx' },
  { value: 'staten_island', label: 'Staten Island' },
];

const priceRangeLabels: Record<PriceRange, string> = {
  'free': 'Free',
  '0-35': '$0–35',
  '35-50': '$35–50',
  '50-100': '$50–100',
  '100+': '$100+',
};

export const SearchForm = ({ 
  onSearch, 
  initialFilters = {}, 
  className,
  showRecentSearches = true,
  showSorting = true
}: SearchFormProps) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  
  // Search suggestions
  const { suggestions, isLoading: suggestionsLoading } = useSearchSuggestions(searchQuery);
  
  // Recent searches
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalFilters = { ...filters, query: searchQuery };
    onSearch(finalFilters);
    addRecentSearch(finalFilters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-search on filter change (but not for query changes)
    if (key !== 'query') {
      const finalFilters = { ...newFilters, query: searchQuery };
      onSearch(finalFilters);
      addRecentSearch(finalFilters);
    }
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    handleFilterChange('query', value);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.label);
    const newFilters = { ...filters, query: suggestion.label };
    setFilters(newFilters);
    onSearch(newFilters);
    addRecentSearch(newFilters);
  };

  const handleRecentSearchSelect = (search: any) => {
    setFilters(search.filters);
    setSearchQuery(search.filters.query || '');
    onSearch(search.filters);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      handleFilterChange('dateRange', {
        start: format(range.from, 'yyyy-MM-dd'),
        end: format(range.to, 'yyyy-MM-dd')
      });
    } else {
      handleFilterChange('dateRange', undefined);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    onSearch({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof SearchFilters] !== undefined && 
    filters[key as keyof SearchFilters] !== ''
  ) || searchQuery.length > 0;

  return (
    <div className={className}>
      {/* Recent Searches */}
      {showRecentSearches && recentSearches.length > 0 && !showAdvanced && (
        <div className="mb-6">
          <RecentSearches
            searches={recentSearches}
            onSelect={handleRecentSearchSelect}
            onRemove={removeRecentSearch}
            onClear={clearRecentSearches}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main search bar */}
        <div className="relative">
          <SearchAutocomplete
            placeholder="Search artists, venues, or genres..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            onSelect={handleSuggestionSelect}
            suggestions={suggestions}
            loading={suggestionsLoading}
            className="pr-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 p-6 bg-card rounded-lg border">
            <div>
              <label className="text-sm font-medium mb-3 block">Genre</label>
              <Select
                value={filters.genre || ''}
                onValueChange={(value) => handleFilterChange('genre', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Borough</label>
              <Select
                value={filters.borough || ''}
                onValueChange={(value) => handleFilterChange('borough', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All boroughs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All boroughs</SelectItem>
                  {boroughs.map((borough) => (
                    <SelectItem key={borough.value} value={borough.value}>
                      {borough.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Date Range</label>
              <DateRangePicker
                value={filters.dateRange ? {
                  from: new Date(filters.dateRange.start),
                  to: new Date(filters.dateRange.end)
                } : undefined}
                onChange={handleDateRangeChange}
                placeholder="Any date"
              />
            </div>

            <div>
              <PriceFilter
                value={filters.priceRange}
                onChange={(value) => handleFilterChange('priceRange', value)}
              />
            </div>
          </div>
        )}

        {/* Sorting */}
        {showSorting && hasActiveFilters && (
          <div className="flex items-center justify-between">
            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
              className="w-auto"
            />
          </div>
        )}

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <div className="flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs">
                <span>"{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    handleFilterChange('query', undefined);
                  }}
                  className="hover:bg-accent-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.genre && (
              <div className="flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs">
                <span>{filters.genre}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('genre', undefined)}
                  className="hover:bg-accent-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.borough && (
              <div className="flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs">
                <span>{boroughs.find(b => b.value === filters.borough)?.label}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('borough', undefined)}
                  className="hover:bg-accent-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.dateRange && (
              <div className="flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs">
                <span>
                  {format(new Date(filters.dateRange.start), 'MMM d')} - {format(new Date(filters.dateRange.end), 'MMM d')}
                </span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('dateRange', undefined)}
                  className="hover:bg-accent-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.priceRange && (
              <div className="flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs">
                <span>{priceRangeLabels[filters.priceRange]}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('priceRange', undefined)}
                  className="hover:bg-accent-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};