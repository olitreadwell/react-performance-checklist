# React Performance Checklist

One page. Short sentences. No shame.
Works at work and in interviews.
Use with: README.md (tools and references).

## Low-spoons mode

- If you have low energy, read only this page.
- You do not need to memorize anything.
- You may look at this page while you work. Notes are normal.
- Senior engineers keep checklists too.
- If you forget a tool name, say what the tool does. Names come second.
- One clear answer is better than a perfect answer.

## The quick answer

(Say this when someone reports a slow app.)

"I do not guess. I measure first. I open the React DevTools Profiler and see why each component renders. Then I check the lint rules and why-did-you-render for mechanical misses. If load time is the problem, I split the code and shrink the bundle. Tools show the problem. I choose the fix."

## The order

1. Measure. 2. See the cost. 3. Fix one thing. 4. Measure again.

## A. Measure first

1. **Profile before you change code [High]**
   Why: you cannot fix what you cannot see.
   Tool: React DevTools Profiler.
   Do: record the slow action. Open the slowest commit. Click a component. Read why it rendered.
   Done when: you can name the component and the trigger.

2. **Render count is not the cost [High]**
   Why: a re-render is a problem only if it takes time.
   Tool: Profiler. Compare actualDuration and baseDuration.
   Do: find the cost, not the count.
   Done when: you can quote a number.

## B. Fix renders

3. **Stable props matter [High]**
   Why: inline objects and functions get new identity each render. memo sees a new prop and renders again.
   Tool: React Scan (zero setup) or why-did-you-render.
   Fix: hoist values out of the component. Use useCallback or useMemo. Or enable React Compiler.
   Think: a new business card every second. Same words, new card. memo compares the card.
   Done when: why-did-you-render is quiet.

4. **Memo at the boundary [Medium]**
   Fix: wrap only expensive subtrees that get unstable props.
   Tool: Profiler render counts.

5. **Context re-renders everyone [Medium]**
   Fix: split context. Move state down to its consumers.
   Tool: Profiler. See which consumers re-render.

6. **Keys must be stable [Medium]**
   Fix: use IDs as keys, not the array index.
   Tool: Profiler. Look for unexpected remounts.

7. **No heavy work in render [High]**
   Fix: move work out of render. Use useMemo when the cost is real. Use react-window for long lists.
   Tool: Profiler flamegraph. Chrome Performance panel.

## C. Load time

8. **Split the code [High]**
   Fix: use React.lazy and Suspense on routes.
   Tool: bundle visualizer. Lighthouse.
   Think: download one episode, not the whole season.

9. **Shrink the bundle [Medium]**
   Fix: remove heavy packages. Use tree-shaking.
   Tool: vite-bundle-visualizer or webpack-bundle-analyzer.

10. **Images and fonts [Medium]**
    Fix: lazy images, sizes attribute, preload critical fonts.
    Tool: Lighthouse. Watch LCP and CLS.

## D. What users feel

11. **Core Web Vitals [Medium]**
    Fix: track LCP, INP, CLS in production. Set budgets in CI.
    Tool: web-vitals. Lighthouse CI.

12. **INP [Medium]**
    Fix: find long tasks in effects and event handlers. Restructure them.
    Tool: Chrome Performance panel.
    Target: INP below 200 ms.

## E. Guard rails

13. **Lint with autofix [High]**
    Tool: eslint-plugin-react-hooks. eslint-plugin-react-compiler. Biome with --write.

14. **React Compiler [Medium]**
    Tool: babel-plugin-react-compiler. It writes memoization for you.

15. **Perf tests [Medium]**
    Tool: test/perf-regression.test.jsx in this repo. React.Profiler.

## Each tool, one concept

- Profiler -> why a component rendered, and its cost
- React Scan -> hot re-renders, zero setup
- why-did-you-render -> unstable props
- hooks / compiler lint -> bad dependency arrays
- React Compiler -> memoization done by the build
- bundle visualizer -> what you ship
- Lighthouse / web-vitals -> what users feel

## The fix is one of six moves

1. Stop doing the work.
2. Move the work.
3. Memoize a boundary.
4. Split the context.
5. Load less.
6. Virtualize the list.

## References

All links are in README.md under "Tools and references".
