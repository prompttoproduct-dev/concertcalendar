import { supabase } from '@/lib/supabase'
import { type Concert } from '@/lib/supabase'
import { SignatureValidator } from './security/crypto'
import { RateLimiter } from './security/rate-limiting'
import { EnvironmentValidator } from './security/environment'
import { 
  ticketmasterWebhookSchema, 
  eventbriteWebhookSchema, 
  validateWebhookHeaders,
  sanitizeString 
} from './security/validation'

export interface WebhookPayload {
  event_type: 'concert.created' | 'concert.updated' | 'concert.cancelled'
  data: Partial<Concert>
  source: 'ticketmaster' | 'eventbrite' | 'manual'
  timestamp: string
}

export class WebhookHandler {
  async handleTicketmasterWebhook(
    payload: any, 
    headers: Record<string, string>,
    clientIp: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Log webhook reception
      await AuditLogger.logWebhookReceived('ticketmaster', clientIp, headers['user-agent'])

      // Rate limiting
      if (RateLimiter.isRateLimited(clientIp)) {
        await AuditLogger.logRateLimitExceeded(clientIp, headers['user-agent'])
        return { success: false, message: 'Rate limit exceeded' }
      }

      console.log('Processing Ticketmaster webhook:', EnvironmentValidator.maskSensitiveData(payload))

      // Validate headers
      if (!validateWebhookHeaders(headers, 'ticketmaster')) {
        return { success: false, message: 'Missing required headers' }
      }

      // Validate webhook signature
      const rawPayload = JSON.stringify(payload)
      const signature = headers['x-ticketmaster-signature']
      const secret = EnvironmentValidator.getSecureApiKey('TICKETMASTER_WEBHOOK_SECRET')
      
      if (!this.validateTicketmasterSignature(rawPayload, signature, secret)) {
        await AuditLogger.logInvalidSignature('ticketmaster', clientIp, headers['user-agent'])
        return { success: false, message: 'Invalid webhook signature' }
      }

      // Validate payload structure
      const validationResult = ticketmasterWebhookSchema.safeParse(payload)
      if (!validationResult.success) {
        await AuditLogger.logValidationFailed('ticketmaster', clientIp, validationResult.error)
        console.error('Invalid Ticketmaster payload:', validationResult.error)
        return { success: false, message: 'Invalid payload format' }
      }

      const validPayload = validationResult.data
      const eventType = validPayload.event_type
      const eventData = validPayload.data

      switch (eventType) {
        case 'event.created':
          await this.handleEventCreated(eventData, 'ticketmaster')
          break
        case 'event.updated':
          await this.handleEventUpdated(eventData, 'ticketmaster')
          break
        case 'event.cancelled':
          await this.handleEventCancelled(eventData, 'ticketmaster')
          break
        default:
          console.log(`Unhandled Ticketmaster event type: ${eventType}`)
      }

      return { success: true, message: 'Webhook processed successfully' }
    } catch (error) {
      console.error('Ticketmaster webhook error:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async handleEventbriteWebhook(
    payload: any,
    headers: Record<string, string>,
    clientIp: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Rate limiting
      if (RateLimiter.isRateLimited(clientIp)) {
        return { success: false, message: 'Rate limit exceeded' }
      }

      console.log('Processing Eventbrite webhook:', EnvironmentValidator.maskSensitiveData(payload))

      // Validate headers
      if (!validateWebhookHeaders(headers, 'eventbrite')) {
        return { success: false, message: 'Missing required headers' }
      }

      // Validate webhook signature
      const rawPayload = JSON.stringify(payload)
      const signature = headers['x-eventbrite-signature']
      const secret = EnvironmentValidator.getSecureApiKey('EVENTBRITE_WEBHOOK_SECRET')
      
      if (!this.validateEventbriteSignature(rawPayload, signature, secret)) {
        return { success: false, message: 'Invalid webhook signature' }
      }

      // Validate payload structure
      const validationResult = eventbriteWebhookSchema.safeParse(payload)
      if (!validationResult.success) {
        console.error('Invalid Eventbrite payload:', validationResult.error)
        return { success: false, message: 'Invalid payload format' }
      }

      const validPayload = validationResult.data
      const eventType = validPayload.api_url ? 'event.updated' : 'event.created'
      const eventData = validPayload.config?.object

      switch (eventType) {
        case 'event.created':
          await this.handleEventCreated(eventData, 'eventbrite')
          break
        case 'event.updated':
          await this.handleEventUpdated(eventData, 'eventbrite')
          break
        default:
          console.log(`Unhandled Eventbrite event type: ${eventType}`)
      }

      return { success: true, message: 'Webhook processed successfully' }
    } catch (error) {
      console.error('Eventbrite webhook error:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  private async handleEventCreated(eventData: any, source: 'ticketmaster' | 'eventbrite'): Promise<void> {
    // Transform the event data based on source
    let concertData: Partial<Concert>

    if (source === 'ticketmaster') {
      const { ticketmasterClient } = await import('@/lib/api-clients/ticketmaster')
      concertData = ticketmasterClient.transformEvent(eventData)
    } else {
      const { getEventbriteClient } = await import('@/lib/api-clients/eventbrite')
      const eventbriteClient = getEventbriteClient()
      concertData = eventbriteClient.transformEvent(eventData)
    }

    // Insert new concert
    await this.upsertConcert(concertData)

    // Trigger real-time notification
    await this.notifyNewConcert(concertData)
  }

  private async handleEventUpdated(eventData: any, source: 'ticketmaster' | 'eventbrite'): Promise<void> {
    // Similar to handleEventCreated but for updates
    let concertData: Partial<Concert>

    if (source === 'ticketmaster') {
      const { ticketmasterClient } = await import('@/lib/api-clients/ticketmaster')
      concertData = ticketmasterClient.transformEvent(eventData)
    } else {
      const { getEventbriteClient } = await import('@/lib/api-clients/eventbrite')
      const eventbriteClient = getEventbriteClient()
      concertData = eventbriteClient.transformEvent(eventData)
    }

    await this.upsertConcert(concertData)
  }

  private async handleEventCancelled(eventData: any, source: 'ticketmaster' | 'eventbrite'): Promise<void> {
    const externalId = eventData.id

    // Mark concert as cancelled or remove it
    const { error } = await supabase
      .from('concerts')
      .delete()
      .eq('external_id', externalId)
      .eq('source', source)

    if (error) {
      console.error(`Failed to remove cancelled concert: ${error.message}`)
    }
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
      // Handle venue creation/lookup similar to scheduled jobs
      let venueId: string | null = null

      if (concertData.venue_name) {
        const { data: venue } = await supabase
          .from('venues')
          .select('id')
          .eq('name', concertData.venue_name)
          .single()

        if (venue) {
          venueId = venue.id
        } else {
        const { data: newVenue, error: venueError } = await supabase
            .from('venues')
            .insert({
              name: sanitizeString(concertData.venue_name),
              address: sanitizeString(concertData.venue_address || 'New York, NY'),
              borough: 'manhattan'
            })
            .select('id')
            .single()

          if (!venueError && newVenue) {
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

  private async notifyNewConcert(concertData: Partial<Concert>): Promise<void> {
    // Send real-time notification through Supabase
    const { error } = await supabase
      .channel('concert-updates')
      .send({
        type: 'broadcast',
        event: 'new-concert',
        payload: {
          artist: concertData.artist,
          date: concertData.date,
          genres: concertData.genres,
          price: concertData.price
        }
      })

    if (error) {
      console.error('Failed to send real-time notification:', error)
    }
  }

  private validateTicketmasterSignature(payload: string, signature: string, secret: string): boolean {
    return SignatureValidator.validateTicketmasterSignature(payload, signature, secret)
  }

  private validateEventbriteSignature(payload: string, signature: string, secret: string): boolean {
    return SignatureValidator.validateEventbriteSignature(payload, signature, secret)
  }
}

export const webhookHandler = new WebhookHandler()