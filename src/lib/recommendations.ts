import type { Experience, ExperienceKind, OnboardingState } from "./types";

type RecommendationRole = "passion" | "growth" | "surprise" | "alternate";

type ScoredCandidate = {
  experience: Experience;
  score: number;
  reason: string;
};

export type WeeklyRecommendationSet = {
  primary: Experience[];
  alternates: Experience[];
};

const DEFAULT_PROFILE: OnboardingState = {
  city: "San Francisco",
  interests: ["Design", "Coffee", "Architecture"],
  feelings: ["Curious", "Connected"],
  goals: ["Community", "Learn skills", "Explore the city"],
};

const ADJACENCY_MAP: Record<string, string[]> = {
  art: ["design", "galleries", "museums", "photography", "pottery", "sketching"],
  architecture: ["design", "history", "photography", "urbanism", "woodworking"],
  books: ["writing", "coffee", "lectures", "salons", "community"],
  cars: ["automotive design", "industrial design", "sketching", "maker spaces"],
  coffee: ["bookstores", "startups", "design", "third places", "community"],
  cooking: ["fermentation", "culture", "travel", "community dinners"],
  design: ["architecture", "industrial design", "maker spaces", "photography", "woodworking"],
  fashion: ["design", "galleries", "culture", "photography"],
  film: ["photography", "jazz", "culture", "lectures"],
  jazz: ["nightlife", "culture", "music", "community"],
  making: ["woodworking", "pottery", "maker spaces", "industrial design"],
  music: ["jazz", "nightlife", "culture", "community"],
  outdoors: ["running", "climbing", "sailing", "volunteering"],
  photography: ["architecture", "travel", "galleries", "film"],
  robotics: ["ai", "maker spaces", "startups", "industrial design"],
  running: ["fitness", "community", "outdoors", "volunteering"],
  startups: ["coffee", "ai", "design", "founders", "lectures"],
};

function normalize(term: string) {
  return term.toLowerCase().trim();
}

function uniqueTerms(terms: string[]) {
  return [...new Set(terms.map(normalize).filter(Boolean))];
}

function profileTerms(profile?: OnboardingState | null) {
  const merged = {
    ...DEFAULT_PROFILE,
    ...profile,
    interests: profile?.interests?.length ? profile.interests : DEFAULT_PROFILE.interests,
    feelings: profile?.feelings?.length ? profile.feelings : DEFAULT_PROFILE.feelings,
    goals: profile?.goals?.length ? profile.goals : DEFAULT_PROFILE.goals,
  };

  const interests = uniqueTerms(merged.interests);
  const feelings = uniqueTerms(merged.feelings);
  const goals = uniqueTerms(merged.goals);
  const adjacent = uniqueTerms(interests.flatMap((interest) => ADJACENCY_MAP[interest] ?? []));

  return { interests, feelings, goals, adjacent };
}

function searchableText(experience: Experience) {
  return [
    experience.title,
    experience.description,
    experience.longDescription,
    experience.category,
    experience.vibe,
    experience.community,
    experience.location,
    experience.neighborhood ?? "",
    ...experience.tags,
  ]
    .join(" ")
    .toLowerCase();
}

function termOverlap(text: string, terms: string[]) {
  return terms.reduce((score, term) => score + (term && text.includes(term) ? 1 : 0), 0);
}

function socialTarget(goalTerms: string[]) {
  if (goalTerms.some((goal) => ["meet people", "community", "find community", "new friends"].includes(goal))) return "social";
  if (goalTerms.some((goal) => ["peaceful", "confidence", "try new things"].includes(goal))) return "moderate";
  return "moderate";
}

function socialFit(experience: Experience, goalTerms: string[]) {
  const target = socialTarget(goalTerms);
  if (experience.socialIntensity === target) return 1;
  if (target === "moderate") return 0.75;
  if (experience.socialIntensity === "moderate") return 0.6;
  return 0.25;
}

function frictionPenalty(experience: Experience) {
  let penalty = 0;
  if (!experience.beginnerFriendly) penalty += 4;
  if ((experience.costMax ?? experience.costMin ?? 0) > 50) penalty += 5;
  if ((experience.costMax ?? experience.costMin ?? 0) > 100) penalty += 7;
  if (!experience.startTime && experience.cadence === "One-Time") penalty += 3;
  return penalty;
}

function kindBoost(experience: Experience, kind: ExperienceKind) {
  return experience.recommendationKind === kind ? 12 : 0;
}

function diversityPenalty(experience: Experience, chosen: Experience[]) {
  const sameCategory = chosen.some((item) => item.category === experience.category);
  const sameVenue = chosen.some((item) => item.location === experience.location);
  return (sameCategory ? 8 : 0) + (sameVenue ? 10 : 0);
}

