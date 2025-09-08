import * as React from "react"
import { Check, ChevronDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type SortOption = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'artist-asc' | 'artist-desc'

interface SortDropdownProps {
  value?: SortOption
  onChange: (value: SortOption) => void
  className?: string
}

const sortOptions: { value: SortOption; label: string; description: string }[] = [
  { value: 'date-asc', label: 'Date (Earliest First)', description: 'Upcoming concerts first' },
  { value: 'date-desc', label: 'Date (Latest First)', description: 'Future concerts first' },
  { value: 'price-asc', label: 'Price (Low to High)', description: 'Cheapest concerts first' },
  { value: 'price-desc', label: 'Price (High to Low)', description: 'Premium concerts first' },
  { value: 'artist-asc', label: 'Artist (A-Z)', description: 'Alphabetical order' },
  { value: 'artist-desc', label: 'Artist (Z-A)', description: 'Reverse alphabetical' }
]

export const SortDropdown = ({ value = 'date-asc', onChange, className }: SortDropdownProps) => {
  const selectedOption = sortOptions.find(option => option.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-between min-w-[200px]", className)}
        >
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span>{selectedOption?.label || 'Sort by'}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </div>
            {value === option.value && (
              <Check className="h-4 w-4 text-accent" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}