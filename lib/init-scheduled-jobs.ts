import { scheduledJobManager } from '@/lib/scheduled-jobs'

// Initialize scheduled jobs when the application starts
export function initializeScheduledJobs() {
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
}

// Export job manager for manual control
export { scheduledJobManager }