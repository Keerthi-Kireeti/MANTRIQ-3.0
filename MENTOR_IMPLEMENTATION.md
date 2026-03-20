# MANTRIQ 2.0 - AI Coding Practice Mentor

A comprehensive, personalized AI-powered coding mentor system built with Flask, Next.js, and local LLM integration via Ollama.

## Overview

MANTRIQ 2.0 transforms from a simple code assistant into a full-featured learning platform that:

- **Personalizes Learning**: Tracks learner goals, preferred languages, and proficiency across languages
- **Provides Structured Challenges**: Bank of versioned challenges with difficulty levels and concept tags
- **Tracks Mistakes**: Analyzes errors, categorizes them (syntax, logic, runtime, conceptual), and builds recurring patterns
- **Recommends Paths**: Suggests challenges based on weaknesses, proficiency, and learning goals
- **Persistent State**: SQLite database locally stores all learner data, sessions, attempts, and analytics

## Architecture

### Backend (Python/Flask)

```
mentor_db.py          - SQLite schema and data access layer
mentor_service.py     - In-process LLM service layer (chat, evaluation, analysis)
server.py             - Flask API (handles both legacy and new mentor endpoints)
```

**Key Features:**
- Single learner profile (v1 is single-user, local-first)
- 10 core database tables: learner_profile, mentor_session, challenge_template, challenge_attempt, mistake_observation, mistake_pattern, language_proficiency, learning_recommendation, etc.
- Shared service layer used by both CLI and web API
- Context-aware LLM prompts that include learner history and personalization

### Frontend (Next.js/React)

```
UI/src/app/mentor/page.tsx                    - Main mentor dashboard
UI/src/components/mentor/MentorChatArea.tsx  - Chat interface with 5 modes
UI/src/components/mentor/ChallengeWorkspace  - Code editor + evaluation
UI/src/components/mentor/ProgressSnapshot    - Analytics and proficiency
UI/src/components/mentor/LearningPathRecommendations - Challenge recommendations
```

**Dashboard Features:**
- 4 main tabs: Mentor Chat, Challenge, Progress, Learning Path
- Onboarding flow for goals and language preferences
- Real-time chat streaming with personalized context
- Challenge submission with immediate feedback and rubric scoring
- Visual proficiency tracking across multiple languages

### API Endpoints

#### Mentor System
- `GET /api/mentor/bootstrap` - Initialize dashboard (profile, recommendations, learning path)
- `GET/PUT /api/mentor/profile` - Get/update learner profile
- `POST /api/mentor/sessions` - Start a session
- `POST /api/mentor/sessions/:id` - End a session
- `POST /api/mentor/events` - Log structured events
- `GET /api/mentor/challenges/next` - Get recommended next challenge
- `POST /api/mentor/challenges/:id/start` - Start a challenge
- `POST /api/mentor/attempts/:id/hint` - Get personalized hint
- `POST /api/mentor/attempts/:id/submit` - Submit attempt and get evaluation

#### Chat & Generation (Enhanced)
- `POST /api/chat` - Mentor-aware chat with modes: explain, debug, generate, optimize, review
  - Supports new payload: `{ mode, code, language?, prompt?, sessionId?, challengeAttemptId? }`
  - Prepends learner context to prompts automatically

#### Legacy File Operations (Backward Compatible)
- `POST /api/generate-file` - Generate code from prompt
- `GET /api/download` - Download generated files
- `POST /api/read-file` - Read file contents
- `POST /api/save-file` - Save file contents

## Database Schema

### Core Tables

**learner_profile** - Single learner for v1
```sql
id, created_at, updated_at, goals, preferred_languages, 
current_language, onboarding_complete
```

**mentor_session** - Session tracking
```sql
id, learner_id, started_at, ended_at, mode, metadata
```

**session_event** - Structured event log
```sql
id, session_id, event_type, timestamp, data (JSON)
```

