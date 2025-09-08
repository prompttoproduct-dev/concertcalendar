import { type Concert } from '@/lib/supabase'

interface EventbriteEvent {
  id: string
  name: {
    text: string
  }
  description?: {
    text: string
  }
  start: {
    timezone: string
    local: string
    utc: string
  }
  end: {
    timezone: string
    local: string
    utc: string
  }
  venue?: {
    name: string
    address: {
      address_1?: string
      city?: string
      region?: string
    }
  }
  ticket_availability?: {
    has_available_tickets: boolean
    minimum_ticket_price?: {
      major_value: number
      currency: string
    }
  }
  logo?: {
    url: string
  }
  url: string
  category_id?: string
  subcategory_id?: string
}

interface EventbriteResponse {
  events: EventbriteEvent[]
  pagination: {
    object_count: number
    page_number: number
    page_size: number
    page_count: number
    has_more_items: boolean
  }
}

// Error classes for better error handling
export class EventbriteApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message)
    this.name = 'EventbriteApiError'
  }
}

export class EventbriteRateLimitError extends EventbriteApiError {
  constructor(endpoint: string) {
    super('Eventbrite API rate limit exceeded', 429, endpoint)
    this.name = 'EventbriteRateLimitError'
  }
}

export class EventbriteClient {
  private apiKey: string
  private baseUrl = 'https://www.eventbriteapi.com/v3'
  private requestCount = 0
  private lastResetTime = Date.now()
  private readonly RATE_LIMIT = 1000 // 1000 requests per hour
  private readonly RATE_WINDOW = 60 * 60 * 1000 // 1 hour

  constructor(apiKey: string) {
    this.apiKey = apiKey
    if (!apiKey) {
      throw new Error('Eventbrite API key is required')
    }
  }

  private checkRateLimit(): void {
    const now = Date.now()
    if (now - this.lastResetTime > this.RATE_WINDOW) {
      this.requestCount = 0
      this.lastResetTime = now
    }

    if (this.requestCount >= this.RATE_LIMIT) {
      throw new EventbriteRateLimitError('rate limit exceeded')
    }

    this.requestCount++
  }

  private async makeRequest(url: string): Promise<any> {
    this.checkRateLimit()

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new EventbriteRateLimitError(url)
      }
      throw new EventbriteApiError(
        `Eventbrite API error: ${response.status} ${response.statusText}`,
        response.status,
        url
      )
    }

    return response.json()
  }

  async searchEvents(params: {
    location?: string
    q?: string
    categories?: string
    subcategories?: string
    price?: 'free' | 'paid'
    page?: number
  }): Promise<EventbriteResponse> {
    if (!this.apiKey) {
      throw new EventbriteApiError('API key not configured', 401, 'searchEvents')
    }

    const searchParams = new URLSearchParams({
      'location.address': params.location || 'New York, NY',
      expand: 'venue,ticket_availability,category,subcategory',
      page: (params.page || 1).toString(),
    })

    if (params.q) {
      searchParams.append('q', params.q)
    }

    if (params.categories) {
      searchParams.append('categories', params.categories)
    }

    if (params.subcategories) {
      searchParams.append('subcategories', params.subcategories)
    }

    if (params.price) {
      searchParams.append('price', params.price)
    }

    const url = `${this.baseUrl}/events/search/?${searchParams.toString()}`
    return this.makeRequest(url)
  }

  async getCategories(): Promise<any> {
    if (!this.apiKey) {
      throw new EventbriteApiError('API key not configured', 401, 'getCategories')
    }

    const url = `${this.baseUrl}/categories/`
    return this.makeRequest(url)
  }

  transformEvent(event: EventbriteEvent): Partial<Concert> {
    if (!event || !event.id) {
      throw new Error('Invalid event data provided to transformEvent')
    }

    if (!event.start?.local) {
      throw new Error(`Event ${event.id} missing required start date information`)
    }

    const startDate = new Date(event.start.local)
    const genres = [] // Eventbrite doesn't provide detailed genre info
    
    // Determine if event is free
    const isFree = !event.ticket_availability?.has_available_tickets || 
                   event.ticket_availability?.minimum_ticket_price?.major_value === 0
    
    const price = isFree ? 'free' : (event.ticket_availability?.minimum_ticket_price?.major_value?.toString() || '0')

    return {
      external_id: event.id,
      artist: event.name.text,
      date: startDate.toISOString().split('T')[0],
      time: startDate.toTimeString().split(' ')[0],
      price,
      genres,
      ticket_url: event.url,
      image_url: event.logo?.url,
      source: 'eventbrite',
      description: event.description?.text || event.name.text
    }
  }
}

// Create client instance with environment variable
let eventbriteClient: EventbriteClient | null = null

export function getEventbriteClient(): EventbriteClient {
  if (!eventbriteClient) {
    const apiKey = import.meta.env.VITE_EVENTBRITE_API_KEY
    if (!apiKey) {
      throw new EventbriteApiError('EVENTBRITE_API_KEY environment variable not set', 500, 'client-init')
    }
    eventbriteClient = new EventbriteClient(apiKey)
  }
  return eventbriteClient
}