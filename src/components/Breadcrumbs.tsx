import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  className?: string;
}

export const Breadcrumbs = ({ className }: BreadcrumbsProps) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumbs on homepage
  if (location.pathname === '/') {
    return null;
  }

  // Custom labels for specific paths
  const getPathLabel = (pathname: string, index: number) => {
    const labels: Record<string, string> = {
      'search': 'Search Results',
      'concert': 'Concert Details',
      'venue': 'Venue',
      'artist': 'Artist',
      'genre': 'Genre',
      'borough': 'Borough',
      'calendar': 'Calendar',
      'boroughs': 'Boroughs',
      'free': 'Free Shows'
    };

    return labels[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
  };

  // Handle search params for better breadcrumb context
  const getSearchContext = () => {
    const searchParams = new URLSearchParams(location.search);
    const contexts = [];
    
    if (searchParams.get('q')) {
      contexts.push(`"${searchParams.get('q')}"`);
    }
    if (searchParams.get('genre')) {
      contexts.push(searchParams.get('genre'));
    }
    if (searchParams.get('borough')) {
      contexts.push(searchParams.get('borough'));
    }
    if (searchParams.get('priceRange')) {
      const priceRange = searchParams.get('priceRange');
      contexts.push(priceRange === 'free' ? 'Free Shows' : priceRange);
    }
    
    return contexts.length > 0 ? ` (${contexts.join(', ')})` : '';
  };

  return (
    <nav aria-label="Breadcrumb" className={cn("py-4", className)}>
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {/* Home */}
        <li>
          <Link 
            to="/" 
            className="flex items-center hover:text-accent transition-smooth"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Path segments */}
        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = getPathLabel(pathname, index);

          return (
            <li key={pathname} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              {isLast ? (
                <span className="text-foreground font-medium">
                  {label}
                  {pathname === 'search' && getSearchContext()}
                </span>
              ) : (
                <Link 
                  to={routeTo}
                  className="hover:text-accent transition-smooth"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};