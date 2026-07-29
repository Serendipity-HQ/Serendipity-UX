'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { Transaction, Booking, Post, Experience, Host, NewExperienceInput } from '@serendipity-hq/design'
import type { CategoryId, GrowthState } from '@serendipity-hq/algorithm'
import { applyBooking, applyDismiss, classifyEventCategory, initGrowthState } from '@serendipity-hq/algorithm'
import type { AppUser } from '@/lib/onboarding-profile'
import {
  EXPERIENCES,
  HOSTS,
} from '@/lib/mock-data'
import { PLATFORM_FEE_RATE } from '@/lib/constants'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export type AuthResult = {
  success: boolean
  error?: string
  requiresEmailConfirmation?: boolean
}

type AppState = {
  user: AppUser | null
  transactions: Transaction[]
  bookings: Booking[]
  posts: Post[]
  experiences: Experience[]
  hosts: Host[]
  eventsSource: 'supabase' | 'mock'
  eventsLoaded: boolean
  isLoggedIn: boolean
  login: (email: string, password: string, userData?: Partial<AppUser>) => Promise<AuthResult>
  logout: () => void
  addFunds: (amountCents: number, paymentMethodId: string) => void
  bookExperience: (experienceId: string, priceCents: number) => Booking | null
  cancelBooking: (bookingId: string) => void
  addPaymentMethod: (last4: string, brand: string, expiry: string) => void
  removePaymentMethod: (pmId: string) => void
  updateUserInterests: (interests: string[]) => void
  updateUserBio: (bio: string) => void
  createPost: (content: string, experienceId: string | null, photo?: string) => void
  resonatePost: (postId: string) => void
  createExperience: (input: NewExperienceInput) => Experience | null
  myHostedExperiences: Experience[]
  passionPathExperienceIds: string[]
  addToPassionPath: (experienceId: string) => void
  removeFromPassionPath: (experienceId: string) => void
  isOnPassionPath: (experienceId: string) => boolean
  growthState: GrowthState
  dismissedIds: string[]
  dismissExperience: (experienceId: string) => void
}

const AppContext = createContext<AppState | null>(null)

const STORAGE_KEYS = {
  user: 'serendipity_user',
  transactions: 'serendipity_transactions',
  bookings: 'serendipity_bookings',
  posts: 'serendipity_posts',
  hostExperiences: 'serendipity_host_experiences',
  hostRecords: 'serendipity_host_records',
  passionPath: 'serendipity_passion_path',
  loggedIn: 'serendipity_logged_in',
  growthState: 'serendipity_growth_state',
  dismissedIds: 'serendipity_dismissed_ids',
}

function userIdFromEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  let hash = 0
  for (let index = 0; index < normalized.length; index += 1) {
    hash = ((hash << 5) - hash + normalized.charCodeAt(index)) | 0
  }
  return `user-${Math.abs(hash).toString(36)}`
}

