import type { Experience } from "./types";

type ExperienceRow = Record<string, unknown>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return "Date TBD";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatTime(value: unknown) {
  if (!value || typeof value !== "string") return "Time TBD";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function bucketToKind(value: unknown): Experience["recommendationKind"] {
  if (value === "passion") return "Passion";
  if (value === "growth") return "Growth";
  if (value === "surprise") return "Surprise";
  return "Surprise";
}

function socialIntensity(value: unknown): Experience["socialIntensity"] {
  if (typeof value === "number") {
    if (value <= 2) return "quiet";
    if (value >= 4) return "social";
  }
  if (value === "quiet" || value === "moderate" || value === "social") return value;
  return "moderate";
}

function costLabel(row: ExperienceRow) {
  const min = typeof row.cost_min === "number" ? row.cost_min : null;
  const max = typeof row.cost_max === "number" ? row.cost_max : null;
  const existing = typeof row.cost === "string" ? row.cost : null;
  if (existing) return existing;
  if (min === 0 && (!max || max === 0)) return "Free";
  if (min !== null && max !== null && min !== max) return `$${min}-$${max}`;
  if (min !== null) return `$${min}`;
  return "Cost TBD";
}

export function mapExperienceRow(row: ExperienceRow): Experience {
  const title = String(row.title ?? "Untitled experience");
  const tags = Array.isArray(row.tags) ? row.tags.map(String) : [];
  const vibe = Array.isArray(row.vibe) ? row.vibe.map(String).join(", ") : String(row.vibe ?? "Human, local, intentional");
  const venue = String(row.venue_name ?? row.location ?? "Location TBD");
  const host = String(row.host_name ?? row.host ?? "Local host");
  const startTime = typeof row.start_time === "string" ? row.start_time : null;

  return {
    id: String(row.id),
    slug: String(row.slug ?? slugify(title)),
    title,
    description: String(row.description ?? ""),
    longDescription: String(row.long_description ?? row.description ?? ""),
    date: typeof row.date === "string" ? row.date : formatDate(startTime),
    time: typeof row.time === "string" ? row.time : formatTime(startTime),
    city: String(row.city ?? "San Francisco"),
    location: String(row.neighborhood ?? venue),
    host,
    cost: costLabel(row),
    category: String(row.category ?? "Community"),
    tags,
    vibe,
    beginnerFriendly: Boolean(row.beginner_friendly ?? true),
    socialIntensity: socialIntensity(row.social_intensity),
    cadence: row.recurring ? "Recurring" : "One-Time",
    recommendationKind: bucketToKind(row.recommendation_bucket),
    whyRecommended: String(
      row.why_recommended ??
        "This has the right mix of local presence, human connection, and curiosity to belong on Serendipity.",
    ),
    community: String(row.host_name ?? row.venue_name ?? row.category ?? "Local community"),
    proofMethod: "Host confirmation or physical QR at the experience",
    anonymousGuests: [],
    coordinates:
      typeof row.latitude === "number" && typeof row.longitude === "number"
        ? { lat: row.latitude, lng: row.longitude }
        : undefined,
    startTime,
    endTime: typeof row.end_time === "string" ? row.end_time : null,
    timezone: String(row.timezone ?? "America/Los_Angeles"),
    neighborhood: typeof row.neighborhood === "string" ? row.neighborhood : null,
    address: typeof row.address === "string" ? row.address : null,
    venueName: typeof row.venue_name === "string" ? row.venue_name : null,
    hostName: typeof row.host_name === "string" ? row.host_name : null,
    sourceUrl: typeof row.source_url === "string" ? row.source_url : null,
    canonicalUrl: typeof row.canonical_url === "string" ? row.canonical_url : null,
    imageUrl: typeof row.image_url === "string" ? row.image_url : null,
    costMin: typeof row.cost_min === "number" ? row.cost_min : null,
    costMax: typeof row.cost_max === "number" ? row.cost_max : null,
    currency: String(row.currency ?? "USD"),
    status: row.status === "review" || row.status === "rejected" || row.status === "expired" || row.status === "draft" ? row.status : "approved",
    featured: Boolean(row.featured),
    qualityScore: typeof row.quality_score === "number" ? row.quality_score : undefined,
    serendipityScore: typeof row.serendipity_score === "number" ? row.serendipity_score : undefined,
    submittedBy: typeof row.submitted_by === "string" ? row.submitted_by : null,
    adminNotes: typeof row.admin_notes === "string" ? row.admin_notes : null,
  };
}
