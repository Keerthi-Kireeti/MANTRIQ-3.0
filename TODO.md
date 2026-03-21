# TODO: Fix Pylance Type Errors in mentor_db.py

## Steps to Complete:

- [x] **Step 1**: Fix return type mismatches in functions returning None-unwrapping values
  - get_learner_profile(): return {} instead of None
  - update_learner_profile(): handle updated=None  
  - get_next_attempt_number(): handle row=None → return 1
  - Other cursor.lastrowid returns: safe as-is

- [x] **Step 2**: Fix list.append() type mismatches
  - parse_text_list(): filter None before str(item)
  - Ensure int→str conversions where needed

- [ ] **Step 3**: Apply all edits to mentor_db.py using edit_file

- [ ] **Step 4**: Verify fixes
  - Run pyright/mypy linting
  - Test database operations

- [ ] **Step 5**: Test runtime
  - init_db(), bootstrap_learner(), basic CRUD

- [ ] **Step 6**: Mark complete ✅

**Progress**: Steps 1-2 complete, addressing remaining lastrowid type annotations and seed_challenges count access. Step 3 edits applied.