function nameFromEmail(email: string) {
  const localPart = email.split('@')[0] ?? ''
  const words = localPart.split(/[._-]+/).filter(Boolean)
  if (!words.length) return 'Member'
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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
  const [user, setUser] = useState<AppUser | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [experiences, setExperiences] = useState<Experience[]>(EXPERIENCES)
  const [hosts, setHosts] = useState<Host[]>(HOSTS)
  const [hostExperiences, setHostExperiences] = useState<Experience[]>([])
  const [hostRecords, setHostRecords] = useState<Host[]>([])
  const [eventsSource, setEventsSource] = useState<'supabase' | 'mock'>('mock')
  const [eventsLoaded, setEventsLoaded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [passionPathExperienceIds, setPassionPathExperienceIds] = useState<string[]>([])
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
        setEventsLoaded(true)
      })
      .catch(() => {
        if (!cancelled) {
          setEventsSource('mock')
          setEventsLoaded(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loggedIn = load<boolean>(STORAGE_KEYS.loggedIn, false)
      setIsLoggedIn(loggedIn)
      if (loggedIn) {
        const storedUser = load<AppUser | null>(STORAGE_KEYS.user, null)
        if (storedUser) setUser(storedUser)
        else setIsLoggedIn(false)
        setTransactions(load<Transaction[]>(STORAGE_KEYS.transactions, []))
        setBookings(load<Booking[]>(STORAGE_KEYS.bookings, []))
        setPosts(load<Post[]>(STORAGE_KEYS.posts, []))
        setHostExperiences(load<Experience[]>(STORAGE_KEYS.hostExperiences, []))
        setHostRecords(load<Host[]>(STORAGE_KEYS.hostRecords, []))
        setPassionPathExperienceIds(load<string[]>(STORAGE_KEYS.passionPath, []))
        setGrowthState(load<GrowthState>(
          STORAGE_KEYS.growthState,
          initGrowthState(storedUser?.interests ?? []),
        ))
        setDismissedIds(load<string[]>(STORAGE_KEYS.dismissedIds, []))
      }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const persistUser = useCallback((u: AppUser) => { setUser(u); save(STORAGE_KEYS.user, u) }, [])
  const persistTransactions = useCallback((t: Transaction[]) => { setTransactions(t); save(STORAGE_KEYS.transactions, t) }, [])
  const persistBookings = useCallback((b: Booking[]) => { setBookings(b); save(STORAGE_KEYS.bookings, b) }, [])
  const persistPosts = useCallback((p: Post[]) => { setPosts(p); save(STORAGE_KEYS.posts, p) }, [])
  const persistHostExperiences = useCallback((e: Experience[]) => { setHostExperiences(e); save(STORAGE_KEYS.hostExperiences, e) }, [])
  const persistHostRecords = useCallback((h: Host[]) => { setHostRecords(h); save(STORAGE_KEYS.hostRecords, h) }, [])
  const persistPassionPath = useCallback((ids: string[]) => { setPassionPathExperienceIds(ids); save(STORAGE_KEYS.passionPath, ids) }, [])
  const persistGrowthState = useCallback((state: GrowthState) => { setGrowthState(state); save(STORAGE_KEYS.growthState, state) }, [])
  const persistDismissedIds = useCallback((ids: string[]) => { setDismissedIds(ids); save(STORAGE_KEYS.dismissedIds, ids) }, [])

  const login = useCallback(
    async (email: string, password: string, userData?: Partial<AppUser>): Promise<AuthResult> => {
      const normalizedEmail = email.trim().toLowerCase()
      const storedUser = load<AppUser | null>(STORAGE_KEYS.user, null)
      const returningUser = storedUser?.email.toLowerCase() === normalizedEmail ? storedUser : null
      const isNewAccount = Boolean(userData)
      const supabase = createBrowserSupabaseClient()
      let authenticatedUserId: string | undefined
      let remoteProfile: Record<string, unknown> | null = null

      if (supabase) {
        const authResponse = isNewAccount
          ? await supabase.auth.signUp({
              email: normalizedEmail,
              password,
              options: {
                data: {
                  name: userData?.name,
                  role: userData?.role ?? 'attendee',
                  onboardingProfile: userData?.onboardingProfile,
                },
              },
            })
          : await supabase.auth.signInWithPassword({ email: normalizedEmail, password })

        if (authResponse.error) return { success: false, error: authResponse.error.message }
        authenticatedUserId = authResponse.data.user?.id

        if (isNewAccount && authResponse.data.user && !authResponse.data.session) {
          return { success: true, requiresEmailConfirmation: true }
        }

        if (!isNewAccount && authenticatedUserId) {
          const { data } = await supabase
            .from('profiles')
            .select('name,email,city,interests,onboarding_profile')
            .eq('id', authenticatedUserId)
            .maybeSingle()
          remoteProfile = data as Record<string, unknown> | null
        }
      } else if (!isNewAccount && !returningUser) {
        return {
          success: false,
          error: 'No account was found in this preview. Create an account first or connect Supabase Auth.',
        }
      }

      const remoteOnboarding = remoteProfile?.onboarding_profile && typeof remoteProfile.onboarding_profile === 'object'
        ? remoteProfile.onboarding_profile
        : undefined
      const newUser: AppUser = isNewAccount
        ? {
            id: authenticatedUserId ?? userIdFromEmail(normalizedEmail),
            email: normalizedEmail,
            name: userData?.name?.trim() || nameFromEmail(email),
            bio: userData?.bio ?? '',
            interests: userData?.interests ?? [],
            walletBalanceCents: 0,
            savedPaymentMethods: [],
            role: userData?.role ?? 'attendee',
            ...(userData?.hostProfile ? { hostProfile: userData.hostProfile } : {}),
            ...userData,
          }
        : returningUser ?? {
            id: authenticatedUserId ?? userIdFromEmail(normalizedEmail),
            email: normalizedEmail,
            name: typeof remoteProfile?.name === 'string' ? remoteProfile.name : nameFromEmail(email),
            bio: '',
            interests: Array.isArray(remoteProfile?.interests) ? remoteProfile.interests.map(String) : [],
            walletBalanceCents: 0,
            savedPaymentMethods: [],
            role: 'attendee',
            ...(remoteOnboarding ? { onboardingProfile: remoteOnboarding as AppUser['onboardingProfile'] } : {}),
          }
      persistUser(newUser)
      persistTransactions(isNewAccount ? [] : load<Transaction[]>(STORAGE_KEYS.transactions, []))
      persistBookings(isNewAccount ? [] : load<Booking[]>(STORAGE_KEYS.bookings, []))
      persistPosts(isNewAccount ? [] : load<Post[]>(STORAGE_KEYS.posts, []))
      setHostExperiences(load<Experience[]>(STORAGE_KEYS.hostExperiences, []))
      setHostRecords(load<Host[]>(STORAGE_KEYS.hostRecords, []))
      persistPassionPath(isNewAccount ? [] : load<string[]>(STORAGE_KEYS.passionPath, []))
      persistGrowthState(
        isNewAccount
          ? initGrowthState(newUser.interests)
          : load<GrowthState>(STORAGE_KEYS.growthState, initGrowthState(newUser.interests)),
      )
      persistDismissedIds(isNewAccount ? [] : load<string[]>(STORAGE_KEYS.dismissedIds, []))
      setIsLoggedIn(true)
      save(STORAGE_KEYS.loggedIn, true)

      if (supabase && authenticatedUserId && isNewAccount) {
        const onboardingProfile = userData?.onboardingProfile
        await supabase.from('profiles').upsert({
          id: authenticatedUserId,
          name: newUser.name,
          email: normalizedEmail,
          city: onboardingProfile?.city ?? null,
          interests: newUser.interests,
          desired_feelings: onboardingProfile?.intents ?? [],
          goals: onboardingProfile?.intents ?? [],
          onboarding_profile: onboardingProfile ?? {},
          onboarding_completed_at: onboardingProfile?.completedAt || null,
          updated_at: new Date().toISOString(),
        } as never)
      }

      return { success: true }
    },
    [
      persistUser,
      persistTransactions,
      persistBookings,
      persistPosts,
      persistPassionPath,
      persistGrowthState,
      persistDismissedIds,
    ]
  )

  const logout = useCallback(() => {
    void createBrowserSupabaseClient()?.auth.signOut()
    setUser(null); setTransactions([]); setBookings([])
    setPosts([]); setIsLoggedIn(false)
    setHostExperiences([]); setHostRecords([])
    setPassionPathExperienceIds([])
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

      const bookedEvent = hostExperiences.find((event) => event.id === experienceId)
        ?? experiences.find((event) => event.id === experienceId)
      if (bookedEvent) {
        const category = classifyEventCategory(bookedEvent)
        if (category in growthState.weights) {
          persistGrowthState(applyBooking(growthState, category))
        }
      }

      return booking
    },
    [
      user,
      transactions,
      bookings,
      experiences,
      hostExperiences,
      growthState,
      persistUser,
      persistTransactions,
      persistBookings,
      persistGrowthState,
    ]
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
    (interests: string[]) => {
      if (!user) return
      persistUser({ ...user, interests })

      const nextGrowthState = initGrowthState(interests)
      for (const category of Object.keys(nextGrowthState.weights) as CategoryId[]) {
        nextGrowthState.weights[category] =
          growthState.weights[category] ?? nextGrowthState.weights[category]
      }
      nextGrowthState.updates = growthState.updates
      persistGrowthState(nextGrowthState)
    },
    [user, growthState, persistUser, persistGrowthState]
  )

  const updateUserBio = useCallback(
    (bio: string) => { if (!user) return; persistUser({ ...user, bio }) },
    [user, persistUser]
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

      const event = hostExperiences.find((experience) => experience.id === experienceId)
        ?? experiences.find((experience) => experience.id === experienceId)
      if (!event) return

      const category = classifyEventCategory(event)
      if (category in growthState.weights) {
        persistGrowthState(applyDismiss(growthState, category))
      }
    },
    [
      dismissedIds,
      experiences,
      hostExperiences,
      growthState,
      persistDismissedIds,
      persistGrowthState,
    ],
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

  const addToPassionPath = useCallback((experienceId: string) => {
    if (!user || passionPathExperienceIds.includes(experienceId)) return
    persistPassionPath([...passionPathExperienceIds, experienceId])
  }, [user, passionPathExperienceIds, persistPassionPath])

  const removeFromPassionPath = useCallback((experienceId: string) => {
    persistPassionPath(passionPathExperienceIds.filter((id) => id !== experienceId))
  }, [passionPathExperienceIds, persistPassionPath])

  const isOnPassionPath = useCallback(
    (experienceId: string) => passionPathExperienceIds.includes(experienceId),
    [passionPathExperienceIds]
  )

  if (!hydrated) return null

  return (
    <AppContext.Provider value={{
      user, transactions, bookings, posts,
      experiences: allExperiences, hosts: allHosts, eventsSource, eventsLoaded, isLoggedIn,
      login, logout, addFunds, bookExperience, cancelBooking,
      addPaymentMethod, removePaymentMethod, updateUserInterests, updateUserBio,
      createPost, resonatePost,
      createExperience, myHostedExperiences,
      passionPathExperienceIds, addToPassionPath, removeFromPassionPath, isOnPassionPath,
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
