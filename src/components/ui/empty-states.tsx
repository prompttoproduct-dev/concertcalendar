import React from "react";
import { Search, Calendar, MapPin, Music, Plus, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "accent";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className
}: EmptyStateProps) => (
  <div className={cn("text-center py-12 px-6 max-w-md mx-auto", className)}>
    {icon && (
      <div className="mb-6 flex justify-center">
        <div className="p-4 bg-muted rounded-full text-muted-foreground">
          {icon}
        </div>
      </div>
    )}
    
    <h3 className="text-h2 text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
    
    {action && (
      <div className="space-y-3">
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          className="w-full"
        >
          {action.label}
        </Button>
        
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            className="w-full"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    )}
  </div>
);

// Pre-configured empty states for common scenarios
export const NoSearchResults = ({ 
  onClearFilters, 
  onBrowseAll,
  className 
}: { 
  onClearFilters?: () => void;
  onBrowseAll?: () => void;
  className?: string;
}) => (
  <EmptyState
    icon={<Search className="h-8 w-8" />}
    title="No concerts found"
    description="We couldn't find any concerts matching your search criteria. Try adjusting your filters or search terms."
    action={onClearFilters ? {
      label: "Clear Filters",
      onClick: onClearFilters,
      variant: "accent"
    } : undefined}
    secondaryAction={onBrowseAll ? {
      label: "Browse All Concerts",
      onClick: onBrowseAll
    } : undefined}
    className={className}
  />
);

export const NoUpcomingConcerts = ({ 
  onExploreGenres,
  onSetAlert,
  className 
}: { 
  onExploreGenres?: () => void;
  onSetAlert?: () => void;
  className?: string;
}) => (
  <EmptyState
    icon={<Calendar className="h-8 w-8" />}
    title="No upcoming concerts"
    description="There are no concerts scheduled in the next few days. Check back later or explore different dates and genres."
    action={onExploreGenres ? {
      label: "Explore Genres",
      onClick: onExploreGenres
    } : undefined}
    secondaryAction={onSetAlert ? {
      label: "Set Alert",
      onClick: onSetAlert
    } : undefined}
    className={className}
  />
);

export const NoNearbyVenues = ({ 
  onExpandSearch,
  onAddVenue,
  className 
}: { 
  onExpandSearch?: () => void;
  onAddVenue?: () => void;
  className?: string;
}) => (
  <EmptyState
    icon={<MapPin className="h-8 w-8" />}
    title="No venues nearby"
    description="We couldn't find any venues in your current location. Try expanding your search radius or exploring other areas."
    action={onExpandSearch ? {
      label: "Expand Search",
      onClick: onExpandSearch
    } : undefined}
    secondaryAction={onAddVenue ? {
      label: "Suggest a Venue",
      onClick: onAddVenue
    } : undefined}
    className={className}
  />
);

export const NoFavoriteConcerts = ({ 
  onDiscoverConcerts,
  className 
}: { 
  onDiscoverConcerts?: () => void;
  className?: string;
}) => (
  <EmptyState
    icon={<Music className="h-8 w-8" />}
    title="No favorite concerts yet"
    description="Start building your concert collection by exploring and favoriting shows you're interested in."
    action={onDiscoverConcerts ? {
      label: "Discover Concerts",
      onClick: onDiscoverConcerts,
      variant: "accent"
    } : undefined}
    className={className}
  />
);

export const NetworkError = ({ 
  onRetry,
  onRefresh,
  className 
}: { 
  onRetry?: () => void;
  onRefresh?: () => void;
  className?: string;
}) => (
  <EmptyState
    icon={<RefreshCw className="h-8 w-8" />}
    title="Connection problem"
    description="We're having trouble loading the latest concert information. Check your connection and try again."
    action={onRetry ? {
      label: "Try Again",
      onClick: onRetry,
      variant: "accent"
    } : undefined}
    secondaryAction={onRefresh ? {
      label: "Refresh Page",
      onClick: onRefresh
    } : undefined}
    className={className}
  />
);

export const LoadingError = ({ 
  onRetry,
  className 
}: { 
  onRetry?: () => void;
  className?: string;
}) => (
  <EmptyState
    icon={<RefreshCw className="h-8 w-8" />}
    title="Something went wrong"
    description="We encountered an error while loading the content. Please try again or contact support if the problem persists."
    action={onRetry ? {
      label: "Retry",
      onClick: onRetry
    } : undefined}
    className={className}
  />
);