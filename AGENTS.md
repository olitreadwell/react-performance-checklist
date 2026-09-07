# AGENTS.md

Rules for agents that work in this repository.

## Content rules

- Plain language. Short sentences. One idea per sentence.
- Keep files under 200 lines.
- Put tool how-tos in `guides/`. Write them for a very junior developer:
  numbered steps, exact clicks, a practice task, and a "done when" check.

## Naming

- Name test files after the pattern `<topic>.test.jsx`.
- Use 2-3 word domain-prefixed names for exports.

## How to audit a codebase

- `audit-checklist.md` is the source of truth. Read it fully.
- `audit-prompt.md` is the prompt to hand another agent.
- `src/audit-core.js` is the automated audit engine. Run it with `npm run audit -- <path>`.
- Report findings by checklist ID. Give evidence. No evidence, no finding.

## Commands

- `npm run lint`: run ESLint.
- `npm run test`: run tests.
- `npm run check`: run both.

## Do not

- Do not claim a performance problem without evidence.
- Do not add memoization everywhere. Fix the measured cost.
