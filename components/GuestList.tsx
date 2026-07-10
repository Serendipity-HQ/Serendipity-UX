'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'
import { EXPERIENCE_ATTENDEES, EXPERIENCES, SEED_USERS } from '@/lib/mock-data'
import LaneBadge from './LaneBadge'

function initials(name: string) {
  const parts = name.split(' ')
  return parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name[0]
}

function GuestModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const person = SEED_USERS.find((u) => u.id === userId)
  if (!person) return null

  const attended = person.attendedExperienceIds
    .map((id) => EXPERIENCES.find((e) => e.id === id))
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div
      className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="liquid-card rounded-[28px] w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/50">
          <p className="text-[10px] tracking-widest uppercase text-muted">Member</p>
          <button onClick={onClose} className="text-muted hover:text-charcoal transition-colors">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-5">
          {/* Person */}
          <div className="flex items-center gap-4 mb-5">
            <Image
              src={`https://picsum.photos/seed/${person.avatarSeed}/200/200`}
              alt={person.name}
              width={56}
              height={56}
              className="rounded-full object-cover ring-1 ring-border"
            />
            <div>
              <p className="font-serif text-lg text-charcoal">{person.name}</p>
              <p className="text-xs text-muted mt-0.5">
                {person.attendedExperienceIds.length} experiences
              </p>
            </div>
          </div>

          <p className="text-sm text-charcoal-light leading-relaxed mb-4">{person.bio}</p>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {person.interests.slice(0, 4).map((tag) => (
              <span key={tag} className="border border-white/16 bg-white/8 text-[9px] tracking-widest uppercase text-muted rounded-full px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>

          {/* Recent experiences */}
          {attended.length > 0 && (
            <div className="space-y-2 mb-5">
              <p className="text-[10px] tracking-widest uppercase text-muted mb-2">Their story</p>
              {attended.map((exp) => exp && (
                <div key={exp.id} className="flex items-center gap-2">
                  <LaneBadge lane={exp.lane} size="xs" />
                  <span className="text-xs text-charcoal-light truncate">{exp.title}</span>
                </div>
              ))}
            </div>
          )}

          <Link
            href={`/people/${person.id}`}
            onClick={onClose}
            className="border border-white/16 bg-white/8 flex items-center justify-center gap-2 w-full text-charcoal-light py-3 rounded-full text-xs tracking-widest uppercase hover:border-white/80 hover:text-charcoal transition-all duration-200"
          >
            View full profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function GuestList({ experienceId, spotsBooked }: { experienceId: string; spotsBooked: number }) {
  const [openUserId, setOpenUserId] = useState<string | null>(null)

  const attendeeIds: string[] = EXPERIENCE_ATTENDEES[experienceId] ?? []

  if (spotsBooked === 0) return null

  return (
    <div>
      <p className="text-[10px] tracking-widest uppercase text-muted mb-3">
        {spotsBooked} {spotsBooked === 1 ? 'person' : 'people'} attending
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Known attendees — shown as avatar circles */}
        {attendeeIds.map((uid, i) => {
          const person = SEED_USERS.find((u) => u.id === uid)
          if (!person) return null
          return (
            <button
              key={uid}
              onClick={() => setOpenUserId(uid)}
              title={`${initials(person.name)}`}
              className="relative group"
              style={{ zIndex: attendeeIds.length - i }}
            >
              <Image
                src={`https://picsum.photos/seed/${person.avatarSeed}/80/80`}
                alt={initials(person.name)}
                width={36}
                height={36}
                className="rounded-full object-cover ring-2 ring-cream group-hover:ring-sand transition-all duration-200 group-hover:scale-110"
              />
            </button>
          )
        })}

        {/* Anonymous remainder */}
        {spotsBooked > attendeeIds.length && (
          <div className="border border-white/16 bg-white/8 w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-cream">
            <span className="text-[9px] text-muted font-medium">
              +{spotsBooked - attendeeIds.length}
            </span>
          </div>
        )}
      </div>

      {openUserId && (
        <GuestModal userId={openUserId} onClose={() => setOpenUserId(null)} />
      )}
    </div>
  )
}
