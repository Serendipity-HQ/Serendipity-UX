create extension if not exists "uuid-ossp";

create extension if not exists pg_trgm;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  city text,
  interests text[] not null default '{}',
  desired_feelings text[] not null default '{}',
  goals text[] not null default '{}',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique,
  description text not null default '',
  long_description text,
  date date,
  time text,
  start_time timestamptz,
  end_time timestamptz,
  timezone text not null default 'America/Los_Angeles',
  city text,
  neighborhood text,
  address text,
  latitude numeric,
  longitude numeric,
  venue_name text,
  host_name text,
  source_name text,
  source_url text,
  canonical_url text,
  location text,
  host text,
  cost text,
  cost_min numeric,
  cost_max numeric,
  currency text not null default 'USD',
  category text,
  tags text[] not null default '{}',
  vibe text[] not null default '{}',
  recommendation_bucket text not null default 'unknown' check (recommendation_bucket in ('passion', 'growth', 'surprise', 'unknown')),
  beginner_friendly boolean not null default true,
  social_intensity integer not null default 3 check (social_intensity between 1 and 5),
  recurring boolean not null default false,
  recurrence_rule text,
  capacity integer,
  cadence text not null default 'One-Time',
  image_url text,
  status text not null default 'approved' check (status in ('draft', 'review', 'approved', 'rejected', 'expired')),
  featured boolean not null default false,
  quality_score numeric not null default 0,
  serendipity_score numeric not null default 0,
  submitted_by uuid references public.profiles(id) on delete set null,
  admin_notes text,
  last_seen_at timestamptz,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.experiences add column if not exists start_time timestamptz;
alter table public.experiences add column if not exists end_time timestamptz;
alter table public.experiences add column if not exists timezone text not null default 'America/Los_Angeles';
alter table public.experiences add column if not exists neighborhood text;
alter table public.experiences add column if not exists address text;
alter table public.experiences add column if not exists latitude numeric;
alter table public.experiences add column if not exists longitude numeric;
alter table public.experiences add column if not exists venue_name text;
alter table public.experiences add column if not exists host_name text;
alter table public.experiences add column if not exists source_name text;
alter table public.experiences add column if not exists source_url text;
alter table public.experiences add column if not exists canonical_url text;
alter table public.experiences add column if not exists cost_min numeric;
alter table public.experiences add column if not exists cost_max numeric;
alter table public.experiences add column if not exists currency text not null default 'USD';
alter table public.experiences add column if not exists recommendation_bucket text not null default 'unknown';
alter table public.experiences add column if not exists recurring boolean not null default false;
alter table public.experiences add column if not exists recurrence_rule text;
alter table public.experiences add column if not exists capacity integer;
alter table public.experiences add column if not exists status text not null default 'approved';
alter table public.experiences add column if not exists featured boolean not null default false;
alter table public.experiences add column if not exists quality_score numeric not null default 0;
alter table public.experiences add column if not exists serendipity_score numeric not null default 0;
alter table public.experiences add column if not exists submitted_by uuid references public.profiles(id) on delete set null;
alter table public.experiences add column if not exists admin_notes text;
alter table public.experiences add column if not exists last_seen_at timestamptz;

alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists is_admin boolean not null default false;

create table if not exists public.communities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  city text,
  neighborhood text,
  website_url text,
  instagram_url text,
  tiktok_url text,
  luma_url text,
  eventbrite_url text,
  meetup_url text,
  tags text[] not null default '{}',
  status text not null default 'review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  city text,
  neighborhood text,
  address text,
  latitude numeric,
  longitude numeric,
  website_url text,
  tags text[] not null default '{}',
  status text not null default 'review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_records (
  id uuid primary key default uuid_generate_v4(),
  source_name text not null,
  source_url text not null,
  raw_payload jsonb not null default '{}',
  extracted_payload jsonb,
  content_hash text,
  fetched_at timestamptz not null default now(),
  parse_status text not null default 'fetched',
  error_message text
);

