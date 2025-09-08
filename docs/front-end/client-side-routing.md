# Client-Side Routing

## React Router Setup

### Router Configuration
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/concert/:id" element={<ConcertDetails />} />
        <Route path="/venue/:slug" element={<VenueProfile />} />
        <Route path="/genre/:genre" element={<GenreExplorer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
```

### Route Structure
```
/                           # Homepage
/search                     # Search results
/search?q=indie&borough=bk  # Search with filters
/concert/:id                # Concert details
/venue/:slug                # Venue profile
/genre/:genre               # Genre exploration
/artist/:slug               # Artist profile
/borough/:borough           # Borough-specific concerts
/free                       # Free concerts only
/new-releases               # New release tracking
```

## Navigation Components

### Navigation Menu
```typescript
import { NavLink, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-6">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          cn("nav-link", isActive && "nav-link--active")
        }
      >
        Home
      </NavLink>
      <NavLink 
        to="/search" 
        className={({ isActive }) => 
          cn("nav-link", isActive && "nav-link--active")
        }
      >
        Search
      </NavLink>
      <NavLink 
        to="/free" 
        className={({ isActive }) => 
          cn("nav-link", isActive && "nav-link--active")
        }
      >
        Free Shows
      </NavLink>
    </nav>
  );
};
```

### Breadcrumb Navigation
```typescript
import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </li>
        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={pathname} className="flex items-center space-x-2">
              <span className="text-muted-foreground">/</span>
              {isLast ? (
                <span className="text-foreground font-medium">
                  {pathname}
                </span>
              ) : (
                <Link 
                  to={routeTo}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {pathname}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
```

## Route Parameters & Search Params

### Dynamic Route Parameters
```typescript
// Concert Details Page
import { useParams, useNavigate } from "react-router-dom";

const ConcertDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: concert, isLoading } = useQuery({
    queryKey: ['concert', id],
    queryFn: () => fetchConcert(id!),
    enabled: !!id,
  });

  if (!id) {
    navigate('/404');
    return null;
  }

  return (
    <div>
      {/* Concert details */}
    </div>
  );
};
```

### Search Parameters
```typescript
import { useSearchParams, useNavigate } from "react-router-dom";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const borough = searchParams.get('borough') || '';
  const genre = searchParams.get('genre') || '';
  const priceRange = searchParams.get('price') || '';

  const updateSearch = (newParams: Record<string, string>) => {
    const updatedParams = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        updatedParams.set(key, value);
      } else {
        updatedParams.delete(key);
      }
    });

    setSearchParams(updatedParams);
  };

  return (
    <div>
      <SearchForm 
        initialValues={{ query, borough, genre, priceRange }}
        onSearch={updateSearch}
      />
      <SearchResults params={{ query, borough, genre, priceRange }} />
    </div>
  );
};
```

## Route Guards & Authentication

### Protected Routes
```typescript
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = false, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && (!user || !user.isAdmin)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Usage in routes
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## Code Splitting & Lazy Loading

### Route-Based Code Splitting
```typescript
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load route components
const SearchResults = lazy(() => import("./pages/SearchResults"));
const ConcertDetails = lazy(() => import("./pages/ConcertDetails"));
const VenueProfile = lazy(() => import("./pages/VenueProfile"));

const AppRoutes = () => (
  <Suspense fallback={<PageLoadingSpinner />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/concert/:id" element={<ConcertDetails />} />
      <Route path="/venue/:slug" element={<VenueProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);
```

### Preloading Routes
```typescript
import { useEffect } from "react";

const useRoutePreloading = () => {
  useEffect(() => {
    // Preload likely next routes on hover or focus
    const preloadRoute = (routePath: string) => {
      import(`./pages/${routePath}`);
    };

    // Preload search page when user focuses on search input
    const searchInput = document.querySelector('[data-search-input]');
    searchInput?.addEventListener('focus', () => {
      preloadRoute('SearchResults');
    });

    return () => {
      searchInput?.removeEventListener('focus', () => {});
    };
  }, []);
};
```

## Navigation Patterns

### Programmatic Navigation
```typescript
import { useNavigate } from "react-router-dom";

const ConcertCard = ({ concert }: { concert: Concert }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/concert/${concert.id}`, {
      state: { from: 'search-results' }
    });
  };

  const handleVenueClick = () => {
    navigate(`/venue/${concert.venue.slug}`);
  };

  return (
    <div className="concert-card">
      <button onClick={handleViewDetails}>
        View Details
      </button>
      <button onClick={handleVenueClick}>
        {concert.venue.name}
      </button>
    </div>
  );
};
```

### Back Navigation
```typescript
import { useNavigate, useLocation } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's a previous page in history
    if (location.state?.from) {
      navigate(-1);
    } else {
      // Fallback to home page
      navigate('/');
    }
  };

  return (
    <button onClick={handleBack} className="back-button">
      ← Back
    </button>
  );
};
```

## SEO & Meta Tags

### Dynamic Meta Tags
```typescript
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

const ConcertDetails = () => {
  const { id } = useParams();
  const { data: concert } = useQuery(['concert', id], () => fetchConcert(id!));

  if (!concert) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>{concert.artist} at {concert.venue.name} | CitySounds</title>
        <meta 
          name="description" 
          content={`${concert.artist} performing at ${concert.venue.name} on ${concert.date}. Get tickets and venue information.`} 
        />
        <meta property="og:title" content={`${concert.artist} at ${concert.venue.name}`} />
        <meta property="og:description" content={concert.description} />
        <meta property="og:image" content={concert.imageUrl} />
        <meta property="og:url" content={`https://citysounds.nyc/concert/${concert.id}`} />
      </Helmet>
      
      <div>
        {/* Concert details */}
      </div>
    </>
  );
};
```

## Error Boundaries for Routes

### Route Error Boundary
```typescript
import { ErrorBoundary } from "react-error-boundary";

const RouteErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="error-page">
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

const AppRoutes = () => (
  <ErrorBoundary FallbackComponent={RouteErrorFallback}>
    <Routes>
      {/* Routes */}
    </Routes>
  </ErrorBoundary>
);
```