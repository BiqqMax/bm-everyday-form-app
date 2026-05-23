create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'form_field_type'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.form_field_type as enum (
      'text',
      'textarea',
      'email',
      'phone',
      'select',
      'checkbox',
      'radio',
      'date'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.users (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.validate_submission_answer_value()
returns trigger
language plpgsql
as $$
declare
  field_type public.form_field_type;
  is_required boolean;
  submission_form_id uuid;
begin
  select s.form_id
  into submission_form_id
  from public.submissions s
  where s.id = new.submission_id;

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

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_display_name_not_blank check (display_name is null or length(trim(both from display_name)) > 0),
  constraint users_avatar_url_not_blank check (avatar_url is null or length(trim(both from avatar_url)) > 0)
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text,
  is_public boolean not null default false,
  public_slug text not null,
  qr_share_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forms_title_not_blank check (length(trim(both from title)) > 0),
  constraint forms_public_slug_format check (
    public_slug = lower(public_slug)
    and public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint forms_description_not_blank check (description is null or length(trim(both from description)) > 0),
  constraint forms_public_slug_unique unique (public_slug),
  constraint forms_qr_share_token_unique unique (qr_share_token)
);

create table if not exists public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  label text not null,
  field_type public.form_field_type not null,
  is_required boolean not null default false,
  position integer not null,
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint form_fields_label_not_blank check (length(trim(both from label)) > 0),
  constraint form_fields_position_positive check (position > 0),
  constraint form_fields_options_shape check (
    case
      when field_type in ('select', 'radio', 'checkbox') then
        jsonb_typeof(options) = 'array' and jsonb_array_length(options) > 0
      else
        options = '[]'::jsonb
    end
  ),
  constraint form_fields_options_not_null check (jsonb_typeof(options) <> 'null'),
  constraint form_fields_position_unique unique (form_id, position)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  submitted_by_user_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint submissions_self_owned_or_public check (submitted_by_user_id is null or submitted_by_user_id <> '00000000-0000-0000-0000-000000000000'::uuid)
);

create table if not exists public.submission_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  form_field_id uuid not null references public.form_fields (id) on delete cascade,
  answer_value jsonb not null,
  created_at timestamptz not null default now(),
  constraint submission_answers_value_not_null check (jsonb_typeof(answer_value) <> 'null'),
  constraint submission_answers_unique_field_per_submission unique (submission_id, form_field_id)
);

create index if not exists idx_users_created_at on public.users (created_at desc);

create index if not exists idx_forms_owner_id_created_at on public.forms (owner_id, created_at desc);
create index if not exists idx_forms_is_public on public.forms (is_public) where is_public = true;
create index if not exists idx_forms_qr_share_token on public.forms (qr_share_token);

create index if not exists idx_form_fields_form_id_position on public.form_fields (form_id, position);
create index if not exists idx_form_fields_form_id_field_type on public.form_fields (form_id, field_type);

create index if not exists idx_submissions_form_id_created_at on public.submissions (form_id, created_at desc);
create index if not exists idx_submissions_submitted_by_user_id on public.submissions (submitted_by_user_id);

create index if not exists idx_submission_answers_submission_id on public.submission_answers (submission_id);
create index if not exists idx_submission_answers_form_field_id on public.submission_answers (form_field_id);

alter table public.users enable row level security;
alter table public.forms enable row level security;
alter table public.form_fields enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_answers enable row level security;

alter table public.users force row level security;
alter table public.forms force row level security;
alter table public.form_fields force row level security;
alter table public.submissions force row level security;
alter table public.submission_answers force row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users
for select
using (auth.uid() = id);

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
on public.users
for insert
with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users_delete_own" on public.users;
create policy "users_delete_own"
on public.users
for delete
using (auth.uid() = id);

drop policy if exists "forms_select_own_or_public" on public.forms;
create policy "forms_select_own_or_public"
on public.forms
for select
using (is_public = true or owner_id = auth.uid());

drop policy if exists "forms_insert_own" on public.forms;
create policy "forms_insert_own"
on public.forms
for insert
with check (owner_id = auth.uid());

