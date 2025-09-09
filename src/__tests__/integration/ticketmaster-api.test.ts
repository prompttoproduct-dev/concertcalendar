// Integration test for Ticketmaster API - makes real API calls
// This test bypasses mocks to verify actual API integration

// Unmock fetch to allow real network requests
jest.unmock('node-fetch')

import { getTicketmasterClient, TicketmasterClient } from '@/lib/api-clients/ticketmaster'

describe('Ticketmaster API Integration (Live API)', () => {
  let ticketmasterClient: TicketmasterClient

  beforeAll(() => {
    // Skip tests if API key is not available
    if (!process.env.VITE_TICKETMASTER_API_KEY) {
      console.warn('VITE_TICKETMASTER_API_KEY not set, skipping Ticketmaster integration tests')
    }
  })

  beforeEach(() => {
    if (process.env.VITE_TICKETMASTER_API_KEY) {
      ticketmasterClient = getTicketmasterClient()
    }
  })

  describe('searchEvents', () => {
    it('should fetch real events from Ticketmaster API', async () => {
      if (!process.env.VITE_TICKETMASTER_API_KEY) {
        console.log('Skipping test: API key not available')
        return
      }

      const response = await ticketmasterClient.searchEvents({
        city: 'New York',
        stateCode: 'NY',
        size: 10,
        startDateTime: '2025-09-01T00:00:00Z',
        endDateTime: '2025-09-30T23:59:59Z'
      })

      // Verify response structure
      expect(response).toBeDefined()
      expect(response.page).toBeDefined()
      expect(response.page.size).toBe(10)
      expect(response.page.totalElements).toBeGreaterThanOrEqual(0)

      // If events are found, verify their structure
      if (response._embedded?.events) {
        expect(Array.isArray(response._embedded.events)).toBe(true)
        
        const firstEvent = response._embedded.events[0]
        if (firstEvent) {
          expect(firstEvent.id).toBeDefined()
          expect(firstEvent.name).toBeDefined()
          expect(firstEvent.dates.start.localDate).toBeDefined()
          
          console.log('Sample event from API:', {
            id: firstEvent.id,
            name: firstEvent.name,
            date: firstEvent.dates.start.localDate,
            venue: firstEvent._embedded?.venues?.[0]?.name,
            price: firstEvent.priceRanges?.[0]?.min
          })
        }
      }
    }, 30000) // 30 second timeout for network request

    it('should transform Ticketmaster events correctly', async () => {
      if (!process.env.VITE_TICKETMASTER_API_KEY) {
        console.log('Skipping test: API key not available')
        return
      }

      const response = await ticketmasterClient.searchEvents({
        city: 'New York',
        stateCode: 'NY',
        size: 5,
        startDateTime: '2025-09-01T00:00:00Z',
        endDateTime: '2025-09-30T23:59:59Z'
      })

      if (response._embedded?.events && response._embedded.events.length > 0) {
        const event = response._embedded.events[0]
        const transformed = ticketmasterClient.transformEvent(event)

        // Verify transformation
        expect(transformed.external_id).toBe(event.id)
        expect(transformed.title).toBe(event.name)
        expect(transformed.artist).toBeDefined()
        expect(transformed.date).toBe(event.dates.start.localDate)
        expect(transformed.source).toBe('ticketmaster')
        expect(typeof transformed.price).toBe('number')

        console.log('Transformed concert data:', transformed)
      } else {
        console.log('No events found to transform')
      }
    }, 30000)

    it('should handle API errors gracefully', async () => {
      if (!process.env.VITE_TICKETMASTER_API_KEY) {
        console.log('Skipping test: API key not available')
        return
      }

      // Test with invalid parameters to trigger an error
      await expect(
        ticketmasterClient.searchEvents({
          city: 'InvalidCityName12345',
          stateCode: 'XX', // Invalid state code
          size: 1
        })
      ).rejects.toThrow()
    }, 30000)
  })

  describe('getGenres', () => {
    it('should fetch genre classifications from Ticketmaster', async () => {
      if (!process.env.VITE_TICKETMASTER_API_KEY) {
        console.log('Skipping test: API key not available')
        return
      }

      const response = await ticketmasterClient.getGenres()

      expect(response).toBeDefined()
      expect(response._embedded?.genres).toBeDefined()
      
      if (response._embedded?.genres) {
        expect(Array.isArray(response._embedded.genres)).toBe(true)
        
        const firstGenre = response._embedded.genres[0]
        if (firstGenre) {
          expect(firstGenre.id).toBeDefined()
          expect(firstGenre.name).toBeDefined()
          
          console.log('Sample genre from API:', {
            id: firstGenre.id,
            name: firstGenre.name
          })
        }
      }
    }, 30000)
  })
})