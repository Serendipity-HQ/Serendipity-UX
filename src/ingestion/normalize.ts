import { normalizedExperienceSchema } from "./schema";
import { classifyCategory, classifyRecommendationBucket, classifyTags, classifyVibe, inferSocialIntensity } from "./classify";
import { scoreQuality, scoreSerendipity } from "./score";
import type { ExtractedExperience, NormalizedExperience } from "./types";

function normalizeString(value?: string) {
  return value?.trim().replace(/\s+/g, " ");
}

function isOnlineOnly(experience: ExtractedExperience) {
  const text = `${experience.title} ${experience.description ?? ""} ${experience.address ?? ""}`.toLowerCase();
  return ["webinar", "online only", "virtual event", "zoom"].some((term) => text.includes(term));
}

export function normalizeExperience(input: ExtractedExperience): NormalizedExperience {
  const category = classifyCategory(input);
  const normalized: NormalizedExperience = {
    ...input,
    title: normalizeString(input.title) ?? input.title,
    description: normalizeString(input.description) ?? "No description provided yet.",
    city: normalizeString(input.city) ?? "San Francisco",
    timezone: input.timezone ?? "America/Los_Angeles",
    category,
    tags: classifyTags({ ...input, category }),
    vibe: classifyVibe(input),
    recommendation_bucket: input.recommendation_bucket ?? classifyRecommendationBucket(input),
    social_intensity: input.social_intensity ?? inferSocialIntensity(input),
    beginner_friendly: input.beginner_friendly ?? /beginner|intro|all levels|open to all/i.test(`${input.title} ${input.description ?? ""}`),
    recurring: input.recurring ?? /weekly|monthly|recurring|every /i.test(`${input.title} ${input.description ?? ""}`),
    currency: input.currency ?? "USD",
    status: "review",
    quality_score: 0,
    serendipity_score: 0,
    last_seen_at: new Date().toISOString(),
  };

  normalized.quality_score = scoreQuality(normalized);
  normalized.serendipity_score = scoreSerendipity(normalized);
  normalized.status = normalized.quality_score >= 75 && normalized.serendipity_score >= 65 && !isOnlineOnly(input) ? "approved" : "review";

  return normalizedExperienceSchema.parse(normalized);
}
