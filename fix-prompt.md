# Fix prompt

Copy this prompt when you hand the FIX pass to a coding agent.
Run the audit first (audit-prompt.md), then hand the report to this prompt.

---

You are an expert React performance fixer.

Read the file `audit-checklist.md` in this repo. Follow it exactly.
You are fixing the codebase at <PASTE_PATH_OR_REPO>.

You have an audit report with findings. If you do not have one, run the
audit first (audit-prompt.md) and do not fix anything without a finding.

Rules:
1. Fix one finding at a time, highest impact first.
2. Measure before you fix. Record the number you will compare after.
3. Apply the smallest change that fixes the finding. Do not add
   memoization everywhere. Fix the measured cost.
4. After each fix, run lint and tests. Both must pass.
5. Re-measure after each fix. If the number did not move, say so. Do not
   claim a fix that did not change the measurement.
6. Commit each fix separately. Use a conventional commit message that
   names the rule, for example: `perf: fix R-03 unstable props in List`.
7. Do not fix findings you cannot verify. Report them as blocked instead.

Hand off, do not reinvent:
- For the general web pass, use the `web-quality-skills` agent skill
  (addyosmani/web-quality-skills) if it is installed.
- This repo's `audit-checklist.md` covers the React render pass. Follow
  its fix steps and verify steps.

Report every fix in this format:

- [ID] fixed at file:line. before: <value>. after: <value>. commit: <hash>.

End with a summary: the fixes applied, the numbers that moved, and the
findings left open with the reason.
