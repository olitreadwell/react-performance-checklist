// Generates the checklist and smells sections from rules/rules.json.
// Writes them into README.md and react-performance-checklist.md
// between the CHECKLIST and SMELLS markers. Run with: npm run generate

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rules = JSON.parse(readFileSync(join(root, "rules", "rules.json"), "utf8"));

const CATEGORIES = [
  { key: "measure", heading: "A. Measure first" },
  { key: "rendering", heading: "B. Fix renders" },
  { key: "load", heading: "C. Load time" },
  { key: "metrics", heading: "D. What users feel" },
  { key: "guardrails", heading: "E. Guard rails" },
];

function anchorFor(rule, index) {
  const title = rule.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return `${index}-${title}-${rule.severity.toLowerCase()}`;
}

function renderRule(rule, index) {
  const out = [];
  out.push(`### ${index}. ${rule.title} [${rule.severity}]`);
  out.push("");
  out.push(`- [ ] ${rule.summary}`);
  out.push("");
  for (const bullet of rule.bullets ?? []) {
    out.push(`- ${bullet}`);
  }
  if (rule.bullets?.length) {
    out.push("");
  }
  out.push("  _Why:_");
  out.push(`  > ${rule.why}`);
  out.push("");
  out.push("  _How:_");
  for (const step of rule.how) {
    out.push(`  > - ${step}`);
  }
  out.push("");
  if (rule.example) {
    const lang = rule.exampleLang ?? "jsx";
    out.push(`  \`\`\`${lang}`);
    for (const line of rule.example.split("\n")) {
      out.push(line ? `  ${line}` : "");
    }
    out.push("  \`\`\`");
    out.push("");
  }
  if (rule.note) {
    for (const line of rule.note.split("\n")) {
      out.push(line ? `  ${line}` : "");
    }
    out.push("");
  }
  out.push(`- Verify: ${rule.verify}`);
  out.push("");
  for (const link of rule.links ?? []) {
    const icon = link.kind === "guide" ? "🛠" : "📖";
    out.push(`- ${icon} [${link.label}](${link.url})`);
  }
  out.push("");
  return out.join("\n");
}

function renderChecklist() {
  const out = [];
  for (const category of CATEGORIES) {
    const items = rules.filter((rule) => rule.category === category.key);
    if (!items.length) {
      continue;
    }
    out.push(`## ${category.heading}`);
    out.push("");
    for (const rule of items) {
      out.push(renderRule(rule, rules.indexOf(rule) + 1));
    }
    out.push("**[⬆ back to top](#table-of-contents)**");
    out.push("");
  }
  return out.join("\n").trim();
}

function renderSmells() {
  const out = ["## Code smells at a glance", ""];
  for (const rule of rules.filter((entry) => entry.smell)) {
    const index = rules.indexOf(rule) + 1;
    out.push(
      `- [ ] ${rule.smellText} -> [item ${index}](#${anchorFor(rule, index)})`,
    );
    out.push("");
    out.push("  ```jsx");
    for (const line of (rule.smellCode ?? "").split("\n")) {
      out.push(`  ${line}`);
    }
    out.push("  ```");
    out.push("");
  }
  return out.join("\n").trim();
}

function splice(file, startMarker, endMarker, content) {
  const text = readFileSync(file, "utf8");
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker);
  if (start === -1 || end === -1) {
    throw new Error(`Markers not found in ${file}`);
  }
  const before = text.slice(0, start + startMarker.length);
  const after = text.slice(end);
  writeFileSync(file, `${before}\n${content}\n${after}`);
}

for (const file of ["README.md", "react-performance-checklist.md"]) {
  const path = join(root, file);
  splice(path, "<!-- CHECKLIST:START -->", "<!-- CHECKLIST:END -->", renderChecklist());
  splice(path, "<!-- SMELLS:START -->", "<!-- SMELLS:END -->", renderSmells());
}

console.log("Generated checklist and smells sections in README.md and react-performance-checklist.md");
