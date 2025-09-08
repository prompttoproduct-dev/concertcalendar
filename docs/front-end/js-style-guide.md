# JavaScript/TypeScript Style Guide

## Code Formatting & Linting

### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## TypeScript Best Practices

### Type Definitions
```typescript
// Use interfaces for object shapes
interface Concert {
  id: string;
  artist: string;
  venue: Venue;
  date: Date;
  price: Price;
  genres: Genre[];
}

// Use type aliases for unions and primitives
type Status = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
type Price = number | 'free';

// Use enums for constants
enum Borough {
  MANHATTAN = 'manhattan',
  BROOKLYN = 'brooklyn',
  QUEENS = 'queens',
  BRONX = 'bronx',
  STATEN_ISLAND = 'staten_island',
}
```

### Generic Types
```typescript
// API response wrapper
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Paginated response
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Usage
type ConcertResponse = ApiResponse<Concert[]>;
type PaginatedConcerts = PaginatedResponse<Concert>;
```

### Utility Types
```typescript
// Pick specific properties
type ConcertSummary = Pick<Concert, 'id' | 'artist' | 'date' | 'venue'>;

// Make properties optional
type PartialConcert = Partial<Concert>;

// Create search filters from Concert properties
type SearchFilters = {
  [K in keyof Concert]?: Concert[K] extends string 
    ? string 
    : Concert[K] extends Date 
    ? DateRange 
    : never;
};
```

## Function Declarations

### Function Naming
```typescript
// Use descriptive, verb-based names
const fetchConcertsByGenre = async (genre: string): Promise<Concert[]> => {
  // Implementation
};

const formatConcertDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

// Boolean functions should be questions
const isConcertFree = (concert: Concert): boolean => {
  return concert.price === 'free';
};

const hasUpcomingConcerts = (concerts: Concert[]): boolean => {
  return concerts.some(concert => isAfter(concert.date, new Date()));
};
```

### Function Parameters
```typescript
// Use object parameters for multiple arguments
interface SearchConcertsParams {
  query?: string;
  genre?: string;
  borough?: Borough;
  dateRange?: DateRange;
  priceRange?: PriceRange;
  limit?: number;
  offset?: number;
}

const searchConcerts = async (params: SearchConcertsParams): Promise<Concert[]> => {
  const { query, genre, borough, dateRange, priceRange, limit = 20, offset = 0 } = params;
  // Implementation
};

// Usage
const results = await searchConcerts({
  genre: 'indie-rock',
  borough: Borough.BROOKLYN,
  limit: 10,
});
```

## Error Handling

### Custom Error Classes
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Error Handling Patterns
```typescript
// Result pattern for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

const fetchConcert = async (id: string): Promise<Result<Concert, ApiError>> => {
  try {
    const response = await api.get(`/concerts/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: new ApiError('Failed to fetch concert', 500, `/concerts/${id}`)
    };
  }
};

// Usage
const result = await fetchConcert('123');
if (result.success) {
  console.log(result.data.artist);
} else {
  console.error(result.error.message);
}
```

## Async/Await Patterns

### Promise Handling
```typescript
// Prefer async/await over .then()
const loadConcertData = async (concertId: string) => {
  try {
    const [concert, venue, reviews] = await Promise.all([
      fetchConcert(concertId),
      fetchVenue(concert.venueId),
      fetchReviews(concertId),
    ]);

    return { concert, venue, reviews };
  } catch (error) {
    console.error('Failed to load concert data:', error);
    throw error;
  }
};

// Handle partial failures
const loadConcertDataWithFallbacks = async (concertId: string) => {
  const concert = await fetchConcert(concertId);
  
  const [venue, reviews] = await Promise.allSettled([
    fetchVenue(concert.venueId),
    fetchReviews(concertId),
  ]);

  return {
    concert,
    venue: venue.status === 'fulfilled' ? venue.value : null,
    reviews: reviews.status === 'fulfilled' ? reviews.value : [],
  };
};
```

## React Component Patterns

### Component Props
```typescript
// Use interfaces for component props
interface ConcertCardProps {
  concert: Concert;
  variant?: 'default' | 'compact' | 'featured';
  showVenue?: boolean;
  onFavorite?: (concertId: string) => void;
  className?: string;
}

