'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, CreditCard, Wallet, QrCode } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PLATFORM_FEE_RATE } from '@/lib/constants'
import LaneBadge from '@/components/LaneBadge'

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function formatCents(cents: number) {
  return (cents / 100).toFixed(2)
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user, isLoggedIn, bookings, bookExperience, experiences, hosts } = useApp()
  const router = useRouter()

  const [selectedPmId, setSelectedPmId] = useState<string>('')
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [newBookingId, setNewBookingId] = useState<string>('')

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  useEffect(() => {
    if (user?.savedPaymentMethods.length) {
      setSelectedPmId(user.savedPaymentMethods[0].id)
    }
  }, [user])

  const experience = experiences.find((e) => e.id === id)
  if (!experience) return null

  const host = hosts.find((h) => h.id === experience.hostId)
  if (!host) return null
  const alreadyBooked = bookings.some(
    (b) => b.experienceId === id && b.status !== 'cancelled'
  )

  if (alreadyBooked) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-12 h-12 text-teal mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="font-serif text-2xl text-charcoal mb-2">Already booked</h1>
        <p className="text-charcoal-light mb-6">You&apos;ve already booked this experience.</p>
        <Link href="/bookings" className="text-terracotta hover:underline text-sm">
          View my bookings
        </Link>
      </div>
    )
  }

  const priceCents = Math.round(experience.price * 100)
  const feeCents = Math.round(priceCents * PLATFORM_FEE_RATE)
  const totalCents = priceCents + feeCents
  const hasEnoughFunds = user ? user.walletBalanceCents >= totalCents : false

  if (!user) return null

  function handleConfirm() {
    if (!selectedPmId || !hasEnoughFunds) return
    setConfirming(true)
    setTimeout(() => {
      const booking = bookExperience(id, priceCents)
      if (booking) {
        setNewBookingId(booking.id)
        setConfirmed(true)
      }
      setConfirming(false)
    }, 800)
  }

  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="liquid-card rounded-[28px] p-8 text-center">
          <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-teal" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl text-charcoal mb-2">You&apos;re in!</h1>
          <p className="text-charcoal-light mb-8">
            Your spot at <strong>{experience.title}</strong> is confirmed.
          </p>

          {/* Mock ticket */}
          <div className="liquid-panel border-2 border-dashed border-white/55 rounded-[28px] p-6 mb-8">
            <div className="relative aspect-[4/3] bg-white/35 rounded-xl overflow-hidden mb-4">
              <Image
                src={experience.imageUrl || `https://picsum.photos/seed/${experience.imageSeed}/600/450`}
                alt={experience.title}
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
            <LaneBadge lane={experience.lane} />
            <h2 className="font-serif text-xl text-charcoal mt-2 mb-1">{experience.title}</h2>
            <p className="text-sm text-muted mb-1">with {host.name}</p>
            <p className="text-sm text-muted">{formatDate(experience.dateTime)}</p>

            {/* QR placeholder */}
            <div className="mt-6 flex justify-center">
            <div className="border border-white/16 bg-white/8 rounded-xl p-4 flex flex-col items-center gap-2">
                <QrCode className="w-16 h-16 text-charcoal/60" strokeWidth={1} />
                <p className="text-xs text-muted font-mono">{newBookingId.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/bookings"
              className="w-full bg-terracotta text-white py-3.5 rounded-full font-medium text-center hover:bg-terracotta/90 transition-colors"
            >
              View my tickets
            </Link>
            <Link
              href="/home"
              className="text-sm text-charcoal-light hover:text-charcoal transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
      <Link
        href={`/experience/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-charcoal transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back to experience
      </Link>

      <h1 className="font-serif text-3xl text-charcoal mb-8">Confirm your booking</h1>

      {/* Experience summary */}
      <div className="liquid-card rounded-[28px] p-5 flex gap-4 mb-6">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-border/40 flex-shrink-0">
          <Image
            src={experience.imageUrl || `https://picsum.photos/seed/${experience.imageSeed}/200/200`}
            alt={experience.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <LaneBadge lane={experience.lane} size="xs" />
          <h3 className="font-serif text-lg text-charcoal mt-1 leading-snug">{experience.title}</h3>
          <p className="text-sm text-muted mt-0.5">
            {formatDate(experience.dateTime)} · {host.venue}
          </p>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="liquid-card rounded-[28px] p-5 mb-6 space-y-3">
        <h2 className="font-medium text-charcoal text-sm mb-4">Price breakdown</h2>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-light">Experience price</span>
          <span className="text-charcoal">${experience.price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-charcoal-light">Service fee</span>
            <span className="text-xs text-muted ml-1.5">
              ({Math.round(PLATFORM_FEE_RATE * 100)}%)
            </span>
          </div>
          <span className="text-charcoal">${formatCents(feeCents)}</span>
        </div>
        <div className="border-t border-white/50 pt-3 flex justify-between">
          <span className="font-medium text-charcoal">Total</span>
          <span className="font-serif text-lg text-charcoal">${formatCents(totalCents)}</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="liquid-card rounded-[28px] p-5 mb-6">
        <h2 className="font-medium text-charcoal text-sm mb-4">Pay with wallet</h2>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-terracotta" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-charcoal">Wallet balance</p>
            <p
              className={`text-sm font-serif ${hasEnoughFunds ? 'text-teal' : 'text-terracotta'}`}
            >
              ${formatCents(user.walletBalanceCents)}
            </p>
          </div>
        </div>

        {!hasEnoughFunds && (
          <div className="liquid-panel border border-terracotta/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-terracotta mb-2">
              Insufficient balance. You need ${formatCents(totalCents - user.walletBalanceCents)}{' '}
              more.
            </p>
            <Link
              href="/wallet"
              className="text-sm font-medium text-terracotta hover:underline"
            >
              Add funds to wallet →
            </Link>
          </div>
        )}

        {user.savedPaymentMethods.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted mb-2">Wallet funded by</p>
            {user.savedPaymentMethods.map((pm) => (
              <label
                key={pm.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedPmId === pm.id ? 'border-charcoal bg-charcoal/3' : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="pm"
                  value={pm.id}
                  checked={selectedPmId === pm.id}
                  onChange={() => setSelectedPmId(pm.id)}
                  className="accent-charcoal"
                />
                <CreditCard className="w-4 h-4 text-muted" strokeWidth={1.5} />
                <span className="text-sm text-charcoal">
                  {pm.brand} ···· {pm.last4}
                </span>
                <span className="text-xs text-muted ml-auto">{pm.expiry}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!hasEnoughFunds || confirming || !selectedPmId}
        className="w-full bg-terracotta text-white py-4 rounded-full font-medium text-base hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {confirming ? 'Confirming…' : `Confirm and pay $${formatCents(totalCents)}`}
      </button>
      <p className="text-xs text-muted text-center mt-3">
        Free cancellation up to 48 hours before the experience
      </p>
    </div>
  )
}
