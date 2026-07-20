import type { Experience, Lane } from '@serendipity-hq/design'
import { publicExperienceTags } from './experience-metadata'

export type RecommendationProfile = {
  interests?: string[]
  intents?: string[]
  location?: string
  radiusMiles?: number
  adventurousness?: number | string
  socialStyle?: string | string[]
  budget?: number | string | { min?: number; max?: number }
  availability?: string | string[]
  planningStyle?: string
}

export type ScoreBreakdown = {
  laneFit: number
  interestFit: number
  intentFit: number
  locationFit: number
  budgetFit: number
  availabilityFit: number
  socialFit: number
  adventureFit: number
  planningFit: number
  qualityFit: number
}

export type Recommendation = {
  lane: Lane
  experience: Experience
  score: number
  breakdown: ScoreBreakdown
  reason: string
  signals: string[]
}

export type RecommendationDispatch = {
  recommendations: Recommendation[]
  shortages: Lane[]
  eligibleCount: number
}

type Candidate = {
  experience: Experience
  words: Set<string>
  learningStrength: number
  spectator: boolean
  growthEvidence: boolean
  socialIntensity: number
}

const LANES: Lane[] = ['passion', 'growth', 'surprise']

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'be', 'for', 'from', 'in', 'into', 'of', 'on', 'or',
  'the', 'this', 'to', 'with', 'your', 'you', 'our', 'we', 'as', 'by', 'is', 'it',
])

const LEARNING_WORDS = new Set([
  'academy', 'astronomy', 'build', 'class', 'craft', 'debate', 'design', 'discussion',
  'ethics', 'fermentation', 'fundamentals', 'guided', 'history', 'learn', 'lecture',
  'making', 'masterclass', 'meditation', 'mythology', 'philosophy', 'practice', 'reflect',
  'science', 'seminar', 'skill', 'socratic', 'storytelling', 'study', 'technique',
  'technology', 'training', 'workshop', 'writing',
])

const ACTIVE_REFLECTIVE_WORDS = new Set([
  'bouldering', 'climbing', 'cook', 'cooking', 'dance', 'drawing', 'foraging', 'hike',
  'meditation', 'pottery', 'ramen', 'sketch', 'stargazing', 'tasting', 'walk', 'yoga',
])

const SPECTATOR_WORDS = new Set([
  'baseball', 'basketball', 'concert', 'football', 'game', 'match', 'movie', 'screening',
  'show', 'spectator', 'stadium', 'theater', 'theatre', 'watch',
])

const EXPLICIT_GROWTH_WORDS = new Set([
  'academy', 'class', 'course', 'debate', 'discussion', 'lecture', 'masterclass',
  'practice', 'seminar', 'socratic', 'training', 'workshop',
])

const INTENT_TERMS: Record<string, string[]> = {
  connect: ['community', 'conversation', 'dinner', 'group', 'social', 'strangers', 'together'],
  people: ['community', 'conversation', 'dinner', 'group', 'social', 'strangers', 'together'],
  create: ['art', 'build', 'craft', 'create', 'drawing', 'make', 'pottery', 'workshop', 'writing'],
  grow: ['debate', 'fundamentals', 'learn', 'philosophy', 'practice', 'science', 'seminar', 'skill'],
  skill: ['debate', 'fundamentals', 'learn', 'philosophy', 'practice', 'science', 'seminar', 'skill'],
  passion: ['craft', 'deep', 'masterclass', 'practice', 'skill', 'workshop'],
  reset: ['calm', 'meditation', 'nature', 'outdoors', 'quiet', 'slow', 'walk', 'wonder'],
  slow: ['calm', 'meditation', 'nature', 'quiet', 'slow', 'walk', 'wonder'],
  move: ['bouldering', 'climbing', 'dance', 'hike', 'physical', 'walk', 'yoga'],
  outside: ['foraging', 'hike', 'nature', 'outdoors', 'stargazing', 'walk'],
  explore: ['adventure', 'discover', 'foraging', 'guided', 'history', 'tour', 'unexpected'],
  surprise: ['adventure', 'discover', 'foraging', 'guided', 'unexpected', 'wonder'],
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  const one = text(value)
  return one ? [one] : []
}

function words(values: string[]): Set<string> {
  return new Set(
    values
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
  )
}

function overlap(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((word) => b.has(word))
}

function clamp(value: number, min = 0, max = 10): number {
  return Math.max(min, Math.min(max, value))
}

function numberFrom(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const match = text(value).match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : null
}

