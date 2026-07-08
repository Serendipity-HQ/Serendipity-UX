export type SourceType =
  | "luma"
  | "eventbrite"
  | "meetup"
  | "public_calendar"
  | "rss"
  | "newsletter"
  | "manual"
  | "user_submitted"
  | "partner_social";

export type RecommendationBucket = "passion" | "growth" | "surprise" | "unknown";
export type ExperienceStatus = "draft" | "review" | "approved" | "rejected" | "expired";
export type ParseStatus = "fetched" | "parsed" | "failed" | "skipped";

export type SourceConfig = {
  source_name: string;
  source_type: SourceType;
  base_url: string;
  enabled: boolean;
  rate_limit_ms?: number;
  robots_notes: string;
  compliance_notes: string;
  metadata?: Record<string, unknown>;
};

export type RawSourceRecord = {
  source_name: string;
  source_url: string;
  raw_payload: unknown;
  fetched_at: string;
};

export type ExtractedExperience = {
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  venue_name?: string;
  host_name?: string;
  source_name: string;
  source_url: string;
  canonical_url?: string;
  image_url?: string;
  cost_min?: number;
  cost_max?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  vibe?: string[];
  recommendation_bucket?: RecommendationBucket;
  social_intensity?: number;
  beginner_friendly?: boolean;
  recurring?: boolean;
  recurrence_rule?: string;
  capacity?: number;
};

export type NormalizedExperience = Required<
  Pick<
    ExtractedExperience,
    | "title"
    | "source_name"
    | "source_url"
    | "city"
    | "timezone"
    | "tags"
    | "vibe"
    | "recommendation_bucket"
    | "social_intensity"
    | "beginner_friendly"
    | "recurring"
  >
> &
  Omit<
    ExtractedExperience,
    | "title"
    | "source_name"
    | "source_url"
    | "city"
    | "timezone"
    | "tags"
    | "vibe"
    | "recommendation_bucket"
    | "social_intensity"
    | "beginner_friendly"
    | "recurring"
  > & {
    description: string;
    status: ExperienceStatus;
    quality_score: number;
    serendipity_score: number;
    last_seen_at: string;
  };

export type SourceFetchResult = {
  records: RawSourceRecord[];
  errors: string[];
};

export type IngestionRunResult = {
  source_name: string;
  fetched: number;
  extracted: number;
  inserted: number;
  updated: number;
  review: number;
  rejected: number;
  errors: string[];
};

export type SourceAdapter = {
  config: SourceConfig;
  fetch(): Promise<SourceFetchResult>;
  parse(record: RawSourceRecord): Promise<ExtractedExperience[]>;
  normalize(record: ExtractedExperience): Promise<NormalizedExperience>;
};
