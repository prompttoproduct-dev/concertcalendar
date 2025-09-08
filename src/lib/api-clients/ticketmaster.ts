import { Concert } from "@/lib/supabase"
import { EnvironmentValidator } from "../../../lib/security/environment"

interface TicketmasterEvent {
  id: string;
  name: string;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      address?: {
        line1?: string;
      };
      city?: {
        name: string;
      };
      state?: {
        name: string;
      };
    }>;
    attractions?: Array<{
      name: string;
      classifications?: Array<{
        genre?: {
          name: string;
        };
        subGenre?: {
          name: string;
        };
      }>;
    }>;
  };
  priceRanges?: Array<{
    min: number;
    max: number;
  }>;
  url?: string;
  images?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export class TicketmasterClient {
  private apiKey: string;
  private baseUrl = 'https://app.ticketmaster.com/discovery/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchEvents(params: {
    city?: string;
    stateCode?: string;
    keyword?: string;
    genreId?: string;
    size?: number;
    page?: number;
  }): Promise<TicketmasterResponse> {
    const searchParams = new URLSearchParams({
      apikey: this.apiKey,
      city: params.city || 'New York',
      stateCode: params.stateCode || 'NY',
      size: (params.size || 20).toString(),
      page: (params.page || 0).toString(),
    });

    if (params.keyword) {
      searchParams.append('keyword', params.keyword);
    }

    if (params.genreId) {
      searchParams.append('genreId', params.genreId);
    }

    const response = await fetch(
      `${this.baseUrl}/events.json?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }

    return response.json();
  }

  async getGenres(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/classifications/genres.json?apikey=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }

    return response.json();
  }

  // Convert Ticketmaster event to our Concert format
  transformEvent(event: TicketmasterEvent): Partial<Concert> {
    const venue = event._embedded?.venues?.[0];
    const attraction = event._embedded?.attractions?.[0];
    const genres = attraction?.classifications?.map(c => 
      [c.genre?.name, c.subGenre?.name].filter(Boolean).join(' - ')
    ).filter(Boolean) || [];

    const image = event.images?.find(img => img.width >= 400) || event.images?.[0];

    return {
      external_id: event.id,
      artist: attraction?.name || event.name,
      date: event.dates.start.localDate,
      time: event.dates.start.localTime,
      price: event.priceRanges?.[0]?.min?.toString() || 'free',
      genres,
      ticket_url: event.url,
      image_url: image?.url,
      source: 'ticketmaster',
      description: `${event.name} at ${venue?.name || 'TBA'}`
    };
  }
}

export const ticketmasterClient = new TicketmasterClient(
  process.env.TICKETMASTER_API_KEY || ''
);