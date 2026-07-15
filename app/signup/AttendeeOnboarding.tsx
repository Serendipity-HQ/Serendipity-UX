'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3, MapPin, PartyPopper, Users } from 'lucide-react'

type SurveyStep = 'welcome' | 'place' | 'interests' | 'intent' | 'comfort' | 'availability' | 'reveal'

type OnboardingProfile = {
  city: string
  neighborhood: string
  radius: string
  interests: string[]
  intents: string[]
  adventurousness: number
  socialStyle: string
  budget: string
  availability: string[]
  planningStyle: string
}

const STEPS: SurveyStep[] = ['welcome', 'place', 'interests', 'intent', 'comfort', 'availability', 'reveal']
const INTEREST_GROUPS = [
  { label: 'Arts', tags: ['Pottery', 'Photography', 'Creative Writing', 'Film'] },
  { label: 'Making', tags: ['Cooking', 'Woodworking', 'Foraging'] },
  { label: 'Movement', tags: ['Climbing', 'Hiking', 'Dance', 'Yoga'] },
  { label: 'Learning', tags: ['Philosophy', 'Astronomy', 'Meditation'] },
  { label: 'Out together', tags: ['Live Music', 'Wine Tasting'] },
]
const INTENTS = [
  ['Deepen a passion', 'Return to something that already lights you up.'],
  ['Try a new direction', 'Make room for a beginner moment.'],
  ['Be surprised', 'Let a good unknown find you.'],
  ['Meet people', 'Find a little more aliveness with others.'],
  ['Get outside', 'Trade four walls for fresh air.'],
  ['Slow down', 'Choose something restorative and unhurried.'],
]
const TIMES = ['Weekday evenings', 'Saturday', 'Sunday']

