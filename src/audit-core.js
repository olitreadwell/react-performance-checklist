// Audit engine: runs automated React performance checks on a codebase.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ESLint } from "eslint";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";

const SOURCE_PATTERNS = ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"];
const SOURCE_EXT = /\.(js|jsx|mjs|cjs|ts|tsx|mts|cts)$/;
const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".git",
  ".next",
  ".cache",
]);

const AUDIT_RULES = {
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "error",
  "react-compiler/react-compiler": "error",
  "react/jsx-key": "warn",
  "react/no-array-index-key": "warn",
};

const RULE_TO_ITEM = {
  "react-hooks/rules-of-hooks": { id: "R-07", severity: "High" },
  "react-hooks/exhaustive-deps": { id: "R-07", severity: "High" },
  "react-compiler/react-compiler": { id: "R-07", severity: "High" },
  "react/jsx-key": { id: "R-06", severity: "Medium" },
  "react/no-array-index-key": { id: "R-06", severity: "Medium" },
};

const FIX_NOTES = {
  "R-06": "Use a unique ID as the key. Never the array index.",
  "R-07": "Fix the hook order or the dependency array. See checklist item 13.",
};

const MANUAL_ITEMS = [
  {
    id: "R-01",
    title: "Profile before changing code",
    how: "Open React DevTools Profiler, record the slow action, read why components render. Guide: guides/react-dev-tools-profiler.md",
  },
  {
    id: "R-02",
    title: "Stable props",
    how: "Run React Scan first (npx react-scan@latest <url>). Guide: guides/react-scan.md. Then why-did-you-render if you need prop-level detail.",
  },
  {
    id: "R-03",
    title: "Render cost",
    how: "In the Profiler flamegraph, compare actualDuration and baseDuration for the slow component.",
  },
  {
    id: "L-02",
    title: "Bundle size",
    how: "Run the bundle visualizer inside the target app. Guide: guides/bundle-visualizer.md",
  },
  {
    id: "M-01",
    title: "Core Web Vitals",
    how: "Run Lighthouse on the running app and read the scores. Guide: guides/lighthouse.md",
  },
  {
    id: "M-02",
    title: "Interaction cost",
    how: "Open the Chrome Performance panel, record an interaction, read the long tasks.",
  },
];

export async function runAudit(targetDir) {
  const findings = [];
  const stats = {
    memo: 0,
    useMemo: 0,
    useContext: 0,
    lazy: 0,
    suspense: 0,
    imgNoLazy: 0,
  };
  const files = walkFiles(targetDir);

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    stats.memo += countMatches(text, /\bmemo\(/g);
    stats.useMemo += countMatches(text, /\buseMemo\(/g);
    stats.useContext += countMatches(text, /\buseContext\(/g);
    stats.lazy += countMatches(text, /\blazy\(/g);
    stats.suspense += countMatches(text, /\bSuspense\b/g);

    const img = /<img\b(?![^>]*\bloading\s*=\s*["']lazy["'])[^>]*?>/g;
    let match;
    while ((match = img.exec(text)) !== null) {
      stats.imgNoLazy += 1;
      if (findings.length < 200) {
        findings.push({
          id: "L-03",
          severity: "Medium",
          type: "heuristic",
          rule: "manual-scan",
          file: relative(targetDir, file),
          line: lineAt(text, match.index),
          message: "Image has no loading=\"lazy\" attribute.",
          fix: "Add loading=\"lazy\" to below-the-fold images. Add sizes for responsive images.",
          evidence: `${relative(targetDir, file)}:${lineAt(text, match.index)}`,
        });
      }
    }
  }

  if (stats.lazy === 0 && stats.suspense === 0) {
    findings.push({
      id: "L-01",
      severity: "Medium",
      type: "heuristic",
      rule: "manual-scan",
      file: ".",
      line: 1,
      message: "No React.lazy or Suspense found. If this app has routes, they likely load together.",
      fix: "Split routes with React.lazy and Suspense. See checklist item 8.",
      evidence: "stats: lazy=0, Suspense=0",
    });
  }

  const lintResults = await lintWithRules(targetDir);
  for (const result of lintResults) {
    for (const msg of result.messages) {
      if (msg.severity === 0) {
        continue;
      }
      const item = RULE_TO_ITEM[msg.ruleId];
      if (!item) {
        continue;
      }
      findings.push({
        id: item.id,
        severity: item.severity,
        type: "automated",
        rule: msg.ruleId,
        file: relative(targetDir, result.filePath),
        line: msg.line,
        message: firstLine(msg.message),
        fix: FIX_NOTES[item.id],
        evidence: `${relative(targetDir, result.filePath)}:${msg.line}`,
      });
    }
  }

  findings.sort((a, b) => {
    if (a.severity !== b.severity) {
      return severityRank(a.severity) - severityRank(b.severity);
    }
    return a.file.localeCompare(b.file) || a.line - b.line;
  });

  return {
    findings,
    manual: MANUAL_ITEMS,
    stats,
    summary: {
      target: targetDir,
      totalFindings: findings.length,
      high: findings.filter((f) => f.severity === "High").length,
      medium: findings.filter((f) => f.severity === "Medium").length,
      automated: findings.filter((f) => f.type === "automated").length,
      heuristic: findings.filter((f) => f.type === "heuristic").length,
    },
  };
}

async function lintWithRules(targetDir) {
  const eslint = new ESLint({
    cwd: targetDir,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: SOURCE_PATTERNS,
        languageOptions: {
          parser: tsParser,
          ecmaVersion: 2022,
          sourceType: "module",
          globals: { ...globals.browser, ...globals.node },
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: {
          "react-hooks": reactHooks,
          "react-compiler": reactCompiler,
          react: reactPlugin,
        },
        rules: AUDIT_RULES,
      },
    ],
  });
  return eslint.lintFiles(SOURCE_PATTERNS);
}

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(path, out);
    } else if (SOURCE_EXT.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

function countMatches(text, regex) {
  return (text.match(regex) ?? []).length;
}

function lineAt(text, index) {
  return text.slice(0, index).split("\n").length;
}

function firstLine(message) {
  return message.split("\n")[0];
}

function severityRank(severity) {
  return severity === "High" ? 0 : 1;
}
