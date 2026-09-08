# Examples

Two versions of the same app, one slow and one fixed. The walkthrough
shows the full agent process: audit, report, fix, re-measure.

- [WALKTHROUGH.md](WALKTHROUGH.md) — the process, with real evidence.
- `slow-app/` — the smells planted. `npm test` fails (red).
- `slow-app-fixed/` — the fixes applied. `npm test` passes (green), and
  it ships lint, size-limit, Lighthouse budgets, and a CI workflow.
- `screenshots/` — the UI before and after. Byte-identical, on purpose.

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
```
