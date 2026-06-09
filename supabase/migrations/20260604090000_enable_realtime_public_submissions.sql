-- Enable Supabase realtime for public.submissions so the dashboard
-- can subscribe to INSERT events and show new submissions instantly.
-- Uses SET TABLE instead of ADD TABLE so the migration is idempotent:
-- works on fresh databases and on databases where the table is already
-- a member of the publication (e.g. repeated db push or migration rerun).
ALTER PUBLICATION supabase_realtime SET TABLE public.submissions;