function pick(source: Record<string, unknown>, names: string[]): unknown {
  for (const name of names) {
    const value = source[name]
    if (value !== undefined && value !== null && value !== '') return value
  }
}

/**
 * Adapts both the current User object and richer questionnaire records without
 * coupling the recommender to a particular persistence implementation.
 */
export function recommendationProfileFromUser(user: unknown): RecommendationProfile {
  if (!user || typeof user !== 'object') return {}
  const root = user as Record<string, unknown>
  const nestedKeys = ['questionnaire', 'recommendationProfile', 'onboardingProfile', 'preferences', 'profile']
  const nested = nestedKeys.reduce<Record<string, unknown>>((result, key) => {
    const value = root[key]
    return value && typeof value === 'object' ? { ...result, ...(value as Record<string, unknown>) } : result
  }, {})
  const source = { ...root, ...nested }

  const city = text(pick(source, ['location', 'city', 'homeBase']))
  const neighborhood = text(source.neighborhood)
  const travelRadius = text(pick(source, ['travelRadius', 'travel_radius']))
  const radiusMiles = numberFrom(pick(source, ['radiusMiles', 'radius', 'travelRadius', 'travel_radius']))
    ?? (/right around/i.test(travelRadius) ? 3 : /worth the trip/i.test(travelRadius) ? 35 : /nearby/i.test(travelRadius) ? 12 : undefined)

  return {
    interests: strings(pick(source, ['interests', 'passions', 'interestTags'])),
    intents: strings(pick(source, ['intents', 'goals', 'desiredFeelings', 'desired_feelings', 'reasons'])),
    location: [neighborhood, city].filter(Boolean).join(' '),
    radiusMiles,
    adventurousness: pick(source, ['adventurousness', 'adventureLevel', 'noveltyComfort']) as number | string | undefined,
    socialStyle: strings(pick(source, ['socialStyle', 'social_style', 'groupPreference', 'socialEnergy'])),
    budget: pick(source, ['budget', 'budgetStyle', 'budgetMax', 'maxPrice', 'priceComfort']) as RecommendationProfile['budget'],
    availability: strings(pick(source, ['availability', 'availableTimes', 'preferredTimes'])),
    planningStyle: text(pick(source, ['planningStyle', 'planning_style', 'noticePreference'])),
  }
}

function eventCandidate(experience: Experience): Candidate {
  const eventWords = words([experience.title, experience.description, experience.location, ...publicExperienceTags(experience)])
  const learningHits = overlap(eventWords, LEARNING_WORDS).length
  const activeHits = overlap(eventWords, ACTIVE_REFLECTIVE_WORDS).length
  const spectatorHits = overlap(eventWords, SPECTATOR_WORDS).length
  const explicitGrowthHits = overlap(eventWords, EXPLICIT_GROWTH_WORDS).length
  const spectator = spectatorHits > 0 && explicitGrowthHits === 0 && activeHits === 0
  const growthEvidence = explicitGrowthHits > 0 || activeHits > 0
  const intimate = experience.spotsTotal <= 8
  const large = experience.spotsTotal >= 18
  const socialWords = ['social', 'conversation', 'dinner', 'group', 'strangers', 'together']
    .filter((word) => eventWords.has(word)).length

  return {
    experience,
    words: eventWords,
    learningStrength: clamp(learningHits * 2.4 + activeHits * 1.2 - spectatorHits * 5),
    spectator,
    growthEvidence,
    socialIntensity: clamp(5 + socialWords * 1.2 + (large ? 2 : 0) - (intimate ? 1.5 : 0), 1, 10),
  }
}

function budgetMaximum(budget: RecommendationProfile['budget']): number | null {
  if (typeof budget === 'object' && budget) return numberFrom(budget.max) ?? numberFrom(budget.min)
  const label = text(budget).toLowerCase()
  if (label.includes('free')) return 15
  if (label.includes('little of both')) return 100
  if (label.includes('splurge')) return 200
  return numberFrom(budget)
}

function adventureLevel(value: RecommendationProfile['adventurousness']): number {
  const numeric = numberFrom(value)
  if (numeric !== null) {
    if (numeric <= 5) return clamp(numeric * 2, 1, 10)
    if (numeric > 10) return clamp(numeric / 10, 1, 10)
    return clamp(numeric, 1, 10)
  }
  const label = text(value).toLowerCase()
  if (/bold|high|wild|adventurous/.test(label)) return 9
  if (/low|familiar|gentle|cautious/.test(label)) return 3
  return 6
}

