"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";

type ReviewItem = {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  confidence: number;
  created_at: string;
  reviewer_status: string;
};

type IngestionResult = {
  source_name: string;
  fetched: number;
  extracted: number;
  inserted: number;
  updated: number;
  review: number;
  rejected: number;
  errors: string[];
};

export default function IngestionAdminPage() {
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [results, setResults] = useState<IngestionResult[]>([]);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [adminSecret, setAdminSecret] = useState("");

  function adminHeaders(): HeadersInit {
    return adminSecret ? { "x-serendipity-admin-secret": adminSecret } : {};
  }

  async function loadReview() {
    const response = await fetch("/api/admin/review", { headers: adminHeaders() });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error ?? "Could not load review queue.");
      return;
    }
    setReview(body.queue ?? []);
  }

  useEffect(() => {
    let active = true;

    async function loadInitialReview() {
      const savedSecret = window.localStorage.getItem("serendipity-admin-secret") ?? "";
      if (active) setAdminSecret(savedSecret);

      const response = await fetch("/api/admin/review", {
        headers: savedSecret ? { "x-serendipity-admin-secret": savedSecret } : {},
      });
      const body = await response.json();
      if (active) setReview(body.queue ?? []);
    }

    void loadInitialReview();

    return () => {
      active = false;
    };
  }, []);

  async function runIngestion() {
    setMessage("Running enabled sources...");
    const response = await fetch("/api/admin/ingest", {
      method: "POST",
      headers: { "content-type": "application/json", ...adminHeaders() },
      body: JSON.stringify({}),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error ?? "Ingestion failed.");
      return;
    }
    setResults(body.results ?? []);
    setMessage("Ingestion complete.");
    await loadReview();
  }

  async function submitLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Submitting link...");
    const response = await fetch("/api/submit-link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, note }),
    });
    const body = await response.json();
    setMessage(body.restricted_social ? "Restricted social URL stored for manual review only." : "Link stored for review.");
    setUrl("");
    setNote("");
    await loadReview();
  }

  async function reviewAction(id: string, action: "approve" | "reject") {
    const response = await fetch(`/api/admin/review/${id}/${action}`, { method: "POST", headers: adminHeaders() });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setMessage(body.error ?? "Review action failed.");
      return;
    }
    await loadReview();
  }

  function saveAdminSecret(value: string) {
    setAdminSecret(value);
    window.localStorage.setItem("serendipity-admin-secret", value);
  }

  return (
    <>
      <Header />
      <main className="container-page py-14">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Ingestion Admin</p>
          <h1 className="serif mt-4 text-6xl font-semibold leading-none tracking-tight">SF Experience Ingestion System</h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            Discover, normalize, score, and review San Francisco experiences while respecting source permissions.
          </p>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-6">
            <div className="soft-card rounded-[28px] p-6">
              <h2 className="serif text-3xl font-semibold">Run ingestion</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Runs currently enabled source configs. Starter configs are disabled until official API keys or permitted
                public sources are added.
              </p>
              <label className="mt-5 grid gap-2 text-sm font-semibold text-ink">
                Admin secret
                <input
                  value={adminSecret}
                  onChange={(event) => saveAdminSecret(event.target.value)}
                  type="password"
                  placeholder="Required in production if SERENDIPITY_ADMIN_SECRET is set"
                  className="rounded-2xl border border-line bg-paper-soft px-4 py-3 font-normal outline-none focus:border-moss"
                />
              </label>
              <button onClick={runIngestion} className="quiet-button mt-5 bg-night text-paper" type="button">
                Trigger enabled sources
              </button>
              {message ? <p className="mt-4 rounded-2xl bg-sage p-3 text-sm text-ink">{message}</p> : null}
            </div>

            <form onSubmit={submitLink} className="soft-card rounded-[28px] p-6">
              <h2 className="serif text-3xl font-semibold">Submit source URL</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Social URLs from restricted platforms are stored for manual review only. No unauthorized scraping.
              </p>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                type="url"
                required
                placeholder="https://..."
                className="mt-5 w-full rounded-2xl border border-line bg-paper-soft px-4 py-3 outline-none focus:border-moss"
              />
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional note"
                className="mt-3 min-h-24 w-full rounded-2xl border border-line bg-paper-soft px-4 py-3 outline-none focus:border-moss"
              />
              <button className="quiet-button mt-4 bg-night text-paper" type="submit">
                Submit for review
              </button>
            </form>
          </div>

          <div className="soft-card rounded-[28px] p-6">
            <h2 className="serif text-3xl font-semibold">Review queue</h2>
            <div className="mt-5 grid gap-3">
              {review.length ? (
                review.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-line bg-paper-soft p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">{item.entity_type}</div>
                        <p className="mt-2 text-sm leading-6 text-muted">{item.reason}</p>
                        <div className="mt-2 text-xs text-muted">Confidence {item.confidence}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => reviewAction(item.id, "approve")} className="quiet-button bg-moss text-paper" type="button">
                          Approve
                        </button>
                        <button onClick={() => reviewAction(item.id, "reject")} className="quiet-button bg-paper text-ink" type="button">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No pending review items, or Supabase is not configured.</p>
              )}
            </div>
          </div>
        </section>

        {results.length ? (
          <section className="mt-8 soft-card rounded-[28px] p-6">
            <h2 className="serif text-3xl font-semibold">Latest run</h2>
            <div className="mt-5 grid gap-3">
              {results.map((result) => (
                <div key={result.source_name} className="rounded-2xl border border-line bg-paper-soft p-4 text-sm">
                  <div className="font-semibold">{result.source_name}</div>
                  <div className="mt-2 text-muted">
                    fetched {result.fetched} · extracted {result.extracted} · inserted {result.inserted} · updated {result.updated} · review {result.review} · rejected {result.rejected}
                  </div>
                  {result.errors.length ? <div className="mt-2 text-clay">{result.errors.join("; ")}</div> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