drop policy if exists "forms_update_own" on public.forms;
create policy "forms_update_own"
on public.forms
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "forms_delete_own" on public.forms;
create policy "forms_delete_own"
on public.forms
for delete
using (owner_id = auth.uid());

drop policy if exists "form_fields_select_public_or_owner" on public.form_fields;
create policy "form_fields_select_public_or_owner"
on public.form_fields
for select
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and (f.is_public = true or f.owner_id = auth.uid())
  )
);

drop policy if exists "form_fields_insert_owner_only" on public.form_fields;
create policy "form_fields_insert_owner_only"
on public.form_fields
for insert
with check (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "form_fields_update_owner_only" on public.form_fields;
create policy "form_fields_update_owner_only"
on public.form_fields
for update
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "form_fields_delete_owner_only" on public.form_fields;
create policy "form_fields_delete_owner_only"
on public.form_fields
for delete
using (
  exists (
    select 1
    from public.forms f
    where f.id = form_fields.form_id
      and f.owner_id = auth.uid()
  )
);

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
);

drop policy if exists "submissions_insert_public_or_owner" on public.submissions;
create policy "submissions_insert_public_or_owner"
on public.submissions
for insert
with check (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and (f.is_public = true or f.owner_id = auth.uid())
  )
  and (
    submitted_by_user_id is null
    or submitted_by_user_id = auth.uid()
  )
);

drop policy if exists "submissions_update_owner_or_submitter" on public.submissions;
create policy "submissions_update_owner_or_submitter"
on public.submissions
for update
using (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and f.owner_id = auth.uid()
  )
  or submitted_by_user_id = auth.uid()
)
with check (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and f.owner_id = auth.uid()
  )
  or submitted_by_user_id = auth.uid()
);

drop policy if exists "submissions_delete_owner_or_submitter" on public.submissions;
create policy "submissions_delete_owner_or_submitter"
on public.submissions
for delete
using (
  exists (
    select 1
    from public.forms f
    where f.id = submissions.form_id
      and f.owner_id = auth.uid()
  )
  or submitted_by_user_id = auth.uid()
);

drop policy if exists "submission_answers_select_owner_or_submitter" on public.submission_answers;
create policy "submission_answers_select_owner_or_submitter"
on public.submission_answers
for select
using (
  exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_answers.submission_id
      and (
        f.owner_id = auth.uid()
        or s.submitted_by_user_id = auth.uid()
      )
  )
);

drop policy if exists "submission_answers_insert_public_or_owner" on public.submission_answers;
create policy "submission_answers_insert_public_or_owner"
on public.submission_answers
for insert
with check (
  exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_answers.submission_id
      and (
        f.is_public = true
        or f.owner_id = auth.uid()
        or s.submitted_by_user_id = auth.uid()
      )
  )
);

drop policy if exists "submission_answers_update_owner_or_submitter" on public.submission_answers;
create policy "submission_answers_update_owner_or_submitter"
on public.submission_answers
for update
using (
  exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_answers.submission_id
      and (
        f.owner_id = auth.uid()
        or s.submitted_by_user_id = auth.uid()
      )
  )
)
with check (
  exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_answers.submission_id
      and (
        f.owner_id = auth.uid()
        or s.submitted_by_user_id = auth.uid()
      )
  )
);

drop policy if exists "submission_answers_delete_owner_or_submitter" on public.submission_answers;
create policy "submission_answers_delete_owner_or_submitter"
on public.submission_answers
for delete
using (
  exists (
    select 1
    from public.submissions s
    join public.forms f on f.id = s.form_id
    where s.id = submission_answers.submission_id
      and (
        f.owner_id = auth.uid()
        or s.submitted_by_user_id = auth.uid()
      )
  )
);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists set_forms_updated_at on public.forms;
create trigger set_forms_updated_at
before update on public.forms
for each row
execute function public.set_updated_at();

drop trigger if exists set_form_fields_updated_at on public.form_fields;
create trigger set_form_fields_updated_at
before update on public.form_fields
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

drop trigger if exists validate_submission_answer_value_trigger on public.submission_answers;
create trigger validate_submission_answer_value_trigger
before insert or update on public.submission_answers
for each row
execute function public.validate_submission_answer_value();
