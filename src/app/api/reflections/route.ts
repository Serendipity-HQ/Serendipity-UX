import { NextResponse } from "next/server";
import { createServiceClient, requireUser } from "@/lib/serverAuth";

export async function GET(request: Request) {
  const user = await requireUser(request);
  const supabase = createServiceClient();
  if (!user || !supabase) return NextResponse.json({ reflections: [] }, { status: 401 });

  const { data, error } = await supabase
    .from("reflections")
    .select("*, experiences(title, category, tags)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reflections: data ?? [] });
}

export async function POST(request: Request) {
  const user = await requireUser(request);
  const supabase = createServiceClient();
  if (!user || !supabase) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const experienceId = String(body.experience_id ?? "");
  if (!experienceId) return NextResponse.json({ error: "Experience is required." }, { status: 400 });

  const { data, error } = await supabase
    .from("reflections")
    .insert({
      user_id: user.id,
      experience_id: experienceId,
      attended: Boolean(body.attended),
      surprised_by: body.surprised_by ?? null,
      people_met: body.people_met ?? null,
      would_return: body.would_return === "" ? null : Boolean(body.would_return),
      sparked_interest_tags: Array.isArray(body.sparked_interest_tags) ? body.sparked_interest_tags : [],
      private_note: body.private_note ?? null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.attended) {
    await supabase.from("user_experiences").upsert({
      user_id: user.id,
      experience_id: experienceId,
      status: "attended",
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ reflection: data });
}
