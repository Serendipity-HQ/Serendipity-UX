import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Users } from 'lucide-react'
import type { Experience, Host } from '@/lib/types'
import LaneBadge from './LaneBadge'

type Props = {
  experience: Experience
  host: Host
  variant?: 'featured' | 'grid'
}

function formatDate(dt: string) {
  const d = new Date(dt)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(dt: string) {
  const d = new Date(dt)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function ExperienceCard({ experience, host, variant = 'grid' }: Props) {
  const spotsLeft = experience.spotsTotal - experience.spotsBooked
  const isFull = spotsLeft === 0
  const imageSrc = experience.imageUrl || `https://picsum.photos/seed/${experience.imageSeed}/600/450`

  return (
    <Link href={`/experience/${experience.id}`} className="group block">
      <article
        className={`liquid-card rounded-[36px] overflow-hidden card-lift ${
          variant === 'featured' ? 'flex flex-col md:flex-row' : ''
        }`}
      >
        <div
          className={`relative overflow-hidden bg-parchment ${
            variant === 'featured' ? 'md:w-1/2 aspect-[5/4] md:aspect-auto' : 'aspect-[5/4]'
          }`}
        >
          <Image
            src={imageSrc}
            alt={experience.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              variant === 'featured'
                ? 'bg-black/12 group-hover:bg-black/5'
                : 'bg-black/8 group-hover:bg-black/2'
            }`}
          />
        </div>

        <div className={`p-5 flex flex-col gap-3 ${variant === 'featured' ? 'flex-1 md:p-7' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <LaneBadge lane={experience.lane} />
            {isFull && (
              <span className="border border-white/16 bg-white/8 text-[9px] tracking-widest uppercase text-muted rounded-full px-2 py-1">
                Full
              </span>
            )}
          </div>

          <div>
            <h3
              className={`font-serif text-charcoal leading-snug transition-colors duration-200 group-hover:text-[#F0B47F] ${
              variant === 'featured' ? 'text-2xl md:text-3xl font-normal' : 'text-xl font-normal'
              }`}
            >
              {experience.title}
            </h3>
            <p className="text-xs text-muted mt-1 tracking-wide">with {host.name}</p>
          </div>

          {variant === 'featured' && (
            <p className="text-sm text-charcoal-light leading-relaxed line-clamp-2">
              {experience.description}
            </p>
          )}

          <div className="flex flex-col gap-1.5 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
              <span>{formatDate(experience.dateTime)} · {formatTime(experience.dateTime)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
              <span className="truncate">{host.venue}</span>
            </div>
            {!isFull && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                <span>{spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/14">
            <span className="font-serif text-charcoal text-2xl font-normal">${experience.price}</span>
            <span className="rounded-full bg-[#F8E1C5] px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-[#15251E]">
              Reserve →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
