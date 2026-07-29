'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Experience, Lane } from '@serendipity-hq/design'
import { useApp } from '@/context/AppContext'
import { recommend, type ScoredEvent } from '@serendipity-hq/algorithm'
import { ExperienceCard, LaneBadge, Reveal } from '@serendipity-hq/ui'

const LANES: { value: Lane | 'all'; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'passion',  label: 'Passion' },
  { value: 'growth',   label: 'Growth' },
  { value: 'surprise', label: 'Surprise' },
]

const SECTION_LABELS: Record<Lane, string> = {
  passion: 'Passion — because you like this',
  growth: 'Growth — a stretch worth trying',
  surprise: 'Surprise — something different',
}

const COUNT_PER_LANE = 8

export default function DiscoverPage() {
  const { experiences, hosts, user, bookings, growthState, dismissedIds, dismissExperience } = useApp()
  const [query, setQuery] = useState('')
  const [lane, setLane]   = useState<Lane | 'all'>('all')

  // Every event a user has already booked (upcoming or completed) is
  // excluded from all three lanes — nothing recommends what you've done.
  const excludeIds = useMemo(() => {
    const booked = bookings.filter((b) => b.status !== 'cancelled').map((b) => b.experienceId)
    return [...booked, ...dismissedIds]
  }, [bookings, dismissedIds])

  // The actual recommendation call — Passion scored against interests,
  // Growth drawn from the learned per-user state, Surprise genuinely
  // random. Memoized so Surprise's random draw doesn't reshuffle on every
  // keystroke in the search box; it only redraws when the underlying
  // pool, interests, or learned state actually change.
  const result = useMemo(
    () =>
      recommend({
        interests: user?.interests ?? [],
        events: experiences,
        growthState,
        excludeIds,
        countPerLane: COUNT_PER_LANE,
      }),
    [experiences, user?.interests, growthState, excludeIds],
  )

  const q = query.toLowerCase()
  function matchesQuery(exp: Experience) {
    if (!q) return true
    const host = hosts.find((h) => h.id === exp.hostId)
    return (
      exp.title.toLowerCase().includes(q) ||
      exp.tags.some((t) => t.toLowerCase().includes(q)) ||
      Boolean(host?.name.toLowerCase().includes(q))
    )
  }

  const sections = (['passion', 'growth', 'surprise'] as const)
    .filter((l) => lane === 'all' || lane === l)
    .map((l) => ({
      lane: l,
      items: result[l].filter((r) => matchesQuery(r.event)),
    }))

  const totalCount = sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
      {/* Header */}
      <Reveal>
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Explore</p>
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-1">Discover.</h1>
        <p className="text-sm text-muted mb-8">
          {totalCount} experience{totalCount !== 1 ? 's' : ''} picked for you.
        </p>
      </Reveal>

      {/* Filters */}
      <Reveal delay={80}>
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted"
              strokeWidth={1.5}
            />
            <input
              type="text"
              placeholder="Search by name, host, or tag…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-white/16 bg-white/8 w-full rounded-full pl-10 pr-4 py-3 text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:border-white/80 transition-colors duration-200"
            />
          </div>

          <div className="flex gap-1.5">
            {LANES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLane(value)}
                className={`px-4 py-2 rounded-full text-xs tracking-wide border transition-all duration-200 active:scale-95 ${
                  lane === value
                    ? 'bg-charcoal text-cream border-charcoal'
                    : 'border border-white/16 bg-white/8 text-muted hover:border-white/80 hover:text-charcoal'
                }`}
              >
                {value !== 'all' ? (
                  <LaneBadge lane={value as Lane} size="xs" />
                ) : (
                  label
                )}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Sections */}
      {totalCount === 0 ? (
        <div className="liquid-card text-center py-20 px-8 rounded-[28px]">
          <p className="font-serif text-2xl text-charcoal mb-2">Nothing found.</p>
          <p className="text-sm text-muted">
            {user?.interests.length
              ? 'Try adjusting your search or filters.'
              : 'Add a few interests in your profile to sharpen your Passion feed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {sections.map(({ lane: sectionLane, items }) =>
            items.length === 0 ? null : (
              <div key={sectionLane}>
                {lane === 'all' && (
                  <p className="text-[10px] tracking-widest uppercase text-muted mb-4">
                    {SECTION_LABELS[sectionLane]}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((scored: ScoredEvent<Experience>, i: number) => {
                    const host = hosts.find((h) => h.id === scored.event.hostId)
                    if (!host) return null
                    return (
                      <Reveal key={scored.event.id} delay={(i % COUNT_PER_LANE) * 50}>
                        <ExperienceCard
                          experience={{ ...scored.event, lane: sectionLane }}
                          host={host}
                          onDismiss={
                            sectionLane === 'growth' ? () => dismissExperience(scored.event.id) : undefined
                          }
                        />
                      </Reveal>
                    )
                  })}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}
