# Audit Checklist

An agent can use this checklist to audit a React codebase.
Each item has: problem, how to detect, fix, evidence to report.
Report findings by ID, for example: R-03.

## How to audit

1. Read every item.
2. Inspect the codebase against each item.
3. Produce findings only if you have evidence.
4. Do not claim a problem without evidence.
5. Report the evidence: file path, line number, or a number you measured.

## Severity

- High = fix first. Users feel it.
- Medium = fix later. Users may feel it.

## R. Rendering

### R-01 [High] Profile before changing code
- Detect: no evidence of measurement. The fix starts with guessing.
- Fix: run React Scan first (zero setup). Then open React DevTools Profiler and record the slow action.
- Evidence: name the component and the trigger (state, props, context).

### R-02 [High] Stable props
- Detect: inline object, array, or function props inside JSX passed to a memoized child. Example: `onClick={() => ...}` or `style={{...}}`. Or run React Scan and watch for repeated red flashes on unchanged input.
- Fix: hoist the value out of the component. Use useCallback or useMemo. Or enable React Compiler.
- Evidence: file:line of the inline prop. Render count before and after.

### R-03 [High] No heavy work in render
- Detect: sorting, filtering, or format work directly in the render body. Long lists rendered without virtualization.
- Fix: move the work out of render. Use useMemo for real repeat cost. Use react-window for long lists.
- Evidence: file:line. Render duration from the Profiler.

### R-04 [Medium] Memo at the boundary
- Detect: React.memo everywhere, or useMemo with trivial cost.
- Fix: keep memo on expensive subtrees only.
- Evidence: file:line of the memo. Profiler render counts.

### R-05 [Medium] Context scope
- Detect: one context object holds many values. Consumers re-render on any change.
- Fix: split contexts. Separate state from dispatch. Move state to consumers.
- Evidence: file:line of the context provider. List of re-rendering consumers.

### R-06 [Medium] Stable keys
- Detect: `key={index}` in a list that can reorder or filter.
- Fix: use a unique ID.
- Evidence: file:line of the key.

### R-07 [High] Lint rules
- Detect: no eslint-plugin-react-hooks. No eslint-plugin-react-compiler. Broken dependency arrays.
- Fix: add the plugins. Run with autofix. (See eslint.config.js in this repo.)
- Evidence: lint output before and after.

## L. Load

### L-01 [High] Code splitting
- Detect: all routes in one bundle. No React.lazy or Suspense.
- Fix: split routes and heavy components.
- Evidence: bundle size before and after. Use a bundle visualizer.

### L-02 [Medium] Bundle size
- Detect: large, heavy imports. No tree-shaking.
- Fix: remove heavy packages. Use per-package imports.
- Evidence: bundle visualizer output.

### L-03 [Medium] Images and fonts
- Detect: large images without lazy loading. No sizes attribute. Critical fonts load late.
- Fix: lazy images. Add sizes. Preload critical fonts.
- Evidence: Lighthouse LCP and CLS numbers.

## M. Metrics

### M-01 [Medium] Core Web Vitals
- Detect: no field data. No budgets in CI.
- Fix: add web-vitals. Add Lighthouse CI budgets for LCP, INP, CLS.
- Evidence: measured LCP, INP, CLS values.

### M-02 [Medium] Interaction cost
- Detect: long tasks in effects or event handlers. Slow input response.
- Fix: restructure the work. Defer non-urgent work.
- Evidence: long-task time. INP value.

## Report format

For each finding, write one line:

- [ID] [Severity] finding at file:line. evidence: <number or path>. fix: <one line>.

Then a verdict:

- The three fixes with the largest measured impact, in order.
- The one thing you would do first.
