import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConcertList } from "@/components/ConcertList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useSearchConcerts } from "@/hooks/useConcerts";

const SearchResults = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  
  const { data: concerts = [], isLoading, error } = useSearchConcerts(activeQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
  };

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
              Find concerts by artist or venue name
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search artists or venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>
              <Button type="submit" variant="hero">
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div>
          {activeQuery && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Search Results for "{activeQuery}"
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
              activeQuery 
                ? "No concerts match your search. Try different keywords."
                : "Enter a search term to find concerts."
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;