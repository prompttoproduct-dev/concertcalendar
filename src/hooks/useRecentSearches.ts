import { useState, useEffect } from 'react'
import { type SearchFilters } from '@/hooks/useConcerts'

const RECENT_SEARCHES_KEY = 'citysounds-recent-searches'
const MAX_RECENT_SEARCHES = 10

export interface RecentSearch {
  id: string
  query?: string
  filters: SearchFilters
  timestamp: number
  displayName: string
}

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setRecentSearches(parsed)
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }, [])

  // Save recent searches to localStorage
  const saveToStorage = (searches: RecentSearch[]) => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches))
    } catch (error) {
      console.error('Failed to save recent searches:', error)
    }
  }

  // Add a new search to recent searches
  const addRecentSearch = (filters: SearchFilters) => {
    const displayName = createDisplayName(filters)
    
    // Don't add empty searches
    if (!displayName || displayName === 'All concerts') {
      return
    }

    const newSearch: RecentSearch = {
      id: `search-${Date.now()}`,
      filters,
      timestamp: Date.now(),
      displayName
    }

    setRecentSearches(prev => {
      // Remove duplicate searches
      const filtered = prev.filter(search => 
        search.displayName !== displayName
      )
      
      // Add new search at the beginning
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      
      saveToStorage(updated)
      return updated
    })
  }

  // Remove a specific recent search
  const removeRecentSearch = (id: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(search => search.id !== id)
      saveToStorage(updated)
      return updated
    })
  }

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  }

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches
  }
}

// Helper function to create display names for searches
const createDisplayName = (filters: SearchFilters): string => {
  const parts: string[] = []

  if (filters.query) {
    parts.push(`"${filters.query}"`)
  }

  if (filters.genre) {
    parts.push(filters.genre)
  }

  if (filters.borough) {
    const boroughNames = {
      manhattan: 'Manhattan',
      brooklyn: 'Brooklyn',
      queens: 'Queens',
      bronx: 'Bronx',
      staten_island: 'Staten Island'
    }
    parts.push(boroughNames[filters.borough])
  }

  if (filters.priceRange) {
    const priceLabels = {
      'free': 'Free',
      '0-35': '$0–35',
      '35-50': '$35–50',
      '50-100': '$50–100',
      '100+': '$100+'
    }
    parts.push(priceLabels[filters.priceRange])
  }

  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const end = new Date(filters.dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    parts.push(`${start} - ${end}`)
  }

  return parts.length > 0 ? parts.join(' • ') : 'All concerts'
}