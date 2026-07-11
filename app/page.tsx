import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { LaneBadge, Reveal } from '@serendipity-hq/ui'
import { EXPERIENCES, HOSTS } from '@/lib/mock-data'

const FEATURED_IDS = ['e1', 'e4', 'e7']

const DISCOVERY_ROW1 = ['TikTok', 'Instagram', 'Discord', 'Newsletters', 'Text messages', 'Pure luck']
const DISCOVERY_ROW2 = ['Reddit', 'Group chats', 'Facebook events', 'Word of mouth', 'Email lists', 'Stumbled upon it']

export default function LandingPage() {
  const featured = FEATURED_IDS.map((id) => {
    const exp = EXPERIENCES.find((e) => e.id === id)!
    const host = HOSTS.find((h) => h.id === exp.hostId)!
    return { exp, host }
  })

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-24 md:pt-28 md:pb-32">
        <Reveal>
          <p className="editorial-kicker text-[10px] tracking-[0.2em] uppercase mb-10">
            Est. 2026 · Boston
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="font-serif text-[clamp(2.8rem,7vw,5.8rem)] text-charcoal leading-[1.04] mb-8">
            The internet became the
            <br className="hidden sm:block" />
            place where we{' '}
            <span className="italic text-muted">document</span>
            <br className="hidden sm:block" />
            our lives.
          </h1>
        </Reveal>

        <Reveal delay={180}>
          <h2 className="font-serif text-[clamp(1.9rem,4.5vw,3.7rem)] text-[#F8E1C5] leading-[1.08] mb-10">
            We think it should become
            <br className="hidden sm:block" />
            the place that helps us{' '}
            <span className="italic">live</span> them.
          </h2>
        </Reveal>

        <Reveal delay={280}>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 bg-charcoal text-cream px-7 py-3.5 rounded-full text-sm tracking-wide hover:bg-charcoal/85 transition-all duration-200 active:scale-95"
            >
              Start your story
              <ArrowRight
                className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 border border-border text-charcoal-light px-7 py-3.5 rounded-full text-sm tracking-wide hover:border-sand hover:text-charcoal transition-all duration-200"
            >
              Browse experiences
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── RULE ── */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="rule" />
      </div>

      {/* ── PROBLEM ── */}
      <section className="max-w-5xl mx-auto px-5 py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <Reveal className="order-2 md:order-1">
          <p className="editorial-kicker text-[10px] tracking-[0.2em] uppercase mb-6">The problem</p>
          <p className="font-serif text-xl md:text-2xl text-charcoal leading-relaxed mb-5">
            Discovering the things that change our lives — a pottery studio, a lecture, a climbing
            gym, a neighborhood dinner — happens through a chaotic mix of TikTok, Instagram,
            newsletters, Discord servers, and pure luck.
          </p>
          <p className="text-sm text-charcoal-light leading-relaxed">
            The last twenty years of technology optimized communication, information, and
            entertainment. Yet the path to meaningful real-world experience became increasingly
            fragmented.
          </p>
        </Reveal>

        <Reveal delay={100} className="order-1 md:order-2">
          <div
            className="relative overflow-hidden rounded-2xl py-1 select-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
              maskImage: 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
            }}
          >
            {/* Row 1 — scrolls left */}
            <div className="flex w-max gap-3 items-center mb-3 marquee-l">
              {[...DISCOVERY_ROW1, ...DISCOVERY_ROW1].map((s, i) => (
                <span
                  key={i}
                  className="border border-white/16 bg-white/8 whitespace-nowrap text-[11px] tracking-wide text-muted rounded-full px-4 py-2"
                >
                  {s}
                </span>
              ))}
            </div>
            {/* Row 2 — scrolls right */}
            <div className="flex w-max gap-3 items-center marquee-r">
              {[...DISCOVERY_ROW2, ...DISCOVERY_ROW2].map((s, i) => (
                <span
                  key={i}
                  className="border border-white/16 bg-white/8 whitespace-nowrap text-[11px] tracking-wide text-muted rounded-full px-4 py-2"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── RULE ── */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="rule" />
      </div>

      {/* ── THREE LANES ── */}
      <section className="max-w-5xl mx-auto px-5 py-20 md:py-28">
        <Reveal>
          <p className="editorial-kicker text-[10px] tracking-[0.2em] uppercase mb-6">Our answer</p>
          <h2 className="font-serif text-4xl md:text-6xl text-charcoal leading-[1.02] mb-5">
            Not another feed.
            <br />
            A real social{' '}
            <span className="italic">&ldquo;network.&rdquo;</span>
          </h2>
          <p className="text-charcoal-light max-w-lg mb-14 leading-relaxed">
            A new kind of network built around experiences instead of content. Where your identity
            isn&apos;t defined by what you post, but by the experiences that shape you.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* ── Passion ── */}
          <Reveal delay={0}>
            <div className="liquid-card group rounded-[36px] overflow-hidden transition-all duration-300 card-lift h-full flex flex-col">
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-7">
                  <LaneBadge lane="passion" />
                  <span className="font-serif text-[11px] tracking-[0.2em] text-border">01</span>
                </div>
                <h3 className="font-serif text-xl text-charcoal mb-3 leading-snug">Deepen a skill.</h3>
                <p className="text-sm text-charcoal-light leading-relaxed flex-1">
                  The things you love, practiced with intention. Craft pursued seriously — guided by
                  someone who has gone much further than you have.
                </p>
                <div className="flex justify-end mt-7">
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <circle cx="17" cy="17" r="13" stroke="#DDD0C2" strokeWidth="1" />
                    <circle
                      cx="17" cy="17" r="13"
                      stroke="#D85B49" strokeWidth="1.5" strokeLinecap="round"
                      strokeDasharray="81.68"
                      className="arc-trace"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '17px 17px' }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── Growth ── */}
          <Reveal delay={120}>
            <div className="liquid-card group rounded-[36px] overflow-hidden transition-all duration-300 card-lift h-full flex flex-col">
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-7">
                  <LaneBadge lane="growth" />
                  <span className="font-serif text-[11px] tracking-[0.2em] text-border">02</span>
                </div>
                <h3 className="font-serif text-xl text-charcoal mb-3 leading-snug">Expand your mind.</h3>
                <p className="text-sm text-charcoal-light leading-relaxed flex-1">
                  Ideas that shift how you see the world. Philosophy, science, movement — knowledge
                  that changes you long after the evening ends.
                </p>
                <div className="flex justify-end mt-7">
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <circle cx="17" cy="17" r="13" stroke="#DDD0C2" strokeWidth="1" />
                    <circle
                      cx="17" cy="17" r="13"
                      stroke="#1F6F55" strokeWidth="1.5" strokeLinecap="round"
                      strokeDasharray="81.68"
                      className="arc-trace-1"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '17px 17px' }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── Surprise ── */}
          <Reveal delay={240}>
            <div className="liquid-card group rounded-[36px] overflow-hidden transition-all duration-300 card-lift h-full flex flex-col">
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-7">
                  <LaneBadge lane="surprise" />
                  <span className="font-serif text-[11px] tracking-[0.2em] text-border">03</span>
                </div>
                <h3 className="font-serif text-xl text-charcoal mb-3 leading-snug">Stumble into something.</h3>
                <p className="text-sm text-charcoal-light leading-relaxed flex-1">
                  Something you wouldn&apos;t have chosen yourself — but were changed by. This is
                  the lane that earns the name.
                </p>
                <div className="flex justify-end mt-7">
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <circle cx="17" cy="17" r="13" stroke="#DDD0C2" strokeWidth="1" />
                    <circle
                      cx="17" cy="17" r="13"
                      stroke="#2457D6" strokeWidth="1.5" strokeLinecap="round"
                      strokeDasharray="81.68"
                      className="arc-trace-2"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '17px 17px' }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── RULE ── */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="rule" />
      </div>

      {/* ── FEATURED EXPERIENCES ── */}
      <section className="max-w-5xl mx-auto px-5 py-20 md:py-28">
        <Reveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">
                This week&apos;s invitations
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
                Experiences worth having.
              </h2>
            </div>
            <Link
              href="/discover"
              className="hidden md:inline-flex text-xs tracking-widest uppercase text-muted hover:text-charcoal link-underline items-center gap-1.5 transition-colors duration-200"
            >
              All experiences <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map(({ exp, host }, i) => (
            <Reveal key={exp.id} delay={i * 80}>
              <Link href={`/experience/${exp.id}`} className="group block">
                <article className="liquid-card rounded-[36px] overflow-hidden card-lift">
                  <div className="relative aspect-[4/3] bg-parchment">
                    <Image
                      src={`https://picsum.photos/seed/${exp.imageSeed}/600/450`}
                      alt={exp.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <LaneBadge lane={exp.lane} />
                      <h3 className="font-serif text-[17px] text-charcoal mt-2.5 leading-snug group-hover:text-[#F0B47F] transition-colors duration-200">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-muted mt-1 tracking-wide">with {host.name}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/50">
                      <span className="font-serif text-charcoal">${exp.price}</span>
                      <span className="text-[9px] tracking-widest uppercase text-muted">
                        {exp.spotsTotal - exp.spotsBooked} spots left
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="bg-[#132A20] py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 border-y border-white/8" />
        <div className="relative max-w-4xl mx-auto px-5">
          <Reveal>
            <p className="text-[10px] tracking-[0.2em] uppercase text-sand/40 mb-10">
              Our belief
            </p>
          </Reveal>
          <Reveal delay={80}>
            <blockquote className="font-serif text-[clamp(1.5rem,4vw,3rem)] text-cream leading-[1.3] mb-8">
              &ldquo;Technology has become incredibly good at helping us consume.
              <br className="hidden md:block" />
              Now it should become exceptional at helping us{' '}
              <span className="italic text-[#F8E1C5]">participate</span>.&rdquo;
            </blockquote>
          </Reveal>
          <Reveal delay={180}>
            <p className="text-sand/60 max-w-xl leading-relaxed text-sm mb-12">
              Serendipity connects people, communities, and experience-based businesses into a
              living network of human possibility. Not because we think technology should replace
              the real world — because we believe its highest purpose is helping people
              experience more of it.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 bg-[#F8E1C5] text-[#15251E] px-7 py-3.5 rounded-full text-sm tracking-wide hover:bg-[#F8E1C5]/85 transition-all duration-200 active:scale-95"
            >
              Join Serendipity
              <ArrowRight
                className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="max-w-5xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-serif text-sm text-muted tracking-wide">Serendipity</p>
        <p className="text-[10px] tracking-widest uppercase text-muted/60">
          A network built around experiences, not content.
        </p>
      </footer>
    </div>
  )
}
