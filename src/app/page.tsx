import Link from "next/link";
import { ArrowRight, Compass, Leaf, MapPin, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { ExperienceCard } from "@/components/ExperienceCard";
import { getWeeklyRecommendationsFor } from "@/lib/experienceRepository";

export default async function Home() {
  const weekly = await getWeeklyRecommendationsFor(null, "San Francisco");

  return (
    <>
      <Header />
      <main>
        <section className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-12 py-16 lg:grid-cols-[1fr_0.92fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-moss">San Francisco first</p>
            <h1 className="serif mt-6 max-w-5xl text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">
              Discover the experiences that shape who you become.
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-muted">
              Every week, Serendipity helps you find real-world experiences around your city — one for passion, one for
              growth, and one for surprise.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/onboarding" className="quiet-button bg-night text-paper">
                Join Serendipity <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/explore" className="quiet-button bg-paper-soft text-ink">Explore experiences</Link>
              <Link href="/submit" className="quiet-button bg-paper-soft text-ink">Submit an experience</Link>
            </div>
          </div>

          <div className="soft-card rounded-[36px] p-5">
            <div className="mb-4 flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">This week</span>
              <span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold text-moss">3 invitations</span>
            </div>
            <div className="grid gap-3">
              {weekly.map((experience) => (
                <Link key={experience.id} href={`/experiences/${experience.slug}`} className="rounded-3xl border border-line bg-paper-soft p-4 transition hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{experience.recommendationKind}</div>
                      <div className="serif mt-1 text-2xl font-semibold">{experience.title}</div>
                      <div className="mt-1 text-sm text-muted">{experience.location} · {experience.category}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-moss" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-paper-soft/70 py-20">
          <div className="container-page grid gap-6 md:grid-cols-3">
            {[
              [Compass, "Not another event feed", "Serendipity curates fewer, better invitations instead of asking you to scroll."],
              [MapPin, "Real-world only", "Every public recommendation points toward a place, a room, a host, or a community."],
              [Leaf, "Profiles as becoming", "Your profile is built from experiences attended, reflections, communities, and curiosity paths."],
            ].map(([Icon, title, copy]) => (
              <div key={String(title)} className="soft-card rounded-[28px] p-6">
                <Icon className="h-5 w-5 text-moss" />
                <h2 className="serif mt-5 text-3xl font-semibold">{String(title)}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{String(copy)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">How it works</p>
            <h2 className="serif mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
              Spend less time choosing, more time becoming.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["1", "Tell us your city and curiosities.", "A light onboarding collects interests, desired feelings, and goals."],
              ["2", "Receive three weekly invitations.", "Passion deepens what you love. Growth expands it. Surprise opens a new door."],
              ["3", "Attend, reflect, and build your path.", "Saved, going, attended, and reflections become a private map of who you are becoming."],
            ].map(([number, title, copy]) => (
              <div key={number} className="rounded-[28px] border border-line bg-paper-soft p-6">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-night font-semibold text-paper">{number}</div>
                <h3 className="serif mt-5 text-3xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-night py-24 text-paper">
          <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sage">Live database</p>
              <h2 className="serif mt-4 text-5xl font-semibold leading-none tracking-tight">A calm guide to what is worth showing up for.</h2>
              <p className="mt-6 text-lg leading-8 text-paper/70">
                The ingestion system keeps the database fresh. Submissions enter review. Approved experiences become public.
              </p>
              <Link href="/explore" className="quiet-button mt-8 bg-paper text-night">
                Browse SF <Sparkles className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5">
              {weekly.map((experience, index) => <ExperienceCard key={experience.id} experience={experience} featured={index === 0} />)}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
