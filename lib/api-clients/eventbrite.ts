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

export class EventbriteClient {
  private apiKey: string
  private baseUrl = 'https://www.eventbriteapi.com/v3'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async searchEvents(params: {
    location?: string
    q?: string
    categories?: string
    subcategories?: string
    price?: 'free' | 'paid'
    page?: number
  }): Promise<EventbriteResponse> {
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

    const response = await fetch(
      `${this.baseUrl}/events/search/?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status}`)
    }

    return response.json()
  }

  async getCategories(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/categories/`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status}`)
    }

    return response.json()
  }

  // Convert Eventbrite event to our Concert format
  transformEvent(event: EventbriteEvent): Partial<Concert> {
    const startDate = new Date(event.start.local)
    const genres = [] // Eventbrite doesn't provide detailed genre info
    
    // Determine if event is free
    const isFree = !event.ticket_availability?.has_available_tickets || 
                   event.ticket_availability?.minimum_ticket_price?.major_value === 0
    
    const price = isFree ? 'free' : event.ticket_availability?.minimum_ticket_price?.major_value || 0

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

export const eventbriteClient = new EventbriteClient(
  process.env.EVENTBRITE_API_KEY || ''
)