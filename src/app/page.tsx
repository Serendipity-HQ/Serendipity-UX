import Link from "next/link";
import { ArrowRight, EyeOff, QrCode, UsersRound } from "lucide-react";
import { Header } from "@/components/Header";
import { JourneyMap, PassionPathDiagram, PhilosophyTiles } from "@/components/AtlasModules";
import { getWeeklyRecommendations } from "@/lib/experiences";

export default function Home() {
  const [passion, growth, surprise] = getWeeklyRecommendations();

  return (
    <>
      <Header />
      <main>
        <section className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-moss">A real-life social network</p>
            <h1 className="serif mt-6 max-w-5xl text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">
              You are not who you post as. You are who you become.
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-muted">
              Serendipity helps people discover experiences, communities, places, and passions that shape their real
              lives. No infinite feed. No status graph. Three intentional invitations to leave the app and enter the world.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/onboarding" className="quiet-button bg-night text-paper">
                Start the journey <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="quiet-button bg-paper-soft text-ink">
                See the product demo
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-8 -top-8 hidden h-32 w-32 rounded-full bg-sage blur-2xl lg:block" />
            <div className="soft-card rounded-[36px] p-5">
              <div className="mb-4 flex items-center justify-between px-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">This week</span>
                <span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold text-moss">3 invitations</span>
              </div>
              <div className="grid gap-3">
                {[passion, growth, surprise].map((experience) => (
                  <Link key={experience.id} href={`/experiences/${experience.slug}`} className="rounded-3xl border border-line bg-paper-soft p-4 transition hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{experience.recommendationKind}</div>
                        <div className="serif mt-1 text-2xl font-semibold">{experience.title}</div>
                        <div className="mt-1 text-sm text-muted">{experience.city} · {experience.community}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-moss" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-paper-soft/70 py-20">
          <div className="container-page">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">The thesis</p>
              <h2 className="serif mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
                A social network based on real interactions, not social media larps.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted">
                The graph is built from attendance, reflection, shared paths, and communities joined. People discover
                each other through context, not follower counts.
              </p>
            </div>
            <div className="mt-12">
              <PhilosophyTiles />
            </div>
          </div>
        </section>

        <section className="container-page py-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Customer journey</p>
              <h2 className="serif mt-4 text-5xl font-semibold leading-none tracking-tight">From uncertainty to a path.</h2>
              <p className="mt-6 text-lg leading-8 text-muted">
                The user starts with who they might be, where they are, and when real life can happen. Serendipity turns
                that into a weekly rhythm of Passion, Growth, and Surprise.
              </p>
            </div>
            <JourneyMap />
          </div>
        </section>

        <section className="border-y border-line bg-night py-24 text-paper">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sage">Bias-light discovery</p>
              <h2 className="serif mt-4 text-5xl font-semibold leading-none tracking-tight">Guest lists without the status theater.</h2>
              <p className="mt-6 text-lg leading-8 text-paper/70">
                Before an event, users can see anonymous attendee paths instead of names, faces, jobs, schools, or follower
                counts. Enough signal to feel the room has potential. Not enough to prejudge the people inside it.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                [EyeOff, "Anonymous attendee cards", "Currently exploring, recent path, and why they are attending."],
                [UsersRound, "Path overlap", "Meet people who are becoming near you, not people optimized for clout."],
                [QrCode, "Physical proof", "QR, NFC, host confirmation, or a stamp turns attendance into a verified node."],
              ].map(([Icon, title, copy]) => (
                <div key={String(title)} className="rounded-3xl border border-paper/10 bg-paper/8 p-5">
                  <Icon className="h-5 w-5 text-sage" />
                  <h3 className="serif mt-4 text-2xl font-semibold">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-paper/65">{String(copy)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-24">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <PassionPathDiagram />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Experience graph</p>
              <h2 className="serif mt-4 text-5xl font-semibold leading-none tracking-tight">Profiles become stories of becoming.</h2>
              <p className="mt-6 text-lg leading-8 text-muted">
                Serendipity profiles show currently exploring, communities joined, recent reflections, and curiosity paths.
                The long-term asset is the map of how real-world experiences shape identity.
              </p>
              <div className="mt-8 grid gap-3">
                {["Currently Exploring", "Communities Joined", "Reflections", "Passion Path Overlap"].map((item) => (
                  <div key={item} className="rounded-2xl border border-line bg-paper-soft p-4 font-semibold">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-paper-soft/70 py-24">
          <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">Business side</p>
              <h2 className="serif mt-4 text-5xl font-semibold leading-none tracking-tight">CRM means Community Relations Manager.</h2>
              <p className="mt-6 text-lg leading-8 text-muted">
                Experience-based businesses do not only need bookings. They need repeat visitors, better-fit attendees,
                cross-business referrals, and community health.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "Pottery studios see who becomes a regular.",
                "Run clubs understand which rituals create friendship.",
                "Coffee shops discover adjacent founder and book communities.",
                "Makerspaces see which events turn curiosity into projects.",
              ].map((item) => (
                <div key={item} className="soft-card rounded-[24px] p-5 text-sm font-semibold leading-6">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
