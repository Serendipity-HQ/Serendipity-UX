import type { NormalizedExperience } from "./types";

export type ExistingExperienceForDedupe = {
  id: string;
  title: string;
  start_time: string | null;
  venue_name: string | null;
  source_url: string | null;
  canonical_url: string | null;
};

function normalize(value?: string | null) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function jaccard(a: string, b: string) {
  const aSet = new Set(normalize(a).split(/\s+/).filter(Boolean));
  const bSet = new Set(normalize(b).split(/\s+/).filter(Boolean));
  if (!aSet.size || !bSet.size) return 0;
  const intersection = [...aSet].filter((word) => bSet.has(word)).length;
  const union = new Set([...aSet, ...bSet]).size;
  return intersection / union;
}

export function findDuplicate(experience: NormalizedExperience, existing: ExistingExperienceForDedupe[]) {
  return existing.find((candidate) => {
    if (candidate.source_url && candidate.source_url === experience.source_url) return true;
    if (candidate.canonical_url && experience.canonical_url && candidate.canonical_url === experience.canonical_url) return true;
    const sameVenue = normalize(candidate.venue_name) && normalize(candidate.venue_name) === normalize(experience.venue_name);
    const sameDay =
      candidate.start_time &&
      experience.start_time &&
      new Date(candidate.start_time).toISOString().slice(0, 10) === new Date(experience.start_time).toISOString().slice(0, 10);
    return jaccard(candidate.title, experience.title) >= 0.72 && Boolean(sameVenue || sameDay);
  });
}
