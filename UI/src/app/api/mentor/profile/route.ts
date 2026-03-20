import { NextRequest, NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as db from "@/lib/mentor/db";
import * as svc from "@/lib/mentor/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { learnerId } = await ensureMentorReady();
    const profile = svc.normalizeProfile(await db.getLearnerProfile(learnerId));
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { learnerId } = await ensureMentorReady();
    const data = await request.json();

    const updated = await db.updateLearnerProfile(learnerId, {
      goals: data.goals,
      preferred_languages: data.preferred_languages,
      current_language: data.current_language,
      onboarding_complete: data.onboarding_complete,
    });

    return NextResponse.json(svc.normalizeProfile(updated));
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
