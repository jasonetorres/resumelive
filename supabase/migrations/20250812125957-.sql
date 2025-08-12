-- Enable real-time updates for ratings table
ALTER TABLE public.ratings REPLICA IDENTITY FULL;

-- Add the ratings table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;

-- Enable real-time updates for current_target table  
ALTER TABLE public.current_target REPLICA IDENTITY FULL;

-- Add the current_target table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.current_target;