import type { Booking, Experience, Lane } from '@serendipity-hq/design'
import { publicExperienceTags } from './experience-metadata'

export type RecommendationHistorySignal = 'saved' | 'booked' | 'completed'

export type RecommendationHistoryItem = {
  experience: Experience
  signal: RecommendationHistorySignal
  occurredAt?: string
}

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
  accessibilityNeeds?: string[]
  history?: RecommendationHistoryItem[]
}

export type RecommendationContext = {
  bookings?: Booking[]
  passionPathExperienceIds?: string[]
  experiences?: Experience[]
}

export type PathStage = 'exploring' | 'building' | 'practicing' | 'deepening'

export type RecommendationTrajectory = {
  interest?: string
  currentStage: PathStage
  projectedStep: string
  candidateLevel: number
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
  accessibilityFit: number
  pathFit: number
  engagementFit: number
  cognitiveFit: number
  noveltyFit: number
}

export type Recommendation = {
  lane: Lane
  experience: Experience
  score: number
  breakdown: ScoreBreakdown
  reason: string
  signals: string[]
  trajectory: RecommendationTrajectory
}

export type RecommendationDispatch = {
  recommendations: Recommendation[]
  shortages: Lane[]
  eligibleCount: number
}

type TopicKey =
  | 'pottery'
  | 'climbing'
  | 'live-music'
  | 'cooking'
  | 'philosophy'
  | 'hiking'
  | 'photography'
  | 'meditation'
  | 'creative-writing'
  | 'wine'
  | 'dance'
  | 'astronomy'
  | 'woodworking'
  | 'yoga'
  | 'film'
  | 'foraging'

type TopicDefinition = {
  label: string
  aliases: string[]
  adjacent: TopicKey[]
}

type PathState = {
  key?: TopicKey
  label: string
  evidence: number
  stage: PathStage
  targetLevel: number
}

type CandidateSemantics = {
  words: Set<string>
  normalizedText: string
  topicScores: Map<TopicKey, number>
  topTopic?: TopicKey
  activeEngagement: number
  passiveConsumption: number
  cognitiveDepth: number
  reflectiveDepth: number
  socialIntensity: number
  level: number
  format: string
  qualityConfidence: number
}

type Candidate = {
  experience: Experience
  semantics: CandidateSemantics
}

type MatchContext = {
  directAffinity: number
  matchedPath?: PathState
  bridgeAffinity: number
  bridgeFrom?: PathState
  novelty: number
  pathFit: number
}

const LANES: Lane[] = ['passion', 'growth', 'surprise']
const WEEKLY_INVITATION_COUNT = 3

