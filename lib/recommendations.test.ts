import assert from 'node:assert/strict'
import test from 'node:test'
import type { Experience } from '@serendipity-hq/design'
import {
  createWeeklyRecommendations,
  recommendationProfileFromUser,
  type RecommendationHistoryItem,
  type RecommendationProfile,
} from './recommendations'

const NOW = new Date('2026-07-20T12:00:00-07:00')

function experience(
  id: string,
  title: string,
  description: string,
  tags: string[],
  dateTime = '2026-08-08T18:00:00-07:00'
): Experience {
  return {
    id,
    title,
    description,
    tags,
    lane: 'surprise',
    hostId: `host-${id}`,
    location: 'Mission District, San Francisco',
    dateTime,
    price: 35,
    spotsTotal: 12,
    spotsBooked: 2,
    imageSeed: id,
  }
}

function dispatch(events: Experience[], profile: RecommendationProfile) {
  return createWeeklyRecommendations(events, profile, { now: NOW, weekKey: '2026-W30' })
}

test('Passion chooses active musical practice over a concert with the same topic', () => {
  const concert = experience(
    'concert',
    'Indie Summer Concert',
    'A touring band performs a live set for an audience.',
    ['Music', 'Concert', 'Rock']
  )
  concert.lane = 'passion'
  const workshop = experience(
    'songwriting',
    'Songwriting Circle and Open Mic',
    'Write a verse, practice it with musicians, and perform it in a facilitated small-group workshop.',
    ['Live Music', 'Songwriting', 'Workshop', 'Participatory']
  )

  const result = dispatch([concert, workshop], { interests: ['Live Music'] })
  const passion = result.recommendations.find((item) => item.lane === 'passion')

  assert.equal(passion?.experience.id, 'songwriting')
  assert.notEqual(passion?.experience.id, 'concert')
})

test('Growth requires active cognitive engagement and rejects spectator sports', () => {
  const baseball = experience(
    'baseball',
    'Giants Baseball Game',
    'Watch the game from the stadium stands.',
    ['Baseball', 'Game', 'Spectator']
  )
  const seminar = experience(
    'seminar',
    'The Examined Life',
    'A Socratic seminar where six people debate identity, meaning, and the good life.',
    ['Philosophy', 'Discussion', 'Seminar']
  )

  const result = dispatch([baseball, seminar], { interests: ['Cooking'] })
  const growth = result.recommendations.find((item) => item.lane === 'growth')

  assert.equal(growth?.experience.id, 'seminar')
  assert.notEqual(growth?.experience.id, 'baseball')
})

test('Completed path evidence advances the projected level instead of repeating an introduction', () => {
  const completed: RecommendationHistoryItem[] = ['one', 'two', 'three'].map((suffix) => ({
    signal: 'completed',
    experience: experience(
      `completed-${suffix}`,
      'Pottery Fundamentals Workshop',
      'A hands-on pottery class practicing wheel throwing fundamentals in clay.',
      ['Pottery', 'Workshop', 'Fundamentals']
    ),
  }))
  const introduction = experience(
    'pottery-intro',
    'Introduction to Pottery',
    'A first-time hands-on pottery class covering clay and wheel throwing.',
    ['Pottery', 'Introduction', 'Workshop']
  )
  const advanced = experience(
    'pottery-advanced',
    'Advanced Throwing and Glaze Lab',
    'An advanced studio workshop to practice throwing technique and develop a finished ceramic piece.',
    ['Pottery', 'Advanced', 'Practice', 'Workshop']
  )

  const result = dispatch([introduction, advanced], {
    interests: ['Pottery'],
    history: completed,
  })
  const passion = result.recommendations.find((item) => item.lane === 'passion')

  assert.equal(passion?.experience.id, 'pottery-advanced')
  assert.equal(passion?.trajectory.currentStage, 'deepening')
})

test('Surprise prefers an adjacent new direction over an arbitrary unrelated activity', () => {
  const foraging = experience(
    'foraging',
    'Urban Foraging Field Lab',
    'A participatory workshop identifying edible plants and mushrooms in the city.',
    ['Foraging', 'Workshop', 'Plant Identification']
  )
  const pottery = experience(
    'pottery',
    'Clay Handbuilding Workshop',
    'A hands-on workshop where you make and design a clay vessel.',
    ['Pottery', 'Workshop', 'Craft']
  )
  const seminar = experience(
    'growth',
    'Designing Better Cities',
    'A facilitated seminar and discussion about urban design and public life.',
    ['Design', 'Seminar', 'Discussion']
  )

  const result = dispatch([foraging, pottery, seminar], {
    interests: ['Hiking'],
    adventurousness: 58,
  })
  const surprise = result.recommendations.find((item) => item.lane === 'surprise')

  assert.equal(surprise?.experience.id, 'foraging')
})

