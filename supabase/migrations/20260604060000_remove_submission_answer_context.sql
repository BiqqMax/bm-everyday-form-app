drop trigger if exists validate_submission_answer_value_trigger on public.submission_answers;
drop trigger if exists capture_submission_answer_context_trigger on public.submissions;

drop function if exists public.validate_submission_answer_value();
drop function if exists public.capture_submission_answer_context();

drop table if exists public.submission_answer_context;
