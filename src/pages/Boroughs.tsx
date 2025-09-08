import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Music, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Boroughs = () => {
  const navigate = useNavigate();

  const boroughData = [
    {
      name: "Manhattan",
      description: "Iconic venues from the Village to Harlem",
      venues: "120+ venues",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&q=80"
    },
    {
      name: "Brooklyn", 
      description: "From Williamsburg warehouses to Park Slope indie",
      venues: "200+ venues",
      image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80"
    },
    {
      name: "Queens",
      description: "Diverse sounds from Astoria to Forest Hills", 
      venues: "80+ venues",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80"
    },
    {
      name: "Bronx",
      description: "Hip-hop birthplace and community venues",
      venues: "45+ venues", 
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop&q=80"
    },
    {
      name: "Staten Island",
      description: "Hidden gems and community music spaces",
      venues: "15+ venues",
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
              NYC Music Boroughs
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore the unique music scenes across all five boroughs of New York City.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boroughData.map((borough) => (
              <div
                key={borough.name}
                className="group relative overflow-hidden rounded-xl border border-border transition-smooth hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate(`/search?venue=${encodeURIComponent(borough.name)}`)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={borough.image} 
                    alt={`${borough.name} music scene`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-2">{borough.name}</h3>
                    <p className="text-white/90 text-sm mb-3">{borough.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-white/20 text-white rounded-full">
                        {borough.venues}
                      </span>
                      <MapPin className="h-4 w-4 text-white/80" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => navigate('/search')}
            >
              Search All Concerts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Boroughs;