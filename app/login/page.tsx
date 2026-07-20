'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function LoginPage() {
  const { login } = useApp()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    const result = await login(email, password)
    if (!result.success) {
      setLoading(false)
      setError(result.error ?? 'We could not sign you in. Check your details and try again.')
      return
    }
    router.push('/home')
  }

  return (
    <div className="min-h-[calc(100vh-56px)] px-5 py-6 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between border-y border-[#b8aa91] py-3 text-[9px] font-bold uppercase tracking-[0.16em] text-muted md:mb-10">
          <span>Member edition</span>
          <span>Private entry</span>
        </div>

        <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] md:gap-16">
          <section>
            <p className="editorial-kicker mb-5 text-[10px] uppercase tracking-[0.2em]">Return to your week</p>
            <h1 className="max-w-xl font-serif text-[clamp(2.8rem,12vw,5.8rem)] leading-[0.94] text-charcoal">
              Welcome back to the unexpected.
            </h1>
            <div className="mt-8 hidden max-w-md border-l-2 border-terracotta pl-5 sm:block">
              <p className="font-serif text-xl leading-snug text-charcoal">
                Your next three invitations are waiting.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                Sign in to pick up your Passion Path where you left it.
              </p>
            </div>
          </section>

          <section className="entry-sheet" aria-labelledby="sign-in-heading">
            <div className="mb-7 border-b border-[#b8aa91] pb-5">
              <div className="mb-4 flex items-center gap-2 text-terracotta">
                <Leaf className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                <span className="text-[9px] font-bold uppercase tracking-[0.18em]">Serendipity member desk</span>
              </div>
              <h2 id="sign-in-heading" className="font-serif text-3xl leading-tight text-charcoal">Open your invitations.</h2>
              <p className="mt-2 text-sm text-muted">Enter the details you used to join.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-muted" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-muted" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="paper-button w-full">
                {loading ? 'Opening your week…' : 'Sign in'}
              </button>
              {error && (
                <p className="border-l-2 border-terracotta bg-[#f7e5dc] px-3 py-2 text-sm leading-relaxed text-[#8f392d]" role="alert">
                  {error}
                </p>
              )}
            </form>

            <p className="mt-7 border-t border-[#d2c7b4] pt-5 text-center text-xs text-muted">
              No account?{' '}
              <Link href="/signup" className="font-bold text-charcoal link-underline">
                Begin your story
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
