# Serendipity

Serendipity is an experience-first discovery network. It is not another event feed or social network. The MVP asks what someone is curious about, curates three weekly recommendations, and turns attendance/reflection into a story of who they are becoming.

The app now includes an SF Experience Ingestion System for collecting, normalizing, reviewing, and approving real-world experiences for the Serendipity database.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth/Postgres-ready
- Supabase-backed approved experience database
- Cheerio + Zod ingestion pipeline
- Optional OpenAI-compatible extraction/classification layer

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If port 3000 is busy:

```bash
npm run dev -- -p 3008
```

## Supabase Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EVENTBRITE_API_TOKEN=
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_INGESTION_MODEL=gpt-4o-mini
CRON_SECRET=
SERENDIPITY_ADMIN_SECRET=
```

Run `supabase/schema.sql` in the Supabase SQL editor.

The current public MVP works locally without Supabase configured. Ingestion writes require `SUPABASE_SERVICE_ROLE_KEY` because server routes insert source records, experiences, and review queue items.

## Admin Setup

After your first login, complete onboarding once, then set your profile as admin in Supabase:

```sql
update public.profiles
set is_admin = true
where email = 'you@example.com';
```

## Product Surface

- Landing page: launch positioning and CTAs
- Auth: Supabase magic-link email auth with local demo fallback
- Onboarding: city, interests, desired feelings, life goals
- Explore: searchable approved experience database
- This Week: three weekly recommendations: Passion, Growth, Surprise
- Experience detail: host, location, tags, vibe, related experiences
- Submit: authenticated user-submitted experiences routed to review
- Profile: curiosity path, communities, reflections, saved/going/attended states, submissions
- Admin: review, approve/reject, feature, bucket, and manage experiences
- Ingestion admin: review source links, trigger enabled sources, approve/reject extracted records

## System Architecture

The MVP is intentionally small, but the boundaries are production-shaped:

- `src/lib/experienceRepository.ts`: public experience reads, filters, weekly recommendation selection, related experiences
- `src/lib/experienceMapper.ts`: maps Supabase rows into the app experience model
- `src/lib/serverAuth.ts`: service-role server client, browser-token validation, admin profile checks
- `src/lib/clientApi.ts`: browser helper that attaches Supabase access tokens to API requests
- `src/app/api/*`: server API layer for public reads, submissions, save/RSVP states, reflections, profile updates, admin actions, and ingestion
- `src/ingestion/*`: modular source ingestion pipeline
- `supabase/schema.sql`: database tables, indexes, RLS policies
- `src/ingestion/*`: source adapters and ingestion orchestration for adding real, verifiable events

Public pages read only approved experiences. Authenticated users can save, RSVP, submit, and reflect. Admin APIs require a logged-in profile with `is_admin = true`. The app intentionally does not include fake fallback events; if Supabase has no approved rows, public event lists should be empty.

## Routes

- `/`
- `/explore`
- `/this-week`
- `/experiences/[slug]`
- `/experiences/[slug]/reflect`
- `/submit`
- `/submit/thanks`
- `/profile`
- `/profile/submissions`
- `/onboarding`
- `/login`
- `/admin`
- `/admin/review`
- `/admin/experiences`
- `/admin/submissions`
- `/admin/ingestion`

## SF Experience Ingestion

The ingestion system lives under `src/ingestion/`.

Core files:

- `types.ts`: source, extracted event, normalized event, and run result types
- `schema.ts`: Zod validators for extracted experiences and review actions
- `adapters/base.ts`: shared adapter helpers, compliance guards, hashing, polite fetch helpers
- `adapters/luma.ts`: Luma public/API event adapter
- `adapters/eventbrite.ts`: Eventbrite official API adapter
- `adapters/publicCalendar.ts`: crawlable venue calendar adapter using JSON-LD Event markup
- `adapters/rss.ts`: RSS/newsletter archive adapter
- `adapters/manual.ts`: manual/admin/partner-submitted adapter
- `normalize.ts`: standardizes extracted records into the database shape
- `classify.ts`: assigns category, tags, vibe, social intensity, and Passion/Growth/Surprise bucket
- `score.ts`: computes quality and serendipity scores
- `dedupe.ts`: source URL, canonical URL, title/date/venue, and fuzzy duplicate checks
- `reviewQueue.ts`: reasons/confidence helpers for uncertain records
- `runIngestion.ts`: orchestration pipeline

The starter SF source config is in `src/ingestion/sfSources.ts`. All source configs are disabled by default. Enable only official APIs, RSS feeds, partner submissions, or public calendars that permit crawling.

## Ingestion Pipeline

1. Fetch raw source data through a source adapter.
2. Store the raw payload in `source_records`.
3. Extract structured experiences.
4. Normalize into the shared schema.
5. Classify category, tags, vibe, bucket, social intensity, and beginner friendliness.
6. Deduplicate against existing database records.
7. Score quality and serendipity.
8. Auto-approve high-confidence records.
9. Send uncertain records to `review_queue`.
10. Expose approved experiences through `/api/experiences`.

## API Routes

- `GET /api/experiences?city=San Francisco`
- `GET /api/experiences/:id`
- `GET /api/me`
- `PUT /api/me`
- `GET /api/user-experiences`
- `POST /api/user-experiences`
- `GET /api/submissions`
- `POST /api/submissions`
- `GET /api/reflections`
- `POST /api/reflections`
- `GET /api/admin/experiences`
- `PATCH /api/admin/experiences`
- `POST /api/admin/ingest`
- `GET /api/admin/review`
- `POST /api/admin/review/:id/approve`
- `POST /api/admin/review/:id/reject`
- `POST /api/submit-link`
- `GET /api/cron/ingest`

The cron endpoint accepts `Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is configured.

Admin ingestion/review endpoints accept `x-serendipity-admin-secret: $SERENDIPITY_ADMIN_SECRET` or `Authorization: Bearer $SERENDIPITY_ADMIN_SECRET`. In local development the secret is optional; in production it should be configured.

## Admin Review

Open `/admin/ingestion`.

You can:

- trigger all enabled ingestion sources
- submit a public source URL
- store restricted social URLs for manual review without scraping them
- view pending review queue items
- approve or reject extracted experiences

Approving a queued `experience` sets `experiences.status = approved`. Rejecting sets `experiences.status = rejected`.

## Compliance Rules

Do not build unauthorized scrapers for Instagram, TikTok, Facebook, X/Twitter, or other platforms that prohibit automated scraping.

Allowed source types:

- official APIs
- RSS feeds
- public calendar pages that permit crawling
- public JSON-LD event pages
- manual/admin submissions
- partner or creator opt-in data
- user-submitted URLs stored for review

Restricted social URLs are saved as source records and routed to manual review. The system does not deep-scrape those pages.

## Adding A Source Adapter

1. Create `src/ingestion/adapters/mySource.ts`.
2. Implement the `SourceAdapter` contract:
   - `fetch()`
   - `parse(record)`
   - `normalize(record)`
3. Add a `SourceConfig` entry in `src/ingestion/sfSources.ts`.
4. Add the adapter to `createAdapter()` in `src/ingestion/runIngestion.ts`.
5. Keep source-specific rate limits and compliance notes in the config.

## Supabase Tables

`supabase/schema.sql` creates and/or extends:

- `profiles`
- `experiences`
- `reflections`
- `communities`
- `venues`
- `source_records`
- `review_queue`

The ingestion tables are designed for raw-source retention, review workflow, and approved experience serving.

## Recommended Cron Schedule

- Event APIs: every 6 hours
- Venue/public calendars: daily
- Community/venue directory refresh: weekly

In production, configure Vercel Cron or Supabase scheduled functions to call `/api/cron/ingest`.

## Guiding Principle

Every product decision should increase the probability that someone discovers an experience, a community, or a person that meaningfully enriches their life.
