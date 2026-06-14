---
description: Execute an implementation plan task-by-task with review checkpoints and verification gates
---

# Executing Implementation Plans

Load plan, review critically, execute all tasks systematically, report when complete.

## Announce
Say: "I'm using the execute-plan workflow to implement this plan."

## Step 1: Load and Review Plan
1. Read the plan file
2. Review critically — identify any questions or concerns
3. If concerns: Raise them with the user before starting
4. If no concerns: Create a task tracking list and proceed

## Step 2: Set Up Workspace (if using git)
1. Create a feature branch: `git checkout -b feature/<name>`
2. Run project setup (install dependencies)
3. Run existing tests to verify clean baseline
4. **If tests fail:** Report failures, ask whether to proceed or investigate
5. **If tests pass:** Report ready and proceed

## Step 3: Execute Tasks
For each task in the plan:

### 3a. Mark as In-Progress
Update your task tracking to show current task.

### 3b. Follow Each Step Exactly
The plan has bite-sized steps — follow each one precisely:
1. Write the failing test (use `/tdd` workflow)
2. Run it, confirm it fails for the right reason
3. Write minimal implementation
4. Run it, confirm it passes
5. Verify all other tests still pass
6. Commit

### 3c. Self-Review After Each Task
After completing a task, run a quick review (simplified `/code-review`):
- Does the code match the spec/plan for this task?
- Did anything extra sneak in? (Remove it — YAGNI)
- Are all tests passing?

### 3d. Mark as Complete
Update task tracking.

### 3e. Checkpoint Every 3 Tasks
After every 3 tasks, pause and report to the user:
- What's been completed
- Current status (tests passing, any concerns)
- Whether to continue or review

## Step 4: Verify Completion
After all tasks are done, use the `/verify` workflow:
1. Run full test suite — confirm all pass
2. Check spec coverage — every requirement implemented?
3. Run build/lint if applicable
4. Report results with evidence

## Step 5: Finish Up
- Run `/code-review` on the full implementation
- Present options to user:
  - **Merge** to main
  - **Create PR** for external review
  - **Keep branch** for more work
  - **Discard** if not needed

## When to Stop and Ask
**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails unexpectedly, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly (3+ attempts — see `/debug` workflow)

**Ask for clarification rather than guessing.**

## Red Flags
**Never:**
- Start implementation on main/master branch without explicit user consent
- Skip verification steps
- Proceed with failing tests
- Guess when blocked — ask
- Skip checkpoints (every 3 tasks)
- Bundle multiple tasks into one commit
