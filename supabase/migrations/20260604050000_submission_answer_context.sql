create table if not exists public.submission_answer_context (
  submission_id uuid primary key references public.submissions (id) on delete cascade,
  form_id uuid not null references public.forms (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_submission_answer_context_form_id
  on public.submission_answer_context (form_id);

create or replace function public.capture_submission_answer_context()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.submission_answer_context (submission_id, form_id)
  values (new.id, new.form_id)
  on conflict (submission_id) do update
    set form_id = excluded.form_id;

  return new;
end;
$$;

drop trigger if exists capture_submission_answer_context_trigger on public.submissions;
create trigger capture_submission_answer_context_trigger
after insert on public.submissions
for each row
execute function public.capture_submission_answer_context();

create or replace function public.validate_submission_answer_value()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  field_type public.form_field_type;
  is_required boolean;
  submission_form_id uuid;
begin
  select c.form_id
  into submission_form_id
  from public.submission_answer_context c
  where c.submission_id = new.submission_id;

  if submission_form_id is null then
    raise exception 'Invalid submission id: %', new.submission_id;
  end if;

  select ff.field_type, ff.is_required
  into field_type, is_required
  from public.form_fields ff
  where ff.id = new.form_field_id
    and ff.form_id = submission_form_id;

  if field_type is null then
    raise exception 'Invalid form field for submission: %', new.form_field_id;
  end if;

  case field_type
    when 'checkbox' then
      if jsonb_typeof(new.answer_value) <> 'array' then
        raise exception 'Checkbox answers must be stored as a JSON array';
      end if;

      if is_required and jsonb_array_length(new.answer_value) = 0 then
        raise exception 'Required checkbox answers cannot be empty';
      end if;
    when 'select', 'radio', 'text', 'textarea', 'email', 'phone', 'date' then
      if jsonb_typeof(new.answer_value) <> 'string' then
        raise exception '% answers must be stored as a JSON string', field_type;
      end if;

      if is_required and length(trim(both from new.answer_value #>> '{}')) = 0 then
        raise exception 'Required answers cannot be empty';
      end if;
    else
      raise exception 'Unsupported form field type: %', field_type;
  end case;

  return new;
end;
$$;
