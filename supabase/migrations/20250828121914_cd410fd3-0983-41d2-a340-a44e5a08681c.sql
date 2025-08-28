-- Enable realtime for display_settings table only
ALTER TABLE public.display_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.display_settings;