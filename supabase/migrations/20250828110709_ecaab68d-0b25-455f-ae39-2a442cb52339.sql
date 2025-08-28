-- Create sounds table for real-time soundboard
CREATE TABLE public.sounds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sound_name text NOT NULL,
  target_person text NOT NULL DEFAULT 'GLOBAL',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sounds ENABLE ROW LEVEL SECURITY;

-- Create policy for sounds
CREATE POLICY "Allow all operations on sounds" 
ON public.sounds 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Enable realtime
ALTER TABLE public.sounds REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sounds;