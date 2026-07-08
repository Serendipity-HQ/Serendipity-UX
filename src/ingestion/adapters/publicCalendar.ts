import * as cheerio from "cheerio";
import type { ExtractedExperience, RawSourceRecord, SourceConfig, SourceFetchResult } from "../types";
import { BaseSourceAdapter } from "./base";

export class PublicCalendarAdapter extends BaseSourceAdapter {
  constructor(config: SourceConfig) {
    super({
      ...config,
      source_type: "public_calendar",
      compliance_notes:
        config.compliance_notes ||
        "Fetch only public venue/calendar pages that permit crawling. Respect robots.txt and site terms before enabling a source.",
    });
  }

  async fetch(): Promise<SourceFetchResult> {
    if (!this.config.enabled) return { records: [], errors: [] };
    try {
      const html = await this.fetchText(this.config.base_url);
      return {
        records: [{ source_name: this.config.source_name, source_url: this.config.base_url, raw_payload: { html }, fetched_at: new Date().toISOString() }],
        errors: [],
      };
    } catch (error) {
      return { records: [], errors: [error instanceof Error ? error.message : "Unknown public calendar fetch error"] };
    }
  }

  async parse(record: RawSourceRecord): Promise<ExtractedExperience[]> {
    const { html } = record.raw_payload as { html: string };
    const $ = cheerio.load(html);
    const jsonLd = $('script[type="application/ld+json"]')
      .toArray()
      .flatMap((el) => {
        try {
          const parsed = JSON.parse($(el).text());
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [];
        }
      });

    const events = jsonLd.flatMap((node) => {
      if (node["@type"] === "Event") return [node];
      if (Array.isArray(node["@graph"])) return node["@graph"].filter((item: { ["@type"]?: string }) => item["@type"] === "Event");
      return [];
    });

    return events.flatMap((event) => {
      if (!event.name) return [];
      return [
        {
          title: event.name,
          description: event.description,
          start_time: event.startDate,
          end_time: event.endDate,
          city: event.location?.address?.addressLocality ?? "San Francisco",
          address: event.location?.address?.streetAddress,
          venue_name: event.location?.name,
          host_name: event.organizer?.name,
          source_name: record.source_name,
          source_url: event.url ?? record.source_url,
          canonical_url: event.url ?? record.source_url,
          image_url: Array.isArray(event.image) ? event.image[0] : event.image,
          cost_min: event.offers?.price ? Number(event.offers.price) : undefined,
          currency: event.offers?.priceCurrency ?? "USD",
        },
      ];
    });
  }
}
