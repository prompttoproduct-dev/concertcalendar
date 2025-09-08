import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { scheduledJobManager } from './lib/scheduled-jobs'

// Start the daily Ticketmaster data fetching job
if (import.meta.env.VITE_TICKETMASTER_API_KEY) {
  scheduledJobManager.start()
  console.log('Daily Ticketmaster data fetching started')
} else {
  console.warn('VITE_TICKETMASTER_API_KEY not found - scheduled jobs disabled')
}

createRoot(document.getElementById("root")!).render(<App />);
