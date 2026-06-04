drop policy if exists "submissions_select_owner_or_submitter" on public.submissions;

create policy "submissions_select_owner_or_submitter"
on public.submissions
for select
using (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and f.owner_id = auth.uid()
  )
  or submitted_by_user_id = auth.uid()
  or (
    auth.uid() is null
    and submitted_by_user_id is null
    and exists (
      select 1
      from public.forms f
      where f.id = submissions.form_id
        and f.is_public = true
    )
  )
);
