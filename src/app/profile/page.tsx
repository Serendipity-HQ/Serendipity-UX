"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { authedFetch } from "@/lib/clientApi";
import { experiences } from "@/lib/experiences";
import { readGoing, readOnboarding, readSaved } from "@/lib/storage";
import type { OnboardingState } from "@/lib/types";

type UserExperienceRow = {
  id: string;
  status: "saved" | "going" | "attended" | "skipped";
  experiences?: {
    id: string;
    title: string;
    category: string;
    venue_name?: string | null;
    host_name?: string | null;
  };
};

type ReflectionRow = {
  id: string;
  surprised_by: string | null;
  people_met: string | null;
  sparked_interest_tags: string[];
  experiences?: { title?: string; category?: string; tags?: string[] };
};

export default function ProfilePage() {
  const [onboarding] = useState<OnboardingState | null>(() => readOnboarding());
  const [saved] = useState<string[]>(() => readSaved());
  const [going] = useState<string[]>(() => readGoing());
  const [items, setItems] = useState<UserExperienceRow[]>([]);
  const [reflections, setReflections] = useState<ReflectionRow[]>([]);

  useEffect(() => {
    async function load() {
      const [experienceResponse, reflectionResponse] = await Promise.all([
        authedFetch("/api/user-experiences"),
        authedFetch("/api/reflections"),
      ]);
      if (experienceResponse.ok) setItems((await experienceResponse.json()).items ?? []);
      if (reflectionResponse.ok) setReflections((await reflectionResponse.json()).reflections ?? []);
    }
    void load();
  }, []);

  const localSaved = experiences.filter((experience) => saved.includes(experience.id));
  const localGoing = experiences.filter((experience) => going.includes(experience.id));
  const interests = onboarding?.interests ?? ["Design", "Coffee", "Architecture"];
  const goals = onboarding?.goals ?? ["Community", "Try new things"];
  const communities = useMemo(
    () =>
      [
        ...new Set(
          items
            .map((item) => item.experiences?.host_name ?? item.experiences?.venue_name)
            .filter((item): item is string => Boolean(item)),
        ),
      ],
    [items],
  );
  const pathTags = [
    ...interests,
    ...reflections.flatMap((reflection) => reflection.sparked_interest_tags ?? []),
    ...items.map((item) => item.experiences?.category).filter(Boolean),
  ].slice(0, 8) as string[];

  return (
    <>
      <Header />
      <main className="container-page py-14">
        <section className="soft-card rounded-[36px] p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Profile</p>
          <h1 className="serif mt-4 max-w-4xl text-6xl font-semibold leading-none tracking-tight">
            A story of what you are becoming.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
            No followers, no likes, no posts. This profile is a map of curiosities, communities, experiences, and reflections.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/profile/submissions" className="quiet-button bg-night text-paper">My submissions</Link>
            <Link href="/onboarding" className="quiet-button bg-paper-soft text-ink">Retune profile</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Panel title="Currently exploring" items={interests} />
          <Panel title="Communities joined" items={communities.length ? communities : ["Architecture walks", "Object Study"]} />
          <Panel title="Things I want more of" items={goals} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="soft-card rounded-[28px] p-7">
            <h2 className="serif text-4xl font-semibold">Curiosity path</h2>
            <div className="mt-8 grid gap-5">
              {pathTags.length ? pathTags.map((step, index) => (
                <div key={`${step}-${index}`} className="flex items-center gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-night text-sm font-semibold text-paper">{index + 1}</div>
                  <div className="text-lg font-semibold">{step}</div>
                  {index < pathTags.length - 1 ? <div className="path-line h-px flex-1" /> : null}
                </div>
              )) : <p className="text-muted">Attend and reflect to start building a path.</p>}
            </div>
          </div>
          <div className="soft-card rounded-[28px] p-7">
            <h2 className="serif text-4xl font-semibold">Recent reflections</h2>
            <div className="mt-6 grid gap-4">
              {reflections.length ? reflections.slice(0, 4).map((reflection) => (
                <blockquote key={reflection.id} className="rounded-2xl border border-line bg-paper-soft p-4 text-sm leading-6 text-muted">
                  “{reflection.surprised_by || reflection.people_met || "A new curiosity was added."}”
                </blockquote>
              )) : (
                <p className="text-muted">Reflection turns an event into part of your story.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 soft-card rounded-[28px] p-7">
          <h2 className="serif text-4xl font-semibold">Experiences</h2>
          <div className="mt-5 grid gap-3">
            {items.length ? items.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-line bg-paper-soft p-4">
                <div>
                  <div className="font-semibold">{item.experiences?.title ?? "Experience"}</div>
                  <div className="text-sm text-muted">{item.experiences?.category ?? "Community"}</div>
                </div>
                <div className="text-sm font-semibold capitalize text-moss">{item.status}</div>
              </div>
            )) : [...localGoing, ...localSaved].slice(0, 5).map((experience, index) => (
              <div key={`${experience.id}-${index}`} className="flex items-center justify-between rounded-2xl border border-line bg-paper-soft p-4">
                <div>
                  <div className="font-semibold">{experience.title}</div>
                  <div className="text-sm text-muted">{experience.community}</div>
                </div>
                <div className="text-sm font-semibold text-moss">{going.includes(experience.id) ? "Going" : "Maybe later"}</div>
              </div>
            ))}
            {!items.length && !localGoing.length && !localSaved.length ? (
              <p className="text-muted">Keep an invitation for later or mark one as going to begin shaping your path.</p>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="soft-card rounded-[28px] p-6">
      <h2 className="serif text-3xl font-semibold">{title}</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-line bg-paper-soft px-3 py-1 text-sm text-muted">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
