import { Concert } from "@/lib/supabase"

interface TicketmasterEvent {
  id: string
  name: string
  dates: {
    start: {
      localDate: string
      localTime?: string
      dateTime?: string
    }
  }
  _embedded?: {
    venues?: Array<{
      name: string
      address?: {
        line1?: string
      }
      city?: {
        name: string
      }
      state?: {
        name: string
      }
    }>
    attractions?: Array<{
      name: string
      classifications?: Array<{
        genre?: {
          name: string
        }
        subGenre?: {
          name: string
        }
      }>
    }>
  }
  priceRanges?: Array<{
    min: number
    max: number
  }>
  url?: string
  images?: Array<{
    url: string
    width: number
    height: number
  }>
}

interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[]
  }
  page: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

export class TicketmasterClient {
  private apiKey: string
  private baseUrl = 'https://app.ticketmaster.com/discovery/v2'

  constructor(apiKey: string) {
    this.apiKey = apiKey
    if (!apiKey) {
      throw new Error('Ticketmaster API key is required')
    }
  }

  async searchEvents(params: {
    city?: string
    stateCode?: string
    keyword?: string
    genreId?: string
    size?: number
    page?: number
    startDateTime?: string
    endDateTime?: string
  }): Promise<TicketmasterResponse> {
    const searchParams = new URLSearchParams({
      apikey: this.apiKey,
      city: params.city || 'New York',
      stateCode: params.stateCode || 'NY',
      size: (params.size || 200).toString(),
      page: (params.page || 0).toString(),
    })

    if (params.keyword) {
      searchParams.append('keyword', params.keyword)
    }

    if (params.genreId) {
      searchParams.append('genreId', params.genreId)
    }

    if (params.startDateTime) {
      searchParams.append('startDateTime', params.startDateTime)
    }

    if (params.endDateTime) {
      searchParams.append('endDateTime', params.endDateTime)
    }

    const response = await fetch(
      `${this.baseUrl}/events.json?${searchParams.toString()}`
    )

    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getGenres(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/classifications/genres.json?apikey=${this.apiKey}`
    )

    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`)
    }

    return response.json()
  }

  // Convert Ticketmaster event to our Concert format
  transformEvent(event: TicketmasterEvent): Partial<Concert> {
    const venue = event._embedded?.venues?.[0]
    const attraction = event._embedded?.attractions?.[0]
    const image = event.images?.find(img => img.width >= 400) || event.images?.[0]

    // Use attraction name as artist, fallback to event name
    const artist = attraction?.name || event.name

    // Extract time from localTime or dateTime
    let time: string | undefined
    if (event.dates.start.localTime) {
      time = event.dates.start.localTime
    } else if (event.dates.start.dateTime) {
      const dateTime = new Date(event.dates.start.dateTime)
      time = dateTime.toTimeString().split(' ')[0] // HH:MM:SS format
    }

    return {
      external_id: event.id,
      title: event.name,
      artist: artist,
      venue: venue?.name || 'TBA',
      date: event.dates.start.localDate,
      time: time,
      price: event.priceRanges?.[0]?.min || 0,
      image_url: image?.url,
      source: 'ticketmaster'
    }
  }
}

// Create client instance with environment variable
export const getTicketmasterClient = (): TicketmasterClient => {
  const apiKey = import.meta.env.VITE_TICKETMASTER_API_KEY
  if (!apiKey) {
    throw new Error('VITE_TICKETMASTER_API_KEY environment variable not set')
  }
  return new TicketmasterClient(apiKey)
}