import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Music, Menu, Search, Calendar, MapPin, DollarSign, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export const Navigation = ({ className }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { 
      label: "Discover", 
      path: "/search", 
      icon: Search,
      description: "Find concerts by genre, venue, or artist"
    },
    { 
      label: "Calendar", 
      path: "/calendar", 
      icon: Calendar,
      description: "Browse concerts by date"
    },
    { 
      label: "Boroughs", 
      path: "/boroughs", 
      icon: MapPin,
      description: "Explore venues across NYC"
    },
    { 
      label: "Free Shows", 
      path: "/search?priceRange=free", 
      icon: DollarSign,
      description: "Discover free concerts"
    }
  ];

  const isActivePath = (path: string) => {
    if (path === "/search?priceRange=free") {
      return location.pathname === "/search" && location.search.includes("priceRange=free");
    }
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={cn("relative z-50 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border", className)}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:opacity-80 transition-smooth"
        >
          <div className="relative">
            <Music className="h-8 w-8 text-accent" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">CitySounds</h1>
            <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-full font-semibold">
              NYC
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant={isActivePath(item.path) ? "default" : "ghost"}
              className={cn(
                "flex items-center gap-2 transition-smooth",
                isActivePath(item.path) && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Music className="h-6 w-6 text-accent" />
                  <span className="text-lg font-bold">CitySounds</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-lg text-left transition-smooth hover:bg-muted",
                      isActivePath(item.path) && "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm opacity-70 mt-1">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={() => handleNavigation('/search?priceRange=free')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Find Free Shows
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};