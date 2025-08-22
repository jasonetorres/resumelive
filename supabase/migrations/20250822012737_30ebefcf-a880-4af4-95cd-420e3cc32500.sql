-- Create time slots table for available booking times
CREATE TABLE public.time_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create bookings table to track who booked what slots
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  time_slot_id uuid NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'confirmed',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(time_slot_id) -- Only one booking per time slot
);

-- Create scheduling settings table to control feature toggle and other settings
CREATE TABLE public.scheduling_settings (
  id integer PRIMARY KEY DEFAULT 1,
  scheduling_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK (id = 1) -- Ensure only one row exists
);

-- Insert default settings
INSERT INTO public.scheduling_settings (scheduling_enabled) VALUES (false);

-- Enable RLS on all tables
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduling_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is for events/booths)
CREATE POLICY "Allow all operations on time_slots" 
ON public.time_slots 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on bookings" 
ON public.bookings 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on scheduling_settings" 
ON public.scheduling_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_time_slots_updated_at
BEFORE UPDATE ON public.time_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduling_settings_updated_at
BEFORE UPDATE ON public.scheduling_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();