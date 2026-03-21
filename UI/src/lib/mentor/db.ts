/**
 * Mentor Database Layer – libSQL / Turso compatible
 *
 * Works on Vercel with Turso cloud, or locally with a file-based SQLite.
 * Falls back to in-memory storage when no database is configured.
 */

import { createClient, type Client } from "@libsql/client";

// ---------------------------------------------------------------------------
// In-memory storage for serverless
// ---------------------------------------------------------------------------

interface InMemoryRecord {
  id: number;
  [key: string]: unknown;
}

interface InMemoryDb {
  learner_profile: InMemoryRecord[];
  mentor_session: InMemoryRecord[];
  session_event: InMemoryRecord[];
  challenge_template: InMemoryRecord[];
  challenge_assignment: InMemoryRecord[];
  challenge_attempt: InMemoryRecord[];
  mistake_observation: InMemoryRecord[];
  mistake_pattern: InMemoryRecord[];
  language_proficiency: InMemoryRecord[];
  learning_recommendation: InMemoryRecord[];
  autoIncrement: Record<string, number>;
}

const inMemoryDb: InMemoryDb = {
  learner_profile: [],
  mentor_session: [],
  session_event: [],
  challenge_template: [],
  challenge_assignment: [],
  challenge_attempt: [],
  mistake_observation: [],
  mistake_pattern: [],
  language_proficiency: [],
  learning_recommendation: [],
  autoIncrement: {},
};

function nextId(table: keyof InMemoryDb): number {
  inMemoryDb.autoIncrement[table] = (inMemoryDb.autoIncrement[table] || 0) + 1;
  return inMemoryDb.autoIncrement[table];
}

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------

let _client: Client | null = null;
let _useInMemory = false;

function getClient(): Client | null {
  if (_useInMemory) return null;
  if (_client) return _client;

  const isVercel = process.env.VERCEL === "1";
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (isVercel && !url) {
    console.warn("No TURSO_DATABASE_URL configured. Using in-memory storage (data won't persist).");
    _useInMemory = true;
    return null;
  }

  const dbUrl = url || "file:mentor.db";
  _client = createClient({ url: dbUrl, authToken });
  return _client;
}

// ---------------------------------------------------------------------------
// Language helpers
// ---------------------------------------------------------------------------

const LANGUAGE_ALIASES: Record<string, string> = {
  py: "python", python: "python",
  js: "javascript", javascript: "javascript",
  ts: "typescript", typescript: "typescript",
  "c++": "cpp", cpp: "cpp",
  "c#": "csharp", cs: "csharp", csharp: "csharp",
  java: "java", go: "go", rust: "rust", ruby: "ruby",
  php: "php", swift: "swift", kotlin: "kotlin",
  c: "c",
};

export function normalizeLanguageName(language: string | null | undefined): string | null {
  if (!language) return null;
  const normalized = language.trim().toLowerCase();
  if (!normalized) return null;
  return LANGUAGE_ALIASES[normalized] ?? normalized;
}

export function parseTextList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const text = String(value).trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch { /* fall through */ }
  }
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

export function serializeTextList(
  values: unknown,
  opts?: { normalizeLanguages?: boolean }
): string | null {
  let items = parseTextList(values);
  if (opts?.normalizeLanguages) {
    items = items.map((i) => normalizeLanguageName(i) ?? i);
  }
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (item && !seen.has(item)) { seen.add(item); deduped.push(item); }
  }
  return deduped.length ? deduped.join(", ") : null;
}

// ---------------------------------------------------------------------------
// Schema init + seed
// ---------------------------------------------------------------------------

let _initialized = false;

