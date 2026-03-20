import { NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as db from "@/lib/mentor/db";
import * as svc from "@/lib/mentor/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { learnerId } = await ensureMentorReady();

    const profile: any = svc.normalizeProfile(await db.getLearnerProfile(learnerId));
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const metrics = await db.getDashboardMetrics(learnerId);
    const dashboard = {
      learner_name: "You",
      onboarding_complete: profile.onboarding_complete ?? 0,
      proficiencies: await db.getLanguageProficiencies(learnerId),
      recent_mistakes: await db.getRecentMistakes(learnerId, 5),
      ...metrics,
    };

    const recommended = svc.normalizeChallenge(
      await svc.generateNextRecommendation(learnerId) as any
    );

    const rawChallenges = await db.getChallengeTemplates();
    const challenges: any[] = rawChallenges.map((c) => svc.normalizeChallenge(c)!);

    const conceptOrder: string[] = [];
    for (const ch of challenges) {
      const tags = (ch.concept_tags ?? []) as string[];
      for (const tag of tags) {
        if (!conceptOrder.includes(tag)) conceptOrder.push(tag);
      }
    }
    if (!conceptOrder.length) conceptOrder.push("loops", "conditionals", "functions", "data-structures", "recursion");

    const learningPath = {
      concepts: conceptOrder,
      challenges: challenges.map((ch) => ({
        id: ch.id,
        title: ch.title,
        difficulty: ch.difficulty,
        language: ch.language,
        concept_tags: ch.concept_tags ?? [],
        prompt: ch.prompt,
        starter_code: ch.starter_code ?? "",
        description: ch.description ?? "",
      })),
    };

    return NextResponse.json({ profile, dashboard, recommendedChallenge: recommended, learningPath: learningPath });
  } catch (error) {
    console.error("Bootstrap error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
