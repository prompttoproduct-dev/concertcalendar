import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SearchSuggestion {
  id: string;
  label: string;
  category?: 'artist' | 'venue' | 'genre';
  description?: string;
}

export interface SearchAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  className?: string;
  loading?: boolean;
}

const SearchAutocomplete = React.forwardRef<HTMLInputElement, SearchAutocompleteProps>(
  ({ 
    value, 
    onChange, 
    onSelect, 
    suggestions = [], 
    placeholder = "Search artists, venues, or genres...",
    className,
    loading,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
      setIsOpen(newValue.length > 0 && suggestions.length > 0);
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      setInternalValue(suggestion.label);
      onChange?.(suggestion.label);
      onSelect?.(suggestion);
      setIsOpen(false);
    };

    const clearSearch = () => {
      setInternalValue("");
      onChange?.("");
      setIsOpen(false);
    };

    const getCategoryIcon = (category?: string) => {
      switch (category) {
        case 'artist':
          return '👤';
        case 'venue':
          return '📍';
        case 'genre':
          return '🎵';
        default:
          return '🔍';
      }
    };

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={ref}
            value={internalValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(internalValue.length > 0 && suggestions.length > 0)}
            placeholder={placeholder}
            className="pl-10 pr-10"
            {...props}
          />
          {internalValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-card z-50 overflow-hidden">
            <ScrollArea className="max-h-60">
              <div className="p-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted rounded-md transition-colors group"
                  >
                    <span className="text-sm opacity-60">
                      {getCategoryIcon(suggestion.category)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm group-hover:text-accent transition-colors">
                        {suggestion.label}
                      </div>
                      {suggestion.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                    {suggestion.category && (
                      <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded-full">
                        {suggestion.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {loading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SearchAutocomplete.displayName = "SearchAutocomplete";

export { SearchAutocomplete };