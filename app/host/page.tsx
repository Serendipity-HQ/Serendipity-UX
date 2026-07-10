'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Sparkles } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { INTEREST_TAGS, LANE_LABELS } from '@/lib/constants'
import type { Lane } from '@/lib/types'
import ExperienceCard from '@/components/ExperienceCard'
import LaneBadge from '@/components/LaneBadge'
import Reveal from '@/components/Reveal'

const LANES: Lane[] = ['passion', 'growth', 'surprise']

const inputClass =
  'border border-white/16 bg-white/8 w-full rounded-xl px-4 py-3 text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:border-white/50 transition-colors duration-200'

export default function HostPage() {
  const { user, isLoggedIn, hosts, createExperience, myHostedExperiences } = useApp()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [lane, setLane] = useState<Lane>('passion')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [price, setPrice] = useState('')
  const [spots, setSpots] = useState('8')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [justPosted, setJustPosted] = useState(false)

  const isHost = user?.role === 'host' && user.hostProfile

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
    else if (user && !isHost) router.push('/home')
  }, [isLoggedIn, user, isHost, router])

  if (!user || !isHost) return null

  const hostProfile = user.hostProfile!
  const myHost = hosts.find((h) => h.id === hostProfile.hostId)

  const formComplete =
    title.trim() && description.trim() && location.trim() && date && time &&
    Number(price) >= 0 && price !== '' && Number(spots) > 0

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formComplete) return
    const created = createExperience({
      title: title.trim(),
      lane,
      description: description.trim(),
      location: location.trim() || hostProfile.venueName,
      dateTime: `${date}T${time}:00`,
      price: Math.round(Number(price)),
      spotsTotal: Math.round(Number(spots)),
      tags: selectedTags,
    })
    if (!created) return
    setTitle(''); setDescription(''); setLocation('')
    setDate(''); setTime(''); setPrice(''); setSpots('8'); setSelectedTags([])
    setJustPosted(true)
    window.setTimeout(() => setJustPosted(false), 4000)
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-14">
      {/* Header */}
      <Reveal>
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Host studio</p>
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
          {hostProfile.venueName}.
        </h1>
        <p className="text-sm text-muted mb-10 max-w-md leading-relaxed">
          Post an experience and it goes live on Discover — and into the weekly
          invitations of people whose interests match.
        </p>
      </Reveal>

      {/* Post form */}
      <Reveal delay={80}>
        <form onSubmit={handleSubmit} className="liquid-card rounded-[28px] p-6 md:p-8 space-y-5 mb-14">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-terracotta" strokeWidth={1.5} />
            <h2 className="text-xs tracking-widest uppercase text-charcoal">Post an experience</h2>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Introduction to Wheel Throwing"
              required
            />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-2">Lane</p>
            <div className="flex gap-2">
              {LANES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLane(l)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs tracking-wide transition-all duration-200 active:scale-95 ${
                    lane === l
                      ? 'bg-charcoal text-cream border-charcoal'
                      : 'bg-white text-charcoal-light border-border hover:border-sand'
                  }`}
                >
                  {LANE_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[110px] resize-none`}
              placeholder="What happens, who it's for, and what people leave with."
              required
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder={hostProfile.venueName}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="time">
                Start time
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="price">
                Price ($ per person)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
                placeholder="65"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-2" htmlFor="spots">
                Spots
              </label>
              <input
                id="spots"
                type="number"
                min="1"
                value={spots}
                onChange={(e) => setSpots(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-2">
              Tags <span className="normal-case tracking-normal">— help us recommend it</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs tracking-wide transition-all duration-200 active:scale-95 ${
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
          </div>

          <button
            type="submit"
            disabled={!formComplete}
            className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm tracking-wide hover:bg-charcoal/85 transition-all duration-200 disabled:opacity-30 active:scale-95"
          >
            Post to Discover
          </button>

          {justPosted && (
            <p className="text-center text-xs text-teal tracking-wide">
              Posted — your experience is live on Discover.
            </p>
          )}
        </form>
      </Reveal>

      {/* My experiences */}
      <Reveal delay={120}>
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="font-serif text-2xl text-charcoal">Your experiences.</h2>
          <p className="text-[10px] tracking-widest uppercase text-muted">
            {myHostedExperiences.length} posted
          </p>
        </div>

        {myHostedExperiences.length === 0 ? (
          <div className="liquid-card text-center py-16 px-8 rounded-[28px]">
            <p className="font-serif text-2xl text-charcoal mb-2">Nothing posted yet.</p>
            <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
              Your first experience will appear here — and on Discover for everyone in the city.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {myHostedExperiences.map((exp, i) => (
              <Reveal key={exp.id} delay={i * 60}>
                <div className="space-y-2">
                  <LaneBadge lane={exp.lane} />
                  {myHost && <ExperienceCard experience={exp} host={myHost} />}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  )
}
