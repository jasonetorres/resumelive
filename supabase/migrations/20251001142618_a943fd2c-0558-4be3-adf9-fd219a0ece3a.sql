-- Create signup_settings table
CREATE TABLE IF NOT EXISTS public.signup_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  signup_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT signup_settings_id_check CHECK (id = 1)
);

-- Insert default row
INSERT INTO public.signup_settings (id, signup_enabled)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.signup_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on signup_settings"
  ON public.signup_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_signup_settings_updated_at
  BEFORE UPDATE ON public.signup_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();