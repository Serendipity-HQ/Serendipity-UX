'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { User, Transaction, Booking, Post, Connection, Experience, Host, NewExperienceInput } from '@serendipity-hq/design'
import type { GrowthState } from '@serendipity-hq/algorithm'
import { initGrowthState, applyBooking, applyDismiss, classifyEventCategory } from '@serendipity-hq/algorithm'
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
  createExperience: (input: NewExperienceInput) => Experience | null
  myHostedExperiences: Experience[]
  /** This user's learned Growth state (@serendipity-hq/algorithm) — persisted, grows over time. */
  growthState: GrowthState
  /** Ids the user has dismissed ("not for me") — excluded from every lane going forward. */
  dismissedIds: string[]
  dismissExperience: (experienceId: string) => void
}

const AppContext = createContext<AppState | null>(null)

const STORAGE_KEYS = {
  user: 'serendipity_user',
  transactions: 'serendipity_transactions',
  bookings: 'serendipity_bookings',
  connections: 'serendipity_connections',
  posts: 'serendipity_posts',
  hostExperiences: 'serendipity_host_experiences',
  hostRecords: 'serendipity_host_records',
  loggedIn: 'serendipity_logged_in',
  growthState: 'serendipity_growth_state',
  dismissedIds: 'serendipity_dismissed_ids',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
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
  const [hostExperiences, setHostExperiences] = useState<Experience[]>([])
  const [hostRecords, setHostRecords] = useState<Host[]>([])
  const [eventsSource, setEventsSource] = useState<'supabase' | 'mock'>('mock')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [growthState, setGrowthState] = useState<GrowthState>(() => initGrowthState([]))
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

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
      setHostExperiences(load<Experience[]>(STORAGE_KEYS.hostExperiences, []))
      setHostRecords(load<Host[]>(STORAGE_KEYS.hostRecords, []))
      const loadedUser = load<User>(STORAGE_KEYS.user, DEMO_USER)
      setGrowthState(load<GrowthState>(STORAGE_KEYS.growthState, initGrowthState(loadedUser.interests)))
      setDismissedIds(load<string[]>(STORAGE_KEYS.dismissedIds, []))
    }
    setHydrated(true)
  }, [])

  const persistUser = useCallback((u: User) => { setUser(u); save(STORAGE_KEYS.user, u) }, [])
  const persistTransactions = useCallback((t: Transaction[]) => { setTransactions(t); save(STORAGE_KEYS.transactions, t) }, [])
  const persistBookings = useCallback((b: Booking[]) => { setBookings(b); save(STORAGE_KEYS.bookings, b) }, [])
  const persistConnections = useCallback((c: Connection[]) => { setConnections(c); save(STORAGE_KEYS.connections, c) }, [])
  const persistPosts = useCallback((p: Post[]) => { setPosts(p); save(STORAGE_KEYS.posts, p) }, [])
  const persistHostExperiences = useCallback((e: Experience[]) => { setHostExperiences(e); save(STORAGE_KEYS.hostExperiences, e) }, [])
  const persistHostRecords = useCallback((h: Host[]) => { setHostRecords(h); save(STORAGE_KEYS.hostRecords, h) }, [])
  const persistGrowthState = useCallback((g: GrowthState) => { setGrowthState(g); save(STORAGE_KEYS.growthState, g) }, [])
  const persistDismissedIds = useCallback((ids: string[]) => { setDismissedIds(ids); save(STORAGE_KEYS.dismissedIds, ids) }, [])

  const login = useCallback(
    (email: string, _password: string, userData?: Partial<User>) => {
      const newUser: User = {
        ...DEMO_USER,
        email,
        name: userData?.name ?? DEMO_USER.name,
        interests: userData?.interests ?? DEMO_USER.interests,
        walletBalanceCents: DEMO_USER.walletBalanceCents,
        savedPaymentMethods: DEMO_USER.savedPaymentMethods,
        role: userData?.role ?? 'attendee',
        ...(userData?.hostProfile ? { hostProfile: userData.hostProfile } : {}),
      }
      persistUser(newUser)
      persistTransactions(load<Transaction[]>(STORAGE_KEYS.transactions, DEMO_TRANSACTIONS))
      persistBookings(load<Booking[]>(STORAGE_KEYS.bookings, DEMO_BOOKINGS))
      persistConnections(load<Connection[]>(STORAGE_KEYS.connections, SEED_CONNECTIONS))
      persistPosts(load<Post[]>(STORAGE_KEYS.posts, SEED_POSTS))
      setHostExperiences(load<Experience[]>(STORAGE_KEYS.hostExperiences, []))
      setHostRecords(load<Host[]>(STORAGE_KEYS.hostRecords, []))
      // Fresh Growth state per interests on (re)login — an existing user's
      // learned weights persist across sessions via STORAGE_KEYS.growthState;
      // this only fires the first time (nothing stored yet) or on signup.
      persistGrowthState(load<GrowthState>(STORAGE_KEYS.growthState, initGrowthState(newUser.interests)))
      persistDismissedIds(load<string[]>(STORAGE_KEYS.dismissedIds, []))
      setIsLoggedIn(true)
      save(STORAGE_KEYS.loggedIn, true)
    },
    [persistUser, persistTransactions, persistBookings, persistConnections, persistPosts, persistGrowthState, persistDismissedIds]
  )

  const logout = useCallback(() => {
    setUser(null); setTransactions([]); setBookings([])
    setConnections([]); setPosts([]); setIsLoggedIn(false)
    setHostExperiences([]); setHostRecords([])
    setGrowthState(initGrowthState([])); setDismissedIds([])
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

      // Growth feedback: if this event falls in one of the user's active
      // exploration categories, reinforce it. Core-interest categories
      // (Passion's territory) aren't tracked in growthState.weights at
      // all, so booking one of those is correctly a no-op here.
      const bookedEvent = hostExperiences.find((e) => e.id === experienceId) ?? experiences.find((e) => e.id === experienceId)
      if (bookedEvent) {
        const category = classifyEventCategory(bookedEvent)
        if (category in growthState.weights) {
          persistGrowthState(applyBooking(growthState, category))
        }
      }

      return booking
    },
    [user, transactions, bookings, experiences, hostExperiences, growthState, persistUser, persistTransactions, persistBookings, persistGrowthState]
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

  const dismissExperience = useCallback(
    (experienceId: string) => {
      if (!dismissedIds.includes(experienceId)) {
        persistDismissedIds([...dismissedIds, experienceId])
      }
      const event = hostExperiences.find((e) => e.id === experienceId) ?? experiences.find((e) => e.id === experienceId)
      if (event) {
        const category = classifyEventCategory(event)
        if (category in growthState.weights) {
          persistGrowthState(applyDismiss(growthState, category))
        }
      }
    },
    [dismissedIds, experiences, hostExperiences, growthState, persistDismissedIds, persistGrowthState]
  )

  const createExperience = useCallback(
    (input: NewExperienceInput): Experience | null => {
      if (!user || user.role !== 'host' || !user.hostProfile) return null
      const { hostId, venueName, craft, motivation } = user.hostProfile
      if (!hostRecords.some((h) => h.id === hostId)) {
        persistHostRecords([...hostRecords, {
          id: hostId,
          name: user.name,
          bio: motivation || craft || user.bio,
          venue: venueName,
          avatarSeed: slugify(user.name) || hostId,
        }])
      }
      const experience: Experience = {
        id: `he${Date.now()}`,
        title: input.title,
        lane: input.lane,
        hostId,
        description: input.description,
        location: input.location,
        dateTime: input.dateTime,
        price: input.price,
        spotsTotal: input.spotsTotal,
        spotsBooked: 0,
        imageSeed: slugify(input.title) || `he${Date.now()}`,
        tags: input.tags,
      }
      persistHostExperiences([experience, ...hostExperiences])
      return experience
    },
    [user, hostRecords, hostExperiences, persistHostRecords, persistHostExperiences]
  )

  // Host-created experiences sit alongside curated/Supabase ones so they show
  // up in Discover and the weekly recommendation pool.
  const allExperiences = useMemo(() => {
    const localIds = new Set(hostExperiences.map((e) => e.id))
    return [...hostExperiences, ...experiences.filter((e) => !localIds.has(e.id))]
  }, [hostExperiences, experiences])

  const allHosts = useMemo(() => {
    const localIds = new Set(hostRecords.map((h) => h.id))
    return [...hostRecords, ...hosts.filter((h) => !localIds.has(h.id))]
  }, [hostRecords, hosts])

  const myHostedExperiences = useMemo(() => {
    if (!user?.hostProfile) return []
    return hostExperiences.filter((e) => e.hostId === user.hostProfile!.hostId)
  }, [user, hostExperiences])

  if (!hydrated) return null

  return (
    <AppContext.Provider value={{
      user, transactions, bookings, connections, posts,
      experiences: allExperiences, hosts: allHosts, eventsSource, isLoggedIn,
      login, logout, addFunds, bookExperience, cancelBooking,
      addPaymentMethod, removePaymentMethod, updateUserInterests, updateUserBio,
      follow, unfollow, isFollowing, isFollowedBy, createPost, resonatePost,
      createExperience, myHostedExperiences,
      growthState, dismissedIds, dismissExperience,
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
