import * as React from "react"
import { Clock, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type RecentSearch } from "@/hooks/useRecentSearches"

interface RecentSearchesProps {
  searches: RecentSearch[]
  onSelect: (search: RecentSearch) => void
  onRemove: (id: string) => void
  onClear: () => void
  className?: string
}

export const RecentSearches = ({ 
  searches, 
  onSelect, 
  onRemove, 
  onClear, 
  className 
}: RecentSearchesProps) => {
  if (searches.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Recent Searches</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>

      <ScrollArea className="max-h-40">
        <div className="space-y-1">
          {searches.map((search) => (
            <div
              key={search.id}
              className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <button
                onClick={() => onSelect(search)}
                className="flex items-center gap-2 flex-1 text-left min-w-0"
              >
                <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {search.displayName}
                </span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(search.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}