export type TravelRadius = 'Right around me' | 'Nearby' | 'Worth the trip'

export type SocialStyle = 'Mostly solo' | 'Small groups' | 'A mix' | 'The more the merrier'

export type BudgetPreference = 'Mostly free' | 'Under $50' | 'A little of both' | 'Worth a splurge'

export type PlanningStyle = 'Same-day sparks' | 'A little of both' | 'Planned ahead'

import type { User } from '@serendipity-hq/design'

export type OnboardingProfile = {
  city: string
  neighborhood: string
  travelRadius: TravelRadius
  interests: string[]
  intents: string[]
  adventurousness: number
  socialStyle: SocialStyle
  budgetStyle: BudgetPreference
  availability: string[]
  planningStyle: PlanningStyle
  accessibilityNeeds: string[]
  completedAt: string
}

export type AppUser = User & { onboardingProfile?: OnboardingProfile }

export const DEFAULT_ATTENDEE_PROFILE: OnboardingProfile = {
  city: 'San Francisco',
  neighborhood: '',
  travelRadius: 'Nearby',
  interests: [],
  intents: [],
  adventurousness: 58,
  socialStyle: 'A mix',
  budgetStyle: 'A little of both',
  availability: ['Saturday'],
  planningStyle: 'A little of both',
  accessibilityNeeds: [],
  completedAt: '',
}
