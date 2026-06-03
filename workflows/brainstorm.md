---
description: Collaborative design brainstorming - refine ideas into fully formed specs before writing any code
---

# Brainstorming Workflow

Use this BEFORE any creative work — creating features, building components, adding functionality, or modifying behavior. Turn rough ideas into validated designs through structured dialogue.

## HARD GATE
Do NOT write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.

**Anti-Pattern: "This Is Too Simple To Need A Design"**
Every project goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple tasks), but you MUST present it and get approval.

## Checklist (complete in order)

### 1. Explore Project Context
- Check files, docs, recent git commits
- Understand the current state of the codebase
- Identify existing patterns and conventions

### 2. Ask Clarifying Questions
- Ask ONE question at a time — do not overwhelm with multiple questions
- Prefer multiple choice questions when possible
- Focus on understanding: purpose, constraints, success criteria
- If the request describes multiple independent subsystems, flag this immediately and suggest decomposition before refining details

### 3. Propose 2-3 Approaches
- Present different approaches with trade-offs
- Lead with your recommended option and explain why
- Be conversational, not exhaustive

### 4. Present Design in Sections
- Scale each section to its complexity: a few sentences if straightforward, more detail if nuanced
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing strategy
- Be ready to go back and clarify if something doesn't make sense

### 5. Design for Isolation and Clarity
- Break the system into units that each have one clear purpose
- Units should communicate through well-defined interfaces and be testable independently
- Ask: Can someone understand what a unit does without reading its internals? Can you change the internals without breaking consumers?

### 6. Working in Existing Codebases
- Explore the current structure BEFORE proposing changes
- Follow existing patterns
- Where existing code has problems affecting the work (overgrown files, unclear boundaries), include targeted improvements — don't propose unrelated refactoring

### 7. Write Design Document
- Save to a spec file (e.g., `docs/specs/YYYY-MM-DD-<topic>-design.md`)
- Commit the design document to git

### 8. Spec Self-Review
After writing the spec, review with fresh eyes:
1. **Placeholder scan:** Any "TBD", "TODO", incomplete sections? Fix them.
2. **Internal consistency:** Do sections contradict each other? Does architecture match feature descriptions?
3. **Scope check:** Is this focused enough for a single implementation plan, or does it need decomposition?
4. **Ambiguity check:** Could any requirement be interpreted two ways? Pick one and make it explicit.

Fix issues inline — no need to re-review, just fix and move on.

### 9. User Reviews Written Spec
Ask user to review the spec before proceeding:
> "Spec written and committed to `<path>`. Please review it and let me know if you want to make any changes before we start writing the implementation plan."

Wait for user response. If changes requested, make them and re-run spec review. Only proceed once user approves.

### 10. Transition to Implementation
- Use the `/write-plan` workflow to create a detailed implementation plan
- Do NOT jump to code. Planning is the next step.

## Key Principles
- **One question at a time** — Don't overwhelm with multiple questions
- **Multiple choice preferred** — Easier to answer than open-ended
- **YAGNI ruthlessly** — Remove unnecessary features from all designs
- **Explore alternatives** — Always propose 2-3 approaches before settling
- **Incremental validation** — Present design, get approval before moving on
- **Be flexible** — Go back and clarify when something doesn't make sense
