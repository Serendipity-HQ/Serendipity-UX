"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { authedFetch } from "@/lib/clientApi";

export default function SubmitExperiencePage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("Submitting for review...");
    const payload = Object.fromEntries(formData.entries());
    payload.beginner_friendly = formData.get("beginner_friendly") ? "true" : "";
    payload.recurring = formData.get("recurring") ? "true" : "";

    const response = await authedFetch("/api/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));

    if (response.status === 401) {
      setMessage("Sign in to submit experiences for review.");
      return;
    }

    if (!response.ok) {
      setMessage(body.error ?? "Could not submit experience.");
      return;
    }

    router.push("/submit/thanks");
  }

  return (
    <>
      <Header />
      <main className="container-page py-14">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Submit</p>
          <h1 className="serif mt-4 text-6xl font-semibold leading-none tracking-tight">
            Add a real-world experience worth discovering.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            Submissions go through review before becoming public. We are looking for real places, communities, workshops,
            talks, rituals, and gatherings, not spam or purely online events.
          </p>
        </section>

        <form action={submit} className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Section title="Core details">
            <Field name="title" label="Title" required />
            <TextArea name="description" label="Description" required />
            <Field name="source_url" label="Source URL" type="url" />
            <Field name="image_url" label="Image URL" type="url" />
            <TextArea name="why_serendipity" label="Why this belongs on Serendipity" />
          </Section>

          <Section title="Time and place">
            <Field name="date" label="Date" type="date" required />
            <Field name="start_time" label="Start time" type="time" required />
            <Field name="end_time" label="End time" type="time" />
            <Field name="timezone" label="Timezone" defaultValue="America/Los_Angeles" />
            <Field name="city" label="City" defaultValue="San Francisco" required />
            <Field name="neighborhood" label="Neighborhood" />
            <Field name="address" label="Address" />
            <Field name="venue_name" label="Venue name" />
            <Field name="host_name" label="Host name" />
          </Section>

          <Section title="Texture">
            <Field name="category" label="Category" placeholder="Pottery, jazz, AI, volunteering..." />
            <Field name="tags" label="Tags, comma separated" />
            <Field name="vibe" label="Vibe, comma separated" placeholder="warm, social, beginner-friendly" />
            <Field name="cost_min" label="Cost min" type="number" />
            <Field name="cost_max" label="Cost max" type="number" />
            <Field name="social_intensity" label="Social intensity, 1-5" type="number" min="1" max="5" defaultValue="3" />
            <label className="flex items-center gap-3 text-sm font-semibold text-ink">
              <input name="beginner_friendly" type="checkbox" defaultChecked /> Beginner friendly
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-ink">
              <input name="recurring" type="checkbox" /> Recurring
            </label>
            <Field name="recurrence_rule" label="Recurrence note" />
          </Section>

          <section className="soft-card rounded-[28px] p-6">
            <h2 className="serif text-3xl font-semibold">Review</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              We review for specificity, local presence, social potential, beginner accessibility, and whether the
              experience can help someone build a real curiosity path.
            </p>
            <button className="quiet-button mt-6 bg-night text-paper" type="submit">Submit for review</button>
            {message ? <p className="mt-4 rounded-2xl bg-sage p-4 text-sm text-ink">{message}</p> : null}
          </section>
        </form>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="soft-card grid gap-4 rounded-[28px] p-6">
      <h2 className="serif text-3xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <input {...props} className="rounded-2xl border border-line bg-paper-soft px-4 py-3 font-normal outline-none focus:border-moss" />
    </label>
  );
}

function TextArea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <textarea {...props} className="min-h-28 rounded-2xl border border-line bg-paper-soft px-4 py-3 font-normal outline-none focus:border-moss" />
    </label>
  );
}
