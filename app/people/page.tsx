'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { SEED_USERS } from '@/lib/mock-data'
import { Reveal } from '@serendipity-hq/ui'

function PersonCard({ seedUser, isFollowing, isMutual, onFollow, onUnfollow }: {
  seedUser: typeof SEED_USERS[0]
  isFollowing: boolean
  isMutual: boolean
  onFollow: () => void
  onUnfollow: () => void
}) {
  return (
    <div className="liquid-card rounded-[26px] p-4 flex items-center gap-4 card-lift">
      <Link href={`/people/${seedUser.id}`} className="flex-shrink-0">
        <Image
          src={`https://picsum.photos/seed/${seedUser.avatarSeed}/100/100`}
          alt={seedUser.name}
          width={48}
          height={48}
          className="rounded-full object-cover ring-1 ring-border hover:ring-sand transition-all"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/people/${seedUser.id}`} className="block">
          <p className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors link-underline inline">
            {seedUser.name}
          </p>
          {isMutual && (
            <span className="ml-2 text-[9px] tracking-widest uppercase text-teal border border-teal/20 bg-teal/5 rounded-full px-2 py-0.5">
              Mutual
            </span>
          )}
        </Link>
        <p className="text-xs text-muted mt-0.5 truncate">{seedUser.bio}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {seedUser.interests.slice(0, 3).map((i) => (
            <span key={i} className="border border-white/16 bg-white/8 text-[9px] tracking-wide text-muted rounded-full px-2 py-0.5">
              {i}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={isFollowing ? onUnfollow : onFollow}
        className={`flex-shrink-0 text-[10px] tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-200 active:scale-95 ${
          isFollowing
            ? 'border-border text-muted hover:border-terracotta hover:text-terracotta'
            : 'bg-charcoal text-cream border-charcoal hover:bg-charcoal/85'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

export default function PeoplePage() {
  const { user, isLoggedIn, connections, follow, unfollow, isFollowing, isFollowedBy } = useApp()
  const router = useRouter()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  if (!user) return null

  const filtered = SEED_USERS.filter((su) => {
    if (!query) return true
    const q = query.toLowerCase()
    return su.name.toLowerCase().includes(q) || su.interests.some((i) => i.toLowerCase().includes(q))
  })

  const followingIds = connections.filter((c) => c.fromId === user.id).map((c) => c.toId)
  const following = filtered.filter((u) => followingIds.includes(u.id))
  const suggestions = filtered.filter((u) => !followingIds.includes(u.id))

  return (
    <div className="max-w-xl mx-auto px-5 py-10 md:py-14">
      <Reveal>
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2">Community</p>
        <h1 className="font-serif text-3xl text-charcoal mb-8">People.</h1>
      </Reveal>

      {/* Search */}
      <Reveal delay={60}>
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name or interest…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-white/16 bg-white/8 w-full rounded-full pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:border-white/80 transition-colors duration-200"
          />
        </div>
      </Reveal>

      {/* Following */}
      {following.length > 0 && (
        <div className="mb-8">
          <Reveal>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-4">
              Following · {following.length}
            </p>
          </Reveal>
          <div className="space-y-3">
            {following.map((su, i) => (
              <Reveal key={su.id} delay={i * 40}>
                <PersonCard
                  seedUser={su}
                  isFollowing={isFollowing(su.id)}
                  isMutual={isFollowedBy(su.id)}
                  onFollow={() => follow(su.id)}
                  onUnfollow={() => unfollow(su.id)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <Reveal>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-4">
              {query ? 'Results' : 'Suggested people'}
            </p>
          </Reveal>
          <div className="space-y-3">
            {suggestions.map((su, i) => (
              <Reveal key={su.id} delay={i * 40}>
                <PersonCard
                  seedUser={su}
                  isFollowing={isFollowing(su.id)}
                  isMutual={isFollowedBy(su.id)}
                  onFollow={() => follow(su.id)}
                  onUnfollow={() => unfollow(su.id)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="liquid-card text-center py-16 rounded-[28px]">
          <p className="font-serif text-xl text-charcoal mb-2">Nobody found.</p>
          <p className="text-sm text-muted">Try a different name or interest.</p>
        </div>
      )}
    </div>
  )
}
