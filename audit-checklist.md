# Audit Checklist

An agent can use this checklist to audit a React codebase.
Each item has: problem, how to detect, fix, evidence to report.
Rule IDs match `rules/rules.json`. Read the full rule for the why
and code examples, then report findings by ID, for example: R-03.
## How to audit

1. Read every item.
2. Inspect the codebase against each item.
3. Produce findings only if you have evidence.
4. Do not claim a problem without evidence.
5. Report the evidence: file path, line number, or a number you measured.
6. Run `npx react-doctor@latest` in the target. Use its warnings as evidence. Do not invent findings it already proved.
7. Hand the general web pass (images, fonts, delivery, third-party) to
   `web-quality-skills`; the deep React/Next pass to the Vercel
   `react-best-practices` skill. Do not write a new scanner.
## Severity

- High = fix first. Users feel it.
- Medium = fix later. Users may feel it.
## R. Measure
### R-01 [High] Profile before you change code
- Detect: no evidence of measurement. The fix starts with guessing.
- Fix: run React Scan first (zero setup). Then open React DevTools Profiler and record the slow action.
- Evidence: name the component and the trigger (state, props, context), with Profiler numbers.
### R-02 [High] Render count is not the cost
- Detect: fixing render counts without measuring render duration.
- Fix: measure the slow commit in the Profiler before deciding what to change.
- Evidence: render duration before and after, not just counts.
## R. Rendering
### R-03 [High] Unstable props
- Detect: inline object, array, or function props inside JSX passed to a memoized child. Example: `onClick={() => ...}` or `style={{...}}`. Or run React Scan and watch for repeated red flashes on unchanged input.
- Fix: hoist the value out of the component. Use useCallback or useMemo. Or enable React Compiler.
- Evidence: file:line of the inline prop. Render count before and after.
### R-04 [Medium] Memo at the boundary
- Detect: React.memo everywhere, or useMemo with trivial cost.
- Fix: keep memo on expensive subtrees only.
- Evidence: file:line of the memo. Profiler render counts.
### R-05 [Medium] Context re-renders every consumer
- Detect: one context object holds many values. Consumers re-render on any change.
- Fix: split contexts. Separate state from dispatch. Move state to consumers.
- Evidence: file:line of the context provider. List of re-rendering consumers.
### R-06 [High] Keys must be stable
- Detect: `key={index}` in a list that can reorder or filter.
- Fix: use a unique ID.
- Evidence: file:line of the key.
### R-07 [High] Heavy work in render
- Detect: sorting, filtering, or format work directly in the render body. Long lists rendered without virtualization.
- Fix: move the work out of render. Use useMemo for real repeat cost. Use react-window for long lists.
- Evidence: file:line. Render duration from the Profiler.
### R-08 [High] Inline components
- Detect: a function, const, or arrow component declared inside the render body of another component.
- Fix: move the component to module scope. Pass props instead of closing over local values.
- Evidence: file:line. The Profiler shows no remount when the parent re-renders.
### R-09 [Medium] Debounce high-frequency input
- Detect: a state update or fetch on every keystroke, scroll, or resize event.
- Fix: debounce search 150-300 ms. Throttle scroll and resize to once per frame. Add `{ passive: true }` to scroll, wheel, and touch listeners.
- Evidence: the Profiler shows one render per pause. The network tab shows one query per pause.
## L. Load
### L-01 [High] Split the code
- Detect: all routes in one bundle. No React.lazy or Suspense.
- Fix: split routes and heavy components.
- Evidence: bundle size before and after. Use a bundle visualizer.
### L-02 [Medium] Shrink the bundle
- Detect: large, heavy imports. No tree-shaking.
- Fix: remove heavy packages. Use per-package imports.
- Evidence: bundle visualizer output.
### L-03 [Medium] Images and fonts
- Detect: large images without lazy loading. No sizes attribute. Critical fonts load late.
- Fix: lazy images. Add sizes. Preload critical fonts.
- Evidence: Lighthouse LCP and CLS numbers.
### L-04 [Medium] Preload and preconnect
- Detect: the LCP resource is discovered only when the parser reaches it. No preconnect to origins the page needs early.
- Fix: preload the LCP resource. Preconnect to font CDNs. Prefetch links the user will likely click next.
- Evidence: Lighthouse resource-hint audits pass. LCP improves.
### L-05 [Medium] Barrel imports
- Detect: imports from a package or folder index instead of the exact module path.
- Fix: import the exact subpath. Use the bundler's optimizePackageImports for large libraries.
- Evidence: the bundle visualizer no longer shows the whole library for one import.
## D. Data and network
### D-01 [High] Parallel independent fetches
- Detect: sequential awaits for independent requests. Example: `const a = await fetchA(); const b = await fetchB();`.
- Fix: run independent fetches with Promise.all. Start shared promises early. Check cheap conditions before awaiting (see D-03).
- Evidence: the network tab shows the fetches overlapping. Total wait drops to the slowest one.
### D-02 [Medium] Cache and dedupe data fetching
- Detect: the same request fires again and again, or every mount refetches.
- Fix: use TanStack Query or SWR. Set staleTime. Cache the promise by key when fetching by hand.
- Evidence: the network tab shows one request for N callers.
### D-03 [Medium] Check cheap conditions before await
- Detect: an await runs before a cheap local condition that could avoid the request.
- Fix: check cheap synchronous conditions first. Keep the order when the local check is expensive or depends on the fetched value.
- Evidence: the network tab shows zero requests when the local check fails.
## M. Metrics
### M-01 [Medium] Core Web Vitals
- Detect: no field data. No budgets in CI.
- Fix: add web-vitals. Add Lighthouse CI budgets for LCP, INP, CLS.
- Evidence: measured LCP, INP, CLS values.
### M-02 [Medium] Long tasks
- Detect: long tasks in effects or event handlers. Slow input response.
- Fix: restructure the work. Defer non-urgent work. Chunk large loops.
- Evidence: long-task time. INP value.
### M-03 [Medium] Field data over lab scores
- Detect: decisions based only on lab scores, or a lab score gamed for its own sake.
- Fix: collect field data with web-vitals. Check CrUX. Set CI thresholds slightly below production targets.
- Evidence: a budget change justified by field data, not just the lab score.
### M-04 [Medium] Effect cleanup and memory
- Detect: listeners, timers, or subscriptions that outlive their component. No cleanup function.
- Fix: return a cleanup from every effect that subscribes or schedules. Remove window and document listeners.
- Evidence: two heap snapshots of the same page show no growth.
## G. Guard rails
### G-01 [High] Lint with autofix
- Detect: no eslint-plugin-react-hooks. No eslint-plugin-react-compiler. Broken dependency arrays.
- Fix: add the plugins. Run with autofix. (See eslint.config.js in this repo.)
- Evidence: lint output before and after.
### G-02 [Medium] React Compiler
- Detect: manual memoization everywhere, no compiler.
- Fix: enable babel-plugin-react-compiler on React 19.
- Evidence: Profiler render counts before and after.
### G-03 [Medium] Perf tests
- Detect: no test that fails when a component re-renders for no reason.
- Fix: write a call-count test. (See test/perf-regression.test.jsx in this repo.)
- Evidence: the test goes red on a regression, green after the fix.
### G-04 [Medium] CI gates
- Detect: no CI, or CI that runs only lint and tests.
- Fix: add Lighthouse CI budgets. Add React Doctor as a required check.
- Evidence: a slow change cannot merge.
## F. Front-end (non-React)
### F-01 [Medium] Image formats and sizes
- Detect: images in the wrong format, or one size for every screen. No srcset.
- Fix: serve WebP or AVIF. Add srcset and sizes. Compress the source.
- Evidence: Lighthouse image audits. Bytes downloaded before and after.
### F-02 [Medium] Font delivery
- Detect: fonts that block text, or load more glyphs than the page needs.
- Fix: font-display: swap. Preload the first font. Subset or use a variable font.
- Evidence: Lighthouse font audits. Time to visible text.
### F-03 [Medium] CSS delivery
- Detect: render-blocking CSS, or CSS the page never uses.
- Fix: inline critical CSS. Load the rest asynchronously. Purge unused CSS.
- Evidence: Lighthouse render-blocking audit. First paint time.
### F-04 [Medium] Delivery: caching and compression
- Detect: no compression, no cache headers, or no CDN.
- Fix: turn on gzip or brotli. Set cache-control headers. Serve static assets from a CDN.
- Evidence: Lighthouse network audits. Repeat-visit bytes.
### F-05 [Medium] Third-party scripts
- Detect: heavy third-party scripts on every page, blocking the main thread.
- Fix: defer or async. Load only where needed. Remove or self-host.
- Evidence: Lighthouse third-party audit. Main-thread time.
## S. State
### S-01 [Medium] Store selectors
- Detect: subscribing to more state than the component uses. Example: `const state = useStore()`.
- Fix: select the slice. Subscribe to derived booleans, not raw values.
- Evidence: the Profiler shows one re-render per slice change, not per store change.
### S-02 [Medium] Derive during render, not in effects
- Detect: derived values computed in useEffect, then setState.
- Fix: compute in the render body, or useMemo for expensive work. Adjust state during render only when a prop changed.
- Evidence: the Profiler shows one render instead of two for the same change.
### S-03 [Medium] Lazy state initialization
- Detect: useState with an expensive expression: JSON.parse, localStorage reads, big computation.
- Fix: pass a function to useState. It runs once, on first render.
- Evidence: the expensive code runs once per mount, not per render.
### S-04 [Medium] Transitions for non-urgent updates
- Detect: expensive updates at full priority block input.
- Fix: keep the input update urgent, wrap the list update in startTransition. Use useDeferredValue for the value that drives the expensive render.
- Evidence: typing stays responsive while the list catches up. INP improves.
## Report format

For each finding, write one line:

- [ID] [Severity] finding at file:line. evidence: <number or path>. fix: <one line>.

Then a verdict:

- The three fixes with the largest measured impact, in order.
- The one thing you would do first.
