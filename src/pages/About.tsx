import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Music, Heart, Users, Zap, Github, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Music,
      title: "Genre-First Discovery",
      description: "We believe music discovery should start with what you love. Explore NYC's scene by genre, not just popularity."
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "Real people curate real shows. Our community adds hidden gems and underground venues you won't find elsewhere."
    },
    {
      icon: Users,
      title: "All 5 Boroughs",
      description: "From Manhattan's iconic venues to Brooklyn's DIY spaces, we cover every corner of NYC's music ecosystem."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Never miss a last-minute show announcement. Get notified when new concerts match your taste."
    }
  ];

  const team = [
    {
      name: "Music Discovery Team",
      role: "Building the future of concert discovery",
      description: "We're passionate about connecting music lovers with their next favorite artist."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs />
        
        <div className="py-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="headline text-display text-foreground mb-6">
              Beyond Algorithm
              <span className="text-accent block">Recommendations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              CitySounds was born from frustration with algorithm-driven music discovery. 
              We believe the best concerts aren't always the most popular ones — they're the ones that match your taste, 
              happen in your neighborhood, and fit your budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate('/search')}
              >
                Start Discovering
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/search?priceRange=free')}
              >
                Browse Free Shows
              </Button>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-gradient-card rounded-xl p-8 lg:p-12 border border-border mb-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-h1 text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                NYC has the most vibrant music scene in the world, but discovering new artists shouldn't require 
                endless scrolling through algorithmic feeds. We're building a platform that puts genre, location, 
                and community at the center of music discovery.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">460+</div>
                  <div className="text-muted-foreground">NYC Venues Covered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">5</div>
                  <div className="text-muted-foreground">Boroughs Included</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">Free</div>
                  <div className="text-muted-foreground">Always Free to Use</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-h1 text-foreground text-center mb-12">
              How We're Different
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-6 p-6 bg-gradient-card rounded-xl border border-border">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-16">
            <h2 className="text-h1 text-foreground text-center mb-12">
              Built by Music Lovers
            </h2>
            <div className="max-w-2xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="text-center p-8 bg-gradient-card rounded-xl border border-border">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {member.name}
                  </h3>
                  <p className="text-accent font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-card rounded-xl p-8 lg:p-12 border border-border text-center">
            <h2 className="text-h1 text-foreground mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have feedback, found a bug, or want to suggest a venue? We'd love to hear from you.
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