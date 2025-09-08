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
        
        // Search venues
        supabase
          .from('venues')
          .select('name, borough')
          .ilike('name', searchTerm)
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

      // Add venue suggestions
      if (venueResults.data) {
        venueResults.data.forEach(venue => {
          suggestions.push({
            id: `venue-${venue.name}`,
            label: venue.name,
            category: 'venue',
            description: `Venue in ${venue.borough?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
          })
        })
      }

      // Add genre suggestions
      const genres = [
        'indie rock', 'electronic', 'jazz', 'hip-hop', 'folk', 'experimental',
        'metal', 'pop', 'classical', 'punk', 'r&b', 'blues', 'reggae', 'alternative'
      ]
      
      const matchingGenres = genres.filter(genre => 
        genre.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
      
      matchingGenres.forEach(genre => {
        suggestions.push({
          id: `genre-${genre}`,
          label: genre,
          category: 'genre',
          description: 'Music genre'
        })
      })

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