import type { ExtractedExperience, RawSourceRecord, SourceConfig, SourceFetchResult } from "../types";
import { BaseSourceAdapter } from "./base";

type LumaEvent = {
  name?: string;
  title?: string;
  description?: string;
  start_at?: string;
  end_at?: string;
  url?: string;
  event_url?: string;
  cover_url?: string;
  geo_address_json?: { address?: string; city?: string; region?: string };
  venue?: { name?: string; address?: string; city?: string };
  host?: string;
};

export class LumaAdapter extends BaseSourceAdapter {
  constructor(config: SourceConfig) {
    super({
      ...config,
      source_type: "luma",
      compliance_notes:
        config.compliance_notes || "Use official Luma API when available or public event/calendar pages where permitted. No restricted social scraping.",
    });
  }

  async fetch(): Promise<SourceFetchResult> {
    if (!this.config.enabled) return { records: [], errors: [] };

    try {
      const payload = await this.fetchJson(this.config.base_url);
      return {
        records: [
          {
            source_name: this.config.source_name,
            source_url: this.config.base_url,
            raw_payload: payload,
            fetched_at: new Date().toISOString(),
          },
        ],
        errors: [],
      };
    } catch (error) {
      return { records: [], errors: [error instanceof Error ? error.message : "Unknown Luma fetch error"] };
    }
  }

  async parse(record: RawSourceRecord): Promise<ExtractedExperience[]> {
    const raw = record.raw_payload as { entries?: LumaEvent[]; events?: LumaEvent[]; data?: LumaEvent[] };
    const events = raw.entries ?? raw.events ?? raw.data ?? [];

    return events.flatMap((event) => {
      const title = event.name ?? event.title;
      if (!title) return [];

      return [
        {
          title,
          description: event.description,
          start_time: event.start_at,
          end_time: event.end_at,
          city: event.venue?.city ?? event.geo_address_json?.city ?? "San Francisco",
          address: event.venue?.address ?? event.geo_address_json?.address,
          venue_name: event.venue?.name,
          host_name: event.host,
          source_name: record.source_name,
          source_url: event.event_url ?? event.url ?? record.source_url,
          canonical_url: event.event_url ?? event.url,
          image_url: event.cover_url,
        },
      ];
    });
  }
}
