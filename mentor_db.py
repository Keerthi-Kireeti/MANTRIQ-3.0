"""
Mentor Database Schema and Models

Persistent local SQLite database for storing learner profile, sessions,
challenges, attempts, and analytics for the MANTRIQ mentor system.
"""

import sqlite3
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pathlib import Path

DB_PATH = os.path.join(os.path.dirname(__file__), "mentor.db")


class MistakeType(str, Enum):
    SYNTAX = "syntax"
    LOGIC = "logic"
    RUNTIME = "runtime"
    CONCEPTUAL = "conceptual"
    DEBUGGING_STRATEGY = "debugging-strategy"


class ProficiencyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class ChallengeDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


LANGUAGE_ALIASES = {
    "py": "python",
    "python": "python",
    "js": "javascript",
    "javascript": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "c++": "cpp",
    "cpp": "cpp",
    "c#": "csharp",
    "cs": "csharp",
    "java": "java",
    "go": "go",
    "rust": "rust",
    "ruby": "ruby",
    "php": "php",
    "swift": "swift",
    "kotlin": "kotlin",
}


def normalize_language_name(language: Optional[str]) -> Optional[str]:
    """Normalize user-facing language labels into canonical stored values."""
    if language is None:
        return None

    normalized = str(language).strip().lower()
    if not normalized:
        return None
    return LANGUAGE_ALIASES.get(normalized, normalized)


def parse_text_list(value: Optional[Any]) -> List[str]:
    """Parse a stored text list from JSON or comma-separated text."""
    if value is None:
        return []

    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]

    text = str(value).strip()
    if not text:
        return []

    if text.startswith("["):
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()]
        except json.JSONDecodeError:
            pass

    return [item.strip() for item in text.split(",") if item.strip()]


def serialize_text_list(values: Optional[Any], *, normalize_languages: bool = False) -> Optional[str]:
    """Serialize a list-like value into a predictable comma-separated string."""
    items = parse_text_list(values)
    if normalize_languages:
        items = [normalize_language_name(item) for item in items]
    items = [item for item in items if item]

    deduped: List[str] = []
    seen = set()
    for item in items:
        if item not in seen:
            seen.add(item)
            deduped.append(item)

    return ", ".join(deduped) if deduped else None


