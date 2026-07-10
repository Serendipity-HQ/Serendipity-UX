'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Users, ArrowLeft, CheckCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import LaneBadge from '@/components/LaneBadge'
import ExperienceCard from '@/components/ExperienceCard'
import Reveal from '@/components/Reveal'
import GuestList from '@/components/GuestList'

function formatDateTime(dt: string) {
  const d = new Date(dt)
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

export default function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { bookings, isLoggedIn, experiences, hosts } = useApp()

  const experience = experiences.find((e) => e.id === id)
  if (!experience) notFound()

  const host = hosts.find((h) => h.id === experience.hostId)
  if (!host) notFound()
  const { date, time } = formatDateTime(experience.dateTime)
  const spotsLeft = experience.spotsTotal - experience.spotsBooked
  const isFull = spotsLeft === 0
  const isAlreadyBooked = bookings.some(
    (b) => b.experienceId === id && b.status !== 'cancelled'
  )

  const sameHostExps = experiences.filter(
    (e) => e.hostId === experience.hostId && e.id !== id
  ).slice(0, 2)

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-14">
      {/* Back */}
      <Reveal fade>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted hover:text-charcoal transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          Discover
        </Link>
      </Reveal>

      {/* Cover */}
      <Reveal>
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-parchment mb-10">
          <Image
            src={experience.imageUrl || `https://picsum.photos/seed/${experience.imageSeed}/1200/675`}
            alt={experience.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>
      </Reveal>

      {/* Title */}
      <Reveal>
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <LaneBadge lane={experience.lane} />
            {isFull && (
              <span className="border border-white/16 bg-white/8 text-[9px] tracking-widest uppercase text-muted rounded-full px-2.5 py-1">
                Full
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2 leading-tight">
            {experience.title}
          </h1>
          <p className="text-sm text-muted">
            Hosted by{' '}
            <span className="text-charcoal-light">{host.name}</span>
            {' · '}
            {host.venue}
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main */}
        <div className="md:col-span-2 space-y-8">
          {/* Details strip */}
          <Reveal>
            <div className="liquid-card rounded-[28px] p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-3.5 h-3.5 text-muted mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm text-charcoal">{date}</p>
                  <p className="text-xs text-muted mt-0.5">{time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-3.5 h-3.5 text-muted mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-charcoal">{experience.location}</p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-3.5 h-3.5 text-muted mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="text-sm text-charcoal mb-1.5">
                    {isFull ? 'Fully booked' : `${spotsLeft} of ${experience.spotsTotal} spots remaining`}
                  </p>
                  <div className="bg-white/45 rounded-full h-1 w-full max-w-[160px]">
                    <div
                      className="bg-terracotta h-1 rounded-full transition-all duration-500"
                      style={{ width: `${(experience.spotsBooked / experience.spotsTotal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Description */}
          <Reveal delay={80}>
            <h2 className="font-serif text-xl text-charcoal mb-3">About this experience</h2>
            <p className="text-sm text-charcoal-light leading-loose">{experience.description}</p>
          </Reveal>

          {/* Tags */}
          <Reveal delay={120}>
            <div className="flex flex-wrap gap-2">
              {experience.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-white/16 bg-white/8 text-[10px] tracking-widest uppercase text-muted rounded-full px-3 py-1.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Guest list */}
          <Reveal delay={140}>
            <div className="liquid-card rounded-[28px] p-5">
              <GuestList experienceId={experience.id} spotsBooked={experience.spotsBooked} />
            </div>
          </Reveal>

          {/* Host */}
          <Reveal delay={160}>
            <div className="liquid-card rounded-[28px] p-6">
              <h2 className="font-serif text-xl text-charcoal mb-5">About the host</h2>
              <div className="flex items-start gap-4">
                <Image
                  src={`https://picsum.photos/seed/${host.avatarSeed}/100/100`}
                  alt={host.name}
                  width={52}
                  height={52}
                  className="rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-charcoal">{host.name}</p>
                  <p className="text-[10px] tracking-widest uppercase text-muted mb-3">{host.venue}</p>
                  <p className="text-sm text-charcoal-light leading-relaxed">{host.bio}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Booking sidebar */}
        <div className="md:col-span-1">
          <Reveal delay={100}>
            <div className="liquid-card sticky top-20 rounded-[28px] p-6">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-3xl text-charcoal">${experience.price}</span>
                <span className="text-xs text-muted ml-1">per person</span>
              </div>
              <p className="text-[10px] text-muted mb-6">
                + ${(experience.price * 0.08).toFixed(2)} service fee
              </p>

              {isAlreadyBooked ? (
                <div className="flex items-center gap-2 text-teal text-xs font-medium py-3">
                  <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                  You&apos;re booked in
                </div>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full bg-border text-muted py-3.5 rounded-full text-xs tracking-widest uppercase cursor-not-allowed"
                >
                  Fully booked
                </button>
              ) : isLoggedIn ? (
                <Link
                  href={`/experience/${experience.id}/checkout`}
                  className="block w-full bg-terracotta text-white py-3.5 rounded-full text-xs tracking-widest uppercase text-center hover:bg-terracotta/85 transition-colors duration-200 active:scale-95"
                >
                  Book this experience
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block w-full bg-charcoal text-cream py-3.5 rounded-full text-xs tracking-widest uppercase text-center hover:bg-charcoal/85 transition-colors duration-200"
                >
                  Sign in to book
                </Link>
              )}

              <p className="text-[10px] text-muted text-center mt-4 leading-relaxed">
                Free cancellation up to 48 hours before
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* More from host */}
      {sameHostExps.length > 0 && (
        <div className="mt-16 pt-10 border-t border-border">
          <Reveal>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">More from {host.name}</p>
            <h2 className="font-serif text-2xl text-charcoal mb-6">More experiences</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {sameHostExps.map((e, i) => (
              <Reveal key={e.id} delay={i * 80}>
                <ExperienceCard experience={e} host={host} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
