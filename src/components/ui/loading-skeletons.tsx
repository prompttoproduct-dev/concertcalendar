import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

export const ConcertCardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-gradient-card rounded-xl p-6 border border-border", className)}>
    {/* Image skeleton */}
    <Skeleton className="aspect-video rounded-lg mb-4" />
    
    {/* Content skeletons */}
    <div className="space-y-3">
      {/* Title and venue */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Genre chips */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Details */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      
      {/* Description */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      
      {/* Button */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

export const SearchBarSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-4", className)}>
    <Skeleton className="h-12 w-full rounded-lg" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
      <Skeleton className="h-8 w-16 rounded-full" />
    </div>
  </div>
);

export const ConcertListSkeleton = ({ 
  count = 6, 
  className 
}: { 
  count?: number; 
  className?: string; 
}) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <ConcertCardSkeleton key={i} />
    ))}
  </div>
);

export const FilterChipSkeleton = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-8 w-16 rounded-full", className)} />
);

export const NavigationSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-between p-4", className)}>
    <Skeleton className="h-8 w-32" />
    <div className="flex gap-4">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export const HeroSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("text-center space-y-6 py-16", className)}>
    <Skeleton className="h-12 w-3/4 mx-auto" />
    <Skeleton className="h-6 w-1/2 mx-auto" />
    <div className="flex justify-center gap-4">
      <Skeleton className="h-12 w-32 rounded-lg" />
      <Skeleton className="h-12 w-32 rounded-lg" />
    </div>
  </div>
);