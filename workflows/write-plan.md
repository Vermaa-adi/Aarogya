---
description: Write a detailed implementation plan from an approved spec or requirements, before writing any code
---

# Writing Implementation Plans

Use when you have a spec or requirements for a multi-step task, BEFORE touching code. Write comprehensive plans assuming the implementer has zero codebase context and questionable taste. Document everything: which files to touch, exact code, testing strategy, how to verify. Bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

## Announce
Say: "I'm using the write-plan workflow to create the implementation plan."

## Scope Check
If the spec covers multiple independent subsystems, suggest breaking into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## Step 1: Map File Structure
Before defining tasks, map out which files will be created or modified and what each is responsible for.

- Design units with clear boundaries and well-defined interfaces
- Each file should have one clear responsibility
- Prefer smaller, focused files over large ones doing too much
- Files that change together should live together — split by responsibility, not by technical layer
- In existing codebases, follow established patterns

This structure informs task decomposition. Each task should produce self-contained changes that make sense independently.

## Step 2: Define Bite-Sized Tasks
**Each step is ONE action (2-5 minutes):**
- "Write the failing test" — one step
- "Run it to make sure it fails" — one step
- "Implement the minimal code to make the test pass" — one step
- "Run the tests and make sure they pass" — one step
- "Commit" — one step

### Task Structure Template
```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.ext`
- Modify: `exact/path/to/existing.ext:123-145`
- Test: `tests/exact/path/to/test.ext`

- [ ] **Step 1: Write the failing test**
  ```language
  // exact test code here
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `test-command path/to/test`
  Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**
  ```language
  // exact implementation code here
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `test-command path/to/test`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add <files>
  git commit -m "feat: add specific feature"
  ```
```

## Step 3: No Placeholders — EVER
Every step must contain the actual content needed. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — the reader may be reading tasks out of order)
- Steps that describe what to do without showing how (code blocks required for code steps)
- References to types, functions, or methods not defined in any task

## Step 4: Self-Review
After writing the complete plan, review it against the spec:

1. **Spec coverage:** Skim each requirement in the spec. Can you point to a task that implements it? List any gaps.
2. **Placeholder scan:** Search for red flags — any patterns from the "No Placeholders" section. Fix them.
3. **Type consistency:** Do types, method signatures, and property names in later tasks match what was defined in earlier tasks? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug.

If you find issues, fix them inline. If you find a spec requirement with no task, add the task.

## Step 5: Save and Present
- Save to `docs/plans/YYYY-MM-DD-<feature-name>.md` (or project-preferred location)
- Present the plan to the user for approval before execution

## Remember
- Exact file paths always
- Complete code in every step — if a step changes code, show the code
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits
