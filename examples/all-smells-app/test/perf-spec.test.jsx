// The spec for the example app. These tests are the contract:
// they fail on the slow version (red) and pass on the fixed version
// (green). Each test maps to one rule in the checklist.

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, memo, Profiler } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import App from "../src/App";
import { useStore } from "../src/store";

const counters = vi.hoisted(() => ({
  rowRenders: { count: 0 },
  headerRenders: { count: 0 },
}));

vi.mock("../src/ProductRow", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ProductRow: memo((props) => {
      counters.rowRenders.count += 1;
      return createElement(actual.ProductRow, props);
    }),
  };
});

vi.mock("../src/Header", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    Header: (props) => {
      counters.headerRenders.count += 1;
      return actual.Header(props);
    },
  };
});

beforeEach(() => {
  counters.rowRenders.count = 0;
  counters.headerRenders.count = 0;
  // Every test needs a benign fetch: the stats panel fetches on mount in
  // the slow version. Individual tests override this stub when they
  // assert on fetch behavior (D-01, D-03).
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ statsEnabled: true }),
    }),
    ),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("R-03 + R-07: rows stay still while typing", () => {
  it("typing in the search box does not re-render product rows", () => {
    render(<App />);
    const before = counters.rowRenders.count;
    fireEvent.change(screen.getByPlaceholderText("Search products"), {
      target: { value: "Product 1" },
    });
    expect(counters.rowRenders.count).toBe(before);
  });
});

describe("R-05: context changes stay local", () => {
  it("changing the theme does not re-render product rows", () => {
    render(<App />);
    const before = counters.rowRenders.count;
    fireEvent.click(screen.getByText("Toggle theme"));
    expect(counters.rowRenders.count).toBe(before);
  });
});

describe("R-06: stable keys keep rows alive", () => {
  it("a focused row keeps its product after a reorder", () => {
    render(<App />);
    const firstButton = screen.getAllByRole("button", { name: "Add" })[0];
    const row = firstButton.closest("li");
    const nameBefore = row.querySelector("span").textContent;
    firstButton.focus();
    fireEvent.click(screen.getByText(/Sort by/));
    const focusedRow = document.activeElement.closest("li");
    const nameAfter = focusedRow.querySelector("span").textContent;
    expect(nameAfter).toBe(nameBefore);
  });
});

describe("R-08: components are defined at module scope", () => {
  it("ProductList does not define a component inside its body", () => {
    const source = readFileSync("src/ProductList.jsx", "utf8");
    expect(source).not.toMatch(/^ {2}const [A-Z]\w* = /m);
  });
});

describe("L-01: the heavy screen loads on demand", () => {
  it("the reports screen is not in the first paint", async () => {
    render(<App />);
    expect(screen.queryByText(/report row/)).toBeNull();
    expect(await screen.findByText(/report row 0/)).toBeTruthy();
  });
});

describe("L-03 + F-01: images load lazily at the right size", () => {
  it("every product image has lazy loading and a srcset", () => {
    render(<App />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(image.getAttribute("loading")).toBe("lazy");
      expect(image.getAttribute("srcset")).toBeTruthy();
    }
  });
});

describe("L-05: imports come from the exact module", () => {
  it("ProductRow imports formatPrice from ./lib/format, not the barrel", () => {
    const source = readFileSync("src/ProductRow.jsx", "utf8");
    expect(source).toContain('from "./lib/format"');
  });
});

describe("D-01: independent fetches run in parallel", () => {
  it("the two stats requests start together", async () => {
    const calls = [];
    let resolveSales;
    const salesGate = new Promise((resolve) => {
      resolveSales = resolve;
    });
    const fetchSpy = vi.fn((url) => {
      calls.push(url);
      if (url === "/api/sales-summary") return salesGate;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ statsEnabled: true }),
      });
    });
    vi.stubGlobal("fetch", fetchSpy);
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "Add" })[0]);
    });
    await act(async () => {});
    expect(calls).toContain("/api/sales-summary");
    // Slow: the second fetch waits for the first to resolve. Fixed:
    // Promise.all starts both on the same tick.
    expect(calls).toContain("/api/top-products");
    resolveSales({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe("D-03: cheap conditions are checked before await", () => {
  it("no stats request fires while the panel is closed", async () => {
    const fetchSpy = vi.fn(() =>
      Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ statsEnabled: true }),
    }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    render(<App />);
    await act(async () => {});
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("M-02: click handlers do not block the main thread", () => {
  it("the export handler yields instead of running 200k rows synchronously", () => {
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");
    render(<App />);
    fireEvent.click(screen.getByText("Export report"));
    // A blocked main thread never schedules chunks. A chunked handler does.
    expect(timeoutSpy).toHaveBeenCalled();
  });
});

describe("S-01: store subscriptions use a selector", () => {
  it("an unrelated store change does not re-render the subscriber", () => {
    const commits = [];
    render(
      <Profiler
        id="app"
        onRender={() => commits.push(1)}
      >
        <App />
      </Profiler>,
    );
    commits.length = 0;
    act(() => {
      useStore.setState({ lastSync: Date.now() + 1 });
    });
    expect(commits.length).toBe(0);
  });
});

describe("S-02: derived state is computed during render", () => {
  it("a cart change costs one header render, not two", () => {
    render(<App />);
    counters.headerRenders.count = 0;
    act(() => {
      fireEvent.click(screen.getAllByRole("button", { name: "Add" })[0]);
    });
    expect(counters.headerRenders.count).toBe(1);
  });
});

describe("F-02 + F-03: fonts and CSS do not block first paint", () => {
  it("index.html preconnects to the font origin", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).toContain('rel="preconnect"');
  });

  it("the stylesheet loads without blocking", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).not.toMatch(/<link rel="stylesheet"/);
  });
});

describe("F-05: third-party scripts do not block", () => {
  it("every external script loads with defer or async", () => {
    const html = readFileSync("index.html", "utf8");
    const external = [...html.matchAll(/<script[^>]*src="(https?:[^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(external.length).toBeGreaterThan(0);
    for (const src of external) {
      const tag = html.match(new RegExp(`<script[^>]*src="${src}"`))[0];
      expect(tag).toMatch(/defer|async/);
    }
  });
});
