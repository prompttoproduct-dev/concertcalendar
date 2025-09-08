import { supabase } from '@/lib/supabase'
import { getTicketmasterClient } from '@/lib/api-clients/ticketmaster'
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

  // Set to run daily (24 hours)
  constructor(private intervalMinutes: number = 24 * 60) {}

  start() {
    if (this.isRunning) {
      console.log('Scheduled jobs already running')
      return
    }

    this.isRunning = true
    console.log(`Starting daily Ticketmaster data fetch (every ${this.intervalMinutes / 60} hours)`)

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
      console.log('Running daily Ticketmaster concert data fetch...')

      // Fetch from Ticketmaster for next 30 days
      try {
        const tmResult = await this.fetchTicketmasterEvents()
        processed += tmResult.processed
        errors.push(...tmResult.errors)
      } catch (error) {
        errors.push(`Ticketmaster fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      this.lastRun = startTime
      
      const result: JobResult = {
        success: errors.length === 0,
        processed,
        errors,
        timestamp: startTime.toISOString()
      }

      console.log('Daily job completed:', result)
      return result

    } catch (error) {
      const result: JobResult = {
        success: false,
        processed,
        errors: [...errors, `Job failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        timestamp: startTime.toISOString()
      }

      console.error('Daily job failed:', result)
      return result
    }
  }

  private async fetchTicketmasterEvents(): Promise<{ processed: number; errors: string[] }> {
    const errors: string[] = []
    let processed = 0

    try {
      const ticketmasterClient = getTicketmasterClient()
      
      // Calculate date range for next 30 days
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 30)

      const startDateTime = startDate.toISOString()
      const endDateTime = endDate.toISOString()

      console.log(`Fetching Ticketmaster events from ${startDateTime} to ${endDateTime}`)

      const response = await ticketmasterClient.searchEvents({
        city: 'New York',
        stateCode: 'NY',
        size: 200, // Maximum allowed by Ticketmaster
        startDateTime,
        endDateTime
      })

      if (response._embedded?.events) {
        console.log(`Found ${response._embedded.events.length} events from Ticketmaster`)
        
        for (const event of response._embedded.events) {
          try {
            const concertData = ticketmasterClient.transformEvent(event)
            await this.upsertConcert(concertData)
            processed++
          } catch (error) {
            errors.push(`Failed to process Ticketmaster event ${event.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      } else {
        console.log('No events found in Ticketmaster response')
      }
    } catch (error) {
      errors.push(`Ticketmaster API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return { processed, errors }
  }

  private async upsertConcert(concertData: Partial<Concert>): Promise<void> {
    if (!concertData.external_id || !concertData.artist || !concertData.date) {
      throw new Error('Missing required concert data: external_id, artist, or date')
    }

    // Prepare the concert data for upsert
    const concertRecord = {
      external_id: concertData.external_id,
      title: concertData.title || concertData.artist,
      artist: concertData.artist,
      venue: concertData.venue || 'TBA',
      date: concertData.date,
      time: concertData.time,
      price: concertData.price || 0,
      image_url: concertData.image_url,
      source: concertData.source || 'ticketmaster',
      updated_at: new Date().toISOString()
    }

    // Use upsert with onConflict to handle duplicates
    const { error } = await supabase
      .from('concerts')
      .upsert(concertRecord, {
        onConflict: 'external_id,source',
        ignoreDuplicates: false // Update existing records
      })

    if (error) {
      throw new Error(`Failed to upsert concert: ${error.message}`)
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

// Singleton instance - runs daily
export const scheduledJobManager = new ScheduledJobManager(24 * 60) // 24 hours