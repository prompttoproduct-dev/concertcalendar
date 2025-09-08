import { createClient } from 'npm:@supabase/supabase-js@2'

interface TicketmasterEvent {
  id: string
  name: string
  dates: {
    start: {
      localDate: string
      localTime?: string
      dateTime?: string
    }
  }
  _embedded?: {
    venues?: Array<{
      name: string
      address?: {
        line1?: string
      }
      city?: {
        name: string
      }
      state?: {
        name: string
      }
    }>
    attractions?: Array<{
      name: string
      classifications?: Array<{
        genre?: {
          name: string
        }
        subGenre?: {
          name: string
        }
      }>
    }>
  }
  priceRanges?: Array<{
    min: number
    max: number
  }>
  url?: string
  images?: Array<{
    url: string
    width: number
    height: number
  }>
}

interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[]
  }
  page: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const ticketmasterApiKey = Deno.env.get('TICKETMASTER_API_KEY')
    if (!ticketmasterApiKey) {
      throw new Error('TICKETMASTER_API_KEY environment variable not set')
    }

    console.log('Starting Ticketmaster data sync...')

    // Set date range for September 2025 (for testing)
    const startDate = new Date('2025-09-01T00:00:00Z')
    const endDate = new Date('2025-09-30T23:59:59Z')
    const startDateTime = startDate.toISOString()
    const endDateTime = endDate.toISOString()

    console.log(`Fetching events from ${startDateTime} to ${endDateTime}`)

    // Build Ticketmaster API URL
    const searchParams = new URLSearchParams({
      apikey: ticketmasterApiKey,
      city: 'New York',
      stateCode: 'NY',
      size: '200',
      page: '0',
      startDateTime,
      endDateTime
    })

    const ticketmasterUrl = `https://app.ticketmaster.com/discovery/v2/events.json?${searchParams.toString()}`
    console.log('Ticketmaster API URL:', ticketmasterUrl)

    // Fetch from Ticketmaster API
    const tmResponse = await fetch(ticketmasterUrl)
    
    if (!tmResponse.ok) {
      throw new Error(`Ticketmaster API error: ${tmResponse.status} ${tmResponse.statusText}`)
    }

    const tmData: TicketmasterResponse = await tmResponse.json()
    console.log('Ticketmaster response received:', tmData)

    let processed = 0
    const errors: string[] = []

    if (tmData._embedded?.events) {
      console.log(`Found ${tmData._embedded.events.length} events from Ticketmaster`)
      
      for (const event of tmData._embedded.events) {
        try {
          const concertData = transformTicketmasterEvent(event)
          console.log('Transformed concert data:', concertData)
          
          // Upsert concert into database
          const { error } = await supabaseClient
            .from('concerts')
            .upsert(concertData, {
              onConflict: 'external_id,source',
              ignoreDuplicates: false
            })

          if (error) {
            errors.push(`Failed to upsert concert ${event.id}: ${error.message}`)
          } else {
            processed++
          }
        } catch (error) {
          errors.push(`Failed to process event ${event.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    } else {
      console.log('No events found in Ticketmaster response')
    }

    const result = {
      success: errors.length === 0,
      processed,
      errors,
      timestamp: new Date().toISOString(),
      totalEvents: tmData._embedded?.events?.length || 0
    }

    console.log('Sync completed:', result)

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    const errorResult = {
      success: false,
      processed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(errorResult),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})

function transformTicketmasterEvent(event: TicketmasterEvent) {
  if (!event || !event.id) {
    throw new Error('Invalid event data provided to transformEvent')
  }

  if (!event.dates?.start?.localDate) {
    throw new Error(`Event ${event.id} missing required start date information`)
  }

  const venue = event._embedded?.venues?.[0]
  const attraction = event._embedded?.attractions?.[0]
  const image = event.images?.find(img => img.width >= 400) || event.images?.[0]

  // Use attraction name as artist, fallback to event name
  const artist = attraction?.name || event.name

  // Extract time from localTime or dateTime
  let time: string | undefined
  if (event.dates.start.localTime) {
    time = event.dates.start.localTime
  } else if (event.dates.start.dateTime) {
    const dateTime = new Date(event.dates.start.dateTime)
    time = dateTime.toTimeString().split(' ')[0] // HH:MM:SS format
  }

  return {
    external_id: event.id,
    title: event.name,
    artist: artist,
    venue: venue?.name || 'TBA',
    date: event.dates.start.localDate,
    time: time,
    price: event.priceRanges?.[0]?.min || 0,
    image_url: image?.url,
    source: 'ticketmaster',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}