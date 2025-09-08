import { supabase } from '@/lib/supabase'

export interface SecurityEvent {
  event_type: 'webhook_received' | 'invalid_signature' | 'rate_limit_exceeded' | 'validation_failed' | 'suspicious_query'
  source: string
  client_ip: string
  user_agent?: string
  payload_summary: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
}

export class AuditLogger {
  static async logSecurityEvent(event: Partial<SecurityEvent>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        event_type: event.event_type || 'webhook_received',
        source: event.source || 'unknown',
        client_ip: event.client_ip || 'unknown',
        user_agent: event.user_agent,
        payload_summary: this.sanitizePayload(event.payload_summary),
        severity: event.severity || 'low',
        timestamp: new Date().toISOString()
      }

      // Log to console for immediate monitoring
      console.log(`[SECURITY] ${securityEvent.severity.toUpperCase()}: ${securityEvent.event_type}`, {
        source: securityEvent.source,
        ip: securityEvent.client_ip,
        timestamp: securityEvent.timestamp
      })

      // Store critical events for analysis
      if (securityEvent.severity === 'high' || securityEvent.severity === 'critical') {
        await this.persistSecurityEvent(securityEvent)
      }

    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  private static async persistSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          event_type: event.event_type,
          source: event.source,
          client_ip: event.client_ip,
          user_agent: event.user_agent,
          payload_summary: event.payload_summary,
          severity: event.severity,
          created_at: event.timestamp
        })

      if (error && !error.message.includes('relation "security_events" does not exist')) {
        console.error('Failed to persist security event:', error)
      }
    } catch (error) {
      console.error('Security event persistence error:', error)
    }
  }

  private static sanitizePayload(payload: any): any {
    if (!payload) return null

    // Remove sensitive information
    const sanitized = { ...payload }
    const sensitiveFields = ['api_key', 'secret', 'token', 'password', 'auth', 'signature']
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        delete sanitized[field]
      }
    }

    // Truncate large payloads
    const jsonString = JSON.stringify(sanitized)
    return jsonString.length > 1000 ? 
      jsonString.slice(0, 1000) + '...[truncated]' : 
      sanitized
  }

  static async logWebhookReceived(source: string, clientIp: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'webhook_received',
      source,
      client_ip: clientIp,
      user_agent: userAgent,
      severity: 'low'
    })
  }

  static async logInvalidSignature(source: string, clientIp: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'invalid_signature',
      source,
      client_ip: clientIp,
      user_agent: userAgent,
      severity: 'high'
    })
  }

  static async logRateLimitExceeded(clientIp: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'rate_limit_exceeded',
      source: 'api',
      client_ip: clientIp,
      user_agent: userAgent,
      severity: 'medium'
    })
  }

  static async logValidationFailed(source: string, clientIp: string, errors: any): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'validation_failed',
      source,
      client_ip: clientIp,
      payload_summary: errors,
      severity: 'medium'
    })
  }
}