def get_db() -> sqlite3.Connection:
    """Get database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database schema on startup."""
    conn = get_db()
    cursor = conn.cursor()

    # learner_profile: top-level learner data
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS learner_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            goals TEXT,
            preferred_languages TEXT,
            current_language TEXT,
            onboarding_complete INTEGER DEFAULT 0
        )
    """)

    # mentor_session: session tracking
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mentor_session (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            learner_id INTEGER NOT NULL,
            started_at TEXT NOT NULL,
            ended_at TEXT,
            mode TEXT NOT NULL,
            metadata TEXT,
            FOREIGN KEY (learner_id) REFERENCES learner_profile(id)
        )
    """)

    # session_event: structured event log
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS session_event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            event_type TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            data TEXT NOT NULL,
            FOREIGN KEY (session_id) REFERENCES mentor_session(id)
        )
    """)

    # challenge_template: challenge bank
    cursor.execute("""
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
        )
    """)

    # challenge_assignment: when challenge is assigned
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS challenge_assignment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            learner_id INTEGER NOT NULL,
            challenge_id INTEGER NOT NULL,
            assigned_at TEXT NOT NULL,
            started_at TEXT,
            completed_at TEXT,
            status TEXT DEFAULT 'assigned',
            FOREIGN KEY (learner_id) REFERENCES learner_profile(id),
            FOREIGN KEY (challenge_id) REFERENCES challenge_template(id)
        )
    """)

    # challenge_attempt: each attempt at challenge
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS challenge_attempt (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assignment_id INTEGER NOT NULL,
            attempt_number INTEGER NOT NULL,
            submitted_at TEXT NOT NULL,
            code TEXT NOT NULL,
            language TEXT NOT NULL,
            feedback TEXT,
            passed INTEGER DEFAULT 0,
            rubric_score REAL,
            FOREIGN KEY (assignment_id) REFERENCES challenge_assignment(id)
        )
    """)

    # mistake_observation: individual mistakes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mistake_observation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            attempt_id INTEGER NOT NULL,
            mistake_type TEXT NOT NULL,
            description TEXT,
            code_snippet TEXT,
            suggestion TEXT,
            confidence REAL DEFAULT 0.5,
            detected_at TEXT NOT NULL,
            FOREIGN KEY (attempt_id) REFERENCES challenge_attempt(id)
        )
    """)

    # mistake_pattern: recurring mistakes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mistake_pattern (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            learner_id INTEGER NOT NULL,
            language TEXT,
            mistake_type TEXT NOT NULL,
            tags TEXT,
            description TEXT,
            occurrence_count INTEGER DEFAULT 1,
            last_observed TEXT,
            first_observed TEXT,
            FOREIGN KEY (learner_id) REFERENCES learner_profile(id)
        )
    """)

    # language_proficiency: per-language skill
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS language_proficiency (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            learner_id INTEGER NOT NULL,
            language TEXT NOT NULL,
            level TEXT NOT NULL,
            score REAL DEFAULT 0.5,
            attempts_count INTEGER DEFAULT 0,
            successful_attempts INTEGER DEFAULT 0,
            updated_at TEXT NOT NULL,
            UNIQUE(learner_id, language),
            FOREIGN KEY (learner_id) REFERENCES learner_profile(id)
        )
    """)

    # learning_recommendation: personalized suggestions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS learning_recommendation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            learner_id INTEGER NOT NULL,
            challenge_id INTEGER NOT NULL,
            reason TEXT,
            priority REAL DEFAULT 0.5,
            created_at TEXT NOT NULL,
            expires_at TEXT,
            FOREIGN KEY (learner_id) REFERENCES learner_profile(id),
            FOREIGN KEY (challenge_id) REFERENCES challenge_template(id)
        )
    """)

    conn.commit()
    conn.close()


def bootstrap_learner() -> Dict[str, Any]:
    """
    Create or retrieve the single learner profile.
    For v1, we assume single-user local-first design.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM learner_profile LIMIT 1")
    profile = cursor.fetchone()

    if profile:
        conn.close()
        return dict(profile)

    # Create new learner
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO learner_profile 
        (created_at, updated_at, goals, preferred_languages, current_language, onboarding_complete)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (now, now, None, None, "python", 0))

    conn.commit()
    profile_id = cursor.lastrowid
    conn.close()

    return {
        "id": profile_id,
        "created_at": now,
        "updated_at": now,
        "goals": None,
        "preferred_languages": None,
        "current_language": "python",
        "onboarding_complete": 0
    }


