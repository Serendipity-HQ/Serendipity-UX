'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Compass,
  Leaf,
  PartyPopper,
  Sparkles,
  Users,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import {
  DEFAULT_ATTENDEE_PROFILE,
  type AppUser,
  type OnboardingProfile,
  type BudgetPreference,
  type PlanningStyle,
  type SocialStyle,
  type TravelRadius,
} from '@/lib/onboarding-profile'
import { INTEREST_TAGS, LANE_LABELS } from '@serendipity-hq/design'
import type { Lane, UserRole } from '@serendipity-hq/design'

type Step =
  | 'role'
  | 'account'
  | 'welcome'
  | 'place'
  | 'interests'
  | 'intent'
  | 'comfort'
  | 'availability'
  | 'reveal'
  | 'host-questionnaire'

const ATTENDEE_STEPS: Step[] = [
  'welcome',
  'place',
  'interests',
  'intent',
  'comfort',
  'availability',
  'reveal',
]

const INTENTS = [
  ['Deepen a passion', 'Spend more time with something that already lights you up.'],
  ['Grow a new skill', 'Learn by doing, reflecting, and making real progress.'],
  ['Be surprised', 'Let a good unknown find you.'],
  ['Meet people', 'Share an experience without the pressure of networking.'],
  ['Get outside', 'Trade four walls for fresh air and attention.'],
  ['Slow down', 'Choose something restorative and unhurried.'],
] as const

const AVAILABILITY = [
  'Weekday mornings',
  'Weekday evenings',
  'Saturday',
  'Sunday',
]

const TRAVEL_RADII: TravelRadius[] = ['Right around me', 'Nearby', 'Worth the trip']
const SOCIAL_STYLES: SocialStyle[] = ['Mostly solo', 'Small groups', 'A mix', 'The more the merrier']
const BUDGETS: BudgetPreference[] = ['Mostly free', 'Under $50', 'A little of both', 'Worth a splurge']
const PLANNING_STYLES: PlanningStyle[] = ['Same-day sparks', 'A little of both', 'Planned ahead']
const ACCESSIBILITY_NEEDS = ['Step-free access', 'Seating available', 'Low-sensory setting', 'ASL / captioning', 'None right now']

const LANES: Lane[] = ['passion', 'growth', 'surprise']
const GROUP_SIZES = ['Intimate · 4–6', 'Small · 6–10', 'Open · 10–16']
const HOSTING_BACKGROUNDS = [
  'This would be my first time',
  'I host informally for friends',
  'I host regularly and want to grow',
]

