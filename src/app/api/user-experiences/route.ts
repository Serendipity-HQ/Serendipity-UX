import { NextResponse } from "next/server";
import { createServiceClient, requireUser } from "@/lib/serverAuth";

export async function GET(request: Request) {
  const user = await requireUser(request);
  const supabase = createServiceClient();
  if (!user || !supabase) return NextResponse.json({ items: [] }, { status: 401 });

  const { data, error } = await supabase
    .from("user_experiences")
    .select("*, experiences(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const user = await requireUser(request);
  const supabase = createServiceClient();
  if (!user || !supabase) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const experienceId = String(body.experience_id ?? "");
  const status = String(body.status ?? "");
  if (!experienceId || !["saved", "going", "attended", "skipped"].includes(status)) {
    return NextResponse.json({ error: "Invalid experience action." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("user_experiences")
    .select("id,status")
    .eq("user_id", user.id)
    .eq("experience_id", experienceId)
    .eq("status", status)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("user_experiences").delete().eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ active: false });
  }

  const { error } = await supabase.from("user_experiences").insert({
    user_id: user.id,
    experience_id: experienceId,
    status,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ active: true });
}
