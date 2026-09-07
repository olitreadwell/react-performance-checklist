// CLI: run the automated React performance audit.
// Usage: node src/audit.js <target-path> [--json]
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { runAudit } from "./audit-core.js";

const args = process.argv.slice(2);
const jsonOut = args.includes("--json");
const target = resolve(args.find((arg) => !arg.startsWith("--")) ?? ".");

const report = await runAudit(target);

if (jsonOut) {
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
} else {
  const markdown = toMarkdown(report);
  const outPath = resolve(process.cwd(), "react-perf-audit.md");
  writeFileSync(outPath, markdown);
  process.stdout.write(markdown);
  process.stdout.write(`\nReport written to: ${outPath}\n`);
}

function toMarkdown(report) {
  const lines = [];
  lines.push("# React Performance Audit");
  lines.push("");
  lines.push(`Target: ${report.summary.target}`);
  lines.push(
    `Findings: ${report.summary.totalFindings} (High: ${report.summary.high}, Medium: ${report.summary.medium})`,
  );
  lines.push(`Stats: ${report.stats.memo} memo, ${report.stats.useMemo} useMemo, ${report.stats.useContext} useContext, ${report.stats.lazy} lazy, ${report.stats.imgNoLazy} images without lazy loading`);
  lines.push("");
  lines.push("## Findings");
  lines.push("");
  if (report.findings.length === 0) {
    lines.push("No automated findings. The manual items below still need a browser.");
  }
  for (const finding of report.findings) {
    lines.push(
      `- [${finding.id}][${finding.severity}] ${finding.message} at ${finding.file}:${finding.line}. evidence: ${finding.evidence}. fix: ${finding.fix}.`,
    );
  }
  lines.push("");
  lines.push("## Manual items (need a running app)");
  lines.push("");
  for (const item of report.manual) {
    lines.push(`- [${item.id}] ${item.title}. ${item.how}`);
  }
  lines.push("");
  lines.push("## Next step for a coding agent");
  lines.push("");
  lines.push("Give this report and `audit-prompt.md` to a coding agent. The agent reads `audit-checklist.md` and produces the final verdict.");
  lines.push("");
  return lines.join("\n");
}
