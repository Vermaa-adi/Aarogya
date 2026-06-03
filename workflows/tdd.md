---
description: Strict Test-Driven Development - write test first, watch it fail, write minimal code to pass, refactor
---

# Test-Driven Development (TDD)

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

## The Iron Law
```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

**No exceptions:**
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- Delete means delete

## When to Use
**Always:**
- New features
- Bug fixes
- Refactoring
- Behavior changes

**Exceptions (ask your user):**
- Throwaway prototypes
- Generated code
- Configuration files

## Red-Green-Refactor Cycle

### RED — Write Failing Test
Write one minimal test showing what should happen.

**Requirements:**
- One behavior per test
- Clear, descriptive name (if "and" is in the name, split it)
- Real code (no mocks unless unavoidable)
- Shows intent — demonstrates the desired API

### Verify RED — Watch It Fail (MANDATORY)
Run the test. Confirm:
- Test **fails** (not errors — compilation errors are not failures)
- Failure message is what you expected
- Fails because the feature is missing (not because of typos/setup bugs)

**Test passes?** You're testing existing behavior. Fix the test.
**Test errors?** Fix the error, re-run until it fails correctly.

### GREEN — Minimal Code
Write the **simplest** code to pass the test.

- Don't add features beyond what the test requires
- Don't refactor other code
- Don't "improve" beyond the test
- YAGNI — You Aren't Gonna Need It

### Verify GREEN — Watch It Pass (MANDATORY)
Run the test. Confirm:
- The new test passes
- All other tests still pass
- Output is pristine (no errors, warnings)

**Test fails?** Fix the code, not the test.
**Other tests fail?** Fix now.

### REFACTOR — Clean Up
After green ONLY:
- Remove duplication
- Improve names
- Extract helpers

Keep tests green. Don't add behavior during refactor.

### Repeat
Next failing test for next behavior.

## Common Rationalizations — Don't Fall For These
| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt. |
| "Need to explore first" | Fine. Throw away exploration, THEN start with TDD. |
| "Test hard = design unclear" | Listen to the test. Hard to test = hard to use. |
| "TDD will slow me down" | TDD is faster than debugging. |
| "Existing code has no tests" | You're improving it. Add tests for code you touch. |

## Red Flags — STOP and Start Over
If any of these happen, delete the code and restart with TDD:
- Code written before test
- Test written after implementation
- Test passes immediately on first run
- Can't explain why the test failed
- Tests added "later"
- Rationalizing "just this once"

## Debugging Integration
Bug found? Write a failing test that reproduces it. Follow the TDD cycle. The test proves the fix and prevents regression.

**Never fix bugs without a test.**

## Verification Checklist
Before marking work complete:
- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered

Can't check all boxes? You skipped TDD. Start over.

## When Stuck
| Problem | Solution |
|---------|----------|
| Don't know how to test | Write the wished-for API. Write the assertion first. Ask the user. |
| Test too complicated | Design too complicated. Simplify the interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup is huge | Extract helpers. Still complex? Simplify the design. |
