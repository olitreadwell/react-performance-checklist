# Walkthrough: auditing and fixing a slow React app

This is the repo's worked example. Two apps, same UI, different
performance:

- `slow-app/` — deliberately slow. Every smell from the checklist is
  planted here. Its spec tests fail (red).
- `slow-app-fixed/` — the same app after the fixes. Its spec tests pass
  (green). It ships lint, tests, size-limit, Lighthouse budgets, and a
  CI workflow, so the checks run without an agent.

The screenshots in `screenshots/` are byte-identical. That is the point:
performance fixes are invisible in a static screenshot. The difference
shows in render counts, bundle size, and network bytes.

## The app

A product catalog: 500 products, search, sort, theme toggle, cart, and a
heavy reports screen. The smells and their rules:

| Smell | Rule | File |
| --- | --- | --- |
| Filter + sort run on every render | R-07 | `src/App.jsx` |
| Inline props defeat memo | R-03 | `src/ProductList.jsx` |
| `key={index}` in a reordering list | R-06 | `src/ProductList.jsx` |
| One context holds everything | R-05 | `src/AppContext.js` |
| Heavy screen imported eagerly | L-01 | `src/App.jsx` |
| Images: no lazy loading, no srcset | L-03, F-01 | `src/ProductRow.jsx` |
| No lint config | G-01 | missing `eslint.config.js` |
| No perf tests | G-03 | missing `test/` |

## Pass 1: audit

The agent runs the tools, in order. No guessing.

```bash
cd examples/slow-app
npx react-doctor@latest
npm test
```

React Doctor (static analysis):

```text
Score: 76 / 100 Needs work
⚠ Unstable context provider value   src/App.jsx:30   (R-05)
⚠ Array index used as a key          src/ProductList.jsx:13  (R-06)
⚠ Field relies on placeholder text   src/SearchBox.jsx:7    (a11y, not perf)
```

The spec tests (runtime evidence):

```text
× typing in the search box does not re-render product rows   (R-03, R-07)
× changing the theme does not re-render product rows         (R-05)
× a focused row keeps its product after a reorder            (R-06)
× the reports screen is not in the first paint               (L-01)
× every product image has lazy loading and a srcset          (L-03, F-01)
Tests  5 failed (5)
```

React Doctor cannot see the runtime problems (R-03, R-07, L-01, L-03).
The tests can. That is why the checklist says measure first.

