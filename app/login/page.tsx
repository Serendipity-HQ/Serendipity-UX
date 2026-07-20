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
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <Leaf className="w-5 h-5 text-terracotta mx-auto mb-5" strokeWidth={1.5} />
          <h1 className="font-serif text-3xl text-charcoal mb-2">Welcome back.</h1>
          <p className="text-sm text-muted">Your week&apos;s invitations are waiting.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-white/16 bg-white/8 w-full rounded-xl px-4 py-3 text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:border-white/50 transition-colors duration-200"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-white/16 bg-white/8 w-full rounded-xl px-4 py-3 text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:border-white/50 transition-colors duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm tracking-wide hover:bg-charcoal/85 transition-all duration-200 disabled:opacity-50 active:scale-95 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          {error && (
            <p className="text-sm leading-relaxed text-terracotta" role="alert">
              {error}
            </p>
          )}
        </form>

        <p className="text-center text-xs text-muted mt-8">
          No account?{' '}
          <Link href="/signup" className="text-charcoal link-underline">
            Join Serendipity
          </Link>
        </p>
      </div>
    </div>
  )
}
