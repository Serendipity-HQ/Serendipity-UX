export type Lane = 'passion' | 'growth' | 'surprise'

export type Experience = {
  id: string
  title: string
  lane: Lane
  hostId: string
  description: string
  location: string
  dateTime: string
  price: number
  spotsTotal: number
  spotsBooked: number
  imageSeed: string
  imageUrl?: string | null
  tags: string[]
}

export type Host = {
  id: string
  name: string
  bio: string
  venue: string
  avatarSeed: string
}

export type PaymentMethod = {
  id: string
  last4: string
  brand: string
  expiry: string
}

export type UserRole = 'attendee' | 'host'

export type HostProfile = {
  hostId: string
  venueName: string
  neighborhood: string
  craft: string
  motivation: string
  lanes: Lane[]
  groupSize: string
  hostingBackground: string
}

export type User = {
  id: string
  name: string
  email: string
  bio: string
  interests: string[]
  walletBalanceCents: number
  savedPaymentMethods: PaymentMethod[]
  role?: UserRole
  hostProfile?: HostProfile
}

export type NewExperienceInput = {
  title: string
  lane: Lane
  description: string
  location: string
  dateTime: string
  price: number
  spotsTotal: number
  tags: string[]
}

export type Transaction = {
  id: string
  userId: string
  type: 'topup' | 'booking' | 'refund'
  amountCents: number
  platformFeeCents?: number
  hostPayoutCents?: number
  experienceId?: string
  description: string
  createdAt: string
}

export type Booking = {
  id: string
  userId: string
  experienceId: string
  status: 'upcoming' | 'completed' | 'cancelled'
  bookedAt: string
  transactionId: string
}

// ── Social layer ──────────────────────────────────────────

export type SeedUser = {
  id: string
  name: string
  bio: string
  interests: string[]
  avatarSeed: string
  attendedExperienceIds: string[]
}

export type Post = {
  id: string
  authorId: string
  experienceId: string | null
  content: string
  createdAt: string
  photo?: string
  resonances: number
}

export type Connection = {
  fromId: string
  toId: string
  createdAt: string
}
