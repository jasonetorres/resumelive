-- Add orientation column to display_settings table
ALTER TABLE public.display_settings 
ADD COLUMN IF NOT EXISTS orientation TEXT NOT NULL DEFAULT 'landscape';