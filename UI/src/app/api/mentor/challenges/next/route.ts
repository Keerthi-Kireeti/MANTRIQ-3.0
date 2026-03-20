import { NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as svc from "@/lib/mentor/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { learnerId } = await ensureMentorReady();
    const challenge = svc.normalizeChallenge(
      await svc.generateNextRecommendation(learnerId) as any
    );

    if (!challenge) return NextResponse.json({ error: "No challenges available" }, { status: 404 });
    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Next challenge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
