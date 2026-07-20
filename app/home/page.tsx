'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@serendipity-hq/ui'
import { useApp } from '@/context/AppContext'
import WeeklyEnvelope from '@/components/WeeklyEnvelope'
import StampMark from '@/components/StampMark'
import {
  createWeeklyRecommendations,
  recommendationProfileFromUser,
} from '@/lib/recommendations'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getWeekKey(date = new Date()) {
  const weekDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = weekDate.getUTCDay() || 7
  weekDate.setUTCDate(weekDate.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(weekDate.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((weekDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${weekDate.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function invitationCountLabel(count: number) {
  if (count === 1) return 'One invitation, selected for a strong reason to leave the house.'
  return `${count} invitations, each selected for a different reason to leave the house.`
}

export default function HomePage() {
  const {
    user,
    isLoggedIn,
    experiences,
    hosts,
    bookings,
    passionPathExperienceIds,
  } = useApp()
  const router = useRouter()
  const weekKey = useMemo(() => getWeekKey(), [])
  const dispatch = useMemo(
    () => createWeeklyRecommendations(
      experiences,
      recommendationProfileFromUser(user, {
        bookings,
        passionPathExperienceIds,
        experiences,
      }),
      { weekKey }
    ),
    [bookings, experiences, passionPathExperienceIds, user, weekKey]
  )
  const invitationItems = useMemo(
    () => dispatch.recommendations.flatMap((recommendation) => {
      const exp = recommendation.experience
      const host = hosts.find((item) => item.id === exp.hostId)
      if (!host) return []
      return { exp, host, recommendation }
    }),
    [dispatch.recommendations, hosts]
  )
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const firstName = user?.name.trim().split(/\s+/)[0] || 'there'
  const city = user?.onboardingProfile?.city || 'your city'

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  if (!user) return null

  return (
    <div className="home-page mx-auto max-w-6xl px-5 py-12 md:py-18">
      <Reveal>
        <div className="home-greeting relative mb-10 md:mb-12">
          <div className="mb-4 flex items-center gap-3">
            <StampMark tone="cream">week {weekKey.slice(-2)}</StampMark>
            <p className="editorial-kicker text-[10px] uppercase tracking-[0.22em]">{today}</p>
          </div>
          <h1 className="mb-5 max-w-2xl font-serif text-[clamp(2.6rem,8vw,5.2rem)] leading-[0.98] text-charcoal">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-charcoal-light md:text-lg">
            {invitationCountLabel(invitationItems.length)}
          </p>
        </div>
      </Reveal>

      <div className="home-rule rule my-10 md:my-12" />

      <Reveal>
        <div className="home-dispatch-heading mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="editorial-kicker mb-2 text-[10px] uppercase tracking-[0.2em]">This week&apos;s post</p>
            <h2 className="font-serif text-2xl text-charcoal md:text-3xl">A note from your city.</h2>
          </div>
          <StampMark tone="cream" className="shrink-0">
            {invitationItems.length} {invitationItems.length === 1 ? 'invitation' : 'invitations'}
          </StampMark>
        </div>
      </Reveal>

      <Reveal>
        <WeeklyEnvelope items={invitationItems} city={city} weekKey={weekKey} />
      </Reveal>

      {dispatch.shortages.length > 0 && invitationItems.length > 0 && invitationItems.length < 3 && (
        <Reveal>
          <aside className="dispatch-shortage" aria-label="Recommendation quality note">
            <StampMark tone="sage">quality held</StampMark>
            <p>
              We found {invitationItems.length} strong match{invitationItems.length === 1 ? '' : 'es'} this week.
              We held the remaining lane{dispatch.shortages.length === 1 ? '' : 's'} rather than send a weak fit.
            </p>
            <Link href="/discover" className="link-underline">Explore everything happening</Link>
          </aside>
        </Reveal>
      )}

      <Reveal>
        <div className="mt-12 flex items-center justify-between border-t border-border/60 pt-8">
          <p className="text-xs text-muted">More experiences in Discover.</p>
          <Link
            href="/discover"
            className="group flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#a74838] link-underline"
          >
            Browse <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
