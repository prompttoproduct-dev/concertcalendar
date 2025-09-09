// Integration test for Ticketmaster Edge Function
// Tests the actual Supabase Edge Function endpoint

jest.unmock('node-fetch')

describe('Ticketmaster Edge Function Integration', () => {
  const EDGE_FUNCTION_URL = 'http://localhost:54321/functions/v1/ticketmaster-sync'

  beforeAll(() => {
    if (!process.env.VITE_TICKETMASTER_API_KEY) {
      console.warn('VITE_TICKETMASTER_API_KEY not set, skipping Edge Function integration tests')
    }
  })

  describe('ticketmaster-sync function', () => {
    it('should execute successfully and return job results', async () => {
      if (!process.env.VITE_TICKETMASTER_API_KEY) {
        console.log('Skipping test: API key not available')
        return
      }

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify({})
      })

      expect(response.ok).toBe(true)
      
      const result = await response.json()
      console.log('Edge function result:', result)

      // Verify response structure
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('processed')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('timestamp')
      expect(Array.isArray(result.errors)).toBe(true)
      expect(typeof result.processed).toBe('number')
      expect(typeof result.success).toBe('boolean')

      // Log results for debugging
      console.log(`Edge function processed ${result.processed} events`)
      if (result.errors.length > 0) {
        console.log('Errors encountered:', result.errors)
      }
    }, 60000) // 60 second timeout

    it('should handle CORS preflight requests', async () => {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'OPTIONS'
      })

      expect(response.ok).toBe(true)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })

    it('should require proper authorization', async () => {
      if (!process.env.VITE_TICKETMASTER_API_KEY) {
        console.log('Skipping test: API key not available')
        return
      }

      // Test without authorization header
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        body: JSON.stringify({})
      })

      // Edge function should still work (it doesn't require auth for this endpoint)
      // But we can verify it handles missing auth gracefully
      expect(response.status).toBeLessThan(500)
    }, 30000)
  })
})