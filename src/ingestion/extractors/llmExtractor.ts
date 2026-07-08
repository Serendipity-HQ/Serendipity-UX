import { extractedExperienceSchema } from "../schema";
import type { ExtractedExperience } from "../types";

export type LlmExtractor = {
  extract(input: { text: string; source_name: string; source_url: string }): Promise<ExtractedExperience[]>;
};

export class MockLlmExtractor implements LlmExtractor {
  async extract(): Promise<ExtractedExperience[]> {
    return [];
  }
}

export class OpenAiCompatibleExtractor implements LlmExtractor {
  private apiKey: string | undefined;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
    this.model = process.env.OPENAI_INGESTION_MODEL ?? "gpt-4o-mini";
  }

  async extract(input: { text: string; source_name: string; source_url: string }): Promise<ExtractedExperience[]> {
    if (!this.apiKey) return [];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: "json_object" },
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "Extract real-world, in-person San Francisco Bay Area experiences from source text. Return strict JSON only. Do not invent missing date/location; omit uncertain fields.",
          },
          {
            role: "user",
            content: `Source: ${input.source_name}\nURL: ${input.source_url}\n\nText:\n${input.text.slice(0, 14000)}\n\nReturn {"experiences":[...]} using fields: title, description, start_time, end_time, timezone, city, neighborhood, address, venue_name, host_name, category, tags, vibe, beginner_friendly, recurring, cost_min, cost_max, currency.`,
          },
        ],
      }),
    });

    if (!response.ok) return [];
    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content;
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as { experiences?: unknown[] };
      return (parsed.experiences ?? []).flatMap((item) => {
        const result = extractedExperienceSchema.safeParse({
          ...(item as object),
          source_name: input.source_name,
          source_url: input.source_url,
        });
        return result.success ? [result.data] : [];
      });
    } catch {
      return [];
    }
  }
}

export function createLlmExtractor(): LlmExtractor {
  return process.env.OPENAI_API_KEY ? new OpenAiCompatibleExtractor() : new MockLlmExtractor();
}
