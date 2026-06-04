-- CLEAN SLATE: Remove ALL RLS from submissions and submission_answers.
-- Application-layer validation only. No triggers, no RLS, no DB enforcement.

-- Drop all policies on submissions
drop policy if exists "submissions_select_owner_only" on public.submissions;
drop policy if exists "submissions_insert_public_form_only" on public.submissions;
drop policy if exists "submissions_update_owner_only" on public.submissions;
drop policy if exists "submissions_delete_owner_only" on public.submissions;
drop policy if exists "submissions_select_owner_or_submitter" on public.submissions;
drop policy if exists "submissions_insert_public_or_owner" on public.submissions;
drop policy if exists "submissions_update_owner_or_submitter" on public.submissions;
drop policy if exists "submissions_delete_owner_or_submitter" on public.submissions;

-- Drop all policies on submission_answers
drop policy if exists "submission_answers_select_owner_only" on public.submission_answers;
drop policy if exists "submission_answers_insert_public_submission_only" on public.submission_answers;
drop policy if exists "submission_answers_update_owner_only" on public.submission_answers;
drop policy if exists "submission_answers_delete_owner_only" on public.submission_answers;
drop policy if exists "submission_answers_select_owner_or_submitter" on public.submission_answers;
drop policy if exists "submission_answers_insert_public_or_owner" on public.submission_answers;
drop policy if exists "submission_answers_update_owner_or_submitter" on public.submission_answers;
drop policy if exists "submission_answers_delete_owner_or_submitter" on public.submission_answers;

-- Disable RLS on both tables
alter table public.submissions disable row level security;
alter table public.submission_answers disable row level security;

-- Drop helper functions
drop function if exists public.submission_belongs_to_public_form(uuid);
