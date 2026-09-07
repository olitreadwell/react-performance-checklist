# How to use React Doctor

For a very junior developer. Follow the steps in order.

## What this tool does

React Doctor scans a React codebase for common problems: correctness,
performance, security, accessibility, and maintainability.
It gives a score from 0 to 100. One terminal command.
It can also run in CI and block a pull request when the code gets worse.

Its page: https://react.doctor
It comes from the same team as React Scan (million.co).
License: MIT. Open source on GitHub.

## The analogy

Think of a doctor's check-up. The doctor looks for known problems,
not surprises. Every finding comes with a suggested fix.

## Step 1: Run it

1. Open your project folder in a terminal.
2. Run `npx react-doctor@latest`
3. Wait. It scans your files.

## Step 2: Read the score

1. Look at the score. 0 to 100.
2. Your codebase is not graded. The score is a measure over time.
3. Re-run it after fixes. The score is the proof.

## Step 3: Read the warnings

1. Each warning names a file and a line.
2. Each warning ends with a fix.
   Example: "duplicate-jsx-subtree: extract a shared component when the copies share one UI concept."
3. Fix one warning. Re-run. The warning disappears.

## Step 4: Record a runtime trace

1. Run your app. Example: `npm run dev`
2. Run `npx react-doctor@latest scan http://localhost:3000`
3. Use the app. Do the slow action.
4. Press Enter when done. Recording stops.
5. React Doctor flashes purple outlines with component names as React renders.
6. It returns a summary and the path to a DevTools trace.
   Use `--format json` when a coding agent reads the output.

## Step 5: Block bad PRs in CI

1. Run `npx react-doctor@latest ci install`
2. It adds a GitHub Actions workflow.
3. It posts a comment on every pull request.
4. It reports only the issues your change introduced. Your existing backlog stays quiet.
5. Change the gate with `npx react-doctor@latest ci config`

## Step 6: Teach your coding agent (optional)

1. Run `npx react-doctor@latest install`
2. It installs a skill for Claude Code, Cursor, Codex, OpenCode, and more.
3. The agent learns the issues and fixes them in later work.

## What to look for

- Duplicate JSX subtrees. Extract a shared component.
- Overly complex components. Split them.
- Repeated JSX. Reuse one component.
- Rule names look like this: react-doctor/no-array-index-as-key.
  They overlap with the ESLint checks in this repo.

## Done when

- You ran React Doctor once.
- You read the score.
- You fixed one warning.
- The warning is gone after re-run.

## Practice task (10 minutes)

1. Run `npx react-doctor@latest` on any React project you have.
2. Name the three most common warning types.
3. Fix the easiest one. Re-run. Write the new score.

## Do not panic

- A low score is a list, not a judgment.
- Fix warnings one at a time.
- Use it with the other tools in this repo, not instead of them.
