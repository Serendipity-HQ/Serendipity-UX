'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { X, ImageIcon, PenLine } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { SEED_USERS } from '@/lib/mock-data'
import type { Experience, Post } from '@serendipity-hq/design'
import { LaneBadge, Reveal } from '@serendipity-hq/ui'

function formatEntryDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

function getAuthorName(authorId: string, userId: string, userName: string) {
  if (authorId === userId) return userName
  return SEED_USERS.find((u) => u.id === authorId)?.name ?? 'Someone'
}

function getAuthorSeed(authorId: string, userId: string) {
  if (authorId === userId) return `profile-${userId}`
  return SEED_USERS.find((u) => u.id === authorId)?.avatarSeed ?? '000'
}

function EntryCard({ post, currentUserId, currentUserName, showAuthor, experiences }: {
  post: Post
  currentUserId: string
  currentUserName: string
  showAuthor: boolean
  experiences: Experience[]
}) {
  const exp = post.experienceId ? experiences.find((e) => e.id === post.experienceId) : null
  const authorName = getAuthorName(post.authorId, currentUserId, currentUserName)
  const avatarSeed = getAuthorSeed(post.authorId, currentUserId)
  const isOwn = post.authorId === currentUserId

  return (
    <article className="liquid-card rounded-[28px] overflow-hidden">
      {/* Optional photo */}
      {post.photo && (
        <div className="relative aspect-[4/3] bg-parchment">
          <Image
            src={post.photo}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 576px"
          />
        </div>
      )}

      <div className="p-6">
        {/* Experience anchor */}
        {exp && (
          <Link
            href={`/experience/${exp.id}`}
            className="group inline-flex items-center gap-2 mb-5"
          >
            <LaneBadge lane={exp.lane} size="xs" />
            <span className="text-[10px] tracking-widest uppercase text-muted group-hover:text-charcoal transition-colors truncate max-w-[220px]">
              {exp.title}
            </span>
          </Link>
        )}

        {/* Journal text */}
        <p className="font-serif text-[15px] text-charcoal leading-[1.75] mb-5">
          {post.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/50">
          {showAuthor ? (
            <Link
              href={isOwn ? '/profile' : `/people/${post.authorId}`}
              className="flex items-center gap-2 group"
            >
              <Image
                src={`https://picsum.photos/seed/${avatarSeed}/80/80`}
                alt={authorName}
                width={20}
                height={20}
                className="rounded-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <span className="text-[10px] tracking-wide text-muted group-hover:text-charcoal transition-colors">
                {authorName}
              </span>
            </Link>
          ) : (
            <span className="text-[10px] tracking-wide text-muted/60 italic">Your diary</span>
          )}
          <time className="text-[10px] tracking-wide text-muted">
            {formatEntryDate(post.createdAt)}
          </time>
        </div>
      </div>
    </article>
  )
}

function WriteEntryModal({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (content: string, experienceId: string | null, photo?: string) => void
}) {
  const { bookings, experiences } = useApp()
  const [content, setContent] = useState('')
  const [selectedExp, setSelectedExp] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showExpPicker, setShowExpPicker] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const bookedExps = bookings
    .filter((b) => b.status !== 'cancelled')
    .map((b) => experiences.find((e) => e.id === b.experienceId))
    .filter(Boolean)

  const selectedExpObj = selectedExp ? experiences.find((e) => e.id === selectedExp) : null

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  function removePhoto() {
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit(content.trim(), selectedExp, photoPreview ?? undefined)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <form
        onSubmit={handleSubmit}
        className="liquid-card rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="font-serif text-xl text-charcoal">New entry</h2>
            <p className="text-[10px] tracking-widest uppercase text-muted mt-1">
              {formatEntryDate(new Date().toISOString())}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-charcoal transition-colors mt-1">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Photo */}
        {photoPreview ? (
          <div className="relative mx-6 mb-1 aspect-[4/3] rounded-xl overflow-hidden bg-parchment">
            <Image src={photoPreview} alt="" fill className="object-cover" sizes="576px" />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 bg-charcoal/60 hover:bg-charcoal text-white rounded-full p-1.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="px-6 mb-1">
            <label className="inline-flex items-center gap-2 cursor-pointer text-[10px] tracking-widest uppercase text-muted hover:text-charcoal transition-colors">
              <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              Add photo
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
        )}

        {/* Text area */}
        <div className="px-6 pt-3 pb-2">
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What stayed with you?"
            rows={6}
            className="w-full bg-transparent font-serif text-[15px] text-charcoal placeholder-muted/50 focus:outline-none resize-none leading-[1.75]"
          />
        </div>

        {/* Experience anchor */}
        <div className="px-6 pb-2">
          {selectedExpObj ? (
            <div className="flex items-center gap-2">
              <LaneBadge lane={selectedExpObj.lane} size="xs" />
              <span className="text-[10px] tracking-widest uppercase text-charcoal-light truncate max-w-[200px]">
                {selectedExpObj.title}
              </span>
              <button
                type="button"
                onClick={() => setSelectedExp(null)}
                className="text-muted hover:text-charcoal transition-colors ml-auto"
              >
                <X className="w-3 h-3" strokeWidth={1.5} />
              </button>
            </div>
          ) : bookedExps.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowExpPicker((v) => !v)}
              className="text-[10px] tracking-widest uppercase text-muted hover:text-charcoal transition-colors"
            >
              {showExpPicker ? '↑ hide' : '+ attach an experience'}
            </button>
          ) : null}

          {showExpPicker && !selectedExpObj && (
            <div className="flex flex-wrap gap-2 mt-3">
              {bookedExps.map((exp) => exp && (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => { setSelectedExp(exp.id); setShowExpPicker(false) }}
                  className="border border-white/16 bg-white/8 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-charcoal-light hover:border-white/80 transition-all duration-200"
                >
                  <LaneBadge lane={exp.lane} size="xs" />
                  <span className="truncate max-w-[140px]">{exp.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-5 border-t border-white/50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-border text-muted py-3 rounded-full text-[10px] tracking-widest uppercase hover:bg-border/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!content.trim()}
            className="flex-1 bg-charcoal text-cream py-3 rounded-full text-[10px] tracking-widest uppercase hover:bg-charcoal/85 transition-colors disabled:opacity-30"
          >
            Save to diary
          </button>
        </div>
      </form>
    </div>
  )
}

export default function JournalPage() {
  const { user, isLoggedIn, posts, connections, createPost, experiences } = useApp()
  const router = useRouter()
  const [tab, setTab] = useState<'diary' | 'field-notes'>('diary')
  const [showWrite, setShowWrite] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  if (!user) return null

  const followingIds = connections.filter((c) => c.fromId === user.id).map((c) => c.toId)

  const diaryPosts = [...posts]
    .filter((p) => p.authorId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const fieldNotesPosts = [...posts]
    .filter((p) => followingIds.includes(p.authorId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const displayed = tab === 'diary' ? diaryPosts : fieldNotesPosts

  return (
    <div className="max-w-xl mx-auto px-5 py-10 md:py-14">
      {/* Header */}
      <Reveal>
        <div className="flex items-end justify-between mb-1">
          <h1 className="font-serif text-3xl text-charcoal">Journal.</h1>
          {tab === 'diary' && (
            <button
              onClick={() => setShowWrite(true)}
              className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted hover:text-charcoal transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" strokeWidth={1.5} />
              New entry
            </button>
          )}
        </div>
      </Reveal>

      {/* Tabs */}
      <Reveal delay={50}>
        <div className="flex border-b border-border mt-6 mb-8">
          {(['diary', 'field-notes'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 mr-7 text-[10px] tracking-widest uppercase transition-all duration-200 border-b-2 -mb-px ${
                tab === t
                  ? 'border-charcoal text-charcoal'
                  : 'border-transparent text-muted hover:text-charcoal-light'
              }`}
            >
              {t === 'diary' ? 'Diary' : 'Field Notes'}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Empty states */}
      {displayed.length === 0 ? (
        <Reveal>
          <div className="liquid-card text-center py-16 px-8 rounded-[28px]">
            {tab === 'diary' ? (
              <>
                <p className="font-serif text-xl text-charcoal mb-2">Your diary is blank.</p>
                <p className="text-sm text-muted mb-6 max-w-xs mx-auto leading-relaxed">
                  Every experience is worth a reflection. Start with one.
                </p>
                <button
                  onClick={() => setShowWrite(true)}
                  className="text-xs tracking-widest uppercase text-terracotta link-underline"
                >
                  Write your first entry
                </button>
              </>
            ) : (
              <>
                <p className="font-serif text-xl text-charcoal mb-2">No field notes yet.</p>
                <p className="text-sm text-muted mb-6 max-w-xs mx-auto leading-relaxed">
                  Follow people to see their entries here.
                </p>
                <Link
                  href="/people"
                  className="text-xs tracking-widest uppercase text-terracotta link-underline"
                >
                  Find people
                </Link>
              </>
            )}
          </div>
        </Reveal>
      ) : (
        <div className="space-y-5">
          {displayed.map((post, i) => (
            <Reveal key={post.id} delay={i * 50}>
              <EntryCard
                post={post}
                currentUserId={user.id}
                currentUserName={user.name}
                showAuthor={tab === 'field-notes'}
                experiences={experiences}
              />
            </Reveal>
          ))}
        </div>
      )}

      {showWrite && (
        <WriteEntryModal
          onClose={() => setShowWrite(false)}
          onSubmit={(content, expId, photo) => createPost(content, expId, photo)}
        />
      )}
    </div>
  )
}
