# React Performance Checklist

A one-page checklist for fixing slow React apps.
Use it at work when you need to find a performance problem and choose a fix.
A coding agent can also use this repo to audit a codebase.
It also helps with interview prep, because it teaches the same workflow.

Plain language. Short sentences.
Low pressure. Small steps. Done beats perfect.

## Who is this for

- Developers who need to fix a slow React app.
- Very junior developers who want to know where to start.
- Developers who want an agent to audit their codebase.

## The main idea

Measure first. Fix what costs the most.
Tools show you where the problem is. You choose the fix.

## Why this repo exists

React Scan and React Doctor do the scanning. Use them first.
The scans tell you what is wrong. This repo tells you what to fix,
in what order, and how to prove the fix worked.

It adds:

- The checklist. The order of work, the classes of fixes, and the concept
  behind each tool. A scanner gives findings. This gives the next step.
- The agent audit flow. `audit-checklist.md` and `audit-prompt.md` turn
  a codebase scan into a structured verdict with evidence rules.
- Perf test patterns. Call-count tests and `React.Profiler` assertions
  stop regressions before they ship.
- Beginner guides. Each tool explained with steps, an analogy, and a
  practice task.

## How to use this repo

At work (human):

1. Run the scanners: `npx react-doctor@latest`, then `npx react-scan@latest <url>`.
2. Open `react-performance-checklist.md`.
3. Fix the items marked High, in order.
4. Measure again after each fix. The scanners prove the change.

For the audit (agent):

1. Hand the agent `audit-prompt.md`.
2. The agent reads `audit-checklist.md`.
3. The agent reports findings in the format from the checklist.

For the tools:

```bash
npm install
npm run check
```

`npm run check` runs lint and tests. Both must pass.

For interview prep (optional):

1. Read the guide list below. One guide per day.
2. The checklist is the same workflow you use at work.

## Run the scanners

Use existing tools. Do not re-implement them.

```bash
npx react-doctor@latest
npx react-doctor@latest scan http://localhost:3000
```

For re-render hotspots:

```bash
npx react-scan@latest http://localhost:3000
```

Guides: `guides/react-doctor.md`, `guides/react-scan.md`.

These tools do not measure everything. Bundle bytes, INP, and real-user
metrics need a build or a browser. `audit-checklist.md` lists the manual
step for each. `audit-prompt.md` turns the scan into an agent verdict.

## Files in this repo

| File | Purpose |
| --- | --- |
| `react-performance-checklist.md` | One page. Use it at work. |
| `audit-checklist.md` | Full checklist with detection and fix steps. An agent can apply it. |
| `audit-prompt.md` | Paste-ready prompt for an auditing agent. |
| `AGENTS.md` | Rules for coding agents that work in this repo. |
| `eslint.config.js` | Lint rules that find React performance problems. |
| `test/perf-regression.test.jsx` | Tests that show a problem and its fix. |
| `package.json` | Commands for lint and tests. |
| `.github/workflows/check.yml` | CI: lint and tests on every push. |
| `guides/react-dev-tools-profiler.md` | Step-by-step: how to use the React DevTools Profiler. |
| `guides/react-scan.md` | Step-by-step: how to spot re-render problems with zero setup. |
| `guides/react-doctor.md` | Step-by-step: how to scan code for smells and traces. |
| `guides/lighthouse.md` | Step-by-step: how to measure a page with Lighthouse. |
| `guides/why-did-you-render.md` | Step-by-step: how to find unnecessary re-renders. |
| `guides/bundle-visualizer.md` | Step-by-step: how to see what makes the bundle big. |

## Guides for beginners

Start here if you are new. Do one guide per day. Ten minutes each.

1. `guides/react-scan.md`: see re-render problems with zero setup.
2. `guides/react-doctor.md`: scan a codebase for smells and traces.
3. `guides/react-dev-tools-profiler.md`: find why a component re-renders.
4. `guides/lighthouse.md`: measure load speed and read the fixes.
5. `guides/why-did-you-render.md`: find unnecessary re-renders in dev mode.
6. `guides/bundle-visualizer.md`: see which file makes the bundle big.

Each guide has a short analogy, numbered steps, a practice task, and a "done when" check.

## Tools and references

For each problem, the checklist names a tool.
This table links to each tool's official page. Read there for details.

