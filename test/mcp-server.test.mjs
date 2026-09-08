// Contract tests for the MCP server.
// They speak JSON-RPC over stdio, the same way an agent would.

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const serverPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "packages",
  "mcp",
  "server.mjs",
);

function callTool(name, args) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [serverPath], { stdio: ["pipe", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", () => {});
    child.on("error", reject);
    child.on("exit", () => {
      try {
        const lines = output
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line));
        const response = lines.find((entry) => entry.id === 2);
        resolve(response?.result?.content?.[0]?.text ?? "");
      } catch (error) {
        reject(error);
      }
    });
    child.stdin.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test", version: "1.0" },
        },
      }) + "\n",
    );
    child.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n",
    );
    child.stdin.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name, arguments: args },
      }) + "\n",
    );
    child.stdin.end();
  });
}

describe("MCP server", () => {
  it("list_rules returns every rule id", async () => {
    const text = await callTool("list_rules", {});
    for (const id of ["R-01", "R-07", "L-01", "M-01", "G-01", "F-01"]) {
      expect(text).toContain(`"id": "${id}"`);
    }
  });

  it("get_rule returns the rule by id", async () => {
    const text = await callTool("get_rule", { id: "R-03" });
    expect(text).toContain("Unstable props");
  });

  it("get_rule explains a missing id", async () => {
    const text = await callTool("get_rule", { id: "NOPE" });
    expect(text).toContain("No rule with id NOPE");
  });

  it("audit_plan does not invent a react-scan URL command", async () => {
    const text = await callTool("audit_plan", { symptom: "typing" });
    expect(text).not.toContain("react-scan@latest <url>");
    expect(text).toContain("react-doctor@latest");
  });

  it("fix_plan returns fix steps and guardrails for a rule", async () => {
    const text = await callTool("fix_plan", { id: "R-03", location: "src/List.jsx:42" });
    expect(text).toContain("Rule R-03");
    expect(text).toContain("Location: src/List.jsx:42");
    expect(text).toContain("Guardrails");
    expect(text).toContain("Measure before the fix");
  });
});
