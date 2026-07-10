'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User, Transaction, Booking, Post, Connection, Experience, Host } from '@/lib/types'
import {
  DEMO_USER,
  DEMO_TRANSACTIONS,
  DEMO_BOOKINGS,
  SEED_CONNECTIONS,
  SEED_POSTS,
  EXPERIENCES,
  HOSTS,
} from '@/lib/mock-data'
import { PLATFORM_FEE_RATE } from '@/lib/constants'

type AppState = {
  user: User | null
  transactions: Transaction[]
  bookings: Booking[]
  connections: Connection[]
  posts: Post[]
  experiences: Experience[]
  hosts: Host[]
  eventsSource: 'supabase' | 'mock'
  isLoggedIn: boolean
  login: (email: string, _password: string, userData?: Partial<User>) => void
  logout: () => void
  addFunds: (amountCents: number, paymentMethodId: string) => void
  bookExperience: (experienceId: string, priceCents: number) => Booking | null
  cancelBooking: (bookingId: string) => void
  addPaymentMethod: (last4: string, brand: string, expiry: string) => void
  removePaymentMethod: (pmId: string) => void
  updateUserInterests: (interests: string[]) => void
  updateUserBio: (bio: string) => void
  follow: (targetId: string) => void
  unfollow: (targetId: string) => void
  isFollowing: (targetId: string) => boolean
  isFollowedBy: (targetId: string) => boolean
  createPost: (content: string, experienceId: string | null, photo?: string) => void
  resonatePost: (postId: string) => void
}

const AppContext = createContext<AppState | null>(null)

