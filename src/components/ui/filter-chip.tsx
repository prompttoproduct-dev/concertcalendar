import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const filterChipVariants = cva(
  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-smooth cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground hover:bg-muted/80",
        active: "bg-primary text-primary-foreground hover:bg-primary/90",
        tonight: "bg-gradient-primary text-primary-foreground hover:opacity-90",
        weekend: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        free: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent-glow"
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface FilterChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof filterChipVariants> {
  removable?: boolean;
  onRemove?: () => void;
  count?: number;
}

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, variant, size, children, removable, onRemove, count, ...props }, ref) => {
    return (
      <button
        className={cn(filterChipVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <span>{children}</span>
        {count !== undefined && (
          <span className="bg-background/20 text-xs px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
        {removable && onRemove && (
          <X
            className="h-3 w-3 hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          />
        )}
      </button>
    );
  }
);

FilterChip.displayName = "FilterChip";

export { FilterChip, filterChipVariants };