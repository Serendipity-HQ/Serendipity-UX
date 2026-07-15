import type { Experience, Host, Lane } from '@serendipity-hq/design'

// Master events feed, refreshed by the Serendipity-Events ingestion pipeline.
const EVENTS_URL =
  process.env.EVENTS_FEED_URL ||
  'https://raw.githubusercontent.com/Serendipity-HQ/Serendipity-Events/main/data/events.json'

type FeedEvent = {
  id: string
  source: string
  source_id: string
  title: string
  url: string | null
  starts_at: string | null
  local_date: string | null
  venue_name: string | null
  city: string | null
  segment: string | null
  genre: string | null
  price_min: number | null
  price_max: number | null
  image_url: string | null
  status: string
  category: string | null
  vibes: string[] | null
  blurb: string | null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toLane(ev: FeedEvent): Lane {
  const seg = (ev.category || ev.segment || '').toLowerCase()
  if (seg.includes('music') || seg.includes('arts') || seg.includes('theatre') || seg.includes('film')) {
    return 'passion'
  }
  if (seg.includes('sport')) return 'growth'
  return 'surprise'
}

function describe(ev: FeedEvent) {
  if (ev.blurb) return ev.blurb
  const what = [ev.genre, ev.segment].filter((v) => v && v !== 'Undefined')[0] || 'A live event'
  const where = ev.venue_name || 'San Francisco'
  return `${what} at ${where}.`
}

function toExperience(ev: FeedEvent): Experience {
  return {
    id: `${ev.source}-${slugify(ev.source_id)}`,
    title: ev.title,
    lane: toLane(ev),
    hostId: hostIdFor(ev),
    description: describe(ev),
    location: ev.venue_name ? `${ev.venue_name}, San Francisco` : 'San Francisco',
    dateTime: ev.starts_at || (ev.local_date ? `${ev.local_date}T19:00:00` : new Date().toISOString()),
    price: ev.price_min != null ? Math.round(ev.price_min) : 0,
    spotsTotal: 100,
    spotsBooked: 0,
    imageSeed: slugify(ev.source_id),
    imageUrl: ev.image_url,
    tags: [...new Set([ev.category, ev.genre, ev.segment, ...(ev.vibes ?? [])])]
      .filter((t): t is string => Boolean(t) && t !== 'Undefined'),
  }
}

function hostIdFor(ev: FeedEvent) {
  return `h-${slugify(ev.venue_name || ev.source) || ev.source}`
}

function hostFor(ev: FeedEvent): Host {
  const name = ev.venue_name || 'San Francisco venue'
  return {
    id: hostIdFor(ev),
    name,
    bio: `Live events at ${name} in San Francisco.`,
    venue: name,
    avatarSeed: slugify(name) || 'venue',
  }
}

export type LiveEvents = { experiences: Experience[]; hosts: Host[] }

/**
 * Pulls the master events feed (San Francisco events ingested from
 * Ticketmaster and, later, other sources). Returns null when the feed is
 * unreachable so callers can fall back. Cached for an hour per deployment.
 */
export async function fetchLiveEvents(): Promise<LiveEvents | null> {
  try {
    const res = await fetch(EVENTS_URL, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = (await res.json()) as { events?: FeedEvent[] }
    if (!data.events?.length) return null

    const now = Date.now()
    const upcoming = data.events.filter(
      (ev) =>
        ev.city === 'San Francisco' &&
        ev.status !== 'cancelled' &&
        (!ev.starts_at || new Date(ev.starts_at).getTime() > now),
    )
    if (!upcoming.length) return null

    const experiences = upcoming.map(toExperience)
    const hosts = Array.from(
      new Map(upcoming.map((ev) => [hostIdFor(ev), hostFor(ev)])).values(),
    )
    return { experiences, hosts }
  } catch {
    return null
  }
}
