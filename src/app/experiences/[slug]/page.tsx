import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ExternalLink, EyeOff, MapPin, QrCode, UsersRound } from "lucide-react";
import { Header } from "@/components/Header";
import { AnonymousGuestList } from "@/components/AtlasModules";
import { ExperienceActions } from "@/components/ExperienceActions";
import { ExperienceArtwork } from "@/components/ExperienceArtwork";
import { ExperienceCard } from "@/components/ExperienceCard";
import { getExperienceByIdOrSlug, getRelatedExperiencesFor } from "@/lib/experienceRepository";

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experience = await getExperienceByIdOrSlug(slug);
  if (!experience) notFound();

  const related = await getRelatedExperiencesFor(experience);

  return (
    <>
      <Header />
      <main className="container-page py-12">
        <section className={`grid gap-8 ${experience.imageUrl ? "lg:grid-cols-[0.72fr_1.28fr]" : ""}`}>
          {experience.imageUrl ? (
            <ExperienceArtwork experience={experience} className="aspect-[4/3] rounded-[28px]" />
          ) : null}
          <div className="soft-card rounded-[32px] p-8">
            <div className="rounded-full bg-sage px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-moss w-fit">
              {experience.recommendationKind}
            </div>
            <h1 className="serif mt-5 max-w-5xl text-6xl font-semibold leading-none tracking-tight">{experience.title}</h1>
            <p className="mt-6 text-lg leading-8 text-muted">{experience.longDescription}</p>
            <div className="mt-7 grid gap-4 text-sm sm:grid-cols-3">
              <Fact icon={<CalendarDays className="h-4 w-4" />} label="When" value={`${experience.date}, ${experience.time}`} />
              <Fact icon={<MapPin className="h-4 w-4" />} label="Where" value={`${experience.address ?? experience.location}, ${experience.city}`} />
              <Fact icon={<UsersRound className="h-4 w-4" />} label="Host" value={experience.host} />
            </div>
            <div className="mt-7">
              <ExperienceActions experienceId={experience.id} />
              {experience.sourceUrl ? (
                <a
                  href={experience.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="quiet-button mt-3 bg-paper-soft text-ink"
                >
                  Open sign-up page <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="soft-card rounded-[28px] p-7">
            <h2 className="serif text-3xl font-semibold">Why we think you&apos;ll enjoy this</h2>
            <p className="mt-4 leading-7 text-muted">{experience.whyRecommended}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {experience.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-line bg-paper-soft px-3 py-1 text-sm text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="soft-card rounded-[28px] p-7">
            <h2 className="serif text-3xl font-semibold">What to know</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <Detail label="Vibe" value={experience.vibe} />
              <Detail label="Beginner friendly" value={experience.beginnerFriendly ? "Yes" : "No"} />
              <Detail label="Social intensity" value={experience.socialIntensity} />
              <Detail label="Cadence" value={experience.cadence} />
              <Detail label="Cost" value={experience.cost} />
              {experience.sourceUrl ? <Detail label="Sign-up/info" value="Available from host" /> : null}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="soft-card rounded-[28px] p-7">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-moss">
              <EyeOff className="h-4 w-4" />
              Anonymous guest list
            </div>
            <h2 className="serif mt-4 text-4xl font-semibold">See the paths entering the room, not the status signals.</h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              Serendipity can show attendee intention and passion-path overlap before revealing names, faces, jobs, or social
              profiles. Enough context to feel the room has potential. Not enough to prejudge the people.
            </p>
            <div className="mt-6">
              <AnonymousGuestList guests={experience.anonymousGuests} />
            </div>
          </div>
          <div className="grid gap-6">
            <div className="soft-card rounded-[28px] p-7">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-moss">
                <QrCode className="h-4 w-4" />
                Proof of attendance
              </div>
              <h2 className="serif mt-4 text-3xl font-semibold">{experience.proofMethod}</h2>
              <p className="mt-4 text-sm leading-6 text-muted">
                Proof should be physical and lightweight. The goal is integrity, not surveillance. Verified attendance earns
                the experience a place on the user&apos;s Passion Path.
              </p>
            </div>
            <div className="soft-card rounded-[28px] p-7">
              <h2 className="serif text-3xl font-semibold">Afterward, reflect.</h2>
              <div className="mt-5 grid gap-3 text-sm">
                {["What surprised you?", "Did you meet anyone interesting?", "Would you come back?", "What new curiosity did this spark?"].map((question) => (
                  <div key={question} className="rounded-2xl border border-line bg-paper-soft p-4 text-muted">
                    {question}
                  </div>
                ))}
              </div>
              <Link href={`/experiences/${experience.slug}/reflect`} className="quiet-button mt-5 bg-night text-paper">
                What surprised you?
              </Link>
            </div>
          </div>
        </section>

        {related.length ? (
          <section className="mt-20">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">People who loved this also discovered</p>
            <h2 className="serif mt-3 text-5xl font-semibold">Where this could lead next.</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((item) => <ExperienceCard key={item.id} experience={item} />)}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-soft p-4">
      <div className="flex items-center gap-2 text-muted">{icon}{label}</div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
      <span className="text-muted">{label}</span>
      <span className="font-semibold capitalize">{value}</span>
    </div>
  );
}
