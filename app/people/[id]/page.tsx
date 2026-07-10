'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { SEED_USERS, EXPERIENCES, SEED_POSTS } from '@/lib/mock-data'
import LaneBadge from '@/components/LaneBadge'
import Reveal from '@/components/Reveal'

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function PersonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { follow, unfollow, isFollowing, isFollowedBy, user: currentUser } = useApp()

  const person = SEED_USERS.find((u) => u.id === id)
  if (!person) notFound()

  const following = isFollowing(id)
  const mutual = isFollowedBy(id)

  const attendedExps = person.attendedExperienceIds
    .map((eid) => EXPERIENCES.find((e) => e.id === eid))
    .filter(Boolean)

  const personPosts = SEED_POSTS.filter((p) => p.authorId === id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="max-w-xl mx-auto px-5 py-10 md:py-14">
      <Reveal fade>
        <Link
          href="/people"
          className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted hover:text-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          People
        </Link>
      </Reveal>

      {/* Profile header */}
      <Reveal>
        <div className="liquid-card rounded-[28px] p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <Image
                src={`https://picsum.photos/seed/${person.avatarSeed}/200/200`}
                alt={person.name}
                width={64}
                height={64}
                className="rounded-full object-cover ring-2 ring-border"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl text-charcoal">{person.name}</h1>
                  {mutual && (
                    <span className="text-[9px] tracking-widest uppercase text-teal border border-teal/20 bg-teal/5 rounded-full px-2 py-0.5">
                      Mutual
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {attendedExps.length} experience{attendedExps.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {currentUser && (
              <button
                onClick={() => following ? unfollow(id) : follow(id)}
                className={`flex-shrink-0 text-[10px] tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-200 active:scale-95 ${
                  following
                    ? 'border-border text-muted hover:border-terracotta hover:text-terracotta'
                    : 'bg-charcoal text-cream border-charcoal hover:bg-charcoal/85'
                }`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <p className="text-sm text-charcoal-light leading-relaxed mb-4">{person.bio}</p>

          <div className="flex flex-wrap gap-2">
            {person.interests.map((tag) => (
              <span key={tag} className="border border-white/16 bg-white/8 text-[9px] tracking-widest uppercase text-muted rounded-full px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Story — experiences attended */}
      {attendedExps.length > 0 && (
        <div className="mb-8">
          <Reveal>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-4">Their story</p>
          </Reveal>
          <div className="relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {attendedExps.map((exp, i) => {
                if (!exp) return null
                return (
                  <Reveal key={exp.id} delay={i * 50}>
                    <div className="flex gap-4 relative">
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-cream ring-1 ring-border">
                          <Image src={`https://picsum.photos/seed/${exp.imageSeed}/100/100`} alt={exp.title} width={44} height={44} className="object-cover" />
                        </div>
                      </div>
                      <Link
                        href={`/experience/${exp.id}`}
                        className="liquid-card flex-1 rounded-[26px] p-4 hover:border-white/80 transition-all duration-200 group card-lift"
                      >
                        <LaneBadge lane={exp.lane} size="xs" />
                        <h3 className="font-serif text-sm text-charcoal mt-1.5 group-hover:text-terracotta transition-colors leading-snug">{exp.title}</h3>
                      </Link>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Their diary */}
      {personPosts.length > 0 && (
        <div>
          <Reveal>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-4">Their diary</p>
          </Reveal>
          <div className="space-y-4">
            {personPosts.map((post, i) => {
              const exp = post.experienceId ? EXPERIENCES.find((e) => e.id === post.experienceId) : null
              return (
                <Reveal key={post.id} delay={i * 50}>
                  <article className="liquid-card rounded-[28px] overflow-hidden">
                    {post.photo && (
                      <div className="relative aspect-[4/3] bg-parchment">
                        <Image src={post.photo} alt="" fill className="object-cover" sizes="576px" />
                      </div>
                    )}
                    <div className="p-5">
                      {exp && (
                        <Link href={`/experience/${exp.id}`} className="inline-flex items-center gap-2 mb-4 group">
                          <LaneBadge lane={exp.lane} size="xs" />
                          <span className="text-[10px] tracking-widest uppercase text-muted group-hover:text-charcoal transition-colors truncate">{exp.title}</span>
                        </Link>
                      )}
                      <p className="font-serif text-[15px] text-charcoal leading-[1.75] mb-4">{post.content}</p>
                      <p className="text-[10px] tracking-wide text-muted pt-3 border-t border-white/50">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
