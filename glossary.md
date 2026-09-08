# Glossary

Plain meanings for the words in this repo.
For English as a second language. For brains that need low noise.

Read five entries a day. You do not need to memorize them.
Terms with a link open the official documentation.

## Basics

| Term | Meaning | Example |
| --- | --- | --- |
| [Component](https://react.dev/learn/your-first-component) | A piece of the screen that React builds and updates. | "The button is one component." |
| [Props](https://react.dev/learn/passing-props-to-a-component) | Data you pass into a component from outside. | "The button color comes from props." |
| [State](https://react.dev/learn/state-a-components-memory) | Data that a component owns and can change. | "The count is state. Clicking raises it." |
| [Hook](https://react.dev/reference/react) | A function that adds a React feature, like state. Hooks let a plain function use state. Before hooks, you needed a class. | "useState is a hook." |
| [useState](https://react.dev/reference/react/useState) | The hook that gives a component memory. | "useState(0) starts the count at zero." |
| [useCallback](https://react.dev/reference/react/useCallback) | The hook that keeps a function the same between renders. | "useCallback keeps the click handler stable." |
| [useMemo](https://react.dev/reference/react/useMemo) | The hook that saves a computed result. | "useMemo saves the filtered list." |
| [Dependency array](https://react.dev/reference/react/useMemo) | The list in a hook that says when to re-run. | "useMemo re-runs when items change." |
| [Key](https://react.dev/learn/rendering-lists) | A label React uses to tell list items apart. | "The key is the item id, not the index." |
| [Context](https://react.dev/learn/passing-data-deeply-with-context) | A specific React mechanism: a provider hands any value to every component beneath it that reads it. The value can be state, but it does not have to be. | "The theme lives in context." |
| Context provider | The component that hands a value down to every consumer. | "Wrap the app in the provider." |
| Consumer | A component that reads context. | "Every consumer re-renders when context changes." |
| Prop drilling | Passing props down through many levels by hand. | "Context reduces prop drilling." |
| Interaction | A click, a keypress, or a scroll. | "INP measures one interaction." |
| Handler | The function that runs when an interaction happens. | "The click handler sorts the list." |

## Rendering

| Term | Meaning | Example |
| --- | --- | --- |
| [Render](https://react.dev/learn/render-and-commit) | React builds the screen from state. | "The first render shows the empty list." |
| Re-render | React builds the screen again. | "Each keystroke re-renders the list." |
| [Memo](https://react.dev/reference/react/memo) | Code that stops an unnecessary re-render. | "memo keeps the row still when props are the same." |
| [Memoization](https://developer.mozilla.org/en-US/docs/Glossary/Memoization) | Saving a result so you do not compute it again. | "useMemo saves the filtered list." |
| Inline function | A function written inside the JSX. New every render. | "onClick={() => ...} is a new function each render." |
| Identity | Whether two values are the same object. | "memo compares identity, not the words." |
| Stable props | Props that keep the same identity between renders. | "Stable props let memo do its job." |
| Heavy work in render | Slow math or sorting done while building the screen. | "Filtering 10,000 rows inside render is heavy." |
| [Reconciliation](https://react.dev/learn/render-and-commit) | React comparing the old screen with the new one. | "Keys help reconciliation keep rows." |
| [Commit](https://react.dev/learn/render-and-commit) | The moment React applies a finished render to the screen. | "The Profiler shows each commit." |
| Flamegraph | A chart of where time goes during a render. Wider bars mean more time. | "The wide bar is the slow component." |
| [Virtualization](https://react-window.vercel.app/) | Rendering only the visible rows of a long list. | "react-window does virtualization." |
| Subtree | A component and everything it renders. | "The list row and its children are one subtree." |
| Boundary | The component you wrap with memo. Re-renders stop there. | "memo on the row is the boundary." |
| Remount | React destroying a component and building it again. | "A remount clears the input." |
| Debounce | Run an update after a pause in events. | "Debounce the search so it queries after you stop typing." |
| Throttle | Run an update at most once per time window. | "Throttle the scroll handler to once per frame." |
| Selector | A function that picks the slice of state a component reads. | "useStore((state) => state.count) subscribes to one slice." |
| [startTransition](https://react.dev/reference/react/startTransition) | Mark an update as non-urgent. | "startTransition keeps typing responsive while the list filters." |
| [useDeferredValue](https://react.dev/reference/react/useDeferredValue) | Defer a value, not a whole update. | "useDeferredValue delays the heavy list render." |
| Cleanup | The function an effect returns, run before the next effect or unmount. | "The cleanup removes the window listener." |

## Load time

| Term | Meaning | Example |
| --- | --- | --- |
| [Bundle](https://developer.mozilla.org/en-US/docs/Glossary/Bundle) | All the JavaScript you send to the user. | "The bundle is 2 MB." |
| [Bundler](https://developer.mozilla.org/en-US/docs/Glossary/Bundler) | The tool that builds the bundle. Examples: Vite, webpack. | "Vite builds the bundle." |
| [Code splitting](https://react.dev/reference/react/lazy) | Loading code only when a route needs it. | "React.lazy splits the settings page." |
| Lazy loading | Waiting to load something until it is needed. | "Images below the fold load lazily." |
| [Tree-shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) | Removing code you never use from the bundle. | "Tree-shaking drops unused functions." |
| [Hydration](https://react.dev/reference/react-dom/client/hydrateRoot) | The browser attaching React to HTML the server sent. | "Hydration runs once on load." |
| [srcset](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) | A list of image sizes. The browser picks the one that fits the screen. | "srcset sends a small image to a phone." |
| [font-display: swap](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) | Show fallback text immediately, swap in the real font when it loads. | "font-display: swap stops invisible text." |
| Critical CSS | The styles the first screen needs, inlined so the page paints without waiting. | "Critical CSS is in the HTML head." |
| [CDN](https://developer.mozilla.org/en-US/docs/Glossary/CDN) | A network of servers that serves files from the one nearest the user. | "The CDN serves the file from Auckland." |
| [defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/defer) | Download in the background, run after the page parses. | "defer keeps the script off the critical path." |
| Waterfall | Requests that run one after another because each waits for the one before. | "Three awaits make a waterfall." |
| [Preload](https://web.dev/articles/uses-rel-preload) | Start downloading a critical resource before the parser needs it. | "Preload the LCP image." |
| [Preconnect](https://web.dev/articles/uses-rel-preconnect) | Open a connection to an origin before it is needed. | "Preconnect to the font CDN." |
| Barrel file | An index file that re-exports many modules. | "Importing from the barrel loads modules you never use." |
| Dedupe | Two callers of the same key share one request. | "SWR dedupes the fetch for both rows." |
| staleTime | How long cached data counts as fresh. | "A one-minute staleTime stops refetching on every mount." |

## Numbers people measure

| Term | Meaning | Example |
| --- | --- | --- |
| [LCP](https://web.dev/articles/vitals) | Largest Contentful Paint. When the main content appears. | "LCP under 2.5 s is good." |
| [INP](https://web.dev/articles/vitals) | Interaction to Next Paint. How fast the page answers a click. | "INP below 200 ms feels fast." |
| [CLS](https://web.dev/articles/vitals) | Cumulative Layout Shift. How much the page jumps. | "CLS under 0.1 is good." |
| [Long task](https://web.dev/articles/optimize-long-tasks) | Work on the main thread that blocks the screen. | "A long task froze the search." |
| Blocking time | The time the page cannot respond because the main thread is busy. | "The click blocked the page for 300 ms." |
| Main thread | The line of work that runs the page. | "Heavy math blocks the main thread." |
| Overhead | Extra work a tool adds, on top of the job. | "memo adds a small overhead." |
| Baseline | The number you start from, before a fix. | "The baseline LCP was 4 s." |
| Budget | A limit you set, so a slow change fails the build. | "Lighthouse CI checks the budget." |
| Regression | A change that makes things slower again. | "The new filter caused a regression." |
| Lab data | Measured on one controlled machine. | "Lighthouse scores are lab data." |
| Field data | Measured by real users in production. | "CrUX is field data." |
| [CrUX](https://developer.chrome.com/docs/crux) | Google's real-user data for a URL or origin. | "Check CrUX to see real LCP." |

## Tools and CI

| Term | Meaning | Example |
| --- | --- | --- |
| [CLI](https://developer.mozilla.org/en-US/docs/Glossary/CLI) | Command line interface. You type commands in a terminal. | "react-doctor runs from the CLI." |
| [npx](https://docs.npmjs.com/cli/v10/commands/npx) | A command that runs a tool without installing it first. | "npx react-scan@latest opens a scanner." |
| [Linter](https://eslint.org/) | A tool that checks code for problems as you write. | "ESLint is a linter." |
| Autofix | A linter fix applied for you, without typing it. | "ESLint autofixes the dependency array." |
| Dev mode | The development build, with extra warnings. | "React Scan works best in dev mode." |
| Production build | The build that users get. Faster and smaller. | "The production build has no dev warnings." |
| Trace | A recording of what ran, for later study. | "React Doctor saves a Chrome trace." |
| [CI](https://docs.github.com/en/actions) | Continuous integration. Checks that run automatically. | "CI runs on every push." |
| [GitHub Action](https://docs.github.com/en/actions) | A task that runs in GitHub when you push. | "The workflow is one GitHub Action." |
| [Pull request](https://docs.github.com/en/pull-requests) | A proposed change, reviewed before it merges. | "React Doctor comments on the pull request." |
| Score | A number that rates the codebase. | "React Doctor gives a score from 0 to 100." |
| Audit | A full check of the code against a checklist. | "Run the audit before release." |
| [a11y](https://www.w3.org/WAI/fundamentals/accessibility-intro/) | Accessibility for everyone, including people with disabilities. | "React Doctor checks a11y issues." |
