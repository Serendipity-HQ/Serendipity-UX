import type { NormalizedExperience } from "./types";

export function scoreQuality(experience: Pick<NormalizedExperience, "title" | "description" | "start_time" | "venue_name" | "address" | "source_url" | "city">) {
  let score = 0;
  if (experience.title.length > 8) score += 15;
  if (experience.description.length > 60) score += 20;
  if (experience.start_time) score += 20;
  if (experience.venue_name) score += 12;
  if (experience.address) score += 12;
  if (experience.source_url) score += 10;
  if (experience.city.toLowerCase().includes("san francisco")) score += 11;
  return Math.min(score, 100);
}

export function scoreSerendipity(experience: Pick<NormalizedExperience, "tags" | "vibe" | "beginner_friendly" | "recurring" | "social_intensity" | "category" | "description">) {
  let score = 20;
  if (experience.beginner_friendly) score += 12;
  if (experience.recurring) score += 12;
  if (experience.social_intensity >= 2 && experience.social_intensity <= 4) score += 12;
  if (experience.tags.length >= 2) score += 10;
  if (experience.vibe.length >= 1) score += 8;
  if (["craft", "design", "startup", "fitness", "art", "volunteering", "books", "coffee"].includes(experience.category ?? "")) score += 12;
  if (experience.description.toLowerCase().includes("community")) score += 8;
  if (experience.description.toLowerCase().includes("online") || experience.description.toLowerCase().includes("webinar")) score -= 40;
  return Math.max(0, Math.min(score, 100));
}
