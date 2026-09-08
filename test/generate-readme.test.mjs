// Contract test: the generated README sections stay in sync with rules.json.
// The rule corpus is the source of truth (see AGENTS.md), so every rule id
// must appear in the generated checklist, and every smell must appear in
// the smells section.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rules = JSON.parse(readFileSync(join(root, "rules", "rules.json"), "utf8"));
const readme = readFileSync(join(root, "README.md"), "utf8");
const checklist = readFileSync(join(root, "react-performance-checklist.md"), "utf8");

describe("generated checklist stays in sync with rules.json", () => {
  it("every rule appears in both generated files", () => {
    for (const rule of rules) {
      expect(readme).toContain(rule.title);
      expect(checklist).toContain(rule.title);
    }
  });

  it("every smell rule appears in the smells section", () => {
    for (const rule of rules.filter((entry) => entry.smell)) {
      expect(readme).toContain(rule.smellText);
    }
  });

  it("rule ids are unique", () => {
    const ids = rules.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
