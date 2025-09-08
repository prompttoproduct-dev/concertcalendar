import { z } from 'zod'

// Webhook payload validation schemas
export const ticketmasterWebhookSchema = z.object({
  event_type: z.enum(['event.created', 'event.updated', 'event.cancelled']),
  data: z.object({
    id: z.string(),
    name: z.string().max(500),
    dates: z.object({
      start: z.object({
        localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        localTime: z.string().optional(),
      }),
    }),
    _embedded: z.object({
      venues: z.array(z.object({
        name: z.string().max(200),
        address: z.object({
          line1: z.string().max(200).optional(),
        }).optional(),
        city: z.object({
          name: z.string().max(100),
        }).optional(),
      })).optional(),
      attractions: z.array(z.object({
        name: z.string().max(200),
        classifications: z.array(z.object({
          genre: z.object({
            name: z.string().max(100),
          }).optional(),
        })).optional(),
      })).optional(),
    }).optional(),
    priceRanges: z.array(z.object({
      min: z.number().min(0).max(10000),
      max: z.number().min(0).max(10000),
    })).optional(),
    url: z.string().url().optional(),
  }),
  timestamp: z.string(),
})

export const eventbriteWebhookSchema = z.object({
  api_url: z.string().url().optional(),
  config: z.object({
    object: z.object({
      id: z.string(),
      name: z.object({
        text: z.string().max(500),
      }),
      start: z.object({
        local: z.string(),
      }),
      venue: z.object({
        name: z.string().max(200),
        address: z.object({
          address_1: z.string().max(200).optional(),
          city: z.string().max(100).optional(),
        }).optional(),
      }).optional(),
      ticket_availability: z.object({
        has_available_tickets: z.boolean(),
      }).optional(),
    }),
  }),
})

// Search input validation
export const searchQuerySchema = z.object({
  query: z.string().max(100).regex(/^[a-zA-Z0-9\s\-\.,!?]+$/),
  genre: z.string().max(50).regex(/^[a-zA-Z\s\-]+$/).optional(),
  location: z.string().max(100).regex(/^[a-zA-Z\s\-,\.]+$/).optional(),
  priceRange: z.enum(['free', 'under-25', 'under-50', 'over-50']).optional(),
  page: z.number().min(0).max(100).optional(),
})

// API key validation
export const apiKeySchema = z.string().min(20).max(200).regex(/^[a-zA-Z0-9\-_]+$/)

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>\"'%;()&+]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 500) // Limit length
}

export function validateWebhookHeaders(headers: Record<string, string>, source: 'ticketmaster' | 'eventbrite'): boolean {
  const requiredHeaders = source === 'ticketmaster' 
    ? ['x-ticketmaster-signature', 'content-type']
    : ['x-eventbrite-signature', 'content-type']
  
  return requiredHeaders.every(header => header in headers)
}