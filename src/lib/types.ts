export type ExperienceKind = "Passion" | "Growth" | "Surprise";
export type ExperienceStatus = "draft" | "review" | "approved" | "rejected" | "expired";
export type UserExperienceStatus = "saved" | "going" | "attended" | "skipped";

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
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string;
  neighborhood?: string | null;
  address?: string | null;
  venueName?: string | null;
  hostName?: string | null;
  sourceUrl?: string | null;
  canonicalUrl?: string | null;
  imageUrl?: string | null;
  costMin?: number | null;
  costMax?: number | null;
  currency?: string;
  status?: ExperienceStatus;
  featured?: boolean;
  qualityScore?: number;
  serendipityScore?: number;
  submittedBy?: string | null;
  adminNotes?: string | null;
};

export type OnboardingState = {
  city?: string;
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

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  city: string | null;
  interests: string[];
  desired_feelings: string[];
  goals: string[];
  is_admin: boolean;
};

export type Reflection = {
  id: string;
  user_id: string;
  experience_id: string;
  attended: boolean;
  surprised_by: string | null;
  people_met: string | null;
  would_return: boolean | null;
  sparked_interest_tags: string[];
  private_note: string | null;
  created_at: string;
};
