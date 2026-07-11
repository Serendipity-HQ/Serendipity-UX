'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import type { Experience, Host, Lane } from '@serendipity-hq/design'
import { ExperienceCard, LaneBadge, Reveal } from '@serendipity-hq/ui'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function hashWeek(weekKey: string) {
  return weekKey.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function getWeeklyInvitations(experiences: Experience[], userInterests: string[], weekKey: string) {
  const lanes: Lane[] = ['passion', 'growth', 'surprise']
  const weekOffset = hashWeek(weekKey)
  return lanes.flatMap((lane, laneIndex) => {
    const laneExps = experiences.filter((e) => e.lane === lane)
    if (!laneExps.length) return []
    const preferred = laneExps.filter((e) =>
      e.tags.some((t) => userInterests.includes(t))
    )
    const pool = preferred.length > 0 ? preferred : laneExps
    return pool[(weekOffset + laneIndex) % pool.length]
  })
}

const LANE_DESCRIPTIONS: Record<Lane, string> = {
  passion: 'Deepen a skill',
  growth:  'Expand your mind',
  surprise:'Be surprised',
}

function RecommendationRevealStack({
  items,
  revealedCount,
  onReveal,
}: {
  items: { exp: Experience; host: Host }[]
  revealedCount: number
  onReveal: () => void
}) {
  const current = items[revealedCount]
  const remaining = items.slice(revealedCount)

  if (!current) return null

  return (
    <Reveal>
      <section className="mb-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="editorial-kicker text-[10px] tracking-[0.22em] uppercase mb-2">
              Weekly invitations
            </p>
            <h2 className="text-2xl md:text-3xl text-charcoal leading-tight">
              Reveal this week&apos;s three.
            </h2>
          </div>
          <p className="text-[10px] tracking-widest uppercase text-muted">
            {revealedCount} / {items.length}
          </p>
        </div>

        <button
          type="button"
          onClick={onReveal}
          className="group relative block h-[520px] w-full max-w-[430px] mx-auto text-left focus:outline-none"
          aria-label={`Reveal ${current.exp.title}`}
        >
          {remaining.slice(0, 3).map(({ exp, host }, index) => {
            const isTop = index === 0
            const rotation = index === 1 ? '-rotate-6' : index === 2 ? 'rotate-6' : ''
            const offset = index * 18
            return (
              <div
                key={exp.id}
                className={`absolute inset-x-0 top-0 mx-auto h-[500px] overflow-hidden rounded-[38px] border border-white/22 bg-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.42)] transition-all duration-500 ${rotation}`}
                style={{
                  zIndex: remaining.length - index,
                  transform: `${index === 1 ? 'rotate(-5deg)' : index === 2 ? 'rotate(5deg)' : 'rotate(0deg)'} translateY(${offset}px) scale(${1 - index * 0.035})`,
                  opacity: isTop ? 1 : 0.82 - index * 0.14,
                }}
              >
                <Image
                  src={`https://picsum.photos/seed/${exp.imageSeed}/800/1000`}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="430px"
                  priority={isTop}
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-7">
                  <div>
                    <div className="mb-5">
                      <LaneBadge lane={exp.lane} />
                    </div>
                    <h3 className="max-w-[12ch] text-4xl md:text-5xl font-black uppercase leading-[0.92] text-white">
                      {exp.title}
                    </h3>
                  </div>
                  <div className="flex items-end justify-between gap-5 text-white">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                        Hosted by
                      </p>
                      <p className="text-sm font-semibold text-white">{host.name}</p>
                    </div>
                    <p className="text-4xl font-black">${exp.price}</p>
                  </div>
                </div>
                {isTop && (
                  <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-[#F8E1C5]/90 text-2xl text-[#15251E] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </div>
                )}
              </div>
            )
          })}
        </button>

        <p className="mt-5 text-center text-xs tracking-widest uppercase text-muted">
          Tap the stack to reveal the next invitation
        </p>
      </section>
    </Reveal>
  )
}

export default function HomePage() {
  const { user, isLoggedIn, experiences, hosts } = useApp()
  const router = useRouter()
  const weekKey = useMemo(() => getWeekKey(), [])
  const [revealedCount, setRevealedCount] = useState(3)
  const [isRevealHydrated, setIsRevealHydrated] = useState(false)
  const invitations = useMemo(
    () => getWeeklyInvitations(experiences, user?.interests ?? [], weekKey),
    [experiences, user?.interests, weekKey]
  )
  const invitationItems = useMemo(
    () => invitations.flatMap((exp) => {
      const host = hosts.find((h) => h.id === exp.hostId)
      if (!host) return []
      return { exp, host }
    }),
    [hosts, invitations]
  )
  const revealStorageKey = user ? `serendipity_weekly_reveals_v3_${user.id}_${weekKey}` : ''
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  useEffect(() => {
    if (!user || !revealStorageKey) return
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(revealStorageKey)
      const nextCount = stored ? Math.min(Number(stored) || 0, invitationItems.length) : 0
      setRevealedCount(nextCount)
      setIsRevealHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [user, revealStorageKey, invitationItems.length])

  function revealNextInvitation() {
    setRevealedCount((count) => {
      const nextCount = Math.min(count + 1, invitationItems.length)
      window.localStorage.setItem(revealStorageKey, String(nextCount))
      return nextCount
    })
  }

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 md:py-18">
      {/* Greeting */}
      <Reveal>
        <div className="relative mb-10 md:mb-12">
          <p className="editorial-kicker text-[10px] tracking-[0.22em] uppercase mb-4">{today}</p>
          <h1 className="font-serif text-[clamp(2.6rem,8vw,5.2rem)] text-charcoal leading-[0.98] mb-5 max-w-2xl">
            {getGreeting()}, {user.name.split(' ')[0]}.
          </h1>
          <p className="text-base md:text-lg text-charcoal-light leading-relaxed max-w-lg">
            Three invitations, each with a different reason to leave the house.
          </p>
        </div>
      </Reveal>

      {/* Divider */}
      <div className="rule my-10 md:my-12" />

      {isRevealHydrated && revealedCount < invitationItems.length && (
        <RecommendationRevealStack
          items={invitationItems}
          revealedCount={revealedCount}
          onReveal={revealNextInvitation}
        />
      )}

      {/* Three lane invitations */}
      {isRevealHydrated && revealedCount >= invitationItems.length && (
        <div className="space-y-10">
          {invitationItems.map(({ exp, host }, i) => {
            return (
              <Reveal key={exp.id} delay={i * 100}>
                <div className="flex items-center gap-3 mb-4">
                  <LaneBadge lane={exp.lane} />
                  <span className="text-[10px] tracking-widest uppercase text-muted">
                    {LANE_DESCRIPTIONS[exp.lane]}
                  </span>
                </div>
                <ExperienceCard experience={exp} host={host} variant="featured" />
              </Reveal>
            )
          })}
        </div>
      )}

      {/* Footer nudge */}
      <Reveal>
        <div className="mt-12 pt-8 border-t border-border/60 flex items-center justify-between">
          <p className="text-xs text-muted">
            More experiences in Discover.
          </p>
          <Link
            href="/discover"
            className="group flex items-center gap-1.5 text-xs tracking-widest uppercase text-[#F8E1C5] link-underline"
          >
            Browse{' '}
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
