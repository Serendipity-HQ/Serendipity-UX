export type ExperienceKind = "Passion" | "Growth" | "Surprise";

export type Experience = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  city: string;
  location: string;
  host: string;
  cost: string;
  category: string;
  tags: string[];
  vibe: string;
  beginnerFriendly: boolean;
  socialIntensity: "quiet" | "moderate" | "social";
  cadence: "Recurring" | "One-Time";
  recommendationKind: ExperienceKind;
  whyRecommended: string;
  community: string;
  anonymousGuests: AnonymousGuest[];
  proofMethod: string;
  coordinates?: { lat: number; lng: number };
};

export type OnboardingState = {
  interests: string[];
  feelings: string[];
  goals: string[];
};

export type AnonymousGuest = {
  code: string;
  currentlyExploring: string[];
  recentPath: string[];
  attendingBecause: string;
};
