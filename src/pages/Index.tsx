import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ConcertList } from "@/components/ConcertList";
import { useUpcomingConcerts, useFreeConcerts } from "@/hooks/useConcerts";
import { Music, Users, Bell, MapPin, Calendar, Star, DollarSign, Compass, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  // Fetch real data from Supabase
  const { data: upcomingConcerts = [], isLoading: upcomingLoading } = useUpcomingConcerts(6);
  const { data: freeConcerts = [], isLoading: freeLoading } = useFreeConcerts();

  const handleFreeShowsClick = () => {
    navigate('/search?priceRange=free');
  };

  const features = [
    {
      icon: Compass,
      title: "Genre-First Discovery",
      description: "Explore NYC's music scene by genre. Discover indie rock in Bushwick, jazz in Harlem, or electronic in Williamsburg."
    },
    {
      icon: DollarSign,
      title: "Free Concert Finder",
      description: "Never miss free concerts again. We aggregate free shows across all 5 boroughs so you can discover new artists without spending a dime."
    },
    {
      icon: Filter,
      title: "New Release Tracking",
      description: "See which artists with new albums are touring NYC. Catch emerging talent before they blow up."
    },
    {
      icon: MapPin,
      title: "All 5 Boroughs",
      description: "From Manhattan venues to Brooklyn DIY spaces, Queens warehouses to Bronx community centers - we cover it all."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <HeroSection />

      {/* Genre Navigation */}
      <section className="px-6 py-16 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-h2 text-foreground mb-6">Browse by Genre</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 max-w-4xl mx-auto">
              {[
                { name: "Indie Rock", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
                { name: "Electronic", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
                { name: "Jazz", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
                { name: "Hip-Hop", color: "bg-green-500/20 text-green-300 border-green-500/30" },
                { name: "Folk", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
                { name: "Experimental", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
                { name: "Metal", color: "bg-red-500/20 text-red-300 border-red-500/30" },
                { name: "Pop", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" }
              ].map((genre) => (
                <Button 
                  key={genre.name} 
                  variant="outline" 
                  className={`rounded-16 text-xs py-3 h-auto ${genre.color} hover:bg-accent hover:text-accent-foreground hover:border-accent transition-smooth`}
                  onClick={() => navigate(`/search?genre=${encodeURIComponent(genre.name.toLowerCase())}`)}
                >
                  {genre.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Discoveries */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-label text-accent h-auto px-3 py-1.5 hover:bg-accent/10"
                onClick={handleFreeShowsClick}
              >
                FREE
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-label text-muted-foreground h-auto px-3 py-1.5 hover:bg-accent/10 hover:text-accent"
                onClick={() => navigate('/search?priceRange=0-35')}
              >
                $0–35
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-label text-muted-foreground h-auto px-3 py-1.5 hover:bg-accent/10 hover:text-accent"
                onClick={() => navigate('/search?priceRange=35-50')}
              >
                $35–50
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-label text-muted-foreground h-auto px-3 py-1.5 hover:bg-accent/10 hover:text-accent"
                onClick={() => navigate('/search?priceRange=50-100')}
              >
                $50–100
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-label text-muted-foreground h-auto px-3 py-1.5 hover:bg-accent/10 hover:text-accent"
                onClick={() => navigate('/search?priceRange=100+')}
              >
                $100+
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-label text-muted-foreground h-auto px-3 py-1.5 hover:bg-accent/10 hover:text-accent"
                onClick={() => navigate('/search')}
              >
                ALL
              </Button>
            </div>
            <h3 className="headline text-h1 lg:text-display text-foreground mb-4">
              Upcoming Discoveries
            </h3>
            <p className="text-xl text-muted-foreground">
              Real concerts from NYC venues you shouldn't miss
            </p>
          </div>
          
          <ConcertList
            concerts={upcomingConcerts}
            isLoading={upcomingLoading}
            emptyMessage="No upcoming concerts found. Check back soon!"
          />
          
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/search')}
            >
              View All Concerts
            </Button>
          </div>
        </div>
      </section>

      {/* Borough Coverage */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-h1 text-foreground mb-4">
              Every Borough, Every Scene
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {[
                { name: "Manhattan", venues: "120+ venues" },
                { name: "Brooklyn", venues: "200+ venues" }, 
                { name: "Queens", venues: "80+ venues" },
                { name: "Bronx", venues: "45+ venues" },
                { name: "Staten Island", venues: "15+ venues" }
              ].map((borough) => (
                <div key={borough.name} className="bg-gradient-card rounded-lg p-4 text-center border border-border">
                  <h4 className="font-semibold text-foreground mb-1">{borough.name}</h4>
                  <p className="text-sm text-muted-foreground">{borough.venues}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="headline text-h1 lg:text-display text-foreground mb-4">
              Beyond Algorithm Recommendations
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real discovery through genre exploration, community curation, and NYC's underground scene
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-primary mb-6 group-hover:shadow-glow transition-smooth">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-card rounded-24 p-12 shadow-card border border-border">
            <h3 className="headline text-h1 lg:text-display text-foreground mb-6">
              Stop Missing NYC's Best Shows
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              While others track known artists, we help you discover the next big thing. 
              Find your new favorite band at a free show in Brooklyn tonight.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="hero" 
                className="px-8"
                onClick={() => navigate('/search')}
              >
                Start Discovering
              </Button>
              <Button 
                size="lg" 
                variant="accent" 
                className="px-8"
                onClick={handleFreeShowsClick}
              >
                Browse Free Shows
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-accent" />
              <span className="text-lg font-semibold text-foreground">CitySounds</span>
            </div>
            <div className="flex items-center gap-6 text-muted-foreground">
              <a href="#" className="hover:text-accent transition-smooth">About</a>
              <a href="#" className="hover:text-accent transition-smooth">Privacy</a>
              <a href="#" className="hover:text-accent transition-smooth">Terms</a>
              <a href="#" className="hover:text-accent transition-smooth">Contact</a>
            </div>
          </div>
          <div className="text-center text-muted-foreground text-sm mt-8">
            © 2024 CitySounds. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;