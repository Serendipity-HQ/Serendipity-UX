"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { experiences } from "@/lib/experiences";
import { readGoing, readOnboarding, readSaved } from "@/lib/storage";
import type { OnboardingState } from "@/lib/types";

export default function ProfilePage() {
  const [onboarding] = useState<OnboardingState | null>(() => readOnboarding());
  const [saved] = useState<string[]>(() => readSaved());
  const [going] = useState<string[]>(() => readGoing());

  const savedExperiences = experiences.filter((experience) => saved.includes(experience.id));
  const goingExperiences = experiences.filter((experience) => going.includes(experience.id));
  const communities = [...new Set(goingExperiences.map((experience) => experience.community))];
  const interests = onboarding?.interests ?? ["Design", "Coffee", "Architecture"];

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
            No followers, no likes, no posts. This profile is a map of curiosities, communities, and reflections.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Panel title="Currently exploring" items={interests} />
          <Panel title="Communities joined" items={communities.length ? communities : ["Object Study", "Architecture Walks"]} />
          <Panel title="Things I want to try" items={onboarding?.goals ?? ["Craftsmanship", "Culture", "Community"]} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="soft-card rounded-[28px] p-7">
            <h2 className="serif text-4xl font-semibold">My curiosity path</h2>
            <div className="mt-8 grid gap-5">
              {["Cars", "Sketching", "Industrial Design", "Makerspace Open Build", "Architecture"].map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-night text-sm font-semibold text-paper">{index + 1}</div>
                  <div className="text-lg font-semibold">{step}</div>
                  {index < 4 ? <div className="path-line h-px flex-1" /> : null}
                </div>
              ))}
            </div>
          </div>
          <div className="soft-card rounded-[28px] p-7">
            <h2 className="serif text-4xl font-semibold">Recent reflections</h2>
            <div className="mt-6 grid gap-4">
              {[
                "I did not expect sketching cars to make me notice chairs differently.",
                "The best part of the makerspace was not the printer. It was the person explaining their broken prototype.",
                "I would come back if the group stayed small.",
              ].map((reflection) => (
                <blockquote key={reflection} className="rounded-2xl border border-line bg-paper-soft p-4 text-sm leading-6 text-muted">
                  “{reflection}”
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 soft-card rounded-[28px] p-7">
          <h2 className="serif text-4xl font-semibold">Experiences attended or saved</h2>
          <div className="mt-5 grid gap-3">
            {[...goingExperiences, ...savedExperiences].slice(0, 5).map((experience) => (
              <div key={experience.id} className="flex items-center justify-between rounded-2xl border border-line bg-paper-soft p-4">
                <div>
                  <div className="font-semibold">{experience.title}</div>
                  <div className="text-sm text-muted">{experience.community}</div>
                </div>
                <div className="text-sm font-semibold text-moss">{going.includes(experience.id) ? "Going" : "Saved"}</div>
              </div>
            ))}
            {!goingExperiences.length && !savedExperiences.length ? (
              <p className="text-muted">Save or mark an experience as going to begin shaping your path.</p>
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
