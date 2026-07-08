import type { NormalizedExperience } from "./types";

export function reviewReason(experience: NormalizedExperience) {
  const reasons: string[] = [];
  if (experience.quality_score < 75) reasons.push("quality score below auto-approval threshold");
  if (experience.serendipity_score < 65) reasons.push("serendipity score below auto-approval threshold");
  if (!experience.start_time) reasons.push("missing start time");
  if (!experience.address && !experience.venue_name) reasons.push("missing physical location");
  if (/online|webinar|virtual/i.test(`${experience.title} ${experience.description}`)) reasons.push("may be online-only");
  return reasons.join("; ") || "needs human review";
}

export function reviewConfidence(experience: NormalizedExperience) {
  return Math.round((experience.quality_score + experience.serendipity_score) / 2);
}
