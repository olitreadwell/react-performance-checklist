# React Performance Checklist

One page to fix a slow React app. For new developers and for agents.
Every word has a plain meaning: [glossary.md](glossary.md)

## What this repo is

- The docs: the checklist, guides, and glossary. Nothing to install to read them.
- The tooling: an ESLint config and a test, included so you can copy them. `npm install` installs only these.
- The scanners (React Scan, React Doctor) are separate tools. One command each. No install.

## Architecture

Three surfaces, one rule corpus. Modeled on thedaviddias/front-end-checklist.

- README: the checklist for humans, worked through in one page.
- `rules/rules.json`: the same rules as structured data. Agents and tools read this.
- MCP server: `packages/mcp/server.mjs` exposes the rules to MCP-capable agents.
  Run it with `npm run mcp`, or add `.mcp.json` to your agent config.

The MCP server has three tools: `list_rules`, `get_rule`, and `audit_plan`.

## Start here: you do not know what is slow

If nothing feels slow, do this in order. Each step takes minutes.

1. Run React Doctor. It finds code smells without a browser:
   `npx react-doctor@latest`
2. Run React Scan against your running app. It shows re-render hotspots:
   `npx react-scan@latest http://localhost:3000`
3. Run Lighthouse on the page. It measures load time:
   open DevTools, click the Lighthouse tab, generate a report.
4. Record the Profiler during normal use. Open the slowest render. See item 1.

You now have a list of problems. Fix the High items in the checklist.

## Quick start

Copy-paste, in order:

```bash
# 1. Scan for code smells. No install. Runs once.
npx react-doctor@latest

# 2. Scan for re-render hotspots. No install. Your app must be running.
npx react-scan@latest http://localhost:3000

# 3. Optional: use this repo's lint config and tests.
npm install
npm run check
```

What each command does:

- `npx react-doctor@latest` downloads and runs React Doctor once. It does not change your project.
- `npx react-scan@latest <url>` opens a browser and highlights re-renders.
- `npm install` installs this repo's own dev dependencies (ESLint, Vitest). Only needed for step 3.
- `npm run check` runs the included lint and tests. Both must pass.

## The checklist

Work top to bottom. Each item has the problem, the smell, the fix, and the check.

### A. Measure first

#### 1. Profile before you change code [High]

- Slow action: the thing the user says feels slow. Typing, opening a screen, applying a filter.
- If nothing feels slow: record normal use for a minute, then open the slowest render.
- Tool: [React DevTools Profiler](guides/react-dev-tools-profiler.md)
- Do:
  1. Record the slow action.
  2. At the top of the Profiler, one vertical bar per render. Taller = slower. That is the slowest commit.
  3. Click the tallest bar.
  4. In the flamegraph, horizontal bars. Wider = more time.
  5. Read why the component rendered.
- Done when: you can name the component and the reason.

#### 2. Render count is not the cost [High]

- Render time: how long one render takes.
- Work: what the component does during render. Sorting, filtering, building JSX.
- Count: how many times it renders.
- Cost: the time it actually takes.
- Example: a small button rendered 5,000 times is cheap. A 10,000-row table rendered 5 times is expensive.
- Done when: you can quote a number, not a feeling.

### B. Fix renders

#### 3. Unstable props [High], a code smell

- What identity means: whether two values are the same object. Two objects with the same words are different objects. A function written inside a component is a new object every render. React compares identity, not content, so memo sees a change and cannot work.
- Smell: inline code in JSX.

| Bad (new object every render) | Why | Good (same object every render) |
| --- | --- | --- |
| `<Row onClick={() => save()} />` | new function each render | `const save = useCallback(() => doSave(), [])` then `<Row onClick={save} />` |
| `<Row style={{ color: "red" }} />` | new object each render | `const RED = { color: "red" }` at the top of the file, then `<Row style={RED} />` |
| `<Row items={["a", "b"]} />` | new array each render | `const ITEMS = ["a", "b"]` at the top of the file |

Looks bad but fine, leave it alone:

