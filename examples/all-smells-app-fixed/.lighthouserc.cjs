// Lighthouse CI budgets for the fixed app. Run: npx @lhci/cli autorun
// (The npm name `lhci` is a different package; use @lhci/cli.)
// (after `npm run preview`). Fails when a budget regresses.
module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:4173/"],
      // Blocking third-party scripts and remote images need a real
      // network; the audits below stay meaningful either way.
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        // INP needs a user interaction to measure. A load-only run
        // cannot produce it, so warn instead of fail. Test it with a
        // user-flow or field data (web-vitals).
        "interaction-to-next-paint": ["warn", { maxNumericValue: 200 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-byte-weight": ["error", { maxNumericValue: 1_500_000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
