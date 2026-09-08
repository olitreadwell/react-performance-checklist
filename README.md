# React Performance Checklist

One page to fix a slow React app. It works for new developers and for agents.
Every word with a plain meaning: [glossary.md](glossary.md)

## Quick start

```bash
npm install
npm run check
```

Lint and tests must pass. Then:

1. Run the scanners:
   - `npx react-doctor@latest` for code smells
   - `npx react-scan@latest http://localhost:3000` for re-render hotspots
2. Open the checklist below.
3. Fix the High items first.
4. Re-run the scanners. The score is the proof.

## The checklist

Work top to bottom. Each item has the problem, the smell, the fix, and the check.

### A. Measure first

**1. Profile before you change code [High]**
- Slow action: the thing the user says feels slow. Typing, opening a screen, applying a filter.
- Tool: [React DevTools Profiler](guides/react-dev-tools-profiler.md)
- Do: record the slow action. Open the slowest commit. In the overview chart, a taller bar is a slower render. In the flamegraph, a wider bar means more time. Read why the component rendered.
- Done when: you can name the component and the reason.

**2. Render count is not the cost [High]**
- Do: compare the render time with the work inside. Find the cost, not the count.
- Done when: you can quote a number.

### B. Fix renders

**3. Unstable props [High], a code smell**
- What it means: a prop that is a new object every render. React compares identity, not content, so memo cannot work.
- Smell: inline code in JSX. Examples: `onClick={() => ...}`, `style={{...}}`.
- Fix, in order: hoist the value out of the component. Use [useCallback](https://react.dev/reference/react/useCallback) for functions. Use [useMemo](https://react.dev/reference/react/useMemo) for computed values. Or turn on [React Compiler](https://react.dev/learn/react-compiler).
- Verify: [why-did-you-render](guides/why-did-you-render.md) goes quiet. React Scan shows no red flash there.

**4. Memo at the boundary [Medium]**
- Boundary: the edge of a subtree you want to stop re-rendering.
- Do: wrap only expensive subtrees with changed props. Not everything.

**5. Context re-renders every consumer [Medium]**
- Consumer: any component that reads the context.
- Fix: move state down to the component that uses it. Split one big context into smaller ones.
- Verify: a sibling consumer stops re-rendering in the Profiler.

**6. Keys must be stable [High], a code smell**
- Smell: `key={index}` in a list that reorders or filters.
- Stable id: the database id. If there is none, create one with `crypto.randomUUID()` when the item is created.
- Unexpected remount: focus jumps, state resets, the scroll jumps.

**7. Heavy work in render [High], a code smell**
- What heavy work means: sorting, filtering, formatting, or parsing during render.
- Where to move it: into `useMemo` for repeat results. Into an event handler, effect, or web worker for one-time work. Into the build step if it never changes.
- Long lists: render only visible rows with [react-window](https://react-window.vercel.app/) (virtualization).
- Verify: the flamegraph gets shorter. Typing stays smooth.

### C. Load time

**8. Split the code [High]**
- Do: use [React.lazy](https://react.dev/reference/react/lazy) and [Suspense](https://react.dev/reference/react/Suspense) around routes. Load a screen only when the user opens it.

**9. Shrink the bundle [Medium]**
- Tree-shaking: the build removes code you never use.
- Do: check with [vite-bundle-visualizer](https://www.npmjs.com/package/vite-bundle-visualizer) or [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer). Remove or replace big packages.

**10. Images and fonts [Medium]**
- Lazy loading: the image loads only when it is near the screen.
- Do: add `loading="lazy"` to images below the fold. Add `sizes`. Preload the critical font.
- Verify: LCP and CLS improve in [Lighthouse](guides/lighthouse.md).

### D. What users feel

**11. Core Web Vitals [Medium]**, the acronyms, spelled out:
- LCP: Largest Contentful Paint. When the main content appears. Under 2.5 s.
- INP: Interaction to Next Paint. How fast the page answers a click. Under 200 ms.
- CLS: Cumulative Layout Shift. How much the page jumps. Under 0.1.
- Do: track with [web-vitals](https://www.npmjs.com/package/web-vitals). Set budgets in [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci).

**12. Long tasks [Medium]**
- Long task: work on the main thread that blocks the screen for a moment.
- How to see one: Chrome Performance panel, record an interaction, read the blocking time.
- Fix: move the work out of the handler. Defer what is not urgent.

### E. Guard rails

**13. Lint with autofix [High]**
- Do: turn on [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) and [eslint-plugin-react-compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler). Config included: `eslint.config.js`.

**14. React Compiler [Medium]**
- Build-time memoization. Fewer re-renders without manual memo code.

**15. Perf tests [Medium]**
- A test that fails when a component re-renders for no reason. Example: `test/perf-regression.test.jsx`.

**16. CI gates [Medium]**
- CI: checks that run on every push. Run lint and tests. Add Lighthouse CI budgets. Add [React Doctor](https://react.doctor) as a required check.

## Code smells at a glance

- [ ] `key={index}` in a reordering list -> item 6
- [ ] `onClick={() => ...}` or `style={{...}}` into a memoized component -> item 3
- [ ] Sorting or filtering inside the render body -> item 7
- [ ] One context holding many values -> item 5
- [ ] All routes in one bundle -> item 8
- [ ] `<img>` without `loading="lazy"` -> item 10
- [ ] Long lists rendered one row at a time -> item 7

## Guides for beginners

One guide per tool. Each has an analogy, steps, a practice task, and a "done when" check.

1. [React Scan](guides/react-scan.md): see re-render problems with zero setup
2. [React Doctor](guides/react-doctor.md): scan a codebase for smells and traces
3. [React DevTools Profiler](guides/react-dev-tools-profiler.md): find why a component re-renders
4. [Lighthouse](guides/lighthouse.md): measure load speed and read the fixes
5. [why-did-you-render](guides/why-did-you-render.md): find unnecessary re-renders in dev mode
6. [Bundle visualizer](guides/bundle-visualizer.md): see what makes the bundle big

## Tools and references

| Tool | What it does | Guide | Reference |
| --- | --- | --- | --- |
| React DevTools Profiler | Shows why components render, and how long it takes | [guide](guides/react-dev-tools-profiler.md) | https://react.dev/learn/react-developer-tools |
| React Scan | Shows re-render problems with zero code changes | [guide](guides/react-scan.md) | https://react-scan.million.dev |
| React Doctor | Scans for code smells, scores 0-100, records traces | [guide](guides/react-doctor.md) | https://react.doctor |
| Million Lint | React linting from the React Scan team | | https://million.dev |
| why-did-you-render | Logs unnecessary re-renders | [guide](guides/why-did-you-render.md) | https://github.com/welldone-software/why-did-you-render |
| eslint-plugin-react-hooks | Finds broken hook rules and dependency arrays | | https://www.npmjs.com/package/eslint-plugin-react-hooks |
| eslint-plugin-react-compiler | Finds code the React Compiler cannot optimize | | https://www.npmjs.com/package/eslint-plugin-react-compiler |
| React Compiler | Adds memoization at build time | | https://react.dev/learn/react-compiler |
| vite-bundle-visualizer | Shows what makes the bundle large | [guide](guides/bundle-visualizer.md) | https://www.npmjs.com/package/vite-bundle-visualizer |
| webpack-bundle-analyzer | Shows bundle size for webpack projects | [guide](guides/bundle-visualizer.md) | https://www.npmjs.com/package/webpack-bundle-analyzer |
| Lighthouse | Measures load speed and suggests fixes | [guide](guides/lighthouse.md) | https://developer.chrome.com/docs/lighthouse/overview |
| Lighthouse CI | Runs Lighthouse on every commit, fails on regressions | | https://github.com/GoogleChrome/lighthouse-ci |
| size-limit | Fails CI when the bundle grows | | https://github.com/ai/size-limit |
| web-vitals | Measures LCP, INP, and CLS in production | | https://www.npmjs.com/package/web-vitals |
| Chrome Performance panel | Shows long tasks and slow code | | https://developer.chrome.com/docs/devtools/performance/ |
| React.Profiler | Measures render time in tests | | https://react.dev/reference/react/Profiler |
| react-window | Speeds up long lists (virtualization) | | https://react-window.vercel.app/ |
| Biome | Linter and formatter with autofix | | https://biomejs.dev/ |
| Front-End Performance Checklist | Load performance checklist by David Dias | | https://github.com/thedaviddias/front-end-performance-checklist |

## IDE and browser extensions

| Tool | Where | What it does | Reference |
| --- | --- | --- | --- |
| ESLint | VS Code extension | Runs `eslint.config.js`. Squiggles and quick-fixes | https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint |
| Biome | VS Code extension | Formats and lints. Autofix in one click | https://marketplace.visualstudio.com/items?itemName=biomejs.biome |
| React Developer Tools | Chrome extension | Components and Profiler tabs in DevTools | https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi |
| React Scan | Browser extension | Highlights re-renders without code changes | https://github.com/aidenybai/react-scan/blob/main/BROWSER_EXTENSION_GUIDE.md |

## CI

This repo ships a GitHub Actions workflow: `.github/workflows/check.yml`. It runs lint and tests on every push.

For your own app, add:

| Tool | What it does | Reference |
| --- | --- | --- |
| Lighthouse CI | Audits LCP, INP, CLS. Fails the build on regression | https://github.com/GoogleChrome/lighthouse-ci |
| size-limit | Fails CI when the bundle grows past a budget | https://github.com/ai/size-limit |
| React Doctor | One-command CI: `npx react-doctor@latest ci install` | https://react.doctor/ci |
| web-vitals + a dashboard | Shows real-user field data from production | https://github.com/GoogleChrome/web-vitals |

## Agent audit flow

- [audit-checklist.md](audit-checklist.md): the full checklist with detection and fix steps
- [audit-prompt.md](audit-prompt.md): paste this prompt into a coding agent to audit a codebase
- [AGENTS.md](AGENTS.md): rules for agents working in this repo

## Files in this repo

| File | Purpose |
| --- | --- |
| `react-performance-checklist.md` | The checklist as a single page (same content as above) |
| `glossary.md` | Plain meanings for every word, with examples |
| `guides/` | One beginner guide per tool |
| `eslint.config.js` | Lint rules with autofix |
| `test/perf-regression.test.jsx` | A test that shows a smell and its fix |
| `.github/workflows/check.yml` | CI: lint and tests on every push |

## Credits

Inspired by [front-end-performance-checklist](https://github.com/thedaviddias/front-end-performance-checklist).
The tool list builds on React Scan and React Doctor, which credit React DevTools, why-did-you-render, and Million Lint.

## License

MIT
