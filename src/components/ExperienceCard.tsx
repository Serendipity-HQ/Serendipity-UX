import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Experience } from "@/lib/types";
import { ExperienceActions } from "./ExperienceActions";
import { ExperienceArtwork } from "./ExperienceArtwork";

export function ExperienceCard({ experience, featured = false }: { experience: Experience; featured?: boolean }) {
  const hasImage = Boolean(experience.imageUrl);

  return (
    <article className={`soft-card overflow-hidden rounded-[24px] ${featured ? "md:grid md:grid-cols-[0.42fr_1fr]" : ""}`}>
      <Link href={`/experiences/${experience.slug}`} className="block">
        {hasImage ? (
          <ExperienceArtwork experience={experience} className={featured ? "h-full min-h-56" : "h-40"} />
        ) : (
          <div className={featured ? "flex h-full min-h-40 items-end bg-night p-5 text-paper" : "bg-night p-5 text-paper"}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">{experience.recommendationKind}</div>
              <div className="serif mt-2 text-2xl font-semibold leading-none">{experience.category}</div>
            </div>
          </div>
        )}
      </Link>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-moss">
            {experience.recommendationKind}
          </span>
          <Link href={`/experiences/${experience.slug}`} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-paper-soft">
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <Link href={`/experiences/${experience.slug}`}>
          <h3 className="serif mt-4 text-2xl font-semibold leading-tight tracking-tight">{experience.title}</h3>
        </Link>
        <p className="mt-3 text-sm leading-6 text-muted">{experience.description}</p>
        <div className="mt-5 flex items-center gap-2 text-sm text-muted">
          <MapPin className="h-4 w-4" />
          {experience.location}, {experience.city}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-line py-4 text-sm">
          <div>
            <div className="text-muted">When</div>
            <div className="font-semibold">{experience.date}</div>
          </div>
          <div>
            <div className="text-muted">Cost</div>
            <div className="font-semibold">{experience.cost}</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-ink">
          <span className="font-semibold">Why this:</span> {experience.whyRecommended}
        </p>
        <div className="mt-5">
          <ExperienceActions experienceId={experience.id} />
        </div>
      </div>
    </article>
  );
}
