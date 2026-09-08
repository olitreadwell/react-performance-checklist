# How to use why-did-you-render

New to React? Go slowly. Follow the steps in order.

## What this tool does

It watches your app in development mode.
It logs every re-render that it thinks is unnecessary.
You can see which component re-rendered and which prop changed.

## The analogy

Think of a motion-sensor light in a hallway.
It turns on when someone moves, even when nobody needed the light.
why-did-you-render is the sensor. It lights up every time a component re-renders without a real reason.

## Step 1: Install the package

1. Open your project folder in a terminal.
2. Run `npm install --save-dev @welldone-software/why-did-you-render`

## Step 2: Turn it on in your entry file

1. Open the file where your app starts. It is usually `src/index.js` or `src/main.jsx`.
2. Add this at the top of the file:

```js
import React from "react";

if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
```

Check the package README for the newest snippet. Copy exactly.

## Step 3: Run the app

1. Run `npm run dev`.
2. Open the app in Chrome.

## Step 4: Read the console

1. Press F12.
2. Click "Console".
3. Click around in your app.
4. Look for yellow "why-did-you-render" logs.
5. Each log names a component and shows which props changed.
   Green means same value, new identity. Red means a real change.

## What to do next

A log means: memo cannot protect this component.
The usual fix is a stable prop. See checklist item 3.

## Turn it off

Delete the snippet, or comment it out.
This tool is noisy. Turn it on only when you look for problems.

## Done when

- The app logged a re-render warning.
- You named the component.
- You named the prop that changed.

## Do not panic

- Hundreds of logs are normal. You want patterns, not every line.
- It does not fix anything. It points. You fix.
- If the logs do not appear, check that you run development mode.
