import { apiService } from '@/lib/api-service'

// Mock fetch globally
global.fetch = jest.fn()

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchTicketmasterEvents', () => {
    it('should fetch events successfully', async () => {
      const mockResponse = {
        events: [
          {
            external_id: 'tm-123',
            artist: 'Test Artist',
            date: '2024-12-01',
            price: '25',
            source: 'ticketmaster'
          }
        ],
        pagination: {
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1
        }
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await apiService.fetchTicketmasterEvents({
        keyword: 'rock',
        city: 'New York'
      })

      expect(result.data).toEqual(mockResponse.events)
      expect(result.pagination).toEqual(mockResponse.pagination)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ticketmaster/events')
      )
    })

    it('should handle API errors gracefully', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      })

      const result = await apiService.fetchTicketmasterEvents({})

      expect(result.data).toEqual([])
      expect(result.error).toBe('Unauthorized')
    })

    it('should handle network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const result = await apiService.fetchTicketmasterEvents({})

      expect(result.data).toEqual([])
      expect(result.error).toBe('Network error')
    })
  })

  describe('fetchEventbriteEvents', () => {
    it('should fetch events successfully', async () => {
      const mockResponse = {
        events: [
          {
            external_id: 'eb-456',
            artist: 'Test Band',
            date: '2024-12-02',
            price: 'free',
            source: 'eventbrite'
          }
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasMore: false
        }
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await apiService.fetchEventbriteEvents({
        q: 'concert',
        location: 'New York, NY'
      })

      expect(result.data).toEqual(mockResponse.events)
      expect(result.pagination).toEqual(mockResponse.pagination)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/eventbrite/events')
      )
    })
  })

  describe('searchAllSources', () => {
    it('should combine results from both sources', async () => {
      const ticketmasterResponse = {
        events: [
          {
            external_id: 'tm-123',
            artist: 'Rock Band',
            date: '2024-12-01',
            price: '30',
            genres: ['rock'],
            source: 'ticketmaster'
          }
        ],
        pagination: { page: 0, size: 1, totalElements: 1, totalPages: 1 }
      }

      const eventbriteResponse = {
        events: [
          {
            external_id: 'eb-456',
            artist: 'Jazz Trio',
            date: '2024-12-02',
            price: 'free',
            genres: ['jazz'],
            source: 'eventbrite'
          }
        ],
        pagination: { page: 1, pageSize: 1, totalCount: 1, totalPages: 1, hasMore: false }
      }

      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ticketmasterResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => eventbriteResponse
        })

      const result = await apiService.searchAllSources({
        query: 'music'
      })

      expect(result.data).toHaveLength(2)
      expect(result.data[0].source).toBe('ticketmaster')
      expect(result.data[1].source).toBe('eventbrite')
    })

    it('should filter by genre', async () => {
      const mockResponse = {
        events: [
          {
            external_id: 'tm-123',
            artist: 'Rock Band',
            date: '2024-12-01',
            price: '30',
            genres: ['rock', 'alternative'],
            source: 'ticketmaster'
          },
          {
            external_id: 'tm-124',
            artist: 'Jazz Band',
            date: '2024-12-02',
            price: '25',
            genres: ['jazz'],
            source: 'ticketmaster'
          }
        ],
        pagination: { page: 0, size: 2, totalElements: 2, totalPages: 1 }
      }

      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ events: [], pagination: {} })
        })

      const result = await apiService.searchAllSources({
        genre: 'rock'
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].artist).toBe('Rock Band')
    })

    it('should handle partial failures gracefully', async () => {
      const ticketmasterResponse = {
        events: [
          {
            external_id: 'tm-123',
            artist: 'Test Artist',
            date: '2024-12-01',
            price: '25',
            genres: [],
            source: 'ticketmaster'
          }
        ],
        pagination: { page: 0, size: 1, totalElements: 1, totalPages: 1 }
      }

      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ticketmasterResponse
        })
        .mockRejectedValueOnce(new Error('Eventbrite API down'))

      const result = await apiService.searchAllSources({
        query: 'music'
      })

      // Should still return Ticketmaster results even if Eventbrite fails
      expect(result.data).toHaveLength(1)
      expect(result.data[0].source).toBe('ticketmaster')
    })
  })
})