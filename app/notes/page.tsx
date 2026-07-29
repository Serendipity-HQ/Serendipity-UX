'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { X, ImageIcon, PenLine } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import type { Experience, Post } from '@serendipity-hq/design'
import { LaneBadge, Reveal } from '@serendipity-hq/ui'

function formatEntryDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

function EntryCard({ post, experiences }: {
  post: Post
  experiences: Experience[]
}) {
  const exp = post.experienceId ? experiences.find((e) => e.id === post.experienceId) : null

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
          <span className="text-[10px] tracking-wide text-muted/60 italic">Private reflection</span>
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
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') setPhotoPreview(reader.result)
    })
    reader.readAsDataURL(file)
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-entry-title"
        className="liquid-card rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 id="new-entry-title" className="font-serif text-xl text-charcoal">New entry</h2>
            <p className="text-[10px] tracking-widest uppercase text-muted mt-1">
              {formatEntryDate(new Date().toISOString())}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close new entry" className="mt-1 flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-charcoal transition-colors">
            <X className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {/* Photo */}
        {photoPreview ? (
          <div className="relative mx-6 mb-1 aspect-[4/3] rounded-xl overflow-hidden bg-parchment">
            <Image src={photoPreview} alt="" fill className="object-cover" sizes="576px" />
            <button
              type="button"
              onClick={removePhoto}
              aria-label="Remove photo"
              className="absolute top-2 right-2 flex min-h-11 min-w-11 items-center justify-center bg-charcoal/60 hover:bg-charcoal text-white rounded-full transition-colors"
            >
              <X className="w-3 h-3" aria-hidden="true" />
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
                aria-label={`Detach ${selectedExpObj.title}`}
                className="ml-auto flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-charcoal transition-colors"
              >
                <X className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
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
  const { user, isLoggedIn, posts, createPost, experiences } = useApp()
  const router = useRouter()
  const [showWrite, setShowWrite] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  if (!user) return null

  const diaryPosts = [...posts]
    .filter((p) => p.authorId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="max-w-xl mx-auto px-5 py-10 md:py-14">
      {/* Header */}
      <Reveal>
        <div className="flex items-start justify-between gap-5 mb-1">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted">Only you can see this</p>
            <h1 className="font-serif text-3xl text-charcoal">Journal.</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal-light">
              Hold on to what changed, surprised, or stayed with you. Your reflections are private.
            </p>
          </div>
          <button
            onClick={() => setShowWrite(true)}
            className="flex min-h-11 shrink-0 items-center gap-2 text-[10px] tracking-widest uppercase text-muted hover:text-charcoal transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
            New entry
          </button>
        </div>
      </Reveal>

      <Reveal delay={50}>
        <div className="my-8 border-b border-border" />
      </Reveal>

      {/* Empty states */}
      {diaryPosts.length === 0 ? (
        <Reveal>
          <div className="liquid-card text-center py-16 px-8 rounded-[28px]">
            <p className="font-serif text-xl text-charcoal mb-2">Your journal is blank.</p>
            <p className="text-sm text-muted mb-6 max-w-xs mx-auto leading-relaxed">
              Begin with a moment, a question, or something you want to remember.
            </p>
            <button
              onClick={() => setShowWrite(true)}
              className="min-h-11 text-xs tracking-widest uppercase text-terracotta link-underline"
            >
              Write your first entry
            </button>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-5">
          {diaryPosts.map((post, i) => (
            <Reveal key={post.id} delay={i * 50}>
              <EntryCard
                post={post}
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
