import { NextResponse } from "next/server";
import { runIngestion } from "@/ingestion/runIngestion";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (secret && provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runIngestion();
  return NextResponse.json({ results });
}
