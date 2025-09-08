import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { scheduledJobManager } from './lib/scheduled-jobs'

console.log('Environment check:')
console.log('VITE_TICKETMASTER_API_KEY exists:', !!import.meta.env.VITE_TICKETMASTER_API_KEY)
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

// Start the daily Ticketmaster data fetching job
if (import.meta.env.VITE_TICKETMASTER_API_KEY) {
  console.log('Starting Ticketmaster scheduled job manager...')
  scheduledJobManager.start()
  console.log('Daily Ticketmaster data fetching started')
} else {
  console.warn('VITE_TICKETMASTER_API_KEY not found - scheduled jobs disabled')
}

createRoot(document.getElementById("root")!).render(<App />);
