import { NextResponse } from "next/server";
import { getExperienceByIdOrSlug } from "@/lib/experienceRepository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experience = await getExperienceByIdOrSlug(id);
  if (!experience) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ experience });
}
