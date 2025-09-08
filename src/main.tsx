import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeScheduledJobs } from '../lib/init-scheduled-jobs'

console.log('Environment check:')
console.log('VITE_TICKETMASTER_API_KEY exists:', !!import.meta.env.VITE_TICKETMASTER_API_KEY)
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

// Initialize scheduled jobs for testing
initializeScheduledJobs()

createRoot(document.getElementById("root")!).render(<App />);
