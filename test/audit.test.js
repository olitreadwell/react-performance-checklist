import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runAudit } from "../src/audit-core.js";

const fixture = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "app",
);

describe("automated audit", () => {
  it("finds the index-key smell in the fixture", async () => {
    const report = await runAudit(fixture);
    const indexKey = report.findings.find(
      (finding) => finding.id === "R-06",
    );
    expect(indexKey).toBeTruthy();
    expect(indexKey.file).toContain("App.jsx");
    expect(indexKey.type).toBe("automated");
  });

  it("finds images without lazy loading", async () => {
    const report = await runAudit(fixture);
    const lazyImages = report.findings.filter(
      (finding) => finding.id === "L-03",
    );
    expect(lazyImages.length).toBeGreaterThan(0);
  });

  it("reports manual items that need a running app", async () => {
    const report = await runAudit(fixture);
    expect(report.manual.length).toBeGreaterThan(0);
    expect(report.manual.map((item) => item.id)).toContain("R-01");
  });

  it("reports summary counts", async () => {
    const report = await runAudit(fixture);
    expect(report.summary.totalFindings).toBe(report.findings.length);
    expect(report.summary.target).toBe(fixture);
  });
});
