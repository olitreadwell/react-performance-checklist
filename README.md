# React Performance Checklist

One page to fix a slow React app. For new developers and for agents.
Every word has a plain meaning: [glossary.md](glossary.md)

**Other checklists:**
- [Front-End Checklist](https://github.com/thedaviddias/front-end-checklist)
- [Front-End Performance Checklist](https://github.com/thedaviddias/front-end-performance-checklist)

## Table of Contents

- [How to use](#how-to-use)
- [Start here: you do not know what is slow](#start-here-you-do-not-know-what-is-slow)
- [Quick start](#quick-start)
- [A. Measure first](#a-measure-first)
- [B. Fix renders](#b-fix-renders)
- [C. Load time](#c-load-time)
- [D. What users feel](#d-what-users-feel)
- [E. Guard rails](#e-guard-rails)
- [Code smells at a glance](#code-smells-at-a-glance)
- [Tools](#tools)
- [IDE and browser extensions](#ide-and-browser-extensions)
- [CI](#ci)
- [For agents](#for-agents)
- [Files in this repo](#files-in-this-repo)
- [References](#references)
- [License](#license)

## How to use

For each rule, you get the problem, the smell, the fix, and the check.
Links point to guides, tools, and official docs.

Priority levels:

- **High**: fix first. These cause the most visible problems.
- **Medium**: fix after the High items. They stop the next problem.

## Start here: you do not know what is slow

If nothing feels slow, do this in order. Each step takes minutes.

1. Run React Doctor. It finds code smells without a browser:

   ```bash
   npx react-doctor@latest
   ```

2. Run React Scan against your running app. It shows re-render hotspots:

   ```bash
   npx react-scan@latest http://localhost:3000
   ```

3. Run Lighthouse on the page. It measures load time:
   open DevTools, click the Lighthouse tab, generate a report.
4. Record the Profiler during normal use. Open the slowest render. See [item 1](#1-profile-before-you-change-code-high).

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

<!-- CHECKLIST:START -->
## A. Measure first

### 1. Profile before you change code [High]

- [ ] Record the slow moment, then read why each component rendered.

- Slow action: the thing the user says feels slow. Typing, opening a screen, applying a filter.
- If nothing feels slow: record normal use for a minute, then open the slowest render.

  _Why:_
  > You cannot fix what you cannot see. Guessing wastes time.

  _How:_
  > - Record the slow action.
  > - If nothing feels slow, record normal use for a minute.
  > - At the top of the Profiler, one vertical bar per render. Taller means slower. That is the slowest commit.
  > - Click the tallest bar.
  > - In the flamegraph, horizontal bars. Wider means more time.
  > - Read why the component rendered.

- Verify: You can name the component and the reason.

- 🛠 [React DevTools Profiler guide](guides/react-dev-tools-profiler.md)

### 2. Render count is not the cost [High]

- [ ] A re-render is a problem only if it takes time.

- Render time: how long one render takes.
- Work: what the component does during render. Sorting, filtering, building JSX.
- Count: how many times it renders.
- Cost: the time it actually takes.

  _Why:_
  > A small button rendered 5,000 times is cheap. A 10,000-row table rendered 5 times is expensive.

  _How:_
  > - Compare render time with the work inside.
  > - Find the cost, not the count.

- Verify: You can quote a number, not a feeling.


**[⬆ back to top](#table-of-contents)**

## B. Fix renders

### 3. Unstable props [High]

- [ ] A prop that is a new object every render defeats memo.

- What identity means: whether two values are the same object. Two objects with the same words are different objects. A function written inside a component is a new object every render. React compares identity, not content, so memo sees a change and cannot work.
- Smell: inline code in JSX.

  _Why:_
  > React compares identity, not content. A function or object written inline is a new object every render, so memo sees a change and cannot work.

  _How:_
  > - Hoist the value out of the component. Put it at the top of the file, or in the parent.
  > - Use useCallback for functions.
  > - Use useMemo for computed values.
  > - Or turn on React Compiler and let it do this for you.

  ```jsx
  // Bad: new function each render
  <Row onClick={() => save()} />

  // Good: same function every render
  const save = useCallback(() => doSave(), []);
  <Row onClick={save} />

  // Bad: new object each render
  <Row style={{ color: "red" }} />

  // Good: same object every render
  const RED = { color: "red" };
  <Row style={RED} />

  // Bad: new array each render
  <Row items={["a", "b"]} />

  // Good: same array every render
  const ITEMS = ["a", "b"];
  <Row items={ITEMS} />
  ```

  Looks bad but fine, leave it alone:

  - `onClick={() => ...}` passed to a component that is NOT memoized. No memo, no problem.
  - A string or number prop. Primitives compare by value, not identity.

- Verify: why-did-you-render goes quiet. React Scan shows no red flash there.

- 🛠 [why-did-you-render guide](guides/why-did-you-render.md)
- 📖 [useCallback docs](https://react.dev/reference/react/useCallback)
- 📖 [useMemo docs](https://react.dev/reference/react/useMemo)
- 📖 [React Compiler docs](https://react.dev/learn/react-compiler)

### 4. Memo at the boundary [Medium]

- [ ] Wrap only expensive subtrees with changed props.

- Subtree: a component and everything it renders.
- Boundary: the component you wrap with memo. Re-renders stop at the boundary.

  _Why:_
  > A subtree is a component and everything it renders. The boundary is the component you wrap with memo. Re-renders stop there.

  _How:_
  > - Good: memo on a list row that gets stable props.
  > - Bad: memo on a component whose parent passes inline props. The memo cannot help.
  > - Bad: memo on a component whose props change every render anyway.

- Verify: Render count drops where it matters, and the page still behaves.

- 📖 [memo docs](https://react.dev/reference/react/memo)

### 5. Context re-renders every consumer [Medium]

- [ ] One big context re-renders every consumer on any change.

- State and context are not the same. State is data a component owns. Context is the pipe that shares it.
- Consumer: any component that reads the context.
- What happens: when the context value changes, every consumer re-renders.

  _Why:_
  > A consumer is any component that reads the context. When the context value changes, every consumer re-renders. State is data a component owns. Context is the pipe that shares it.

  _How:_
  > - Move state down to the component that uses it.
  > - Split one big context into smaller ones. Separate data from actions.

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

- Verify: In the Profiler, a sibling consumer no longer re-renders.

- 📖 [Context docs](https://react.dev/learn/passing-data-deeply-with-context)

### 6. Keys must be stable [High]

- [ ] key={index} in a list that reorders or filters.

- Unexpected remount: the component loses its state. Signs: the input loses focus while you type, a checkbox unchecks, the scroll jumps, the Profiler shows a new mount.
- How to check: type in a row's input, then reorder the list. If the input loses focus, the row remounted.

  _Why:_
  > The index moves between items, so React rebuilds the wrong rows.

  _How:_
  > - Use the database id as the key.
  > - If there is no id, create one with crypto.randomUUID() when the item is created.
  > - Signs of an unexpected remount: the input loses focus, a checkbox unchecks, the scroll jumps, the Profiler shows a new mount.

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

- Verify: No remounts in the Profiler after a reorder.

- 📖 [Rendering lists docs](https://react.dev/learn/rendering-lists)

### 7. Heavy work in render [High]

- [ ] Sorting, filtering, formatting, or parsing during render.

- Heavy work: sorting, filtering, formatting, or parsing during render.
- How to tell: code in the component body runs on every render. Look for `.filter(`, `.sort(`, `.map(` over big arrays, `JSON.parse`, date formatting.
- Where to start: the component that owns the list (the parent of the rows). Then follow the widest bars in the flamegraph.
- Long lists: [virtualization](glossary.md), render only the visible rows with [react-window](https://react-window.vercel.app/).

  _Why:_
  > Code in the component body runs on every render. Look for .filter(), .sort(), .map() over big arrays, JSON.parse, date formatting.

  _How:_
  > - Move the work into useMemo if the result repeats for the same inputs.
  > - Move it into an event handler, an effect, or a web worker if it runs once.
  > - Move it into the build step if it never changes.
  > - For long lists, render only the visible rows with react-window (virtualization).

- Verify: The flamegraph gets shorter. Typing stays smooth.

- 📖 [react-window](https://react-window.vercel.app/)

**[⬆ back to top](#table-of-contents)**

## C. Load time

### 8. Split the code [High]

- [ ] All routes in one bundle.

- Code splitting: loading code only when a route needs it. [Definition](glossary.md)
- How to know you need it: the first load is slow, the bundle is big, or a heavy screen is rarely used.
- How to know you went overboard: too many tiny chunks means too many network requests. Split at the route level, not every component. If a chunk is small and rarely changes, leave it in the main bundle.

  _Why:_
  > Code splitting loads code only when a route needs it. The first load is slow when everything ships at once.

  _How:_
  > - Use React.lazy and Suspense around routes.
  > - Split at the route level, not every component.
  > - If a chunk is small and rarely changes, leave it in the main bundle.

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

- Verify: The first load downloads fewer bytes.

- 📖 [React.lazy docs](https://react.dev/reference/react/lazy)

### 9. Shrink the bundle [Medium]

- [ ] The bundle is bigger than the app needs.

- Tree-shaking: the build removes code you never use. [Definition](glossary.md)

  _Why:_
  > Tree-shaking removes code you never use. Big packages you barely use cost every user download time.

  _How:_
  > - Check with vite-bundle-visualizer or webpack-bundle-analyzer.
  > - Remove or replace big packages.
  > - Use per-package imports.

- Verify: The bundle picture gets smaller.

- 🛠 [Bundle visualizer guide](guides/bundle-visualizer.md)
- 📖 [vite-bundle-visualizer](https://www.npmjs.com/package/vite-bundle-visualizer)
- 📖 [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### 10. Images and fonts [Medium]

- [ ] Images without lazy loading, or critical fonts loading late.

- Lazy loading: the image loads only when it is near the screen. [Definition](glossary.md)

  _Why:_
  > Lazy loading means the image loads only when it is near the screen. Large images and late fonts slow LCP and cause layout shift.

  _How:_
  > - Add loading="lazy" to images below the fold.
  > - Add sizes.
  > - Preload the critical font.

- Verify: LCP and CLS improve in Lighthouse.

- 🛠 [Lighthouse guide](guides/lighthouse.md)

**[⬆ back to top](#table-of-contents)**

## D. What users feel

### 11. Core Web Vitals [Medium]

- [ ] No field data and no budgets for LCP, INP, CLS.

- LCP: Largest Contentful Paint. When the main content appears. Under 2.5 s.
- INP: Interaction to Next Paint. How fast the page answers a click. Under 200 ms.
- CLS: Cumulative Layout Shift. How much the page jumps. Under 0.1.

  _Why:_
  > LCP is Largest Contentful Paint, when the main content appears. INP is Interaction to Next Paint, how fast the page answers a click. CLS is Cumulative Layout Shift, how much the page jumps.

  _How:_
  > - Track with web-vitals.
  > - Set budgets in Lighthouse CI.

- Verify: Budgets pass on every push.

- 📖 [web.dev vitals](https://web.dev/articles/vitals)
- 📖 [web-vitals package](https://www.npmjs.com/package/web-vitals)
- 📖 [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### 12. Long tasks [Medium]

- [ ] Work on the main thread that blocks the screen.

- Long task: work on the main thread that blocks the screen for a moment. [Definition](glossary.md)
- Interaction: a click, a keypress, a scroll.
- Handler: the function that runs when the interaction happens.
- Blocking time: the time the page cannot respond because the main thread is busy.
- Example: a click handler that loops over 100,000 items blocks the page. Move the loop to a worker, or chunk it.

  _Why:_
  > An interaction is a click, a keypress, or a scroll. A handler is the function that runs when it happens. Blocking time is the time the page cannot respond because the main thread is busy.

  _How:_
  > - Open the Chrome Performance panel, record an interaction, read the blocking time.
  > - Move the work out of the handler. Defer what is not urgent.

- Verify: The blocking time drops, and INP follows.

- 📖 [Optimize long tasks](https://web.dev/articles/optimize-long-tasks)

**[⬆ back to top](#table-of-contents)**

## E. Guard rails

### 13. Lint with autofix [High]

- [ ] Broken hook rules and dependency arrays are invisible while typing.

- How to run without pushing: run it locally. CI is the same commands, automated.

  _Why:_
  > A linter checks the code as you write it. Autofix applies the fix for you.

  _How:_
  > - Turn on eslint-plugin-react-hooks and eslint-plugin-react-compiler.
  > - Config included: eslint.config.js.

- Verify: Run npm run lint. Zero errors means it is on.

- 📖 [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- 📖 [eslint-plugin-react-compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler)

### 14. React Compiler [Medium]

- [ ] Manual memoization is error-prone and noisy.

  _Why:_
  > React Compiler adds memoization at build time. Fewer re-renders without manual memo code.

  _How:_
  > - Enable babel-plugin-react-compiler on React 19.

- Verify: The Profiler shows fewer re-renders with no manual memo code.

- 📖 [React Compiler docs](https://react.dev/learn/react-compiler)

### 15. Perf tests [Medium]

- [ ] Perf fixes silently regress later.

- How to run without pushing: `npm test`.

  _Why:_
  > A test that fails when a component re-renders for no reason stops the regression before it ships.

  _How:_
  > - Write a call-count test. Example: test/perf-regression.test.jsx.
  > - Use React.Profiler for duration asserts.

- Verify: The test goes red on a regression, green after the fix.

- 📖 [React.Profiler docs](https://react.dev/reference/react/Profiler)

### 16. CI gates [Medium]

- [ ] A slow change can merge without anyone noticing.

- CI: checks that run on every push. [Definition](glossary.md)
- How to run without pushing: run the same commands locally. CI is just automation of them.

  _Why:_
  > CI is checks that run on every push. It is the same commands you run locally, automated.

  _How:_
  > - Run lint and tests.
  > - Add Lighthouse CI budgets.
  > - Add React Doctor as a required check.

- Verify: A slow change cannot merge.

- 📖 [React Doctor CI](https://react.doctor/ci)

**[⬆ back to top](#table-of-contents)**
<!-- CHECKLIST:END -->

<!-- SMELLS:START -->
## Code smells at a glance

- [ ] Unstable props into a memoized component -> [item 3](#3-unstable-props-high)

  ```jsx
  onClick={() => ...}
  style={{...}}
  ```

- [ ] One context holding many values -> [item 5](#5-context-re-renders-every-consumer-medium)

  ```jsx
  const AppContext = createContext({ user, theme, save, logout });
  ```

- [ ] Index used as a key in a reordering list -> [item 6](#6-keys-must-be-stable-high)

  ```jsx
  items.map((item, index) => <Row key={index} item={item} />)
  ```

- [ ] Sorting or filtering inside the render body -> [item 7](#7-heavy-work-in-render-high)

  ```jsx
  const sorted = items.sort((a, b) => a - b); // runs on every render
  ```

- [ ] All routes in one bundle -> [item 8](#8-split-the-code-high)

  ```jsx
  import Settings from "./Settings";
  import Profile from "./Profile"; // both load on first visit
  ```

- [ ] Images without lazy loading -> [item 10](#10-images-and-fonts-medium)

  ```jsx
  <img src="hero.jpg" />
  ```
<!-- SMELLS:END -->

## Tools

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

## For agents

Three surfaces, one rule corpus. Modeled on thedaviddias/front-end-checklist.

- README: the checklist for humans, worked through in one page.
- `rules/rules.json`: the same rules as structured data. Agents and tools read this.
- MCP server: `packages/mcp/server.mjs` exposes the rules to MCP-capable agents.
  Run it with `npm run mcp`, or add `.mcp.json` to your agent config.

The MCP server has three tools: `list_rules`, `get_rule`, and `audit_plan`.

- [audit-checklist.md](audit-checklist.md): the full checklist with detection and fix steps
- [audit-prompt.md](audit-prompt.md): paste this prompt into a coding agent to audit a codebase
- [AGENTS.md](AGENTS.md): rules for agents working in this repo

## Files in this repo

| File | Purpose |
| --- | --- |
| `react-performance-checklist.md` | The checklist as a single page (same content as above) |
| `glossary.md` | Plain meanings for every word, with examples and official docs |
| `rules/rules.json` | The 16 rules as structured data. Read by agents and the MCP server |
| `scripts/generate-readme.mjs` | Builds the checklist sections from `rules/rules.json` |
| `packages/mcp/server.mjs` | MCP server: `list_rules`, `get_rule`, `audit_plan` |
| `guides/` | One beginner guide per tool |
| `eslint.config.js` | Lint rules with autofix |
| `test/perf-regression.test.jsx` | A test that shows a smell and its fix |
| `.github/workflows/check.yml` | CI: lint and tests on every push |

## References

- [React docs](https://react.dev)
- [web.dev performance](https://web.dev/learn/performance)
- [Front-End Checklist](https://github.com/thedaviddias/front-end-checklist)
- [Front-End Performance Checklist](https://github.com/thedaviddias/front-end-performance-checklist)
- [React Scan](https://react-scan.million.dev)
- [React Doctor](https://react.doctor)

## Credits

Inspired by [front-end-performance-checklist](https://github.com/thedaviddias/front-end-performance-checklist).
The tool list builds on React Scan and React Doctor, which credit React DevTools, why-did-you-render, and Million Lint.

## License

MIT
