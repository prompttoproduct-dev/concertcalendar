import { scheduledJobManager } from '@/lib/scheduled-jobs'

// Initialize scheduled jobs when the application starts
export function initializeScheduledJobs() {
  // Only run in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SCHEDULED_JOBS === 'true') {
    console.log('Initializing scheduled jobs...')
    scheduledJobManager.start()
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down scheduled jobs...')
      scheduledJobManager.stop()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      console.log('Shutting down scheduled jobs...')
      scheduledJobManager.stop()
      process.exit(0)
    })
  } else {
    console.log('Scheduled jobs disabled in development mode')
  }
}

// Export job manager for manual control
export { scheduledJobManager }