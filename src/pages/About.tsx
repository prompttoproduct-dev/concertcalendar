import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Music, Github, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs />
        
        <div className="py-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="headline text-display text-foreground mb-6">
              NYC Concert
              <span className="text-accent block">Discovery</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Your go-to platform for discovering live music events across New York City. 
              Find concerts by date, search by artist or venue, and never miss a show.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate('/search')}
              >
                Search Concerts
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/calendar')}
              >
                View Calendar
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-card rounded-xl p-8 lg:p-12 border border-border text-center">
            <h2 className="text-h1 text-foreground mb-4">About CitySounds</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              A simple platform for discovering live music events across New York City. 
              Browse by date, search by artist or venue, and find your next concert.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg">
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </Button>
              <Button variant="ghost" size="lg">
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;