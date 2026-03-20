/**
 * Ensures the mentor DB is initialized + seeded exactly once per cold-start.
 * Import this at the top of every API route that touches the mentor DB.
 */

import * as db from "./db";

let _ready: Promise<{ learnerId: number }> | null = null;

export async function ensureMentorReady(): Promise<{ learnerId: number }> {
  if (!_ready) {
    _ready = (async () => {
      await db.initDb();
      await db.seedChallenges();
      const learner = await db.bootstrapLearner();
      return { learnerId: Number(learner.id) };
    })();
  }
  return _ready;
}
