-- Create timer table for host-controlled timer
CREATE TABLE public.timer (
  id integer PRIMARY KEY DEFAULT 1,
  minutes integer NOT NULL DEFAULT 5,
  seconds integer NOT NULL DEFAULT 0,
  is_running boolean NOT NULL DEFAULT false,
  started_at timestamp with time zone,
  paused_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default timer state
INSERT INTO public.timer (id, minutes, seconds, is_running) VALUES (1, 5, 0, false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.timer ENABLE ROW LEVEL SECURITY;

-- Create policy for timer access
CREATE POLICY "Allow all operations on timer" 
ON public.timer 
FOR ALL 
USING (true) 
WITH CHECK (true);