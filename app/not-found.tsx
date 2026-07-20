import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-2xl items-center px-5 py-16">
      <div className="liquid-card w-full rounded-[28px] px-6 py-14 text-center sm:px-10">
        <Compass className="mx-auto mb-5 h-7 w-7 text-terracotta" strokeWidth={1.4} aria-hidden="true" />
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted">Invitation not found</p>
        <h1 className="font-serif text-3xl text-charcoal">This path has gone quiet.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal-light">
          This invitation may have ended, sold out, or moved. Discover has the experiences that are
          currently available.
        </p>
        <Link
          href="/discover"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal/85"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
          Back to Discover
        </Link>
      </div>
    </main>
  )
}
