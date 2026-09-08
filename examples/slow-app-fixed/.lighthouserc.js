// Lighthouse CI budgets for the fixed app. Run: npx lhci autorun
// (after `npm run preview`). Fails when a budget regresses.
module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:4173/"],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "interaction-to-next-paint": ["error", { maxNumericValue: 200 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-byte-weight": ["error", { maxNumericValue: 1_500_000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
