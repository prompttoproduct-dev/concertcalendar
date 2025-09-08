import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { concertQueries, type Concert } from '@/lib/supabase'
import { supabase } from '@/integrations/supabase/client'

// Hook for getting all concerts
export const useConcerts = () => {
  return useQuery({
    queryKey: ['concerts'],
    queryFn: concertQueries.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for searching concerts by text
export const useSearchConcerts = (query: string) => {
  return useQuery({
    queryKey: ['concerts', 'search', query],
    queryFn: () => concertQueries.search(query),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook for getting concerts by date
export const useConcertsByDate = (date: string) => {
  return useQuery({
    queryKey: ['concerts', 'date', date],
    queryFn: () => concertQueries.getByDate(date),
    enabled: !!date,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook for getting concerts by date range
export const useConcertsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['concerts', 'dateRange', startDate, endDate],
    queryFn: () => concertQueries.getByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
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