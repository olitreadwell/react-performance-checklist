// Lighthouse CI budgets. Copy this file into your app, set the URLs,
// and run `npx @lhci/cli autorun`. Fails the build when a budget
// regresses. (The npm name `lhci` is a different package; use @lhci/cli.)
// Rule M-01 and G-04 in the checklist.
module.exports = {
  ci: {
    collect: {
      // Point these at your app. A local server works: `npm run preview`.
      url: ["http://localhost:4173/"],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        // INP needs a user interaction to measure. A load-only run
        // cannot produce it, so warn instead of fail. Test it with a
        // user-flow or field data (web-vitals).
        "interaction-to-next-paint": ["warn", { maxNumericValue: 200 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-byte-weight": ["error", { maxNumericValue: 1_500_000 }],
        "unused-javascript": ["error", { maxNumericValue: 300_000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
