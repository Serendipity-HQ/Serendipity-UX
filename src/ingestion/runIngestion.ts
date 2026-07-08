import { EventbriteAdapter } from "./adapters/eventbrite";
import { isRestrictedSocialUrl, contentHash } from "./adapters/base";
import { LumaAdapter } from "./adapters/luma";
import { ManualAdapter } from "./adapters/manual";
import { PublicCalendarAdapter } from "./adapters/publicCalendar";
import { RssAdapter } from "./adapters/rss";
import { findDuplicate, type ExistingExperienceForDedupe } from "./dedupe";
import { reviewConfidence, reviewReason } from "./reviewQueue";
import { sfSourceConfigs } from "./sfSources";
import { createSupabaseServerClient } from "./supabaseServer";
import type { IngestionRunResult, NormalizedExperience, RawSourceRecord, SourceAdapter, SourceConfig } from "./types";

function createAdapter(config: SourceConfig): SourceAdapter {
  switch (config.source_type) {
    case "luma":
      return new LumaAdapter(config);
    case "eventbrite":
    case "meetup":
      return new EventbriteAdapter(config);
    case "public_calendar":
      return new PublicCalendarAdapter(config);
    case "rss":
    case "newsletter":
      return new RssAdapter(config);
    case "manual":
    case "user_submitted":
    case "partner_social":
      return new ManualAdapter(config);
    default:
      return new ManualAdapter(config);
  }
}

function toDbExperience(experience: NormalizedExperience) {
  return {
    title: experience.title,
    description: experience.description,
    start_time: experience.start_time ?? null,
    end_time: experience.end_time ?? null,
    timezone: experience.timezone,
    city: experience.city,
    neighborhood: experience.neighborhood ?? null,
    address: experience.address ?? null,
    latitude: experience.latitude ?? null,
    longitude: experience.longitude ?? null,
    venue_name: experience.venue_name ?? null,
    host_name: experience.host_name ?? null,
    source_name: experience.source_name,
    source_url: experience.source_url,
    canonical_url: experience.canonical_url ?? experience.source_url,
    image_url: experience.image_url ?? null,
    cost_min: experience.cost_min ?? null,
    cost_max: experience.cost_max ?? null,
    currency: experience.currency ?? "USD",
    category: experience.category ?? null,
    tags: experience.tags,
    vibe: experience.vibe,
    recommendation_bucket: experience.recommendation_bucket,
    social_intensity: experience.social_intensity,
    beginner_friendly: experience.beginner_friendly,
    recurring: experience.recurring,
    recurrence_rule: experience.recurrence_rule ?? null,
    capacity: experience.capacity ?? null,
    status: experience.status,
    quality_score: experience.quality_score,
    serendipity_score: experience.serendipity_score,
    last_seen_at: experience.last_seen_at,
    updated_at: new Date().toISOString(),
  };
}

async function storeSourceRecord(record: RawSourceRecord, extractedPayload: unknown, parseStatus: string, errorMessage?: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("source_records")
    .insert({
      source_name: record.source_name,
      source_url: record.source_url,
      raw_payload: record.raw_payload,
      extracted_payload: extractedPayload,
      content_hash: contentHash(record.raw_payload),
      fetched_at: record.fetched_at,
      parse_status: parseStatus,
      error_message: errorMessage ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data?.id as string | undefined;
}

async function loadExistingExperiences() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("experiences")
    .select("id,title,start_time,venue_name,source_url,canonical_url")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) throw error;
  return (data ?? []) as ExistingExperienceForDedupe[];
}

async function upsertExperience(experience: NormalizedExperience, existing: ExistingExperienceForDedupe[]) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { action: "dry_run" as const };

  const duplicate = findDuplicate(experience, existing);
  const payload = toDbExperience(experience);

  if (duplicate) {
    const { error } = await supabase.from("experiences").update(payload).eq("id", duplicate.id);
    if (error) throw error;
    return { action: "updated" as const, id: duplicate.id };
  }

  const { data, error } = await supabase.from("experiences").insert(payload).select("id,status").single();
  if (error) throw error;
  existing.push({
    id: data.id,
    title: experience.title,
    start_time: experience.start_time ?? null,
    venue_name: experience.venue_name ?? null,
    source_url: experience.source_url,
    canonical_url: experience.canonical_url ?? null,
  });
  return { action: "inserted" as const, id: data.id, status: data.status as string };
}

async function maybeQueueReview(entityId: string, experience: NormalizedExperience) {
  if (experience.status !== "review") return;
  const supabase = createSupabaseServerClient();
  if (!supabase) return;

  await supabase.from("review_queue").insert({
    entity_type: "experience",
    entity_id: entityId,
    reason: reviewReason(experience),
    confidence: reviewConfidence(experience),
    reviewer_status: "pending",
  });
}

export async function runIngestion(configs: SourceConfig[] = sfSourceConfigs): Promise<IngestionRunResult[]> {
  const enabled = configs.filter((config) => config.enabled);
  const results: IngestionRunResult[] = [];
  const existing = await loadExistingExperiences();

  for (const config of enabled) {
    const adapter = createAdapter(config);
    const result: IngestionRunResult = {
      source_name: config.source_name,
      fetched: 0,
      extracted: 0,
      inserted: 0,
      updated: 0,
      review: 0,
      rejected: 0,
      errors: [],
    };

    const fetched = await adapter.fetch();
    result.fetched = fetched.records.length;
    result.errors.push(...fetched.errors);

    for (const record of fetched.records) {
      try {
        const extracted = await adapter.parse(record);
        result.extracted += extracted.length;
        await storeSourceRecord(record, extracted, "parsed");

        for (const item of extracted) {
          if (isRestrictedSocialUrl(item.source_url)) {
            result.review += 1;
            continue;
          }

          const normalized = await adapter.normalize(item);
          if (!normalized.city.toLowerCase().includes("san francisco") && !normalized.tags.includes("bay-area")) {
            result.rejected += 1;
            continue;
          }

          const write = await upsertExperience(normalized, existing);
          if (write.action === "inserted") result.inserted += 1;
          if (write.action === "updated") result.updated += 1;
          if (write.id) await maybeQueueReview(write.id, normalized);
          if (normalized.status === "review") result.review += 1;
        }
      } catch (error) {
        result.errors.push(error instanceof Error ? error.message : "Unknown parse error");
        await storeSourceRecord(record, null, "failed", error instanceof Error ? error.message : "Unknown parse error");
      }
    }

    results.push(result);
  }

  return results;
}

export async function ingestSubmittedLink(url: string, note?: string) {
  const supabase = createSupabaseServerClient();
  const restricted = isRestrictedSocialUrl(url);
  const now = new Date().toISOString();
  const record: RawSourceRecord = {
    source_name: restricted ? "user-submitted-restricted-social" : "user-submitted-link",
    source_url: url,
    raw_payload: { url, note, restricted_social: restricted },
    fetched_at: now,
  };

  const sourceRecordId = await storeSourceRecord(
    record,
    null,
    restricted ? "skipped" : "fetched",
    restricted ? "Restricted social URL. Stored for manual/opt-in review only; no deep scraping performed." : undefined,
  );

  if (supabase && sourceRecordId) {
    await supabase.from("review_queue").insert({
      entity_type: "source_record",
      entity_id: sourceRecordId,
      reason: restricted
        ? "Restricted social URL requires manual confirmation or partner opt-in ingestion."
        : "User-submitted link needs extraction/review.",
      confidence: restricted ? 30 : 50,
      reviewer_status: "pending",
    });
  }

  return { ok: true, restricted_social: restricted, source_record_id: sourceRecordId };
}