def seed_challenges():
    """Seed the challenge template table with initial challenges. Run once on startup."""
    conn = get_db()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) as count FROM challenge_template")
    count = cursor.fetchone()["count"]

    if count > 0:
        conn.close()
        return

    now = datetime.utcnow().isoformat()

    challenges = [
        {
            "slug": "print-odds-python",
            "title": "Print All Odd Numbers",
            "description": "Write a program that prints all odd numbers from 1 to 10.",
            "language": "python",
            "difficulty": "easy",
            "concept_tags": json.dumps(["loops", "conditionals", "basics"]),
            "prompt": "Write a Python program that prints all odd numbers from 1 to 10.",
            "starter_code": "# Write your code here\n",
            "hint_templates": json.dumps(["Use a for loop", "Check if number % 2 != 0"]),
            "evaluation_rubric": json.dumps({
                "criteria": ["Correct output", "Code clarity", "Efficient solution"]
            }),
        },
        {
            "slug": "fibonacci-python",
            "title": "Fibonacci Sequence",
            "description": "Generate the first N Fibonacci numbers.",
            "language": "python",
            "difficulty": "medium",
            "concept_tags": json.dumps(["recursion", "loops", "sequences"]),
            "prompt": "Write a function that returns the first N Fibonacci numbers.",
            "starter_code": "def fibonacci(n):\n    # Your code here\n    pass\n",
            "hint_templates": json.dumps(["Initialize with [0, 1]", "Each number is sum of previous two"]),
            "evaluation_rubric": json.dumps({
                "criteria": ["Correct sequence", "Handles edge cases", "Efficient implementation"]
            }),
        },
        {
            "slug": "palindrome-python",
            "title": "Palindrome Checker",
            "description": "Check if a string is a palindrome.",
            "language": "python",
            "difficulty": "easy",
            "concept_tags": json.dumps(["strings", "conditionals"]),
            "prompt": "Write a function that checks if a string is a palindrome (reads same forwards and backwards).",
            "starter_code": "def is_palindrome(s):\n    # Your code here\n    pass\n",
            "hint_templates": json.dumps(["Reverse the string", "Compare with original"]),
            "evaluation_rubric": json.dumps({
                "criteria": ["Correct palindrome detection", "Handles case sensitivity", "Edge cases"]
            }),
        },
        {
            "slug": "count-words-python",
            "title": "Word Counter",
            "description": "Count the frequency of each word in a text.",
            "language": "python",
            "difficulty": "medium",
            "concept_tags": json.dumps(["dictionaries", "strings", "data-structures"]),
            "prompt": "Write a function that returns a dictionary with word frequencies from a given text.",
            "starter_code": "def count_words(text):\n    # Your code here\n    pass\n",
            "hint_templates": json.dumps(["Split text into words", "Use a dictionary to track counts"]),
            "evaluation_rubric": json.dumps({
                "criteria": ["Correct word counts", "Handles case", "Performance"]
            }),
        },
        {
            "slug": "sum-array-python",
            "title": "Array Sum",
            "description": "Calculate the sum of all elements in an array.",
            "language": "python",
            "difficulty": "easy",
            "concept_tags": json.dumps(["arrays", "loops", "basics"]),
            "prompt": "Write a function that returns the sum of all numbers in a list.",
            "starter_code": "def sum_array(arr):\n    # Your code here\n    pass\n",
            "hint_templates": json.dumps(["Initialize sum to 0", "Iterate through array", "Add each element"]),
            "evaluation_rubric": json.dumps({
                "criteria": ["Correct sum", "Handles empty array", "Clarity"]
            }),
        },
    ]

    for ch in challenges:
        ch["created_at"] = now
        ch["updated_at"] = now
        cursor.execute("""
            INSERT INTO challenge_template 
            (slug, title, description, language, difficulty, concept_tags, prompt, 
             starter_code, hint_templates, evaluation_rubric, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, tuple(ch.values()))

    conn.commit()
    conn.close()


def start_session(learner_id: int, mode: str) -> int:
    """Start a new mentor session."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO mentor_session (learner_id, started_at, mode)
        VALUES (?, ?, ?)
    """, (learner_id, now, mode))

    conn.commit()
    session_id = cursor.lastrowid
    conn.close()
    return session_id


def end_session(session_id: int):
    """End a mentor session."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute("UPDATE mentor_session SET ended_at = ? WHERE id = ?", (now, session_id))
    conn.commit()
    conn.close()


def log_event(session_id: int, event_type: str, data: Dict[str, Any]):
    """Log a structured event in a session."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO session_event (session_id, event_type, timestamp, data)
        VALUES (?, ?, ?, ?)
    """, (session_id, event_type, now, json.dumps(data)))

    conn.commit()
    conn.close()


def get_learner_profile(learner_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve learner profile."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM learner_profile WHERE id = ?", (learner_id,))
    profile = cursor.fetchone()
    conn.close()
    return dict(profile) if profile else None


