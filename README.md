# Serendipity

Serendipity is an experience-first discovery network. It is not another event feed or social network. The MVP asks what someone is curious about, curates three weekly recommendations, and turns attendance/reflection into a story of who they are becoming.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth/Postgres-ready
- Local-first seeded MVP data

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
```

Run `supabase/schema.sql` in the Supabase SQL editor.

The current MVP works locally without Supabase configured. Email auth activates automatically once the env vars are present.

## Product Surface

- Landing page: philosophical positioning and product narrative
- Auth: Supabase magic-link email auth with local demo fallback
- Onboarding: interests, desired feelings, life goals
- Dashboard: three weekly recommendations: Passion, Growth, Surprise
- Experience detail: host, location, tags, vibe, related experiences
- Profile: curiosity path, communities, reflections, saved/going states
- Admin: local manual experience creation for MVP testing

## Guiding Principle

Every product decision should increase the probability that someone discovers an experience, a community, or a person that meaningfully enriches their life.
