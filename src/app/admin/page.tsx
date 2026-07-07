"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { experiences } from "@/lib/experiences";

export default function AdminPage() {
  const [created, setCreated] = useState<typeof experiences>([]);
  const allExperiences = useMemo(() => [...created, ...experiences], [created]);

  function submit(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;

    setCreated((current) => [
      {
        id: `local-${Date.now()}`,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        title,
        description: String(formData.get("description") ?? ""),
        longDescription: String(formData.get("description") ?? ""),
        date: String(formData.get("date") ?? ""),
        time: String(formData.get("time") ?? ""),
        city: String(formData.get("city") ?? ""),
        location: String(formData.get("location") ?? ""),
        host: String(formData.get("host") ?? ""),
        cost: String(formData.get("cost") ?? "Free"),
        category: String(formData.get("category") ?? "Community"),
        tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
        vibe: "Thoughtful, local, human",
        beginnerFriendly: true,
        socialIntensity: "moderate",
        cadence: "One-Time",
        recommendationKind: "Surprise",
        whyRecommended: "Added manually by an organizer for local discovery.",
        community: String(formData.get("host") ?? "Local community"),
        proofMethod: "Host confirmation at check-in",
        anonymousGuests: [
          {
            code: "Attendee A",
            currentlyExploring: ["Community", "Curiosity"],
            recentPath: ["Coffee Shops", "Third Places", "Human Connection"],
            attendingBecause: "wants to discover a new local room",
          },
        ],
      },
      ...current,
    ]);
  }

  return (
    <>
      <Header />
      <main className="container-page py-14">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Admin</p>
          <h1 className="serif mt-4 text-6xl font-semibold leading-none tracking-tight">Create experiences manually.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            The MVP does not scrape. It starts with carefully entered experiences that deserve to be discovered.
          </p>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <form action={submit} className="soft-card grid gap-4 rounded-[28px] p-6">
            {[
              ["title", "Title"],
              ["description", "Description"],
              ["host", "Host"],
              ["location", "Location"],
              ["city", "City"],
              ["date", "Date"],
              ["time", "Time"],
              ["cost", "Cost"],
              ["category", "Category"],
              ["tags", "Tags, comma separated"],
            ].map(([name, label]) => (
              <label key={name} className="grid gap-2 text-sm font-semibold text-ink">
                {label}
                <input name={name} className="rounded-2xl border border-line bg-paper-soft px-4 py-3 font-normal outline-none focus:border-moss" />
              </label>
            ))}
            <button className="quiet-button bg-night text-paper" type="submit">Add local experience</button>
          </form>

          <div className="soft-card rounded-[28px] p-6">
            <h2 className="serif text-4xl font-semibold">Experience library</h2>
            <div className="mt-6 grid gap-3">
              {allExperiences.map((experience) => (
                <div key={experience.id} className="rounded-2xl border border-line bg-paper-soft p-4">
                  <div className="font-semibold">{experience.title}</div>
                  <div className="mt-1 text-sm text-muted">{experience.category} · {experience.city} · {experience.host}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
