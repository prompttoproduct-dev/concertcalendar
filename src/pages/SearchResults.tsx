import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SearchForm } from "@/components/SearchForm";
import { ConcertList } from "@/components/ConcertList";
import { useSearchConcerts, type SearchFilters } from "@/hooks/useConcerts";

const SearchResults = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const { data: concerts = [], isLoading, error } = useSearchConcerts(filters);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const hasActiveSearch = Object.keys(filters).some(key => 
    filters[key as keyof SearchFilters] !== undefined && 
    filters[key as keyof SearchFilters] !== ''
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumbs />
        
        {/* Search Form */}
        <div className="py-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-h1 lg:text-display text-foreground mb-4">
              Search Concerts
            </h1>
            <p className="text-xl text-muted-foreground">
              Find your next favorite show across NYC
            </p>
          </div>
          
          <SearchForm 
            onSearch={handleSearch}
            initialFilters={filters}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Results */}
        <div>
          {hasActiveSearch && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Search Results
              </h2>
              <p className="text-muted-foreground">
                {isLoading 
                  ? "Searching..." 
                  : `Found ${concerts.length} concert${concerts.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          )}

          <ConcertList
            concerts={concerts}
            isLoading={isLoading}
            error={error}
            emptyMessage={
              hasActiveSearch 
                ? "No concerts match your search criteria. Try adjusting your filters."
                : "Enter search terms or select filters to find concerts."
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;