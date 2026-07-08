"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { authedFetch } from "@/lib/clientApi";
import type { Experience } from "@/lib/types";

export default function AdminReviewPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [message, setMessage] = useState("Loading review queue...");

  async function load() {
    const response = await authedFetch("/api/admin/experiences?status=review");
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(body.error ?? "Admin access required.");
      return;
    }
    setExperiences(body.experiences ?? []);
    setMessage("");
  }

  async function update(id: string, status: "approved" | "rejected") {
    const response = await authedFetch("/api/admin/experiences", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
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
      const response = await authedFetch("/api/admin/experiences?status=review");
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
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Admin review</p>
            <h1 className="serif mt-4 text-6xl font-semibold leading-none">Pending experiences.</h1>
          </div>
          <Link href="/admin/ingestion" className="quiet-button bg-paper-soft text-ink">Ingestion admin</Link>
        </section>

        <section className="mt-10 grid gap-4">
          {experiences.map((experience) => (
            <article key={experience.id} className="soft-card rounded-[28px] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="serif text-3xl font-semibold">{experience.title}</div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{experience.description}</p>
                  <div className="mt-3 text-sm text-muted">{experience.category} · {experience.location} · {experience.cost}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => update(experience.id, "approved")} className="quiet-button bg-moss text-paper" type="button">Approve</button>
                  <button onClick={() => update(experience.id, "rejected")} className="quiet-button bg-paper-soft text-ink" type="button">Reject</button>
                </div>
              </div>
            </article>
          ))}
          {message ? <p className="text-muted">{message}</p> : null}
          {!message && !experiences.length ? <p className="text-muted">No pending experiences.</p> : null}
        </section>
      </main>
    </>
  );
}