export async function initDb() {
  if (_initialized) return;
  
  const db = getClient();
  if (!db) {
    _initialized = true;
    return;
  }

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS learner_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      goals TEXT,
      preferred_languages TEXT,
      current_language TEXT,
      onboarding_complete INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS mentor_session (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_id INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      mode TEXT NOT NULL,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS session_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS challenge_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      language TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      concept_tags TEXT,
      prompt TEXT NOT NULL,
      starter_code TEXT,
      hint_templates TEXT,
      evaluation_rubric TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS challenge_assignment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      assigned_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      status TEXT DEFAULT 'assigned'
    );

    CREATE TABLE IF NOT EXISTS challenge_attempt (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      attempt_number INTEGER NOT NULL,
      submitted_at TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      feedback TEXT,
      passed INTEGER DEFAULT 0,
      rubric_score REAL
    );

    CREATE TABLE IF NOT EXISTS mistake_observation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      mistake_type TEXT NOT NULL,
      description TEXT,
      code_snippet TEXT,
      suggestion TEXT,
      confidence REAL DEFAULT 0.5,
      detected_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mistake_pattern (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_id INTEGER NOT NULL,
      language TEXT,
      mistake_type TEXT NOT NULL,
      tags TEXT,
      description TEXT,
      occurrence_count INTEGER DEFAULT 1,
      last_observed TEXT,
      first_observed TEXT
    );

    CREATE TABLE IF NOT EXISTS language_proficiency (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      level TEXT NOT NULL,
      score REAL DEFAULT 0.5,
      attempts_count INTEGER DEFAULT 0,
      successful_attempts INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL,
      UNIQUE(learner_id, language)
    );

    CREATE TABLE IF NOT EXISTS learning_recommendation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      reason TEXT,
      priority REAL DEFAULT 0.5,
      created_at TEXT NOT NULL,
      expires_at TEXT
    );
  `);

  _initialized = true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now() { return new Date().toISOString(); }

// ---------------------------------------------------------------------------
// Learner profile
// ---------------------------------------------------------------------------

export async function bootstrapLearner(): Promise<Record<string, unknown>> {
  const db = getClient();
  
  if (!db) {
    const existing = inMemoryDb.learner_profile[0];
    if (existing) return existing;
    
    const ts = now();
    const learner = {
      id: nextId("learner_profile"),
      created_at: ts,
      updated_at: ts,
      goals: null,
      preferred_languages: null,
      current_language: "python",
      onboarding_complete: 0,
    };
    inMemoryDb.learner_profile.push(learner);
    return learner;
  }

  const existing = await db.execute("SELECT * FROM learner_profile LIMIT 1");
  if (existing.rows.length > 0) return { ...existing.rows[0] };

  const ts = now();
  const result = await db.execute({
    sql: `INSERT INTO learner_profile (created_at, updated_at, goals, preferred_languages, current_language, onboarding_complete)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [ts, ts, null, null, "python", 0],
  });

  return {
    id: Number(result.lastInsertRowid),
    created_at: ts, updated_at: ts,
    goals: null, preferred_languages: null,
    current_language: "python", onboarding_complete: 0,
  };
}

export async function getLearnerProfile(id: number) {
  const db = getClient();
  
  if (!db) {
    return inMemoryDb.learner_profile.find(r => r.id === id) || null;
  }

  const r = await db.execute({ sql: "SELECT * FROM learner_profile WHERE id = ?", args: [id] });
  return r.rows.length ? { ...r.rows[0] } : null;
}

export async function updateLearnerProfile(
  id: number,
  updates: { goals?: unknown; preferred_languages?: unknown; current_language?: string; onboarding_complete?: number }
) {
  const db = getClient();
  const ts = now();

  if (!db) {
    const profile = inMemoryDb.learner_profile.find(r => r.id === id);
    if (profile) {
      if (updates.goals !== undefined) profile.goals = updates.goals;
      if (updates.preferred_languages !== undefined) profile.preferred_languages = updates.preferred_languages;
      if (updates.current_language !== undefined) profile.current_language = updates.current_language;
      if (updates.onboarding_complete !== undefined) profile.onboarding_complete = updates.onboarding_complete;
      profile.updated_at = ts;
    }
    return profile || null;
  }

  const sets: string[] = ["updated_at = ?"];
  const params: unknown[] = [ts];

  if (updates.goals !== undefined) {
    const g = Array.isArray(updates.goals) ? updates.goals.join(", ") : updates.goals;
    sets.push("goals = ?"); params.push(g);
  }
  if (updates.preferred_languages !== undefined) {
    const pl = serializeTextList(updates.preferred_languages, { normalizeLanguages: true });
    sets.push("preferred_languages = ?"); params.push(pl);
  }
  if (updates.current_language !== undefined) {
    sets.push("current_language = ?"); params.push(normalizeLanguageName(updates.current_language));
  }
  if (updates.onboarding_complete !== undefined) {
    sets.push("onboarding_complete = ?"); params.push(updates.onboarding_complete);
  }

  params.push(id);
  await db.execute({ sql: `UPDATE learner_profile SET ${sets.join(", ")} WHERE id = ?`, args: params as any });
  return getLearnerProfile(id);
}

