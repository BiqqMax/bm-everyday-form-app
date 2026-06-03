create or replace function public.validate_public_submission_rules()
returns trigger
language plpgsql
as $$
declare
  form_record record;
begin
  select
    f.id,
    f.is_public,
    f.expires_at,
    f.response_limit,
    f.response_count
  into form_record
  from public.forms f
  where f.id = new.form_id
  for update;

  if form_record.id is null then
    raise exception 'Form not found';
  end if;

  if form_record.is_public is not true then
    raise exception 'This form is not published';
  end if;

  if form_record.expires_at is not null and form_record.expires_at <= now() then
    raise exception 'This form has expired';
  end if;

  if form_record.response_limit is not null and form_record.response_count >= form_record.response_limit then
    raise exception 'This form has reached its response limit';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_public_submission_rules_trigger on public.submissions;
create trigger validate_public_submission_rules_trigger
before insert on public.submissions
for each row
execute function public.validate_public_submission_rules();
