import type { ExtractedExperience, RawSourceRecord, SourceConfig, SourceFetchResult } from "../types";
import { BaseSourceAdapter } from "./base";

export class ManualAdapter extends BaseSourceAdapter {
  private records: ExtractedExperience[];

  constructor(config: SourceConfig, records: ExtractedExperience[] = []) {
    super({ ...config, source_type: "manual", compliance_notes: config.compliance_notes || "Manual or partner-submitted records only." });
    this.records = records;
  }

  async fetch(): Promise<SourceFetchResult> {
    return {
      records: [
        {
          source_name: this.config.source_name,
          source_url: this.config.base_url,
          raw_payload: { records: this.records },
          fetched_at: new Date().toISOString(),
        },
      ],
      errors: [],
    };
  }

  async parse(record: RawSourceRecord): Promise<ExtractedExperience[]> {
    const raw = record.raw_payload as { records?: ExtractedExperience[] };
    return raw.records ?? [];
  }
}
