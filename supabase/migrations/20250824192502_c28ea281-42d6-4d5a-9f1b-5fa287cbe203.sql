-- Create security events table for audit logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('webhook_received', 'invalid_signature', 'rate_limit_exceeded', 'validation_failed', 'suspicious_query')),
  source TEXT NOT NULL,
  client_ip TEXT NOT NULL,
  user_agent TEXT,
  payload_summary JSONB,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Security events are viewable by admins only" 
ON public.security_events 
FOR SELECT 
USING (false); -- No public access - requires service role

-- Only system can insert security events
CREATE POLICY "Security events can be inserted by system only" 
ON public.security_events 
FOR INSERT 
WITH CHECK (false); -- No public access - requires service role

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_client_ip ON public.security_events(client_ip, created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_security_events_updated_at
BEFORE UPDATE ON public.security_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();