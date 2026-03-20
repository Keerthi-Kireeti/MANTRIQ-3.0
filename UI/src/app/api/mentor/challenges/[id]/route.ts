import { NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as db from "@/lib/mentor/db";
import * as svc from "@/lib/mentor/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { learnerId } = await ensureMentorReady();
    const { id: challengeId } = await params;

    const template = await db.getChallengeTemplate(Number(challengeId));
    if (!template) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

    const assignmentId = await db.createChallengeAssignment(learnerId, Number(challengeId));
    await db.startChallenge(assignmentId);

    return NextResponse.json({
      assignment_id: assignmentId,
      challenge: svc.normalizeChallenge(template),
    });
  } catch (error) {
    console.error("Start challenge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
