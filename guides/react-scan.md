# How to use React Scan

For a very junior developer. Follow the steps in order.

## What this tool does

React Scan watches your app and highlights components that re-render
without a real reason. It needs zero code changes.
It is the fastest way to see a re-render problem.
It is open source (MIT). Its page: https://react-scan.million.dev

## The analogy

Think of a thermal camera.
It shows which parts of a machine are hot.
React Scan shows which components are "hot" with re-renders.
The hot ones flash red on the screen.

## Step 1: Turn it on (choose one way)

Way A: script tag. Open `index.html`.
Put this BEFORE any other script:

```html
<script src="https://unpkg.com/react-scan/dist/auto.global.js"></script>
```

Way B: npm. In your project folder:

```bash
npm install -D react-scan
```

Then add this at the top of your entry file, before your app code:

```js
import { scan } from "react-scan";
scan();
```

Way C: automatic setup:

```bash
npx -y react-scan@latest init
```

The tool detects your framework and sets it up for you.

## Step 2: Run your app

1. Run `npm run dev`.
2. Open the app in Chrome.

## Step 3: Read the highlights

1. Use the app normally. Type, click, open lists.
2. Watch the screen. Re-rendered components flash red.
3. A small panel shows render counts and times.

A component that flashes when nothing changed is your problem.

## Step 4: Scan a running app without setup

You can scan a running app from the terminal. No code needed:

```bash
npx react-scan@latest http://localhost:3000
```

It opens an isolated browser and shows you the highlights.
It works on any URL. Even other websites.

## What to do next

- The flashing component has unstable props. See checklist item 3.
- Fix: hoist values out of the component. Use useCallback or useMemo.
- Done when: the red flashes stop for that component.

## Turn it off

Remove the script tag, or remove the scan() call.
Use React Scan only while you search for problems.

## Done when

- React Scan loaded in your app.
- You saw one component flash red.
- You named the component.

## Practice task (10 minutes)

1. Add React Scan to any app you have.
2. Type in a search box or filter.
3. Find one component that flashes red every keystroke.
4. Say one sentence: "<component> re-renders on every keystroke."

## Do not panic

- Everything flashing at once is normal. Many apps do it.
- You want one or two hot spots, not all of them.
- React Scan is a pointer. You still choose the fix.
