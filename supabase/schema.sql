create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  caption text,
  slogan text,
  media_url text not null,
  media_type text not null check (media_type in ('image','video')),
  public_id text,
  created_at timestamptz not null default now()
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image','video')),
  public_id text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  location text,
  banner_url text,
  public_id text,
  thumbnail_public_id text,
  event_date timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  caption text,
  slogan text,
  video_url text not null,
  thumbnail_url text,
  public_id text,
  thumbnail_public_id text,
  created_at timestamptz not null default now()
);

create table if not exists short_films (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  slogan text,
  video_url text not null,
  thumbnail_url text,
  public_id text,
  thumbnail_public_id text,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','reel','short_film')),
  target_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
alter table posts enable row level security;
alter table stories enable row level security;
alter table events enable row level security;
alter table reels enable row level security;
alter table short_films enable row level security;
alter table comments enable row level security;

drop policy if exists "profiles readable by all" on profiles;
create policy "profiles readable by all"
on profiles
for select
using (true);

drop policy if exists "users update own profile" on profiles;
create policy "users update own profile"
on profiles
for update
using (auth.uid() = id);

drop policy if exists "posts readable by all" on posts;
create policy "posts readable by all"
on posts
for select
using (true);

drop policy if exists "admins create posts" on posts;
create policy "admins create posts"
on posts
for insert
with check (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins update posts" on posts;
create policy "admins update posts"
on posts
for update
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins delete posts" on posts;
create policy "admins delete posts"
on posts
for delete
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "stories readable by all" on stories;
create policy "stories readable by all"
on stories
for select
using (true);

drop policy if exists "admins create stories" on stories;
create policy "admins create stories"
on stories
for insert
with check (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins update stories" on stories;
create policy "admins update stories"
on stories
for update
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins delete stories" on stories;
create policy "admins delete stories"
on stories
for delete
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "events readable by all" on events;
create policy "events readable by all"
on events
for select
using (true);

drop policy if exists "admins create events" on events;
create policy "admins create events"
on events
for insert
with check (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins update events" on events;
create policy "admins update events"
on events
for update
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins delete events" on events;
create policy "admins delete events"
on events
for delete
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "reels readable by all" on reels;
create policy "reels readable by all"
on reels
for select
using (true);

drop policy if exists "admins create reels" on reels;
create policy "admins create reels"
on reels
for insert
with check (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins update reels" on reels;
create policy "admins update reels"
on reels
for update
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins delete reels" on reels;
create policy "admins delete reels"
on reels
for delete
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "short films readable by all" on short_films;
create policy "short films readable by all"
on short_films
for select
using (true);

drop policy if exists "admins create short films" on short_films;
create policy "admins create short films"
on short_films
for insert
with check (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins update short films" on short_films;
create policy "admins update short films"
on short_films
for update
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins delete short films" on short_films;
create policy "admins delete short films"
on short_films
for delete
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "comments readable by all" on comments;
create policy "comments readable by all"
on comments
for select
using (true);

drop policy if exists "signed in users create comments" on comments;
create policy "signed in users create comments"
on comments
for insert
with check (auth.uid() = user_id);

drop policy if exists "users delete own comments" on comments;
create policy "users delete own comments"
on comments
for delete
using (auth.uid() = user_id);