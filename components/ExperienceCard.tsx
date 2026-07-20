import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Clock, MapPin, Users } from 'lucide-react'
import type { Experience, Host } from '@serendipity-hq/design'
import { LaneBadge } from '@serendipity-hq/ui'
import { externalUrlFor, hasKnownPrice } from '@/lib/experience-metadata'

type Props = {
  experience: Experience
  host: Host
  variant?: 'featured' | 'grid'
}

function eventDate(dateTime: string) {
  const date = new Date(dateTime)
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

export default function ExperienceCard({ experience, host, variant = 'grid' }: Props) {
  const externalUrl = externalUrlFor(experience)
  const spotsLeft = experience.spotsTotal - experience.spotsBooked
  const isFull = !externalUrl && spotsLeft === 0
  const imageSrc = experience.imageUrl || `https://picsum.photos/seed/${experience.imageSeed}/600/450`
  const priceLabel = !hasKnownPrice(experience)
    ? 'See ticket site'
    : experience.price === 0
      ? 'Free'
      : `$${experience.price}`

  return (
    <Link href={`/experience/${experience.id}`} className="group block">
      <article className={`invitation-card lane-shadow-${experience.lane} overflow-hidden card-lift ${variant === 'featured' ? 'flex flex-col md:flex-row' : ''}`}>
        <div className={`relative overflow-hidden bg-parchment ${variant === 'featured' ? 'aspect-[5/4] md:w-1/2 md:aspect-auto' : 'aspect-[5/4]'}`}>
          <Image src={imageSrc} alt={experience.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          <div className="absolute inset-0 bg-black/8 transition-colors duration-300 group-hover:bg-black/2" />
        </div>

        <div className={`flex flex-col gap-3 p-5 ${variant === 'featured' ? 'flex-1 md:p-7' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <LaneBadge lane={experience.lane} />
            {isFull && <span className="stamp-mark stamp-ink text-[8px]">Full</span>}
          </div>
          <div>
            <h3 className={`font-serif font-semibold leading-[1.08] text-charcoal transition-colors group-hover:text-terracotta ${variant === 'featured' ? 'text-2xl md:text-3xl' : 'text-xl'}`}>{experience.title}</h3>
            <p className="mt-1 text-xs tracking-wide text-muted">A note from {host.name}</p>
          </div>
          {variant === 'featured' && <p className="line-clamp-2 text-sm leading-relaxed text-charcoal-light">{experience.description}</p>}
          <div className="flex flex-col gap-1.5 text-xs text-muted">
            <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} /><span>{eventDate(experience.dateTime)}</span></div>
            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" strokeWidth={1.5} /><span className="truncate">{host.venue}</span></div>
            {!externalUrl && !isFull && <div className="flex items-center gap-1.5"><Users className="h-3 w-3 shrink-0" strokeWidth={1.5} /><span>{spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left</span></div>}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-[#c8bca4] pt-3">
            <span className={`${hasKnownPrice(experience) ? 'font-serif text-2xl font-semibold' : 'text-xs font-semibold uppercase tracking-wider'} text-charcoal`}>{priceLabel}</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#a74838]">View invitation <ArrowUpRight className="h-3.5 w-3.5" /></span>
          </div>
        </div>
      </article>
    </Link>
  )
}