// ---------------------------------------------------------------------------
// Seeds
// ---------------------------------------------------------------------------

export async function seedChallenges() {
  const db = getClient();
  
  const ts = now();
  const defaultChallenges = [
    { slug: "print-odds-python", title: "Print All Odd Numbers", description: "Write a program that prints all odd numbers from 1 to 10.", language: "python", difficulty: "easy", concept_tags: JSON.stringify(["loops", "conditionals", "basics"]), prompt: "Write a Python program that prints all odd numbers from 1 to 10.", starter_code: "# Write your code here\n", hint_templates: JSON.stringify(["Use a for loop", "Check if number % 2 != 0"]), evaluation_rubric: JSON.stringify({ criteria: ["Correct output", "Code clarity", "Efficient solution"] }) },
    { slug: "fibonacci-python", title: "Fibonacci Sequence", description: "Generate the first N Fibonacci numbers.", language: "python", difficulty: "medium", concept_tags: JSON.stringify(["recursion", "loops", "sequences"]), prompt: "Write a function that returns the first N Fibonacci numbers.", starter_code: "def fibonacci(n):\n    # Your code here\n    pass\n", hint_templates: JSON.stringify(["Initialize with [0, 1]", "Each number is sum of previous two"]), evaluation_rubric: JSON.stringify({ criteria: ["Correct sequence", "Handles edge cases", "Efficient implementation"] }) },
    { slug: "palindrome-python", title: "Palindrome Checker", description: "Check if a string is a palindrome.", language: "python", difficulty: "easy", concept_tags: JSON.stringify(["strings", "conditionals"]), prompt: "Write a function that checks if a string is a palindrome.", starter_code: "def is_palindrome(s):\n    # Your code here\n    pass\n", hint_templates: JSON.stringify(["Reverse the string", "Compare with original"]), evaluation_rubric: JSON.stringify({ criteria: ["Correct palindrome detection", "Handles case sensitivity", "Edge cases"] }) },
    { slug: "count-words-python", title: "Word Counter", description: "Count the frequency of each word in a text.", language: "python", difficulty: "medium", concept_tags: JSON.stringify(["dictionaries", "strings", "data-structures"]), prompt: "Write a function that returns a dictionary with word frequencies.", starter_code: "def count_words(text):\n    # Your code here\n    pass\n", hint_templates: JSON.stringify(["Split text into words", "Use a dictionary to track counts"]), evaluation_rubric: JSON.stringify({ criteria: ["Correct word counts", "Handles case", "Performance"] }) },
    { slug: "sum-array-python", title: "Array Sum", description: "Calculate the sum of all elements in an array.", language: "python", difficulty: "easy", concept_tags: JSON.stringify(["arrays", "loops", "basics"]), prompt: "Write a function that returns the sum of all numbers in a list.", starter_code: "def sum_array(arr):\n    # Your code here\n    pass\n", hint_templates: JSON.stringify(["Initialize sum to 0", "Iterate through array", "Add each element"]), evaluation_rubric: JSON.stringify({ criteria: ["Correct sum", "Handles empty array", "Clarity"] }) },
  ];

  if (!db) {
    if (inMemoryDb.challenge_template.length === 0) {
      for (const ch of defaultChallenges) {
        inMemoryDb.challenge_template.push({
          id: nextId("challenge_template"),
          ...ch,
          created_at: ts,
          updated_at: ts,
        });
      }
    }
    return;
  }

  const count = await db.execute("SELECT COUNT(*) as count FROM challenge_template");
  if (Number((count.rows[0] as any).count) > 0) return;

  for (const ch of defaultChallenges) {
    await db.execute({
      sql: `INSERT INTO challenge_template (slug, title, description, language, difficulty, concept_tags, prompt, starter_code, hint_templates, evaluation_rubric, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [ch.slug, ch.title, ch.description, ch.language, ch.difficulty, ch.concept_tags, ch.prompt, ch.starter_code, ch.hint_templates, ch.evaluation_rubric, ts, ts],
    });
  }
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function startSession(learnerId: number, mode: string): Promise<number> {
  const db = getClient();
  const ts = now();
  
  if (!db) {
    const id = nextId("mentor_session");
    inMemoryDb.mentor_session.push({ id, learner_id: learnerId, started_at: ts, mode, metadata: null });
    return id;
  }

  const r = await db.execute({
    sql: "INSERT INTO mentor_session (learner_id, started_at, mode) VALUES (?, ?, ?)",
    args: [learnerId, ts, mode],
  });
  return Number(r.lastInsertRowid);
}

export async function endSession(sessionId: number) {
  const db = getClient();
  const ts = now();
  
  if (!db) {
    const session = inMemoryDb.mentor_session.find(s => s.id === sessionId);
    if (session) session.ended_at = ts;
    return;
  }

  await db.execute({ sql: "UPDATE mentor_session SET ended_at = ? WHERE id = ?", args: [ts, sessionId] });
}

export async function logEvent(sessionId: number, eventType: string, data: unknown) {
  const db = getClient();
  const ts = now();
  
  if (!db) {
    inMemoryDb.session_event.push({
      id: nextId("session_event"),
      session_id: sessionId,
      event_type: eventType,
      timestamp: ts,
      data: JSON.stringify(data),
    });
    return;
  }

  await db.execute({
    sql: "INSERT INTO session_event (session_id, event_type, timestamp, data) VALUES (?, ?, ?, ?)",
    args: [sessionId, eventType, ts, JSON.stringify(data)],
  });
}

// ---------------------------------------------------------------------------
// Challenges
// ---------------------------------------------------------------------------

export async function getChallengeTemplates(
  opts?: { language?: string; concept?: string; difficulty?: string }
) {
  const db = getClient();
  
  if (!db) {
    let results = [...inMemoryDb.challenge_template];
    if (opts?.language) {
      const lang = (normalizeLanguageName(opts.language) ?? opts.language).toLowerCase();
      results = results.filter(r => String(r.language).toLowerCase() === lang);
    }
    if (opts?.difficulty) {
      results = results.filter(r => String(r.difficulty).toLowerCase() === opts.difficulty!.toLowerCase());
    }
    return results;
  }

  let sql = "SELECT * FROM challenge_template WHERE 1 = 1";
  const args: unknown[] = [];

  if (opts?.language) {
    sql += " AND LOWER(language) = ?";
    args.push((normalizeLanguageName(opts.language) ?? opts.language).toLowerCase());
  }
  if (opts?.difficulty) {
    sql += " AND LOWER(difficulty) = ?";
    args.push(opts.difficulty.toLowerCase());
  }
  if (opts?.concept) {
    sql += " AND LOWER(concept_tags) LIKE ?";
    args.push(`%${opts.concept.toLowerCase()}%`);
  }
  sql += " ORDER BY title";

  const r = await db.execute({ sql, args: args as any });
  return r.rows.map((row) => ({ ...row }));
}

export async function getChallengeTemplate(id: number) {
  const db = getClient();
  
  if (!db) {
    return inMemoryDb.challenge_template.find(r => r.id === id) || null;
  }

  const r = await db.execute({ sql: "SELECT * FROM challenge_template WHERE id = ?", args: [id] });
  return r.rows.length ? { ...r.rows[0] } : null;
}

// ---------------------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------------------

export async function createChallengeAssignment(learnerId: number, challengeId: number): Promise<number> {
  const db = getClient();
  const ts = now();
  
  if (!db) {
    const id = nextId("challenge_assignment");
    inMemoryDb.challenge_assignment.push({
      id,
      learner_id: learnerId,
      challenge_id: challengeId,
      assigned_at: ts,
      status: "assigned",
    });
    return id;
  }

  const r = await db.execute({
    sql: "INSERT INTO challenge_assignment (learner_id, challenge_id, assigned_at, status) VALUES (?, ?, ?, ?)",
    args: [learnerId, challengeId, ts, "assigned"],
  });
  return Number(r.lastInsertRowid);
}

export async function getChallengeAssignment(id: number) {
  const db = getClient();
  
  if (!db) {
    return inMemoryDb.challenge_assignment.find(r => r.id === id) || null;
  }

  const r = await db.execute({ sql: "SELECT * FROM challenge_assignment WHERE id = ?", args: [id] });
  return r.rows.length ? { ...r.rows[0] } : null;
}

export async function startChallenge(assignmentId: number) {
  const db = getClient();
  const ts = now();
  
  if (!db) {
    const assignment = inMemoryDb.challenge_assignment.find(r => r.id === assignmentId);
    if (assignment && !assignment.started_at) {
      assignment.started_at = ts;
      assignment.status = "started";
    }
    return;
  }

  await db.execute({
    sql: "UPDATE challenge_assignment SET started_at = COALESCE(started_at, ?), status = ? WHERE id = ?",
    args: [ts, "started", assignmentId],
  });
}

export async function completeChallengeAssignment(assignmentId: number) {
  const db = getClient();
  const ts = now();
  
  if (!db) {
    const assignment = inMemoryDb.challenge_assignment.find(r => r.id === assignmentId);
    if (assignment) {
      assignment.completed_at = ts;
      assignment.status = "completed";
    }
    return;
  }

  await db.execute({
    sql: "UPDATE challenge_assignment SET completed_at = ?, status = ? WHERE id = ?",
    args: [ts, "completed", assignmentId],
  });
}

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------

export async function createChallengeAttempt(assignmentId: number, attemptNumber: number, code: string, language: string): Promise<number> {
  const db = getClient();
  const ts = now();
  
  if (!db) {
    const id = nextId("challenge_attempt");
    inMemoryDb.challenge_attempt.push({
      id,
      assignment_id: assignmentId,
      attempt_number: attemptNumber,
      submitted_at: ts,
      code,
      language: normalizeLanguageName(language) ?? "python",
    });
    return id;
  }

  const r = await db.execute({
    sql: "INSERT INTO challenge_attempt (assignment_id, attempt_number, submitted_at, code, language) VALUES (?, ?, ?, ?, ?)",
    args: [assignmentId, attemptNumber, ts, code, normalizeLanguageName(language) ?? "python"],
  });
  return Number(r.lastInsertRowid);
}

export async function getNextAttemptNumber(assignmentId: number): Promise<number> {
  const db = getClient();
  
  if (!db) {
    const attempts = inMemoryDb.challenge_attempt.filter(r => r.assignment_id === assignmentId);
    const maxAttempt = attempts.reduce((max, r) => Math.max(max, Number(r.attempt_number) || 0), 0);
    return maxAttempt + 1;
  }

  const r = await db.execute({
    sql: "SELECT COALESCE(MAX(attempt_number), 0) AS m FROM challenge_attempt WHERE assignment_id = ?",
    args: [assignmentId],
  });
  return Number((r.rows[0] as any).m ?? 0) + 1;
}

export async function updateChallengeAttempt(id: number, u: { feedback?: string; passed?: number; rubric_score?: number }) {
  const db = getClient();
  
  if (!db) {
    const attempt = inMemoryDb.challenge_attempt.find(r => r.id === id);
    if (attempt) {
      if (u.feedback !== undefined) attempt.feedback = u.feedback;
      if (u.passed !== undefined) attempt.passed = u.passed;
      if (u.rubric_score !== undefined) attempt.rubric_score = u.rubric_score;
    }
    return;
  }

  const sets: string[] = [];
  const args: unknown[] = [];
  if (u.feedback !== undefined) { sets.push("feedback = ?"); args.push(u.feedback); }
  if (u.passed !== undefined) { sets.push("passed = ?"); args.push(u.passed); }
  if (u.rubric_score !== undefined) { sets.push("rubric_score = ?"); args.push(u.rubric_score); }
  if (!sets.length) return;
  args.push(id);
  await db.execute({ sql: `UPDATE challenge_attempt SET ${sets.join(", ")} WHERE id = ?`, args: args as any });
}

export async function getLatestAttemptForAssignment(assignmentId: number) {
  const db = getClient();
  
  if (!db) {
    const attempts = inMemoryDb.challenge_attempt.filter(r => r.assignment_id === assignmentId);
    return attempts.sort((a, b) => Number(b.attempt_number) - Number(a.attempt_number))[0] || null;
  }

  const r = await db.execute({
    sql: "SELECT * FROM challenge_attempt WHERE assignment_id = ? ORDER BY attempt_number DESC LIMIT 1",
    args: [assignmentId],
  });
  return r.rows.length ? { ...r.rows[0] } : null;
}

// ---------------------------------------------------------------------------
// Mistakes
// ---------------------------------------------------------------------------

export async function recordMistake(attemptId: number, m: { mistake_type: string; description?: string; code_snippet?: string; suggestion?: string; confidence?: number }) {
  const db = getClient();
  const ts = now();
  
  if (!db) {
    inMemoryDb.mistake_observation.push({
      id: nextId("mistake_observation"),
      attempt_id: attemptId,
      mistake_type: m.mistake_type,
      description: m.description ?? null,
      code_snippet: m.code_snippet ?? null,
      suggestion: m.suggestion ?? null,
      confidence: m.confidence ?? 0.5,
      detected_at: ts,
    });
    return;
  }

  await db.execute({
    sql: "INSERT INTO mistake_observation (attempt_id, mistake_type, description, code_snippet, suggestion, confidence, detected_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [attemptId, m.mistake_type, m.description ?? null, m.code_snippet ?? null, m.suggestion ?? null, m.confidence ?? 0.5, ts],
  });
}

export async function updateOrCreateMistakePattern(learnerId: number, mistakeType: string, language: string | null, description: string) {
  const db = getClient();
  const ts = now();
  
  if (!db) {
    const existing = inMemoryDb.mistake_pattern.find(
      r => r.learner_id === learnerId && r.mistake_type === mistakeType && r.language === language
    );
    if (existing) {
      existing.occurrence_count = Number(existing.occurrence_count || 1) + 1;
      existing.last_observed = ts;
    } else {
      inMemoryDb.mistake_pattern.push({
        id: nextId("mistake_pattern"),
        learner_id: learnerId,
        language,
        mistake_type: mistakeType,
        tags: null,
        description,
        occurrence_count: 1,
        last_observed: ts,
        first_observed: ts,
      });
    }
    return;
  }

  const existing = await db.execute({
    sql: "SELECT id, occurrence_count FROM mistake_pattern WHERE learner_id = ? AND mistake_type = ? AND language IS ?",
    args: [learnerId, mistakeType, language],
  });
  
  if (existing.rows.length) {
    const row = existing.rows[0] as any;
    await db.execute({
      sql: "UPDATE mistake_pattern SET occurrence_count = ?, last_observed = ? WHERE id = ?",
      args: [Number(row.occurrence_count) + 1, ts, row.id],
    });
  } else {
    await db.execute({
      sql: "INSERT INTO mistake_pattern (learner_id, language, mistake_type, tags, description, occurrence_count, last_observed, first_observed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [learnerId, language, mistakeType, null, description, 1, ts, ts],
    });
  }
}

export async function getRecentMistakes(learnerId: number, limit = 10) {
  const db = getClient();
  
  if (!db) {
    return inMemoryDb.mistake_pattern
      .filter(r => r.learner_id === learnerId)
      .sort((a, b) => String(b.last_observed || "").localeCompare(String(a.last_observed || "")))
      .slice(0, limit);
  }

  const r = await db.execute({
    sql: "SELECT DISTINCT * FROM mistake_pattern WHERE learner_id = ? ORDER BY last_observed DESC LIMIT ?",
    args: [learnerId, limit],
  });
  return r.rows.map((row) => ({ ...row }));
}

// ---------------------------------------------------------------------------
// Proficiency
// ---------------------------------------------------------------------------

export async function getLanguageProficiencies(learnerId: number) {
  const db = getClient();
  
  if (!db) {
    return inMemoryDb.language_proficiency.filter(r => r.learner_id === learnerId);
  }

  const r = await db.execute({
    sql: "SELECT * FROM language_proficiency WHERE learner_id = ? ORDER BY language",
    args: [learnerId],
  });
  return r.rows.map((row) => ({ ...row }));
}

export async function updateLanguageProficiency(learnerId: number, language: string, score: number, attempts: number, successes: number) {
  const db = getClient();
  const ts = now();
  const lang = normalizeLanguageName(language) ?? "python";
  score = Math.max(0, Math.min(1, score));
  const level = score >= 0.8 ? "expert" : score >= 0.6 ? "advanced" : score >= 0.4 ? "intermediate" : "beginner";
  
  if (!db) {
    const existing = inMemoryDb.language_proficiency.find(
      r => r.learner_id === learnerId && r.language === lang
    );
    if (existing) {
      existing.score = score;
      existing.level = level;
      existing.attempts_count = attempts;
      existing.successful_attempts = successes;
      existing.updated_at = ts;
    } else {
      inMemoryDb.language_proficiency.push({
        id: nextId("language_proficiency"),
        learner_id: learnerId,
        language: lang,
        level,
        score,
        attempts_count: attempts,
        successful_attempts: successes,
        updated_at: ts,
      });
    }
    return;
  }

  const existing = await db.execute({
    sql: "SELECT id FROM language_proficiency WHERE learner_id = ? AND language = ?",
    args: [learnerId, lang],
  });

  if (existing.rows.length) {
    await db.execute({
      sql: "UPDATE language_proficiency SET score = ?, level = ?, attempts_count = ?, successful_attempts = ?, updated_at = ? WHERE id = ?",
      args: [score, level, attempts, successes, ts, (existing.rows[0] as any).id],
    });
  } else {
    await db.execute({
      sql: "INSERT INTO language_proficiency (learner_id, language, level, score, attempts_count, successful_attempts, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [learnerId, lang, level, score, attempts, successes, ts],
    });
  }
}

// ---------------------------------------------------------------------------
// Completed IDs
// ---------------------------------------------------------------------------

export async function getCompletedChallengeIds(learnerId: number): Promise<number[]> {
  const db = getClient();
  
  if (!db) {
    return inMemoryDb.challenge_assignment
      .filter(r => r.learner_id === learnerId && r.status === "completed")
      .map(r => Number(r.challenge_id));
  }

  const r = await db.execute({
    sql: "SELECT DISTINCT challenge_id FROM challenge_assignment WHERE learner_id = ? AND status = 'completed'",
    args: [learnerId],
  });
  return r.rows.map((row) => Number((row as any).challenge_id));
}

// ---------------------------------------------------------------------------
// Dashboard metrics
// ---------------------------------------------------------------------------

export async function getDashboardMetrics(learnerId: number) {
  const db = getClient();
  
  if (!db) {
    const completed = inMemoryDb.challenge_assignment.filter(
      r => r.learner_id === learnerId && r.status === "completed"
    ).length;
    
    const attempts = inMemoryDb.challenge_attempt.filter(r => {
      const assignment = inMemoryDb.challenge_assignment.find(a => a.id === r.assignment_id);
      return assignment && assignment.learner_id === learnerId;
    });
    
    const totalAttempts = attempts.length;
    const lastDate = attempts.length > 0 
      ? attempts.sort((a, b) => String(b.submitted_at || "").localeCompare(String(a.submitted_at || "")))[0]?.submitted_at 
      : null;
    
    return {
      challenges_completed: completed,
      total_attempts: totalAttempts,
      last_attempt_date: lastDate ?? null,
      current_streak: 0,
    };
  }

  const cc = await db.execute({
    sql: "SELECT COUNT(*) AS c FROM challenge_assignment WHERE learner_id = ? AND status = 'completed'",
    args: [learnerId],
  });
  const challengesCompleted = Number((cc.rows[0] as any).c ?? 0);

  const as2 = await db.execute({
    sql: `SELECT COUNT(*) AS total, MAX(ca.submitted_at) AS last_date
          FROM challenge_attempt ca JOIN challenge_assignment assn ON assn.id = ca.assignment_id
          WHERE assn.learner_id = ?`,
    args: [learnerId],
  });
  const totalAttempts = Number((as2.rows[0] as any).total ?? 0);
  const lastDate = (as2.rows[0] as any).last_date ?? null;

  const days = await db.execute({
    sql: `SELECT DISTINCT DATE(ca.submitted_at) AS d
          FROM challenge_attempt ca JOIN challenge_assignment assn ON assn.id = ca.assignment_id
          WHERE assn.learner_id = ? ORDER BY d DESC`,
    args: [learnerId],
  });

  let streak = 0;
  const dayList = days.rows.map((r: any) => r.d).filter(Boolean) as string[];
  if (dayList.length) {
    let prev: Date | null = null;
    for (let i = 0; i < dayList.length; i++) {
      const cur = new Date(dayList[i]);
      if (i === 0) { streak = 1; }
      else if (prev && Math.round((prev.getTime() - cur.getTime()) / 86400000) === 1) { streak++; }
      else break;
      prev = cur;
    }
  }

  return {
    challenges_completed: challengesCompleted,
    total_attempts: totalAttempts,
    last_attempt_date: lastDate,
    current_streak: streak,
  };
}
