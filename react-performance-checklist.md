# React Performance Checklist

Plain words. Short lines. Work top to bottom.
Full definitions for every word: [glossary.md](glossary.md)
The same content lives in the README.

## Start here: you do not know what is slow

1. Run React Doctor: `npx react-doctor@latest`
2. Run React Scan: `npx react-scan@latest http://localhost:3000`
3. Run Lighthouse on the page.
4. Record the Profiler during normal use. Open the slowest render.

You now have a list of problems. Fix the High items below.

## The quick answer

"I do not guess. I measure first. I see which components re-render and what that costs. Then I fix the mechanical misses: index keys, inline props, heavy work in render. If load time is the problem, I split the code and shrink the bundle. I choose the fix, then I re-measure to prove it."

## A. Measure first

### 1. Profile before you change code [High]

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

### 2. Render count is not the cost [High]

- Render time: how long one render takes.
- Work: what the component does during render. Sorting, filtering, building JSX.
- Count: how many times it renders.
- Cost: the time it actually takes.
- Example: a small button rendered 5,000 times is cheap. A 10,000-row table rendered 5 times is expensive.
- Done when: you can quote a number, not a feeling.

## B. Fix renders

### 3. Unstable props [High], a code smell

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

### 4. Memo at the boundary [Medium]

- Subtree: a component and everything it renders.
- Boundary: the component you wrap with memo. Re-renders stop at the boundary.
- Good: memo on a list row that gets stable props.
- Bad: memo on a component whose parent passes inline props. The memo cannot help.
- Bad: memo on a component whose props change every render anyway.
- Do: wrap only expensive subtrees with changed props. Not everything.

### 5. Context re-renders every consumer [Medium]

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

### 6. Keys must be stable [High], a code smell

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

### 7. Heavy work in render [High], a code smell

- Heavy work: sorting, filtering, formatting, or parsing during render.
- How to tell: code in the component body runs on every render. Look for `.filter(`, `.sort(`, `.map(` over big arrays, `JSON.parse`, date formatting.
- Where to start: the component that owns the list (the parent of the rows). Then follow the widest bars in the flamegraph.
- Where to move it:
  1. Into `useMemo` if the result repeats for the same inputs.
  2. Into an event handler, an effect, or a web worker if it runs once.
  3. Into the build step if it never changes.
- Long lists: [virtualization](glossary.md), render only the visible rows with [react-window](https://react-window.vercel.app/).
- Verify: the flamegraph gets shorter. Typing stays smooth.

## C. Load time

### 8. Split the code [High]

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

### 9. Shrink the bundle [Medium]

- Tree-shaking: the build removes code you never use. [Definition](glossary.md)
- Do: check with [vite-bundle-visualizer](https://www.npmjs.com/package/vite-bundle-visualizer) or [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer). Remove or replace big packages. Use per-package imports.
- Verify: the bundle picture gets smaller.

### 10. Images and fonts [Medium]

- Lazy loading: the image loads only when it is near the screen. [Definition](glossary.md)
- Do: add `loading="lazy"` to images below the fold. Add `sizes`. Preload the critical font.
- Verify: LCP and CLS improve in [Lighthouse](guides/lighthouse.md).

## D. What users feel

### 11. Core Web Vitals [Medium]

The acronyms, spelled out:

- LCP: Largest Contentful Paint. When the main content appears. Under 2.5 s.
- INP: Interaction to Next Paint. How fast the page answers a click. Under 200 ms.
- CLS: Cumulative Layout Shift. How much the page jumps. Under 0.1.

- Do: track with [web-vitals](https://www.npmjs.com/package/web-vitals). Set budgets in [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci).

### 12. Long tasks [Medium]

- Long task: work on the main thread that blocks the screen for a moment. [Definition](glossary.md)
- Interaction: a click, a keypress, a scroll.
- Handler: the function that runs when the interaction happens.
- Blocking time: the time the page cannot respond because the main thread is busy.
- How to see one: Chrome Performance panel, record an interaction, read the blocking time.
- Fix: move the work out of the handler. Defer what is not urgent.
- Example: a click handler that loops over 100,000 items blocks the page. Move the loop to a worker, or chunk it.

## E. Guard rails

These do not find the first problem. They stop the next one. Run lint anytime; it is cheap.

### 13. Lint with autofix [High]

- Do: turn on [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) and [eslint-plugin-react-compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler). Config included: `eslint.config.js`.
- How to check it works: run `npm run lint`. Zero errors means it is on.
- How to run without pushing: run it locally. CI is the same commands, automated.

### 14. React Compiler [Medium]

- Build-time memoization. Fewer re-renders without manual memo code.
- How to check it works: the Profiler shows fewer re-renders with no manual memo code.

### 15. Perf tests [Medium]

- A test that fails when a component re-renders for no reason. Example: `test/perf-regression.test.jsx`.
- How to run without pushing: `npm test`.

### 16. CI gates [Medium]

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

## Tools, one concept each

- React Scan: shows re-render hotspots, zero setup. [guide](guides/react-scan.md)
- React Doctor: code smells, score, runtime traces. [guide](guides/react-doctor.md)
- Profiler: why a component rendered, and its cost. [guide](guides/react-dev-tools-profiler.md)
- why-did-you-render: unstable props defeating memo. [guide](guides/why-did-you-render.md)
- Lighthouse: what users feel. [guide](guides/lighthouse.md)
- Bundle visualizer: what you ship. [guide](guides/bundle-visualizer.md)

## The fix is one of six moves

1. Stop doing the work.
2. Move the work.
3. Memoize a boundary.
4. Split the context.
5. Load less.
6. Virtualize the list.
