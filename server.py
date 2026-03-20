from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
import subprocess
import sys
import os
from typing import Optional, Dict, Any, List
import re
import json
from datetime import datetime

# Mentor system imports
import mentor_db as db
from mentor_service import get_mentor_service

app = Flask(__name__)
CORS(app)

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
GENERATED_DIR = os.path.join(PROJECT_ROOT, "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

# Initialize mentor database
db.init_db()
db.seed_challenges()
LEARNER = db.bootstrap_learner()  # Single-user for v1

# Get mentor service
mentor_service = get_mentor_service()
mentor_service.set_learner(LEARNER["id"])

def _resolve_safe_path(file_path: str) -> str:
    """Resolve a path relative to project root and prevent path traversal."""
    # If incoming path is absolute, keep it but still enforce it lives under project root
    candidate = file_path
    if not os.path.isabs(candidate):
        candidate = os.path.join(PROJECT_ROOT, candidate)
    normalized = os.path.normpath(os.path.abspath(candidate))
    if not normalized.startswith(PROJECT_ROOT):
        raise ValueError("Access to paths outside the project is not allowed")
    return normalized

def _safe_filename(name: str, default_ext: str = ".txt") -> str:
    name = name.strip().replace(" ", "_")
    name = re.sub(r"[^a-zA-Z0-9_\.-]", "", name)
    if not os.path.splitext(name)[1]:
        name += default_ext
    return name

def _ext_from_language(lang: str) -> str:
    m = {
        "python": ".py",
        "py": ".py",
        "javascript": ".js",
        "js": ".js",
        "typescript": ".ts",
        "ts": ".ts",
        "tsx": ".tsx",
        "jsx": ".jsx",
        "html": ".html",
        "css": ".css",
        "json": ".json",
        "yaml": ".yaml",
        "yml": ".yml",
        "sh": ".sh",
        "bash": ".sh",
        "go": ".go",
        "java": ".java",
        "c": ".c",
        "cpp": ".cpp",
        "cs": ".cs",
        "ruby": ".rb",
        "php": ".php",
        "rust": ".rs",
        "swift": ".swift",
        "kotlin": ".kt",
        "md": ".md",
    }
    return m.get(lang.lower(), ".txt")

def _extract_code_from_markdown(text: str) -> tuple[str, str]:
    """Return (code, ext) by extracting the first fenced code block if present."""
    fence = re.search(r"```(\w+)?\n([\s\S]*?)```", text)
    if fence:
        lang = fence.group(1) or ""
        code = fence.group(2)
        return code, _ext_from_language(lang)
    return text, ".txt"


def _parse_json_field(value: Any, default: Any):
    """Safely parse JSON-ish DB fields into UI-friendly values."""
    if value is None:
        return default
    if isinstance(value, (list, dict)):
        return value
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return default
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return default
    return default


def _normalize_profile(profile: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Normalize learner profile data for API responses."""
    if not profile:
        return None

    normalized = dict(profile)
    preferred_languages = db.parse_text_list(normalized.get("preferred_languages"))
    normalized["preferred_languages"] = preferred_languages
    normalized["preferred_languages_display"] = ", ".join(lang.title() for lang in preferred_languages)
    normalized["current_language"] = db.normalize_language_name(normalized.get("current_language")) or "python"
    return normalized


def _normalize_challenge(challenge: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Normalize challenge records into a consistent API shape."""
    if not challenge:
        return None

    normalized = dict(challenge)
    normalized["language"] = db.normalize_language_name(normalized.get("language")) or "python"
    normalized["description"] = normalized.get("description") or ""
    normalized["starter_code"] = normalized.get("starter_code") or ""
    normalized["concept_tags"] = _parse_json_field(normalized.get("concept_tags"), [])
    normalized["hint_templates"] = _parse_json_field(normalized.get("hint_templates"), [])
    normalized["evaluation_rubric"] = _parse_json_field(normalized.get("evaluation_rubric"), {})
    return normalized


def _build_dashboard_snapshot(learner_id: int, profile: Dict[str, Any]) -> Dict[str, Any]:
    """Build the mentor dashboard payload from persisted data."""
    metrics = db.get_dashboard_metrics(learner_id)
    return {
        "learner_name": "You",
        "onboarding_complete": profile.get("onboarding_complete", 0),
        "proficiencies": db.get_language_proficiencies(learner_id),
        "recent_mistakes": db.get_recent_mistakes(learner_id, limit=5),
        **metrics,
    }

@app.route('/api/chat', methods=['POST'])
def chat_api():
    """
    Chat endpoint supporting both old and new mentor formats.
    
    New format: { mode, code, language?, prompt?, sessionId?, challengeAttemptId? }
    Old format: { mode, code }
    """
    data = request.json or {}
    mode = data.get('mode', 'explain')
    code = data.get('code', '')
    language = data.get('language', 'python')
    prompt = data.get('prompt')
    session_id = data.get('sessionId')
    challenge_attempt_id = data.get('challengeAttemptId')

    if not code and not prompt:
        return jsonify({"error": "Code or prompt is required"}), 400

    def generate():
        try:
            # Use mentor service for streaming
            for chunk in mentor_service.stream_chat(
                mode=mode,
                code=code,
                language=language,
                prompt=prompt,
                session_id=session_id,
                challenge_attempt_id=challenge_attempt_id
            ):
                yield chunk

        except Exception as e:
            yield f"Error: {str(e)}"

    return Response(generate(), mimetype='text/plain')

@app.route('/api/generate-file', methods=['POST'])
def generate_file():
    data = request.json or {}
    prompt = data.get('prompt') or data.get('request') or data.get('code')
    filename = data.get('filename')
    if not prompt:
        return jsonify({"error": "'prompt' is required"}), 400

    try:
        script_path = os.path.join(PROJECT_ROOT, "vector_streaming.py")
        env = os.environ.copy()
        env["PYTHONUNBUFFERED"] = "1"
        process = subprocess.Popen(
            [sys.executable, script_path, "generate", prompt],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            env=env,
        )
        stdout, stderr = process.communicate()
        if process.returncode not in (0, None) and stderr:
            return jsonify({"error": stderr.strip()}), 500

        code, suggested_ext = _extract_code_from_markdown(stdout)
        if not filename:
            base = re.sub(r"\s+", "_", prompt.strip())[:32] or "generated"
            filename = base + suggested_ext
        safe_name = _safe_filename(filename, default_ext=suggested_ext)
        target = os.path.join(GENERATED_DIR, safe_name)
        with open(target, "w", encoding="utf-8") as f:
            f.write(code)

        download_url = f"/api/download?file={safe_name}"
        return jsonify({
            "filename": safe_name,
            "relative_path": os.path.relpath(target, PROJECT_ROOT),
            "download_url": download_url,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download', methods=['GET'])
def download_file():
    file = request.args.get('file')
    if not file:
        return jsonify({"error": "'file' query parameter is required"}), 400
    safe_name = _safe_filename(file)
    target = os.path.join(GENERATED_DIR, safe_name)
    if not os.path.isfile(target):
        return jsonify({"error": "File not found"}), 404
    return send_from_directory(GENERATED_DIR, safe_name, as_attachment=True)

@app.route('/api/read-file', methods=['POST'])
def read_file():
    data = request.json
    file_path = data.get('file_path')

    if not file_path:
        return jsonify({"error": "File path is required"}), 400

    try:
        safe_path = _resolve_safe_path(file_path)
        with open(safe_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({"content": content})
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/save-file", methods=["POST"])
def save_file():
    data = request.get_json()
    file_path = data.get("file_path")
    content = data.get("content")

    if not file_path or content is None:
        return jsonify({"error": "Missing file_path or content"}), 400

    try:
        safe_path = _resolve_safe_path(file_path)
        os.makedirs(os.path.dirname(safe_path), exist_ok=True)
        with open(safe_path, "w", encoding="utf-8") as f:
            f.write(content)
        return jsonify({"message": "File saved successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==================== Mentor API Endpoints ====================

@app.route("/api/mentor/bootstrap", methods=["GET"])
def mentor_bootstrap():
    """
    Initialize the mentor dashboard on first run.
    Returns: { profile, dashboard, recommendedChallenge, learningPath }
    """
    try:
        learner = LEARNER

        # Get profile
        profile = _normalize_profile(db.get_learner_profile(learner["id"]))
        if not profile:
            return jsonify({"error": "Learner profile not found"}), 404

        dashboard = _build_dashboard_snapshot(learner["id"], profile)
        recommended = _normalize_challenge(mentor_service.generate_next_recommendation(learner["id"]))
        challenges = [_normalize_challenge(challenge) for challenge in db.get_challenge_templates()]

        concept_order: List[str] = []
        for challenge in challenges:
            for concept in challenge.get("concept_tags", []):
                if concept not in concept_order:
                    concept_order.append(concept)
        if not concept_order:
            concept_order = ["loops", "conditionals", "functions", "data-structures", "recursion"]

        learning_path = {
            "concepts": concept_order,
            "challenges": [
                {
                    "id": ch["id"],
                    "title": ch["title"],
                    "difficulty": ch["difficulty"],
                    "language": ch["language"],
                    "concept_tags": ch.get("concept_tags", []),
                    "prompt": ch["prompt"],
                    "starter_code": ch.get("starter_code", ""),
                    "description": ch.get("description", ""),
                }
                for ch in challenges
            ]
        }

        return jsonify({
            "profile": profile,
            "dashboard": dashboard,
            "recommendedChallenge": recommended,
            "learningPath": learning_path,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mentor/profile", methods=["GET"])
def get_mentor_profile():
    """Get learner profile."""
    try:
        profile = _normalize_profile(db.get_learner_profile(LEARNER["id"]))
        return jsonify(profile)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mentor/profile", methods=["PUT"])
def update_mentor_profile():
    """Update learner profile with goals and preferred languages."""
    try:
        data = request.json or {}
        goals = data.get("goals")
        preferred_languages = data.get("preferred_languages")
        current_language = data.get("current_language")
        onboarding_complete = data.get("onboarding_complete")

        updated = db.update_learner_profile(
            LEARNER["id"],
            goals=goals,
            preferred_languages=preferred_languages,
            current_language=current_language,
            onboarding_complete=onboarding_complete
        )

        return jsonify(_normalize_profile(updated))

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mentor/sessions", methods=["POST"])
def create_mentor_session():
    """Start a new mentor session."""
    try:
        data = request.json or {}
        mode = data.get("mode", "mentor")

        session_id = db.start_session(LEARNER["id"], mode)

        return jsonify({
            "session_id": session_id,
            "learner_id": LEARNER["id"],
            "started_at": datetime.utcnow().isoformat(),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mentor/sessions/<int:session_id>", methods=["POST"])
def end_mentor_session(session_id: int):
    """End a mentor session."""
    try:
        db.end_session(session_id)
        return jsonify({"message": "Session ended"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mentor/events", methods=["POST"])
def log_mentor_event():
    """Log a structured event in a session."""
    try:
        data = request.json or {}
        session_id = data.get("session_id")
        event_type = data.get("event_type")
        event_data = data.get("data", {})

        if not session_id or not event_type:
            return jsonify({"error": "session_id and event_type required"}), 400

        db.log_event(session_id, event_type, event_data)

        return jsonify({"message": "Event logged"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mentor/challenges", methods=["GET"])
def list_mentor_challenges():
    """List mentor challenges with optional filters."""
    try:
        concept = request.args.get("concept")
        difficulty = request.args.get("difficulty")
        language = request.args.get("language")

        challenges = db.get_challenge_templates(
            language=language,
            concept=concept,
            difficulty=difficulty,
        )

        normalized_challenges = [_normalize_challenge(challenge) for challenge in challenges]
        return jsonify({"challenges": normalized_challenges})
    except Exception as e:
        return jsonify({"error": str(e), "challenges": []}), 500


@app.route("/api/mentor/challenges/next", methods=["GET"])
def get_next_challenge():
    """Get recommended next challenge."""
    try:
        challenge = _normalize_challenge(mentor_service.generate_next_recommendation(LEARNER["id"]))

        if not challenge:
            return jsonify({"error": "No challenges available"}), 404

        return jsonify(challenge)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mentor/challenges/<int:challenge_id>/start", methods=["POST"])
def start_challenge(challenge_id: int):
    """Start a challenge."""
    try:
        # Check challenge exists
        template = db.get_challenge_template(challenge_id)
        if not template:
            return jsonify({"error": "Challenge not found"}), 404

        # Create assignment and return it
        assignment_id = db.create_challenge_assignment(LEARNER["id"], challenge_id)
        db.start_challenge(assignment_id)

        return jsonify({
            "assignment_id": assignment_id,
            "challenge": _normalize_challenge(template),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mentor/attempts/<int:assignment_id>/hint", methods=["POST"])
def get_challenge_hint(assignment_id: int):
    """Get a hint for the current challenge attempt."""
    try:
        assignment = db.get_challenge_assignment(assignment_id)
        if not assignment:
            return jsonify({"error": "Assignment not found"}), 404

        data = request.json or {}
        draft_code = data.get("code", "")

        hint = mentor_service.generate_personalized_hint(assignment_id, draft_code=draft_code)

        return jsonify({"hint": hint})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mentor/attempts/<int:assignment_id>/submit", methods=["POST"])
def submit_challenge_attempt(assignment_id: int):
    """Submit a challenge attempt and get evaluation."""
    try:
        data = request.json or {}
        code = data.get("code")
        language = db.normalize_language_name(data.get("language", "python")) or "python"

        if not code:
            return jsonify({"error": "Code is required"}), 400

        assignment = db.get_challenge_assignment(assignment_id)
        if not assignment:
            return jsonify({"error": "Assignment not found"}), 404

        template = db.get_challenge_template(assignment["challenge_id"])
        if not template:
            return jsonify({"error": "Challenge template not found"}), 404

        # Determine attempt number from persisted history
        attempt_number = db.get_next_attempt_number(assignment_id)

        # Create attempt record
        attempt_id = db.create_challenge_attempt(assignment_id, attempt_number, code, language)

        # Evaluate the attempt
        evaluation = mentor_service.evaluate_challenge_attempt(
            {"code": code, "language": language},
            template
        )

        # Record mistakes
        for mistake in evaluation.get("mistakes", []):
            db.record_mistake(
                attempt_id,
                mistake_type=mistake.get("mistake_type", "debugging-strategy"),
                description=mistake.get("description"),
                code_snippet=code[:100],
                suggestion=mistake.get("suggestion"),
                confidence=mistake.get("confidence", 0.5)
            )

            # Update or create mistake pattern
            db.update_or_create_mistake_pattern(
                LEARNER["id"],
                mistake_type=mistake.get("mistake_type", "debugging-strategy"),
                language=language,
                description=mistake.get("description"),
                tags=None
            )

        # Update attempt record
        db.update_challenge_attempt(
            attempt_id,
            feedback=evaluation.get("feedback"),
            passed=1 if evaluation.get("passed") else 0,
            rubric_score=evaluation.get("rubric_score", 0.5)
        )

        if evaluation.get("passed"):
            db.complete_challenge_assignment(assignment_id)

        # Update language proficiency
        profs = db.get_language_proficiencies(LEARNER["id"])
        prof_dict = {p["language"]: p for p in profs}

        if language in prof_dict:
            prof = prof_dict[language]
            score = prof["score"] * 0.7 + evaluation.get("rubric_score", 0.5) * 0.3
            db.update_language_proficiency(
                LEARNER["id"],
                language,
                score,
                prof["attempts_count"] + 1,
                prof["successful_attempts"] + (1 if evaluation.get("passed") else 0)
            )
        else:
            db.update_language_proficiency(
                LEARNER["id"],
                language,
                evaluation.get("rubric_score", 0.5),
                1,
                1 if evaluation.get("passed") else 0
            )

        return jsonify({
            "attempt_id": attempt_id,
            "attempt_number": attempt_number,
            "passed": evaluation.get("passed"),
            "rubric_score": evaluation.get("rubric_score"),
            "feedback": evaluation.get("feedback"),
            "mistakes": evaluation.get("mistakes", []),
            "assignment_status": "completed" if evaluation.get("passed") else assignment.get("status", "started"),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
