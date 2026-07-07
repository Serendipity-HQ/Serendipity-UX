import Link from "next/link";
import { CalendarDays, EyeOff, Leaf, MapPin, QrCode } from "lucide-react";
import { Header } from "@/components/Header";
import { ExperienceCard } from "@/components/ExperienceCard";
import { JourneyMap } from "@/components/AtlasModules";
import { experiences, getWeeklyRecommendations } from "@/lib/experiences";

export default function DashboardPage() {
  const weekly = getWeeklyRecommendations();

  return (
    <>
      <Header />
      <main className="container-page py-14">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">This week</p>
            <h1 className="serif mt-4 text-6xl font-semibold leading-none tracking-tight">Three invitations, no feed.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              One to deepen a passion. One to grow adjacent to it. One to surprise you into a new room. Each card now shows
              why it fits your path and what kind of people are entering the room.
            </p>
          </div>
          <Link href="/onboarding" className="quiet-button bg-paper-soft text-ink">Tune curation</Link>
        </section>

        <section className="mt-12 grid gap-6">
          {weekly.map((experience, index) => (
            <ExperienceCard key={experience.id} experience={experience} featured={index === 0} />
          ))}
        </section>

        <section className="mt-20 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">How the demo works</p>
            <h2 className="serif mt-3 text-5xl font-semibold leading-none">From curation to proof to path.</h2>
            <p className="mt-5 text-lg leading-8 text-muted">
              This dashboard is not a feed. It is a weekly set of invitations designed to create real-world participation
              and grow a verified passion path.
            </p>
          </div>
          <JourneyMap />
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-2">
          <div className="soft-card rounded-[28px] p-6">
            <EyeOff className="h-5 w-5 text-moss" />
            <h2 className="serif mt-5 text-3xl font-semibold">Anonymous guest lists</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              See who is coming by passion path and intention, not by face, job title, school, or follower count.
            </p>
          </div>
          <div className="soft-card rounded-[28px] p-6">
            <QrCode className="h-5 w-5 text-moss" />
            <h2 className="serif mt-5 text-3xl font-semibold">Verified attendance</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              A physical QR, NFC tap, host confirmation, or stamp turns attendance into a real node in the Experience Graph.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">Explore more</p>
              <h2 className="serif mt-3 text-5xl font-semibold">Small doors into real communities.</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {experiences.slice(3).map((experience) => (
              <Link key={experience.id} href={`/experiences/${experience.slug}`} className="soft-card rounded-[24px] p-5 transition hover:-translate-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                  <Leaf className="h-3.5 w-3.5" />
                  {experience.category}
                </div>
                <h3 className="serif mt-4 text-2xl font-semibold">{experience.title}</h3>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <MapPin className="h-4 w-4" />
                  {experience.city}
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <CalendarDays className="h-4 w-4" />
                  {experience.date}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