const TOPICS: Record<TopicKey, TopicDefinition> = {
  pottery: {
    label: 'Pottery',
    aliases: ['pottery', 'ceramic', 'ceramics', 'clay', 'wheel throwing', 'kiln', 'glaze', 'throwing'],
    adjacent: ['woodworking', 'photography', 'meditation'],
  },
  climbing: {
    label: 'Climbing',
    aliases: ['climbing', 'bouldering', 'climb', 'belay', 'crag', 'route reading'],
    adjacent: ['hiking', 'yoga', 'meditation'],
  },
  'live-music': {
    label: 'Live Music',
    aliases: ['live music', 'music', 'musician', 'band', 'songwriting', 'singing', 'choir', 'instrument', 'guitar', 'piano', 'drumming', 'open mic', 'jam session'],
    adjacent: ['dance', 'creative-writing', 'film'],
  },
  cooking: {
    label: 'Cooking',
    aliases: ['cooking', 'cook', 'culinary', 'kitchen', 'ramen', 'baking', 'fermentation', 'recipe', 'chef'],
    adjacent: ['foraging', 'wine', 'pottery'],
  },
  philosophy: {
    label: 'Philosophy',
    aliases: ['philosophy', 'philosophical', 'socratic', 'ethics', 'meaning', 'ideas', 'debate'],
    adjacent: ['creative-writing', 'meditation', 'film'],
  },
  hiking: {
    label: 'Hiking',
    aliases: ['hiking', 'hike', 'trail', 'trek', 'walking', 'outdoors'],
    adjacent: ['foraging', 'climbing', 'photography', 'astronomy'],
  },
  photography: {
    label: 'Photography',
    aliases: ['photography', 'photo', 'camera', 'portrait', 'darkroom', 'composition', 'street photography'],
    adjacent: ['film', 'hiking', 'astronomy', 'pottery'],
  },
  meditation: {
    label: 'Meditation',
    aliases: ['meditation', 'mindfulness', 'breathwork', 'contemplative', 'stillness', 'reflective'],
    adjacent: ['yoga', 'philosophy', 'hiking', 'pottery'],
  },
  'creative-writing': {
    label: 'Creative Writing',
    aliases: ['creative writing', 'writing', 'writer', 'poetry', 'poem', 'fiction', 'storytelling', 'memoir'],
    adjacent: ['philosophy', 'film', 'live-music'],
  },
  wine: {
    label: 'Wine Tasting',
    aliases: ['wine tasting', 'wine', 'sommelier', 'vineyard', 'grape', 'vintage', 'burgundy'],
    adjacent: ['cooking', 'foraging'],
  },
  dance: {
    label: 'Dance',
    aliases: ['dance', 'dancing', 'choreography', 'movement', 'salsa', 'tango', 'ballet'],
    adjacent: ['live-music', 'yoga', 'film'],
  },
  astronomy: {
    label: 'Astronomy',
    aliases: ['astronomy', 'stargazing', 'telescope', 'cosmos', 'planet', 'constellation', 'night sky', 'stars'],
    adjacent: ['photography', 'hiking', 'philosophy'],
  },
  woodworking: {
    label: 'Woodworking',
    aliases: ['woodworking', 'woodwork', 'carpentry', 'joinery', 'wood carving', 'furniture making'],
    adjacent: ['pottery', 'photography'],
  },
  yoga: {
    label: 'Yoga',
    aliases: ['yoga', 'asana', 'vinyasa', 'mobility', 'stretching'],
    adjacent: ['meditation', 'climbing', 'dance'],
  },
  film: {
    label: 'Film',
    aliases: ['film', 'cinema', 'filmmaking', 'screenwriting', 'documentary', 'movie', 'screening'],
    adjacent: ['photography', 'creative-writing', 'philosophy', 'live-music'],
  },
  foraging: {
    label: 'Foraging',
    aliases: ['foraging', 'forage', 'wild food', 'edible plants', 'mushroom', 'plant identification'],
    adjacent: ['cooking', 'hiking', 'wine'],
  },
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'be', 'for', 'from', 'in', 'into', 'of', 'on', 'or',
  'the', 'this', 'to', 'with', 'your', 'you', 'our', 'we', 'as', 'by', 'is', 'it',
])

const ACTIVE_TERMS: Array<[string, number]> = [
  ['hands on', 9], ['make your own', 9], ['jam session', 9], ['studio session', 9],
  ['workshop', 8], ['practice', 8], ['training', 8], ['participatory', 8], ['open mic', 8],
  ['class', 7], ['course', 7], ['lesson', 7], ['seminar', 7], ['discussion', 7],
  ['debate', 7], ['cook', 7], ['cooking', 7], ['write', 7], ['writing', 7],
  ['draw', 7], ['drawing', 7], ['build', 7], ['making', 7], ['create', 7],
  ['climb', 7], ['climbing', 7], ['bouldering', 7], ['dance', 7], ['dancing', 7],
  ['forage', 7], ['foraging', 7], ['guided walk', 6], ['tasting', 6], ['meditation', 6],
  ['tour', 3],
]

const PASSIVE_TERMS: Array<[string, number]> = [
  ['spectator', 10], ['watch party', 10], ['baseball game', 10], ['football game', 10],
  ['basketball game', 10], ['concert', 8], ['screening', 8], ['performance', 7],
  ['show', 7], ['festival', 7], ['match', 7], ['stadium', 7], ['movie', 7],
  ['exhibition', 6], ['audience', 6],
]

const COGNITIVE_TERMS: Array<[string, number]> = [
  ['socratic', 10], ['masterclass', 10], ['problem solving', 9], ['critical thinking', 9],
  ['debate', 9], ['seminar', 9], ['discussion', 8], ['lecture', 8], ['course', 8],
  ['workshop', 7], ['fundamentals', 7], ['technique', 7], ['science', 7],
  ['philosophy', 7], ['history', 6], ['storytelling', 6], ['guided', 5],
  ['learn', 6], ['lesson', 6], ['training', 6], ['reflect', 6], ['design', 5],
]

const REFLECTIVE_TERMS: Array<[string, number]> = [
  ['meditation', 9], ['mindfulness', 9], ['reflect', 8], ['meaning', 7], ['contemplative', 8],
  ['slow', 5], ['quiet', 5], ['observation', 6], ['attention', 6], ['stillness', 7],
]

const LEVEL_TERMS: Array<[string, number]> = [
  ['advanced', 4], ['expert', 4], ['masterclass', 4], ['intensive', 4],
  ['intermediate', 3], ['develop', 3], ['technique', 3], ['practice', 3],
  ['fundamentals', 2], ['beginner', 1], ['introduction', 1], ['intro', 1],
  ['first time', 1], ['all levels', 2],
]

