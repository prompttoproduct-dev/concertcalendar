import { useQuery } from '@tanstack/react-query'
import { apiService, type ExternalConcert } from '@/lib/api-service'

export interface ExternalSearchFilters {
  query?: string
  genre?: string
  location?: string
  priceRange?: 'free' | 'under-25' | 'under-50' | 'over-50'
  page?: number
}

// Hook for searching external APIs (Ticketmaster + Eventbrite)
export const useExternalConcerts = (filters: ExternalSearchFilters) => {
  return useQuery({
    queryKey: ['external-concerts', filters],
    queryFn: () => apiService.searchAllSources(filters),
    enabled: Object.keys(filters).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Hook for Ticketmaster events only
export const useTicketmasterEvents = (params: {
  city?: string
  keyword?: string
  genreId?: string
  page?: number
}) => {
  return useQuery({
    queryKey: ['ticketmaster-events', params],
    queryFn: () => apiService.fetchTicketmasterEvents(params),
    enabled: Object.keys(params).length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

// Hook for Eventbrite events only
export const useEventbriteEvents = (params: {
  location?: string
  q?: string
  price?: 'free' | 'paid'
  page?: number
}) => {
  return useQuery({
    queryKey: ['eventbrite-events', params],
    queryFn: () => apiService.fetchEventbriteEvents(params),
    enabled: Object.keys(params).length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}