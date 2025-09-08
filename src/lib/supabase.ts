import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vlhpjafhqkhxvvmgcxuk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaHBqYWZocWtoeHZ2bWdjeHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjUwMTAsImV4cCI6MjA3MTQwMTAxMH0.JxSjYvUcxcbq5e9utXbQw5a3OqW90ke0ITza2H_hFaM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Borough = 'manhattan' | 'brooklyn' | 'queens' | 'bronx' | 'staten_island'
export type Source = 'manual' | 'ticketmaster' | 'eventbrite'

export interface Venue {
  id: string
  name: string
  address: string
  borough: Borough
  capacity?: number
  website?: string
  created_at: string
  updated_at: string
}

export interface Concert {
  id: string
  artist: string
  venue_id: string
  venue?: Venue
  date: string
  time?: string
  price: string
  genres: string[]
  description?: string
  ticket_url?: string
  image_url?: string
  source: Source
  external_id?: string
  created_at: string
  updated_at: string
}

// Helper functions for database operations
export const concertQueries = {
  // Get all concerts with venue information
  async getAll() {
    const { data, error } = await supabase
      .from('concerts')
      .select(`
        *,
        venue:venues(*)
      `)
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as (Concert & { venue: Venue })[]
  },

  // Search concerts by filters
  async search(filters: {
    query?: string
    genre?: string
    borough?: Borough
    priceRange?: 'free' | '0-35' | '35-50' | '50-100' | '100+'
    dateRange?: { start: string; end: string }
  }) {
    let query = supabase
      .from('concerts')
      .select(`
        *,
        venue:venues(*)
      `)

    // Text search
    if (filters.query) {
      query = query.or(`artist.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
    }

    // Genre filter
    if (filters.genre) {
      query = query.contains('genres', [filters.genre])
    }

    // Borough filter
    if (filters.borough) {
      query = query.eq('venue.borough', filters.borough)
    }

    // Price range filter
    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          query = query.eq('price', 'free')
          break
        case '0-35':
          // Include free concerts and concerts under $35
          query = query.or('price.eq.free,price.lte.35')
          break
        case '35-50':
          query = query.gte('price', '35').lte('price', '50')
          break
        case '50-100':
          query = query.gte('price', '50').lte('price', '100')
          break
        case '100+':
          query = query.gt('price', '100')
          break
      }
    }

    // Date range filter
    if (filters.dateRange) {
      query = query
        .gte('date', filters.dateRange.start)
        .lte('date', filters.dateRange.end)
    }

    query = query.order('date', { ascending: true })

    const { data, error } = await query
    if (error) throw error
    return data as (Concert & { venue: Venue })[]
  },

  // Get concerts by genre
  async getByGenre(genre: string) {
    const { data, error } = await supabase
      .from('concerts')
      .select(`
        *,
        venue:venues(*)
      `)
      .contains('genres', [genre])
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as (Concert & { venue: Venue })[]
  },

  // Get free concerts
  async getFree() {
    const { data, error } = await supabase
      .from('concerts')
      .select(`
        *,
        venue:venues(*)
      `)
      .eq('price', 'free')
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as (Concert & { venue: Venue })[]
  },

  // Get upcoming concerts
  async getUpcoming(limit = 20) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('concerts')
      .select(`
        *,
        venue:venues(*)
      `)
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(limit)
    
    if (error) throw error
    return data as (Concert & { venue: Venue })[]
  }
}

export const venueQueries = {
  // Get all venues
  async getAll() {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data as Venue[]
  },

  // Get venues by borough
  async getByBorough(borough: Borough) {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('borough', borough)
      .order('name')
    
    if (error) throw error
    return data as Venue[]
  }
}