const INTENT_TERMS: Record<string, string[]> = {
  deepen: ['advanced', 'craft', 'deep', 'masterclass', 'practice', 'technique'],
  passion: ['advanced', 'craft', 'deep', 'masterclass', 'practice', 'technique'],
  grow: ['build', 'class', 'course', 'fundamentals', 'learn', 'practice', 'skill', 'workshop'],
  skill: ['build', 'class', 'course', 'fundamentals', 'learn', 'practice', 'skill', 'workshop'],
  surprise: ['discover', 'guided', 'new', 'unexpected', 'wonder'],
  people: ['community', 'conversation', 'dinner', 'group', 'social', 'together'],
  outside: ['foraging', 'hike', 'nature', 'outdoors', 'stargazing', 'walk'],
  slow: ['calm', 'meditation', 'mindfulness', 'quiet', 'slow', 'stillness'],
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  const one = text(value)
  return one ? [one] : []
}

function normalized(value: string): string {
  return ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()} `
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

function termScore(haystack: string, terms: Array<[string, number]>): number {
  const hits = terms
    .filter(([term]) => haystack.includes(normalized(term)))
    .map(([, weight]) => weight)
    .sort((a, b) => b - a)
  return clamp((hits[0] ?? 0) + Math.min(hits.slice(1).reduce((sum, hit) => sum + hit, 0) * 0.18, 2))
}

function canonicalInterest(label: string): TopicKey | undefined {
  const value = normalized(label)
  return (Object.entries(TOPICS) as Array<[TopicKey, TopicDefinition]>).find(([, definition]) =>
    definition.aliases.some((alias) => value.includes(normalized(alias))) || value === normalized(definition.label)
  )?.[0]
}

function topicScore(haystack: string, definition: TopicDefinition): number {
  const matches = definition.aliases.filter((alias) => haystack.includes(normalized(alias)))
  if (!matches.length) return 0
  const best = Math.max(...matches.map((alias) => alias.includes(' ') ? 8 : 6))
  return clamp(best + Math.min((matches.length - 1) * 1.2, 2))
}

function inferFormat(haystack: string, active: number, passive: number, cognitive: number): string {
  if (passive >= 6 && active < 4) return 'spectator event'
  if (haystack.includes(' workshop ')) return 'workshop'
  if (haystack.includes(' class ') || haystack.includes(' course ') || haystack.includes(' lesson ')) return 'class'
  if (haystack.includes(' seminar ') || haystack.includes(' discussion ') || haystack.includes(' debate ')) return 'discussion'
  if (haystack.includes(' open mic ') || haystack.includes(' jam session ')) return 'participatory session'
  if (haystack.includes(' guided walk ') || haystack.includes(' guided tour ') || haystack.includes(' walking tour ')) return 'guided experience'
  if (haystack.includes(' tasting ')) return 'guided tasting'
  if (active >= 6) return 'hands-on experience'
  if (cognitive >= 6) return 'learning experience'
  if (passive >= 6) return 'spectator event'
  return 'experience'
}

function analyzeExperience(experience: Experience): CandidateSemantics {
  const publicTags = publicExperienceTags(experience)
  const sourceParts = [experience.title, experience.description, experience.location, ...publicTags]
  const haystack = normalized(sourceParts.join(' '))
  const eventWords = words(sourceParts)
  const scores = new Map<TopicKey, number>()
  for (const [key, definition] of Object.entries(TOPICS) as Array<[TopicKey, TopicDefinition]>) {
    const score = topicScore(haystack, definition)
    if (score > 0) scores.set(key, score)
  }
  const sortedTopics = [...scores.entries()].sort((a, b) => b[1] - a[1])
  const topTopic = sortedTopics[0]?.[0]
  const active = termScore(haystack, ACTIVE_TERMS)
  let passive = termScore(haystack, PASSIVE_TERMS)
  // Aggregated ticket feeds often say only "Music" and omit "concert." If there is
  // no participation evidence, treat that ambiguity as passive rather than claiming
  // it will deepen a user's musical practice.
  if (topTopic === 'live-music' && active < 4) passive = Math.max(passive, 7)
  if (topTopic === 'film' && active < 4) passive = Math.max(passive, 6)
  const cognitive = termScore(haystack, COGNITIVE_TERMS)
  const reflective = termScore(haystack, REFLECTIVE_TERMS)
  const level = LEVEL_TERMS.find(([term]) => haystack.includes(normalized(term)))?.[1]
    ?? (active >= 6 || cognitive >= 6 ? 2 : 1)
  const intimate = experience.spotsTotal <= 8
  const large = experience.spotsTotal >= 24
  const socialHits = ['community', 'conversation', 'dinner', 'group', 'social', 'strangers', 'together']
    .filter((term) => haystack.includes(normalized(term))).length
  const socialIntensity = clamp(5 + socialHits * 1.1 + (large ? 2 : 0) - (intimate ? 1.5 : 0), 1, 10)
  const descriptionEvidence = clamp(experience.description.trim().length / 55, 0, 3)
  const metadataEvidence = clamp(publicTags.length * 0.45 + (experience.location ? 1 : 0), 0, 3)
  const semanticEvidence = (topTopic ? 1.5 : 0) + (Math.max(active, passive, cognitive) >= 5 ? 1.5 : 0)
  const qualityConfidence = clamp(2 + descriptionEvidence + metadataEvidence + semanticEvidence)

  return {
    words: eventWords,
    normalizedText: haystack,
    topicScores: scores,
    topTopic,
    activeEngagement: active,
    passiveConsumption: passive,
    cognitiveDepth: cognitive,
    reflectiveDepth: reflective,
    socialIntensity,
    level,
    format: inferFormat(haystack, active, passive, cognitive),
    qualityConfidence,
  }
}

function historyWeight(signal: RecommendationHistorySignal): number {
  if (signal === 'completed') return 1.8
  if (signal === 'booked') return 1.1
  return 0.55
}

function stageFromEvidence(evidence: number): PathStage {
  if (evidence >= 5) return 'deepening'
  if (evidence >= 2.5) return 'practicing'
  if (evidence >= 0.8) return 'building'
  return 'exploring'
}

function targetLevelFor(evidence: number): number {
  if (evidence >= 5) return 4
  if (evidence >= 2.5) return 3
  if (evidence >= 0.8) return 2
  return 1
}

function buildPathStates(profile: RecommendationProfile): PathState[] {
  const history = profile.history ?? []
  return (profile.interests ?? []).map((label) => {
    const key = canonicalInterest(label)
    let evidence = 0
    for (const item of history) {
      const semantics = analyzeExperience(item.experience)
      const affinity = key
        ? (semantics.topicScores.get(key) ?? 0) / 10
        : overlap(words([label]), semantics.words).length > 0 ? 0.65 : 0
      if (affinity >= 0.45) {
        evidence += historyWeight(item.signal) * affinity * clamp(semantics.level / 2, 0.6, 1.8)
      }
    }
    return {
      key,
      label,
      evidence,
      stage: stageFromEvidence(evidence),
      targetLevel: targetLevelFor(evidence),
    }
  })
}

function matchContext(candidate: Candidate, paths: PathState[]): MatchContext {
  const direct = paths
    .map((path) => {
      const affinity = path.key
        ? (candidate.semantics.topicScores.get(path.key) ?? 0) / 10
        : overlap(words([path.label]), candidate.semantics.words).length > 0 ? 0.65 : 0
      return { path, affinity }
    })
    .sort((a, b) => b.affinity - a.affinity)[0]

  const candidateTopic = candidate.semantics.topTopic
  const bridges = candidateTopic
    ? paths
        .map((path) => ({
          path,
          affinity: path.key && TOPICS[path.key].adjacent.includes(candidateTopic) ? 0.75 : 0,
        }))
        .sort((a, b) => b.affinity - a.affinity)
    : []
  const bridge = bridges[0]
  const directAffinity = direct?.affinity ?? 0
  const trajectoryFit = direct?.path
    ? clamp(10 - Math.abs(candidate.semantics.level - direct.path.targetLevel) * 2.8)
    : 2

  return {
    directAffinity,
    matchedPath: direct?.affinity ? direct.path : undefined,
    bridgeAffinity: bridge?.affinity ?? 0,
    bridgeFrom: bridge?.affinity ? bridge.path : undefined,
    novelty: clamp(10 - directAffinity * 10),
    pathFit: trajectoryFit,
  }
}

/**
 * Adapts the questionnaire plus behavioral evidence into a single model. The
 * questionnaire sets direction; saved, booked, and completed experiences move
 * the user along that direction without erasing what they explicitly chose.
 */
export function recommendationProfileFromUser(
  user: unknown,
  context: RecommendationContext = {}
): RecommendationProfile {
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

  const experiencesById = new Map((context.experiences ?? []).map((experience) => [experience.id, experience]))
  const historyById = new Map<string, RecommendationHistoryItem>()
  const priority: Record<RecommendationHistorySignal, number> = { saved: 1, booked: 2, completed: 3 }
  const addHistory = (item: RecommendationHistoryItem) => {
    const current = historyById.get(item.experience.id)
    if (!current || priority[item.signal] > priority[current.signal]) historyById.set(item.experience.id, item)
  }

  for (const experienceId of context.passionPathExperienceIds ?? []) {
    const experience = experiencesById.get(experienceId)
    if (experience) addHistory({ experience, signal: 'saved' })
  }
  for (const booking of context.bookings ?? []) {
    if (booking.status === 'cancelled') continue
    const experience = experiencesById.get(booking.experienceId)
    if (experience) {
      addHistory({
        experience,
        signal: booking.status === 'completed' ? 'completed' : 'booked',
        occurredAt: booking.bookedAt,
      })
    }
  }

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
    accessibilityNeeds: strings(pick(source, ['accessibilityNeeds', 'accessibility_needs'])),
    history: [...historyById.values()],
  }
}

function budgetMaximum(budget: RecommendationProfile['budget']): number | null {
  if (typeof budget === 'object' && budget) return numberFrom(budget.max) ?? numberFrom(budget.min)
  const label = text(budget).toLowerCase()
  if (label.includes('mostly free')) return 15
  if (label.includes('under $50')) return 50
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
  if (/large|lively|extrovert|crowd|merrier/.test(value)) return 8
  return 5.5
}

function locationScore(candidate: Candidate, profile: RecommendationProfile): number {
  if (!profile.location) return 5
  const locationWords = words([profile.location])
  const matches = overlap(locationWords, candidate.semantics.words).length
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
  if (preferences.includes('morning') && hour < 12) score += 3
  if (preferences.includes('afternoon') && hour >= 12 && hour < 17) score += 3
  if (/evening|night/.test(preferences) && hour >= 17) score += 3
  if (/any|flexible/.test(preferences)) score += 3
  return clamp(score)
}

function planningScore(date: Date, now: Date, style?: string): number {
  const daysAway = (date.getTime() - now.getTime()) / 86_400_000
  const preference = text(style).toLowerCase()
  if (/same.day|spark|last.minute|this.week/.test(preference)) return clamp(10 - Math.abs(daysAway - 4) * 0.6)
  if (/planned|ahead|advance|calendar/.test(preference)) return clamp(10 - Math.abs(daysAway - 28) * 0.18)
  return clamp(8 - Math.abs(daysAway - 14) * 0.12)
}

function accessibilityScore(candidate: Candidate, needs: string[] | undefined): number {
  const requested = (needs ?? []).filter((need) => !/none|no preference/i.test(need))
  if (!requested.length) return 6
  const evidence: Array<[RegExp, RegExp]> = [
    [/step.?free|wheelchair|mobility|accessible entrance/i, /step.?free|wheelchair|mobility|accessible entrance|ada accessible/i],
    [/seating|seated/i, /seating|seated|chairs available/i],
    [/low.?sensory|quiet/i, /low.?sensory|quiet|small group|intimate/i],
    [/asl|caption/i, /asl|caption|interpreted|interpreter/i],
  ]
  const scores = requested.map((need) => {
    const matcher = evidence.find(([requestPattern]) => requestPattern.test(need))?.[1]
    if (!matcher) return 4.5
    return matcher.test(candidate.semantics.normalizedText) ? 10 : 4
  })
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

function intentWords(intents: string[]): Set<string> {
  const expanded = intents.flatMap((intent) => {
    const value = intent.toLowerCase()
    const related = Object.entries(INTENT_TERMS)
      .filter(([key]) => value.includes(key))
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
  return ((hash >>> 0) % 1000) / 5000
}

function laneEligibility(candidate: Candidate, lane: Lane, match: MatchContext, hasPaths: boolean): boolean {
  const semantics = candidate.semantics
  const meaningfulEngagement = clamp(
    semantics.activeEngagement + semantics.cognitiveDepth * 0.35 + semantics.reflectiveDepth * 0.2 - semantics.passiveConsumption * 0.75
  )

  if (lane === 'passion') {
    return hasPaths &&
      match.directAffinity >= 0.5 &&
      semantics.activeEngagement >= 5.5 &&
      meaningfulEngagement >= 5 &&
      semantics.passiveConsumption <= semantics.activeEngagement + 1 &&
      semantics.qualityConfidence >= 4.5
  }
  if (lane === 'growth') {
    return semantics.cognitiveDepth >= 5.5 &&
      meaningfulEngagement >= 5 &&
      semantics.passiveConsumption <= semantics.activeEngagement + semantics.cognitiveDepth * 0.45 &&
      semantics.qualityConfidence >= 4.5
  }
  return match.directAffinity < 0.5 &&
    meaningfulEngagement >= 3.5 &&
    semantics.qualityConfidence >= 4 &&
    (match.bridgeAffinity > 0 || semantics.cognitiveDepth >= 5 || semantics.activeEngagement >= 6)
}

function projectedStep(path: PathState | undefined, candidate: Candidate, lane: Lane): string {
  if (lane === 'growth') return `stretch into a ${candidate.semantics.format} that asks you to think and participate`
  if (lane === 'surprise') return `open a new direction through a ${candidate.semantics.format}`
  if (!path || path.stage === 'exploring') return `turn curiosity into a first active ${candidate.semantics.format}`
  if (path.stage === 'building') return `build consistency through a ${candidate.semantics.format}`
  if (path.stage === 'practicing') return `develop technique through a ${candidate.semantics.format}`
  return `take on a deeper challenge through a ${candidate.semantics.format}`
}

function scoreCandidate(
  candidate: Candidate,
  lane: Lane,
  profile: RecommendationProfile,
  paths: PathState[],
  now: Date,
  weekKey: string
): Recommendation {
  const match = matchContext(candidate, paths)
  const semantics = candidate.semantics
  const goalMatches = overlap(intentWords(profile.intents ?? []), semantics.words)
  const date = new Date(candidate.experience.dateTime)
  const maxBudget = budgetMaximum(profile.budget)
  const budgetFit = maxBudget === null
    ? 5
    : candidate.experience.price <= maxBudget
      ? clamp(8 + (maxBudget - candidate.experience.price) / Math.max(maxBudget, 1) * 2)
      : clamp(6 - (candidate.experience.price - maxBudget) / Math.max(maxBudget, 1) * 10)
  const socialFit = clamp(10 - Math.abs(semantics.socialIntensity - preferredSocialIntensity(profile.socialStyle)))
  const adventure = adventureLevel(profile.adventurousness)
  const meaningfulEngagement = clamp(
    semantics.activeEngagement + semantics.cognitiveDepth * 0.35 + semantics.reflectiveDepth * 0.2 - semantics.passiveConsumption * 0.75
  )
  const interestFit = clamp(match.directAffinity * 10)
  const bridgeFit = clamp(match.bridgeAffinity * 10)

  let laneFit: number
  let pathFit: number
  let adventureFit: number
  if (lane === 'passion') {
    laneFit = clamp(interestFit * 0.45 + meaningfulEngagement * 0.35 + match.pathFit * 0.2)
    pathFit = match.pathFit
    adventureFit = clamp(8 - Math.abs(adventure - 5) * 0.45)
  } else if (lane === 'growth') {
    laneFit = clamp(semantics.cognitiveDepth * 0.62 + meaningfulEngagement * 0.38)
    pathFit = clamp(5 + bridgeFit * 0.25 + Math.min(semantics.level, 4) * 0.6)
    adventureFit = clamp(8 - Math.abs(adventure - 6) * 0.4)
  } else {
    laneFit = clamp(match.novelty * 0.48 + bridgeFit * 0.25 + meaningfulEngagement * 0.27)
    pathFit = bridgeFit > 0 ? clamp(5.5 + bridgeFit * 0.45) : 4.5
    adventureFit = clamp(10 - Math.abs(adventure - match.novelty))
  }

  const breakdown: ScoreBreakdown = {
    laneFit,
    interestFit,
    intentFit: goalMatches.length ? clamp(6.5 + goalMatches.length * 1.2) : 4.5,
    locationFit: locationScore(candidate, profile),
    budgetFit,
    availabilityFit: availabilityScore(date, profile.availability),
    socialFit,
    adventureFit,
    planningFit: planningScore(date, now, profile.planningStyle),
    qualityFit: semantics.qualityConfidence,
    accessibilityFit: accessibilityScore(candidate, profile.accessibilityNeeds),
    pathFit,
    engagementFit: meaningfulEngagement,
    cognitiveFit: semantics.cognitiveDepth,
    noveltyFit: match.novelty,
  }

  const laneWeights: Record<Lane, Partial<Record<keyof ScoreBreakdown, number>>> = {
    passion: {
      laneFit: 2.4, interestFit: 2.1, pathFit: 2.2, engagementFit: 2,
      intentFit: 0.8, qualityFit: 0.9, availabilityFit: 0.8, budgetFit: 0.7,
      accessibilityFit: 0.6, locationFit: 0.6, socialFit: 0.5, planningFit: 0.5, adventureFit: 0.35,
    },
    growth: {
      laneFit: 2.5, cognitiveFit: 2.4, engagementFit: 1.6, pathFit: 1.1,
      intentFit: 1, qualityFit: 0.9, availabilityFit: 0.8, budgetFit: 0.7,
      accessibilityFit: 0.6, locationFit: 0.6, socialFit: 0.5, planningFit: 0.5, adventureFit: 0.5,
    },
    surprise: {
      laneFit: 2.5, noveltyFit: 2, adventureFit: 1.7, engagementFit: 1.3,
      pathFit: 1.2, intentFit: 0.8, qualityFit: 0.9, availabilityFit: 0.8,
      accessibilityFit: 0.6, budgetFit: 0.7, locationFit: 0.6, socialFit: 0.5, planningFit: 0.5,
    },
  }
  const score = Object.entries(laneWeights[lane]).reduce((total, [key, weight]) =>
    total + breakdown[key as keyof ScoreBreakdown] * (weight ?? 0), 0
  ) + stableJitter(`${weekKey}:${lane}:${candidate.experience.id}`)

  const topicLabel = semantics.topTopic ? TOPICS[semantics.topTopic].label : undefined
  const path = lane === 'passion' ? match.matchedPath : lane === 'surprise' ? match.bridgeFrom : undefined
  const signals: string[] = []
  if (lane === 'passion' && path) {
    signals.push(`${path.label} is part of your path`)
    signals.push(projectedStep(path, candidate, lane))
  } else if (lane === 'growth') {
    signals.push(`the ${semantics.format} requires active thought rather than passive watching`)
    if (semantics.cognitiveDepth >= 7) signals.push('it has strong learning or reflection value')
  } else {
    if (match.directAffinity >= 0.5 && match.matchedPath) {
      signals.push(`it approaches ${match.matchedPath.label} through a less familiar ${semantics.format}`)
    } else if (match.bridgeFrom && topicLabel) signals.push(`it creates a bridge from ${match.bridgeFrom.label} into ${topicLabel}`)
    else if (topicLabel) signals.push(`${topicLabel} sits outside your usual orbit`)
    signals.push(`its ${semantics.format} takes your week in an unfamiliar direction`)
  }
  if (goalMatches.length) signals.push('it supports what you said you want more of')
  if (breakdown.availabilityFit >= 7) signals.push('it fits the times you said work')
  if (maxBudget !== null && budgetFit >= 8) signals.push('it stays within your budget')
  if (breakdown.accessibilityFit >= 8) signals.push('its access details match what you asked for')

  const reasonLead: Record<Lane, string> = {
    passion: 'This advances your path:',
    growth: 'This is a meaningful stretch:',
    surprise: 'This is an adventure beyond your usual orbit:',
  }

  return {
    lane,
    experience: candidate.experience,
    score: Math.round(score * 10) / 10,
    breakdown,
    reason: `${reasonLead[lane]} ${signals.slice(0, 2).join('; ')}.`,
    signals,
    trajectory: {
      interest: path?.label ?? topicLabel,
      currentStage: path?.stage ?? 'exploring',
      projectedStep: projectedStep(path, candidate, lane),
      candidateLevel: semantics.level,
    },
  }
}

function portfolioScore(recommendations: Recommendation[]): number {
  let bonus = 0
  const topics = recommendations.map((item) => item.trajectory.interest).filter(Boolean)
  bonus += new Set(topics).size * 1.2
  bonus += new Set(recommendations.map((item) => item.experience.hostId)).size * 0.7
  bonus += new Set(recommendations.map((item) => item.experience.dateTime.slice(0, 10))).size * 0.6
  return recommendations.reduce((sum, item) => sum + item.score, 0) + bonus
}

function choosePortfolio(ranked: Map<Lane, Recommendation[]>): Recommendation[] {
  let best: Recommendation[] = []
  let bestScore = Number.NEGATIVE_INFINITY

  function visit(index: number, selected: Recommendation[], used: Set<string>) {
    if (index === LANES.length) {
      const score = portfolioScore(selected)
      if (score > bestScore) {
        bestScore = score
        best = [...selected]
      }
      return
    }
    const lane = LANES[index]
    const options = ranked.get(lane) ?? []
    if (!options.length) {
      visit(index + 1, selected, used)
      return
    }
    let available = false
    for (const option of options.slice(0, 10)) {
      if (used.has(option.experience.id)) continue
      available = true
      used.add(option.experience.id)
      selected.push(option)
      visit(index + 1, selected, used)
      selected.pop()
      used.delete(option.experience.id)
    }
    if (!available) visit(index + 1, selected, used)
  }

  visit(0, [], new Set())
  return best.sort((a, b) => LANES.indexOf(a.lane) - LANES.indexOf(b.lane))
}

function adventurePriority(recommendation: Recommendation): number {
  const { breakdown } = recommendation
  return breakdown.noveltyFit * 4 +
    breakdown.adventureFit * 1.5 +
    breakdown.engagementFit +
    breakdown.qualityFit +
    breakdown.availabilityFit * 0.5 +
    breakdown.locationFit * 0.35
}

/**
 * Passion and Growth keep their hard quality gates. If either lane cannot produce
 * an honest match, Adventure owns the open slot and selects the strongest unused
 * experience outside the member's ordinary patterns. This guarantees a complete
 * three-invitation dispatch whenever the active inventory contains three options.
 */
function completeWithAdventures(
  selected: Recommendation[],
  candidates: Candidate[],
  profile: RecommendationProfile,
  paths: PathState[],
  now: Date,
  weekKey: string
): Recommendation[] {
  if (selected.length >= WEEKLY_INVITATION_COUNT) return selected.slice(0, WEEKLY_INVITATION_COUNT)

  const usedIds = new Set(selected.map((recommendation) => recommendation.experience.id))
  const adventures = candidates
    .filter((candidate) => !usedIds.has(candidate.experience.id))
    .map((candidate) => scoreCandidate(candidate, 'surprise', profile, paths, now, weekKey))
    .sort((a, b) =>
      adventurePriority(b) - adventurePriority(a) ||
      b.breakdown.noveltyFit - a.breakdown.noveltyFit ||
      b.score - a.score ||
      a.experience.id.localeCompare(b.experience.id)
    )

  const completed = [...selected]
  while (completed.length < WEEKLY_INVITATION_COUNT && adventures.length > 0) {
    const usedHosts = new Set(completed.map((item) => item.experience.hostId))
    const usedDates = new Set(completed.map((item) => item.experience.dateTime.slice(0, 10)))
    const usedTopics = new Set(completed.map((item) => item.trajectory.interest).filter(Boolean))
    const diverseIndex = adventures.findIndex((item) =>
      !usedHosts.has(item.experience.hostId) &&
      !usedDates.has(item.experience.dateTime.slice(0, 10)) &&
      (!item.trajectory.interest || !usedTopics.has(item.trajectory.interest))
    )
    const [next] = adventures.splice(diverseIndex >= 0 ? diverseIndex : 0, 1)
    completed.push(next)
  }

  return completed.sort((a, b) => LANES.indexOf(a.lane) - LANES.indexOf(b.lane))
}

/**
 * Serendipity Trajectory Engine
 *
 * 1. Infer what an event asks the guest to do, not merely what category it has.
 * 2. Build a stage for every declared passion from saved/booked/completed evidence.
 * 3. Project the next achievable step instead of repeating or overreaching.
 * 4. Apply hard quality gates per lane, then optimize the three invitations as a set.
 */
export function createWeeklyRecommendations(
  experiences: Experience[],
  profile: RecommendationProfile,
  options: { now?: Date; weekKey?: string } = {}
): RecommendationDispatch {
  const now = options.now ?? new Date()
  const weekKey = options.weekKey ?? now.toISOString().slice(0, 10)
  const paths = buildPathStates(profile)
  const historyIds = new Set((profile.history ?? []).map((item) => item.experience.id))
  const candidates = experiences
    .filter((experience) => {
      const date = new Date(experience.dateTime)
      return Number.isFinite(date.getTime()) &&
        date.getTime() > now.getTime() &&
        experience.spotsBooked < experience.spotsTotal &&
        !historyIds.has(experience.id) &&
        !/cancelled|canceled|postponed|sold\s*out/i.test(experience.title)
    })
    .map((experience) => ({ experience, semantics: analyzeExperience(experience) }))

  const ranked = new Map<Lane, Recommendation[]>()
  for (const lane of LANES) {
    const recommendations = candidates
      .filter((candidate) => laneEligibility(candidate, lane, matchContext(candidate, paths), paths.length > 0))
      .map((candidate) => scoreCandidate(candidate, lane, profile, paths, now, weekKey))
      .sort((a, b) => b.score - a.score || a.experience.id.localeCompare(b.experience.id))
    ranked.set(lane, recommendations)
  }

  const recommendations = completeWithAdventures(
    choosePortfolio(ranked),
    candidates,
    profile,
    paths,
    now,
    weekKey
  )
  const selectedLanes = new Set(recommendations.map((recommendation) => recommendation.lane))
  const shortages = LANES.filter((lane) => !selectedLanes.has(lane))
  return { recommendations, shortages, eligibleCount: candidates.length }
}
