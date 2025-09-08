# Advanced UI Rendering Techniques

## Virtualization for Large Lists

### React Window for Concert Lists
```typescript
import { FixedSizeList as List } from 'react-window';
import { ConcertCard } from './ConcertCard';

interface VirtualizedConcertListProps {
  concerts: Concert[];
  height: number;
}

const VirtualizedConcertList = ({ concerts, height }: VirtualizedConcertListProps) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ConcertCard concert={concerts[index]} />
    </div>
  );

  return (
    <List
      height={height}
      itemCount={concerts.length}
      itemSize={200} // Height of each concert card
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### Infinite Scrolling with Intersection Observer
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useIntersection } from '@/hooks/useIntersection';

const InfiniteSearchResults = ({ searchParams }: { searchParams: SearchParams }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['concerts', searchParams],
    queryFn: ({ pageParam = 0 }) => fetchConcerts({ ...searchParams, page: pageParam }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length : undefined,
  });

  const { ref, inView } = useIntersection({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const concerts = data?.pages.flatMap(page => page.concerts) ?? [];

  return (
    <div className="space-y-4">
      {concerts.map((concert) => (
        <ConcertCard key={concert.id} concert={concert} />
      ))}
      
      {hasNextPage && (
        <div ref={ref} className="flex justify-center p-4">
          {isFetchingNextPage ? <LoadingSpinner /> : 'Load more...'}
        </div>
      )}
    </div>
  );
};
```

## Optimistic Updates

### Optimistic Concert Favoriting
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useFavoriteConcert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ concertId, isFavorited }: { concertId: string; isFavorited: boolean }) =>
      toggleFavorite(concertId, isFavorited),
    
    onMutate: async ({ concertId, isFavorited }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['concerts'] });

      // Snapshot previous value
      const previousConcerts = queryClient.getQueryData(['concerts']);

      // Optimistically update
      queryClient.setQueryData(['concerts'], (old: any) => ({
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          concerts: page.concerts.map((concert: Concert) =>
            concert.id === concertId
              ? { ...concert, isFavorited, favoriteCount: concert.favoriteCount + (isFavorited ? 1 : -1) }
              : concert
          ),
        })),
      }));

      return { previousConcerts };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousConcerts) {
        queryClient.setQueryData(['concerts'], context.previousConcerts);
      }
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['concerts'] });
    },
  });
};
```

## Skeleton Loading States

### Concert Card Skeleton
```typescript
const ConcertCardSkeleton = () => (
  <div className="concert-card animate-pulse">
    <div className="aspect-video bg-muted rounded-lg mb-4" />
    <div className="space-y-3">
      <div className="h-6 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
      <div className="h-10 bg-muted rounded w-full" />
    </div>
  </div>
);

const SearchResults = () => {
  const { data: concerts, isLoading } = useQuery(['concerts'], fetchConcerts);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ConcertCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {concerts?.map((concert) => (
        <ConcertCard key={concert.id} concert={concert} />
      ))}
    </div>
  );
};
```

## Progressive Enhancement

### Image Loading with Blur Placeholder
```typescript
import { useState } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  blurDataURL?: string;
  className?: string;
}

const ProgressiveImage = ({ src, alt, blurDataURL, className }: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
      />
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground">Failed to load image</span>
        </div>
      )}
    </div>
  );
};
```

## Render Props & Compound Components

### Search Filter Compound Component
```typescript
interface SearchFiltersProps {
  children: React.ReactNode;
  onFiltersChange: (filters: SearchFilters) => void;
}

const SearchFilters = ({ children, onFiltersChange }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<SearchFilters>({});

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <SearchFiltersContext.Provider value={{ filters, updateFilter }}>
      <div className="search-filters">
        {children}
      </div>
    </SearchFiltersContext.Provider>
  );
};

// Compound components
SearchFilters.Genre = ({ options }: { options: string[] }) => {
  const { filters, updateFilter } = useSearchFiltersContext();
  
  return (
    <Select
      value={filters.genre}
      onValueChange={(value) => updateFilter('genre', value)}
    >
      {options.map(genre => (
        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
      ))}
    </Select>
  );
};

SearchFilters.Borough = ({ options }: { options: string[] }) => {
  const { filters, updateFilter } = useSearchFiltersContext();
  
  return (
    <Select
      value={filters.borough}
      onValueChange={(value) => updateFilter('borough', value)}
    >
      {options.map(borough => (
        <SelectItem key={borough} value={borough}>{borough}</SelectItem>
      ))}
    </Select>
  );
};

// Usage
<SearchFilters onFiltersChange={handleFiltersChange}>
  <SearchFilters.Genre options={genres} />
  <SearchFilters.Borough options={boroughs} />
</SearchFilters>
```

## Error Boundaries & Suspense

### Granular Error Boundaries
```typescript
import { ErrorBoundary } from 'react-error-boundary';

const ConcertListErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="text-center p-8">
    <h3 className="text-lg font-semibold mb-2">Unable to load concerts</h3>
    <p className="text-muted-foreground mb-4">{error.message}</p>
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </div>
);

const SearchResults = () => (
  <div className="space-y-8">
    <SearchFilters />
    
    <ErrorBoundary
      FallbackComponent={ConcertListErrorFallback}
      onReset={() => queryClient.invalidateQueries(['concerts'])}
    >
      <Suspense fallback={<ConcertListSkeleton />}>
        <ConcertList />
      </Suspense>
    </ErrorBoundary>
  </div>
);
```

## Performance Monitoring

### Render Performance Tracking
```typescript
import { Profiler } from 'react';

const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  // Log performance metrics
  if (actualDuration > 16) { // Longer than one frame
    console.warn(`Slow render detected in ${id}:`, {
      phase,
      actualDuration,
      baseDuration,
    });
  }
};

const App = () => (
  <Profiler id="App" onRender={onRenderCallback}>
    <Routes>
      {/* Routes */}
    </Routes>
  </Profiler>
);
```

### Custom Performance Hook
```typescript
import { useEffect, useRef } from 'react';

const useRenderTime = (componentName: string) => {
  const renderStart = useRef<number>();
  
  // Mark render start
  renderStart.current = performance.now();
  
  useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - (renderStart.current || 0);
    
    if (renderTime > 16) {
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
  });
};

// Usage
const ConcertList = () => {
  useRenderTime('ConcertList');
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

## Advanced State Management Patterns

### State Machines with XState
```typescript
import { createMachine, interpret } from 'xstate';

const searchMachine = createMachine({
  id: 'search',
  initial: 'idle',
  states: {
    idle: {
      on: {
        SEARCH: 'searching'
      }
    },
    searching: {
      invoke: {
        src: 'performSearch',
        onDone: {
          target: 'success',
          actions: 'setResults'
        },
        onError: {
          target: 'error',
          actions: 'setError'
        }
      }
    },
    success: {
      on: {
        SEARCH: 'searching',
        CLEAR: 'idle'
      }
    },
    error: {
      on: {
        RETRY: 'searching',
        CLEAR: 'idle'
      }
    }
  }
});

const useSearchMachine = () => {
  const [state, send] = useActor(searchMachine);
  
  return {
    state: state.value,
    results: state.context.results,
    error: state.context.error,
    search: (query: string) => send({ type: 'SEARCH', query }),
    clear: () => send({ type: 'CLEAR' }),
    retry: () => send({ type: 'RETRY' }),
  };
};
```