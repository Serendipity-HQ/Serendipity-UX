import Link from "next/link";
import { Header } from "@/components/Header";

export default function SubmitThanksPage() {
  return (
    <>
      <Header />
      <main className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-16">
        <section className="soft-card max-w-2xl rounded-[36px] p-9 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Under review</p>
          <h1 className="serif mt-4 text-6xl font-semibold leading-none">Thanks — your experience is under review.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            If approved, it will become discoverable in Serendipity. You can track your submissions from your profile.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/profile/submissions" className="quiet-button bg-night text-paper">View submissions</Link>
            <Link href="/explore" className="quiet-button bg-paper-soft text-ink">Explore experiences</Link>
          </div>
        </section>
      </main>
    </>
  );
}
