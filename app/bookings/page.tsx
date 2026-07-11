'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, QrCode, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import type { Booking, Experience, Host } from '@serendipity-hq/design'
import { LaneBadge } from '@serendipity-hq/ui'

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function BookingCard({
  booking,
  experience,
  host,
  onCancel,
}: {
  booking: Booking
  experience: Experience
  host: Host
  onCancel: () => void
}) {
  const isPast = booking.status === 'completed'
  const isCancelled = booking.status === 'cancelled'

  return (
    <div
      className={`liquid-card rounded-[28px] overflow-hidden transition-all card-lift ${
        isCancelled ? 'opacity-60' : ''
      }`}
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-border/40 flex-shrink-0">
          <Image
            src={experience.imageUrl || `https://picsum.photos/seed/${experience.imageSeed}/200/200`}
            alt={experience.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <LaneBadge lane={experience.lane} size="xs" />
            {isCancelled && (
              <span className="text-xs text-muted bg-border/60 rounded-full px-2 py-0.5">
                Cancelled
              </span>
            )}
            {isPast && (
              <span className="text-xs text-muted bg-border/60 rounded-full px-2 py-0.5">
                Attended
              </span>
            )}
          </div>
          <h3 className="font-serif text-base text-charcoal mt-1 leading-snug">
            {experience.title}
          </h3>
          <p className="text-xs text-muted mt-0.5">with {host.name}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              {formatDate(experience.dateTime)} · {formatTime(experience.dateTime)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" strokeWidth={1.5} />
              {host.venue}
            </span>
          </div>
        </div>
      </div>

      {!isCancelled && (
        <div className="border-t border-white/50 px-4 py-3 flex items-center justify-between">
          <Link
            href={`/experience/${experience.id}`}
            className="text-xs text-terracotta hover:underline flex items-center gap-1"
          >
            <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />
            View ticket
          </Link>
          {!isPast && (
            <button
              onClick={onCancel}
              className="text-xs text-muted hover:text-terracotta transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              Cancel booking
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function BookingsPage() {
  const { bookings, isLoggedIn, cancelBooking, experiences, hosts } = useApp()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  const upcoming = bookings.filter((b) => b.status === 'upcoming')
  const past = bookings.filter((b) => b.status !== 'upcoming')

  const displayed = activeTab === 'upcoming' ? upcoming : past
  const displayedCards = displayed.flatMap((booking) => {
    const experience = experiences.find((e) => e.id === booking.experienceId)
    const host = experience ? hosts.find((h) => h.id === experience.hostId) : null
    if (!experience || !host) return []
    return [{ booking, experience, host }]
  })

  return (
    <div className="max-w-xl mx-auto px-5 py-10 md:py-14">
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Your tickets</p>
      <h1 className="font-serif text-3xl text-charcoal mb-8">Bookings.</h1>

      {/* Tabs */}
      <div className="border border-white/16 bg-white/8 flex gap-1 rounded-full p-1 mb-6">
        {(['upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-200 ${
              activeTab === tab ? 'bg-white/78 text-[#18352F] shadow-sm' : 'text-muted hover:text-charcoal'
            }`}
          >
            {tab === 'upcoming' ? `Upcoming · ${upcoming.length}` : `Past · ${past.length}`}
          </button>
        ))}
      </div>

      {displayedCards.length === 0 ? (
        <div className="liquid-card text-center py-16 rounded-[28px]">
          <p className="font-serif text-2xl text-charcoal mb-2">
            {activeTab === 'upcoming' ? 'Nothing yet.' : 'No past bookings.'}
          </p>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            {activeTab === 'upcoming'
              ? 'Book an experience and your ticket lives here.'
              : 'Attended experiences appear here as part of your story.'}
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 bg-charcoal text-cream px-6 py-3 rounded-full text-xs tracking-widest uppercase hover:bg-charcoal/85 transition-all duration-200 active:scale-95"
          >
            Discover experiences
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedCards.map(({ booking, experience, host }) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              experience={experience}
              host={host}
              onCancel={() => cancelBooking(booking.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
