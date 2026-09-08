# Examples

Two pairs of apps, each with the full agent process: audit, report,
fix, re-measure.

- `slow-app/` + `slow-app-fixed/` — the focused React walkthrough
  ([WALKTHROUGH.md](WALKTHROUGH.md)).
- `all-smells-app/` + `all-smells-app-fixed/` — every checklist item,
  React and front-end, violated then fixed with metrics
  ([WALKTHROUGH-ALL-SMELLS.md](WALKTHROUGH-ALL-SMELLS.md)).

- `slow-app/` — the smells planted. `npm test` fails (red).
- `slow-app-fixed/` — the fixes applied. `npm test` passes (green), and
  it ships lint, size-limit, Lighthouse budgets, and a CI workflow.
- `all-smells-app/` — every checklist item violated. `npm test` fails
  (9 red), size-limit fails, Lighthouse fails LCP and byte-weight.
- `all-smells-app-fixed/` — every problem fixed and verified. 9 tests
  green, size-limit passes, Lighthouse budgets pass, CI wired up.
- [WALKTHROUGH.md](WALKTHROUGH.md) — the focused React process.
- [WALKTHROUGH-ALL-SMELLS.md](WALKTHROUGH-ALL-SMELLS.md) — every rule,
  with before/after metrics and verification.
- `screenshots/` — `slow-app.png`, `fixed-app.png`, and the all-smells
  pair `all-smells-before.png` / `all-smells-after.png`.

Run them:

```bash
cd examples/slow-app
npm install
npm run dev        # http://localhost:5173
npm test           # red: 5 failed

cd ../slow-app-fixed
npm install
npm run dev        # http://localhost:5174
npm run check      # green: lint + 5 passed
npx size-limit     # 60.63 kB gzipped, budget 300 kB

cd ../all-smells-app
npm install
npm test           # red: 9 failed

cd ../all-smells-app-fixed
npm install
npm run check      # green: lint + 9 passed
npx size-limit     # 63.71 kB gzipped, budget 100 kB
```
