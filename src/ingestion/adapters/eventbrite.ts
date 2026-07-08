import type { ExtractedExperience, RawSourceRecord, SourceConfig, SourceFetchResult } from "../types";
import { BaseSourceAdapter } from "./base";

type EventbriteEvent = {
  name?: { text?: string };
  description?: { text?: string };
  start?: { utc?: string; timezone?: string; local?: string };
  end?: { utc?: string; timezone?: string; local?: string };
  url?: string;
  logo?: { url?: string };
  venue?: { name?: string; address?: { localized_address_display?: string; city?: string; latitude?: string; longitude?: string } };
  is_free?: boolean;
  category?: { name?: string };
};

export class EventbriteAdapter extends BaseSourceAdapter {
  constructor(config: SourceConfig) {
    super({
      ...config,
      source_type: "eventbrite",
      compliance_notes: config.compliance_notes || "Use Eventbrite official API where available.",
    });
  }

  async fetch(): Promise<SourceFetchResult> {
    if (!this.config.enabled) return { records: [], errors: [] };
    const token = process.env.EVENTBRITE_API_TOKEN;

    try {
      const payload = await this.fetchJson(this.config.base_url, token ? { headers: { authorization: `Bearer ${token}` } } : undefined);
      return {
        records: [{ source_name: this.config.source_name, source_url: this.config.base_url, raw_payload: payload, fetched_at: new Date().toISOString() }],
        errors: [],
      };
    } catch (error) {
      return { records: [], errors: [error instanceof Error ? error.message : "Unknown Eventbrite fetch error"] };
    }
  }

  async parse(record: RawSourceRecord): Promise<ExtractedExperience[]> {
    const raw = record.raw_payload as { events?: EventbriteEvent[] };
    return (raw.events ?? []).flatMap((event) => {
      const title = event.name?.text;
      if (!title) return [];
      return [
        {
          title,
          description: event.description?.text,
          start_time: event.start?.utc ?? event.start?.local,
          end_time: event.end?.utc ?? event.end?.local,
          timezone: event.start?.timezone,
          city: event.venue?.address?.city ?? "San Francisco",
          address: event.venue?.address?.localized_address_display,
          latitude: event.venue?.address?.latitude ? Number(event.venue.address.latitude) : undefined,
          longitude: event.venue?.address?.longitude ? Number(event.venue.address.longitude) : undefined,
          venue_name: event.venue?.name,
          source_name: record.source_name,
          source_url: event.url ?? record.source_url,
          canonical_url: event.url,
          image_url: event.logo?.url,
          cost_min: event.is_free ? 0 : undefined,
          currency: "USD",
          category: event.category?.name,
        },
      ];
    });
  }
}
