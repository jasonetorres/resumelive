-- Enable real-time functionality for the tables
ALTER TABLE public.ratings REPLICA IDENTITY FULL;
ALTER TABLE public.current_target REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.current_target;