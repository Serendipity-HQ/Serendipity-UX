'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CreditCard, ArrowUpRight, ArrowDownLeft, RotateCcw } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import type { Experience, Transaction } from '@/lib/types'

const PRESET_AMOUNTS = [25, 50, 100, 200]

function formatCents(cents: number) {
  return (cents / 100).toFixed(2)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function TxnRow({ txn, experiences }: { txn: Transaction; experiences: Experience[] }) {
  const exp = txn.experienceId ? experiences.find((e) => e.id === txn.experienceId) : null

  if (txn.type === 'topup') {
    return (
      <div className="flex items-center gap-3 py-4 border-b border-border last:border-0">
        <div className="w-9 h-9 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
          <ArrowDownLeft className="w-4 h-4 text-teal" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal">{txn.description}</p>
          <p className="text-xs text-muted">{formatDate(txn.createdAt)}</p>
        </div>
        <span className="text-sm font-medium text-teal">+${formatCents(txn.amountCents)}</span>
      </div>
    )
  }

  if (txn.type === 'refund') {
    return (
      <div className="flex items-center gap-3 py-4 border-b border-border last:border-0">
        <div className="w-9 h-9 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
          <RotateCcw className="w-4 h-4 text-teal" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal">{txn.description}</p>
          {exp && <p className="text-xs text-muted truncate">{exp.title}</p>}
          <p className="text-xs text-muted">{formatDate(txn.createdAt)}</p>
        </div>
        <span className="text-sm font-medium text-teal">+${formatCents(txn.amountCents)}</span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 py-4 border-b border-border last:border-0">
      <div className="w-9 h-9 bg-terracotta/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <ArrowUpRight className="w-4 h-4 text-terracotta" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal truncate">
          {exp ? exp.title : 'Experience booking'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {txn.hostPayoutCents !== undefined && (
            <span className="text-xs text-muted">
              ${formatCents(txn.hostPayoutCents)} to host
            </span>
          )}
          {txn.platformFeeCents !== undefined && (
            <>
              <span className="text-xs text-muted">·</span>
              <span className="text-xs text-muted">
                ${formatCents(txn.platformFeeCents)} platform fee
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-muted">{formatDate(txn.createdAt)}</p>
      </div>
      <span className="text-sm font-medium text-terracotta">
        −${formatCents(txn.amountCents)}
      </span>
    </div>
  )
}

function AddCardModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (last4: string, brand: string, expiry: string) => void
}) {
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [name, setName] = useState('')

  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const digits = number.replace(/\s/g, '')
    if (digits.length < 16 || !expiry || !name) return
    const last4 = digits.slice(-4)
    const firstDigit = digits[0]
    const brand = firstDigit === '4' ? 'Visa' : firstDigit === '5' ? 'Mastercard' : 'Card'
    onAdd(last4, brand, expiry)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="liquid-card rounded-[28px] p-6 w-full max-w-sm">
        <h2 className="font-serif text-xl text-charcoal mb-6">Add payment method</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-charcoal-light mb-1.5">Card number</label>
            <input
              type="text"
              inputMode="numeric"
              value={number}
              onChange={(e) => setNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-charcoal placeholder-muted focus:outline-none focus:border-charcoal font-mono"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-charcoal-light mb-1.5">Expiry</label>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-charcoal placeholder-muted focus:outline-none focus:border-charcoal font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal-light mb-1.5">CVC</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000"
                maxLength={4}
                className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-charcoal placeholder-muted focus:outline-none focus:border-charcoal font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-charcoal-light mb-1.5">Name on card</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-charcoal placeholder-muted focus:outline-none focus:border-charcoal"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border text-charcoal-light py-3 rounded-full text-sm hover:bg-border/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-terracotta text-white py-3 rounded-full text-sm font-medium hover:bg-terracotta/90"
            >
              Add card
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddFundsSheet({
  paymentMethods,
  onClose,
  onAdd,
}: {
  paymentMethods: { id: string; last4: string; brand: string }[]
  onClose: () => void
  onAdd: (amountCents: number, pmId: string) => void
}) {
  const [amount, setAmount] = useState<number | ''>('')
  const [selectedPm, setSelectedPm] = useState(paymentMethods[0]?.id ?? '')
  const [showAddCard, setShowAddCard] = useState(false)

  const cents = typeof amount === 'number' ? Math.round(amount * 100) : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cents || !selectedPm) return
    onAdd(cents, selectedPm)
    onClose()
  }

  if (paymentMethods.length === 0 && !showAddCard) {
    return (
      <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
        <div className="liquid-card rounded-[28px] p-6 w-full max-w-sm text-center">
          <p className="font-serif text-xl text-charcoal mb-3">No payment methods</p>
          <p className="text-sm text-charcoal-light mb-6">
            Add a card first to top up your wallet.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-border text-charcoal-light py-3 rounded-full text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowAddCard(true)}
              className="flex-1 bg-terracotta text-white py-3 rounded-full text-sm font-medium"
            >
              Add card
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="liquid-card rounded-[28px] p-6 w-full max-w-sm">
        <h2 className="font-serif text-xl text-charcoal mb-6">Add funds</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-sm text-charcoal-light mb-3">Choose an amount</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {PRESET_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`py-2.5 rounded-xl text-sm border transition-all ${
                    amount === a
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'border-border text-charcoal-light hover:border-charcoal/30'
                  }`}
                >
                  ${a}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light">$</span>
              <input
                type="number"
                min="1"
                max="500"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="Custom amount"
                className="w-full bg-cream border border-border rounded-xl pl-8 pr-4 py-3 text-charcoal placeholder-muted focus:outline-none focus:border-charcoal"
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-charcoal-light mb-2">Pay with</p>
            <div className="space-y-2">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                    selectedPm === pm.id ? 'border-charcoal' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="addFundsPm"
                    value={pm.id}
                    checked={selectedPm === pm.id}
                    onChange={() => setSelectedPm(pm.id)}
                    className="accent-charcoal"
                  />
                  <CreditCard className="w-4 h-4 text-muted" strokeWidth={1.5} />
                  <span className="text-sm text-charcoal">
                    {pm.brand} ···· {pm.last4}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border text-charcoal-light py-3 rounded-full text-sm hover:bg-border/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!cents || !selectedPm}
              className="flex-1 bg-terracotta text-white py-3 rounded-full text-sm font-medium hover:bg-terracotta/90 disabled:opacity-40"
            >
              Add {cents ? `$${(cents / 100).toFixed(0)}` : 'funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function WalletPage() {
  const { user, isLoggedIn, transactions, experiences, addFunds, addPaymentMethod, removePaymentMethod } =
    useApp()
  const router = useRouter()
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [activeTab, setActiveTab] = useState<'history' | 'methods'>('history')

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  if (!user) return null

  return (
    <div className="max-w-xl mx-auto px-5 py-10 md:py-14">
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Finances</p>
      <h1 className="font-serif text-3xl text-charcoal mb-8">Wallet.</h1>

      {/* Balance card */}
      <div className="liquid-card text-cream rounded-[30px] p-6 md:p-8 mb-6 relative overflow-hidden bg-charcoal/88">
        <div className="absolute inset-0 border border-white/10 rounded-[14px]" />
        <p className="text-[10px] tracking-[0.2em] uppercase text-sand/40 mb-2 relative">Available balance</p>
        <p className="font-serif text-5xl mb-6 relative">
          ${formatCents(user.walletBalanceCents)}
        </p>
        <button
          onClick={() => setShowAddFunds(true)}
          className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 text-cream px-5 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all duration-200 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Add funds
        </button>
      </div>

      {/* Tabs */}
      <div className="border border-white/16 bg-white/8 flex gap-1 rounded-full p-1 mb-6">
        {(['history', 'methods'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-200 ${
              activeTab === tab ? 'bg-white/78 text-[#18352F] shadow-sm' : 'text-muted hover:text-charcoal'
            }`}
          >
            {tab === 'history' ? 'History' : 'Cards'}
          </button>
        ))}
      </div>

      {activeTab === 'history' && (
        <div className="liquid-card rounded-[28px] overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-charcoal-light text-sm">No transactions yet.</p>
            </div>
          ) : (
            <div className="px-5">
              {transactions.map((txn) => (
                <TxnRow key={txn.id} txn={txn} experiences={experiences} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'methods' && (
        <div className="space-y-3">
          {user.savedPaymentMethods.length === 0 ? (
            <div className="liquid-card rounded-[28px] p-8 text-center">
              <p className="text-charcoal-light text-sm">No saved cards.</p>
            </div>
          ) : (
            user.savedPaymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="liquid-card rounded-[26px] p-4 flex items-center gap-3 card-lift"
              >
                <div className="w-10 h-10 bg-border/40 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-muted" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">
                    {pm.brand} ···· {pm.last4}
                  </p>
                  <p className="text-xs text-muted">Expires {pm.expiry}</p>
                </div>
                <button
                  onClick={() => removePaymentMethod(pm.id)}
                  className="p-2 text-muted hover:text-terracotta transition-colors rounded-lg hover:bg-terracotta/5"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ))
          )}

          <button
            onClick={() => setShowAddCard(true)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-border text-charcoal-light py-4 rounded-2xl text-sm hover:border-charcoal/40 hover:text-charcoal transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add payment method
          </button>
        </div>
      )}

      {showAddFunds && (
        <AddFundsSheet
          paymentMethods={user.savedPaymentMethods}
          onClose={() => setShowAddFunds(false)}
          onAdd={(amountCents, pmId) => addFunds(amountCents, pmId)}
        />
      )}

      {showAddCard && (
        <AddCardModal
          onClose={() => setShowAddCard(false)}
          onAdd={(last4, brand, expiry) => addPaymentMethod(last4, brand, expiry)}
        />
      )}
    </div>
  )
}
