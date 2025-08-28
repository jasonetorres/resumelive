-- Enable realtime for ratings and display_settings tables
ALTER TABLE public.ratings REPLICA IDENTITY FULL;
ALTER TABLE public.display_settings REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.display_settings;