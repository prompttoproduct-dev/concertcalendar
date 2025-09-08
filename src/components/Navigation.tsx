import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Music, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export const Navigation = ({ className }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      </div>
    </nav>
  );
};