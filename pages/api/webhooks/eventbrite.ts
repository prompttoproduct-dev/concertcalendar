import { NextApiRequest, NextApiResponse } from 'next'
import { webhookHandler } from '@/lib/webhook-handlers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const clientIp = req.headers['x-forwarded-for'] as string || 
                    req.headers['x-real-ip'] as string || 
                    req.socket.remoteAddress || 
                    'unknown'

    const result = await webhookHandler.handleEventbriteWebhook(
      req.body,
      req.headers as Record<string, string>,
      clientIp
    )
    
    if (result.success) {
      res.status(200).json({ message: result.message })
    } else {
      res.status(400).json({ message: result.message })
    }
  } catch (error) {
    console.error('Eventbrite webhook error:', error)
    res.status(500).json({ 
      message: 'Webhook processing failed'
    })
  }
}