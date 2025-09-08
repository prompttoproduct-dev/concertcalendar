import { useEffect, useState, useCallback } from 'react'
import { notificationSystem, type NotificationPreferences } from '@/lib/notification-system'
import { type Concert, type Venue } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface UseRealtimeNotificationsOptions {
  preferences?: NotificationPreferences
  showToasts?: boolean
}

export const useRealtimeNotifications = (options: UseRealtimeNotificationsOptions = {}) => {
  const { preferences, showToasts = true } = options
  const [newConcerts, setNewConcerts] = useState<(Concert & { venue: Venue })[]>([])
  const [notificationCount, setNotificationCount] = useState(0)

  // Handle new concert notifications
  const handleNewConcert = useCallback((event: CustomEvent) => {
    const concertData = event.detail
    
    if (showToasts) {
      toast({
        title: `New Concert: ${concertData.artist}`,
        description: `${concertData.venue} - ${concertData.date}`,
        duration: 5000,
      })
    }

    setNewConcerts(prev => [concertData, ...prev.slice(0, 9)]) // Keep last 10
    setNotificationCount(prev => prev + 1)
  }, [showToasts])

  // Handle price drop notifications
  const handlePriceDrop = useCallback((event: CustomEvent) => {
    const priceData = event.detail
    
    if (showToasts) {
      toast({
        title: `Price Drop: ${priceData.artist}`,
        description: `Now ${priceData.newPrice} (was ${priceData.oldPrice})`,
        duration: 5000,
      })
    }

    setNotificationCount(prev => prev + 1)
  }, [showToasts])

  // Subscribe to genre-specific updates
  const subscribeToGenres = useCallback((genres: string[]) => {
    return notificationSystem.subscribeToGenreUpdates(genres, (concert) => {
      if (showToasts) {
        toast({
          title: `New ${concert.genres.join(', ')} Concert`,
          description: `${concert.artist} at ${concert.venue.name}`,
          duration: 5000,
        })
      }
      setNewConcerts(prev => [concert, ...prev.slice(0, 9)])
      setNotificationCount(prev => prev + 1)
    })
  }, [showToasts])

  // Subscribe to free shows
  const subscribeToFreeShows = useCallback(() => {
    return notificationSystem.subscribeToFreeShows((concert) => {
      if (showToasts) {
        toast({
          title: `New Free Concert: ${concert.artist}`,
          description: `${concert.venue.name} - ${concert.date}`,
          duration: 5000,
        })
      }
      setNewConcerts(prev => [concert, ...prev.slice(0, 9)])
      setNotificationCount(prev => prev + 1)
    })
  }, [showToasts])

  // Subscribe to borough updates
  const subscribeToBoroughs = useCallback((borough: string) => {
    return notificationSystem.subscribeToBoroughUpdates(borough, (concert) => {
      if (showToasts) {
        toast({
          title: `New Concert in ${borough}`,
          description: `${concert.artist} at ${concert.venue.name}`,
          duration: 5000,
        })
      }
      setNewConcerts(prev => [concert, ...prev.slice(0, 9)])
      setNotificationCount(prev => prev + 1)
    })
  }, [showToasts])

  // Request notification permissions
  const requestPermissions = useCallback(async () => {
    return await notificationSystem.requestNotificationPermission()
  }, [])

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    await notificationSystem.sendTestNotification()
  }, [])

  // Clear notification count
  const clearNotifications = useCallback(() => {
    setNotificationCount(0)
    setNewConcerts([])
  }, [])

  useEffect(() => {
    // Listen for custom events
    window.addEventListener('new-concert', handleNewConcert as EventListener)
    window.addEventListener('price-drop', handlePriceDrop as EventListener)

    return () => {
      window.removeEventListener('new-concert', handleNewConcert as EventListener)
      window.removeEventListener('price-drop', handlePriceDrop as EventListener)
    }
  }, [handleNewConcert, handlePriceDrop])

  // Auto-subscribe based on preferences
  useEffect(() => {
    if (!preferences) return

    const unsubscribeFunctions: (() => void)[] = []

    // Subscribe to preferred genres
    if (preferences.genres.length > 0) {
      const unsubscribe = subscribeToGenres(preferences.genres)
      unsubscribeFunctions.push(unsubscribe)
    }

    // Subscribe to preferred boroughs
    preferences.boroughs.forEach(borough => {
      const unsubscribe = subscribeToBoroughs(borough)
      unsubscribeFunctions.push(unsubscribe)
    })

    // Subscribe to free shows if preferred
    if (preferences.priceRange === 'free') {
      const unsubscribe = subscribeToFreeShows()
      unsubscribeFunctions.push(unsubscribe)
    }

    return () => {
      unsubscribeFunctions.forEach(fn => fn())
    }
  }, [preferences, subscribeToGenres, subscribeToBoroughs, subscribeToFreeShows])

  return {
    newConcerts,
    notificationCount,
    subscribeToGenres,
    subscribeToFreeShows,
    subscribeToBoroughs,
    requestPermissions,
    sendTestNotification,
    clearNotifications
  }
}