def update_learner_profile(learner_id: int, goals: Optional[str] = None, 
                          preferred_languages: Optional[str] = None,
                          current_language: Optional[str] = None,
                          onboarding_complete: Optional[int] = None) -> Dict[str, Any]:
    """Update learner profile."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    updates = ["updated_at = ?"]
    params = [now]

    if goals is not None:
        if isinstance(goals, list):
            goals = ", ".join(str(goal).strip() for goal in goals if str(goal).strip())
        updates.append("goals = ?")
        params.append(goals)
    if preferred_languages is not None:
        preferred_languages = serialize_text_list(preferred_languages, normalize_languages=True)
        updates.append("preferred_languages = ?")
        params.append(preferred_languages)
    if current_language is not None:
        current_language = normalize_language_name(current_language)
        updates.append("current_language = ?")
        params.append(current_language)
    elif preferred_languages is not None:
        preferred_list = parse_text_list(preferred_languages)
        if preferred_list:
            updates.append("current_language = ?")
            params.append(preferred_list[0])
    if onboarding_complete is not None:
        updates.append("onboarding_complete = ?")
        params.append(onboarding_complete)

    params.append(learner_id)

    cursor.execute(f"UPDATE learner_profile SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()

    updated = get_learner_profile(learner_id)
    conn.close()
    return updated


def get_language_proficiencies(learner_id: int) -> List[Dict[str, Any]]:
    """Get all language proficiencies for learner."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM language_proficiency WHERE learner_id = ? ORDER BY language",
        (learner_id,)
    )
    proficiencies = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return proficiencies


def update_language_proficiency(learner_id: int, language: str, score: float, 
                                attempts_count: int, successful_attempts: int):
    """Update or insert language proficiency."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    language = normalize_language_name(language) or "python"
    score = max(0.0, min(1.0, score))

    cursor.execute(
        "SELECT id FROM language_proficiency WHERE learner_id = ? AND language = ?",
        (learner_id, language)
    )
    existing = cursor.fetchone()

    if existing:
        # Determine level based on score
        if score >= 0.8:
            level = ProficiencyLevel.EXPERT
        elif score >= 0.6:
            level = ProficiencyLevel.ADVANCED
        elif score >= 0.4:
            level = ProficiencyLevel.INTERMEDIATE
        else:
            level = ProficiencyLevel.BEGINNER

        cursor.execute("""
            UPDATE language_proficiency 
            SET score = ?, level = ?, attempts_count = ?, successful_attempts = ?, updated_at = ?
            WHERE id = ?
        """, (score, level, attempts_count, successful_attempts, now, existing[0]))
    else:
        level = ProficiencyLevel.BEGINNER if score < 0.4 else ProficiencyLevel.INTERMEDIATE

        cursor.execute("""
            INSERT INTO language_proficiency 
            (learner_id, language, level, score, attempts_count, successful_attempts, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (learner_id, language, level, score, attempts_count, successful_attempts, now))

    conn.commit()
    conn.close()


def get_challenge_templates(language: Optional[str] = None,
                            concept: Optional[str] = None,
                            difficulty: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get challenge templates with optional language, concept, and difficulty filters."""
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM challenge_template WHERE 1 = 1"
    params: List[Any] = []

    if language:
        query += " AND LOWER(language) = ?"
        params.append((normalize_language_name(language) or language).lower())
    if difficulty:
        query += " AND LOWER(difficulty) = ?"
        params.append(str(difficulty).strip().lower())
    if concept:
        query += " AND LOWER(concept_tags) LIKE ?"
        params.append(f"%{str(concept).strip().lower()}%")

    query += " ORDER BY title"
    cursor.execute(query, params)

    challenges = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return challenges


def get_challenge_template(challenge_id: int) -> Optional[Dict[str, Any]]:
    """Get a single challenge template."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM challenge_template WHERE id = ?", (challenge_id,))
    challenge = cursor.fetchone()
    conn.close()
    return dict(challenge) if challenge else None


def create_challenge_assignment(learner_id: int, challenge_id: int) -> int:
    """Assign a challenge to a learner."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO challenge_assignment (learner_id, challenge_id, assigned_at, status)
        VALUES (?, ?, ?, ?)
    """, (learner_id, challenge_id, now, "assigned"))

    conn.commit()
    assignment_id = cursor.lastrowid
    conn.close()
    return assignment_id


