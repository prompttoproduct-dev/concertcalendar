import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vlhpjafhqkhxvvmgcxuk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaHBqYWZocWtoeHZ2bWdjeHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjUwMTAsImV4cCI6MjA3MTQwMTAxMH0.JxSjYvUcxcbq5e9utXbQw5a3OqW90ke0ITza2H_hFaM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Simple types matching the new concerts table structure
export interface Concert {
  id: string
  artist: string
  venue: string
  date: string
  time?: string
  price: number
  ticketUrl?: string
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

  // Search concerts by text query
  async search(query: string) {
    let query = supabase
      .from('concerts')
      .select('*')

    if (query) {
      queryBuilder = queryBuilder.or(`artist.ilike.%${query}%,venue.ilike.%${query}%`)
    }

    queryBuilder = queryBuilder.order('date', { ascending: true })

    const { data, error } = await queryBuilder
    if (error) throw error
    return data as Concert[]
  },

  // Get concerts by date
  async getByDate(date: string) {
    const { data, error } = await supabase
      .from('concerts')
      .select('*')
      .eq('date', date)
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as Concert[]
  },

  // Get concerts by date range
  async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('concerts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
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