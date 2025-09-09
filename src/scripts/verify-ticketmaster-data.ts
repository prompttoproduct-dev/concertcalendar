import { supabase } from '@/integrations/supabase/client'
import { getTicketmasterClient } from '@/lib/api-clients/ticketmaster'

interface DataVerificationResult {
  databaseCheck: {
    totalConcerts: number
    ticketmasterConcerts: number
    septemberConcerts: number
    sampleConcerts: any[]
  }
  apiCheck?: {
    apiWorking: boolean
    eventsFound: number
    sampleEvents: any[]
    error?: string
  }
}

export async function verifyTicketmasterData(options: {
  checkApi?: boolean
  fetchFreshData?: boolean
} = {}): Promise<DataVerificationResult> {
  console.log('🔍 Verifying Ticketmaster data for September 2025...')
  
  const result: DataVerificationResult = {
    databaseCheck: {
      totalConcerts: 0,
      ticketmasterConcerts: 0,
      septemberConcerts: 0,
      sampleConcerts: []
    }
  }

  try {
    // 1. Check database for existing data
    console.log('📊 Checking database for existing concerts...')
    
    // Total concerts
    const { count: totalCount } = await supabase
      .from('concerts')
      .select('*', { count: 'exact', head: true })
    
    result.databaseCheck.totalConcerts = totalCount || 0

    // Ticketmaster concerts
    const { count: tmCount } = await supabase
      .from('concerts')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'ticketmaster')
    
    result.databaseCheck.ticketmasterConcerts = tmCount || 0

    // September 2025 concerts
    const { count: septCount } = await supabase
      .from('concerts')
      .select('*', { count: 'exact', head: true })
      .gte('date', '2025-09-01')
      .lte('date', '2025-09-30')
    
    result.databaseCheck.septemberConcerts = septCount || 0

    // Sample concerts from September 2025
    const { data: sampleConcerts } = await supabase
      .from('concerts')
      .select('*')
      .gte('date', '2025-09-01')
      .lte('date', '2025-09-30')
      .eq('source', 'ticketmaster')
      .limit(5)
    
    result.databaseCheck.sampleConcerts = sampleConcerts || []

    console.log('📊 Database Check Results:')
    console.log(`   Total concerts: ${result.databaseCheck.totalConcerts}`)
    console.log(`   Ticketmaster concerts: ${result.databaseCheck.ticketmasterConcerts}`)
    console.log(`   September 2025 concerts: ${result.databaseCheck.septemberConcerts}`)
    console.log(`   Sample concerts found: ${result.databaseCheck.sampleConcerts.length}`)

    if (result.databaseCheck.sampleConcerts.length > 0) {
      console.log('\n🎵 Sample September 2025 concerts:')
      result.databaseCheck.sampleConcerts.forEach((concert, index) => {
        console.log(`   ${index + 1}. ${concert.artist} - ${concert.title}`)
        console.log(`      Date: ${concert.date} ${concert.time || ''}`)
        console.log(`      Venue: ${concert.venue}`)
        console.log(`      Price: ${concert.price === 0 ? 'FREE' : `$${concert.price}`}`)
        console.log(`      External ID: ${concert.external_id}`)
        console.log('')
      })
    }

    // 2. Check API if requested
    if (options.checkApi) {
      console.log('🌐 Testing Ticketmaster API connection...')
      
      try {
        const ticketmasterClient = getTicketmasterClient()
        
        const response = await ticketmasterClient.searchEvents({
          city: 'New York',
          stateCode: 'NY',
          size: 10,
          startDateTime: '2025-09-01T00:00:00Z',
          endDateTime: '2025-09-30T23:59:59Z'
        })

        result.apiCheck = {
          apiWorking: true,
          eventsFound: response._embedded?.events?.length || 0,
          sampleEvents: response._embedded?.events?.slice(0, 3).map(event => ({
            id: event.id,
            name: event.name,
            date: event.dates.start.localDate,
            venue: event._embedded?.venues?.[0]?.name,
            price: event.priceRanges?.[0]?.min
          })) || []
        }

        console.log('🌐 API Check Results:')
        console.log(`   API working: ${result.apiCheck.apiWorking}`)
        console.log(`   Events found: ${result.apiCheck.eventsFound}`)
        
        if (result.apiCheck.sampleEvents.length > 0) {
          console.log('\n🎪 Sample events from API:')
          result.apiCheck.sampleEvents.forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.name}`)
            console.log(`      Date: ${event.date}`)
            console.log(`      Venue: ${event.venue || 'TBA'}`)
            console.log(`      Price: ${event.price ? `$${event.price}` : 'TBA'}`)
            console.log('')
          })
        }

      } catch (error) {
        result.apiCheck = {
          apiWorking: false,
          eventsFound: 0,
          sampleEvents: [],
          error: error instanceof Error ? error.message : 'Unknown API error'
        }

        console.log('❌ API Check Failed:')
        console.log(`   Error: ${result.apiCheck.error}`)
      }
    }

    // 3. Fetch fresh data if requested
    if (options.fetchFreshData && result.apiCheck?.apiWorking) {
      console.log('🔄 Triggering fresh data fetch from Ticketmaster...')
      
      try {
        // Call the Edge Function to sync data
        const syncResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ticketmaster-sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        })

        if (syncResponse.ok) {
          const syncResult = await syncResponse.json()
          console.log('🔄 Sync completed:', syncResult)
          
          // Re-check database after sync
          const { count: newCount } = await supabase
            .from('concerts')
            .select('*', { count: 'exact', head: true })
            .gte('date', '2025-09-01')
            .lte('date', '2025-09-30')
            .eq('source', 'ticketmaster')
          
          console.log(`📈 September 2025 Ticketmaster concerts after sync: ${newCount}`)
        } else {
          console.log('❌ Sync failed:', await syncResponse.text())
        }
      } catch (error) {
        console.log('❌ Sync error:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  }

  return result
}

// CLI interface for running verification
if (import.meta.main) {
  const args = Deno.args || process.argv.slice(2)
  const checkApi = args.includes('--api')
  const fetchFresh = args.includes('--fetch')
  
  verifyTicketmasterData({ checkApi, fetchFresh })
    .then(result => {
      console.log('\n✅ Verification complete!')
      
      if (result.databaseCheck.septemberConcerts === 0) {
        console.log('\n⚠️  No September 2025 concerts found in database.')
        console.log('   Run with --fetch flag to sync fresh data from Ticketmaster.')
      } else {
        console.log(`\n🎉 Found ${result.databaseCheck.septemberConcerts} September 2025 concerts!`)
      }
    })
    .catch(error => {
      console.error('\n❌ Verification failed:', error.message)
      process.exit(1)
    })
}