function preferredSocialIntensity(style: RecommendationProfile['socialStyle']): number {
  const value = strings(style).join(' ').toLowerCase()
  if (/solo|quiet|introvert|intimate|small|one.on.one/.test(value)) return 3
  if (/large|lively|extrovert|crowd|group/.test(value)) return 8
  return 5.5
}

function locationScore(candidate: Candidate, profile: RecommendationProfile): number {
  if (!profile.location) return 5
  const locationWords = words([profile.location])
  const matches = overlap(locationWords, candidate.words).length
  // Exact neighborhood/city evidence is valuable. Without coordinates, radius
  // controls how strongly a location miss should affect ranking.
  if (matches > 0) return clamp(7 + matches * 1.5)
  if (profile.radiusMiles !== undefined && profile.radiusMiles <= 5) return 2
  if (profile.radiusMiles !== undefined && profile.radiusMiles >= 25) return 6
  return 4.5
}

function availabilityScore(date: Date, availability: RecommendationProfile['availability']): number {
  const preferences = strings(availability).join(' ').toLowerCase()
  if (!preferences) return 5
  const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const hour = date.getHours()
  const weekend = date.getDay() === 0 || date.getDay() === 6
  let score = 3
  if (preferences.includes(day)) score += 5
  if (preferences.includes('weekend') && weekend) score += 4
  if (preferences.includes('weekday') && !weekend) score += 4
  if (/morning/.test(preferences) && hour < 12) score += 3
  if (/afternoon/.test(preferences) && hour >= 12 && hour < 17) score += 3
  if (/evening|night/.test(preferences) && hour >= 17) score += 3
  if (/any|flexible/.test(preferences)) score += 3
  return clamp(score)
}

function planningScore(date: Date, now: Date, style?: string): number {
  const daysAway = (date.getTime() - now.getTime()) / 86_400_000
  const preference = text(style).toLowerCase()
  if (/spontaneous|same.day|spark|last.minute|this.week/.test(preference)) return clamp(10 - Math.abs(daysAway - 4) * 0.6)
  if (/planner|planned|ahead|advance|calendar/.test(preference)) return clamp(10 - Math.abs(daysAway - 28) * 0.18)
  return clamp(8 - Math.abs(daysAway - 14) * 0.12)
}

function intentWords(intents: string[]): Set<string> {
  const expanded = intents.flatMap((intent) => {
    const normalized = intent.toLowerCase()
    const related = Object.entries(INTENT_TERMS)
      .filter(([key]) => normalized.includes(key))
      .flatMap(([, terms]) => terms)
    return [intent, ...related]
  })
  return words(expanded)
}

function stableJitter(seed: string): number {
  let hash = 2166136261
  for (const char of seed) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 1000) / 1000
}

