do $$
begin
  alter table public.profiles
    add column if not exists default_expiry_minutes integer,
    add column if not exists default_response_limit integer,
    add column if not exists default_publish_state boolean not null default false,
    add column if not exists enable_qr_generation boolean not null default true,
    add column if not exists auto_generate_share_links boolean not null default true,
    add column if not exists enable_email_alerts boolean not null default true,
    add column if not exists allow_anonymous_submissions boolean not null default true,
    add column if not exists restrict_multiple_submissions boolean not null default false,
    add column if not exists require_email_validation boolean not null default false;
exception
  when duplicate_column then
    null;
end
$$;

alter table public.profiles
  drop constraint if exists profiles_default_expiry_minutes_non_negative,
  add constraint profiles_default_expiry_minutes_non_negative check (default_expiry_minutes is null or default_expiry_minutes >= 0),
  drop constraint if exists profiles_default_response_limit_non_negative,
  add constraint profiles_default_response_limit_non_negative check (default_response_limit is null or default_response_limit >= 0);
