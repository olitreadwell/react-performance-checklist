# React Performance Checklist

Plain words. Short lines. Work top to bottom.
Full definitions for every word: [glossary.md](glossary.md)
The same content lives in the README.

## Table of Contents

- [Start here](#start-here-you-do-not-know-what-is-slow)
- [A. Measure first](#a-measure-first)
- [B. Fix renders](#b-fix-renders)
- [C. Load time](#c-load-time)
- [D. What users feel](#d-what-users-feel)
- [E. Guard rails](#e-guard-rails)
- [Code smells at a glance](#code-smells-at-a-glance)
- [Tools](#tools)

## Start here: you do not know what is slow

1. Run React Doctor:

   ```bash
   npx react-doctor@latest
   ```

2. Turn on React Scan. Easiest: install the browser extension and open
   your app. Or run `npx -y react-scan@latest init` to add it to the project.

3. Run Lighthouse on the page.
4. Record the Profiler during normal use. Open the slowest render.

You now have a list of problems. Fix the High items below.

## The quick answer

"I do not guess. I measure first. I see which components re-render and what that costs. Then I fix the mechanical misses: index keys, inline props, heavy work in render. If load time is the problem, I split the code and shrink the bundle. I choose the fix, then I re-measure to prove it."

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
  import { memo, useCallback } from "react";

  const Row = memo(function Row({ onClick, style, items }) {
    return (
      <button onClick={onClick} style={style}>
        {items.join(", ")}
      </button>
    );
  });

  // Bad: a new function, a new object, and a new array every render.
  // memo sees a change every time, so it cannot help.
  function Parent() {
    return (
      <Row
        onClick={() => save()}
        style={{ color: "red" }}
        items={["a", "b"]}
      />
    );
  }

  // Good: hoist the values out. Same identity every render.
  const RED = { color: "red" };
  const ITEMS = ["a", "b"];

  function Parent() {
    const save = useCallback(() => doSave(), []);
    return <Row onClick={save} style={RED} items={ITEMS} />;
  }
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

  ```jsx
  import { memo } from "react";

  // Good: the row gets stable props. memo stops re-renders.
  const Row = memo(function Row({ item }) {
    return <li>{item.name}</li>;
  });

  function List({ items }) {
    return (
      <ul>
        {items.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </ul>
    );
  }

  // Bad: the parent passes an inline function.
  // The prop is new every render, so the memo cannot help.
  function List({ items }) {
    return (
      <ul>
        {items.map((item) => (
          <Row key={item.id} item={item} onClick={() => open(item)} />
        ))}
      </ul>
    );
  }
  ```

- Verify: Render count drops where it matters, and the page still behaves.

- 📖 [memo docs](https://react.dev/reference/react/memo)

### 5. Context re-renders every consumer [Medium]

- [ ] One big context re-renders every consumer on any change.

- State and context are not the same. State is data a component owns and re-renders on change. Context is how a provider hands any value to every component beneath it without prop drilling.
- Consumer: any component that reads the context.
- What happens: when the context value changes, every consumer re-renders.

  _Why:_
  > A consumer is any component that reads the context. When the provider hands a new value, every consumer re-renders. The value is most often state, but context can carry anything: callbacks, config, theme constants. Context does not own data; it distributes whatever the provider hands it.

  _How:_
  > - Move state down to the component that uses it.
  > - Split one big context into smaller ones. Separate data from actions.

  ```jsx
  import { createContext, useContext, useState } from "react";

  // Before: one context holds everything.
  // Any change re-renders all consumers.
  const AppContext = createContext({ user, theme, save, logout });

  // After: two contexts.
  // A theme change re-renders only theme consumers.
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

  // A consumer reads only what it needs.
  function ThemeButton() {
    const theme = useContext(ThemeContext);
    return <button className={theme}>Theme</button>;
  }
  ```

- Verify: In the Profiler, a sibling consumer no longer re-renders.

- 📖 [Context docs](https://react.dev/learn/passing-data-deeply-with-context)

### 6. Keys must be stable [High]

- [ ] `key={index}` in a list that reorders or filters.

- Unexpected remount: the component loses its state. Signs: the input loses focus while you type, a checkbox unchecks, the scroll jumps, the Profiler shows a new mount.
- How to check: type in a row's input, then reorder the list. If the input loses focus, the row remounted.

  _Why:_
  > The index moves between items, so React rebuilds the wrong rows.

  _How:_
  > - Use the database id as the key.
  > - If there is no id, create one with crypto.randomUUID() when the item is created.
  > - Signs of an unexpected remount: the input loses focus, a checkbox unchecks, the scroll jumps, the Profiler shows a new mount.

  ```jsx
  import { useState } from "react";

  // Give each item an id once, when it is created.
  const [items, setItems] = useState(() => [
    { id: crypto.randomUUID(), text: "first" },
    { id: crypto.randomUUID(), text: "second" },
  ]);

  // Add new items the same way.
  setItems((prev) => [...prev, { id: crypto.randomUUID(), text: "new" }]);

  // Bad: the index moves between items.
  // React rebuilds the wrong rows and state resets.
  {items.map((item, index) => <Row key={index} item={item} />)}

  // Good: the id stays with the item.
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

  ```jsx
  import { useMemo } from "react";

  // Bad: the sort runs on every render.
  function List({ items }) {
    const sorted = items.sort((a, b) => a.price - b.price);
    return (
      <ul>
        {sorted.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }

  // Good: the sort runs only when items change.
  function List({ items }) {
    const sorted = useMemo(
      () => [...items].sort((a, b) => a.price - b.price),
      [items]
    );
    return (
      <ul>
        {sorted.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }
  ```

- Verify: The flamegraph gets shorter. Typing stays smooth.

- 📖 [react-window](https://react-window.vercel.app/)
- 📖 [TanStack Virtual](https://tanstack.com/virtual)

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

  // Load a screen only when the user opens it.
  const Settings = lazy(() => import("./Settings"));
  const Profile = lazy(() => import("./Profile"));

  function App() {
    return (
      <Suspense fallback={<p>Loading...</p>}>
        <Settings />
        <Profile />
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

  ```js
  // Bad: imports the whole package.
  import _ from "lodash";

  // Good: imports only the function you use.
  import debounce from "lodash/debounce";
  ```

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

  ```jsx
  // Bad: every image loads on page open.
  <img src="hero.jpg" />

  // Good: below-the-fold images load only when near the screen.
  <img
    src="hero.jpg"
    loading="lazy"
    sizes="(max-width: 600px) 100vw, 50vw"
  />
  ```

- Verify: LCP and CLS improve in Lighthouse.

- 🛠 [Lighthouse guide](guides/lighthouse.md)
- 📖 [react-intersection-observer](https://github.com/thebuilder/react-intersection-observer)

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

  ```jsx
  // Bad: the click handler blocks the page.
  function onClick() {
    const rows = [];
    for (let i = 0; i < 100000; i++) {
      rows.push(heavyWork(i));
    }
    setRows(rows);
  }

  // Good: chunk the work so the page stays responsive.
  function onClick() {
    const rows = [];
    let i = 0;
    function nextChunk() {
      const end = Math.min(i + 1000, 100000);
      for (; i < end; i++) {
        rows.push(heavyWork(i));
      }
      setRows([...rows]);
      if (i < 100000) {
        setTimeout(nextChunk, 0);
      }
    }
    nextChunk();
  }
  ```

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

  ```js
  // eslint.config.js
  import reactHooks from "eslint-plugin-react-hooks";
  import reactCompiler from "eslint-plugin-react-compiler";

  export default [
    {
      plugins: {
        "react-hooks": reactHooks,
        "react-compiler": reactCompiler,
      },
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
        "react-compiler/react-compiler": "error",
      },
    },
  ];
  ```

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

  ```jsx
  // test/perf-regression.test.jsx
  import { fireEvent, render } from "@testing-library/react";
  import { memo, useCallback, useState } from "react";
  import { expect, it, vi } from "vitest";

  const renderRow = vi.fn(({ onClick }) => (
    <button onClick={onClick}>bump</button>
  ));
  const Row = memo(renderRow);

  it("keeps the memoized row still when the callback is stable", () => {
    function Parent() {
      const [, setCount] = useState(0);
      const bump = useCallback(() => setCount((c) => c + 1), []);
      return <Row onClick={bump} />;
    }

    render(<Parent />);
    fireEvent.click(document.querySelector("button"));
    expect(renderRow).toHaveBeenCalledTimes(1);
  });
  ```

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

## F. Front-end (non-React)

### 17. Image formats and sizes [Medium]

- [ ] Images in the wrong format, or one size for every screen.

- srcset: a list of image sizes. The browser picks the one that fits the screen. [Definition](glossary.md)

  _Why:_
  > A 2000px JPEG for a 300px slot costs every user download time. WebP or AVIF is smaller, and srcset serves the right size per screen.

  _How:_
  > - Serve WebP or AVIF instead of JPEG or PNG where the format is supported.
  > - Add srcset and sizes so small screens download small images.
  > - Compress the source image. Aim for the smallest file that still looks right.

  ```jsx
  // Bad: one huge image for every screen.
  <img src="hero.jpg" />

  // Good: the browser picks the size that fits.
  <img
    src="hero-800.webp"
    srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1600.webp 1600w"
    sizes="(max-width: 600px) 100vw, 50vw"
  />
  ```

- Verify: Lighthouse image audits pass, and the page downloads fewer bytes.

- 📖 [web.dev image guidance](https://web.dev/learn/images)

### 18. Font delivery [Medium]

- [ ] Fonts that block text, or load more glyphs than the page needs.

- font-display: swap: show fallback text immediately, swap in the real font when it loads. [Definition](glossary.md)

  _Why:_
  > A font that blocks first paint delays the text users came to read. font-display: swap shows fallback text first, and subsetting ships fewer bytes.

  _How:_
  > - Use font-display: swap so text shows while the font loads.
  > - Preload the font file the page needs first.
  > - Subset the font, or use a variable font, so you ship only the glyphs you use.

  ```jsx
  /* Bad: text is invisible until the font loads. */
  @font-face {
    font-family: "Body";
    src: url("/fonts/body.woff2");
  }

  /* Good: fallback text shows first, then the real font swaps in. */
  @font-face {
    font-family: "Body";
    src: url("/fonts/body.woff2");
    font-display: swap;
  }
  ```

- Verify: Lighthouse font audits pass, and text appears before the font finishes loading.

- 📖 [web.dev font best practices](https://web.dev/articles/font-best-practices)

### 19. CSS delivery [Medium]

- [ ] Render-blocking CSS, or CSS the page never uses.

- Critical CSS: the styles the first screen needs, inlined so the page paints without waiting. [Definition](glossary.md)

  _Why:_
  > CSS blocks first paint. A big stylesheet delays the first useful frame, and unused rules cost download time for nothing.

  _How:_
  > - Inline the critical CSS for the first screen.
  > - Load the rest of the CSS asynchronously.
  > - Purge unused CSS in the build.

  ```jsx
  <!-- Bad: the whole stylesheet blocks first paint. -->
  <link rel="stylesheet" href="/app.css" />

  <!-- Good: critical styles inline, the rest loads after. -->
  <style>/* critical styles for the first screen */</style>
  <link rel="stylesheet" href="/app.css" media="print" onload="this.media='all'" />
  ```

- Verify: Lighthouse render-blocking audit passes, and the first paint is faster.

- 📖 [web.dev render-blocking resources](https://web.dev/articles/render-blocking-resources)

### 20. Delivery: caching and compression [Medium]

- [ ] No compression, no cache headers, or no CDN.

- CDN: a network of servers that serves files from the one nearest the user. [Definition](glossary.md)

  _Why:_
  > Compression shrinks what travels over the network. Cache headers stop repeat visits from downloading the same bytes. A CDN puts the bytes near the user.

  _How:_
  > - Turn on gzip or brotli compression.
  > - Set cache-control headers. Long cache for hashed assets, short for HTML.
  > - Serve static assets from a CDN.

  ```jsx
  // Bad: every visit downloads the same bytes.
  Cache-Control: no-store

  // Good: hashed assets stay cached for a year.
  Cache-Control: public, max-age=31536000, immutable
  ```

- Verify: Lighthouse network audits pass, and repeat visits download fewer bytes.

- 📖 [web.dev caching guidance](https://web.dev/articles/http-cache)

### 21. Third-party scripts [Medium]

- [ ] Heavy third-party scripts that block the main thread.

- defer: download in the background, run after the page parses. [Definition](glossary.md)

  _Why:_
  > Analytics, chat widgets, and ad scripts run on the main thread. Each one competes with your app for the user's attention.

  _How:_
  > - Load third-party scripts with defer or async so they do not block first paint.
  > - Load them only on the pages that need them.
  > - Remove the ones you do not use. Self-host the ones you keep.

  ```jsx
  <!-- Bad: blocks the page while it downloads and runs. -->
  <script src="https://analytics.example.com/tracker.js"></script>

  <!-- Good: downloads in the background, runs after the page parses. -->
  <script defer src="https://analytics.example.com/tracker.js"></script>
  ```

- Verify: Lighthouse third-party audit passes, and the main thread is quieter.

- 📖 [web.dev third-party guidance](https://web.dev/articles/third-party-javascript)
- 📖 [Partytown](https://partytown.builder.io/)

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

- [ ] Images served too big for the screen -> [item 17](#17-image-formats-and-sizes-medium)

  ```jsx
  <img src="hero.jpg" />
  ```

- [ ] Heavy third-party scripts on every page -> [item 21](#21-third-party-scripts-medium)

  ```jsx
  <script src="https://analytics.example.com/tracker.js"></script>
  ```
<!-- SMELLS:END -->

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
