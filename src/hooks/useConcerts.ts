import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { concertQueries, type Concert, type Venue, type Borough } from '@/lib/supabase'
import { supabase } from '@/integrations/supabase/client'

export type { Borough } from '@/lib/supabase'

export type PriceRange = 'free' | '0-35' | '35-50' | '50-100' | '100+';

export interface SearchFilters {
  query?: string
  genre?: string
  borough?: Borough
  priceRange?: PriceRange
  dateRange?: { start: string; end: string }
  sortBy?: 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'artist-asc' | 'artist-desc'
}

// Hook for getting all concerts
export const useConcerts = () => {
  return useQuery({
    queryKey: ['concerts'],
    queryFn: concertQueries.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for searching concerts
export const useSearchConcerts = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ['concerts', 'search', filters],
    queryFn: () => concertQueries.search(filters),
    enabled: Object.keys(filters).length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook for getting concerts by genre
export const useConcertsByGenre = (genre: string) => {
  return useQuery({
    queryKey: ['concerts', 'genre', genre],
    queryFn: () => concertQueries.getByGenre(genre),
    enabled: !!genre,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook for getting free concerts
export const useFreeConcerts = () => {
  return useQuery({
    queryKey: ['concerts', 'free'],
    queryFn: concertQueries.getFree,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook for getting upcoming concerts
export const useUpcomingConcerts = (limit = 20) => {
  return useQuery({
    queryKey: ['concerts', 'upcoming', limit],
    queryFn: () => concertQueries.getUpcoming(limit),
    staleTime: 2 * 60 * 1000,
  })
}

// Hook for real-time concert updates
export const useRealtimeConcerts = () => {
  const queryClient = useQueryClient()

  // Set up real-time subscription
  React.useEffect(() => {
    const subscription = supabase
      .channel('concerts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'concerts' },
        (payload) => {
          // Invalidate relevant queries when data changes
          queryClient.invalidateQueries({ queryKey: ['concerts'] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])
}