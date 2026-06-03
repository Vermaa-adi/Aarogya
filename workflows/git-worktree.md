---
description: Set up an isolated git worktree for feature development, with safety verification and clean baseline
---

# Git Worktree Setup

Git worktrees create isolated workspaces sharing the same repository — work on multiple branches simultaneously without switching.

**Core principle:** Systematic directory selection + safety verification = reliable isolation.

## When to Use
- Starting feature work that needs isolation from current workspace
- Before executing implementation plans
- When you need to work on a branch while keeping current work intact

## Step 1: Directory Selection (priority order)

### Check Existing Directories
```bash
# Check in priority order
ls -d .worktrees 2>$null     # Preferred (hidden)
ls -d worktrees 2>$null       # Alternative
```
- If both exist, `.worktrees` wins
- If found, use that directory

### If No Directory Found
Ask the user:
```
No worktree directory found. Where should I create worktrees?

1. .worktrees/ (project-local, hidden)
2. A custom location of your choice

Which would you prefer?
```

## Step 2: Verify Directory is Git-Ignored
**MUST verify before creating worktree:**
```bash
git check-ignore -q .worktrees
```

**If NOT ignored:**
1. Add to `.gitignore`
2. Commit the change
3. Proceed

**Why critical:** Prevents accidentally committing worktree contents to repository.

## Step 3: Detect Project
```bash
$project = Split-Path -Leaf (git rev-parse --show-toplevel)
```

## Step 4: Create Worktree
```bash
git worktree add ".worktrees/$BRANCH_NAME" -b "$BRANCH_NAME"
cd ".worktrees/$BRANCH_NAME"
```

## Step 5: Run Project Setup
Auto-detect and run appropriate setup:
```
- package.json → npm install
- Cargo.toml → cargo build
- requirements.txt → pip install -r requirements.txt
- pyproject.toml → poetry install / pip install -e .
- go.mod → go mod download
- CMakeLists.txt → cmake -B build && cmake --build build
```

## Step 6: Verify Clean Baseline
Run tests to ensure worktree starts clean:
```bash
# Use project-appropriate command
npm test / cargo test / pytest / go test ./... / ctest --test-dir build
```

- **Tests pass:** Report ready
- **Tests fail:** Report failures, ask whether to proceed or investigate

## Step 7: Report
```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference
| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Ask user |
| Directory not ignored | Add to .gitignore + commit |
| Tests fail during baseline | Report failures + ask |
| No project file found | Skip dependency install |

## Red Flags
**Never:**
- Create worktree without verifying it's git-ignored (project-local)
- Skip baseline test verification
- Proceed with failing tests without asking
- Assume directory location when ambiguous
