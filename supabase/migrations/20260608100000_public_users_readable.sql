-- Allow anonymous/public read access to public.users
-- Only id, display_name, avatar_url are columns that exist in this table,
-- so only public-safe profile information is exposed.
-- No email, account_type, or other sensitive data exists in users table.

drop policy if exists "users_select_public" on public.users;
create policy "users_select_public"
on public.users
for select
using (true);
