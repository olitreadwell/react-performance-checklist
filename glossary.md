# Glossary

Plain words for the jargon in this repo and in React performance work.
For English as a second language. For brains that need low noise.

## How to use this page

- Read five entries a day. That is enough.
- You do not need to memorize the words.
- Each entry has the term, a plain meaning, and an example sentence.
- Groups: basics, rendering, load time, numbers people measure, tools and CI.

## Basics

| Term | Meaning | Example |
| --- | --- | --- |
| Component | A piece of the screen that React builds and updates. | "The button is one component." |
| Props | Data you pass into a component from outside. | "The button color comes from props." |
| State | Data that a component owns and can change. | "The count is state. Clicking raises it." |
| Hook | A function that adds a React feature, like state. | "useState is a hook." |
| Dependency array | The list in a hook that says when to re-run. | "useMemo re-runs when items change." |
| Key | A label React uses to tell list items apart. | "The key is the item id, not the index." |
| Context | A way to share data with many components at once. | "The theme lives in context." |
| Context provider | The component that hands data down. | "Wrap the app in the provider." |
| Consumer | A component that reads context. | "Every consumer re-renders when context changes." |
| Prop drilling | Passing props down through many levels by hand. | "Context reduces prop drilling." |

## Rendering

| Term | Meaning | Example |
| --- | --- | --- |
| Render | React builds the screen from state. | "The first render shows the empty list." |
| Re-render | React builds the screen again. | "Each keystroke re-renders the list." |
| Memo | Code that stops an unnecessary re-render. | "memo keeps the row still when props are the same." |
| Memoization | Saving a result so you do not compute it again. | "useMemo saves the filtered list." |
| useCallback | A hook that keeps a function the same between renders. | "useCallback keeps the click handler stable." |
| Inline function | A function written inside the JSX. New every render. | "onClick={() => ...} is a new function each render." |
| Identity | Whether two values are the same object. | "memo compares identity, not the words." |
| Stable props | Props that keep the same identity between renders. | "Stable props let memo do its job." |
| Heavy work in render | Slow math or sorting done while building the screen. | "Filtering 10,000 rows inside render is heavy." |
| Reconciliation | React comparing the old screen with the new one. | "Keys help reconciliation keep rows." |
| Commit | The moment React applies a finished render to the screen. | "The Profiler shows each commit." |
| Flamegraph | A chart of where time goes during a render. | "The tallest bar is the slowest component." |
| Virtualization | Rendering only the visible rows of a long list. | "react-window does virtualization." |

## Load time

| Term | Meaning | Example |
| --- | --- | --- |
| Bundle | All the JavaScript you send to the user. | "The bundle is 2 MB." |
| Bundler | The tool that builds the bundle. Examples: Vite, webpack. | "Vite builds the bundle." |
| Code splitting | Loading code only when a route needs it. | "React.lazy splits the settings page." |
| Lazy loading | Waiting to load something until it is needed. | "Images below the fold load lazily." |
| Tree-shaking | Removing code you never use from the bundle. | "Tree-shaking drops unused functions." |
| Hydration | The browser attaching React to HTML the server sent. | "Hydration runs once on load." |

## Numbers people measure

| Term | Meaning | Example |
| --- | --- | --- |
| LCP | Largest Contentful Paint. When the main content appears. | "LCP under 2.5 s is good." |
| INP | Interaction to Next Paint. How fast the page answers a click. | "INP below 200 ms feels fast." |
| CLS | Cumulative Layout Shift. How much the page jumps. | "CLS under 0.1 is good." |
| Long task | Work on the main thread that blocks the screen. | "A long task froze the search." |
| Main thread | The line of work that runs the page. | "Heavy math blocks the main thread." |
| Overhead | Extra work a tool adds, on top of the job. | "memo adds a small overhead." |
| Baseline | The number you start from, before a fix. | "The baseline LCP was 4 s." |
| Budget | A limit you set, so a slow change fails the build. | "Lighthouse CI checks the budget." |
| Regression | A change that makes things slower again. | "The new filter caused a regression." |

## Tools and CI

| Term | Meaning | Example |
| --- | --- | --- |
| CLI | Command line interface. You type commands in a terminal. | "react-doctor runs from the CLI." |
| npx | A command that runs a tool without installing it first. | "npx react-scan@latest opens a scanner." |
| Linter | A tool that checks code for problems as you write. | "ESLint is a linter." |
| Autofix | A linter fix applied for you, without typing it. | "ESLint autofixes the dependency array." |
| Dev mode | The development build, with extra warnings. | "React Scan works best in dev mode." |
| Production build | The build that users get. Faster and smaller. | "The production build has no dev warnings." |
| Trace | A recording of what ran, for later study. | "React Doctor saves a Chrome trace." |
| CI | Continuous integration. Checks that run automatically. | "CI runs on every push." |
| GitHub Action | A task that runs in GitHub when you push. | "The workflow is one GitHub Action." |
| Workflow | The list of steps a CI run follows. | "The workflow runs lint and tests." |
| Pull request | A proposed change, reviewed before it merges. | "React Doctor comments on the pull request." |
| Score | A number that rates the codebase. | "React Doctor gives a score from 0 to 100." |
| Audit | A full check of the code against a checklist. | "Run the audit before release." |
| a11y | Accessibility for everyone, including people with disabilities. | "React Doctor checks a11y issues." |