**challenge_template** - Challenge bank (persistent)
```sql
id, slug, title, description, language, difficulty, 
concept_tags (JSON), prompt, starter_code, hint_templates (JSON),
evaluation_rubric (JSON), created_at, updated_at
```

**challenge_assignment** - When challenge assigned to learner
```sql
id, learner_id, challenge_id, assigned_at, started_at, 
completed_at, status
```

**challenge_attempt** - Each submission
```sql
id, assignment_id, attempt_number, submitted_at, code, language,
feedback, passed, rubric_score
```

**mistake_observation** - Individual mistake detected
```sql
id, attempt_id, mistake_type, description, code_snippet,
suggestion, confidence, detected_at
```

**mistake_pattern** - Recurring mistakes
```sql
id, learner_id, language, mistake_type, tags (JSON), 
description, occurrence_count, last_observed, first_observed
```

**language_proficiency** - Per-language skill tracking
```sql
id, learner_id, language, level, score, attempts_count,
successful_attempts, updated_at
```

**learning_recommendation** - Personalized suggestions
```sql
id, learner_id, challenge_id, reason, priority, created_at, expires_at
```

## Setup & Running

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Validate System

```bash
python validate_system.py
```

This checks:
- All dependencies installed
- Database initializes and seeds challenges
- Mentor service instantiates
- Flask app imports correctly
- All routes are registered

### 3. Start the Backend (Flask)

```bash
python server.py
```

Server runs on `http://127.0.0.1:5000`

### 4. Start the Frontend (Next.js)

In the `UI/` directory:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### 5. Access the Mentor Dashboard

Navigate to: `http://localhost:3000/mentor`

## Usage Walkthrough

### First Time (Onboarding)
1. Set learning goals (e.g., "Master algorithms", "Build web projects")
2. Select preferred languages (Python, JavaScript, Java, C++, etc.)
3. System shows personalized welcome + recommended first challenge

### Mentor Chat
- Select mode: **explain**, **debug**, **generate**, **optimize**, **review**
- Type code or question
- Get streamed, personalized responses that reference your goals and past mistakes
- All interactions logged to database

### Working on Challenges
1. Challenge description shown with difficulty, concepts, and prompt
2. Write code in the editor (starter code provided)
3. Click **Get Hint** for personalized guidance based on your mistake history
4. Click **Submit Solution** for instant feedback:
   - Rubric score (0.0-1.0)
   - Passed/failed status
   - Identified mistakes with types and suggestions
   - Next steps

### Tracking Progress
- **Proficiency Dashboard**: See your score per language (beginner → expert)
- **Recurring Issues**: View patterns of mistakes you repeatedly make
- **Learning Path**: Recommended challenges sorted by concept and difficulty
- **Session History**: All your attempts, feedback, and interactions archived

## Personalization Features

### Learner Context Block
Every LLM prompt includes:
```
Goals: Your stated learning goals
Preferred Languages: Languages you practice
Recent Mistake Patterns: Your top 3 recurring issues
Language Proficiency: Your current level per language
```

### Mistake Classification
LLM analyzes mistakes into 5 categories:
1. **Syntax** - Incorrect code structure
2. **Logic** - Wrong algorithm or approach
3. **Runtime** - Code execution errors
4. **Conceptual** - Misunderstanding principles
5. **Debugging Strategy** - Poor problem-solving approach

### Proficiency Scoring
- Score per language ranges 0.0 (beginner) to 1.0 (expert)
- Updated after each challenge attempt
- Weighted: 70% previous + 30% current rubric score
- Level determined by score: beginner → intermediate → advanced → expert

### Challenge Recommendation
Prioritizes by:
1. **Concept Overlap**: Challenges addressing your weak concepts
2. **Proficiency Band**: Difficulty matching your skill level
3. **Preferred Language**: Matches your primary language
4. **Recency**: Recent mistakes boost priority

## Error Handling & Recovery

### Graceful Fallbacks
- **LLM Classification Fails**: Falls back to heuristic mistake tagging (lower confidence)
- **Backend Unavailable**: Frontend shows clear error + retry option
- **Invalid Payload**: Returns detailed validation errors
- **Unknown Challenge/Attempt**: Returns 404 with guidance

