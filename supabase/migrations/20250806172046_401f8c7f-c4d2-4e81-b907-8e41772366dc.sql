-- Create ratings table for person-specific tracking
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_person TEXT NOT NULL,
  overall INTEGER NOT NULL CHECK (overall >= 1 AND overall <= 5),
  presentation INTEGER NOT NULL CHECK (presentation >= 1 AND presentation <= 5),
  content INTEGER NOT NULL CHECK (content >= 1 AND content <= 5),
  feedback TEXT,
  category TEXT NOT NULL CHECK (category IN ('resume', 'linkedin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but allow public access since no auth needed)
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read and insert ratings
CREATE POLICY "Anyone can view ratings" 
ON public.ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert ratings" 
ON public.ratings 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to delete ratings (for clearing)
CREATE POLICY "Anyone can delete ratings" 
ON public.ratings 
FOR DELETE 
USING (true);

-- Create current_target table to track who is being rated
CREATE TABLE public.current_target (
  id INTEGER PRIMARY KEY DEFAULT 1,
  target_person TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (id = 1) -- Ensure only one row
);

-- Enable RLS for current_target
ALTER TABLE public.current_target ENABLE ROW LEVEL SECURITY;

-- Create policies for current_target
CREATE POLICY "Anyone can view current target" 
ON public.current_target 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update current target" 
ON public.current_target 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can insert current target" 
ON public.current_target 
FOR INSERT 
WITH CHECK (true);

-- Insert initial row
INSERT INTO public.current_target (target_person) VALUES (NULL);

-- Enable realtime for both tables
ALTER TABLE public.ratings REPLICA IDENTITY FULL;
ALTER TABLE public.current_target REPLICA IDENTITY FULL;