import crypto from 'crypto'

export class SignatureValidator {
  static validateTicketmasterSignature(
    payload: string, 
    signature: string, 
    secret: string
  ): boolean {
    try {
      if (!secret) {
        console.error('Ticketmaster webhook secret not configured')
        return false
      }

      // Ticketmaster typically uses HMAC-SHA256
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      // Remove 'sha256=' prefix if present
      const cleanSignature = signature.replace(/^sha256=/, '')
      
      return crypto.timingSafeEqual(
        Buffer.from(cleanSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )
    } catch (error) {
      console.error('Ticketmaster signature validation error:', error)
      return false
    }
  }

  static validateEventbriteSignature(
    payload: string, 
    signature: string, 
    secret: string
  ): boolean {
    try {
      if (!secret) {
        console.error('Eventbrite webhook secret not configured')
        return false
      }

      // Eventbrite uses HMAC-SHA256
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64')

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    } catch (error) {
      console.error('Eventbrite signature validation error:', error)
      return false
    }
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }
}