'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, Edit2, Check, X, Ticket, Wallet, ArrowRight, MapPin, Compass, Clock3, Sparkles, Route } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { interestsByCategory } from '@serendipity-hq/design'
import { LaneBadge, Reveal } from '@serendipity-hq/ui'

const INTEREST_GROUPS = interestsByCategory()
const MIN_INTERESTS = 4

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function adventureLabel(value: number) {
  if (value < 35) return 'A gentle stretch beyond the familiar'
  if (value > 70) return 'Genuinely unexpected experiences'
  return 'A familiar foothold with room to explore'
}

function Preference({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-muted">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        <p className="text-[9px] uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-sm leading-relaxed text-charcoal-light">{value}</p>
    </div>
  )
}

export default function ProfilePage() {
  const { user, isLoggedIn, logout, updateUserBio, updateUserInterests, bookings, posts, experiences, hosts } = useApp()
  const router = useRouter()
  const [editingBio, setEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')
  const [editingInterests, setEditingInterests] = useState(false)
  const [tempInterests, setTempInterests] = useState<string[]>([])

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  if (!user) return null

  const attendedBookings = bookings.filter((b) => b.status !== 'cancelled')
  const storyBookings = [...attendedBookings].sort(
    (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
  )

  const profile = user.onboardingProfile

  function handleLogout() {
    logout()
    router.push('/')
  }

  function saveBio() {
    updateUserBio(bioText)
    setEditingBio(false)
  }

  function saveInterests() {
    if (tempInterests.length >= MIN_INTERESTS) {
      updateUserInterests(tempInterests)
      setEditingInterests(false)
    }
  }

  function toggleInterest(tag: string) {
    setTempInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 md:py-14">
      {/* Header */}
      <Reveal>
        <div className="liquid-card rounded-[30px] p-5 md:p-6 mb-10 flex items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <Image
              src={`https://picsum.photos/seed/profile-${user.id}/200/200`}
              alt={user.name}
              width={64}
              height={64}
              className="rounded-full object-cover ring-2 ring-white/70"
            />
            <div>
              <h1 className="font-serif text-2xl text-charcoal">{user.name}</h1>
              <p className="text-xs text-muted mt-0.5">Your invitations, preferences, and unfolding path.</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted hover:text-terracotta transition-colors duration-200"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal delay={60}>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Experiences', value: attendedBookings.length },
            { label: 'Reflections', value: posts.filter((post) => post.authorId === user.id).length },
            { label: 'Interests',   value: user.interests.length },
          ].map(({ label, value }) => (
            <div key={label} className="liquid-card rounded-[26px] p-4 text-center">
              <p className="font-serif text-3xl text-charcoal">{value}</p>
              <p className="text-[9px] tracking-widest uppercase text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Quick links */}
      <Reveal delay={80}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { href: '/bookings', label: 'My Tickets', icon: Ticket },
            { href: '/wallet',   label: 'Wallet',     icon: Wallet },
            { href: '/passion-path', label: 'Passion Path', icon: Route },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="liquid-card group flex items-center justify-between rounded-[26px] p-4 hover:border-white/80 transition-all duration-200 card-lift"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-muted" strokeWidth={1.5} />
                <span className="text-sm text-charcoal">{label}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-terracotta transition-colors" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Bio */}
      <Reveal delay={100}>
        <div className="liquid-card rounded-[28px] p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] tracking-widest uppercase text-muted">About</p>
            {!editingBio ? (
              <button onClick={() => { setBioText(user.bio); setEditingBio(true) }} aria-label="Edit about me" className="flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-charcoal transition-colors">
                <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveBio} aria-label="Save about me" className="flex min-h-11 min-w-11 items-center justify-center text-teal"><Check className="w-4 h-4" strokeWidth={2} aria-hidden="true" /></button>
                <button onClick={() => { setBioText(user.bio); setEditingBio(false) }} aria-label="Cancel editing about me" className="flex min-h-11 min-w-11 items-center justify-center text-muted"><X className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></button>
              </div>
            )}
          </div>
          {editingBio ? (
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              rows={3}
              className="w-full text-sm text-charcoal-light leading-relaxed bg-parchment border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-sand resize-none"
            />
          ) : (
            <p className="text-sm text-charcoal-light leading-relaxed">
              {user.bio || 'Add a few words about what you are curious about right now.'}
            </p>
          )}
        </div>
      </Reveal>

      {/* Interests */}
      <Reveal delay={120}>
        <div className="liquid-card rounded-[28px] p-5 mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-widest uppercase text-muted">Interests</p>
            {!editingInterests ? (
              <button onClick={() => { setTempInterests(user.interests); setEditingInterests(true) }} aria-label="Edit interests" className="flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-charcoal transition-colors">
                <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveInterests} disabled={tempInterests.length < MIN_INTERESTS} aria-label="Save interests" className="flex min-h-11 min-w-11 items-center justify-center text-teal disabled:opacity-40"><Check className="w-4 h-4" strokeWidth={2} aria-hidden="true" /></button>
                <button onClick={() => { setTempInterests(user.interests); setEditingInterests(false) }} aria-label="Cancel editing interests" className="flex min-h-11 min-w-11 items-center justify-center text-muted"><X className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></button>
              </div>
            )}
          </div>
          {editingInterests ? (
            <div className="max-h-72 overflow-y-auto pr-1 space-y-4">
              {INTEREST_GROUPS.map(({ category, interests }) => (
                <div key={category.id}>
                  <p className="text-[9px] tracking-widest uppercase text-muted/70 mb-1.5">{category.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {interests.map(({ tag }) => {
                      const selected = tempInterests.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleInterest(tag)}
                          className={`px-3 py-1.5 rounded-full border text-xs tracking-wide transition-all duration-200 ${
                            selected ? 'bg-charcoal text-cream border-charcoal' : 'text-muted border-border hover:border-sand'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((tag) => (
                <span key={tag} className="text-xs text-charcoal-light border border-border rounded-full px-3 py-1.5">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* Recommendation profile */}
      <Reveal delay={140}>
        <section className="liquid-card rounded-[28px] p-5 mb-10" aria-labelledby="recommendation-profile-title">
          <div className="mb-5">
            <p className="text-[10px] tracking-widest uppercase text-muted">What shapes your invitations</p>
            <h2 id="recommendation-profile-title" className="mt-2 font-serif text-2xl text-charcoal">Your recommendation profile</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Serendipity balances what you love with what you want more of, then checks each invitation against your real life.
            </p>
          </div>

          {profile ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Preference icon={MapPin} label="Home base" value={`${profile.neighborhood ? `${profile.neighborhood}, ` : ''}${profile.city} · ${profile.travelRadius}`} />
              <Preference icon={Sparkles} label="What you want more of" value={profile.intents.join(' · ') || 'Open to discovery'} />
              <Preference icon={Clock3} label="Best times" value={`${profile.availability.join(' · ')} · ${profile.planningStyle}`} />
              <Preference icon={Compass} label="Experience fit" value={`${profile.socialStyle} · ${profile.budgetStyle}`} />
              <Preference icon={Sparkles} label="Sense of adventure" value={adventureLabel(profile.adventurousness)} />
              <Preference icon={Route} label="Access needs" value={profile.accessibilityNeeds.filter((need) => need !== 'None right now').join(' · ') || 'No needs noted'} />
            </div>
          ) : (
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm text-charcoal-light">Your earlier account does not have a completed recommendation profile yet.</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">Your interests will continue to shape invitations until preference editing is available for existing accounts.</p>
            </div>
          )}
        </section>
      </Reveal>

      {/* Story timeline */}
      <Reveal delay={160}>
        <p className="editorial-kicker text-[10px] tracking-[0.2em] uppercase mb-3">Your story</p>
        <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-3 leading-tight">A life, not a feed.</h2>
        <p className="text-sm text-charcoal-light mb-8 leading-relaxed max-w-md">
          Every experience you book becomes part of who you are. Not a highlight reel — a real
          story of curiosity, craft, and discovery.
        </p>
      </Reveal>

      {storyBookings.length === 0 ? (
        <Reveal>
          <div className="liquid-card text-center py-14 rounded-[28px]">
            <p className="font-serif text-xl text-charcoal mb-2">Your story is blank.</p>
            <p className="text-sm text-muted mb-6">Book an experience and it lives here forever.</p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 bg-charcoal text-cream px-6 py-3 rounded-full text-xs tracking-widest uppercase hover:bg-charcoal/85 transition-all duration-200 active:scale-95"
            >
              Find something extraordinary
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="relative">
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-5">
            {storyBookings.map((booking, i) => {
              const exp = experiences.find((e) => e.id === booking.experienceId)
              if (!exp) return null
              const host = hosts.find((h) => h.id === exp.hostId)
              if (!host) return null
              return (
                <Reveal key={booking.id} delay={i * 60}>
                  <div className="flex gap-4 relative">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-cream ring-1 ring-border">
                        <Image
                          src={exp.imageUrl || `https://picsum.photos/seed/${exp.imageSeed}/100/100`}
                          alt={exp.title}
                          width={44}
                          height={44}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <Link
                      href={`/experience/${exp.id}`}
                      className="liquid-card flex-1 rounded-[26px] p-4 hover:border-white/80 transition-all duration-200 group card-lift"
                    >
                      <LaneBadge lane={exp.lane} size="xs" />
                      <h3 className="font-serif text-base text-charcoal mt-2 group-hover:text-terracotta transition-colors duration-200 leading-snug">
                        {exp.title}
                      </h3>
                      <p className="text-[10px] tracking-widest uppercase text-muted mt-1">
                        {host.name} · {formatDate(exp.dateTime)}
                      </p>
                    </Link>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
