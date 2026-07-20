'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CalendarDays, MapPin, Sparkles, Trash2 } from 'lucide-react'
import type { Experience, Host, Lane } from '@serendipity-hq/design'
import { LaneBadge, Reveal } from '@serendipity-hq/ui'
import { useApp } from '@/context/AppContext'

const LANE_GUIDANCE: Record<Lane, { title: string; description: string }> = {
  passion: {
    title: 'Follow the pull',
    description: 'Go deeper into the crafts, questions, and worlds that already hold your attention.',
  },
  growth: {
    title: 'Engage your mind',
    description: 'Build perspective through ideas, practice, reflection, and meaningful challenge.',
  },
  surprise: {
    title: 'Leave an open door',
    description: 'Make room for an experience you would not have thought to choose for yourself.',
  },
}

function formatDate(dateTime: string) {
  return new Date(dateTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function PathCard({
  experience,
  host,
  onRemove,
}: {
  experience: Experience
  host: Host | undefined
  onRemove: () => void
}) {
  return (
    <article className="liquid-card overflow-hidden rounded-[28px]">
      <div className="grid sm:grid-cols-[180px_1fr]">
        <Link
          href={`/experience/${experience.id}`}
          className="relative block aspect-[16/9] bg-parchment sm:aspect-auto sm:min-h-48"
          aria-label={`View ${experience.title}`}
        >
          <Image
            src={experience.imageUrl || `https://picsum.photos/seed/${experience.imageSeed}/640/480`}
            alt=""
            fill
            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 180px"
          />
        </Link>
        <div className="flex flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <LaneBadge lane={experience.lane} size="xs" />
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${experience.title} from your Passion Path`}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/30 hover:text-terracotta"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
          <Link href={`/experience/${experience.id}`} className="group">
            <h2 className="font-serif text-xl leading-snug text-charcoal transition-colors group-hover:text-terracotta">
              {experience.title}
            </h2>
          </Link>
          <p className="mt-1 text-xs text-muted">with {host?.name ?? 'a Serendipity host'}</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-charcoal-light">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted" strokeWidth={1.5} aria-hidden="true" />
              {formatDate(experience.dateTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted" strokeWidth={1.5} aria-hidden="true" />
              {experience.location.split(',')[0]}
            </span>
          </div>
          <Link
            href={`/experience/${experience.id}`}
            className="mt-5 inline-flex min-h-11 items-center gap-1.5 self-start text-[10px] uppercase tracking-widest text-terracotta hover:underline"
          >
            See invitation
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function PassionPathPage() {
  const {
    experiences,
    hosts,
    isLoggedIn,
    passionPathExperienceIds,
    removeFromPassionPath,
  } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login')
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  const savedExperiences = passionPathExperienceIds.flatMap((experienceId) => {
    const experience = experiences.find((item) => item.id === experienceId)
    return experience ? [experience] : []
  })

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:py-14">
      <Reveal fade>
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted">Your unfolding story</p>
        <div className="mb-10 max-w-2xl">
          <h1 className="mb-3 font-serif text-3xl text-charcoal md:text-4xl">Passion Path.</h1>
          <p className="text-sm leading-relaxed text-charcoal-light">
            A place for the experiences you want to grow toward. Keep what calls to you, invite someone
            along, and let each choice shape what Serendipity finds next.
          </p>
        </div>
      </Reveal>

      {savedExperiences.length === 0 ? (
        <Reveal>
          <div className="liquid-card rounded-[28px] px-6 py-16 text-center">
            <Sparkles className="mx-auto mb-5 h-6 w-6 text-terracotta" strokeWidth={1.4} aria-hidden="true" />
            <h2 className="mb-2 font-serif text-2xl text-charcoal">Your next thread starts here.</h2>
            <p className="mx-auto mb-7 max-w-md text-sm leading-relaxed text-muted">
              Save an invitation that sparks curiosity. Your path can hold a passion to deepen, a real
              intellectual stretch, or a surprise worth making room for.
            </p>
            <Link
              href="/discover"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal/85 active:scale-95"
            >
              Find an experience
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-12">
          {(['passion', 'growth', 'surprise'] as const).map((lane) => {
            const laneExperiences = savedExperiences.filter((experience) => experience.lane === lane)
            if (laneExperiences.length === 0) return null
            const guidance = LANE_GUIDANCE[lane]

            return (
              <section key={lane} aria-labelledby={`${lane}-path-title`}>
                <Reveal>
                  <div className="mb-5 flex items-start gap-3">
                    <LaneBadge lane={lane} />
                    <div>
                      <h2 id={`${lane}-path-title`} className="font-serif text-xl text-charcoal">
                        {guidance.title}
                      </h2>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted">
                        {guidance.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
                <div className="space-y-4">
                  {laneExperiences.map((experience, index) => (
                    <Reveal key={experience.id} delay={Math.min(index * 60, 180)}>
                      <PathCard
                        experience={experience}
                        host={hosts.find((host) => host.id === experience.hostId)}
                        onRemove={() => removeFromPassionPath(experience.id)}
                      />
                    </Reveal>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
