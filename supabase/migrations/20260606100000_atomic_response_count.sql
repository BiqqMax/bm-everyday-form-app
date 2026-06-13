-- Migration: Atomic response_count increment with limit enforcement
--
-- Replaces the old blind-increment RPC (increment_form_response_count_rpc)
-- with a function that:
--   1. Locks the form row (SELECT ... FOR UPDATE) to prevent concurrent bypass
--   2. Reads response_limit and response_count inside the same transaction
--   3. Rejects if limit is already reached
--   4. Increments response_count atomically
--   5. Returns boolean: true = accepted, false = limit_reached
--
-- Also adds a decrement RPC for rollback if submission insertion fails
-- after the count has been incremented.

-- ── Drop old RPC ────────────────────────────────────────────────────
drop function if exists public.increment_form_response_count_rpc(uuid);

-- ── Atomic increment with limit check ───────────────────────────────
create or replace function public.increment_form_response_count_rpc(form_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_response_count integer;
  v_response_limit integer;
begin
  -- Lock the form row so no concurrent request can read stale values
  select response_count, response_limit
  into strict v_response_count, v_response_limit
  from public.forms
  where id = form_id
  for update;

  v_response_count := coalesce(v_response_count, 0);

  -- Reject if response_limit is set and already met or exceeded
  if v_response_limit is not null and v_response_count >= v_response_limit then
    return false;
  end if;

  -- Safe to increment
  update public.forms
  set response_count = v_response_count + 1
  where id = form_id;

  return true;
end;
$$;

-- ── Decrement RPC (rollback helper) ─────────────────────────────────
-- Called by the application when the count was incremented but the
-- submission insert subsequently fails.
create or replace function public.decrement_form_response_count_rpc(form_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.forms
  set response_count = greatest(0, coalesce(response_count, 0) - 1)
  where id = form_id;
end;
$$;
