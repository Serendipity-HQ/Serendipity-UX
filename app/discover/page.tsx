'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Lane } from '@serendipity-hq/design'
import { useApp } from '@/context/AppContext'
import { ExperienceCard, LaneBadge, Reveal } from '@serendipity-hq/ui'

const LANES: { value: Lane | 'all'; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'passion',  label: 'Passion' },
  { value: 'growth',   label: 'Growth' },
  { value: 'surprise', label: 'Surprise' },
]

const PAGE_SIZE = 6

export default function DiscoverPage() {
  const { experiences, hosts } = useApp()
  const [query, setQuery]   = useState('')
  const [lane, setLane]     = useState<Lane | 'all'>('all')
  const [page, setPage]     = useState(1)

  const filtered = experiences.filter((e) => {
    const matchesLane = lane === 'all' || e.lane === lane
    const q = query.toLowerCase()
    const matchesQuery =
      !query ||
      e.title.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)) ||
      hosts.find((h) => h.id === e.hostId)?.name.toLowerCase().includes(q)
    return matchesLane && matchesQuery
  })

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore   = paginated.length < filtered.length

  function handleLaneChange(l: Lane | 'all') {
    setLane(l)
    setPage(1)
  }

  function handleSearch(q: string) {
    setQuery(q)
    setPage(1)
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-14">
      {/* Header */}
      <Reveal>
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Explore</p>
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-1">Discover.</h1>
        <p className="text-sm text-muted mb-8">
          {filtered.length} experience{filtered.length !== 1 ? 's' : ''} available.
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
              onChange={(e) => handleSearch(e.target.value)}
            className="border border-white/16 bg-white/8 w-full rounded-full pl-10 pr-4 py-3 text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:border-white/80 transition-colors duration-200"
            />
          </div>

          <div className="flex gap-1.5">
            {LANES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleLaneChange(value)}
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="liquid-card text-center py-20 px-8 rounded-[28px]">
          <p className="font-serif text-2xl text-charcoal mb-2">Nothing found.</p>
          <p className="text-sm text-muted">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((exp, i) => {
              const host = hosts.find((h) => h.id === exp.hostId)
              if (!host) return null
              return (
                <Reveal key={exp.id} delay={(i % PAGE_SIZE) * 50}>
                  <ExperienceCard experience={exp} host={host} />
                </Reveal>
              )
            })}
          </div>

          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="border border-border text-muted px-8 py-3 rounded-full text-xs tracking-widest uppercase hover:border-sand hover:text-charcoal transition-all duration-200 active:scale-95"
              >
                Show more · {filtered.length - paginated.length} remaining
              </button>
            </div>
          )}

          {!hasMore && page > 1 && (
            <p className="text-center text-[10px] tracking-widest uppercase text-muted/50 mt-10">
              All {filtered.length} experiences
            </p>
          )}
        </>
      )}
    </div>
  )
}
