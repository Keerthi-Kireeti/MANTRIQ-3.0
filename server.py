from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
import subprocess
import sys
import os
from typing import Optional
import re

app = Flask(__name__)
CORS(app)

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
GENERATED_DIR = os.path.join(PROJECT_ROOT, "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

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

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.json
    mode = data.get('mode', 'explain')
    code = data.get('code', '')
    
    if not code:
        return jsonify({"error": "Code is required"}), 400
    
    def generate():
        try:
            script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vector_streaming.py")
            env = os.environ.copy()
            # Ensure the child Python process is unbuffered for timely streaming
            env["PYTHONUNBUFFERED"] = "1"
            process = subprocess.Popen(
                [sys.executable, script_path, mode, code],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                env=env,
            )

            # Stream chunks as they arrive without waiting for newlines
            if process.stdout is None:
                raise RuntimeError("Failed to capture subprocess stdout")

            for chunk in iter(lambda: process.stdout.read(1), ''):
                if chunk:
                    yield chunk
                # If the process ended and no more data, break
                if process.poll() is not None and not chunk:
                    break

            # Drain stderr at the end and surface errors for visibility
            if process.stderr is not None:
                err = process.stderr.read()
                if err:
                    yield f"\n[error] {err}"

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
