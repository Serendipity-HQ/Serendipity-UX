import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/ingestion/adminAuth";
import { createSupabaseServerClient } from "@/ingestion/supabaseServer";

export async function GET(request: Request) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const supabase = createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ queue: [], configured: false });

  const { data, error } = await supabase
    .from("review_queue")
    .select("*")
    .eq("reviewer_status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ queue: data ?? [], configured: true });
}
