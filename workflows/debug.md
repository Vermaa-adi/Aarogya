---
description: Systematic debugging - find root cause before attempting fixes, never guess-and-check
---

# Systematic Debugging

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

## The Iron Law
```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use
Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

## Phase 1: Root Cause Investigation
**BEFORE attempting ANY fix:**

### 1. Read Error Messages Carefully
- Don't skip past errors or warnings
- They often contain the exact solution
- Read stack traces completely
- Note line numbers, file paths, error codes

### 2. Reproduce Consistently
- Can you trigger it reliably?
- What are the exact steps?
- Does it happen every time?
- If not reproducible → gather more data, don't guess

### 3. Check Recent Changes
- What changed that could cause this?
- `git diff`, recent commits
- New dependencies, config changes
- Environmental differences

### 4. Gather Evidence in Multi-Component Systems
When the system has multiple components (API → service → database, CI → build → deploy):

**BEFORE proposing fixes, add diagnostic instrumentation:**
```
For EACH component boundary:
  - Log what data enters component
  - Log what data exits component
  - Verify environment/config propagation
  - Check state at each layer

Run once to gather evidence showing WHERE it breaks
THEN analyze evidence to identify failing component
THEN investigate that specific component
```

### 5. Trace Data Flow
- Where does the bad value originate?
- What called this with the bad value?
- Keep tracing up the call stack until you find the source
- Fix at source, not at symptom

## Phase 2: Pattern Analysis
**Find the pattern before fixing:**

1. **Find Working Examples** — Locate similar working code in same codebase
2. **Compare Against References** — If implementing a pattern, read the reference implementation COMPLETELY (don't skim)
3. **Identify Differences** — List every difference between working and broken, however small. Don't assume "that can't matter"
4. **Understand Dependencies** — What other components, settings, config, environment does this need?

## Phase 3: Hypothesis and Testing
**Scientific method:**

1. **Form Single Hypothesis** — State clearly: "I think X is the root cause because Y." Be specific.
2. **Test Minimally** — Make the SMALLEST possible change to test the hypothesis. One variable at a time. Don't fix multiple things at once.
3. **Verify Before Continuing** — Did it work? → Phase 4. Didn't work? → Form NEW hypothesis. DON'T add more fixes on top.

**If you don't know:** Say "I don't understand X." Don't pretend.

## Phase 4: Fix and Verify

1. **Create Failing Test Case** — Use the `/tdd` workflow. Simplest possible reproduction. MUST have before fixing.
2. **Implement Single Fix** — Address the root cause. ONE change at a time. No "while I'm here" improvements. No bundled refactoring.
3. **Verify Fix** — Test passes? No other tests broken? Issue actually resolved?

### If Fix Doesn't Work
- **Count:** How many fixes have you tried?
- **If < 3:** Return to Phase 1, re-analyze with new information
- **If ≥ 3:** STOP. Question the architecture:
  - Is this pattern fundamentally sound?
  - Are we sticking with it through inertia?
  - Should we refactor architecture vs. continue fixing symptoms?
  - **Discuss with user before attempting more fixes**

## Red Flags — STOP and Follow Process
If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "One more fix attempt" (when already tried 2+)
- Each fix reveals new problem in different place

**ALL of these mean: STOP. Return to Phase 1.**

## Common Rationalizations
| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = likely architectural problem. |

## Quick Reference
| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Fix & Verify** | Create test, fix, verify | Bug resolved, tests pass |