test('A weekly dispatch always has one Passion, one Growth, and one Adventure invitation', () => {
  const growth = experience(
    'growth',
    'The Examined Life',
    'A Socratic seminar where six people debate identity, meaning, and the good life.',
    ['Philosophy', 'Discussion', 'Seminar']
  )
  const dance = experience(
    'dance',
    'Beginner Tango Night',
    'A participatory dance lesson where newcomers learn a short tango sequence together.',
    ['Dance', 'Lesson', 'Participatory']
  )
  const astronomy = experience(
    'astronomy',
    'Rooftop Telescope Lab',
    'A guided astronomy workshop using telescopes to identify planets and constellations.',
    ['Astronomy', 'Workshop', 'Stargazing']
  )
  const pottery = experience(
    'pottery',
    'Clay Handbuilding Workshop',
    'A hands-on workshop where you make and design a clay vessel.',
    ['Pottery', 'Workshop', 'Craft']
  )

  const result = dispatch([growth, dance, astronomy, pottery], {
    interests: ['Cooking'],
    adventurousness: 80,
  })

  assert.equal(result.recommendations.length, 3)
  assert.equal(new Set(result.recommendations.map((item) => item.experience.id)).size, 3)
  assert.deepEqual(result.recommendations.map((item) => item.lane), ['passion', 'growth', 'surprise'])
  assert.ok(result.recommendations
    .find((item) => item.lane === 'surprise')
    ?.reason.startsWith('This is an adventure beyond your usual orbit:'))
})

test('Adventure supplements prioritize what is least ordinary for the member', () => {
  const familiar = experience(
    'familiar',
    'Advanced Fermentation Workshop',
    'A hands-on cooking workshop about fermentation technique and live cultures.',
    ['Cooking', 'Workshop', 'Advanced']
  )
  const adjacent = experience(
    'adjacent',
    'Urban Foraging Field Lab',
    'A participatory workshop identifying edible plants and mushrooms in the city.',
    ['Foraging', 'Workshop', 'Plant Identification']
  )
  const unexpected = experience(
    'unexpected',
    'Rooftop Telescope Lab',
    'A participatory rooftop stargazing night using telescopes to identify planets and constellations.',
    ['Astronomy', 'Participatory', 'Stargazing']
  )

  const result = dispatch([familiar, adjacent, unexpected], {
    interests: ['Cooking'],
    adventurousness: 90,
  })
  const adventure = result.recommendations.find((item) => item.lane === 'surprise')

  assert.equal(result.recommendations.length, 3)
  assert.equal(adventure?.experience.id, 'unexpected')
  assert.ok((adventure?.breakdown.noveltyFit ?? 0) >= 5)
})

test('Questionnaire direction and behavioral history are combined into one profile', () => {
  const saved = experience(
    'saved-pottery',
    'Pottery Practice Lab',
    'A hands-on pottery studio session for practicing wheel throwing.',
    ['Pottery', 'Practice']
  )
  const booked = experience(
    'booked-pottery',
    'Ceramic Technique Workshop',
    'A pottery workshop focused on handles, glaze, and throwing technique.',
    ['Pottery', 'Workshop', 'Technique']
  )
  const cancelled = experience(
    'cancelled-pottery',
    'Clay Class',
    'A hands-on pottery class.',
    ['Pottery', 'Class']
  )

  const profile = recommendationProfileFromUser({
    interests: ['Pottery'],
    onboardingProfile: {
      city: 'San Francisco',
      neighborhood: 'Mission',
      intents: ['Deepen a passion'],
    },
  }, {
    experiences: [saved, booked, cancelled],
    passionPathExperienceIds: [saved.id],
    bookings: [
      { id: 'b1', userId: 'u1', experienceId: booked.id, status: 'completed', bookedAt: NOW.toISOString(), transactionId: 't1' },
      { id: 'b2', userId: 'u1', experienceId: cancelled.id, status: 'cancelled', bookedAt: NOW.toISOString(), transactionId: 't2' },
    ],
  })

  assert.deepEqual(profile.interests, ['Pottery'])
  assert.equal(profile.location, 'Mission San Francisco')
  assert.deepEqual(profile.history?.map((item) => [item.experience.id, item.signal]), [
    ['saved-pottery', 'saved'],
    ['booked-pottery', 'completed'],
  ])
})
