import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/ingestion/adminAuth";
import { createSupabaseServerClient } from "@/ingestion/supabaseServer";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const supabase = createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: queueItem, error: queueError } = await supabase.from("review_queue").select("*").eq("id", id).single();
  if (queueError) return NextResponse.json({ error: queueError.message }, { status: 404 });

  if (queueItem.entity_type === "experience") {
    const { error: experienceError } = await supabase
      .from("experiences")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", queueItem.entity_id);
    if (experienceError) return NextResponse.json({ error: experienceError.message }, { status: 500 });
  }

  const { error } = await supabase
    .from("review_queue")
    .update({ reviewer_status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
