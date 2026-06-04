-- Public submission workflow security model
-- Anonymous visitors can create submissions and submission answers for any public form.
-- Dashboard reads remain owner-only.

create or replace function public.submission_belongs_to_public_form(submission_uuid uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_uuid
      and f.is_public = true
  );
$$;

drop policy if exists "submissions_select_owner_or_submitter" on public.submissions;
create policy "submissions_select_owner_only"
on public.submissions
for select
using (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "submissions_insert_public_or_owner" on public.submissions;
create policy "submissions_insert_public_form_only"
on public.submissions
for insert
with check (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and f.is_public = true
  )
);

drop policy if exists "submissions_update_owner_or_submitter" on public.submissions;
create policy "submissions_update_owner_only"
on public.submissions
for update
using (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and f.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "submissions_delete_owner_or_submitter" on public.submissions;
create policy "submissions_delete_owner_only"
on public.submissions
for delete
using (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "submission_answers_select_owner_or_submitter" on public.submission_answers;
create policy "submission_answers_select_owner_only"
on public.submission_answers
for select
using (
  exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_answers.submission_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "submission_answers_insert_public_or_owner" on public.submission_answers;
create policy "submission_answers_insert_public_submission_only"
on public.submission_answers
for insert
with check (
  public.submission_belongs_to_public_form(submission_id)
);

drop policy if exists "submission_answers_update_owner_or_submitter" on public.submission_answers;
create policy "submission_answers_update_owner_only"
on public.submission_answers
for update
using (
  exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_answers.submission_id
      and f.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_answers.submission_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "submission_answers_delete_owner_or_submitter" on public.submission_answers;
create policy "submission_answers_delete_owner_only"
on public.submission_answers
for delete
using (
  exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_answers.submission_id
      and f.owner_id = auth.uid()
  )
);
