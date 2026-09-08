# React Performance Checklist

Plain words. Short lines. Work top to bottom.
Full definitions for every word: [glossary.md](glossary.md)

## The quick answer

Say this when someone reports a slow app:

"I do not guess. I measure first. I see which components re-render and what that costs. Then I fix the mechanical misses: index keys, inline props, heavy work in render. If load time is the problem, I split the code and shrink the bundle. I choose the fix, then I re-measure to prove it."

## The order

1. Measure.
2. See the cost.
3. Fix one thing.
4. Measure again.

## A. Measure first

### 1. Profile before you change code [High]

- What: record the slow moment, then read why each component rendered.
- Slow action: the thing the user says feels slow. Typing, opening a screen, applying a filter.
- Tool: [React DevTools Profiler](guides/react-dev-tools-profiler.md)
- Do:
  1. Record the slow action.
  2. Open the slowest commit. In the overview chart, a taller bar is a slower render.
  3. Click a component in the flamegraph. There, a wider bar means more time.
  4. Read why it rendered.
- Done when: you can name the component and the reason.

### 2. Render count is not the cost [High]

- What: a re-render is a problem only if it takes time.
- Do: compare the render time with the time the component spends inside.
- Done when: you can quote a number, not a feeling.

## B. Fix renders

### 3. Unstable props [High], a code smell

- What "unstable prop" means: a prop that is a new object every render.
  React compares identity, not content. A new object each time looks like a change, so memo cannot work.
- Smell: a function or object written inline in JSX, passed to a component.
  Examples: `onClick={() => ...}`, `style={{...}}`.
- Fix, in order:
  1. Hoist: move the value out of the component. Put it at the top of the file, or in the parent.
  2. Use [useCallback](https://react.dev/reference/react/useCallback) for functions.
  3. Use [useMemo](https://react.dev/reference/react/useMemo) for computed values.
  4. Or turn on [React Compiler](https://react.dev/learn/react-compiler) and let it do this for you.
- Verify: `why-did-you-render` goes quiet. React Scan shows no red flash on that component. See [why-did-you-render guide](guides/why-did-you-render.md).

### 4. Memo at the boundary [Medium]

- What a boundary means: the edge of a subtree you want to stop re-rendering.
- Do: wrap only expensive subtrees that get changed props.
- Do not: wrap every component.
- Verify: render count drops where it matters, and the page still behaves.

### 5. Context re-renders every consumer [Medium]

- What a consumer means: any component that reads the context.
- What happens: when the context value changes, every consumer re-renders.
- Fix:
  1. Move state down: put [useState](https://react.dev/reference/react/useState) in the component that uses the data, not at the top.
  2. Split the context: separate data from actions into two context providers.
- Verify: in the Profiler, a sibling consumer no longer re-renders.

### 6. Keys must be stable [High], a code smell

- Smell: `key={index}` in a list that can reorder or filter.
- Why: the index moves between items, so React rebuilds the wrong rows.
- How to create a stable id:
  1. Use the id from your database, if the item has one.
  2. If not, create one at item creation with `crypto.randomUUID()` and keep it.
- Unexpected remount: the input loses focus, the state resets, the scroll jumps.
- Verify: no remounts in the Profiler after a reorder.

### 7. Heavy work in render [High], a code smell

- What heavy work means: sorting, filtering, formatting, or parsing that runs during render.
- Smell: a loop or a big `.filter()` or `.sort()` in the component body.
- Where to move it:
  1. Into `useMemo` if the result repeats for the same inputs.
  2. Into an event handler, an effect, or a web worker if it runs once.
  3. Into the build step if the result never changes.
- Long lists: render only the visible rows with [react-window](https://react-window.vercel.app/) (virtualization).
- Verify: the flamegraph gets shorter. Typing stays smooth.

## C. Load time

### 8. Split the code [High]

- What: load a route or a heavy component only when the user opens it.
- Do: use [React.lazy](https://react.dev/reference/react/lazy) and [Suspense](https://react.dev/reference/react/Suspense) around routes.
- Verify: the first load downloads fewer bytes.

### 9. Shrink the bundle [Medium]

- What tree-shaking means: the build removes code you never use.
- Do: check what is in the bundle with [vite-bundle-visualizer](https://www.npmjs.com/package/vite-bundle-visualizer) or [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer). Remove or replace big packages. Use per-package imports.
- Verify: the bundle picture gets smaller.

### 10. Images and fonts [Medium]

- What lazy loading means: the image loads only when it is near the screen.
- Do: add `loading="lazy"` to images below the fold. Add `sizes`. Preload the critical font.
- Verify: LCP and CLS improve. See [lighthouse guide](guides/lighthouse.md).

## D. What users feel

### 11. Core Web Vitals [Medium]

Spell out the acronyms, because the interviewer will say them anyway:

- LCP: Largest Contentful Paint. When the main content appears. Target: under 2.5 seconds.
- INP: Interaction to Next Paint. How fast the page answers a click. Target: under 200 ms.
- CLS: Cumulative Layout Shift. How much the page jumps. Target: under 0.1.

- Do: track them with [web-vitals](https://www.npmjs.com/package/web-vitals). Set budgets in [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci).

### 12. Long tasks [Medium]

- What a long task means: work on the main thread that blocks the screen for a moment.
- How to see one: open the Chrome Performance panel, record an interaction, read the block of red or dark time above the line.
- Fix: move the work out of the event handler or effect. Defer what is not urgent.
- Verify: the blocking time drops, and INP follows.

## E. Guard rails

### 13. Lint with autofix [High]

- What a linter does: checks the code as you write it.
- Do: turn on [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) and [eslint-plugin-react-compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler). The config is in this repo: `eslint.config.js`.
- Verify: the red squiggles have a quick-fix.

### 14. React Compiler [Medium]

- What: a build-time tool that adds memoization for you.
- Verify: the Profiler shows fewer re-renders with no manual memo code.

### 15. Perf tests [Medium]

- Do: write a test that fails when a component re-renders for no reason. See `test/perf-regression.test.jsx` in this repo.
- Verify: the test goes red on a regression, green after the fix.

### 16. CI gates [Medium]

- What CI means: checks that run automatically on every push.
- Do: run lint and tests. Add Lighthouse CI budgets. Add [React Doctor](https://react.doctor) as a required check.
- Verify: a slow change cannot merge.

## Code smells at a glance

Scan the code for these first. Each one has a fix above.

- [ ] `key={index}` in a reordering list -> item 6
- [ ] `onClick={() => ...}` or `style={{...}}` into a memoized component -> item 3
- [ ] Sorting or filtering inside the render body -> item 7
- [ ] One context holding many values -> item 5
- [ ] All routes in one bundle -> item 8
- [ ] `<img>` without `loading="lazy"` -> item 10
- [ ] Long lists rendered one row at a time -> item 7

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