create table if not exists public.review_queue (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null check (entity_type in ('experience', 'community', 'venue', 'source_record')),
  entity_id uuid not null,
  reason text not null,
  confidence numeric not null default 0,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_status text not null default 'pending'
);

create table if not exists public.user_experiences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  status text not null check (status in ('saved', 'going', 'attended', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, experience_id, status)
);

create table if not exists public.reflections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid references public.experiences(id) on delete set null,
  attended boolean not null default true,
  surprised_by text,
  people_met text,
  met_someone_interesting boolean,
  would_return boolean,
  sparked_interest_tags text[] not null default '{}',
  sparked_curiosity text,
  private_note text,
  created_at timestamptz not null default now()
);

alter table public.user_experiences add column if not exists updated_at timestamptz not null default now();
alter table public.reflections add column if not exists attended boolean not null default true;
alter table public.reflections add column if not exists people_met text;
alter table public.reflections add column if not exists sparked_interest_tags text[] not null default '{}';
alter table public.reflections add column if not exists private_note text;

alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.user_experiences enable row level security;
alter table public.reflections enable row level security;
alter table public.communities enable row level security;
alter table public.venues enable row level security;
alter table public.source_records enable row level security;
alter table public.review_queue enable row level security;

drop policy if exists "users can read and update own profile" on public.profiles;
create policy "users can read and update own profile"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "published experiences are public" on public.experiences;
create policy "published experiences are public"
on public.experiences for select
using (published = true or status = 'approved');

drop policy if exists "authenticated users can manage experiences" on public.experiences;
drop policy if exists "authenticated users can submit experiences" on public.experiences;
drop policy if exists "users can read own submitted experiences" on public.experiences;
drop policy if exists "users can update own draft submissions" on public.experiences;
drop policy if exists "admins can manage all experiences" on public.experiences;

create policy "authenticated users can submit experiences"
on public.experiences for insert
with check (auth.uid() = submitted_by and status in ('draft', 'review'));

create policy "users can read own submitted experiences"
on public.experiences for select
using (auth.uid() = submitted_by);

create policy "users can update own draft submissions"
on public.experiences for update
using (auth.uid() = submitted_by and status in ('draft', 'review'))
with check (auth.uid() = submitted_by and status in ('draft', 'review'));

create policy "admins can manage all experiences"
on public.experiences for all
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));

drop policy if exists "users manage own experience states" on public.user_experiences;
create policy "users manage own experience states"
on public.user_experiences for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users manage own reflections" on public.reflections;
create policy "users manage own reflections"
on public.reflections for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "approved communities are public" on public.communities;
create policy "approved communities are public"
on public.communities for select
using (status = 'approved');

drop policy if exists "approved venues are public" on public.venues;
create policy "approved venues are public"
on public.venues for select
using (status = 'approved');

drop policy if exists "authenticated users can manage communities" on public.communities;
create policy "authenticated users can manage communities"
on public.communities for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "authenticated users can manage venues" on public.venues;
create policy "authenticated users can manage venues"
on public.venues for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "authenticated users can manage source records" on public.source_records;
create policy "authenticated users can manage source records"
on public.source_records for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "authenticated users can manage review queue" on public.review_queue;
create policy "authenticated users can manage review queue"
on public.review_queue for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create index if not exists experiences_city_status_idx on public.experiences(city, status);
create index if not exists experiences_start_time_idx on public.experiences(start_time);
create index if not exists experiences_source_url_idx on public.experiences(source_url);
create index if not exists experiences_canonical_url_idx on public.experiences(canonical_url);
create index if not exists experiences_submitted_by_idx on public.experiences(submitted_by);
create index if not exists experiences_title_trgm_idx on public.experiences using gin (title gin_trgm_ops);
create index if not exists source_records_hash_idx on public.source_records(content_hash);
create index if not exists review_queue_status_idx on public.review_queue(reviewer_status, created_at);
