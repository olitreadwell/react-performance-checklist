# How to use the React DevTools Profiler

For a very junior developer. Follow the steps in order.
If a step confuses you, re-read it. Do not skip it.

## What this tool does

It shows why a component renders, and how long the render takes.
Use it when a page feels slow.

## The analogy

Think of a dashcam in a car.
It records everything during the drive.
When something goes wrong, you replay the tape.
You see the exact moment, and who else was on the road.
The Profiler records your app during the slow action.
You replay the moment and see which components were busy.

## Step 1: Install the extension

1. Open Chrome.
2. Go to the Chrome Web Store.
3. Search for "React Developer Tools".
4. Install the extension from Meta. It has a React logo.
5. Close Chrome completely. Open Chrome again.

## Step 2: Open your app

1. Open your app in Chrome.
2. Do not close the tab.

## Step 3: Open the developer tools

1. Press F12.
2. A panel opens. It is called DevTools.

## Step 4: Find the Profiler tab

1. At the top of DevTools you see tabs: Elements, Console, Sources, and more.
2. Look for "Components" and "Profiler". These come from the extension.
3. Click "Profiler".

If you do not see the tabs, reload the page and look again.

## Step 5: Record a slow action

1. Click the record button. It is a blue circle, like a record button.
2. Do the slow action.
   Example: type in a search box. Open a list. Click a button.
3. Click the record button again. Recording stops.
4. Wait. A list of commits appears on the left. Each commit is one render.

## Step 6: Read the results

1. Click the tallest bar in the chart.
2. Click a component name in the flamegraph.
3. On the right, read "Why did this render?".
   It says things like:
   - "The parent component rendered."
   - "Props changed: value from 1 to 2."

This is the answer you want. Say it to your team:
"The Profiler showed that X re-rendered because Y."

## What to do next

- If the reason is "the parent rendered", the child may need memo or a stable prop.
- If the reason is "props changed" but the value looks the same, the prop gets a new identity every render. See checklist item 3.

## Done when

- You recorded an action.
- You named one component that re-rendered.
- You said why it re-rendered.

## Practice task (10 minutes)

1. Open any app with a filter or a list.
2. Record typing in the filter.
3. Find one component that re-renders.
4. Write one sentence: "<component> re-rendered because <reason>."

## Do not panic

- The first time, nothing makes sense. That is normal.
- You need only one commit and one component. Not all of them.
- The Profiler works in development mode. Production builds often hide it.
