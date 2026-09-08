# Walkthrough: every checklist item, violated then fixed

The comprehensive worked example. Two apps, same UI, opposite
performance:

- `all-smells-app/` — violates all 34 rules in this repo's checklist:
  the React rules (R), the load rules (L), the data rules (D), the
  metrics rules (M), the state rules (S), the guard rails (G), and the
  front-end rules (F, from the David Dias front-end performance
  checklist).
- `all-smells-app-fixed/` — the same app after the skill ran. Every
  problem is fixed and verified by the same tools that found it.

The skill in question is this repo's audit flow (`audit-checklist.md`,
`audit-prompt.md`, `fix-prompt.md`, the MCP tools) plus the hand-off to
`web-quality-skills` for the general web pass and to the Vercel
`react-best-practices` skill for the deep React/Next pass. It was run as
an agent would run it: measure, report, fix one at a time, re-measure.

## The smell map

Every rule, where the app violates it, and where the fix lives:

| Rule | Where it is violated | Fixed by |
| --- | --- | --- |
| R-03 Unstable props | `src/ProductList.jsx` inline `onAdd` | `useCallback` + prop |
| R-04 Memo at the boundary | `memo` on rows with unstable props | stable props make memo work |
| R-05 Context scope | `src/AppContext.js` one big context | split into user/theme/cart |
| R-06 Stable keys | `key={index}` in `ProductList` | `key={product.id}` |
| R-07 Heavy work in render | filter + sort in `App` body | `useMemo` |
| R-08 Inline components | `ProductItem` defined inside `ProductList` | move to module scope |
| L-01 Code splitting | `Reports` imported eagerly | `React.lazy` + `Suspense` |
| L-02 Bundle size | whole-package `lodash` + `moment` | removed, native JS |
| L-03 Lazy images | `<img>` without `loading` | `loading="lazy"` |
| L-05 Barrel imports | `ProductRow` imports from `./lib` index | import from `./lib/format` |
| D-01 Parallel fetches | `src/Stats.jsx` sequential awaits | `Promise.all` |
| D-03 Cheap condition before await | `Stats` awaits a remote gate first | check `open` before fetching |
| M-01 Core Web Vitals | no tracking, no budgets | `web-vitals` + CI budgets |
| M-02 Long tasks | 200k-row synchronous export | chunked with `setTimeout` |
| S-01 Store selectors | `ViewCounter` subscribes whole store | `useStore((s) => s.syncCount)` |
| S-02 Derive during render | `Header` computes cart total in an effect | compute in render |
| G-01 Lint | no `eslint.config.js` | added, autofix on |
| G-02 React Compiler | not enabled | `babel-plugin-react-compiler` |
| G-03 Perf tests | no tests | spec tests (red/green) |
| G-04 CI gates | no workflow | `.github/workflows/check.yml` |
| F-01 Image formats and sizes | remote photos, no srcset | local SVG + srcset |
| F-02 Font delivery | blocking Google Fonts, no swap | preconnect + `display=swap` |
| F-03 CSS delivery | render-blocking stylesheet, unused CSS | inline critical CSS + async load |
| F-04 Delivery | no cache headers, no compression | `server.mjs` artifact + CDN note |
| F-05 Third-party scripts | blocking analytics + chat scripts | `defer` |
| L-04 Preload/preconnect | no early connections | font preconnect in F-02 fix |
| R-01 Measure first | no evidence before changing | this walkthrough is the evidence |
| R-02 Render count is not cost | no measurements | the spec tests quote counts |

Some rules are context-dependent, so they are guidance, not a demo:
`R-09` debounce (the search is cheap after R-07), `D-02` cache/dedupe
(no duplicate fetches in the app), `M-03` field data (production-only),
`M-04` effect cleanup (no leaking listeners), `S-03` lazy init (trivial
initializers), `S-04` transitions (no blocking updates left). Each rule
entry explains when to apply it.

## Metrics before (all-smells-app)

```text
React Doctor   62 / 100, 14 issues (moment, lodash, index key, context,
               inline component, whole-store subscribe, ...)
Spec tests     15 failed
Size limit     107.10 kB gzipped > 100 kB budget   FAIL
Lighthouse     perf 76 | LCP 4.5 s (one run 13.7 s) | FCP 2.2 s
               TBT 260 ms | 9.3 MB (remote images)
               byte-weight budget FAIL (9.7 MB > 1.5 MB)
```

## The report

The agent's findings (report format: verdict first, one line per
finding, evidence, fix):

