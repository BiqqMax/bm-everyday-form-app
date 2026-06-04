alter table public.submissions
  add column if not exists device_id text;

create index if not exists submissions_form_device_idx
  on public.submissions (form_id, device_id);
