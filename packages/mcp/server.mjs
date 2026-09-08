// MCP server for the React Performance Checklist.
// Exposes the rule corpus to MCP-capable agents.
// Run with: npm run mcp
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const rulesPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "rules",
  "rules.json",
);
const rules = JSON.parse(readFileSync(rulesPath, "utf8"));

const server = new McpServer({
  name: "react-performance-checklist",
  version: "1.0.0",
});

server.registerTool(
  "list_rules",
  {
    title: "List all rules",
    description:
      "List every rule in the React performance checklist. Optionally filter by category: measure, rendering, load, metrics, guardrails.",
    inputSchema: {
      category: z
        .string()
        .optional()
        .describe(
          "Optional category filter: measure, rendering, load, metrics, guardrails.",
        ),
    },
  },
  async ({ category }) => {
    const filtered = category
      ? rules.filter((rule) => rule.category === category)
      : rules;
    return {
      content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
    };
  },
);

server.registerTool(
  "get_rule",
  {
    title: "Get one rule",
    description: "Get one rule by id. Examples: R-03, L-01, G-04.",
    inputSchema: {
      id: z.string().describe("Rule id. Examples: R-03, L-01, G-04."),
    },
  },
  async ({ id }) => {
    const rule = rules.find((entry) => entry.id === id);
    const text = rule
      ? JSON.stringify(rule, null, 2)
      : `No rule with id ${id}. Use list_rules to see all ids.`;
    return { content: [{ type: "text", text }] };
  },
);

server.registerTool(
  "audit_plan",
  {
    title: "Plan an audit",
    description:
      "Return the ordered audit steps for a symptom. The symptom is what feels slow: typing, load, or nothing specific.",
    inputSchema: {
      symptom: z
        .string()
        .optional()
        .describe(
          "What feels slow. Examples: typing, opening a screen, load time, nothing specific.",
        ),
    },
  },
  async ({ symptom }) => {
    const text = symptom
      ? `Symptom: ${symptom}\n\n1. Run the scanners: npx react-doctor@latest, then React Scan (browser extension, or npx -y react-scan@latest init).\n2. Open the Profiler and record the slow action.\n3. Fix the High rules in order: ${rules
          .filter((rule) => rule.severity === "High")
          .map((rule) => rule.id)
          .join(", ")}.\n4. Re-run the scanners. The score is the proof.`
      : "No symptom given. Start with the scanners, then the Profiler.";
    return { content: [{ type: "text", text }] };
  },
);

server.registerTool(
  "fix_plan",
  {
    title: "Plan a fix",
    description:
      "Return the ordered fix steps for one rule. Use after an audit finding. Optionally pass the file:line to fix.",
    inputSchema: {
      id: z.string().describe("Rule id. Examples: R-03, L-01, G-01."),
      location: z
        .string()
        .optional()
        .describe("Optional file:line of the finding, for example src/List.jsx:42."),
    },
  },
  async ({ id, location }) => {
    const rule = rules.find((entry) => entry.id === id);
    if (!rule) {
      return {
        content: [
          {
            type: "text",
            text: `No rule with id ${id}. Use list_rules to see all ids.`,
          },
        ],
      };
    }
    const lines = [
      `Rule ${rule.id}: ${rule.title} [${rule.severity}]`,
      location ? `Location: ${location}` : "",
      "",
      "Fix steps:",
      ...rule.how.map((step, index) => `${index + 1}. ${step}`),
      "",
      `Verify: ${rule.verify}`,
      "",
      "Guardrails:",
      "1. Measure before the fix. Record the number or render you will compare after.",
      "2. Apply one fix at a time. Re-measure after each one.",
      "3. Run lint and tests after each fix.",
      "4. Commit each fix separately with a conventional commit message.",
      "5. No evidence, no claim. If the fix did not change the number, say so.",
    ].filter(Boolean);
    return { content: [{ type: "text", text: lines.join("\n") }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
