'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Check, Compass, Sparkles } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { INTEREST_TAGS, LANE_LABELS } from '@/lib/constants'
import type { Lane, UserRole } from '@/lib/types'

type Step = 'role' | 'account' | 'interests' | 'questionnaire'

const LANES: Lane[] = ['passion', 'growth', 'surprise']

const GROUP_SIZES = ['Intimate · 4–6', 'Small · 6–10', 'Open · 10–16']

const HOSTING_BACKGROUNDS = [
  'This would be my first time',
  'I host informally for friends',
  'I host regularly and want to grow',
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const inputClass =
  'border border-white/16 bg-white/8 w-full rounded-xl px-4 py-3 text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:border-white/50 transition-colors duration-200'

export default function SignupPage() {
  const { login } = useApp()
  const router = useRouter()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<UserRole>('attendee')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Host questionnaire
  const [venueName, setVenueName] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [craft, setCraft] = useState('')
  const [motivation, setMotivation] = useState('')
  const [hostLanes, setHostLanes] = useState<Lane[]>([])
  const [groupSize, setGroupSize] = useState(GROUP_SIZES[1])
  const [hostingBackground, setHostingBackground] = useState(HOSTING_BACKGROUNDS[0])

  function chooseRole(next: UserRole) {
    setRole(next)
    setStep('account')
  }

  function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) return
    setStep(role === 'host' ? 'questionnaire' : 'interests')
  }

  function toggleInterest(tag: string) {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function toggleHostLane(lane: Lane) {
    setHostLanes((prev) =>
      prev.includes(lane) ? prev.filter((l) => l !== lane) : [...prev, lane]
    )
  }

  function handleInterestsSubmit() {
    if (selectedInterests.length < 4) return
    setLoading(true)
    setTimeout(() => {
      login(email, password, { name, interests: selectedInterests, role: 'attendee' })
      router.push('/home')
    }, 700)
  }

  const questionnaireComplete =
    venueName.trim() && craft.trim() && motivation.trim() && hostLanes.length > 0

  function handleQuestionnaireSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!questionnaireComplete) return
    setLoading(true)
    setTimeout(() => {
      login(email, password, {
        name,
        role: 'host',
        hostProfile: {
          hostId: `hu-${slugify(name) || Date.now()}`,
          venueName: venueName.trim(),
          neighborhood: neighborhood.trim(),
          craft: craft.trim(),
          motivation: motivation.trim(),
          lanes: hostLanes,
          groupSize,
          hostingBackground,
        },
      })
      router.push('/host')
    }, 700)
  }

  if (step === 'role') {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <Leaf className="w-5 h-5 text-terracotta mx-auto mb-5" strokeWidth={1.5} />
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Step 1 of 3</p>
            <h1 className="font-serif text-3xl text-charcoal mb-2">How will you show up?</h1>
            <p className="text-sm text-muted">You can always do both — start with one.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => chooseRole('attendee')}
              className="w-full text-left border border-white/16 bg-white/8 rounded-[22px] p-6 hover:border-white/50 transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Compass className="w-4 h-4 text-terracotta" strokeWidth={1.5} />
                <span className="text-xs tracking-widest uppercase text-charcoal">Sign up as a user</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Get three curated invitations a week and discover experiences worth leaving the house for.
              </p>
            </button>

            <button
              onClick={() => chooseRole('host')}
              className="w-full text-left border border-white/16 bg-white/8 rounded-[22px] p-6 hover:border-white/50 transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-4 h-4 text-terracotta" strokeWidth={1.5} />
                <span className="text-xs tracking-widest uppercase text-charcoal">Sign up as a host</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Tell us about what you host, then post your own experiences to Discover — we&apos;ll
                recommend them to the right people.
              </p>
            </button>
          </div>

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

  if (step === 'interests') {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-4">Step 3 of 3</p>
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

  if (step === 'questionnaire') {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-4">Step 3 of 3</p>
            <h1 className="font-serif text-3xl text-charcoal mb-2">Tell us how you host.</h1>
            <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
              This shapes your host profile and helps us recommend your experiences to the right people.
            </p>
          </div>

          <form onSubmit={handleQuestionnaireSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="venue">
                Where do you host?
              </label>
              <input
                id="venue"
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className={inputClass}
                placeholder="Your studio, kitchen, rooftop…"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="neighborhood">
                Neighborhood
              </label>
              <input
                id="neighborhood"
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className={inputClass}
                placeholder="Mission, Sunset, North Beach…"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="craft">
                What will you host?
              </label>
              <textarea
                id="craft"
                value={craft}
                onChange={(e) => setCraft(e.target.value)}
                className={`${inputClass} min-h-[84px] resize-none`}
                placeholder="Wheel-throwing sessions, supper clubs, rooftop stargazing…"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="motivation">
                Why do you host?
              </label>
              <textarea
                id="motivation"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className={`${inputClass} min-h-[84px] resize-none`}
                placeholder="What do you want people to walk away with?"
                required
              />
            </div>

            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted mb-2">
                Which lanes fit your experiences?
              </p>
              <div className="flex flex-wrap gap-2">
                {LANES.map((lane) => {
                  const selected = hostLanes.includes(lane)
                  return (
                    <button
                      key={lane}
                      type="button"
                      onClick={() => toggleHostLane(lane)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs tracking-wide transition-all duration-200 active:scale-95 ${
                        selected
                          ? 'bg-charcoal text-cream border-charcoal'
                          : 'bg-white text-charcoal-light border-border hover:border-sand'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                      {LANE_LABELS[lane]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted mb-2">Typical group size</p>
              <div className="flex flex-wrap gap-2">
                {GROUP_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setGroupSize(size)}
                    className={`px-4 py-2 rounded-full border text-xs tracking-wide transition-all duration-200 active:scale-95 ${
                      groupSize === size
                        ? 'bg-charcoal text-cream border-charcoal'
                        : 'bg-white text-charcoal-light border-border hover:border-sand'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted mb-2">Hosting background</p>
              <div className="space-y-2">
                {HOSTING_BACKGROUNDS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setHostingBackground(option)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-xs tracking-wide transition-all duration-200 active:scale-[0.99] ${
                      hostingBackground === option
                        ? 'bg-charcoal text-cream border-charcoal'
                        : 'bg-white text-charcoal-light border-border hover:border-sand'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!questionnaireComplete || loading}
              className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm tracking-wide hover:bg-charcoal/85 transition-all duration-200 disabled:opacity-30 active:scale-95"
            >
              {loading ? 'Creating your host account…' : 'Open your host studio'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <Leaf className="w-5 h-5 text-terracotta mx-auto mb-5" strokeWidth={1.5} />
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Step 2 of 3</p>
          <h1 className="font-serif text-3xl text-charcoal mb-2">
            {role === 'host' ? 'Your hosting story starts here.' : 'Your story starts here.'}
          </h1>
          <p className="text-sm text-muted">
            {role === 'host'
              ? 'Bring people together around what you love.'
              : 'Join a network built around living, not posting.'}
          </p>
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
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
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

        <button
          onClick={() => setStep('role')}
          className="block mx-auto text-xs text-muted mt-6 link-underline"
        >
          ← Back
        </button>

        <p className="text-center text-xs text-muted mt-4">
          Already a member?{' '}
          <Link href="/login" className="text-charcoal link-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