const inputClass =
  'w-full rounded-xl border border-white/16 bg-white/8 px-4 py-3 text-sm text-charcoal placeholder:text-muted/60 focus:border-white/50 focus:outline-none'

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function SignupPage() {
  const { login } = useApp()
  const router = useRouter()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<UserRole>('attendee')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState<OnboardingProfile>(DEFAULT_ATTENDEE_PROFILE)
  const [submitting, setSubmitting] = useState(false)
  const [authMessage, setAuthMessage] = useState('')

  const [venueName, setVenueName] = useState('')
  const [hostNeighborhood, setHostNeighborhood] = useState('')
  const [craft, setCraft] = useState('')
  const [motivation, setMotivation] = useState('')
  const [hostLanes, setHostLanes] = useState<Lane[]>([])
  const [groupSize, setGroupSize] = useState(GROUP_SIZES[1])
  const [hostingBackground, setHostingBackground] = useState(HOSTING_BACKGROUNDS[0])

  const currentStep = Math.max(ATTENDEE_STEPS.indexOf(step) + 1, 0)
  const progress = step === 'role' || step === 'account' ? 0 : (currentStep / ATTENDEE_STEPS.length) * 100

  function patchProfile(patch: Partial<OnboardingProfile>) {
    setProfile((current) => ({ ...current, ...patch }))
  }

  function chooseRole(nextRole: UserRole) {
    setRole(nextRole)
    setStep('account')
  }

  function submitAccount(event: React.FormEvent) {
    event.preventDefault()
    setStep(role === 'host' ? 'host-questionnaire' : 'welcome')
  }

  function next() {
    const index = ATTENDEE_STEPS.indexOf(step)
    if (index >= 0 && index < ATTENDEE_STEPS.length - 1) setStep(ATTENDEE_STEPS[index + 1])
  }

  function back() {
    if (step === 'account' || step === 'host-questionnaire') {
      setStep(step === 'account' ? 'role' : 'account')
      return
    }
    const index = ATTENDEE_STEPS.indexOf(step)
    setStep(index <= 0 ? 'account' : ATTENDEE_STEPS[index - 1])
  }

  function toggleProfileList(field: 'interests' | 'intents' | 'availability' | 'accessibilityNeeds', value: string, max?: number) {
    setProfile((current) => {
      const values = current[field]
      const nextValues = field === 'accessibilityNeeds' && value === 'None right now'
        ? (values.includes(value) ? [] : [value])
        : field === 'accessibilityNeeds' && values.includes('None right now')
          ? [value]
          : values.includes(value)
        ? values.filter((item) => item !== value)
        : max && values.length >= max
          ? values
          : [...values, value]
      return { ...current, [field]: nextValues }
    })
  }

  function finishAttendee() {
    setSubmitting(true)
    setAuthMessage('')
    window.setTimeout(async () => {
      const questionnaireData = {
        name,
        role: 'attendee' as const,
        interests: profile.interests,
        onboardingProfile: { ...profile, completedAt: new Date().toISOString() },
      }
      const result = await login(email, password, questionnaireData as Partial<AppUser>)
      if (!result.success) {
        setSubmitting(false)
        setAuthMessage(result.error ?? 'We could not create your account. Please try again.')
        return
      }
      if (result.requiresEmailConfirmation) {
        setSubmitting(false)
        setAuthMessage('Check your email to confirm your account, then sign in to open your first week.')
        return
      }
      router.push('/home')
    }, 480)
  }

  function toggleHostLane(lane: Lane) {
    setHostLanes((current) => current.includes(lane) ? current.filter((item) => item !== lane) : [...current, lane])
  }

  function submitHost(event: React.FormEvent) {
    event.preventDefault()
    if (!venueName.trim() || !craft.trim() || !motivation.trim() || !hostLanes.length) return
    setSubmitting(true)
    setAuthMessage('')
    window.setTimeout(async () => {
      const result = await login(email, password, {
        name,
        role: 'host',
        hostProfile: {
          hostId: `hu-${slugify(name) || Date.now()}`,
          venueName: venueName.trim(),
          neighborhood: hostNeighborhood.trim(),
          craft: craft.trim(),
          motivation: motivation.trim(),
          lanes: hostLanes,
          groupSize,
          hostingBackground,
        },
      })
      if (!result.success) {
        setSubmitting(false)
        setAuthMessage(result.error ?? 'We could not create your host account. Please try again.')
        return
      }
      if (result.requiresEmailConfirmation) {
        setSubmitting(false)
        setAuthMessage('Check your email to confirm your account, then sign in to finish your host profile.')
        return
      }
      router.push('/host')
    }, 480)
  }

  const canContinue =
    step === 'place' ? Boolean(profile.city.trim())
      : step === 'interests' ? profile.interests.length >= 3
        : step === 'intent' ? profile.intents.length > 0
          : step === 'availability' ? profile.availability.length > 0
            : true

  if (step === 'role') return <RoleChoice onChoose={chooseRole} />
  if (step === 'host-questionnaire') return (
    <HostQuestionnaire
      values={{ venueName, neighborhood: hostNeighborhood, craft, motivation, hostLanes, groupSize, hostingBackground }}
      setters={{ setVenueName, setNeighborhood: setHostNeighborhood, setCraft, setMotivation, toggleHostLane, setGroupSize, setHostingBackground }}
      submitting={submitting}
      authMessage={authMessage}
      onBack={back}
      onSubmit={submitHost}
    />
  )

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-5xl flex-col rounded-[28px] border border-white/12 bg-white/5 p-4 shadow-2xl shadow-black/10 sm:p-7">
        <header className="flex items-center justify-between gap-6 border-b border-white/12 pb-4">
          <Link href="/" className="font-serif text-sm tracking-[0.18em] text-charcoal">SERENDIPITY</Link>
          <div className="w-full max-w-xs">
            <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.16em] text-muted">
              <span>{step === 'account' ? (role === 'host' ? 'New host' : 'New member') : 'Your first week'}</span>
              {step !== 'account' && <span>{currentStep} of {ATTENDEE_STEPS.length}</span>}
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-8 sm:py-12" aria-live="polite">
          <div className="w-full max-w-3xl">
            {step === 'account' && (
              <form className="mx-auto max-w-md" onSubmit={submitAccount}>
                <Eyebrow><Sparkles size={14} /> {role === 'host' ? 'YOUR HOST PROFILE' : 'YOUR FIRST WEEK'}</Eyebrow>
                <h1 className="mb-3 font-serif text-4xl text-charcoal">Your story starts here.</h1>
                <p className="mb-8 text-sm leading-relaxed text-muted">Create your account, then answer a few bright questions so Serendipity can make every invitation count.</p>
                <div className="space-y-4">
                  <Field label="Full name"><input className={inputClass} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required /></Field>
                  <Field label="Email"><input className={inputClass} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></Field>
                  <Field label="Password"><input className={inputClass} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required /></Field>
                </div>
                <PrimaryButton type="submit">Continue <ArrowRight size={16} /></PrimaryButton>
                <p className="mt-5 text-center text-xs text-muted">Already a member? <Link href="/login" className="text-charcoal underline underline-offset-4">Sign in</Link></p>
              </form>
            )}

            {step === 'welcome' && (
              <div className="mx-auto max-w-xl text-center">
                <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-terracotta/30 bg-terracotta/10 text-terracotta"><Compass size={30} strokeWidth={1.4} /></div>
                <Eyebrow center>A SHORT FIELD GUIDE</Eyebrow>
                <h1 className="mb-4 font-serif text-4xl text-charcoal sm:text-5xl">Let&apos;s make this personal, {name.split(' ')[0] || 'friend'}.</h1>
                <p className="mx-auto max-w-lg text-base leading-relaxed text-muted">In a few small choices, we&apos;ll assemble invitations that deepen what you love, stretch your mind, and leave a little room for the unexpected.</p>
              </div>
            )}

            {step === 'place' && (
              <Question eyebrow="YOUR LOCAL FIELD" title="Where does life happen?" prompt="Good invitations should fit your real world, not ask for an impossible commute.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City"><input className={inputClass} value={profile.city} onChange={(event) => patchProfile({ city: event.target.value })} placeholder="San Francisco" autoFocus /></Field>
                  <Field label="Neighborhood (optional)"><input className={inputClass} value={profile.neighborhood} onChange={(event) => patchProfile({ neighborhood: event.target.value })} placeholder="Mission, Oakland, or nearby" /></Field>
                </div>
                <OptionRow label="How far feels easy?" options={TRAVEL_RADII} value={profile.travelRadius} onChange={(value) => patchProfile({ travelRadius: value as TravelRadius })} />
              </Question>
            )}

            {step === 'interests' && (
              <Question eyebrow="CHOOSE AT LEAST THREE" title="What pulls you in?" prompt="Pick the things that make you look twice, stay late, or lose track of time.">
                <div className="flex flex-wrap gap-2">{INTEREST_TAGS.map((interest) => <ChoicePill key={interest} selected={profile.interests.includes(interest)} onClick={() => toggleProfileList('interests', interest)}>{interest}</ChoicePill>)}</div>
                <p className="mt-4 text-xs text-muted">{profile.interests.length ? `${profile.interests.length} marked` : 'Nothing is too niche.'}{profile.interests.length < 3 && ` · choose ${3 - profile.interests.length} more`}</p>
              </Question>
            )}

            {step === 'intent' && (
              <Question eyebrow="CHOOSE UP TO TWO" title="What do you want more of?" prompt="Your interests tell us where to look. Your intent tells us what a good invitation should do for you now.">
                <div className="grid gap-3 sm:grid-cols-2">{INTENTS.map(([title, detail], index) => {
                  const selected = profile.intents.includes(title)
                  return <button key={title} type="button" aria-pressed={selected} onClick={() => toggleProfileList('intents', title, 2)} className={`relative min-h-32 rounded-2xl border p-5 text-left transition ${selected ? 'border-terracotta bg-terracotta/12' : 'border-white/14 bg-white/6 hover:border-white/35'}`}><span className="text-[10px] tracking-widest text-muted">0{index + 1}</span><strong className="mt-3 block font-serif text-xl font-normal text-charcoal">{title}</strong><small className="mt-1 block leading-relaxed text-muted">{detail}</small>{selected && <Check className="absolute right-4 top-4 text-terracotta" size={17} />}</button>
                })}</div>
              </Question>
            )}

            {step === 'comfort' && (
              <Question eyebrow="SET THE DIAL" title="What feels inviting?" prompt="We want to stretch your world without ignoring your boundaries.">
                <div className="rounded-2xl border border-white/14 bg-white/6 p-5">
                  <div className="mb-4 flex items-center justify-between"><span className="text-xs text-muted">Familiar</span><strong className="font-serif text-lg font-normal text-charcoal">How adventurous?</strong><span className="text-xs text-muted">Unknown</span></div>
                  <input className="w-full accent-terracotta" aria-label="Adventurousness" type="range" min="0" max="100" value={profile.adventurousness} onChange={(event) => patchProfile({ adventurousness: Number(event.target.value) })} />
                  <p className="mt-3 text-center text-xs text-muted">{profile.adventurousness < 35 ? 'Keep most invitations close to what I know.' : profile.adventurousness > 70 ? 'Send me somewhere genuinely unexpected.' : 'A familiar foothold with room to explore.'}</p>
                </div>
                <OptionRow icon={<Users size={16} />} label="Social setting" options={SOCIAL_STYLES} value={profile.socialStyle} onChange={(value) => patchProfile({ socialStyle: value as SocialStyle })} />
                <OptionRow label="Comfortable budget" options={BUDGETS} value={profile.budgetStyle} onChange={(value) => patchProfile({ budgetStyle: value as BudgetPreference })} />
              </Question>
            )}

            {step === 'availability' && (
              <Question eyebrow="MAKE IT ACTIONABLE" title="When can you actually go?" prompt="Choose every window that usually has room for a good idea.">
                <div className="grid gap-3 sm:grid-cols-2">{AVAILABILITY.map((time) => {
                  const selected = profile.availability.includes(time)
                  return <button type="button" key={time} aria-pressed={selected} className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-sm transition ${selected ? 'border-terracotta bg-terracotta/12 text-charcoal' : 'border-white/14 bg-white/6 text-muted hover:border-white/35'}`} onClick={() => toggleProfileList('availability', time)}><Clock3 size={17} /><span className="flex-1 text-left">{time}</span>{selected && <Check size={17} className="text-terracotta" />}</button>
                })}</div>
                <OptionRow label="Planning style" options={PLANNING_STYLES} value={profile.planningStyle} onChange={(value) => patchProfile({ planningStyle: value as PlanningStyle })} />
                <div><p className="mb-3 text-[10px] uppercase tracking-widest text-muted">Access needs (optional)</p><div className="flex flex-wrap gap-2">{ACCESSIBILITY_NEEDS.map((need) => <ChoicePill key={need} selected={profile.accessibilityNeeds.includes(need)} onClick={() => toggleProfileList('accessibilityNeeds', need)}>{need}</ChoicePill>)}</div></div>
              </Question>
            )}

            {step === 'reveal' && (
              <div className="text-center">
                <PartyPopper className="mx-auto mb-5 text-terracotta" size={26} />
                <Eyebrow center>YOUR SERENDIPITY PROFILE</Eyebrow>
                <h1 className="mb-3 font-serif text-4xl text-charcoal">Three ways into a fuller week.</h1>
                <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-muted">We&apos;ll prioritize {profile.availability.join(' and ').toLowerCase()} around {profile.neighborhood || profile.city}, balancing what you love with the kind of life you want right now.</p>
                <div className="grid gap-4 text-left sm:grid-cols-3">
                  <Invitation lane="PASSION" title={profile.interests[0] || 'A familiar spark'} copy="A chance to go deeper—not just do more—inside something that already matters to you." />
                  <Invitation lane="GROWTH" title={profile.intents.find((intent) => intent.includes('skill')) || 'A meaningful stretch'} copy="A participatory experience that teaches, challenges, or changes your perspective." />
                  <Invitation lane="SURPRISE" title="A thoughtful unknown" copy={`Something outside your usual orbit, tuned to your ${profile.adventurousness < 45 ? 'gentle' : profile.adventurousness > 70 ? 'bold' : 'balanced'} sense of adventure.`} />
                </div>
              </div>
            )}
          </div>
        </main>

        {step !== 'account' && (
          <footer className="flex items-center justify-between border-t border-white/12 pt-4">
            <button type="button" onClick={back} className="flex items-center gap-2 px-2 py-3 text-xs text-muted hover:text-charcoal"><ArrowLeft size={16} /> Back</button>
            {step === 'reveal'
              ? <button type="button" onClick={finishAttendee} disabled={submitting} className="flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm text-cream transition hover:bg-charcoal/85 disabled:opacity-40">{submitting ? 'Opening your week…' : 'Open my first week'} <ArrowRight size={16} /></button>
              : <button type="button" onClick={next} disabled={!canContinue} className="flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm text-cream transition hover:bg-charcoal/85 disabled:opacity-30">{step === 'welcome' ? 'Let’s begin' : 'Continue'} <ArrowRight size={16} /></button>}
          </footer>
        )}
        {authMessage && (
          <p className="mt-3 text-center text-sm text-terracotta" role="status" aria-live="polite">
            {authMessage}
          </p>
        )}
      </div>
    </div>
  )
}

function RoleChoice({ onChoose }: { onChoose: (role: UserRole) => void }) {
  return <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-5 py-16"><div className="w-full max-w-md"><div className="mb-10 text-center"><Leaf className="mx-auto mb-5 text-terracotta" size={22} strokeWidth={1.5} /><p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted">Begin here</p><h1 className="mb-2 font-serif text-4xl text-charcoal">How will you show up?</h1><p className="text-sm text-muted">You can always do both. Start with one.</p></div><div className="space-y-4"><RoleButton icon={<Compass size={18} />} title="Find experiences" copy="Receive thoughtful Passion, Growth, and Surprise invitations shaped around your real life." onClick={() => onChoose('attendee')} /><RoleButton icon={<Sparkles size={18} />} title="Host experiences" copy="Bring people together around your craft and find the people who will value it most." onClick={() => onChoose('host')} /></div><p className="mt-8 text-center text-xs text-muted">Already a member? <Link href="/login" className="text-charcoal underline underline-offset-4">Sign in</Link></p></div></div>
}

function RoleButton({ icon, title, copy, onClick }: { icon: React.ReactNode; title: string; copy: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="w-full rounded-[22px] border border-white/16 bg-white/8 p-6 text-left transition hover:border-white/45 active:scale-[0.99]"><span className="mb-3 flex items-center gap-3 text-terracotta">{icon}<strong className="text-xs uppercase tracking-widest text-charcoal">{title}</strong></span><span className="block text-sm leading-relaxed text-muted">{copy}</span></button>
}

function Question({ title, eyebrow, prompt, children }: { title: string; eyebrow: string; prompt: string; children: React.ReactNode }) {
  return <div><Eyebrow>{eyebrow}</Eyebrow><h1 className="mb-3 font-serif text-4xl text-charcoal sm:text-5xl">{title}</h1><p className="mb-8 max-w-xl text-sm leading-relaxed text-muted">{prompt}</p><div className="space-y-6">{children}</div></div>
}

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return <p className={`mb-4 flex items-center gap-2 text-[10px] font-medium tracking-[0.18em] text-terracotta ${center ? 'justify-center' : ''}`}>{children}</p>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-[10px] uppercase tracking-widest text-muted">{label}<span className="mt-2 block normal-case tracking-normal">{children}</span></label>
}

function PrimaryButton({ children, type }: { children: React.ReactNode; type: 'button' | 'submit' }) {
  return <button type={type} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-3.5 text-sm text-cream transition hover:bg-charcoal/85">{children}</button>
}

function ChoicePill({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={`flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-xs transition ${selected ? 'border-charcoal bg-charcoal text-cream' : 'border-white/18 bg-white/8 text-charcoal-light hover:border-white/40'}`}>{selected && <Check size={13} />}{children}</button>
}

function OptionRow({ icon, label, options, value, onChange }: { icon?: React.ReactNode; label: string; options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return <div><p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted">{icon}{label}</p><div className="flex flex-wrap gap-2">{options.map((option) => <ChoicePill key={option} selected={value === option} onClick={() => onChange(option)}>{option}</ChoicePill>)}</div></div>
}

function Invitation({ lane, title, copy }: { lane: string; title: string; copy: string }) {
  const accent = lane === 'PASSION' ? 'text-terracotta' : lane === 'GROWTH' ? 'text-teal' : 'text-cobalt'
  return <article className="rounded-2xl border border-white/14 bg-white/7 p-5"><span className={`text-[10px] tracking-[0.18em] ${accent}`}>{lane}</span><h2 className="my-3 font-serif text-xl text-charcoal">{title}</h2><p className="text-xs leading-relaxed text-muted">{copy}</p></article>
}

type HostValues = { venueName: string; neighborhood: string; craft: string; motivation: string; hostLanes: Lane[]; groupSize: string; hostingBackground: string }
type HostSetters = { setVenueName: (value: string) => void; setNeighborhood: (value: string) => void; setCraft: (value: string) => void; setMotivation: (value: string) => void; toggleHostLane: (lane: Lane) => void; setGroupSize: (value: string) => void; setHostingBackground: (value: string) => void }

function HostQuestionnaire({ values, setters, submitting, authMessage, onBack, onSubmit }: { values: HostValues; setters: HostSetters; submitting: boolean; authMessage: string; onBack: () => void; onSubmit: (event: React.FormEvent) => void }) {
  const complete = values.venueName.trim() && values.craft.trim() && values.motivation.trim() && values.hostLanes.length > 0
  return <div className="min-h-[calc(100vh-56px)] px-5 py-12"><div className="mx-auto max-w-xl"><Eyebrow><Sparkles size={14} /> HOST FIELD GUIDE</Eyebrow><h1 className="mb-3 font-serif text-4xl text-charcoal">Tell us how you host.</h1><p className="mb-8 text-sm leading-relaxed text-muted">This shapes your profile and helps each experience reach people who will value it.</p><form onSubmit={onSubmit} className="space-y-5"><Field label="Where do you host?"><input className={inputClass} value={values.venueName} onChange={(event) => setters.setVenueName(event.target.value)} placeholder="Your studio, kitchen, rooftop…" required /></Field><Field label="Neighborhood (optional)"><input className={inputClass} value={values.neighborhood} onChange={(event) => setters.setNeighborhood(event.target.value)} placeholder="Mission, Sunset, North Beach…" /></Field><Field label="What will you host?"><textarea className={`${inputClass} min-h-24 resize-none`} value={values.craft} onChange={(event) => setters.setCraft(event.target.value)} placeholder="Wheel-throwing, supper clubs, rooftop stargazing…" required /></Field><Field label="What should guests walk away with?"><textarea className={`${inputClass} min-h-24 resize-none`} value={values.motivation} onChange={(event) => setters.setMotivation(event.target.value)} placeholder="A skill, a memory, a new perspective…" required /></Field><div><p className="mb-3 text-[10px] uppercase tracking-widest text-muted">Which lanes fit?</p><div className="flex flex-wrap gap-2">{LANES.map((lane) => <ChoicePill key={lane} selected={values.hostLanes.includes(lane)} onClick={() => setters.toggleHostLane(lane)}>{LANE_LABELS[lane]}</ChoicePill>)}</div></div><OptionRow label="Typical group size" options={GROUP_SIZES} value={values.groupSize} onChange={setters.setGroupSize} /><OptionRow label="Hosting background" options={HOSTING_BACKGROUNDS} value={values.hostingBackground} onChange={setters.setHostingBackground} /><button type="submit" disabled={!complete || submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-3.5 text-sm text-cream disabled:opacity-30">{submitting ? 'Creating your studio…' : 'Open your host studio'} <ArrowRight size={16} /></button>{authMessage && <p className="text-center text-sm text-terracotta" role="status" aria-live="polite">{authMessage}</p>}</form><button type="button" onClick={onBack} className="mx-auto mt-6 flex items-center gap-2 text-xs text-muted"><ArrowLeft size={15} /> Back</button></div></div>
}
