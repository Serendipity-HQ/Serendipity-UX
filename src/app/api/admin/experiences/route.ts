import { NextResponse } from "next/server";
import { mapExperienceRow } from "@/lib/experienceMapper";
import { createServiceClient, requireAdmin } from "@/lib/serverAuth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  const supabase = createServiceClient();
  if (!admin || !supabase) return NextResponse.json({ error: "Admin access required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  let query = supabase.from("experiences").select("*").order("created_at", { ascending: false }).limit(200);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ experiences: (data ?? []).map(mapExperienceRow) });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  const supabase = createServiceClient();
  if (!admin || !supabase) return NextResponse.json({ error: "Admin access required." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "Experience id is required." }, { status: 400 });

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of [
    "title",
    "description",
    "category",
    "recommendation_bucket",
    "status",
    "admin_notes",
    "featured",
    "quality_score",
    "serendipity_score",
  ]) {
    if (key in body) payload[key] = body[key];
  }
  if (body.status && body.status !== "approved") payload.published = false;
  if (body.status === "approved") payload.published = true;

  const { data, error } = await supabase.from("experiences").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ experience: mapExperienceRow(data) });
}
