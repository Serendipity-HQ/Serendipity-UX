import { NextResponse } from "next/server";
import { createServiceClient, getProfileForUser, requireUser } from "@/lib/serverAuth";

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ user: null, profile: null }, { status: 401 });

  const profile = await getProfileForUser(user.id);
  return NextResponse.json({ user, profile });
}

export async function PUT(request: Request) {
  const user = await requireUser(request);
  const supabase = createServiceClient();
  if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const payload = {
    id: user.id,
    email: user.email,
    name: typeof body.name === "string" ? body.name : null,
    city: typeof body.city === "string" ? body.city : "San Francisco",
    interests: Array.isArray(body.interests) ? body.interests : [],
    desired_feelings: Array.isArray(body.desired_feelings) ? body.desired_feelings : [],
    goals: Array.isArray(body.goals) ? body.goals : [],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("profiles").upsert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
