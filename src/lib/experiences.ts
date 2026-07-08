import type { Experience } from "./types";

export const interests = [
  "Cars",
  "Design",
  "Music",
  "Startups",
  "AI",
  "Robotics",
  "Architecture",
  "Cooking",
  "Photography",
  "Hiking",
  "Ceramics",
  "Books",
  "Fashion",
  "Coffee",
  "Film",
  "Woodworking",
  "Volunteering",
  "Museums",
  "Running",
  "Climbing",
  "Making/Craft",
];

export const feelings = [
  "Curious",
  "Creative",
  "Connected",
  "Challenged",
  "Inspired",
  "Adventurous",
  "Peaceful",
  "Useful",
  "Grounded",
];

export const goals = [
  "Meet people",
  "Learn skills",
  "Explore the city",
  "Find community",
  "Build confidence",
  "Try new things",
  "Deepen passions",
  "Better routines",
  "A richer city life",
];

// No fake fallback events. The product should show only real, source-linked,
// approved experiences from Supabase or user/admin submissions.
export const experiences: Experience[] = [];

export function getWeeklyRecommendations() {
  return [];
}

export function getExperience() {
  return undefined;
}

export function getRelatedExperiences() {
  return [];
}
