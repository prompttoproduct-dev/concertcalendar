import { supabase } from '@/lib/supabase'
import { getEventbriteClient } from '@/lib/api-clients/eventbrite'
import { ticketmasterClient } from '@/lib/api-clients/ticketmaster'
import { type Concert } from '@/lib/supabase'

interface JobResult {
  success: boolean
  processed: number
  errors: string[]
  timestamp: string
}

export class ScheduledJobManager {
  private isRunning = false
  private lastRun: Date | null = null
  private jobInterval: NodeJS.Timeout | null = null

  constructor(private intervalMinutes: number = 60) {}

  start() {
    if (this.isRunning) {
      console.log('Scheduled jobs already running')
      return
    }

    this.isRunning = true
    console.log(`Starting scheduled jobs with ${this.intervalMinutes} minute interval`)

    // Run immediately on start
    this.runJobs()

    // Schedule recurring jobs
    this.jobInterval = setInterval(() => {
      this.runJobs()
    }, this.intervalMinutes * 60 * 1000)
  }

  stop() {
    if (this.jobInterval) {
      clearInterval(this.jobInterval)
      this.jobInterval = null
    }
    this.isRunning = false
    console.log('Scheduled jobs stopped')
  }

  private async runJobs(): Promise<JobResult> {
    const startTime = new Date()
    const errors: string[] = []
    let processed = 0

    try {
      console.log('Running scheduled concert data fetch job...')

      // Fetch from Ticketmaster
      try {
        const tmResult = await this.fetchTicketmasterEvents()
        processed += tmResult.processed
        errors.push(...tmResult.errors)
      } catch (error) {
        errors.push(`Ticketmaster fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Fetch from Eventbrite
      try {
        const ebResult = await this.fetchEventbriteEvents()
        processed += ebResult.processed
        errors.push(...ebResult.errors)
      } catch (error) {
        errors.push(`Eventbrite fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Clean up old events
      try {
        await this.cleanupOldEvents()
      } catch (error) {
        errors.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      this.lastRun = startTime
      
      const result: JobResult = {
        success: errors.length === 0,
        processed,
        errors,
        timestamp: startTime.toISOString()
      }

      console.log('Scheduled job completed:', result)
      return result

    } catch (error) {
      const result: JobResult = {
        success: false,
        processed,
        errors: [...errors, `Job failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        timestamp: startTime.toISOString()
      }

      console.error('Scheduled job failed:', result)
      return result
    }
  }

  private async fetchTicketmasterEvents(): Promise<{ processed: number; errors: string[] }> {
    const errors: string[] = []
    let processed = 0

    try {
      const response = await ticketmasterClient.searchEvents({
        city: 'New York',
        stateCode: 'NY',
        size: 50
      })

      if (response._embedded?.events) {
        for (const event of response._embedded.events) {
          try {
            const concertData = ticketmasterClient.transformEvent(event)
            await this.upsertConcert(concertData)
            processed++
          } catch (error) {
            errors.push(`Failed to process Ticketmaster event ${event.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      }
    } catch (error) {
      errors.push(`Ticketmaster API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return { processed, errors }
  }

  private async fetchEventbriteEvents(): Promise<{ processed: number; errors: string[] }> {
    const errors: string[] = []
    let processed = 0

    try {
      const eventbriteClient = getEventbriteClient()
      const response = await eventbriteClient.searchEvents({
        location: 'New York, NY',
        page: 1
      })

      for (const event of response.events) {
        try {
          const concertData = eventbriteClient.transformEvent(event)
          await this.upsertConcert(concertData)
          processed++
        } catch (error) {
          errors.push(`Failed to process Eventbrite event ${event.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    } catch (error) {
      errors.push(`Eventbrite API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return { processed, errors }
  }

  private async upsertConcert(concertData: Partial<Concert>): Promise<void> {
    if (!concertData.external_id || !concertData.artist || !concertData.date) {
      throw new Error('Missing required concert data')
    }

    // Check if concert already exists
    const { data: existing } = await supabase
      .from('concerts')
      .select('id')
      .eq('external_id', concertData.external_id)
      .eq('source', concertData.source)
      .single()

    if (existing) {
      // Update existing concert
      const { error } = await supabase
        .from('concerts')
        .update({
          ...concertData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) {
        throw new Error(`Failed to update concert: ${error.message}`)
      }
    } else {
      // Create new concert - need to handle venue
      let venueId: string | null = null

      // Try to find or create venue if venue data exists
      if (concertData.venue_name) {
        const { data: venue } = await supabase
          .from('venues')
          .select('id')
          .eq('name', concertData.venue_name)
          .single()

        if (venue) {
          venueId = venue.id
        } else {
          // Create new venue with minimal data
          const { data: newVenue, error: venueError } = await supabase
            .from('venues')
            .insert({
              name: concertData.venue_name,
              address: concertData.venue_address || 'New York, NY',
              borough: 'manhattan' // Default to Manhattan, can be improved with geocoding
            })
            .select('id')
            .single()

          if (venueError) {
            console.warn(`Failed to create venue: ${venueError.message}`)
          } else {
            venueId = newVenue.id
          }
        }
      }

      // Insert new concert
      const { error } = await supabase
        .from('concerts')
        .insert({
          ...concertData,
          venue_id: venueId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw new Error(`Failed to insert concert: ${error.message}`)
      }
    }
  }

  private async cleanupOldEvents(): Promise<void> {
    // Remove events that are more than 30 days old
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)

    const { error } = await supabase
      .from('concerts')
      .delete()
      .lt('date', cutoffDate.toISOString().split('T')[0])

    if (error) {
      throw new Error(`Failed to cleanup old events: ${error.message}`)
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      intervalMinutes: this.intervalMinutes
    }
  }
}

// Singleton instance
export const scheduledJobManager = new ScheduledJobManager(60) // Run every hour