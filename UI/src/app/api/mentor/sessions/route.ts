import { NextRequest, NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as db from "@/lib/mentor/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { learnerId } = await ensureMentorReady();
    const data = await request.json();
    const mode = data.mode ?? "mentor";

    const sessionId = await db.startSession(learnerId, mode);

    return NextResponse.json({
      session_id: sessionId,
      learner_id: learnerId,
      started_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