// Use default parameters
const ConcertCard = ({
  concert,
  variant = 'default',
  showVenue = true,
  onFavorite,
  className,
}: ConcertCardProps) => {
  // Component implementation
};
```

### Custom Hooks
```typescript
// Extract logic into custom hooks
const useConcertSearch = (initialFilters: SearchFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Concert[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (newFilters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const concerts = await searchConcerts(newFilters);
      setResults(concerts);
      setFilters(newFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    filters,
    results,
    isLoading,
    error,
    search,
  };
};
```

## Data Validation

### Runtime Type Checking
```typescript
import { z } from 'zod';

// Define schemas
const ConcertSchema = z.object({
  id: z.string(),
  artist: z.string().min(1),
  venue: z.object({
    id: z.string(),
    name: z.string(),
    borough: z.nativeEnum(Borough),
  }),
  date: z.date(),
  price: z.union([z.number().positive(), z.literal('free')]),
  genres: z.array(z.string()),
});

// Validation function
const validateConcert = (data: unknown): Concert => {
  return ConcertSchema.parse(data);
};

// API response validation
const fetchConcert = async (id: string): Promise<Concert> => {
  const response = await api.get(`/concerts/${id}`);
  return validateConcert(response.data);
};
```

## Performance Optimization

### Memoization
```typescript
import { useMemo, useCallback } from 'react';

const ConcertList = ({ concerts, filters }: ConcertListProps) => {
  // Memoize expensive calculations
  const filteredConcerts = useMemo(() => {
    return concerts.filter(concert => {
      if (filters.genre && !concert.genres.includes(filters.genre)) {
        return false;
      }
      if (filters.borough && concert.venue.borough !== filters.borough) {
        return false;
      }
      return true;
    });
  }, [concerts, filters]);

  // Memoize event handlers
  const handleConcertClick = useCallback((concertId: string) => {
    navigate(`/concert/${concertId}`);
  }, [navigate]);

  return (
    <div>
      {filteredConcerts.map(concert => (
        <ConcertCard
          key={concert.id}
          concert={concert}
          onClick={handleConcertClick}
        />
      ))}
    </div>
  );
};
```

### Debouncing
```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const SearchInput = ({ onSearch }: { onSearch: (query: string) => void }) => {
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      onSearch(query);
    }, 300),
    [onSearch]
  );

  return (
    <input
      type="text"
      placeholder="Search concerts..."
      onChange={(e) => debouncedSearch(e.target.value)}
    />
  );
};
```

## Code Organization

### Barrel Exports
```typescript
// components/index.ts
export { ConcertCard } from './ConcertCard';
export { SearchForm } from './SearchForm';
export { VenueCard } from './VenueCard';

// hooks/index.ts
export { useConcertSearch } from './useConcertSearch';
export { useLocalStorage } from './useLocalStorage';

// utils/index.ts
export { formatDate, formatPrice } from './formatters';
export { validateEmail, validateUrl } from './validators';
```

### Constants Organization
```typescript
// constants/api.ts
export const API_ENDPOINTS = {
  CONCERTS: '/api/concerts',
  VENUES: '/api/venues',
  SEARCH: '/api/search',
} as const;

// constants/ui.ts
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;
```

## Documentation

### JSDoc Comments
```typescript
/**
 * Searches for concerts based on the provided filters
 * 
 * @param filters - Search criteria including genre, borough, date range, etc.
 * @param options - Additional options like pagination and sorting
 * @returns Promise that resolves to an array of matching concerts
 * 
 * @example
 * ```typescript
 * const concerts = await searchConcerts({
 *   genre: 'indie-rock',
 *   borough: Borough.BROOKLYN,
 * });
 * ```
 */
const searchConcerts = async (
  filters: SearchFilters,
  options: SearchOptions = {}
): Promise<Concert[]> => {
  // Implementation
};
```

### Type Documentation
```typescript
/**
 * Represents a concert event in the system
 */
interface Concert {
  /** Unique identifier for the concert */
  id: string;
  
  /** Name of the performing artist or band */
  artist: string;
  
  /** Venue where the concert takes place */
  venue: Venue;
  
  /** Date and time of the concert */
  date: Date;
  
  /** Ticket price or 'free' for free concerts */
  price: number | 'free';
  
  /** Array of music genres associated with this concert */
  genres: string[];
}
```