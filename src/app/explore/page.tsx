import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { Header } from "@/components/Header";
import { ExperienceCard } from "@/components/ExperienceCard";
import { listApprovedExperiences } from "@/lib/experienceRepository";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]);
  const city = get("city") ?? "San Francisco";
  const experiences = await listApprovedExperiences({
    city,
    query: get("q"),
    category: get("category"),
    neighborhood: get("neighborhood"),
    bucket: get("bucket"),
    tag: get("tag"),
    beginner: get("beginner") === "true",
    free: get("free") === "true",
  });

  const categories = [...new Set(experiences.map((item) => item.category))].sort();
  const neighborhoods = [...new Set(experiences.map((item) => item.neighborhood ?? item.location).filter(Boolean))].sort();

  return (
    <>
      <Header />
      <main className="container-page py-12">
        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Explore</p>
            <h1 className="serif mt-4 text-6xl font-semibold leading-none tracking-tight">
              Find the rooms that might change your week.
            </h1>
          </div>
          <p className="text-lg leading-8 text-muted">
            Browse approved experiences from the live database. No infinite feed, just real places, communities, workshops,
            talks, rituals, and gatherings.
          </p>
        </section>

        <form className="soft-card mt-10 grid gap-3 rounded-[28px] p-4 md:grid-cols-[1.4fr_1fr_1fr_auto_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={get("q") ?? ""}
              placeholder="Search pottery, jazz, founders, architecture..."
              className="w-full rounded-2xl border border-line bg-paper-soft py-3 pl-10 pr-4 outline-none focus:border-moss"
            />
          </label>
          <select name="category" defaultValue={get("category") ?? ""} className="rounded-2xl border border-line bg-paper-soft px-4 py-3 outline-none focus:border-moss">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <select name="neighborhood" defaultValue={get("neighborhood") ?? ""} className="rounded-2xl border border-line bg-paper-soft px-4 py-3 outline-none focus:border-moss">
            <option value="">All neighborhoods</option>
            {neighborhoods.map((neighborhood) => <option key={neighborhood}>{neighborhood}</option>)}
          </select>
          <input type="hidden" name="city" value={city} />
          <button className="quiet-button bg-night text-paper" type="submit">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
          <Link href="/explore" className="quiet-button bg-paper-soft text-ink">Reset</Link>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          {["passion", "growth", "surprise"].map((bucket) => (
            <Link key={bucket} href={`/explore?city=${encodeURIComponent(city)}&bucket=${bucket}`} className="rounded-full border border-line bg-paper-soft px-4 py-2 text-sm font-semibold capitalize text-muted">
              {bucket}
            </Link>
          ))}
          <Link href={`/explore?city=${encodeURIComponent(city)}&beginner=true`} className="rounded-full border border-line bg-paper-soft px-4 py-2 text-sm font-semibold text-muted">
            Beginner friendly
          </Link>
          <Link href={`/explore?city=${encodeURIComponent(city)}&free=true`} className="rounded-full border border-line bg-paper-soft px-4 py-2 text-sm font-semibold text-muted">
            Free
          </Link>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {experiences.map((experience) => <ExperienceCard key={experience.id} experience={experience} />)}
        </section>

        {!experiences.length ? (
          <section className="soft-card mt-10 rounded-[28px] p-8">
            <h2 className="serif text-3xl font-semibold">No matches yet.</h2>
            <p className="mt-3 text-muted">Try fewer filters, or submit an experience that belongs here.</p>
            <Link href="/submit" className="quiet-button mt-5 bg-night text-paper">Submit an experience</Link>
          </section>
        ) : null}
      </main>
    </>
  );
}
