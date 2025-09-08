import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vlhpjafhqkhxvvmgcxuk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaHBqYWZocWtoeHZ2bWdjeHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjUwMTAsImV4cCI6MjA3MTQwMTAxMH0.JxSjYvUcxcbq5e9utXbQw5a3OqW90ke0ITza2H_hFaM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Source = 'manual' | 'ticketmaster'

export interface Concert {
  id: string
  external_id?: string
  title?: string
  artist: string
  venue: string
  date: string
  time?: string
  price: number
  image_url?: string
  source: Source
  created_at: string
  updated_at: string
}

// Helper functions for database operations
export const concertQueries = {
  // Get all concerts
  async getAll() {
    const { data, error } = await supabase
      .from('concerts')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as Concert[]
  },

  // Search concerts by filters
  async search(filters: {
    query?: string
    source?: Source
    priceRange?: 'free' | '0-35' | '35-50' | '50-100' | '100+'
    dateRange?: { start: string; end: string }
  }) {
    let query = supabase
      .from('concerts')
      .select('*')

    // Text search across title and artist
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,artist.ilike.%${filters.query}%`)
    }

    // Source filter
    if (filters.source) {
      query = query.eq('source', filters.source)
    }

    // Price range filter
    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          query = query.eq('price', 0)
          break
        case '0-35':
          query = query.gte('price', 0).lte('price', 35)
          break
        case '35-50':
          query = query.gte('price', 35).lte('price', 50)
          break
        case '50-100':
          query = query.gte('price', 50).lte('price', 100)
          break
        case '100+':
          query = query.gt('price', 100)
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
    return data as Concert[]
  },

  // Get free concerts
  async getFree() {
    const { data, error } = await supabase
      .from('concerts')
      .select('*')
      .eq('price', 0)
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as Concert[]
  },

  // Get upcoming concerts
  async getUpcoming(limit = 20) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('concerts')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(limit)
    
    if (error) throw error
    return data as Concert[]
  }
}