function makeReason(role: RecommendationRole, experience: Experience, profile?: OnboardingState | null) {
  const terms = profileTerms(profile);
  const text = searchableText(experience);
  const matchedInterest = terms.interests.find((term) => text.includes(term));
  const matchedAdjacent = terms.adjacent.find((term) => text.includes(term));
  const matchedGoal = terms.goals.find((term) => text.includes(term));
  const place = experience.neighborhood || experience.location;

  if (role === "passion") {
    return matchedInterest
      ? `It deepens your interest in ${matchedInterest} through a real-world experience in ${place}.`
      : `It is a low-friction way to deepen something you already seem drawn toward in ${place}.`;
  }

  if (role === "growth") {
    return matchedAdjacent
      ? `It bridges from your current interests toward ${matchedAdjacent}, giving you a practical next door to open.`
      : matchedGoal
        ? `It connects to your goal of ${matchedGoal} without turning discovery into an endless feed.`
        : `It sits just outside your current pattern, which makes it useful for growth without feeling random.`;
  }

  if (role === "surprise") {
    return experience.serendipityScore && experience.serendipityScore >= 75
      ? `It is locally distinctive, socially alive, and likely to spark a new curiosity you would not normally search for.`
      : `It gives you a bounded surprise: unfamiliar enough to expand your week, but concrete enough to actually attend.`;
  }

  return `This is an alternate path if the main invitations are too far, too familiar, or not the right energy this week.`;
}

function withReason(experience: Experience, reason: string, kind?: ExperienceKind): Experience {
  return {
    ...experience,
    recommendationKind: kind ?? experience.recommendationKind,
    whyRecommended: reason,
  };
}

function scoreCandidate(
  experience: Experience,
  role: RecommendationRole,
  profile: OnboardingState | null | undefined,
  chosen: Experience[] = [],
): ScoredCandidate {
  const terms = profileTerms(profile);
  const text = searchableText(experience);
  const interestOverlap = termOverlap(text, terms.interests);
  const goalOverlap = termOverlap(text, terms.goals);
  const feelingOverlap = termOverlap(text, terms.feelings);
  const adjacentOverlap = termOverlap(text, terms.adjacent);
  const quality = experience.qualityScore ?? 60;
  const serendipity = experience.serendipityScore ?? 60;
  const communityPotential = experience.cadence === "Recurring" ? 1 : 0.65;
  const beginnerFit = experience.beginnerFriendly ? 1 : 0.35;
  const social = socialFit(experience, terms.goals);

  let score = 0;

  if (role === "passion") {
    score =
      interestOverlap * 25 +
      goalOverlap * 7 +
      feelingOverlap * 4 +
      quality * 0.2 +
      communityPotential * 8 +
      beginnerFit * 5 +
      social * 5 +
      kindBoost(experience, "Passion");
  } else if (role === "growth") {
    score =
      adjacentOverlap * 23 +
      goalOverlap * 14 +
      interestOverlap * 8 +
      feelingOverlap * 7 +
      serendipity * 0.16 +
      quality * 0.12 +
      beginnerFit * 6 +
      communityPotential * 6 +
      social * 5 +
      kindBoost(experience, "Growth");
  } else if (role === "surprise") {
    score =
      serendipity * 0.35 +
      quality * 0.15 +
      feelingOverlap * 10 +
      goalOverlap * 5 +
      Math.max(0, 3 - interestOverlap) * 6 +
      communityPotential * 9 +
      beginnerFit * 4 +
      social * 4 +
      kindBoost(experience, "Surprise");
  } else {
    score =
      interestOverlap * 10 +
      adjacentOverlap * 10 +
      goalOverlap * 7 +
      feelingOverlap * 5 +
      serendipity * 0.14 +
      quality * 0.12 +
      beginnerFit * 5 +
      communityPotential * 4;
  }

  score -= frictionPenalty(experience);
  score -= diversityPenalty(experience, chosen);

  return {
    experience,
    score,
    reason: makeReason(role, experience, profile),
  };
}

function pickBest(
  candidates: Experience[],
  role: RecommendationRole,
  kind: ExperienceKind,
  profile: OnboardingState | null | undefined,
  chosen: Experience[],
) {
  const picked = candidates
    .filter((experience) => !chosen.some((item) => item.id === experience.id))
    .map((experience) => scoreCandidate(experience, role, profile, chosen))
    .sort((a, b) => b.score - a.score)[0];

  if (!picked) return null;
  return withReason(picked.experience, picked.reason, kind);
}

function sortAlternates(candidates: Experience[], profile?: OnboardingState | null, chosen: Experience[] = []) {
  return candidates
    .filter((experience) => !chosen.some((item) => item.id === experience.id))
    .map((experience) => scoreCandidate(experience, "alternate", profile, chosen))
    .sort((a, b) => b.score - a.score)
    .map((candidate) => withReason(candidate.experience, candidate.reason));
}

export function buildWeeklyRecommendationSet(
  experiences: Experience[],
  profile?: OnboardingState | null,
): WeeklyRecommendationSet {
  const pool = experiences.filter((experience) => experience.status !== "expired");
  const chosen: Experience[] = [];

  const passion = pickBest(pool, "passion", "Passion", profile, chosen);
  if (passion) chosen.push(passion);

  const growth = pickBest(pool, "growth", "Growth", profile, chosen);
  if (growth) chosen.push(growth);

  const surprise = pickBest(pool, "surprise", "Surprise", profile, chosen);
  if (surprise) chosen.push(surprise);

  const alternates = sortAlternates(pool, profile, chosen).slice(0, 3);

  return {
    primary: chosen,
    alternates,
  };
}
