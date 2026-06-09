-- Add avatar_url to public.profiles so public form loaders can
-- source display_name and avatar_url from a single profiles query.
alter table public.profiles
add column if not exists avatar_url text;

alter table public.profiles
drop constraint if exists profiles_avatar_url_not_blank,
add constraint profiles_avatar_url_not_blank check (avatar_url is null or length(trim(both from avatar_url)) > 0);
