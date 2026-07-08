"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { authedFetch } from "@/lib/clientApi";
import type { Experience } from "@/lib/types";

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [message, setMessage] = useState("Loading experiences...");

  async function load() {
    const response = await authedFetch("/api/admin/experiences");
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(body.error ?? "Admin access required.");
      return;
    }
    setExperiences(body.experiences ?? []);
    setMessage("");
  }

  async function update(id: string, patch: Record<string, unknown>) {
    const response = await authedFetch("/api/admin/experiences", {
      method: "PATCH",
      body: JSON.stringify({ id, ...patch }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setMessage(body.error ?? "Could not update.");
      return;
    }
    await load();
  }

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      const response = await authedFetch("/api/admin/experiences");
      const body = await response.json().catch(() => ({}));
      if (!active) return;
      if (!response.ok) {
        setMessage(body.error ?? "Admin access required.");
        return;
      }
      setExperiences(body.experiences ?? []);
      setMessage("");
    }
    void loadInitial();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Header />
      <main className="container-page py-14">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Admin</p>
          <h1 className="serif mt-4 text-6xl font-semibold leading-none">Experience library.</h1>
        </section>
        <section className="mt-10 grid gap-4">
          {experiences.map((experience) => (
            <div key={experience.id} className="soft-card rounded-[24px] p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="serif text-3xl font-semibold">{experience.title}</div>
                  <div className="mt-2 text-sm text-muted">{experience.status} · {experience.category} · score {experience.serendipityScore ?? 0}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => update(experience.id, { featured: !experience.featured })} className="quiet-button bg-paper-soft text-ink" type="button">
                    {experience.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button onClick={() => update(experience.id, { recommendation_bucket: "passion" })} className="quiet-button bg-paper-soft text-ink" type="button">Passion</button>
                  <button onClick={() => update(experience.id, { recommendation_bucket: "growth" })} className="quiet-button bg-paper-soft text-ink" type="button">Growth</button>
                  <button onClick={() => update(experience.id, { recommendation_bucket: "surprise" })} className="quiet-button bg-paper-soft text-ink" type="button">Surprise</button>
                </div>
              </div>
            </div>
          ))}
          {message ? <p className="text-muted">{message}</p> : null}
        </section>
      </main>
    </>
  );
}
