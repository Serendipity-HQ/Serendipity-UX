import { experiences as seededExperiences } from "./experiences";
import { mapExperienceRow } from "./experienceMapper";
import { createPublicServerClient, createServiceClient } from "./serverAuth";
import type { Experience, OnboardingState } from "./types";

export type ExperienceFilters = {
  city?: string;
  category?: string;
  neighborhood?: string;
  bucket?: string;
  tag?: string;
  beginner?: boolean;
  free?: boolean;
  query?: string;
};

function filterSeeded(filters: ExperienceFilters = {}) {
  const query = filters.query?.toLowerCase();
  return seededExperiences.filter((experience) => {
    if (filters.city && experience.city !== filters.city) return false;
    if (filters.category && experience.category !== filters.category) return false;
    if (filters.neighborhood && experience.neighborhood !== filters.neighborhood) return false;
    if (filters.bucket && experience.recommendationKind.toLowerCase() !== filters.bucket) return false;
    if (filters.tag && !experience.tags.includes(filters.tag)) return false;
    if (filters.beginner && !experience.beginnerFriendly) return false;
    if (filters.free && experience.cost !== "Free") return false;
    if (query) {
      const haystack = [experience.title, experience.description, experience.category, experience.location, ...experience.tags]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export async function listApprovedExperiences(filters: ExperienceFilters = {}) {
  const supabase = createPublicServerClient();
  if (!supabase) return filterSeeded(filters);

  let query = supabase.from("experiences").select("*").eq("status", "approved");
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.neighborhood) query = query.eq("neighborhood", filters.neighborhood);
  if (filters.bucket) query = query.eq("recommendation_bucket", filters.bucket);
  if (filters.tag) query = query.contains("tags", [filters.tag]);
  if (filters.beginner) query = query.eq("beginner_friendly", true);
  if (filters.free) query = query.or("cost_min.eq.0,cost_max.eq.0");
  if (filters.query) query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);

  const { data, error } = await query
    .order("featured", { ascending: false })
    .order("start_time", { ascending: true, nullsFirst: false })
    .order("serendipity_score", { ascending: false })
    .limit(120);

  if (error) {
    console.error(error);
    return filterSeeded(filters);
  }

  return (data ?? []).map(mapExperienceRow);
}

export async function getExperienceByIdOrSlug(idOrSlug: string) {
  const supabase = createPublicServerClient();
  if (!supabase) return seededExperiences.find((experience) => experience.id === idOrSlug || experience.slug === idOrSlug) ?? null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq(isUuid ? "id" : "slug", idOrSlug)
    .maybeSingle();

  if (error || !data) return seededExperiences.find((experience) => experience.id === idOrSlug || experience.slug === idOrSlug) ?? null;
  if (data.status !== "approved") return null;
  return mapExperienceRow(data);
}

export async function getRelatedExperiencesFor(experience: Experience) {
  const all = await listApprovedExperiences({ city: experience.city });
  return all
    .filter((candidate) => candidate.id !== experience.id)
    .filter(
      (candidate) =>
        candidate.category === experience.category ||
        candidate.tags.some((tag) => experience.tags.includes(tag)) ||
        candidate.recommendationKind === experience.recommendationKind,
    )
    .slice(0, 3);
}

function overlapScore(experience: Experience, terms: string[]) {
  const normalized = terms.map((term) => term.toLowerCase());
  const fields = [experience.category, experience.vibe, ...experience.tags].join(" ").toLowerCase();
  return normalized.reduce((score, term) => score + (fields.includes(term) ? 1 : 0), 0);
}

export async function getWeeklyRecommendationsFor(profile?: OnboardingState | null, city = "San Francisco") {
  const all = await listApprovedExperiences({ city });
  const cityPool = all.length ? all : seededExperiences.filter((experience) => experience.city === city);
  const pool =
    cityPool.length >= 3
      ? cityPool
      : [...cityPool, ...seededExperiences.filter((experience) => !cityPool.some((item) => item.id === experience.id))];
  const interests = profile?.interests ?? ["Design", "Coffee", "Architecture"];
  const feelings = profile?.feelings ?? ["Curious"];
  const goals = profile?.goals ?? ["Community"];

  const byInterest = [...pool].sort((a, b) => overlapScore(b, interests) - overlapScore(a, interests));
  const byGrowth = [...pool].sort(
    (a, b) =>
      overlapScore(b, [...interests, ...goals]) +
      (b.serendipityScore ?? 60) / 20 -
      (overlapScore(a, [...interests, ...goals]) + (a.serendipityScore ?? 60) / 20),
  );
  const bySurprise = [...pool].sort((a, b) => {
    const aScore = (a.serendipityScore ?? 60) - overlapScore(a, interests) * 8 + overlapScore(a, feelings) * 3;
    const bScore = (b.serendipityScore ?? 60) - overlapScore(b, interests) * 8 + overlapScore(b, feelings) * 3;
    return bScore - aScore;
  });

  const chosen = new Set<string>();
  const pick = (candidate: Experience | undefined) => {
    if (!candidate || chosen.has(candidate.id)) return null;
    chosen.add(candidate.id);
    return candidate;
  };

  const passion = pick(byInterest.find((item) => item.recommendationKind === "Passion")) ?? pick(byInterest[0]);
  const growth =
    pick(byGrowth.find((item) => item.recommendationKind === "Growth" && !chosen.has(item.id))) ??
    pick(byGrowth.find((item) => !chosen.has(item.id)));
  const surprise =
    pick(bySurprise.find((item) => item.recommendationKind === "Surprise" && !chosen.has(item.id))) ??
    pick(bySurprise.find((item) => !chosen.has(item.id)));

  return [passion, growth, surprise].filter((experience): experience is Experience => Boolean(experience));
}

export async function listPendingExperiences() {
  const supabase = createServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .in("status", ["review", "draft"])
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []).map(mapExperienceRow);
}
