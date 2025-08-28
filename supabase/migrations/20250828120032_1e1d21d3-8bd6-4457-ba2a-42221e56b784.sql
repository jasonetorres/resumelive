-- Create display_settings table for controlling what's shown on the display
CREATE TABLE IF NOT EXISTS public.display_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  results_hidden BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.display_settings (id, results_hidden) 
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.display_settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations on display_settings
CREATE POLICY "Allow all operations on display_settings" 
ON public.display_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_display_settings_updated_at
  BEFORE UPDATE ON public.display_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();