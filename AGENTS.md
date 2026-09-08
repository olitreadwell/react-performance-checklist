# AGENTS.md

Rules for agents that work in this repository.

## Content rules

- Plain language. Short sentences. One idea per sentence.
- Keep files under 200 lines.
- Put tool how-tos in `guides/`. Write them for new developers:
  numbered steps, exact clicks, a practice task, and a "done when" check.
- Glossary entries: a plain meaning, one example sentence, and a link to
  official docs when one exists. No em dashes.
- Show code in fenced blocks with a language tag. Do not use inline
  backticks for code examples.

## Rule corpus is the source of truth

- `rules/rules.json` holds every checklist item: summary, why, how,
  verify, links, smells, and code examples.
- The checklist and smells sections of `README.md` and
  `react-performance-checklist.md` are generated from it.
- After editing `rules/rules.json`, run `npm run generate` and commit the
  generated files too. Never hand-edit the generated sections.

## Naming

- Name test files after the pattern `<topic>.test.jsx`.
- Use 2-3 word domain-prefixed names for exports.

## How to audit a codebase

- `audit-checklist.md` is the source of truth. Read it fully.
- `audit-prompt.md` is the prompt to hand another agent.
- `fix-prompt.md` is the prompt for the fix pass. Audit first, then fix.
- `report-template.md` is the report format. Verdict first, one line per
  finding, no evidence no finding.
- Run `npx react-doctor@latest` and `npx react-scan@latest` for the scan.
  Do not write a new scanner.
- Report findings by checklist ID. Give evidence. No evidence, no finding.
- When fixing: one finding at a time, highest impact first. Measure
  before and after each fix. Run lint and tests after each fix. Commit
  each fix separately with a conventional commit message that names the
  rule, for example: `perf: fix R-03 unstable props in List`.

## Commands

- `npm run generate`: rebuild the checklist sections from `rules/rules.json`.
- `npm run audit -- <path-to-app>`: run the referenced scanners against an
  app and write `PERFORMANCE-REPORT.md`.
- `npm run lint`: run ESLint.
- `npm run test`: run tests.
- `npm run check`: run both.

## Do not

- Do not claim a performance problem without evidence.
- Do not add memoization everywhere. Fix the measured cost.
