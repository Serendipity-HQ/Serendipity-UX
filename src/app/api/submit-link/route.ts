import { NextResponse } from "next/server";
import { ingestSubmittedLink } from "@/ingestion/runIngestion";
import { submitLinkSchema } from "@/ingestion/schema";

export async function POST(request: Request) {
  const parsed = submitLinkSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await ingestSubmittedLink(parsed.data.url, parsed.data.note);
  return NextResponse.json(result);
}