For the general web pass (Lighthouse, Core Web Vitals, delivery), the
agent hands off to the `web-quality-skills` agent skill instead of
reinventing it. For visual jank, it hands off to `dejank`. See the
[Hand off to existing skills](#hand-off-to-existing-skills) section in
the README.

## The report

The agent writes one line per finding, verdict first
([report-template.md](../report-template.md)):

| ID | Severity | Location | Evidence | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| R-07 | High | src/App.jsx:30 | rows re-render per keystroke | useMemo | open |
| R-03 | High | src/ProductList.jsx:16 | inline onAdd defeats memo | useCallback | open |
| R-06 | High | src/ProductList.jsx:13 | focus lost on reorder | key={id} | open |
| R-05 | Medium | src/AppContext.js:4 | theme change re-renders rows | split contexts | open |
| L-01 | High | src/App.jsx:8 | 192 kB single bundle | React.lazy | open |
| L-03 | Medium | src/ProductRow.jsx:5 | no lazy loading | loading="lazy" | open |
| F-01 | Medium | src/ProductRow.jsx:5 | no srcset | add srcset | open |
| G-01 | High | missing | no lint config | add eslint.config.js | open |
| G-03 | Medium | missing | no perf tests | add spec tests | open |

Verdict: fix R-07 first. It is the cost of every keystroke.

## Pass 2: fix, one finding at a time

Each fix: the smell, the change, why it works, and the verification.

### R-07: heavy work in render

```jsx
// Before: filter + sort run on every render, including every keystroke.
const visible = PRODUCTS.filter(...).sort(...);

// After: they run only when query or sort change.
const visible = useMemo(
  () => PRODUCTS.filter(...).sort(...),
  [query, sort],
);
```

Why: code in the component body runs on every render. `useMemo` caches
the result until an input changes. Typing no longer re-sorts 500 items.

### R-03: unstable props

```jsx
// Before: a new function every render. memo sees a change and cannot help.
<ProductRow onAdd={() => addToCart(product)} />

// After: stable identity, so memo can work.
const addToCart = useCallback((product) => {
  setCart((prev) => [...prev, product]);
}, []);
<ProductList products={visible} onAdd={addToCart} />
```

Why: React compares props by identity, not content. A stable callback
lets `memo` skip re-renders.

### R-06: stable keys

```jsx
// Before: the index moves between items, so React rebuilds the wrong rows.
{products.map((product, index) => <ProductRow key={index} ... />)}

// After: the id stays with the item, so React moves the row instead.
{products.map((product) => <ProductRow key={product.id} ... />)}
```

Why: with `key={index}`, a reorder reuses each DOM node with a different
product. Focus and state jump to the wrong row. With `key={id}`, React
moves the node, and focus stays with its product.

### R-05: context scope

```jsx
// Before: one context holds user, theme, cart, and actions.
// Any change re-renders every consumer.
const AppContext = createContext({ user, theme, cart, addToCart, ... });

// After: one small context per concern, values memoized.
const UserContext = createContext(null);
const ThemeContext = createContext(null);
const CartContext = createContext(null);
const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
```

Why: a theme change should re-render only theme consumers. Splitting the
contexts and memoizing the values stops the whole tree from re-rendering.

### L-01: code splitting

```jsx
// Before: the heavy screen ships in the first bundle.
import { Reports } from "./Reports";

// After: it loads only when opened.
const Reports = lazy(() =>
  import("./Reports").then((module) => ({ default: module.Reports })),
);
<Suspense fallback={<p>Loading reports...</p>}><Reports /></Suspense>
```

Why: the build now emits a separate `Reports` chunk. First visit
downloads less.

### L-03 + F-01: images

```jsx
// Before: every image loads on page open, one size for every screen.
<img src={product.image} alt={product.name} />

// After: below-the-fold images load lazily, at the right size.
<img
  src={product.image}
  srcSet={product.srcset}
  sizes="(max-width: 600px) 50vw, 200px"
  loading="lazy"
  alt={product.name}
/>
```

Why: `loading="lazy"` defers off-screen images. `srcset` lets the
browser pick the smallest image that fits the screen.

### G-01 + G-03: guard rails

The agent adds `eslint.config.js` (react-hooks + react-compiler, autofix)
and the spec tests. These are the guard rails that stop the smells from
coming back.

## Pass 3: re-measure

```bash
cd examples/slow-app-fixed
npm run check
npx react-doctor@latest
npx size-limit
```

```text
Tests  5 passed (5)          # was 5 failed
React Doctor: 85 / 100       # was 76 / 100
Size: 60.63 kB gzipped       # budget 300 kB
Build: main bundle + Reports chunk   # was one 192 kB bundle
Screenshots: byte-identical   # no visual regression
```

The remaining React Doctor warning is accessibility (placeholder label),
not performance. Left alone, per the checklist: fix the measured cost.

## Why the fixes happened

One sentence each:

- R-07: the sort was the cost of every keystroke. `useMemo` removed it.
- R-03: inline props made `memo` useless. Stable callbacks restored it.
- R-06: index keys made reorders rebuild rows and steal focus. IDs fixed it.
- R-05: one big context made every change re-render the whole tree.
  Small contexts scoped the damage.
- L-01: the heavy screen shipped to everyone. `lazy` shipped it on demand.
- L-03/F-01: images downloaded at full size on page open. Lazy + srcset
  cut the bytes.
- G-01/G-03: without lint and tests, the smells would silently return.

## What runs without an agent

The fixed app ships the automation, so the checks run on every push:

- `.github/workflows/check.yml` — lint, tests, build, size-limit,
  react-doctor.
- `.lighthouserc.js` — Lighthouse CI budgets for LCP, INP, CLS.
- `.size-limit.json` — 300 kB gzipped bundle budget.
- `npm run audit -- <path>` — the same scan, one command, no agent.

The agent is optional. The checks are not.