### Validation
- Required payload fields checked
- File paths checked for traversal attacks
- Challenge IDs/Assignment IDs verified exist
- Code length limits applied
- Language names validated

## Testing

### Quick Manual Test
```bash
# Terminal 1: Run validation
python validate_system.py

# Terminal 2: Start Flask
python server.py

# Terminal 3: Start Next.js (from UI/)
npm run dev

# Open http://localhost:3000/mentor in browser
```

### Test Scenarios
1. **Bootstrap**: Load /api/mentor/bootstrap → get dashboard + recommendation
2. **Onboarding**: Fill out goals/languages → saved to profile
3. **Chat**: Type Python code → get explain/debug/generate response
4. **Challenge**: Start challenge → submit code → get feedback + mistakes
5. **Hint**: Request hint → get personalized guidance
6. **Progress**: Check dashboard → see proficiency increase after passing challenge
7. **Persistence**: Restart server → all data preserved in SQLite

### Regression Coverage
- Long streaming responses don't cut off
- Empty history UX works (no crashes)
- Backend unavailable handled gracefully
- Multiple languages tracked independently
- Mistakes merge into patterns correctly
- Session/attempt ID mismatches return clear errors

## File Structure

```
.
├── mentor_db.py               # Database schema & queries
├── mentor_service.py          # LLM service & analysis
├── server.py                  # Flask app (refactored)
├── vector_streaming.py        # Legacy (unchanged for backward compat)
├── main.py                    # CLI entry (updated to use mentor_service)
├── validate_system.py         # Startup validation
├── mentor.db                  # SQLite database (auto-created)
│
└── UI/
    ├── src/
    │   ├── app/
    │   │   ├── mentor/page.tsx    # Main dashboard
    │   │   └── api/mentor/        # Mentor API routes
    │   └── components/mentor/     # Mentor UI components
    └── package.json
```

## Assumptions for v1

- **Single User**: One learner profile per deployment
- **Local First**: All data stored in local SQLite
- **Web First**: Full mentor UX in web app; CLI stays functional but without analytics parity
- **No Cloud/Auth**: No cloud sync, no authentication, no multi-user
- **Rubric-Based Assessment**: Challenge evaluation uses rubrics + heuristic/LLM analysis, not arbitrary code execution
- **LLM Fallback**: If LLM fails structured analysis, falls back to heuristic tagging with low-confidence flag

## Future Enhancements (Post-v1)

1. Multi-user support with authentication
2. Cloud sync (via libsql/turso)
3. Custom challenge creation
4. Collaborative code review
5. Gamification (badges, streaks, leaderboards)
6. Export/sharing learning reports
7. Integration with popular coding platforms (LeetCode, HackerRank)
8. Mobile companion app
9. Video explanations per concept
10. Real-time multiplayer challenges

## Troubleshooting

### Database locked error
- Close all other connections to `mentor.db`
- Delete `mentor.db` and restart (fresh seed)

### LLM not responding
- Verify Ollama is running: `ollama serve`
- Check model is installed: `ollama list`
- Try: `ollama pull llama2`

### Frontend shows blank dashboard
- Check browser console for API errors
- Verify Flask backend is running on port 5000
- Look at Flask logs for exceptions

### API routes not found
- Run `validate_system.py` to check all routes register
- Verify all mentor API handler files created in `UI/src/app/api/mentor/`

## Performance Notes

- First challenge seed takes ~1s (done once on startup)
- LLM responses stream in real-time (no wait)
- Database queries < 50ms for typical operations
- Mistake classification retries once if LLM fails, then uses heuristics
- SQLite easily handles 10K+ attempts before needing optimization

## License

Included with MANTRIQ 2.0 -see LICENSE file.

---

**Version**: 2.0 (Initial Release)  
**Last Updated**: March 2026  
For questions or issues, refer to the inline code documentation.
