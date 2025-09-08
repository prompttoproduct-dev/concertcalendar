import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { type SearchSuggestion } from '@/components/ui/search-autocomplete'

// Hook for search suggestions with debouncing
export const useSearchSuggestions = (query: string, debounceMs = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Fetch suggestions from database
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return []
      }

      const searchTerm = `%${debouncedQuery}%`
      
      // Search artists, venues, and genres in parallel
      const [artistResults, venueResults] = await Promise.all([
        // Search artists
        supabase
          .from('concerts')
          .select('artist')
          .ilike('artist', searchTerm)
          .limit(5),
        
        // Search event titles
        supabase
          .from('concerts')
          .select('title')
          .ilike('title', searchTerm)
          .limit(5)
      ])

      const suggestions: SearchSuggestion[] = []

      // Add artist suggestions
      if (artistResults.data) {
        const uniqueArtists = [...new Set(artistResults.data.map(c => c.artist))]
        uniqueArtists.forEach(artist => {
          suggestions.push({
            id: `artist-${artist}`,
            label: artist,
            category: 'artist',
            description: 'Artist'
          })
        })
      }

      // Add event title suggestions
      if (venueResults.data) {
        const uniqueTitles = [...new Set(venueResults.data.map(c => c.title).filter(Boolean))]
        uniqueTitles.forEach(title => {
          suggestions.push({
            id: `event-${title}`,
            label: title,
            category: 'event',
            description: 'Event'
          })
        })
      }

      return suggestions.slice(0, 10) // Limit to 10 suggestions
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    suggestions,
    isLoading: isLoading && debouncedQuery.length >= 2
  }
}