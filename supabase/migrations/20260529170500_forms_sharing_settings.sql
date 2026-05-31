do $$
begin
  alter table public.forms
    add column if not exists expires_at timestamptz,
    add column if not exists response_limit integer,
    add column if not exists response_count integer not null default 0;
exception
  when duplicate_column then
    null;
end
$$;

alter table public.forms
  drop constraint if exists forms_response_limit_non_negative,
  add constraint forms_response_limit_non_negative check (response_limit is null or response_limit >= 0),
  drop constraint if exists forms_response_count_non_negative,
  add constraint forms_response_count_non_negative check (response_count >= 0);

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
  where f.id = new.form_id;

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

create or replace function public.increment_form_response_count()
returns trigger
language plpgsql
as $$
begin
  update public.forms
  set response_count = coalesce(response_count, 0) + 1
  where id = new.form_id;

  return new;
end;
$$;

create or replace function public.decrement_form_response_count()
returns trigger
language plpgsql
as $$
begin
  update public.forms
  set response_count = greatest(coalesce(response_count, 0) - 1, 0)
  where id = old.form_id;

  return old;
end;
$$;

drop trigger if exists validate_public_submission_rules_trigger on public.submissions;
create trigger validate_public_submission_rules_trigger
before insert on public.submissions
for each row
execute function public.validate_public_submission_rules();

drop trigger if exists increment_form_response_count_trigger on public.submissions;
create trigger increment_form_response_count_trigger
after insert on public.submissions
for each row
execute function public.increment_form_response_count();

drop trigger if exists decrement_form_response_count_trigger on public.submissions;
create trigger decrement_form_response_count_trigger
after delete on public.submissions
for each row
execute function public.decrement_form_response_count();
