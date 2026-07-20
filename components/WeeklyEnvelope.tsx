'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, CalendarDays, MailOpen } from 'lucide-react'
import type { Experience, Host } from '@serendipity-hq/design'
import { LaneBadge } from '@serendipity-hq/ui'
import type { Recommendation } from '@/lib/recommendations'
import { hasKnownPrice } from '@/lib/experience-metadata'
import StampMark from './StampMark'

export type WeeklyInvitationItem = {
  exp: Experience
  host: Host
  recommendation: Recommendation
}

function formatDateTime(dateTime: string) {
  const date = new Date(dateTime)
  const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} · ${time}`
}

function formatPrice(experience: Experience) {
  if (!hasKnownPrice(experience)) return 'See ticket site'
  if (experience.price === 0) return 'Free'
  return `$${experience.price}`
}

function cityCode(city: string) {
  const normalized = city.trim().toLowerCase()
  if (!normalized) return 'CITY'
  if (normalized.includes('san francisco')) return 'SF'
  if (normalized.includes('new york')) return 'NYC'
  if (normalized.includes('los angeles')) return 'LA'
  const initials = city.split(/\s+/).filter(Boolean).map((word) => word[0]).join('').toUpperCase()
  return initials.slice(0, 3) || city.slice(0, 3).toUpperCase()
}

function countWord(count: number) {
  if (count === 1) return 'One'
  if (count === 2) return 'Two'
  if (count === 3) return 'Three'
  return String(count)
}

export default function WeeklyEnvelope({
  items,
  city,
  weekKey,
}: {
  items: WeeklyInvitationItem[]
  city: string
  weekKey: string
}) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>('closed')
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const weekNumber = weekKey.split('-W')[1] ?? weekKey.slice(-2)
  const dispatchTitle = `${countWord(items.length)} ${items.length === 1 ? 'way' : 'ways'} to be out there this week.`

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current)
    }
  }, [])

  function openDispatch() {
    if (phase !== 'closed' || items.length === 0) return
    setPhase('opening')
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 20 : 220
    openTimer.current = setTimeout(() => setPhase('open'), delay)
  }

  if (items.length === 0) {
    return (
      <article className="weekly-bundle dispatch-empty" aria-live="polite">
        <StampMark tone="terracotta">dispatch ledger</StampMark>
        <h3 className="font-serif text-2xl font-semibold text-charcoal">Your next strong invitation is still being found.</h3>
        <p>We would rather hold the post than send something that does not fit your path.</p>
        <Link href="/discover" className="paper-button">Browse the city</Link>
      </article>
    )
  }

  return (
    <article className="weekly-bundle" aria-live="polite">
      {phase !== 'open' ? (
        <button
          type="button"
          onClick={openDispatch}
          disabled={phase === 'opening'}
          className={`dispatch-cover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta ${phase === 'opening' ? 'is-opening' : ''}`}
          aria-label={`Open this week's dispatch with ${items.length} ${items.length === 1 ? 'invitation' : 'invitations'}`}
        >
          <span className="flex flex-wrap items-center gap-3">
            <StampMark tone="terracotta">dispatch ledger</StampMark>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#626b62]">
              {cityCode(city)} · week {weekNumber} · {items.length} enclosed
            </span>
          </span>
          <span className="block max-w-2xl font-serif text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[0.98] text-[#293028]">
            {dispatchTitle}
          </span>
          <span className="flex flex-wrap gap-2" aria-hidden="true">
            {items.map(({ exp, recommendation }) => <LaneBadge key={exp.id} lane={recommendation.lane} size="xs" />)}
          </span>
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a74838]">
            <MailOpen className="h-4 w-4" aria-hidden="true" /> Open the dispatch
          </span>
        </button>
      ) : (
        <div className="dispatch-opened">
          <header className="dispatch-heading">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <StampMark tone="terracotta">dispatch ledger</StampMark>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#626b62]">
                  {cityCode(city)} · week {weekNumber}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-semibold leading-tight text-[#293028] md:text-3xl">{dispatchTitle}</h3>
            </div>
            <StampMark tone="sage" className="shrink-0">opened</StampMark>
          </header>

          <div className="dispatch-list">
            {items.map(({ exp, host, recommendation }, index) => {
              const src = exp.imageUrl || `https://picsum.photos/seed/${exp.imageSeed}/600/450`
              return (
                <Link href={`/experience/${exp.id}`} className="dispatch-row group" key={exp.id}>
                  <div className="dispatch-photo">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      sizes="(max-width: 768px) 86px, 180px"
                      priority={index === 0}
                    />
                  </div>
                  <div className="dispatch-copy">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`dispatch-number dispatch-number--${recommendation.lane}`}>{String(index + 1).padStart(2, '0')}</span>
                      <LaneBadge lane={recommendation.lane} size="xs" />
                    </div>
                    <h4 className="font-serif text-[1.35rem] font-semibold leading-[1.04] text-[#293028] md:text-[1.7rem]">{exp.title}</h4>
                    <p className="text-xs leading-relaxed text-[#4f5a4f]">With {host.name}</p>
                    <p className="dispatch-rationale">{recommendation.reason}</p>
                    <span className="dispatch-date">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {formatDateTime(exp.dateTime)}
                    </span>
                  </div>
                  <div className="dispatch-meta">
                    <span className={hasKnownPrice(exp) ? '' : 'dispatch-ticket-link'}>{formatPrice(exp)}</span>
                    <span className="dispatch-arrow" aria-hidden="true"><ArrowUpRight className="h-5 w-5" /></span>
                  </div>
                </Link>
              )
            })}
          </div>

          <footer className="dispatch-footer">
            <span>Selected for {items.length === 3 ? 'three different trajectories' : 'your strongest available paths'}.</span>
            <span className="font-mono">SER · W{weekNumber}</span>
          </footer>
        </div>
      )}
    </article>
  )
}
