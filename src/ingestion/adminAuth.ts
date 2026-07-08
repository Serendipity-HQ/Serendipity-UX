import { NextResponse } from "next/server";

export function requireAdminRequest(request: Request) {
  const secret = process.env.SERENDIPITY_ADMIN_SECRET ?? process.env.ADMIN_INGESTION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV !== "production") return null;
    return NextResponse.json({ error: "Admin secret is not configured." }, { status: 503 });
  }

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-serendipity-admin-secret");

  if (bearer === secret || headerSecret === secret) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