function scoreCandidate(
  candidate: Candidate,
  lane: Lane,
  profile: RecommendationProfile,
  now: Date,
  weekKey: string
): Recommendation {
  const interestSet = words(profile.interests ?? [])
  const interestMatches = overlap(interestSet, candidate.words)
  const goalMatches = overlap(intentWords(profile.intents ?? []), candidate.words)
  const date = new Date(candidate.experience.dateTime)
  const maxBudget = budgetMaximum(profile.budget)
  const budgetFit = maxBudget === null
    ? 5
    : candidate.experience.price <= maxBudget
      ? clamp(8 + (maxBudget - candidate.experience.price) / Math.max(maxBudget, 1) * 2)
      : clamp(6 - (candidate.experience.price - maxBudget) / Math.max(maxBudget, 1) * 10)
  const socialFit = clamp(10 - Math.abs(candidate.socialIntensity - preferredSocialIntensity(profile.socialStyle)))
  const adventure = adventureLevel(profile.adventurousness)
  const novelty = interestMatches.length === 0 ? 10 : clamp(6 - interestMatches.length * 2)

  let laneFit = 0
  let interestFit = clamp(interestMatches.length * 3.4)
  let adventureFit = 5
  if (lane === 'passion') {
    laneFit = candidate.experience.lane === lane ? 9 : 5
    interestFit = interestMatches.length ? clamp(6 + interestMatches.length * 2) : 1
    adventureFit = 6
  } else if (lane === 'growth') {
    laneFit = clamp(candidate.learningStrength + (candidate.experience.lane === lane ? 2 : 0))
    interestFit = clamp(4 + Math.min(interestMatches.length, 2) * 1.5)
    adventureFit = clamp(7 - Math.abs(adventure - 6) * 0.5)
  } else {
    laneFit = clamp(novelty + (candidate.experience.lane === lane ? 1.5 : 0))
    interestFit = novelty
    adventureFit = clamp(10 - Math.abs(adventure - novelty))
  }

  const breakdown: ScoreBreakdown = {
    laneFit,
    interestFit,
    intentFit: goalMatches.length ? clamp(6 + goalMatches.length * 1.5) : 4,
    locationFit: locationScore(candidate, profile),
    budgetFit,
    availabilityFit: availabilityScore(date, profile.availability),
    socialFit,
    adventureFit,
    planningFit: planningScore(date, now, profile.planningStyle),
    qualityFit: clamp(5 + Math.min(candidate.experience.spotsBooked, 5) * 0.5),
  }

  const score =
    breakdown.laneFit * 3.1 +
    breakdown.interestFit * 2.2 +
    breakdown.intentFit * 1.35 +
    breakdown.locationFit * 0.9 +
    breakdown.budgetFit * 1.1 +
    breakdown.availabilityFit * 1.15 +
    breakdown.socialFit * 0.8 +
    breakdown.adventureFit * 1.1 +
    breakdown.planningFit * 0.85 +
    breakdown.qualityFit * 0.5 +
    stableJitter(`${weekKey}:${lane}:${candidate.experience.id}`)

  const signals: string[] = []
  if (lane === 'passion' && interestMatches.length) signals.push(`builds on your interest in ${interestMatches.slice(0, 2).join(' and ')}`)
  if (lane === 'growth') signals.push('has explicit learning, practice, or reflection value—not passive spectacle')
  if (lane === 'surprise') signals.push('sits outside your usual interests while fitting your comfort level')
  if (goalMatches.length) signals.push('supports what you said you want more of')
  if (breakdown.availabilityFit >= 7) signals.push('fits the times you said work for you')
  if (maxBudget !== null && budgetFit >= 8) signals.push('stays within your budget')
  if (breakdown.locationFit >= 7) signals.push('is close to your preferred area')

  const fallbackReason: Record<Lane, string> = {
    passion: 'A hands-on way to go deeper into something you already enjoy.',
    growth: 'An experience with clear learning or reflection value, designed to leave you with a new idea or skill.',
    surprise: 'A viable step beyond your usual orbit, calibrated to your sense of adventure.',
  }

  return {
    lane,
    experience: candidate.experience,
    score: Math.round(score * 10) / 10,
    breakdown,
    reason: signals.length ? `Because it ${signals.slice(0, 2).join(', and ')}.` : fallbackReason[lane],
    signals,
  }
}

function isLaneEligible(candidate: Candidate, lane: Lane, profile: RecommendationProfile): boolean {
  const interestMatches = overlap(words(profile.interests ?? []), candidate.words).length
  if (lane === 'passion') return interestMatches > 0 || (profile.interests?.length ?? 0) === 0
  if (lane === 'growth') return !candidate.spectator && candidate.growthEvidence && candidate.learningStrength >= 2
  return interestMatches === 0 || (profile.interests?.length ?? 0) === 0
}

export function createWeeklyRecommendations(
  experiences: Experience[],
  profile: RecommendationProfile,
  options: { now?: Date; weekKey?: string } = {}
): RecommendationDispatch {
  const now = options.now ?? new Date()
  const weekKey = options.weekKey ?? now.toISOString().slice(0, 10)
  const candidates = experiences
    .filter((experience) => {
      const date = new Date(experience.dateTime)
      return Number.isFinite(date.getTime()) &&
        date.getTime() > now.getTime() &&
        experience.spotsBooked < experience.spotsTotal &&
        !/cancelled|canceled|postponed|sold\s*out/i.test(experience.title)
    })
    .map(eventCandidate)

  const recommendations: Recommendation[] = []
  const shortages: Lane[] = []
  const used = new Set<string>()

  for (const lane of LANES) {
    const ranked = candidates
      .filter((candidate) => !used.has(candidate.experience.id) && isLaneEligible(candidate, lane, profile))
      .map((candidate) => scoreCandidate(candidate, lane, profile, now, weekKey))
      .sort((a, b) => b.score - a.score || a.experience.id.localeCompare(b.experience.id))
    const best = ranked[0]
    if (!best) {
      shortages.push(lane)
      continue
    }
    recommendations.push(best)
    used.add(best.experience.id)
  }

  return { recommendations, shortages, eligibleCount: candidates.length }
}