const STORAGE_KEYS = {
  user: 'serendipity_user',
  transactions: 'serendipity_transactions',
  bookings: 'serendipity_bookings',
  connections: 'serendipity_connections',
  posts: 'serendipity_posts',
  loggedIn: 'serendipity_logged_in',
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [experiences, setExperiences] = useState<Experience[]>(EXPERIENCES)
  const [hosts, setHosts] = useState<Host[]>(HOSTS)
  const [eventsSource, setEventsSource] = useState<'supabase' | 'mock'>('mock')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/experiences')
      .then((response) => response.json())
      .then((payload: { experiences?: Experience[]; hosts?: Host[]; source?: 'supabase' | 'mock' }) => {
        if (cancelled) return
        if (payload.experiences?.length) setExperiences(payload.experiences)
        if (payload.hosts?.length) setHosts(payload.hosts)
        if (payload.source) setEventsSource(payload.source)
      })
      .catch(() => {
        if (!cancelled) setEventsSource('mock')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const loggedIn = load<boolean>(STORAGE_KEYS.loggedIn, false)
    setIsLoggedIn(loggedIn)
    if (loggedIn) {
      setUser(load<User>(STORAGE_KEYS.user, DEMO_USER))
      setTransactions(load<Transaction[]>(STORAGE_KEYS.transactions, DEMO_TRANSACTIONS))
      setBookings(load<Booking[]>(STORAGE_KEYS.bookings, DEMO_BOOKINGS))
      setConnections(load<Connection[]>(STORAGE_KEYS.connections, SEED_CONNECTIONS))
      setPosts(load<Post[]>(STORAGE_KEYS.posts, SEED_POSTS))
    }
    setHydrated(true)
  }, [])

  const persistUser = useCallback((u: User) => { setUser(u); save(STORAGE_KEYS.user, u) }, [])
  const persistTransactions = useCallback((t: Transaction[]) => { setTransactions(t); save(STORAGE_KEYS.transactions, t) }, [])
  const persistBookings = useCallback((b: Booking[]) => { setBookings(b); save(STORAGE_KEYS.bookings, b) }, [])
  const persistConnections = useCallback((c: Connection[]) => { setConnections(c); save(STORAGE_KEYS.connections, c) }, [])
  const persistPosts = useCallback((p: Post[]) => { setPosts(p); save(STORAGE_KEYS.posts, p) }, [])

  const login = useCallback(
    (email: string, _password: string, userData?: Partial<User>) => {
      const newUser: User = {
        ...DEMO_USER,
        email,
        name: userData?.name ?? DEMO_USER.name,
        interests: userData?.interests ?? DEMO_USER.interests,
        walletBalanceCents: DEMO_USER.walletBalanceCents,
        savedPaymentMethods: DEMO_USER.savedPaymentMethods,
      }
      persistUser(newUser)
      persistTransactions(load<Transaction[]>(STORAGE_KEYS.transactions, DEMO_TRANSACTIONS))
      persistBookings(load<Booking[]>(STORAGE_KEYS.bookings, DEMO_BOOKINGS))
      persistConnections(load<Connection[]>(STORAGE_KEYS.connections, SEED_CONNECTIONS))
      persistPosts(load<Post[]>(STORAGE_KEYS.posts, SEED_POSTS))
      setIsLoggedIn(true)
      save(STORAGE_KEYS.loggedIn, true)
    },
    [persistUser, persistTransactions, persistBookings, persistConnections, persistPosts]
  )

  const logout = useCallback(() => {
    setUser(null); setTransactions([]); setBookings([])
    setConnections([]); setPosts([]); setIsLoggedIn(false)
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
  }, [])

  const addFunds = useCallback(
    (amountCents: number, paymentMethodId: string) => {
      if (!user) return
      const pm = user.savedPaymentMethods.find((p) => p.id === paymentMethodId)
      const txn: Transaction = {
        id: `t${Date.now()}`, userId: user.id, type: 'topup', amountCents,
        description: `Added funds via ${pm ? pm.brand + ' ···' + pm.last4 : 'card'}`,
        createdAt: new Date().toISOString(),
      }
      persistUser({ ...user, walletBalanceCents: user.walletBalanceCents + amountCents })
      persistTransactions([txn, ...transactions])
    },
    [user, transactions, persistUser, persistTransactions]
  )

  const bookExperience = useCallback(
    (experienceId: string, priceCents: number): Booking | null => {
      if (!user) return null
      const platformFeeCents = Math.round(priceCents * PLATFORM_FEE_RATE)
      const totalCents = priceCents + platformFeeCents
      if (user.walletBalanceCents < totalCents) return null
      const bookingId = `b${Date.now()}`
      const txnId = `t${Date.now()}`
      const txn: Transaction = {
        id: txnId, userId: user.id, type: 'booking', amountCents: totalCents,
        platformFeeCents, hostPayoutCents: priceCents, experienceId,
        description: 'Experience booking', createdAt: new Date().toISOString(),
      }
      const booking: Booking = {
        id: bookingId, userId: user.id, experienceId, status: 'upcoming',
        bookedAt: new Date().toISOString(), transactionId: txnId,
      }
      persistUser({ ...user, walletBalanceCents: user.walletBalanceCents - totalCents })
      persistTransactions([txn, ...transactions])
      persistBookings([booking, ...bookings])
      return booking
    },
    [user, transactions, bookings, persistUser, persistTransactions, persistBookings]
  )

  const cancelBooking = useCallback(
    (bookingId: string) => {
      if (!user) return
      const booking = bookings.find((b) => b.id === bookingId)
      if (!booking || booking.status !== 'upcoming') return
      const originalTxn = transactions.find((t) => t.id === booking.transactionId)
      if (!originalTxn) return
      const refundTxn: Transaction = {
        id: `t${Date.now()}`, userId: user.id, type: 'refund',
        amountCents: originalTxn.amountCents, experienceId: booking.experienceId,
        description: 'Booking cancellation refund', createdAt: new Date().toISOString(),
      }
      persistUser({ ...user, walletBalanceCents: user.walletBalanceCents + originalTxn.amountCents })
      persistTransactions([refundTxn, ...transactions])
      persistBookings(bookings.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    },
    [user, bookings, transactions, persistUser, persistTransactions, persistBookings]
  )

  const addPaymentMethod = useCallback(
    (last4: string, brand: string, expiry: string) => {
      if (!user) return
      persistUser({ ...user, savedPaymentMethods: [...user.savedPaymentMethods, { id: `pm${Date.now()}`, last4, brand, expiry }] })
    },
    [user, persistUser]
  )

  const removePaymentMethod = useCallback(
    (pmId: string) => {
      if (!user) return
      persistUser({ ...user, savedPaymentMethods: user.savedPaymentMethods.filter((p) => p.id !== pmId) })
    },
    [user, persistUser]
  )

  const updateUserInterests = useCallback(
    (interests: string[]) => { if (!user) return; persistUser({ ...user, interests }) },
    [user, persistUser]
  )

  const updateUserBio = useCallback(
    (bio: string) => { if (!user) return; persistUser({ ...user, bio }) },
    [user, persistUser]
  )

  const follow = useCallback(
    (targetId: string) => {
      if (!user) return
      if (connections.some((c) => c.fromId === user.id && c.toId === targetId)) return
      persistConnections([...connections, { fromId: user.id, toId: targetId, createdAt: new Date().toISOString() }])
    },
    [user, connections, persistConnections]
  )

  const unfollow = useCallback(
    (targetId: string) => {
      if (!user) return
      persistConnections(connections.filter((c) => !(c.fromId === user.id && c.toId === targetId)))
    },
    [user, connections, persistConnections]
  )

  const isFollowing = useCallback(
    (targetId: string) => {
      if (!user) return false
      return connections.some((c) => c.fromId === user.id && c.toId === targetId)
    },
    [user, connections]
  )

  const isFollowedBy = useCallback(
    (targetId: string) => {
      if (!user) return false
      return connections.some((c) => c.fromId === targetId && c.toId === user.id)
    },
    [user, connections]
  )

  const createPost = useCallback(
    (content: string, experienceId: string | null, photo?: string) => {
      if (!user) return
      const post: Post = {
        id: `p${Date.now()}`, authorId: user.id, experienceId,
        content, createdAt: new Date().toISOString(), resonances: 0,
        ...(photo ? { photo } : {}),
      }
      persistPosts([post, ...posts])
    },
    [user, posts, persistPosts]
  )

  const resonatePost = useCallback(
    (postId: string) => {
      persistPosts(posts.map((p) => p.id === postId ? { ...p, resonances: p.resonances + 1 } : p))
    },
    [posts, persistPosts]
  )

  if (!hydrated) return null

  return (
    <AppContext.Provider value={{
      user, transactions, bookings, connections, posts, experiences, hosts, eventsSource, isLoggedIn,
      login, logout, addFunds, bookExperience, cancelBooking,
      addPaymentMethod, removePaymentMethod, updateUserInterests, updateUserBio,
      follow, unfollow, isFollowing, isFollowedBy, createPost, resonatePost,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
