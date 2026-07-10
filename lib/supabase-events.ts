import { HOSTS as FALLBACK_HOSTS, EXPERIENCES as FALLBACK_EXPERIENCES } from './mock-data'
import { createPublicServerClient, isSupabaseConfigured } from './supabase'
import type { Experience, Host, Lane } from './types'

type ExperienceRow = Record<string, unknown>

export type EventPayload = {
  configured: boolean
  source: 'supabase' | 'mock'
  experiences: Experience[]
  hosts: Host[]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toLane(value: unknown): Lane {
  if (value === 'passion' || value === 'Passion') return 'passion'
  if (value === 'growth' || value === 'Growth') return 'growth'
  if (value === 'surprise' || value === 'Surprise') return 'surprise'
  return 'surprise'
}

function numberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function tags(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function price(row: ExperienceRow) {
  const min = numberValue(row.cost_min)
  const max = numberValue(row.cost_max)
  if (min !== null) return Math.round(min)
  if (max !== null) return Math.round(max)
  return 0
}

function startTime(row: ExperienceRow) {
  return text(row.start_time) || text(row.date) || new Date().toISOString()
}

function hostIdFor(row: ExperienceRow) {
  const host = text(row.host_name) || text(row.venue_name) || text(row.source_name) || 'Local host'
  return `h-${slugify(host) || String(row.id)}`
}

function hostFromRow(row: ExperienceRow): Host {
  const venue = text(row.venue_name) || text(row.neighborhood) || text(row.address) || text(row.city, 'San Francisco')
  const name = text(row.host_name) || text(row.source_name) || venue || 'Local host'

  return {
    id: hostIdFor(row),
    name,
    bio: text(row.description, 'A local host bringing people together around a real-world experience.'),
    venue,
    avatarSeed: slugify(name) || String(row.id),
  }
}

function experienceFromRow(row: ExperienceRow): Experience {
  const title = text(row.title, 'Untitled experience')
  const venue = text(row.venue_name) || text(row.neighborhood) || text(row.address) || text(row.city, 'San Francisco')
  const capacity = numberValue(row.capacity) ?? 12
  const booked = numberValue(row.spots_booked) ?? numberValue(row.attendee_count) ?? 0
  const id = String(row.id)

  return {
    id,
    title,
    lane: toLane(row.recommendation_bucket),
    hostId: hostIdFor(row),
    description: text(row.long_description) || text(row.description, 'A real-world Serendipity experience.'),
    location: text(row.address) || venue,
    dateTime: startTime(row),
    price: price(row),
    spotsTotal: Math.max(1, Math.round(capacity)),
    spotsBooked: Math.max(0, Math.min(Math.round(booked), Math.round(capacity))),
    imageSeed: text(row.slug) || slugify(title) || id,
    imageUrl: text(row.image_url) || null,
    tags: tags(row.tags),
  }
}

function fallbackPayload(configured = false): EventPayload {
  return {
    configured,
    source: 'mock',
    experiences: FALLBACK_EXPERIENCES,
    hosts: FALLBACK_HOSTS,
  }
}

export async function listPublicEvents(): Promise<EventPayload> {
  const supabase = createPublicServerClient()
  const configured = isSupabaseConfigured()
  if (!supabase) return fallbackPayload(configured)

  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('start_time', { ascending: true, nullsFirst: false })
    .order('serendipity_score', { ascending: false })
    .limit(120)

  if (error || !data?.length) {
    if (error) console.error(error)
    return fallbackPayload(configured)
  }

  const experiences = data.map(experienceFromRow)
  const hosts = Array.from(
    new Map(data.map((row) => {
      const host = hostFromRow(row)
      return [host.id, host]
    })).values()
  )

  return {
    configured,
    source: 'supabase',
    experiences,
    hosts,
  }
}
