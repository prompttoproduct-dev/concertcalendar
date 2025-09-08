import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Venue {
  id: string
  name: string
  address: string
  borough: 'manhattan' | 'brooklyn' | 'queens' | 'bronx' | 'staten_island'
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
  price: number | 'free'
  genres: string[]
  description?: string
  ticket_url?: string
  image_url?: string
  source: 'manual' | 'ticketmaster' | 'eventbrite'
  external_id?: string
  created_at: string
  updated_at: string
}