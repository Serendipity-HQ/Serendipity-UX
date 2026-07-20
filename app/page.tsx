import Link from 'next/link'
import { ArrowRight, Compass, Mail } from 'lucide-react'
import { LaneBadge, Reveal } from '@serendipity-hq/ui'
import ExperienceCard from '@/components/ExperienceCard'
import { EXPERIENCES, HOSTS } from '@/lib/mock-data'

const FEATURED_IDS = ['e1', 'e4', 'e7']

const LANES = [
  { lane: 'passion' as const, number: '01', title: 'Deepen a skill.', copy: 'Craft practiced with care, guided by someone who has taken the long way through it.' },
  { lane: 'growth' as const, number: '02', title: 'Expand your mind.', copy: 'Ideas, movement, and conversations that leave a lasting change in how you see the world.' },
  { lane: 'surprise' as const, number: '03', title: 'Stumble into something.', copy: 'An invitation beyond your usual orbit, selected for the possibility of being changed by it.' },
]

export default function LandingPage() {
  const featured = FEATURED_IDS.flatMap((id) => {
    const experience = EXPERIENCES.find((candidate) => candidate.id === id)
    const host = experience ? HOSTS.find((candidate) => candidate.id === experience.hostId) : null
    return experience && host ? [{ experience, host }] : []
  })

  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 md:pb-24 md:pt-20">
        <Reveal>
          <div className="mb-8 flex items-center justify-between border-y border-[#b8aa91] py-3 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
            <span>Serendipity city post</span>
            <span>Boston, 2026</span>
          </div>
        </Reveal>

        <div className="grid items-end gap-10 md:grid-cols-[minmax(0,1.25fr)_minmax(240px,0.75fr)]">
          <div>
            <Reveal delay={80}>
              <p className="editorial-kicker mb-5 text-[10px] uppercase tracking-[0.2em]">A better reason to go out</p>
              <h1 className="max-w-3xl font-serif text-[clamp(3.25rem,8vw,6.6rem)] leading-[0.94] text-charcoal">
                Make your life a little less expected.
              </h1>
            </Reveal>
          </div>

          <Reveal delay={180}>
            <aside className="border-l-2 border-terracotta pl-5 md:mb-2">
              <p className="font-serif text-xl leading-snug text-charcoal">
                Real experiences, offered by people with something worth sharing.
              </p>
              <p className="mt-4 text-sm text-charcoal-light">
                One thoughtful invitation at a time. No endless feed required.
              </p>
            </aside>
          </Reveal>
        </div>

        <Reveal delay={260}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/signup" className="paper-button w-full sm:w-auto">
              Begin your story <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
            </Link>
            <Link href="/discover" className="paper-button paper-button--quiet w-full sm:w-auto">
              Browse invitations <Compass className="h-4 w-4" strokeWidth={1.7} />
            </Link>
          </div>
        </Reveal>
      </section>

      <div className="mx-auto max-w-6xl px-5"><div className="rule" /></div>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <p className="editorial-kicker mb-4 text-[10px] uppercase tracking-[0.2em]">Three ways in</p>
            <h2 className="font-serif text-4xl leading-[1.02] text-charcoal md:text-6xl">A social life with more shape to it.</h2>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {LANES.map(({ lane, number, title, copy }, index) => (
            <Reveal key={lane} delay={index * 90}>
              <article className="invitation-card card-lift flex min-h-[240px] flex-col p-6">
                <div className="flex items-start justify-between">
                  <LaneBadge lane={lane} />
                  <span className="font-serif text-lg text-border">{number}</span>
                </div>
                <div className="mt-auto pt-10">
                  <h3 className="font-serif text-2xl leading-tight text-charcoal">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal-light">{copy}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5"><div className="rule" /></div>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <p className="editorial-kicker mb-4 text-[10px] uppercase tracking-[0.2em]">This week&apos;s post</p>
              <h2 className="font-serif text-4xl leading-none text-charcoal md:text-5xl">Three notes from your city.</h2>
            </div>
            <Link href="/discover" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#a74838] link-underline md:inline-flex">
              All invitations <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {featured.map(({ experience, host }, index) => (
            <Reveal key={experience.id} delay={index * 90}>
              <ExperienceCard experience={experience} host={host} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-[#8f826d] bg-[#293028] py-16 text-cream md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[1fr_auto] md:items-end">
          <Reveal>
            <div className="max-w-2xl">
              <Mail className="mb-5 h-6 w-6 text-amber" strokeWidth={1.5} />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c985]">The standing invitation</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">The internet should help you participate, not just watch.</h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Link href="/signup" className="paper-button border-[#fff8e8] bg-[#fff8e8] text-charcoal shadow-[3px_3px_0_#edb84e] hover:bg-[#f3ead9]">
              Join Serendipity <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
            </Link>
          </Reveal>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-9 text-center sm:flex-row sm:text-left">
        <p className="font-serif text-sm text-charcoal">Serendipity</p>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">A network built around experiences, not content.</p>
      </footer>
    </div>
  )
}
