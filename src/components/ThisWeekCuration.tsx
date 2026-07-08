"use client";

import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ExperienceCard } from "@/components/ExperienceCard";
import { buildWeeklyRecommendationSet, type WeeklyRecommendationSet } from "@/lib/recommendations";
import { readOnboarding } from "@/lib/storage";
import type { Experience, OnboardingState } from "@/lib/types";

export function ThisWeekCuration({ experiences, initialSet }: { experiences: Experience[]; initialSet: WeeklyRecommendationSet }) {
  const [profile, setProfile] = useState<OnboardingState | null>(null);
  const [recommendationSet, setRecommendationSet] = useState(initialSet);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedProfile = readOnboarding();
      setProfile(storedProfile);
      if (storedProfile) {
        setRecommendationSet(buildWeeklyRecommendationSet(experiences, storedProfile));
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [experiences]);

  const weekly = recommendationSet.primary;
  const alternates = recommendationSet.alternates;
  const tunedLabel = useMemo(() => {
    if (!profile) return "Using starter signals";
    const parts = [profile.city, ...profile.interests.slice(0, 2)].filter(Boolean);
    return `Tuned for ${parts.join(" + ")}`;
  }, [profile]);

  return (
    <>
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">This week in San Francisco</p>
          <h1 className="serif mt-4 max-w-4xl text-6xl font-semibold leading-none tracking-tight">
            Three invitations. One week.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Serendipity keeps the surface small on purpose. One invitation deepens what you love. One opens the next
            door. One is here to surprise you.
          </p>
          <p className="mt-4 rounded-full bg-sage px-4 py-2 text-sm font-semibold text-moss w-fit">{tunedLabel}</p>
        </div>
        <Link href="/onboarding" className="quiet-button bg-paper-soft text-ink">
          Tune curation <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="mt-12 grid gap-6">
        {weekly.map((experience) => (
          <ExperienceCard key={experience.id} experience={experience} />
        ))}
      </section>

      <section className="mt-20 rounded-[36px] border border-line bg-paper-soft p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">Alternates</p>
            <h2 className="serif mt-3 text-5xl font-semibold">If the week needs a different doorway.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
              These are not an endless feed. They are three quiet alternates if one invitation is too far, too familiar,
              or not the right energy.
            </p>
          </div>
          <Link href="/onboarding" className="quiet-button bg-night text-paper">
            Tune signals <RefreshCw className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {alternates.map((experience) => <ExperienceCard key={experience.id} experience={experience} />)}
        </div>
        <div className="mt-8 flex justify-end">
          <Link href="/explore" className="quiet-button bg-paper text-ink">
            Find your next chapter <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
