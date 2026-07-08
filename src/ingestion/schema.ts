import { z } from "zod";

export const recommendationBucketSchema = z.enum(["passion", "growth", "surprise", "unknown"]);
export const experienceStatusSchema = z.enum(["draft", "review", "approved", "rejected", "expired"]);

export const extractedExperienceSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  timezone: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  venue_name: z.string().optional(),
  host_name: z.string().optional(),
  source_name: z.string().min(1),
  source_url: z.string().url(),
  canonical_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  cost_min: z.number().nonnegative().optional(),
  cost_max: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  vibe: z.array(z.string()).optional(),
  recommendation_bucket: recommendationBucketSchema.optional(),
  social_intensity: z.number().int().min(1).max(5).optional(),
  beginner_friendly: z.boolean().optional(),
  recurring: z.boolean().optional(),
  recurrence_rule: z.string().optional(),
  capacity: z.number().int().positive().optional(),
});

export const normalizedExperienceSchema = extractedExperienceSchema.extend({
  description: z.string(),
  city: z.string(),
  timezone: z.string(),
  tags: z.array(z.string()),
  vibe: z.array(z.string()),
  recommendation_bucket: recommendationBucketSchema,
  social_intensity: z.number().int().min(1).max(5),
  beginner_friendly: z.boolean(),
  recurring: z.boolean(),
  status: experienceStatusSchema,
  quality_score: z.number().min(0).max(100),
  serendipity_score: z.number().min(0).max(100),
  last_seen_at: z.string().datetime(),
});

export const submitLinkSchema = z.object({
  url: z.string().url(),
  note: z.string().max(1000).optional(),
});

export const adminIngestSchema = z.object({
  source_name: z.string().optional(),
  source_type: z.string().optional(),
  dry_run: z.boolean().optional(),
});
