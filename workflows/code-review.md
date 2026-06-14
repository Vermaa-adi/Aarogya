---
description: Perform a structured code review of recent changes before merging or claiming completion
---

# Code Review Workflow

Catch issues before they cascade. Review early, review often.

## When to Request Review
**Mandatory:**
- After completing a major feature or task batch
- Before merging to main branch
- Before claiming work is "done"

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing a complex bug

## Self-Review Checklist

### 1. Spec Compliance Review
Compare the implementation against the original plan/spec:

- [ ] **Coverage:** Does the code implement ALL requirements from the spec?
- [ ] **Nothing extra:** Does the code add things NOT in the spec? (Remove them — YAGNI)
- [ ] **Behavior match:** Does the code behave as the spec describes, not just structurally resemble it?
- [ ] **Edge cases:** Are the edge cases from the spec handled?

**If issues found:** Fix them before moving to quality review. Spec compliance comes first.

### 2. Code Quality Review
After spec compliance passes:

- [ ] **Tests exist and pass** — Every new function/method has a test
- [ ] **Tests are meaningful** — Tests verify behavior, not just that code runs
- [ ] **No dead code** — Remove commented-out code, unused imports, unreachable branches
- [ ] **Clear naming** — Variables, functions, and files have descriptive names
- [ ] **No magic numbers** — Extract constants with descriptive names
- [ ] **Error handling** — Errors are handled gracefully, not swallowed silently
- [ ] **Single responsibility** — Each function/class/file does one thing well
- [ ] **DRY** — No copy-pasted logic that should be extracted
- [ ] **No TODOs left behind** — If a TODO was in the plan, it should be done
- [ ] **Consistent style** — Follows existing codebase conventions

### 3. Issue Severity Classification
Classify any issues found:

| Severity | Meaning | Action |
|----------|---------|--------|
| **Critical** | Breaks functionality, security issue, data loss | Fix immediately, blocks everything |
| **Important** | Missing requirements, poor error handling | Fix before proceeding |
| **Minor** | Style issues, naming, small improvements | Note for later |

## Acting on Review Findings

### Handling Feedback from Others
When receiving code review feedback:
1. **READ** complete feedback without reacting
2. **UNDERSTAND** — restate the requirement in your own words (or ask for clarification)
3. **VERIFY** — check against the actual codebase
4. **EVALUATE** — is this technically sound for THIS codebase?
5. **RESPOND** — technical acknowledgment or reasoned pushback
6. **IMPLEMENT** — one item at a time, test each

### When to Push Back
Push back when:
- Suggestion breaks existing functionality
- Reviewer lacks full context
- Violates YAGNI (adds unused feature)
- Technically incorrect for this stack
- Conflicts with established architectural decisions

**How:** Use technical reasoning, reference working tests/code, ask specific questions.

### Implementation Order for Multi-Item Feedback
1. Clarify anything unclear FIRST
2. Then implement in this order:
   - Blocking issues (breaks, security)
   - Simple fixes (typos, imports)
   - Complex fixes (refactoring, logic)
3. Test each fix individually
4. Verify no regressions

## Red Flags
**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Implement feedback without verifying it's correct first

## Integration
- Use after `/tdd` cycle completes
- Use before `/verify` workflow
- Pairs with `/write-plan` for checking plan compliance
