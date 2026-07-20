'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Map, Share2 } from 'lucide-react'
import type { Experience } from '@serendipity-hq/design'

type ShareStatus = 'idle' | 'shared' | 'copied' | 'error'

function buildShareUrl(experienceId: string) {
  if (typeof window === 'undefined') return `/experience/${experienceId}`
  return new URL(`/experience/${experienceId}`, window.location.origin).toString()
}

async function copyInvitation(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textArea)
  if (!copied) throw new Error('Copy failed')
}

export default function InvitationActions({
  experience,
  isLoggedIn,
  isOnPassionPath,
  onAddToPassionPath,
}: {
  experience: Experience
  isLoggedIn: boolean
  isOnPassionPath: boolean
  onAddToPassionPath: () => void
}) {
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle')

  useEffect(() => {
    if (shareStatus === 'idle') return
    const timeout = window.setTimeout(() => setShareStatus('idle'), 5000)
    return () => window.clearTimeout(timeout)
  }, [shareStatus])

  async function handleShare() {
    const url = buildShareUrl(experience.id)
    const formattedDate = new Date(experience.dateTime).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })
    const text = `Come with me to ${experience.title} on ${formattedDate}. ${url}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `An invitation to ${experience.title}`,
          text: `Come with me to ${experience.title} on ${formattedDate}.`,
          url,
        })
        setShareStatus('shared')
        return
      }

      await copyInvitation(text)
      setShareStatus('copied')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      try {
        await copyInvitation(text)
        setShareStatus('copied')
      } catch {
        setShareStatus('error')
      }
    }
  }

  const statusMessage = shareStatus === 'shared'
    ? 'Invitation shared.'
    : shareStatus === 'copied'
      ? 'Invitation link copied.'
      : shareStatus === 'error'
        ? 'We could not copy the invitation. Please copy the page address.'
        : ''

  return (
    <div className="mt-5 border-t border-white/50 pt-5">
      <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-muted">
        Make it yours
      </p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-charcoal/30 px-4 py-3 text-[10px] uppercase tracking-widest text-charcoal transition-colors hover:border-charcoal hover:bg-white/30 active:scale-[0.98]"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
          Invite a friend
        </button>

        {isOnPassionPath ? (
          <Link
            href="/passion-path"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-teal px-4 py-3 text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-teal/85 active:scale-[0.98]"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            On your Passion Path
          </Link>
        ) : isLoggedIn ? (
          <button
            type="button"
            onClick={onAddToPassionPath}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-charcoal px-4 py-3 text-[10px] uppercase tracking-widest text-cream transition-colors hover:bg-charcoal/85 active:scale-[0.98]"
          >
            <Map className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
            Add to Passion Path
          </button>
        ) : (
          <Link
            href="/login"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-charcoal px-4 py-3 text-[10px] uppercase tracking-widest text-cream transition-colors hover:bg-charcoal/85 active:scale-[0.98]"
          >
            <Map className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
            Sign in to save
          </Link>
        )}
      </div>
      <p
        className={`mt-3 min-h-4 text-center text-[10px] ${
          shareStatus === 'error' ? 'text-terracotta' : 'text-teal'
        }`}
        role="status"
        aria-live="polite"
      >
        {statusMessage}
      </p>
    </div>
  )
}
