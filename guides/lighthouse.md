# How to use Lighthouse

For a very junior developer. Follow the steps in order.

## What this tool does

Lighthouse checks one page on the internet.
It gives a score from 0 to 100, and it says what to fix.
Use it to measure load speed: LCP, INP-like measures, and layout shift.

## The analogy

Think of a car safety inspection, like a WOF in New Zealand.
The inspector runs tests, gives a score, and writes a fix list.
Each fix saves you time or money.
Lighthouse inspects your page. Each opportunity is one fix with an estimated time saving.

## Step 1: Open your page

1. Open Chrome.
2. Open a private window. Press Control + Shift + N (Windows) or Command + Shift + N (Mac).
3. Open your page in the private window.
   Extensions are off there. The measurement is cleaner.

## Step 2: Open DevTools

1. Press F12.

## Step 3: Open the Lighthouse tab

1. Click "Lighthouse" at the top of DevTools.
2. Choose "Mobile" or "Desktop". Start with Mobile.
3. Tick "Performance".
4. Click "Analyze page load".

## Step 4: Wait

1. Wait about 30 seconds.
2. A report appears. Do not close the tab.

## Step 5: Read the score

1. Look at the big "Performance" number.
2. 90 to 100 is good. 50 to 89 is okay. Below 50 is slow.

## Step 6: Read the Opportunities

1. Scroll down to "Opportunities".
2. Each line is one fix, with an estimated saving.
   Example: "Remove unused JavaScript: 1.2 s potential savings".
3. Click an opportunity to see details and a documentation link.

This section is your evidence. Quote it when you request a performance fix:
"I ran Lighthouse and read the Opportunities. Each one names a fix."

## Step 7: Read the Metrics

1. Scroll to "Metrics".
2. Look for LCP (Largest Contentful Paint). Target: under 2.5 seconds.
3. Look for Total Blocking Time. Target: under 200 ms. It relates to INP.
4. Look for CLS (Cumulative Layout Shift). Target: under 0.1.

## From the command line (optional)

1. In your project folder:
2. Run `npx lighthouse <your-url> --only-categories=performance --view`
3. The report opens in your browser.

## Done when

- You generated one report.
- You read the score.
- You named one opportunity and its fix.

## Do not panic

- A low score is not a bad grade. It is a list of things to fix.
- Run it again after each fix. The score is the proof.
- Localhost works. Your dev server is fine.
