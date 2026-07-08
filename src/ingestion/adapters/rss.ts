import * as cheerio from "cheerio";
import type { ExtractedExperience, RawSourceRecord, SourceConfig, SourceFetchResult } from "../types";
import { BaseSourceAdapter } from "./base";

export class RssAdapter extends BaseSourceAdapter {
  constructor(config: SourceConfig) {
    super({
      ...config,
      source_type: "rss",
      compliance_notes: config.compliance_notes || "Use public RSS/newsletter archive feeds where provided by the publisher.",
    });
  }

  async fetch(): Promise<SourceFetchResult> {
    if (!this.config.enabled) return { records: [], errors: [] };
    try {
      const xml = await this.fetchText(this.config.base_url);
      return {
        records: [{ source_name: this.config.source_name, source_url: this.config.base_url, raw_payload: { xml }, fetched_at: new Date().toISOString() }],
        errors: [],
      };
    } catch (error) {
      return { records: [], errors: [error instanceof Error ? error.message : "Unknown RSS fetch error"] };
    }
  }

  async parse(record: RawSourceRecord): Promise<ExtractedExperience[]> {
    const { xml } = record.raw_payload as { xml: string };
    const $ = cheerio.load(xml, { xmlMode: true });
    return $("item, entry")
      .toArray()
      .flatMap((item) => {
        const node = $(item);
        const title = node.find("title").first().text().trim();
        const link = node.find("link").first().text().trim() || node.find("link").attr("href") || record.source_url;
        const description = node.find("description, summary, content").first().text().trim();
        const published = node.find("pubDate, published, updated").first().text().trim();
        if (!title) return [];
        return [
          {
            title,
            description,
            start_time: published ? new Date(published).toISOString() : undefined,
            city: "San Francisco",
            source_name: record.source_name,
            source_url: link,
            canonical_url: link,
          },
        ];
      });
  }
}
