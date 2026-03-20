import { NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as db from "@/lib/mentor/db";
import * as svc from "@/lib/mentor/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const { learnerId } = await ensureMentorReady();
    const { id: assignmentId, action } = await params;
    const aId = Number(assignmentId);
    const data = await request.json();

    const assignment = await db.getChallengeAssignment(aId);
    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    // ----- HINT -----
    if (action === "hint") {
      const template = await db.getChallengeTemplate(Number(assignment.challenge_id));
      if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

      const latest = await db.getLatestAttemptForAssignment(aId);
      const attemptNum = latest ? Number(latest.attempt_number) : 0;
      const hint = svc.generatePersonalizedHint(String(template.hint_templates ?? "[]"), attemptNum);

      return NextResponse.json({ hint });
    }

    // ----- SUBMIT -----
    const code = data.code;
    const language = db.normalizeLanguageName(data.language ?? "python") ?? "python";
    if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });

    const template = await db.getChallengeTemplate(Number(assignment.challenge_id));
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    const attemptNumber = await db.getNextAttemptNumber(aId);
    const attemptId = await db.createChallengeAttempt(aId, attemptNumber, code, language);

    const evaluation = svc.evaluateChallengeAttempt({ code, language }, template);

    for (const mistake of evaluation.mistakes) {
      await db.recordMistake(attemptId, {
        mistake_type: String(mistake.mistake_type ?? "debugging-strategy"),
        description: String(mistake.description ?? ""),
        code_snippet: code.slice(0, 100),
        suggestion: String(mistake.suggestion ?? ""),
        confidence: Number(mistake.confidence ?? 0.5),
      });
      await db.updateOrCreateMistakePattern(
        learnerId,
        String(mistake.mistake_type ?? "debugging-strategy"),
        language,
        String(mistake.description ?? "")
      );
    }

    await db.updateChallengeAttempt(attemptId, {
      feedback: evaluation.feedback,
      passed: evaluation.passed ? 1 : 0,
      rubric_score: evaluation.rubric_score,
    });

    if (evaluation.passed) await db.completeChallengeAssignment(aId);

    // Update language proficiency
    const profs = await db.getLanguageProficiencies(learnerId);
    const profDict: Record<string, Record<string, unknown>> = {};
    for (const p of profs) profDict[String(p.language)] = p;

    if (profDict[language]) {
      const prof = profDict[language];
      const score = Number(prof.score) * 0.7 + evaluation.rubric_score * 0.3;
      await db.updateLanguageProficiency(
        learnerId, language, score,
        Number(prof.attempts_count) + 1,
        Number(prof.successful_attempts) + (evaluation.passed ? 1 : 0)
      );
    } else {
      await db.updateLanguageProficiency(
        learnerId, language, evaluation.rubric_score,
        1, evaluation.passed ? 1 : 0
      );
    }

    return NextResponse.json({
      attempt_id: attemptId,
      attempt_number: attemptNumber,
      passed: evaluation.passed,
      rubric_score: evaluation.rubric_score,
      feedback: evaluation.feedback,
      mistakes: evaluation.mistakes,
      assignment_status: evaluation.passed ? "completed" : String(assignment.status ?? "started"),
    });
  } catch (error) {
    console.error("Attempt action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
