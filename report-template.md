# Performance report

Fill this in after an audit. The verdict goes first, so a reader knows in
ten seconds what to do. One line per finding. No evidence, no finding.

## Verdict

- The three fixes with the largest measured impact, in order:
  1. <ID> <one line>
  2. <ID> <one line>
  3. <ID> <one line>
- The one fix to do first: <ID> <one line>

## Findings

| ID | Severity | Location | Evidence | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| R-03 | High | src/List.jsx:42 | render count 12 -> 1 | hoist the callback | open |

Status is `open`, `fixed`, or `blocked` (with the reason in Evidence).

## How to read this in 30 seconds

1. Read the Verdict. Do the first fix.
2. Scan the Findings table for High rows with Status `open`.
3. Hand the report to fix-prompt.md and let the agent fix them.
