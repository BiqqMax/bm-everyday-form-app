-- After a successful submission insert, increment forms.response_count
-- in application code (app/api/forms/submit/route.ts).
--
-- The old DB trigger increment_form_response_count_trigger silently fails
-- because:
--   1. forms table still has RLS enabled (forms_update_own policy)
--   2. The trigger function lacks SECURITY DEFINER
--   3. Anonymous submitters have auth.uid() = NULL, so RLS blocks the UPDATE
--
-- This migration:
--   - Drops the stale triggers (counters never worked after clean-slate migration)
--   - Creates a SECURITY DEFINER RPC function that bypasses RLS for the increment

drop trigger if exists increment_form_response_count_trigger on public.submissions;
drop trigger if exists decrement_form_response_count_trigger on public.submissions;

-- SECURITY DEFINER RPC: bypasses forms RLS so anonymous submitters can increment
-- Called from app/api/forms/submit/route.ts after successful submission insert.
create or replace function public.increment_form_response_count_rpc(form_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.forms
  set response_count = coalesce(response_count, 0) + 1
  where id = form_id;
end;
$$;
