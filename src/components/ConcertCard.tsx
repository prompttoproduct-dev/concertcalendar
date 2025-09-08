import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

interface ConcertCardProps {
  title: string;
  artist: string;
  venue: string;
  date: string;
  time?: string;
  price: number;
  image?: string;
  ticketUrl?: string;
}

export const ConcertCard = ({ 
  title,
  artist, 
  venue, 
  date, 
  time,
  price, 
  image, 
  ticketUrl
}: ConcertCardProps) => {
  const handleTicketClick = () => {
    if (ticketUrl) {
      window.open(ticketUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'FREE' : `$${price}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="group bg-gradient-card rounded-xl p-6 shadow-card hover:shadow-glow transition-smooth hover:scale-[1.02] border border-border">
      <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
        <img 
          src={image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80`} 
          alt={`${title} concert`} 
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {price === 0 && (
          <div className="absolute top-3 right-3 free-badge">
            FREE
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-smooth">
            {title}
          </h3>
          <p className="text-muted-foreground font-medium">{artist}</p>
          <p className="text-muted-foreground text-sm">{venue}</p>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(date)}{time && ` at ${time}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>New York, NY</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${price === 0 ? "text-accent" : "text-foreground"}`}>
              {formatPrice(price)}
            </span>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          variant={price === 0 ? "accent" : "outline"}
          onClick={handleTicketClick}
          disabled={!ticketUrl}
        >
          {ticketUrl ? (
            <>
              {price === 0 ? "Get Free Tickets" : "Get Tickets"}
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