| ID | Severity | Location | Evidence | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| L-01 | High | src/App.jsx | heavy screen in first bundle | React.lazy | open |
| L-02 | High | src/Reports.jsx | 107 kB gzip, moment+lodash | remove both | open |
| R-07 | High | src/App.jsx | rows re-render per keystroke | useMemo | open |
| R-03 | High | src/ProductList.jsx | inline onAdd defeats memo | useCallback | open |
| R-08 | High | src/ProductList.jsx | inline component remounts rows | module scope | open |
| R-06 | High | src/ProductList.jsx | focus lost on reorder | key={id} | open |
| D-01 | High | src/Stats.jsx | sequential round trips | Promise.all | open |
| D-03 | Medium | src/Stats.jsx | request fires while closed | check `open` first | open |
| S-01 | Medium | src/ViewCounter.jsx | re-renders on any store change | selector | open |
| S-02 | Medium | src/Header.jsx | double render per cart change | derive in render | open |
| L-05 | Medium | src/ProductRow.jsx | barrel index import | exact module | open |
| M-02 | Medium | src/App.jsx | export blocks the main thread | chunk it | open |
| F-01 | Medium | src/ProductRow.jsx | remote images, no srcset | local + srcset | open |
| F-02 | Medium | index.html | blocking font, no swap | preconnect + swap | open |
| F-03 | Medium | index.html | blocking CSS, unused rules | inline + async | open |
| F-05 | Medium | index.html | blocking scripts | defer | open |
| G-01 | High | missing | no lint config | add config | open |
| G-03 | Medium | missing | no perf tests | add spec tests | open |

Verdict: fix L-01/L-02 and F-01 first. They are the measured cost of
first load (9.3 MB, 4.5-13.7 s LCP).

## Metrics after (all-smells-app-fixed)

```text
React Doctor   100 / 100, 0 issues
Spec tests     15 passed
Size limit     61.75 kB gzipped < 100 kB budget   PASS
Lint           clean
Lighthouse     perf 99 | LCP 2.0 s | FCP 1.4 s | TBT 50 ms | 65 KiB
               all budgets PASS (INP warning: needs interaction)
```

## Every problem checked as fixed

| Rule | Before | After | Status |
| --- | --- | --- | --- |
| R-03 | row re-renders per keystroke | 0 extra row renders | fixed |
| R-04 | memo defeated by new props | memo holds | fixed |
| R-05 | theme change re-renders rows | rows stay still | fixed |
| R-06 | focused row changes on sort | focus stays with product | fixed |
| R-07 | sort runs per render | sort runs on change only | fixed |
| R-08 | rows remount every render | same row type, no remounts | fixed |
| L-01 | 1 bundle, Reports inside | separate Reports chunk | fixed |
| L-02 | 107.10 kB gzipped | 61.75 kB gzipped | fixed |
| L-03 | images load on open | lazy | fixed |
| L-05 | barrel index import | exact module import | fixed |
| D-01 | sequential round trips | both requests start together | fixed |
| D-03 | request when panel closed | zero requests while closed | fixed |
| M-01 | no field data | web-vitals reports LCP/INP/CLS | fixed |
| M-02 | synchronous 200k loop | chunked via setTimeout | fixed |
| S-01 | re-renders on any store change | one render per slice change | fixed |
| S-02 | two renders per cart change | one render | fixed |
| G-01 | no lint | `npm run lint` clean | fixed |
| G-02 | no compiler | compiler on in build | fixed |
| G-03 | no tests | 15 spec tests, red on slow / green on fixed | fixed |
| G-04 | no CI | workflow: lint, test, build, size, doctor | fixed |
| F-01 | 9.3 MB remote images | 65 KiB local images, srcset | fixed |
| F-02 | blocking font, no swap | preconnect + display=swap | fixed |
| F-03 | blocking CSS, unused rules | critical CSS inline, async rest | fixed |
| F-04 | no cache headers | `server.mjs` (gzip + cache) shipped | fixed* |
| F-05 | blocking scripts | deferred | fixed |

`F-04` is server infrastructure: the fixed app ships `server.mjs`, a
plain Node static server with gzip and cache headers, and the docs note
the CDN. A static host cannot demonstrate headers in a screenshot.

## The screenshots

`screenshots/all-smells-before.png` and `screenshots/all-smells-after.png`.
Same layout. The visible difference is the image content (remote photos
vs local placeholders, the F-01 fix). The render, bundle, and network
fixes are invisible in a static shot — the numbers above are the proof.

## What the skill did, in order

1. Measured: react-doctor, spec tests, size-limit, Lighthouse CI.
2. Reported: one line per finding, verdict first.
3. Fixed one finding at a time; lint and tests after each.
4. Re-measured with the same tools. The numbers moved:

```text
React Doctor   62 -> 100
Spec tests     15 failed -> 15 passed
Size limit     107.10 kB -> 61.75 kB gzipped
Lighthouse     LCP 4.5 s -> 2.0 s | 9.3 MB -> 65 KiB
```

The general web pass (fonts, CSS, delivery, third-party) handed off to
the `web-quality-skills` agent skill; the deeper patterns came from the
Vercel `react-best-practices` skill (`async-parallel`,
`cheap-condition-before-await`, `barrel-imports`, `store-selectors`).
Nothing was invented that already existed.

## Run it yourself

```bash
cd examples/all-smells-app
npm install
npm test          # red: 15 failed
npx size-limit    # FAIL

cd ../all-smells-app-fixed
npm install
npm run check     # green: lint + 15 passed
npx size-limit    # PASS
npx @lhci/cli autorun   # Lighthouse budgets (needs `npm run preview` first)
```

The fixed app's CI workflow runs lint, tests, build, size-limit, and
React Doctor on every push. Lighthouse CI runs from `.lighthouserc.cjs`.
