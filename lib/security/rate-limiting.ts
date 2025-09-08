interface RateLimitEntry {
  count: number
  resetTime: number
}

export class RateLimiter {
  private static requests = new Map<string, RateLimitEntry>()
  
  // Rate limiting: 100 requests per 15 minutes per IP
  private static readonly WINDOW_MS = 15 * 60 * 1000 // 15 minutes
  private static readonly MAX_REQUESTS = 100

  static isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.WINDOW_MS
      })
      return false
    }

    entry.count++
    
    if (entry.count > this.MAX_REQUESTS) {
      return true
    }

    return false
  }

  static cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  static getRemainingRequests(identifier: string): number {
    const entry = this.requests.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return this.MAX_REQUESTS
    }
    return Math.max(0, this.MAX_REQUESTS - entry.count)
  }
}

// Clean up old entries every 30 minutes
setInterval(() => {
  RateLimiter.cleanup()
}, 30 * 60 * 1000)