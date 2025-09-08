import { supabase } from '@/lib/supabase'
import { type Concert, type Venue } from '@/lib/supabase'

export interface NotificationPreferences {
  genres: string[]
  boroughs: string[]
  priceRange: 'free' | 'under-35' | 'over-35' | 'all'
  emailNotifications: boolean
  pushNotifications: boolean
}

export interface Notification {
  id: string
  type: 'new-concert' | 'price-drop' | 'last-chance' | 'genre-match'
  title: string
  message: string
  concert_id: string
  user_id?: string
  read: boolean
  created_at: string
}

export class NotificationSystem {
  private channel: any = null

  constructor() {
    this.initializeRealtimeChannel()
  }

  private initializeRealtimeChannel() {
    this.channel = supabase
      .channel('concert-notifications')
      .on('broadcast', { event: 'new-concert' }, (payload) => {
        this.handleNewConcertNotification(payload.payload)
      })
      .on('broadcast', { event: 'price-drop' }, (payload) => {
        this.handlePriceDropNotification(payload.payload)
      })
      .subscribe()
  }

  async subscribeToGenreUpdates(genres: string[], callback: (concert: Concert & { venue: Venue }) => void) {
    // Subscribe to real-time updates for specific genres
    const genreChannel = supabase
      .channel(`genre-updates-${genres.join('-')}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'concerts',
          filter: `genres.cs.{${genres.join(',')}}`
        },
        async (payload) => {
          // Fetch full concert data with venue
          const { data: concert } = await supabase
            .from('concerts')
            .select(`
              *,
              venue:venues(*)
            `)
            .eq('id', payload.new.id)
            .single()

          if (concert) {
            callback(concert as Concert & { venue: Venue })
          }
        }
      )
      .subscribe()

    return () => {
      genreChannel.unsubscribe()
    }
  }

  async subscribeToFreeShows(callback: (concert: Concert & { venue: Venue }) => void) {
    const freeChannel = supabase
      .channel('free-concerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'concerts',
          filter: 'price.eq.free'
        },
        async (payload) => {
          const { data: concert } = await supabase
            .from('concerts')
            .select(`
              *,
              venue:venues(*)
            `)
            .eq('id', payload.new.id)
            .single()

          if (concert) {
            callback(concert as Concert & { venue: Venue })
          }
        }
      )
      .subscribe()

    return () => {
      freeChannel.unsubscribe()
    }
  }

  async subscribeToBoroughUpdates(borough: string, callback: (concert: Concert & { venue: Venue }) => void) {
    const boroughChannel = supabase
      .channel(`borough-${borough}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'concerts'
        },
        async (payload) => {
          // Check if the concert's venue is in the specified borough
          const { data: concert } = await supabase
            .from('concerts')
            .select(`
              *,
              venue:venues!inner(*)
            `)
            .eq('id', payload.new.id)
            .eq('venue.borough', borough)
            .single()

          if (concert) {
            callback(concert as Concert & { venue: Venue })
          }
        }
      )
      .subscribe()

    return () => {
      boroughChannel.unsubscribe()
    }
  }

  private async handleNewConcertNotification(payload: any) {
    // Create browser notification if permissions granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New Concert: ${payload.artist}`, {
        body: `${payload.date} - ${payload.price === 'free' ? 'FREE' : `$${payload.price}`}`,
        icon: '/favicon.ico',
        tag: 'new-concert'
      })
    }

    // Trigger custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('new-concert', { detail: payload }))
  }

  private async handlePriceDropNotification(payload: any) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Price Drop: ${payload.artist}`, {
        body: `Now ${payload.newPrice} (was ${payload.oldPrice})`,
        icon: '/favicon.ico',
        tag: 'price-drop'
      })
    }

    window.dispatchEvent(new CustomEvent('price-drop', { detail: payload }))
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  async sendTestNotification() {
    const hasPermission = await this.requestNotificationPermission()
    
    if (hasPermission) {
      new Notification('CitySounds Test', {
        body: 'Notifications are working! You\'ll be notified of new concerts.',
        icon: '/favicon.ico'
      })
    }
  }

  // Broadcast new concert to all subscribers
  async broadcastNewConcert(concert: Concert & { venue: Venue }) {
    await supabase
      .channel('concert-notifications')
      .send({
        type: 'broadcast',
        event: 'new-concert',
        payload: {
          id: concert.id,
          artist: concert.artist,
          venue: concert.venue.name,
          borough: concert.venue.borough,
          date: concert.date,
          price: concert.price,
          genres: concert.genres
        }
      })
  }

  // Check for concerts matching user preferences and notify
  async checkAndNotifyMatches(preferences: NotificationPreferences) {
    const today = new Date().toISOString().split('T')[0]
    
    let query = supabase
      .from('concerts')
      .select(`
        *,
        venue:venues(*)
      `)
      .gte('date', today)

    // Apply genre filter
    if (preferences.genres.length > 0) {
      query = query.overlaps('genres', preferences.genres)
    }

    // Apply price filter
    if (preferences.priceRange !== 'all') {
      switch (preferences.priceRange) {
        case 'free':
          query = query.eq('price', 'free')
          break
        case 'under-35':
          query = query.or('price.eq.free,price.lte.35')
          break
        case 'over-35':
          query = query.gt('price', '35')
          break
      }
    }

    const { data: concerts } = await query

    if (concerts) {
      // Filter by borough
      const matchingConcerts = concerts.filter(concert => 
        preferences.boroughs.length === 0 || 
        preferences.boroughs.includes(concert.venue?.borough || '')
      )

      // Send notifications for matching concerts
      for (const concert of matchingConcerts) {
        await this.broadcastNewConcert(concert as Concert & { venue: Venue })
      }
    }
  }

  disconnect() {
    if (this.channel) {
      this.channel.unsubscribe()
    }
  }
}

export const notificationSystem = new NotificationSystem()