import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export type PriceRange = 'free' | '0-35' | '35-50' | '50-100' | '100+';

const priceRanges: { value: PriceRange; label: string; description?: string }[] = [
  { value: 'free', label: 'Free', description: 'No cost' },
  { value: '0-35', label: '$0–35', description: 'Budget-friendly' },
  { value: '35-50', label: '$35–50', description: 'Mid-range' },
  { value: '50-100', label: '$50–100', description: 'Premium' },
  { value: '100+', label: '$100+', description: 'Exclusive' },
];

interface PriceFilterProps {
  value?: PriceRange;
  onChange: (value: PriceRange | undefined) => void;
  className?: string;
}

export const PriceFilter = React.forwardRef<
  HTMLDivElement,
  PriceFilterProps
>(({ value, onChange, className }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Price Range</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {priceRanges.map((range) => {
          const isSelected = value === range.value;
          
          return (
            <Button
              key={range.value}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              onClick={() => onChange(isSelected ? undefined : range.value)}
              className={cn(
                "justify-between h-auto py-3 px-4",
                isSelected && "bg-accent shadow-accent-glow",
                !isSelected && "hover:bg-muted/50"
              )}
            >
              <div className="flex flex-col items-start">
                <span className={cn(
                  "font-medium",
                  range.value === 'free' && "text-accent-glow",
                  isSelected && "text-accent-foreground"
                )}>
                  {range.label}
                </span>
                {range.description && (
                  <span className={cn(
                    "text-xs text-muted-foreground",
                    isSelected && "text-accent-foreground/70"
                  )}>
                    {range.description}
                  </span>
                )}
              </div>
              
              {range.value === 'free' && (
                <div className="h-2 w-2 rounded-full bg-accent-glow animate-pulse" />
              )}
            </Button>
          );
        })}
      </div>
      
      {value && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(undefined)}
          className="w-full mt-3 text-xs"
        >
          Clear price filter
        </Button>
      )}
    </div>
  );
});

PriceFilter.displayName = "PriceFilter";

export { priceRanges };