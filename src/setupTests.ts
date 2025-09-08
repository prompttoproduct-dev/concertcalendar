// Jest setup file for testing environment
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.VITE_TICKETMASTER_API_KEY = 'test-ticketmaster-key'
process.env.VITE_EVENTBRITE_API_KEY = 'test-eventbrite-key'

// Mock fetch globally for all tests
global.fetch = jest.fn()

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})