- `onClick={() => ...}` passed to a component that is NOT memoized. No memo, no problem.
- A string or number prop. Primitives compare by value, not identity.

- Fix, in order: hoist the value out of the component. Use [useCallback](https://react.dev/reference/react/useCallback) for functions. Use [useMemo](https://react.dev/reference/react/useMemo) for computed values. Or turn on [React Compiler](https://react.dev/learn/react-compiler).
- Verify: [why-did-you-render](guides/why-did-you-render.md) goes quiet. React Scan shows no red flash there.

#### 4. Memo at the boundary [Medium]

- Subtree: a component and everything it renders.
- Boundary: the component you wrap with memo. Re-renders stop at the boundary.
- Good: memo on a list row that gets stable props.
- Bad: memo on a component whose parent passes inline props. The memo cannot help.
- Bad: memo on a component whose props change every render anyway.
- Do: wrap only expensive subtrees with changed props. Not everything.

#### 5. Context re-renders every consumer [Medium]

- State and context are not the same.
  - State: data a component owns. `useState`.
  - Context: a way to share data with many components. It often holds state, but it is the pipe, not the data.
- Consumer: any component that reads the context.
- What happens: when the context value changes, every consumer re-renders.
- How to split one big context:

```jsx
// Before: one context holds everything. Any change re-renders all consumers.
const AppContext = createContext({ user, theme, save, logout });

// After: two contexts. A theme change re-renders only theme consumers.
const UserContext = createContext(null);
const ThemeContext = createContext("light");

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Page />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
```

- Verify: in the Profiler, a sibling consumer no longer re-renders.

#### 6. Keys must be stable [High], a code smell

- Smell: `key={index}` in a list that reorders or filters.
- Why: the index moves between items, so React rebuilds the wrong rows.
- How to create a stable id:

```jsx
// Give each item an id once, when it is created:
const [items, setItems] = useState(() => [
  { id: crypto.randomUUID(), text: "first" },
  { id: crypto.randomUUID(), text: "second" },
]);

// Add new items the same way:
setItems((prev) => [...prev, { id: crypto.randomUUID(), text: "new" }]);

// Use the id as the key:
{items.map((item) => <Row key={item.id} item={item} />)}
```

- Unexpected remount: the component loses its state. Signs: the input loses focus while you type, a checkbox unchecks, the scroll jumps, the Profiler shows a new mount.
- How to check: type in a row's input, then reorder the list. If the input loses focus, the row remounted.

#### 7. Heavy work in render [High], a code smell

- Heavy work: sorting, filtering, formatting, or parsing during render.
- How to tell: code in the component body runs on every render. Look for `.filter(`, `.sort(`, `.map(` over big arrays, `JSON.parse`, date formatting.
- Where to start: the component that owns the list (the parent of the rows). Then follow the widest bars in the flamegraph.
- Where to move it:
  1. Into `useMemo` if the result repeats for the same inputs.
  2. Into an event handler, an effect, or a web worker if it runs once.
  3. Into the build step if it never changes.
- Long lists: [virtualization](glossary.md), render only the visible rows with [react-window](https://react-window.vercel.app/).
- Verify: the flamegraph gets shorter. Typing stays smooth.

### C. Load time

#### 8. Split the code [High]

- Code splitting: loading code only when a route needs it. [Definition](glossary.md)
- How to know you need it: the first load is slow, the bundle is big, or a heavy screen is rarely used.
- How to use it:

```jsx
import { lazy, Suspense } from "react";

const Settings = lazy(() => import("./Settings"));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Settings />
    </Suspense>
  );
}
```

- How to know you went overboard: too many tiny chunks means too many network requests. Split at the route level, not every component. If a chunk is small and rarely changes, leave it in the main bundle.
- Verify: the first load downloads fewer bytes.

#### 9. Shrink the bundle [Medium]

- Tree-shaking: the build removes code you never use. [Definition](glossary.md)
- Do: check with [vite-bundle-visualizer](https://www.npmjs.com/package/vite-bundle-visualizer) or [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer). Remove or replace big packages. Use per-package imports.
- Verify: the bundle picture gets smaller.

#### 10. Images and fonts [Medium]

- Lazy loading: the image loads only when it is near the screen. [Definition](glossary.md)
- Do: add `loading="lazy"` to images below the fold. Add `sizes`. Preload the critical font.
- Verify: LCP and CLS improve in [Lighthouse](guides/lighthouse.md).

### D. What users feel

#### 11. Core Web Vitals [Medium]

The acronyms, spelled out:

- LCP: Largest Contentful Paint. When the main content appears. Under 2.5 s.
- INP: Interaction to Next Paint. How fast the page answers a click. Under 200 ms.
- CLS: Cumulative Layout Shift. How much the page jumps. Under 0.1.

- Do: track with [web-vitals](https://www.npmjs.com/package/web-vitals). Set budgets in [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci).

#### 12. Long tasks [Medium]

- Long task: work on the main thread that blocks the screen for a moment. [Definition](glossary.md)
- Interaction: a click, a keypress, a scroll.
- Handler: the function that runs when the interaction happens.
- Blocking time: the time the page cannot respond because the main thread is busy.
- How to see one: Chrome Performance panel, record an interaction, read the blocking time.
- Fix: move the work out of the handler. Defer what is not urgent.
- Example: a click handler that loops over 100,000 items blocks the page. Move the loop to a worker, or chunk it.

### E. Guard rails

These do not find the first problem. They stop the next one. Run lint anytime; it is cheap.

#### 13. Lint with autofix [High]

- Do: turn on [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) and [eslint-plugin-react-compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler). Config included: `eslint.config.js`.
- How to check it works: run `npm run lint`. Zero errors means it is on.
- How to run without pushing: run it locally. CI is the same commands, automated.

#### 14. React Compiler [Medium]

- Build-time memoization. Fewer re-renders without manual memo code.
- How to check it works: the Profiler shows fewer re-renders with no manual memo code.

#### 15. Perf tests [Medium]

- A test that fails when a component re-renders for no reason. Example: `test/perf-regression.test.jsx`.
- How to run without pushing: `npm test`.

#### 16. CI gates [Medium]

- CI: checks that run on every push. [Definition](glossary.md)
- Do: run lint and tests. Add Lighthouse CI budgets. Add [React Doctor](https://react.doctor) as a required check.
- How to run without pushing: run the same commands locally. CI is just automation of them.

## Code smells at a glance

- [ ] `key={index}` in a reordering list -> [item 6](#6-keys-must-be-stable-high-a-code-smell)
- [ ] `onClick={() => ...}` or `style={{...}}` into a memoized component -> [item 3](#3-unstable-props-high-a-code-smell)
- [ ] Sorting or filtering inside the render body -> [item 7](#7-heavy-work-in-render-high-a-code-smell)
- [ ] One context holding many values -> [item 5](#5-context-re-renders-every-consumer-medium)
- [ ] All routes in one bundle -> [item 8](#8-split-the-code-high)
- [ ] `<img>` without `loading="lazy"` -> [item 10](#10-images-and-fonts-medium)
- [ ] Long lists rendered one row at a time -> [item 7](#7-heavy-work-in-render-high-a-code-smell)

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
| `glossary.md` | Plain meanings for every word, with examples and official docs |
| `rules/rules.json` | The 16 rules as structured data. Read by agents and the MCP server |
| `packages/mcp/server.mjs` | MCP server: `list_rules`, `get_rule`, `audit_plan` |
| `guides/` | One beginner guide per tool |
| `eslint.config.js` | Lint rules with autofix |
| `test/perf-regression.test.jsx` | A test that shows a smell and its fix |
| `.github/workflows/check.yml` | CI: lint and tests on every push |

## Credits

Inspired by [front-end-performance-checklist](https://github.com/thedaviddias/front-end-performance-checklist).
The tool list builds on React Scan and React Doctor, which credit React DevTools, why-did-you-render, and Million Lint.

## License

MIT
