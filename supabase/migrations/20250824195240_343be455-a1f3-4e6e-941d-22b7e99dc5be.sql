-- Fix function search path security issue
-- Update the existing update_updated_at_column function to have secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Create a secure function for database operations with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_timestamp()
RETURNS timestamp with time zone
LANGUAGE sql
SET search_path = ''
IMMUTABLE
AS $function$
  SELECT now();
$function$;