| Tool | What it does | Reference |
| --- | --- | --- |
| React DevTools Profiler | Shows why components render and how long it takes | https://react.dev/learn/react-developer-tools |
| React Scan | Shows re-render problems with zero code changes; has a CLI | https://react-scan.million.dev |
| React Doctor | Scans for React code smells, scores 0-100, records runtime traces | https://react.doctor |
| Million Lint | React linting from the React Scan team. React Scan credits it | https://million.dev |
| why-did-you-render | Logs unnecessary re-renders | https://github.com/welldone-software/why-did-you-render |
| eslint-plugin-react-hooks | Finds broken hook rules and dependency arrays | https://www.npmjs.com/package/eslint-plugin-react-hooks |
| eslint-plugin-react-compiler | Finds code the React Compiler cannot optimize | https://www.npmjs.com/package/eslint-plugin-react-compiler |
| React Compiler | Adds memoization automatically at build time | https://react.dev/learn/react-compiler |
| vite-bundle-visualizer | Shows what makes the bundle large | https://www.npmjs.com/package/vite-bundle-visualizer |
| webpack-bundle-analyzer | Shows bundle size for webpack projects | https://www.npmjs.com/package/webpack-bundle-analyzer |
| Lighthouse | Measures load speed and suggests fixes | https://developer.chrome.com/docs/lighthouse/overview |
| Lighthouse CI | Runs Lighthouse on every commit and fails on regressions | https://github.com/GoogleChrome/lighthouse-ci |
| size-limit | Fails CI when the bundle grows. Has a GitHub Action | https://github.com/ai/size-limit |
| web-vitals | Measures LCP, INP, and CLS in production | https://www.npmjs.com/package/web-vitals |
| Chrome Performance panel | Shows long tasks and slow code | https://developer.chrome.com/docs/devtools/performance/ |
| React.Profiler | Measures render time in tests | https://react.dev/reference/react/Profiler |
| react-window | Speeds up long lists | https://www.npmjs.com/package/react-window |
| Biome | Linter and formatter with autofix | https://biomejs.dev/ |
| Front-End Performance Checklist | Load performance checklist by David Dias | https://github.com/thedaviddias/front-end-performance-checklist |

## IDE and browser extensions

| Tool | Where | What it does | Reference |
| --- | --- | --- | --- |
| ESLint | VS Code extension | Runs `eslint.config.js`. Shows red squiggles and quick-fixes | https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint |
| Biome | VS Code extension | Formats and lints. Autofix with one click | https://marketplace.visualstudio.com/items?itemName=biomejs.biome |
| React Developer Tools | Chrome extension | Components tab and Profiler tab in DevTools | https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi |
| React Scan | Browser extension | Highlights re-renders without code changes | https://github.com/aidenybai/react-scan/blob/main/BROWSER_EXTENSION_GUIDE.md |

## CI

The repo ships a GitHub Actions workflow: `.github/workflows/check.yml`.
It runs lint and tests on every push and pull request.

For your own app, add these on top of the workflow:

| Tool | What it does | Reference |
| --- | --- | --- |
| Lighthouse CI | Audits LCP, INP, CLS in CI. Fails the build on regression | https://github.com/GoogleChrome/lighthouse-ci |
| size-limit | Fails CI when the bundle grows past a budget | https://github.com/ai/size-limit |
| React Doctor | One-command CI: `npx react-doctor@latest ci install`. Reports only new PR issues | https://react.doctor/ci |
| web-vitals + a metrics dashboard | Shows real-user field data from production | https://github.com/GoogleChrome/web-vitals |

## For very junior developers

New words, plain meaning:

| Word | Meaning |
| --- | --- |
| Render | React builds the screen from state. |
| Re-render | React builds the screen again. |
| Memo | Code that stops an unnecessary re-render. |
| Bundle | All the JavaScript you send to the user. |
| LCP | Largest Contentful Paint. When the main content appears. |
| INP | Interaction to Next Paint. How fast the page answers a click. |
| CLS | Cumulative Layout Shift. How much the page jumps. |

Start small. Read the quick answer first.
Then do one beginner guide. Then run the tests and the lint.
That is enough for one day.

## Credits

Inspired by https://github.com/thedaviddias/front-end-performance-checklist
The tool list builds on React Scan and React Doctor. Their READMEs credit
React DevTools, why-did-you-render, and Million Lint. This repo keeps
the same chain of credit.

## License

MIT
