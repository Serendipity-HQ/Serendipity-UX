import crypto from "node:crypto";
import type { ExtractedExperience, NormalizedExperience, RawSourceRecord, SourceAdapter, SourceConfig, SourceFetchResult } from "../types";
import { normalizeExperience } from "../normalize";

export abstract class BaseSourceAdapter implements SourceAdapter {
  config: SourceConfig;

  constructor(config: SourceConfig) {
    this.config = config;
  }

  abstract fetch(): Promise<SourceFetchResult>;
  abstract parse(record: RawSourceRecord): Promise<ExtractedExperience[]>;

  async normalize(record: ExtractedExperience): Promise<NormalizedExperience> {
    return normalizeExperience(record);
  }

  protected async fetchJson(url: string, init?: RequestInit) {
    const response = await fetch(url, {
      ...init,
      headers: {
        "user-agent": "SerendipityBot/0.1 (+compliance: public permitted pages and official APIs)",
        accept: "application/json,text/html;q=0.9,*/*;q=0.8",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`${this.config.source_name} fetch failed ${response.status}: ${url}`);
    }

    return response.json();
  }

  protected async fetchText(url: string, init?: RequestInit) {
    const response = await fetch(url, {
      ...init,
      headers: {
        "user-agent": "SerendipityBot/0.1 (+compliance: public permitted pages and official APIs)",
        accept: "text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`${this.config.source_name} fetch failed ${response.status}: ${url}`);
    }

    return response.text();
  }
}

export function contentHash(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function isRestrictedSocialUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return ["instagram.com", "tiktok.com", "facebook.com", "x.com", "twitter.com"].some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}
