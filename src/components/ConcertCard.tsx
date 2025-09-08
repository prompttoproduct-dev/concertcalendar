import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ExternalLink, Tag } from "lucide-react";

// Genre color mappings for visual consistency
const genreColors: Record<string, { bg: string; text: string; border?: string }> = {
  'rock': { bg: 'hsl(348 83% 47%)', text: 'hsl(0 0% 100%)', border: 'hsl(348 83% 60%)' },
  'pop': { bg: 'hsl(291 64% 42%)', text: 'hsl(0 0% 100%)', border: 'hsl(291 64% 55%)' },
  'jazz': { bg: 'hsl(43 87% 61%)', text: 'hsl(240 9% 4%)', border: 'hsl(43 87% 70%)' },
  'electronic': { bg: 'hsl(215 88% 62%)', text: 'hsl(0 0% 100%)', border: 'hsl(215 88% 75%)' },
  'hip-hop': { bg: 'hsl(151 68% 50%)', text: 'hsl(0 0% 100%)', border: 'hsl(151 68% 60%)' },
  'indie': { bg: 'hsl(25 95% 53%)', text: 'hsl(0 0% 100%)', border: 'hsl(25 95% 65%)' },
  'classical': { bg: 'hsl(262 83% 58%)', text: 'hsl(0 0% 100%)', border: 'hsl(262 83% 70%)' },
  'country': { bg: 'hsl(35 77% 49%)', text: 'hsl(0 0% 100%)', border: 'hsl(35 77% 60%)' },
  'r&b': { bg: 'hsl(271 81% 56%)', text: 'hsl(0 0% 100%)', border: 'hsl(271 81% 70%)' },
  'folk': { bg: 'hsl(120 48% 47%)', text: 'hsl(0 0% 100%)', border: 'hsl(120 48% 60%)' },
  'blues': { bg: 'hsl(210 79% 46%)', text: 'hsl(0 0% 100%)', border: 'hsl(210 79% 60%)' },
  'punk': { bg: 'hsl(0 79% 63%)', text: 'hsl(0 0% 100%)', border: 'hsl(0 79% 75%)' },
  'metal': { bg: 'hsl(0 0% 20%)', text: 'hsl(0 0% 100%)', border: 'hsl(0 0% 35%)' },
  'reggae': { bg: 'hsl(88 50% 53%)', text: 'hsl(0 0% 100%)', border: 'hsl(88 50% 65%)' },
  'alternative': { bg: 'hsl(280 100% 70%)', text: 'hsl(0 0% 100%)', border: 'hsl(280 100% 80%)' }
};

interface ConcertCardProps {
  artist: string;
  venue: string;
  date: string;
  location: string;
  price: string;
  image: string;
  genres?: string[];
  ticketUrl?: string;
  description?: string;
}

export const ConcertCard = ({ 
  artist, 
  venue, 
  date, 
  location, 
  price, 
  image, 
  genres = [],
  ticketUrl,
  description 
}: ConcertCardProps) => {
  const handleTicketClick = () => {
    if (ticketUrl) {
      window.open(ticketUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="group bg-gradient-card rounded-xl p-6 shadow-card hover:shadow-glow transition-smooth hover:scale-[1.02] border border-border">
      <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
        <img 
          src={image} 
          alt={`${artist} concert`} 
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {price === "FREE" && (
          <div className="absolute top-3 right-3 free-badge">
            FREE
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-smooth">
            {artist}
          </h3>
          <p className="text-muted-foreground font-medium">{venue}</p>
        </div>
        
        {/* Genres with color coding */}
        {genres.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {genres.slice(0, 2).map((genre) => {
              const genreKey = genre.toLowerCase().replace(/\s+/g, '-');
              const colors = genreColors[genreKey] || { bg: 'hsl(var(--muted))', text: 'hsl(var(--muted-foreground))' };
              
              return (
                <Badge
                  key={genre}
                  variant="outline"
                  className="text-xs border-0 font-medium"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    borderColor: colors.border || colors.bg
                  }}
                >
                  {genre}
                </Badge>
              );
            })}
            {genres.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{genres.length - 2} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${price === "FREE" ? "text-accent" : "text-foreground"}`}>
              {price}
            </span>
          </div>
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        
        <Button 
          className="w-full" 
          variant={price === "FREE" ? "accent" : "outline"}
          onClick={handleTicketClick}
          disabled={!ticketUrl}
        >
          {ticketUrl ? (
            <>
              {price === "FREE" ? "Get Free Tickets" : "Get Tickets"}
              <ExternalLink className="h-4 w-4 ml-2" />
            </>
          ) : (
            "Tickets TBA"
          )}
        </Button>
      </div>
    </div>
  );
};