// Runs the referenced scanners against a target and writes a report.
// This is orchestration, not a new scanner. It calls the tools the
// README already names: React Doctor, ESLint, and the project's tests.
// Usage: node scripts/audit.mjs <path-to-app> [--out report.md]

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const target = resolve(process.argv[2] ?? ".");
const outPath = resolve(process.argv[3] ?? join(target, "PERFORMANCE-REPORT.md"));

if (!existsSync(join(target, "package.json"))) {
  console.error(`No package.json in ${target}. Point this at a React app.`);
  process.exit(1);
}

function run(command, args) {
  try {
    return execFileSync(command, args, {
      cwd: target,
      encoding: "utf8",
      timeout: 120_000,
    });
  } catch (error) {
    return `Command failed (${command} ${args.join(" ")}):\n${error.stdout ?? ""}${error.stderr ?? ""}`;
  }
}

const pkg = JSON.parse(readFileSync(join(target, "package.json"), "utf8"));
const sections = [];

const doctor = run("npx", ["react-doctor@latest"]);
sections.push(`## React Doctor\n\n\`\`\`\n${doctor.trim()}\n\`\`\``);

const hasEslint = existsSync(join(target, "eslint.config.js")) || existsSync(join(target, "eslint.config.mjs"));
if (hasEslint) {
  const lint = run("npx", ["eslint", "."]);
  sections.push(`## ESLint\n\n\`\`\`\n${lint.trim()}\n\`\`\``);
} else {
  sections.push("## ESLint\n\nNo eslint.config.js found. See rule G-01.");
}

if (pkg.scripts?.test) {
  const test = run("npm", ["test"]);
  sections.push(`## Tests\n\n\`\`\`\n${test.trim()}\n\`\`\``);
} else {
  sections.push("## Tests\n\nNo test script found. See rule G-03.");
}

const report = `# Performance report

Target: ${target}
Date: ${new Date().toISOString()}

## Verdict

- The three fixes with the largest measured impact, in order:
  1. (fill from the findings below)
  2.
  3.
- The one fix to do first: (fill)

## Findings

| ID | Severity | Location | Evidence | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| (fill from React Doctor warnings and the audit checklist) | | | | | open |

${sections.join("\n\n")}

## Next step

Hand this report to fix-prompt.md and let an agent fix the open findings.
`;

writeFileSync(outPath, report);
console.log(`Wrote ${outPath}`);
