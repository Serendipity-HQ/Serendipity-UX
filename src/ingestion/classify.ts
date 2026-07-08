import type { ExtractedExperience, RecommendationBucket } from "./types";

const categoryKeywords: Array<[string, string[]]> = [
  ["coffee", ["coffee", "espresso", "cupping", "roast"]],
  ["art", ["gallery", "museum", "artist", "exhibition", "opening"]],
  ["craft", ["pottery", "ceramic", "woodworking", "craft", "workshop", "maker"]],
  ["design", ["architecture", "design", "sketch", "industrial", "furniture"]],
  ["startup", ["startup", "founder", "venture", "pitch", "ai", "robotics"]],
  ["fitness", ["run", "running", "climb", "climbing", "fitness", "hike"]],
  ["music", ["jazz", "live music", "concert", "listening"]],
  ["food", ["cooking", "dinner", "fermentation", "food", "tasting"]],
  ["volunteering", ["volunteer", "service", "community cleanup", "mutual aid"]],
  ["books", ["book", "author", "reading", "bookstore"]],
];

export function classifyCategory(experience: Pick<ExtractedExperience, "title" | "description" | "category">) {
  if (experience.category) return experience.category.toLowerCase();
  const haystack = `${experience.title} ${experience.description ?? ""}`.toLowerCase();
  return categoryKeywords.find(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))?.[0] ?? "community";
}

export function classifyTags(experience: ExtractedExperience) {
  const haystack = `${experience.title} ${experience.description ?? ""} ${experience.category ?? ""}`.toLowerCase();
  const tags = new Set(experience.tags ?? []);
  for (const [category, keywords] of categoryKeywords) {
    if (keywords.some((keyword) => haystack.includes(keyword))) tags.add(category);
  }
  if (haystack.includes("beginner") || haystack.includes("intro")) tags.add("beginner-friendly");
  if (haystack.includes("workshop") || haystack.includes("hands-on")) tags.add("hands-on");
  if (haystack.includes("weekly") || haystack.includes("recurring")) tags.add("recurring");
  return [...tags].slice(0, 12);
}

export function classifyVibe(experience: ExtractedExperience) {
  const haystack = `${experience.title} ${experience.description ?? ""}`.toLowerCase();
  const vibe = new Set(experience.vibe ?? []);
  if (haystack.includes("workshop") || haystack.includes("hands-on")) vibe.add("tactile");
  if (haystack.includes("salon") || haystack.includes("talk") || haystack.includes("lecture")) vibe.add("thoughtful");
  if (haystack.includes("run") || haystack.includes("climb")) vibe.add("active");
  if (haystack.includes("jazz") || haystack.includes("dinner")) vibe.add("social");
  if (haystack.includes("museum") || haystack.includes("gallery")) vibe.add("cultural");
  return [...vibe].slice(0, 8);
}

export function classifyRecommendationBucket(experience: ExtractedExperience): RecommendationBucket {
  const haystack = `${experience.title} ${experience.description ?? ""} ${experience.category ?? ""}`.toLowerCase();
  if (["intro", "beginner", "workshop", "class", "learn"].some((word) => haystack.includes(word))) return "growth";
  if (["unusual", "secret", "pop-up", "surprise", "experimental", "sailing", "fermentation"].some((word) => haystack.includes(word))) return "surprise";
  if (["club", "meetup", "community", "run", "cars", "coffee", "founder"].some((word) => haystack.includes(word))) return "passion";
  return "unknown";
}

export function inferSocialIntensity(experience: ExtractedExperience) {
  const haystack = `${experience.title} ${experience.description ?? ""}`.toLowerCase();
  if (["party", "mixer", "networking"].some((word) => haystack.includes(word))) return 5;
  if (["club", "dinner", "run", "meetup"].some((word) => haystack.includes(word))) return 4;
  if (["workshop", "class", "talk"].some((word) => haystack.includes(word))) return 3;
  if (["museum", "gallery", "walk"].some((word) => haystack.includes(word))) return 2;
  return 3;
}
