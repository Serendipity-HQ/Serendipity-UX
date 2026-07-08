"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { authedFetch } from "@/lib/clientApi";
import type { Experience } from "@/lib/types";

export default function ProfileSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Experience[]>([]);
  const [message, setMessage] = useState("Loading submissions...");

  useEffect(() => {
    async function load() {
      const response = await authedFetch("/api/submissions");
      if (response.status === 401) {
        setMessage("Sign in to view your submitted experiences.");
        return;
      }
      const body = await response.json();
      setSubmissions(body.submissions ?? []);
      setMessage("");
    }
    void load();
  }, []);

  return (
    <>
      <Header />
      <main className="container-page py-14">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Submissions</p>
            <h1 className="serif mt-4 text-6xl font-semibold leading-none">Experiences you submitted.</h1>
          </div>
          <Link href="/submit" className="quiet-button bg-night text-paper">Submit another</Link>
        </section>

        <section className="mt-10 grid gap-4">
          {submissions.map((experience) => (
            <div key={experience.id} className="soft-card rounded-[24px] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="serif text-3xl font-semibold">{experience.title}</div>
                  <div className="mt-2 text-sm text-muted">{experience.category} · {experience.location}</div>
                </div>
                <span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                  {experience.status ?? "review"}
                </span>
              </div>
            </div>
          ))}
          {message ? <p className="text-muted">{message}</p> : null}
          {!message && !submissions.length ? <p className="text-muted">No submissions yet.</p> : null}
        </section>
      </main>
    </>
  );
}
