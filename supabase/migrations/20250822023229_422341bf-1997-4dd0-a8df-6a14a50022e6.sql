-- Enable realtime for remaining tables that aren't already enabled

-- Enable realtime for question_upvotes (used in QASection)
ALTER TABLE public.question_upvotes REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.question_upvotes;

-- Enable realtime for leads (used in FormDisplay)
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.leads;

-- Enable realtime for bookings (used in SchedulePage)
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.bookings;

-- Enable realtime for time_slots (for real-time availability updates)
ALTER TABLE public.time_slots REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.time_slots;

-- Enable realtime for scheduling_settings (for real-time enable/disable)
ALTER TABLE public.scheduling_settings REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.scheduling_settings;

-- Enable realtime for resumes (for real-time resume uploads)
ALTER TABLE public.resumes REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.resumes;