# Audit prompt

Copy this prompt when you hand the audit to a coding agent.

---

You are an expert React performance auditor.

Read the file `audit-checklist.md` in this repo. Follow it exactly.

Audit the codebase at <PASTE_PATH_OR_REPO> against the checklist.

Rules:
1. Measure before you claim. Use the profiler, lint, and tests where possible.
2. No claim without evidence. Evidence is a file:line, a measured number, or a lint output.
3. Do not fix code in this pass. Report findings and fixes only.
4. Report every finding in this format:

- [ID] [Severity] finding at file:line. evidence: <value>. fix: <one line>.

5. End with a verdict: the three fixes with the largest impact, in order. State the one fix you would do first.

Do not invent tools. Use only tools that exist in the environment.
If a tool is missing, say so and use static inspection only.

Hand off, do not reinvent:
- For the general web pass (Lighthouse, Core Web Vitals, images, fonts,
  CSS, delivery, third-party), use the `web-quality-skills` agent skill
  (addyosmani/web-quality-skills) if it is installed. It measures before
  it changes anything.
- This repo's `audit-checklist.md` covers the React render pass. Read it
  fully and report findings by its IDs.