def get_challenge_assignment(assignment_id: int) -> Optional[Dict[str, Any]]:
    """Get a challenge assignment."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM challenge_assignment WHERE id = ?", (assignment_id,))
    assignment = cursor.fetchone()
    conn.close()
    return dict(assignment) if assignment else None


def start_challenge(assignment_id: int):
    """Mark challenge as started."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        UPDATE challenge_assignment
        SET started_at = COALESCE(started_at, ?), status = ?
        WHERE id = ?
    """, (now, "started", assignment_id))
    conn.commit()
    conn.close()


def complete_challenge_assignment(assignment_id: int, status: str = "completed"):
    """Mark a challenge assignment as completed."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        UPDATE challenge_assignment
        SET completed_at = ?, status = ?
        WHERE id = ?
    """, (now, status, assignment_id))
    conn.commit()
    conn.close()


def create_challenge_attempt(assignment_id: int, attempt_number: int, code: str, 
                             language: str) -> int:
    """Create a challenge attempt."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    language = normalize_language_name(language) or "python"

    cursor.execute("""
        INSERT INTO challenge_attempt (assignment_id, attempt_number, submitted_at, code, language)
        VALUES (?, ?, ?, ?, ?)
    """, (assignment_id, attempt_number, now, code, language))

    conn.commit()
    attempt_id = cursor.lastrowid
    conn.close()
    return attempt_id


def get_challenge_attempt(attempt_id: int) -> Optional[Dict[str, Any]]:
    """Get a challenge attempt."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM challenge_attempt WHERE id = ?", (attempt_id,))
    attempt = cursor.fetchone()
    conn.close()
    return dict(attempt) if attempt else None


def get_latest_attempt_for_assignment(assignment_id: int) -> Optional[Dict[str, Any]]:
    """Get the latest attempt recorded for an assignment."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT *
        FROM challenge_attempt
        WHERE assignment_id = ?
        ORDER BY attempt_number DESC, submitted_at DESC
        LIMIT 1
    """, (assignment_id,))
    attempt = cursor.fetchone()
    conn.close()
    return dict(attempt) if attempt else None


def get_next_attempt_number(assignment_id: int) -> int:
    """Return the next attempt number for an assignment."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COALESCE(MAX(attempt_number), 0) AS max_attempt_number
        FROM challenge_attempt
        WHERE assignment_id = ?
    """, (assignment_id,))
    row = cursor.fetchone()
    conn.close()
    return int(row["max_attempt_number"] or 0) + 1


def update_challenge_attempt(attempt_id: int, feedback: Optional[str] = None,
                             passed: Optional[int] = None, rubric_score: Optional[float] = None):
    """Update challenge attempt with feedback."""
    conn = get_db()
    cursor = conn.cursor()

    updates = []
    params = []

    if feedback is not None:
        updates.append("feedback = ?")
        params.append(feedback)
    if passed is not None:
        updates.append("passed = ?")
        params.append(passed)
    if rubric_score is not None:
        updates.append("rubric_score = ?")
        params.append(rubric_score)

    if not updates:
        conn.close()
        return

    params.append(attempt_id)

    cursor.execute(f"UPDATE challenge_attempt SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    conn.close()


def record_mistake(attempt_id: int, mistake_type: str, description: str,
                   code_snippet: Optional[str] = None, suggestion: Optional[str] = None,
                   confidence: float = 0.5) -> int:
    """Record a mistake observation."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO mistake_observation 
        (attempt_id, mistake_type, description, code_snippet, suggestion, confidence, detected_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (attempt_id, mistake_type, description, code_snippet, suggestion, confidence, now))

    conn.commit()
    mistake_id = cursor.lastrowid
    conn.close()
    return mistake_id


