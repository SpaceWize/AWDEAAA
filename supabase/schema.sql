-- ============================================================================
--  AWDEA member accounts: database setup for Supabase
-- ============================================================================
--  HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste ALL of this
--  > Run. It should finish with "Success. No rows returned". It is safe to run
--  more than once.
--
--  WHAT IT DOES
--  * Creates a `members` table: name, email, phone, when they joined.
--  * Turns on row-level security, so a signed-in person can read and change
--    ONLY THEIR OWN row. This rule is enforced by the database on every
--    request, so even someone tampering with the website in their browser
--    cannot see anyone else's details.
--  * Creates the member row automatically when someone signs up.
--  * Adds a "delete my account" function that removes the sign-in and the
--    member row together.
--
--  WHAT IT DELIBERATELY DOES NOT STORE: anything about a person's disability.
--  Phone numbers are stored as digits only. Credit cards never touch this.
-- ============================================================================

-- 1. The table ---------------------------------------------------------------
create table if not exists public.members (
  -- Same id as the sign-in record. Deleting the sign-in deletes this row too.
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  email       text,
  -- Digits only, 10 to 15 of them, or empty.
  phone       text check (phone is null or phone ~ '^[0-9]{10,15}$'),
  created_at  timestamptz not null default now()
);

-- One account per phone number, so one person cannot hold several raffle
-- entries by registering repeatedly. Empty phone numbers are not compared.
create unique index if not exists members_phone_unique
  on public.members (phone) where phone is not null;

-- 2. Who may do what ---------------------------------------------------------
alter table public.members enable row level security;

-- Start from nothing, then grant back only what is needed.
revoke all on public.members from anon, authenticated;
grant select on public.members to authenticated;
-- A member may change their name and phone, but not their id, email or date.
grant update (name, phone) on public.members to authenticated;

drop policy if exists "members read own row" on public.members;
create policy "members read own row" on public.members
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "members update own row" on public.members;
create policy "members update own row" on public.members
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- There is deliberately NO insert or delete policy: rows are created by the
-- trigger below and removed by delete_my_account(), never directly.

-- 3. Create the member row when someone signs up -----------------------------
-- The sign-up form passes the name and phone along with the email address.
create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_phone text;
begin
  clean_phone := nullif(
    regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '\D', '', 'g'),
    ''
  );

  insert into public.members (id, name, email, phone)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), 'Member'), 80),
    new.email,
    clean_phone
  );
  return new;
end;
$$;

revoke all on function public.handle_new_member() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_member();

-- 4. Let a member delete their own account -----------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  -- Removes the sign-in; the members row goes with it (on delete cascade).
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ============================================================================
--  CHECKING IT WORKED (optional; run each line separately)
--    select count(*) from public.members;
--        -> 0 for now. Open Table Editor > members: it should show "RLS enabled".
--  Later, once someone has signed up, the real test of privacy is to read the
--  table while signed out and confirm you get nothing back.
-- ============================================================================
