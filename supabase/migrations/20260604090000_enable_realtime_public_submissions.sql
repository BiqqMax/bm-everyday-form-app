-- Enable Supabase realtime for public.submissions so the dashboard
-- can subscribe to INSERT events and show new submissions instantly.
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
