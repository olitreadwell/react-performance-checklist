# How to see what makes your bundle big

New to React? Go slowly. Follow the steps in order.

## What this tool does

It draws your bundle as rectangles.
A big rectangle is a big file.
You can see which library makes your app download large amounts of code.

## The analogy

Think of packing a suitcase.
You see which items take the most space.
A big jacket you never wear is a big rectangle in your bundle.
The visualizer is the suitcase X-ray.

## For a Vite app

1. Open your project folder in a terminal.
2. Run `npm install --save-dev vite-bundle-visualizer`
3. Run `npx vite-bundle-visualizer`
4. Wait. A picture opens in your browser.
5. Look for the biggest rectangle. That is the biggest file.

## For a webpack app

1. Generate a stats file:
   `npx webpack --profile --json > stats.json`
2. Run `npx webpack-bundle-analyzer stats.json`
3. A picture opens in your browser.

## What to look for

- A library you barely use, drawn very big.
  Fix: remove it, or import only one part.
  Example: `import { debounce } from "lodash-es"` instead of the whole library.
- Your whole app in one rectangle.
  Fix: split routes. See checklist item 8.

## Practice task (10 minutes)

1. Run the visualizer on any project you have.
2. Name the three biggest rectangles.
3. Say one sentence: "The bundle is big because of <package>."

## Done when

- You opened the picture once.
- You named the three biggest files.

## Do not panic

- Big is not always bad. Compare it to what the app does.
- You are looking for surprises: a huge library you forgot you installed.
