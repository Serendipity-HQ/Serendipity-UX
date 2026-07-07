create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  interests text[] not null default '{}',
  desired_feelings text[] not null default '{}',
  goals text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text not null,
  long_description text,
  date date,
  time text,
  city text,
  location text,
  host text,
  cost text,
  category text,
  tags text[] not null default '{}',
  vibe text,
  beginner_friendly boolean not null default true,
  social_intensity text not null default 'moderate',
  cadence text not null default 'One-Time',
  image_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_experiences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  status text not null check (status in ('saved', 'going', 'attended')),
  created_at timestamptz not null default now(),
  unique(user_id, experience_id, status)
);

create table if not exists public.reflections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid references public.experiences(id) on delete set null,
  surprised_by text,
  met_someone_interesting boolean,
  would_return boolean,
  sparked_curiosity text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.user_experiences enable row level security;
alter table public.reflections enable row level security;

create policy "users can read and update own profile"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "published experiences are public"
on public.experiences for select
using (published = true);

create policy "authenticated users can manage experiences"
on public.experiences for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "users manage own experience states"
on public.user_experiences for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own reflections"
on public.reflections for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
