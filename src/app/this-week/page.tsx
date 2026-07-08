import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { ExperienceCard } from "@/components/ExperienceCard";
import { getWeeklyRecommendationsFor, listApprovedExperiences } from "@/lib/experienceRepository";

export default async function ThisWeekPage() {
  const weekly = await getWeeklyRecommendationsFor(null, "San Francisco");
  const more = (await listApprovedExperiences({ city: "San Francisco" })).filter(
    (experience) => !weekly.some((item) => item.id === experience.id),
  );

  return (
    <>
      <Header />
      <main className="container-page py-14">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">This week in San Francisco</p>
            <h1 className="serif mt-4 max-w-4xl text-6xl font-semibold leading-none tracking-tight">
              One passion. One growth edge. One surprise.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              Serendipity keeps the surface small on purpose. Three invitations, chosen to get you out of the app and into
              real rooms.
            </p>
          </div>
          <Link href="/onboarding" className="quiet-button bg-paper-soft text-ink">
            Tune curation <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="mt-12 grid gap-6">
          {weekly.map((experience, index) => (
            <ExperienceCard key={experience.id} experience={experience} featured={index === 0} />
          ))}
        </section>

        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">More nearby</p>
              <h2 className="serif mt-3 text-5xl font-semibold">Other doors worth opening.</h2>
            </div>
            <Link href="/explore" className="quiet-button bg-night text-paper">Explore all</Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {more.slice(0, 6).map((experience) => <ExperienceCard key={experience.id} experience={experience} />)}
          </div>
        </section>
      </main>
    </>
  );
}
