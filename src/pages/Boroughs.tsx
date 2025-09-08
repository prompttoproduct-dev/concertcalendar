import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConcertList } from "@/components/ConcertList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Building, Music } from "lucide-react";
import { useSearchConcerts, type Borough } from "@/hooks/useConcerts";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Boroughs = () => {
  const navigate = useNavigate();
  const [selectedBorough, setSelectedBorough] = useState<Borough | null>(null);

  const { data: concerts = [], isLoading } = useSearchConcerts(
    selectedBorough ? { borough: selectedBorough } : {}
  );

  const boroughData = [
    {
      name: "Manhattan",
      value: "manhattan" as Borough,
      description: "Iconic venues from the Village to Harlem",
      venues: "120+ venues",
      highlights: ["Blue Note", "Village Vanguard", "Bowery Ballroom"],
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&q=80"
    },
    {
      name: "Brooklyn",
      value: "brooklyn" as Borough,
      description: "From Williamsburg warehouses to Park Slope indie",
      venues: "200+ venues",
      highlights: ["Brooklyn Steel", "Music Hall of Williamsburg", "Barclays Center"],
      color: "bg-green-500/20 text-green-300 border-green-500/30",
      image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80"
    },
    {
      name: "Queens",
      value: "queens" as Borough,
      description: "Diverse sounds from Astoria to Forest Hills",
      venues: "80+ venues",
      highlights: ["Forest Hills Stadium", "Knockdown Center"],
      color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80"
    },
    {
      name: "Bronx",
      value: "bronx" as Borough,
      description: "Hip-hop birthplace and community venues",
      venues: "45+ venues",
      highlights: ["Yankee Stadium", "Concourse Plaza Multiplex"],
      color: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop&q=80"
    },
    {
      name: "Staten Island",
      value: "staten_island" as Borough,
      description: "Hidden gems and community music spaces",
      venues: "15+ venues",
      highlights: ["St. George Theatre", "Snug Harbor"],
      color: "bg-red-500/20 text-red-300 border-red-500/30",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs />
        
        <div className="py-8">
          <div className="text-center mb-12">
            <h1 className="headline text-display text-foreground mb-4">
              Explore NYC Boroughs
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Each borough has its own unique music scene. Discover venues and concerts across all five boroughs.
            </p>
          </div>

          {/* Borough Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {boroughData.map((borough) => (
              <div
                key={borough.value}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border transition-smooth hover:scale-[1.02] cursor-pointer",
                  selectedBorough === borough.value ? "ring-2 ring-accent" : ""
                )}
                onClick={() => setSelectedBorough(
                  selectedBorough === borough.value ? null : borough.value
                )}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={borough.image} 
                    alt={`${borough.name} music scene`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  {/* Borough Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{borough.name}</h3>
                      <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                        {borough.venues}
                      </Badge>
                    </div>
                    <p className="text-white/90 text-sm mb-3">{borough.description}</p>
                    
                    {/* Top Venues */}
                    <div className="flex flex-wrap gap-1">
                      {borough.highlights.map((venue) => (
                        <span 
                          key={venue}
                          className="text-xs px-2 py-1 bg-white/20 text-white rounded-full"
                        >
                          {venue}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedBorough === borough.value && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <Music className="h-3 w-3 text-accent-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active Filters */}
          {selectedBorough && (
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm text-muted-foreground">Showing concerts in:</span>
              <Badge variant="default" className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                {boroughData.find(b => b.value === selectedBorough)?.name}
                <button
                  onClick={() => setSelectedBorough(null)}
                  className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/search?borough=${selectedBorough}`)}
              >
                View in Search
              </Button>
            </div>
          )}

          {/* Concert Results */}
          <div>
            {selectedBorough ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Concerts in {boroughData.find(b => b.value === selectedBorough)?.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {isLoading 
                      ? "Loading concerts..." 
                      : `Found ${concerts.length} concert${concerts.length !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>

                <ConcertList
                  concerts={concerts}
                  isLoading={isLoading}
                  emptyMessage={`No concerts found in ${boroughData.find(b => b.value === selectedBorough)?.name}. Try selecting a different borough.`}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select a Borough
                </h3>
                <p className="text-muted-foreground">
                  Choose a borough above to see concerts in that area
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Boroughs;