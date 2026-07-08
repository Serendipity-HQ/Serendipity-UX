import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/ingestion/adminAuth";
import { adminIngestSchema } from "@/ingestion/schema";
import { sfSourceConfigs } from "@/ingestion/sfSources";
import { runIngestion } from "@/ingestion/runIngestion";

export async function POST(request: Request) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const body = adminIngestSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const configs = body.data.source_name
    ? sfSourceConfigs.filter((config) => config.source_name === body.data.source_name)
    : sfSourceConfigs;

  const results = await runIngestion(configs);
  return NextResponse.json({ results });
}
