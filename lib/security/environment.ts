import { apiKeySchema } from './validation'

export class EnvironmentValidator {
  private static validatedKeys = new Set<string>()

  static validateApiKey(key: string | undefined, keyName: string): string {
    if (!key) {
      throw new Error(`${keyName} is not configured`)
    }

    if (this.validatedKeys.has(keyName)) {
      return key
    }

    const result = apiKeySchema.safeParse(key)
    if (!result.success) {
      throw new Error(`Invalid ${keyName} format: ${result.error.message}`)
    }

    this.validatedKeys.add(keyName)
    return key
  }

  static validateRequiredEnvVars(): void {
    const required = [
      'TICKETMASTER_API_KEY',
      'EVENTBRITE_API_KEY', 
      'TICKETMASTER_WEBHOOK_SECRET',
      'EVENTBRITE_WEBHOOK_SECRET'
    ]

    const missing = required.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }

  static getSecureApiKey(keyName: string): string {
    const key = process.env[keyName]
    return this.validateApiKey(key, keyName)
  }

  static maskSensitiveData(data: any): any {
    const sensitiveFields = ['api_key', 'secret', 'token', 'password', 'auth']
    
    if (typeof data === 'string') {
      return data.length > 8 ? `${data.slice(0, 4)}****${data.slice(-4)}` : '****'
    }

    if (typeof data === 'object' && data !== null) {
      const masked = { ...data }
      for (const field of sensitiveFields) {
        if (field in masked) {
          masked[field] = '****'
        }
      }
      return masked
    }

    return data
  }
}