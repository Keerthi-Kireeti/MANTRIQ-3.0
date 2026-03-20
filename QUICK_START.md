# MANTRIQ Mentor System - Quick Start Guide

## What's New

MANTRIQ 2.0 now includes a complete AI-powered learning mentor system with:

✅ Personalized learner profiles (goals, language preferences)  
✅ Challenge bank (seeded with 5 initial challenges)  
✅ Challenge assignments, attempts, and evaluations  
✅ Mistake tracking and pattern analysis  
✅ Language proficiency scoring (per language)  
✅ Personalized recommendations  
✅ Mentor chat with 5 modes  
✅ Interactive challenge workspace  
✅ Progress dashboard with analytics  
✅ Learning path recommendations  

## 30-Second Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Verify everything works
python validate_system.py

# 3. Start Flask (Terminal 1)
python server.py

# 4. Start Next.js (Terminal 2, in UI/ directory)
cd UI
npm run dev

# 5. Open browser
http://localhost:3000/mentor
```

## What You'll See

### First Time
- Onboarding screen asking for your goals and preferred languages
- Recommended challenge based on your choices
- Welcome message with your personalized learning path

### Dashboard (4 Tabs)

**💬 Mentor Chat**
- Ask questions about code
- 5 modes: explain, debug, generate, optimize, review
- Responses include your learning context
- All interactions saved

**🎯 Challenge**
- Solve coding problems
- Get hints personalized to your mistakes
- Submit and get instant rubric-based feedback
- See identified mistakes and suggestions

**📊 Progress**
- Your proficiency in each language
- Recurring issues you encounter
- Attempt statistics
- Improvement tracking

**🗺️ Learning Path**
- Core concepts to master
- Recommended challenges sorted by difficulty
- Topic tags for each challenge
- Quick tips for studying

## New API Endpoints

All endpoints are proxied through Next.js (so you use `/api/mentor/*`):

```
GET  /api/mentor/bootstrap              - Get full dashboard data
GET  /api/mentor/profile                - Get learner profile
PUT  /api/mentor/profile                - Update profile (goals, languages)

POST /api/mentor/sessions               - Start session
POST /api/mentor/sessions/:id           - End session
POST /api/mentor/events                 - Log event (internal)

GET  /api/mentor/challenges/next        - Get recommended challenge
POST /api/mentor/challenges/:id/start   - Start working on challenge
POST /api/mentor/attempts/:id/hint      - Get hint for current attempt
POST /api/mentor/attempts/:id/submit    - Submit code + get evaluation

POST /api/chat (enhanced)               - Mentor-aware chat
```

## Database

One SQLite file stores everything:
- `mentor.db` - Auto-created in project root

Contains:
- Your profile and goals
- All your challenges and attempts
- Feedback and evaluations
- Mistake patterns
- Proficiency tracking

## Files Added/Modified

### New Files
```
mentor_db.py                    - Database layer (620 lines)
mentor_service.py               - LLM service layer (430 lines)
validate_system.py              - System checker
MENTOR_IMPLEMENTATION.md        - Full documentation
QUICK_START.md                  - This file

UI/src/app/mentor/page.tsx      - Main dashboard component
UI/src/components/mentor/
  ├── MentorChatArea.tsx        - Chat interface
  ├── ChallengeWorkspace.tsx    - Challenge editor + eval
  ├── ProgressSnapshot.tsx      - Analytics
  └── LearningPathRecommendations.tsx - Recommendations

UI/src/app/api/mentor/          - All new API route handlers (10 files)
```

### Modified Files
```
server.py                       - Added mentor endpoints + service integration
UI/src/app/api/chat/route.ts   - Extended to support mentor payload format
requirements.txt                - Minor updates
```

## Key Features Explained

### Personalization
Every time you chat with the mentor, it includes:
- Your stated goals
- Languages you practice
- Your top recurring mistakes
- Your current proficiency level

So the mentor remembers context and gives relevant advice.

### Mistake Analysis
After each challenge submission, the system:
1. Analyzes your code using the LLM
2. Identifies mistakes (syntax, logic, runtime, conceptual, debugging strategy)
3. Tracks recurring patterns across all your attempts
4. Uses patterns to personalize future hints and recommendations

### Challenge Recommendations
Smart selection based on:
- Concepts where you make mistakes
- Your current proficiency level
- Your preferred languages
- Difficulty progression

### Scoring
- Each challenge attempt gets a rubric score (0.0-1.0)
- Your per-language proficiency is: 70% previous + 30% new attempt
- Level automatically updates: beginner → intermediate → advanced → expert

## Example Workflow

```
1. Open mentor dashboard
   → Onboarding: "I want to master Python" + "Learn algorithms"
   
2. Get recommended challenge
   → "Print All Odd Numbers" (easy, Python, loops concept)
   
3. Click "Start Challenge"
   → Starter code and prompt shown
   
4. Click "Get Hint"
   → "Try iterating 1-10 and checking if number % 2 != 0"
   
5. Write solution:
   ```python
   for i in range(1, 11):
       if i % 2 != 0:
           print(i)
   ```
   
6. Click "Submit Solution"
   → Feedback: "Passed! 95% score"
   → Proficiency increases in Python
   → Next recommendation auto-updates
   
7. Go to Progress tab
   → See Python proficiency: ~0.45 (intermediate)
   → See challenges completed: 1
   → See next recommended challenge
```

## Under the Hood

### Why This Architecture?

- **Shared Service Layer**: Same LLM logic used for chat, evaluation, and analysis
- **SQLite Backend**: Fast, persistent, no external dependencies
- **Streaming Chat**: Real-time feedback while waiting for LLM
- **Context Injection**: Learner history automatically included in prompts
- **Graceful Fallbacks**: If LLMfails structured analysis, use heuristics with low confidence

### Performance
- Database: < 50ms per query
- LLM Chat: Streams in real-time (typically 1-5 seconds)
- Mistake Classification: ~1-2 seconds (with fallback)
- Challenge Evaluation: ~2-3 seconds

## Troubleshooting

### "Failed to load mentor data"
- Check Flask is running on http://127.0.0.1:5000
- Check browser Network tab for failed requests
- Look at Flask terminal for error messages

### "Database is locked"
- Close any other connections to `mentor.db`
- Delete it and restart (will reseed fresh)

### "Ollama error"
- Make sure `ollama serve` is running separately
- Verify model: `ollama list` (should show llama2 or your model)
- Try: `ollama pull llama2`

### "Blank page on mentor dashboard"
- Check browser console (F12) for errors
- Validate system: `python validate_system.py`
- Clear browser cache and reload

## What's Still the Same

The old chat system still works at `/api/chat` (backward compatible).
The old file generation, saving, and download features still work.
The CLI still works with the new mentor service layer.

## What's Not Included Yet (Post-v1)

- Multi-user support
- Cloud synchronization  
- Custom challenge creation UI
- Collaborative features
- Authentication/accounts
- Mobile app
- Arbitrary code execution/sandboxing

## Where to Go from Here

1. **Customize Challenges**: Edit the seed data in `mentor_db.py` to add more challenges
2. **Tune Proficiency**: Adjust the scoring formula in `mentor_service.py`
3. **Add More Languages**: Update language tags in challenges
4. **Extend Analytics**: Add new fields to mistake patterns
5. **Deploy**: Set up on a server for shared access

## Questions?

Refer to:
- `MENTOR_IMPLEMENTATION.md` - Full technical docs
- `mentor_db.py` - Database documentation in code
- `mentor_service.py` - Service layer documentation
- `server.py` - API endpoint documentation

---

**Version**: 2.0  
**Release Date**: March 2026  
Ready to start learning! 🚀
