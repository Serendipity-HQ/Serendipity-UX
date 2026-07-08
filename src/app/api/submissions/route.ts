import { NextResponse } from "next/server";
import { mapExperienceRow } from "@/lib/experienceMapper";
import { createServiceClient, requireUser } from "@/lib/serverAuth";

function toArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

export async function GET(request: Request) {
  const user = await requireUser(request);
  const supabase = createServiceClient();
  if (!user || !supabase) return NextResponse.json({ submissions: [] }, { status: 401 });

  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submissions: (data ?? []).map(mapExperienceRow) });
}

export async function POST(request: Request) {
  const user = await requireUser(request);
  const supabase = createServiceClient();
  if (!user || !supabase) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (!title || !description) return NextResponse.json({ error: "Title and description are required." }, { status: 400 });

  const startTime = body.date && body.start_time ? new Date(`${body.date}T${body.start_time}`).toISOString() : null;
  const endTime = body.date && body.end_time ? new Date(`${body.date}T${body.end_time}`).toISOString() : null;

  const { data, error } = await supabase
    .from("experiences")
    .insert({
      title,
      description,
      long_description: description,
      start_time: startTime,
      end_time: endTime,
      timezone: body.timezone ?? "America/Los_Angeles",
      city: body.city ?? "San Francisco",
      neighborhood: body.neighborhood ?? null,
      address: body.address ?? null,
      venue_name: body.venue_name ?? null,
      host_name: body.host_name ?? null,
      source_name: "user_submission",
      source_url: body.source_url ?? null,
      canonical_url: body.source_url ?? null,
      image_url: body.image_url ?? null,
      cost_min: body.cost_min ? Number(body.cost_min) : null,
      cost_max: body.cost_max ? Number(body.cost_max) : null,
      currency: "USD",
      category: body.category ?? "Community",
      tags: toArray(body.tags),
      vibe: toArray(body.vibe),
      recommendation_bucket: body.recommendation_bucket ?? "unknown",
      social_intensity: Number(body.social_intensity ?? 3),
      beginner_friendly: Boolean(body.beginner_friendly),
      recurring: Boolean(body.recurring),
      recurrence_rule: body.recurrence_rule ?? null,
      status: "review",
      quality_score: 50,
      serendipity_score: 50,
      submitted_by: user.id,
      admin_notes: body.why_serendipity ? `Submitter note: ${body.why_serendipity}` : null,
      published: false,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("review_queue").insert({
    entity_type: "experience",
    entity_id: data.id,
    reason: "User-submitted experience requires admin review.",
    confidence: 60,
    reviewer_status: "pending",
  });

  return NextResponse.json({ id: data.id, status: "review" });
}
