-- Enable realtime for questions table
ALTER TABLE public.questions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;