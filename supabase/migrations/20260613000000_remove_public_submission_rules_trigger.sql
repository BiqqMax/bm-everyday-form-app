-- Drop the trigger and function that enforced public submission validation rules at the DB level.
-- This is no longer needed because the atomic RPC-based response count approach handles
-- validation in the application layer (app/api/forms/submit/route.ts), which performs
-- its own checks and uses decrement_form_response_count_rpc for rollback on failure.
-- The DB trigger was redundant with this design and could cause conflicts.

drop trigger if exists validate_public_submission_rules_trigger on public.submissions;
drop function if exists public.validate_public_submission_rules();
