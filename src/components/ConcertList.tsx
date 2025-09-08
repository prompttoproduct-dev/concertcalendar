import { ConcertCard } from "@/components/ConcertCard";
import { Skeleton } from "@/components/ui/skeleton";
import { type Concert } from "@/lib/supabase";

interface ConcertListProps {
  concerts: Concert[];
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  className?: string;
}

const ConcertCardSkeleton = () => (
  <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border animate-pulse">
    <div className="aspect-video bg-muted rounded-lg mb-4" />
    <div className="space-y-3">
      <div className="h-6 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
      <div className="h-10 bg-muted rounded w-full" />
    </div>
  </div>
);

export const ConcertList = ({ 
  concerts, 
  isLoading = false, 
  error, 
  emptyMessage = "No concerts found",
  className 
}: ConcertListProps) => {
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive mb-2">Error loading concerts</div>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ConcertCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!concerts || concerts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No concerts found</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {concerts.map((concert) => (
        <ConcertCard
          key={concert.id}
          artist={concert.artist}
          venue={concert.venue?.name || 'TBA'}
          date={new Date(concert.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
          location={`${concert.venue?.borough?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'NYC'}, NY`}
          price={concert.price === 'free' ? 'FREE' : `$${concert.price}`}
          image={concert.image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80`}
          genres={concert.genres}
          ticketUrl={concert.ticket_url}
          description={concert.description}
        />
      ))}
    </div>
  );
};