import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ExternalLink, Clock } from "lucide-react";

interface ConcertCardProps {
  artist: string;
  venue: string;
  date: string;
  time?: string;
  price: number;
  ticketUrl?: string;
}

export const ConcertCard = ({ 
  artist, 
  venue, 
  date, 
  time,
  price, 
  ticketUrl
}: ConcertCardProps) => {
  const handleTicketClick = () => {
    if (ticketUrl) {
      window.open(ticketUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="group bg-gradient-card rounded-xl p-6 shadow-card hover:shadow-glow transition-smooth hover:scale-[1.02] border border-border">
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-smooth">
            {artist}
          </h3>
          <p className="text-muted-foreground font-medium">{venue}</p>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{venue}</span>
          </div>
          {time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-accent">
              ${price}
            </span>
          </div>
        </div>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={handleTicketClick}
          disabled={!ticketUrl}
        >
          {ticketUrl ? (
            <>
              Get Tickets
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