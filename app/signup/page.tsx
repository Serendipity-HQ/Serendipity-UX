'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Check } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { INTEREST_TAGS } from '@/lib/constants'

type Step = 'account' | 'interests'

export default function SignupPage() {
  const { login } = useApp()
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) return
    setStep('interests')
  }

  function toggleInterest(tag: string) {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleInterestsSubmit() {
    if (selectedInterests.length < 4) return
    setLoading(true)
    setTimeout(() => {
      login(email, password, { name, interests: selectedInterests })
      router.push('/home')
    }, 700)
  }

  if (step === 'interests') {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-4">Step 2 of 2</p>
            <h1 className="font-serif text-3xl text-charcoal mb-2">What moves you?</h1>
            <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
              Pick at least 4. We&apos;ll shape your weekly invitations around what you love.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {INTEREST_TAGS.map((tag) => {
              const selected = selectedInterests.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs tracking-wide transition-all duration-200 active:scale-95 ${
                    selected
                      ? 'bg-charcoal text-cream border-charcoal'
                      : 'bg-white text-charcoal-light border-border hover:border-sand'
                  }`}
                >
                  {selected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                  {tag}
                </button>
              )
            })}
          </div>

          <p className="text-center text-xs text-muted mb-6">
            {selectedInterests.length} selected
            {selectedInterests.length < 4 && ` — ${4 - selectedInterests.length} more to go`}
          </p>

          <button
            onClick={handleInterestsSubmit}
            disabled={selectedInterests.length < 4 || loading}
            className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm tracking-wide hover:bg-charcoal/85 transition-all duration-200 disabled:opacity-30 active:scale-95"
          >
            {loading ? 'Creating your account…' : 'Enter Serendipity'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <Leaf className="w-5 h-5 text-terracotta mx-auto mb-5" strokeWidth={1.5} />
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Step 1 of 2</p>
          <h1 className="font-serif text-3xl text-charcoal mb-2">Your story starts here.</h1>
          <p className="text-sm text-muted">Join a network built around living, not posting.</p>
        </div>

        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            className="border border-white/16 bg-white/8 w-full rounded-xl px-4 py-3 text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:border-white/50 transition-colors duration-200"
              placeholder="Your name"
              required
            />
          </div>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-white/16 bg-white/8 w-full rounded-xl px-4 py-3 text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:border-white/50 transition-colors duration-200"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm tracking-wide hover:bg-charcoal/85 transition-all duration-200 mt-2 active:scale-95"
          >
            Continue →
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-8">
          Already a member?{' '}
          <Link href="/login" className="text-charcoal link-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
