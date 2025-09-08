import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Music, MapPin, Compass, Calendar, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUpcomingConcerts, useFreeConcerts } from "@/hooks/useConcerts";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

export const HeroSection = ({ className }: HeroSectionProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  
  const { data: upcomingConcerts = [] } = useUpcomingConcerts(3);
  const { data: freeConcerts = [] } = useFreeConcerts();

  // Rotate featured concerts every 5 seconds
  useEffect(() => {
    if (upcomingConcerts.length > 1) {
      const interval = setInterval(() => {
        setFeaturedIndex(prev => (prev + 1) % upcomingConcerts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [upcomingConcerts.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleGenreClick = (genre: string) => {
    navigate(`/search?genre=${encodeURIComponent(genre)}`);
  };

  const handleFreeShowsClick = () => {
    navigate('/search?priceRange=free');
  };

  const featuredConcert = upcomingConcerts[featuredIndex];

  const quickStats = [
    { 
      icon: Calendar, 
      label: "This Week", 
      value: upcomingConcerts.length,
      action: () => navigate('/search')
    },
    { 
      icon: Users, 
      label: "Free Shows", 
      value: freeConcerts.length,
      action: handleFreeShowsClick
    },
    { 
      icon: MapPin, 
      label: "All Boroughs", 
      value: "5",
      action: () => navigate('/boroughs')
    }
  ];

  return (
    <section className={cn("relative px-6 py-20 lg:py-32 overflow-hidden", className)}>
      {/* Background with featured concert */}
      <div className="absolute inset-0 z-0">
        {featuredConcert?.image_url ? (
          <img 
            src={featuredConcert.image_url} 
            alt={`${featuredConcert.artist} concert`}
            className="w-full h-full object-cover opacity-20 transition-opacity duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-hero/80" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Featured Concert Indicator */}
        {featuredConcert && (
          <div className="mb-6 animate-in fade-in duration-1000">
            <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
              <Zap className="h-3 w-3 mr-1" />
              Featured: {featuredConcert.artist} • {new Date(featuredConcert.date).toLocaleDateString()}
            </Badge>
          </div>
        )}

        {/* Main Headline */}
        <h1 className="headline text-display lg:text-7xl text-foreground mb-4">
          Find your next
          <span className="text-accent block">NYC set</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover emerging artists, free concerts, and genre-specific shows across all five boroughs. 
          Beyond algorithm recommendations — authentic NYC music discovery.
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <button
              key={stat.label}
              onClick={stat.action}
              className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border border-border hover:bg-accent/10 hover:border-accent/30 transition-smooth group"
            >
              <stat.icon className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-foreground">{stat.value}</span>
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </button>
          ))}
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Try 'indie rock brooklyn' or 'free jazz harlem'..."
              className="pl-12 h-14 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" variant="hero" className="px-8 h-14">
            Start Discovering
          </Button>
        </form>
        
        
        {/* Discovery Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="free-badge">FREE</span>
            <span>{freeConcerts.length} Free Shows Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-accent" />
            <span>Genre-First Discovery</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span>All 5 Boroughs</span>
          </div>
        </div>
      </div>
    </section>
  );
};