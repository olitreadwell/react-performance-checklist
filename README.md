# React Performance Checklist

A one-page checklist for React performance interviews.
You can use tools in an interview. You do not need to memorize everything.
A coding agent can also use this repo to audit a codebase.

Written in Simplified Technical English. Made for people with ADHD or depression.
Low pressure. Small steps. You do not need a perfect answer.

## Who is this for

- Developers who have a React performance interview.
- Very junior developers who want to know where to start.
- Developers who want an agent to audit their codebase.

## The main idea

Measure first. Fix what costs the most.
Tools show you where the problem is. You choose the fix.

## How to use this repo

For the interview (human):

1. Open `react-performance-checklist.md`.
2. Read the 30-second answer and Section A. This takes 5 minutes.
3. Read the rest on the day, if you have energy.
4. If they allow it, look at the checklist during the interview.

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

## Files in this repo

| File | Purpose |
| --- | --- |
| `react-performance-checklist.md` | One page. Use it in the interview. |
| `audit-checklist.md` | Full checklist with detection and fix steps. An agent can apply it. |
| `audit-prompt.md` | Paste-ready prompt for an auditing agent. |
| `AGENTS.md` | Rules for coding agents that work in this repo. |
| `eslint.config.js` | Lint rules that find React performance problems. |
| `test/perf-regression.test.jsx` | Tests that show a problem and its fix. |
| `package.json` | Commands for lint and tests. |
| `guides/react-dev-tools-profiler.md` | Step-by-step: how to use the React DevTools Profiler. |
| `guides/lighthouse.md` | Step-by-step: how to measure a page with Lighthouse. |
| `guides/why-did-you-render.md` | Step-by-step: how to find unnecessary re-renders. |
| `guides/bundle-visualizer.md` | Step-by-step: how to see what makes the bundle big. |

## Guides for beginners

Start here if you are new. Do one guide per day. Ten minutes each.

1. `guides/react-dev-tools-profiler.md` — find why a component re-renders.
2. `guides/lighthouse.md` — measure load speed and read the fixes.
3. `guides/why-did-you-render.md` — find unnecessary re-renders in dev mode.
4. `guides/bundle-visualizer.md` — see which file makes the bundle big.

Each guide has a short analogy, numbered steps, a practice task, and a "done when" check.

## Tools and references

For each problem, the checklist names a tool.
This table links to each tool's official page. Read there for details.

| Tool | What it does | Reference |
| --- | --- | --- |
| React DevTools Profiler | Shows why components render and how long it takes | https://react.dev/learn/react-developer-tools |
| why-did-you-render | Logs unnecessary re-renders | https://github.com/welldone-software/why-did-you-render |
| eslint-plugin-react-hooks | Finds broken hook rules and dependency arrays | https://www.npmjs.com/package/eslint-plugin-react-hooks |
| eslint-plugin-react-compiler | Finds code the React Compiler cannot optimize | https://www.npmjs.com/package/eslint-plugin-react-compiler |
| React Compiler | Adds memoization automatically at build time | https://react.dev/learn/react-compiler |
| vite-bundle-visualizer | Shows what makes the bundle large | https://www.npmjs.com/package/vite-bundle-visualizer |
| webpack-bundle-analyzer | Shows bundle size for webpack projects | https://www.npmjs.com/package/webpack-bundle-analyzer |
| Lighthouse | Measures load speed and suggests fixes | https://developer.chrome.com/docs/lighthouse/overview |
| web-vitals | Measures LCP, INP, and CLS in production | https://www.npmjs.com/package/web-vitals |
| Chrome Performance panel | Shows long tasks and slow code | https://developer.chrome.com/docs/devtools/performance/ |
| React.Profiler | Measures render time in tests | https://react.dev/reference/react/Profiler |
| react-window | Speeds up long lists | https://www.npmjs.com/package/react-window |
| Biome | Linter and formatter with autofix | https://biomejs.dev/ |
| Front-End Performance Checklist | Load performance checklist by David Dias | https://github.com/thedaviddias/front-end-performance-checklist |

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

Start small. Read the 30-second answer first.
Then do one beginner guide. Then run the tests and the lint.
That is enough for one day.

## Credits

Inspired by https://github.com/thedaviddias/front-end-performance-checklist

## License

MIT