def get_mistake_patterns(learner_id: int, language: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get recurring mistake patterns for learner."""
    conn = get_db()
    cursor = conn.cursor()

    if language:
        cursor.execute(
            "SELECT * FROM mistake_pattern WHERE learner_id = ? AND language = ? ORDER BY occurrence_count DESC",
            (learner_id, language)
        )
    else:
        cursor.execute(
            "SELECT * FROM mistake_pattern WHERE learner_id = ? ORDER BY occurrence_count DESC",
            (learner_id,)
        )

    patterns = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return patterns


def update_or_create_mistake_pattern(learner_id: int, mistake_type: str, language: Optional[str],
                                     description: str, tags: Optional[str] = None) -> int:
    """Update or create a mistake pattern."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute(
        "SELECT id, occurrence_count, last_observed FROM mistake_pattern WHERE learner_id = ? AND mistake_type = ? AND language IS ?",
        (learner_id, mistake_type, language)
    )
    existing = cursor.fetchone()

    if existing:
        new_count = existing["occurrence_count"] + 1
        cursor.execute("""
            UPDATE mistake_pattern 
            SET occurrence_count = ?, last_observed = ?
            WHERE id = ?
        """, (new_count, now, existing["id"]))
        pattern_id = existing["id"]
    else:
        cursor.execute("""
            INSERT INTO mistake_pattern 
            (learner_id, language, mistake_type, tags, description, occurrence_count, 
             last_observed, first_observed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (learner_id, language, mistake_type, tags, description, 1, now, now))
        pattern_id = cursor.lastrowid

    conn.commit()
    conn.close()
    return pattern_id


def get_recent_mistakes(learner_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent mistakes for learner."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT mp.* FROM mistake_pattern mp
        WHERE mp.learner_id = ?
        ORDER BY mp.last_observed DESC
        LIMIT ?
    """, (learner_id, limit))

    mistakes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return mistakes


def get_completed_challenge_ids(learner_id: int) -> List[int]:
    """Return completed challenge ids for the learner."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT challenge_id
        FROM challenge_assignment
        WHERE learner_id = ? AND status = 'completed'
    """, (learner_id,))
    completed = [int(row["challenge_id"]) for row in cursor.fetchall()]
    conn.close()
    return completed


def get_dashboard_metrics(learner_id: int) -> Dict[str, Any]:
    """Calculate aggregate dashboard metrics from persisted learner data."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*) AS challenges_completed
        FROM challenge_assignment
        WHERE learner_id = ? AND status = 'completed'
    """, (learner_id,))
    challenges_completed = int(cursor.fetchone()["challenges_completed"] or 0)

    cursor.execute("""
        SELECT
            COUNT(*) AS total_attempts,
            MAX(ca.submitted_at) AS last_attempt_date
        FROM challenge_attempt ca
        JOIN challenge_assignment assn ON assn.id = ca.assignment_id
        WHERE assn.learner_id = ?
    """, (learner_id,))
    attempt_summary = cursor.fetchone()
    total_attempts = int(attempt_summary["total_attempts"] or 0)
    last_attempt_date = attempt_summary["last_attempt_date"]

    cursor.execute("""
        SELECT DISTINCT DATE(ca.submitted_at) AS attempt_day
        FROM challenge_attempt ca
        JOIN challenge_assignment assn ON assn.id = ca.assignment_id
        WHERE assn.learner_id = ?
        ORDER BY attempt_day DESC
    """, (learner_id,))
    attempt_days = [row["attempt_day"] for row in cursor.fetchall() if row["attempt_day"]]
    conn.close()

    current_streak = 0
    if attempt_days:
        previous_day = None
        for index, day in enumerate(attempt_days):
            current_day = datetime.strptime(day, "%Y-%m-%d").date()
            if index == 0:
                current_streak = 1
            elif previous_day and (previous_day - current_day).days == 1:
                current_streak += 1
            else:
                break
            previous_day = current_day

    return {
        "challenges_completed": challenges_completed,
        "total_attempts": total_attempts,
        "last_attempt_date": last_attempt_date,
        "current_streak": current_streak,
    }
