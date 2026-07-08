import { NextResponse } from "next/server";
import { listApprovedExperiences } from "@/lib/experienceRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "San Francisco";
  const experiences = await listApprovedExperiences({
    city,
    category: searchParams.get("category") ?? undefined,
    neighborhood: searchParams.get("neighborhood") ?? undefined,
    bucket: searchParams.get("bucket") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    query: searchParams.get("q") ?? undefined,
    beginner: searchParams.get("beginner") === "true",
    free: searchParams.get("free") === "true",
  });

  return NextResponse.json({ experiences });
}
