do $$
begin
  alter table public.forms
    alter column qr_share_token type text using qr_share_token::text,
    alter column qr_share_token drop default;
exception
  when duplicate_column then
    null;
end
$$;

alter table public.forms
  drop constraint if exists forms_qr_share_token_unique,
  add constraint forms_qr_share_token_unique unique (qr_share_token);
