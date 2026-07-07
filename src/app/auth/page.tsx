"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Header } from "@/components/Header";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setMessage("Supabase is not configured locally yet. You can continue into the demo flow.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    setMessage(error ? error.message : "Check your email for a magic link.");
  }

  return (
    <>
      <Header />
      <main className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-16">
        <section className="soft-card w-full max-w-xl rounded-[32px] p-8">
          <Mail className="h-7 w-7 text-moss" />
          <h1 className="serif mt-6 text-5xl font-semibold">Enter quietly.</h1>
          <p className="mt-4 leading-7 text-muted">Simple email authentication. No performative profile setup required.</p>
          <form onSubmit={submit} className="mt-8 grid gap-3">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder="you@example.com"
              className="rounded-2xl border border-line bg-paper-soft px-4 py-3 outline-none focus:border-moss"
            />
            <button className="quiet-button bg-night text-paper" type="submit">Send magic link</button>
          </form>
          {message ? <p className="mt-4 rounded-2xl bg-sage p-4 text-sm text-ink">{message}</p> : null}
          <Link href="/onboarding" className="mt-6 inline-block text-sm font-semibold text-moss">Continue in local demo mode</Link>
        </section>
      </main>
    </>
  );
}
