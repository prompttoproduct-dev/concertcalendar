// Centralized API service for external concert data
import { type Concert, type Venue } from '@/lib/supabase'

export interface ExternalConcert {
  external_id: string
  artist: string
  date: string
  time?: string
  price: string
  genres: string[]
  description?: string
  ticket_url?: string
  image_url?: string
  source: 'ticketmaster' | 'eventbrite'
  venue_name?: string
  venue_address?: string
}

export interface ApiResponse<T> {
  data: T
  pagination?: {
    page: number
    size: number
    totalElements: number
    totalPages: number
    hasMore?: boolean
  }
  error?: string
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  }

  async fetchTicketmasterEvents(params: {
    city?: string
    stateCode?: string
    keyword?: string
    genreId?: string
    size?: number
    page?: number
  }): Promise<ApiResponse<ExternalConcert[]>> {
    try {
      const searchParams = new URLSearchParams()
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/ticketmaster/events?${searchParams.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch Ticketmaster events')
      }

      const data = await response.json()
      
      return {
        data: data.events || [],
        pagination: data.pagination
      }
    } catch (error) {
      console.error('Ticketmaster API service error:', error)
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async fetchEventbriteEvents(params: {
    location?: string
    q?: string
    categories?: string
    subcategories?: string
    price?: 'free' | 'paid'
    page?: number
  }): Promise<ApiResponse<ExternalConcert[]>> {
    try {
      const searchParams = new URLSearchParams()
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/eventbrite/events?${searchParams.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch Eventbrite events')
      }

      const data = await response.json()
      
      return {
        data: data.events || [],
        pagination: data.pagination
      }
    } catch (error) {
      console.error('Eventbrite API service error:', error)
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async searchAllSources(params: {
    query?: string
    genre?: string
    location?: string
    priceRange?: 'free' | 'under-25' | 'under-50' | 'over-50'
    page?: number
  }): Promise<ApiResponse<ExternalConcert[]>> {
    try {
      // Fetch from both sources in parallel
      const [ticketmasterResult, eventbriteResult] = await Promise.allSettled([
        this.fetchTicketmasterEvents({
          keyword: params.query,
          city: params.location || 'New York',
          stateCode: 'NY',
          page: params.page || 0,
          size: 20
        }),
        this.fetchEventbriteEvents({
          q: params.query,
          location: params.location || 'New York, NY',
          price: params.priceRange === 'free' ? 'free' : 'paid',
          page: params.page || 1
        })
      ])

      const allEvents: ExternalConcert[] = []
      let totalElements = 0

      // Combine results from both sources
      if (ticketmasterResult.status === 'fulfilled' && ticketmasterResult.value.data) {
        allEvents.push(...ticketmasterResult.value.data)
        totalElements += ticketmasterResult.value.pagination?.totalElements || 0
      }

      if (eventbriteResult.status === 'fulfilled' && eventbriteResult.value.data) {
        allEvents.push(...eventbriteResult.value.data)
        totalElements += eventbriteResult.value.pagination?.totalElements || 0
      }

      // Filter by genre if specified
      let filteredEvents = allEvents
      if (params.genre) {
        filteredEvents = allEvents.filter(event => 
          event.genres.some(genre => 
            genre.toLowerCase().includes(params.genre!.toLowerCase())
          )
        )
      }

      // Filter by price range if specified
      if (params.priceRange && params.priceRange !== 'free') {
        filteredEvents = filteredEvents.filter(event => {
          if (event.price === 'free') return false
          
          const price = parseFloat(event.price)
          switch (params.priceRange) {
            case 'under-25':
              return price < 25
            case 'under-50':
              return price < 50
            case 'over-50':
              return price >= 50
            default:
              return true
          }
        })
      }

      // Sort by date
      filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      return {
        data: filteredEvents,
        pagination: {
          page: params.page || 1,
          size: filteredEvents.length,
          totalElements: filteredEvents.length,
          totalPages: Math.ceil(filteredEvents.length / 20),
          hasMore: false
        }
      }
    } catch (error) {
      console.error('Multi-source API search error:', error)
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to search events'
      }
    }
  }
}

export const apiService = new ApiService()