-- ==============================================================================
-- SCHEMA FOR APK & IPA APP DISTRIBUTION PLATFORM (Diawi / AppsOnAir Alternative)
-- Run this in your Supabase Project's SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  is_paid boolean default false,
  plan_tier text default 'free', -- 'free' | 'paid'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. APPS TABLE (Grouping releases by app)
create table if not exists public.apps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  bundle_id text,
  platform text check (platform in ('ios', 'android', 'both')) default 'both',
  icon_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RELEASES TABLE (Stores APK/IPA builds, environment, download links, expiry)
create table if not exists public.releases (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  app_id uuid references public.apps on delete cascade,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  platform text not null check (platform in ('ios', 'android')),
  environment text not null check (environment in ('DEV', 'UAT', 'PROD', 'STAGING')) default 'DEV',
  version text default '1.0.0',
  build_number text default '1',
  bundle_id text,
  min_os_version text,
  provisioning_type text default 'Ad-Hoc',
  release_notes text,
  file_name text not null,
  file_url text not null,
  s3_key text,
  file_size bigint default 0,
  is_paid boolean default false,
  expires_at timestamp with time zone, -- NULL for paid (lifetime), 20 days from creation for free
  download_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.apps enable row level security;
alter table public.releases enable row level security;

-- PROFILES POLICIES
create policy "Allow users to read their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Allow users to update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Allow users to insert their profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- APPS POLICIES
create policy "Users can view their own apps" 
  on public.apps for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own apps" 
  on public.apps for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own apps" 
  on public.apps for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own apps" 
  on public.apps for delete 
  using (auth.uid() = user_id);

-- RELEASES POLICIES
-- Anyone can view releases via public link (as long as it's not expired or checked at app level)
create policy "Anyone can view releases" 
  on public.releases for select 
  using (true);

create policy "Authenticated users can create releases" 
  on public.releases for insert 
  with check (auth.uid() is not null);

create policy "Users can update their own releases" 
  on public.releases for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own releases" 
  on public.releases for delete 
  using (auth.uid() = user_id);

-- Automatic Profile Creation on User Sign Up (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, is_paid, plan_tier)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    false,
    'free'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Increment download counter function (accessible publicly)
create or replace function public.increment_release_download(release_slug text)
returns void as $$
begin
  update public.releases
  set download_count = download_count + 1
  where slug = release_slug;
end;
$$ language plpgsql security definer;