export default function AttendeeOnboarding({
  name,
  loading,
  onBack,
  onComplete,
}: {
  name: string
  loading: boolean
  onBack: () => void
  onComplete: (interests: string[]) => void
}) {
  const [step, setStep] = useState<SurveyStep>('welcome')
  const [city, setCity] = useState('San Francisco')
  const [neighborhood, setNeighborhood] = useState('')
  const [radius, setRadius] = useState('Nearby')
  const [interests, setInterests] = useState<string[]>([])
  const [intents, setIntents] = useState<string[]>([])
  const [adventurousness, setAdventurousness] = useState(58)
  const [socialStyle, setSocialStyle] = useState('A mix')
  const [budget, setBudget] = useState('A little of both')
  const [availability, setAvailability] = useState<string[]>(['Saturday'])
  const [planningStyle, setPlanningStyle] = useState('A little of both')

  const currentStep = STEPS.indexOf(step) + 1
  const progress = (currentStep / STEPS.length) * 100
  const canContinue = step === 'place'
    ? Boolean(city.trim())
    : step === 'interests'
      ? interests.length >= 3
      : step === 'intent'
        ? intents.length > 0
        : step === 'availability'
          ? availability.length > 0
          : true

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>, value: string, max?: number) {
    setter((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value)
      return max && current.length >= max ? current : [...current, value]
    })
  }

  function next() {
    const index = STEPS.indexOf(step)
    if (index < STEPS.length - 1) setStep(STEPS[index + 1])
  }

  function back() {
    const index = STEPS.indexOf(step)
    if (index === 0) onBack()
    else setStep(STEPS[index - 1])
  }

  function finish() {
    const profile: OnboardingProfile = {
      city,
      neighborhood,
      radius,
      interests,
      intents,
      adventurousness,
      socialStyle,
      budget,
      availability,
      planningStyle,
    }
    localStorage.setItem('serendipity_onboarding_profile', JSON.stringify(profile))
    localStorage.setItem('serendipity_onboarding_complete', 'true')
    onComplete(interests)
  }

  return (
    <div className="onboarding-shell min-h-[calc(100vh-56px)] px-4 py-5 sm:px-6 sm:py-8">
      <div className="onboarding-frame mx-auto w-full max-w-5xl">
        <header className="onboarding-header">
          <span className="onboarding-wordmark">SERENDIPITY</span>
          <div className="onboarding-progress" aria-label={`Onboarding progress: ${Math.round(progress)}% complete`}>
            <span className="onboarding-progress-label">Your first week · {currentStep} of {STEPS.length}</span>
            <span className="onboarding-progress-track"><span style={{ width: `${progress}%` }} /></span>
          </div>
        </header>

        <section className="onboarding-stage" aria-live="polite">
          <div className="onboarding-paper" key={step}>
            {step === 'welcome' && (
              <div className="onboarding-welcome">
                <div className="onboarding-orbit" aria-hidden="true"><span>+</span><span>*</span><span>+</span></div>
                <p className="onboarding-eyebrow">A short field guide</p>
                <h1>Let&apos;s make this personal, {name.split(' ')[0] || 'friend'}.</h1>
                <p>In a few small choices, we&apos;ll assemble a first week that feels like you. No personality test. No homework.</p>
                <div className="onboarding-note"><MapPin size={17} /> We&apos;ll begin with where life is happening.</div>
              </div>
            )}

            {step === 'place' && (
              <Question title="Where are you?" eyebrow="Your local field" prompt="Good invitations should not need a long commute.">
                <div className="onboarding-fields onboarding-fields--wide">
                  <label>City<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="San Francisco" autoFocus /></label>
                  <label>Neighborhood <span className="onboarding-optional">optional</span><input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder="Mission, Oakland, or anywhere nearby" /></label>
                </div>
                <OptionRow label="How far feels easy?" options={['Right around me', 'Nearby', 'Worth the trip']} value={radius} onChange={setRadius} />
              </Question>
            )}

            {step === 'interests' && (
              <Question title="What are you drawn to?" eyebrow="Choose at least three" prompt="Pick the things that make you look twice, stay late, or lose track of time.">
                <div className="onboarding-interest-groups">
                  {INTEREST_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p>{group.label}</p>
                      <div className="onboarding-tags">
                        {group.tags.map((tag) => (
                          <button key={tag} type="button" onClick={() => toggle(setInterests, tag)} className={interests.includes(tag) ? 'is-selected' : ''}>
                            {interests.includes(tag) && <Check size={13} />}{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="onboarding-selection-count">{interests.length ? `${interests.length} interests marked` : 'Nothing is too niche.'}</p>
              </Question>
            )}

            {step === 'intent' && (
              <Question title="What kind of week do you want?" eyebrow="Choose up to two" prompt="This tells us what an invitation is meant to do for you right now.">
                <div className="onboarding-choice-grid">
                  {INTENTS.map(([title, detail], index) => (
                    <button key={title} type="button" onClick={() => toggle(setIntents, title, 2)} className={intents.includes(title) ? 'is-selected' : ''}>
                      <span className="onboarding-choice-number">0{index + 1}</span><strong>{title}</strong><small>{detail}</small>
                      {intents.includes(title) && <Check className="onboarding-choice-check" size={17} />}
                    </button>
                  ))}
                </div>
              </Question>
            )}

            {step === 'comfort' && (
              <Question title="Set the dial." eyebrow="Comfort settings" prompt="We'll use this to make your invitations feel enticing, not impractical.">
                <div className="onboarding-slider-card">
                  <div><span>Familiar</span><strong>How adventurous?</strong><span>Unknown</span></div>
                  <input aria-label="Adventurousness" type="range" min="0" max="100" value={adventurousness} onChange={(event) => setAdventurousness(Number(event.target.value))} style={{ '--range-fill': `${adventurousness}%` } as React.CSSProperties} />
                  <p>{adventurousness < 35 ? 'Start close to what you know.' : adventurousness > 70 ? 'Send me somewhere unexpected.' : 'A little familiar, a little unexpected.'}</p>
                </div>
                <OptionRow icon={<Users size={16} />} label="Company" options={['Solo time', 'A small group', 'A mix']} value={socialStyle} onChange={setSocialStyle} />
                <OptionRow label="Budget" options={['Mostly free', 'A little of both', 'Worth a splurge']} value={budget} onChange={setBudget} />
              </Question>
            )}

            {step === 'availability' && (
              <Question title="When can you go?" eyebrow="Make it actionable" prompt="Choose the windows that have room for a good idea.">
                <div className="onboarding-time-list">
                  {TIMES.map((time) => (
                    <button type="button" key={time} className={availability.includes(time) ? 'is-selected' : ''} onClick={() => toggle(setAvailability, time)}>
                      <Clock3 size={17} /><span>{time}</span>{availability.includes(time) && <Check size={17} />}
                    </button>
                  ))}
                </div>
                <OptionRow label="Planning style" options={['Same-day sparks', 'A little of both', 'Planned ahead']} value={planningStyle} onChange={setPlanningStyle} />
              </Question>
            )}

            {step === 'reveal' && (
              <div className="onboarding-reveal">
                <PartyPopper className="onboarding-party" size={22} />
                <p className="onboarding-eyebrow">Your first week is taking shape</p>
                <h1>Three ways in.</h1>
                <p>We&apos;ll start with a familiar spark, a new direction, and one good surprise around {neighborhood || city || 'you'}.</p>
                <div className="onboarding-invitations">
                  <Invitation type="PASSION" title={interests[0] || 'A familiar favorite'} copy="Something to deepen what already moves you." />
                  <Invitation type="GROWTH" title={intents[0] || 'A fresh beginning'} copy="One gentle nudge beyond the usual." />
                  <Invitation type="SURPRISE" title="A small unknown" copy="A good reason to say yes without overthinking it." />
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="onboarding-footer">
          <button type="button" onClick={back} className="onboarding-back"><ArrowLeft size={16} /> Back</button>
          {step === 'reveal'
            ? <button type="button" onClick={finish} disabled={loading} className="paper-button onboarding-primary">{loading ? 'Opening your week...' : 'Open my first week'} <ArrowRight size={16} /></button>
            : <button type="button" onClick={next} disabled={!canContinue} className="paper-button onboarding-primary">{step === 'welcome' ? "Let's begin" : 'Continue'} <ArrowRight size={16} /></button>}
        </footer>
      </div>
    </div>
  )
}

function Question({ title, eyebrow, prompt, children }: { title: string; eyebrow: string; prompt: string; children: React.ReactNode }) {
  return <div className="onboarding-question"><p className="onboarding-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="onboarding-prompt">{prompt}</p><div className="onboarding-question-content">{children}</div></div>
}

function OptionRow({ icon, label, options, value, onChange }: { icon?: React.ReactNode; label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="onboarding-option-row"><p>{icon}{label}</p><div>{options.map((option) => <button type="button" key={option} className={value === option ? 'is-selected' : ''} onClick={() => onChange(option)}>{option}</button>)}</div></div>
}

function Invitation({ type, title, copy }: { type: string; title: string; copy: string }) {
  return <article className={`onboarding-invitation onboarding-invitation--${type.toLowerCase()}`}><span>{type}</span><h2>{title}</h2><p>{copy}</p><i>- your invitation is on its way</i></article>
}
