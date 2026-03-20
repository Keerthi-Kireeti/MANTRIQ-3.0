import { NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as db from "@/lib/mentor/db";
import * as svc from "@/lib/mentor/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await ensureMentorReady();
    const { searchParams } = new URL(request.url);
    const concept = searchParams.get("concept") ?? undefined;
    const difficulty = searchParams.get("difficulty") ?? undefined;
    const language = searchParams.get("language") ?? undefined;

    const challenges = await db.getChallengeTemplates({ language, concept, difficulty });
    const normalized = challenges.map((c) => svc.normalizeChallenge(c));

    return NextResponse.json({ challenges: normalized });
  } catch (error) {
    console.error("List challenges error:", error);
    return NextResponse.json({ error: "Internal server error", challenges: [] }, { status: 500 });
  }
}
