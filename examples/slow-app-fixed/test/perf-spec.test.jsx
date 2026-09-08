// The spec for the example app. These tests are the contract:
// they fail on the slow version (red) and pass on the fixed version
// (green). Each test maps to one rule in the checklist.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, memo } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

const { rowRenders } = vi.hoisted(() => ({ rowRenders: { count: 0 } }));

vi.mock("../src/ProductRow", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ProductRow: memo((props) => {
      rowRenders.count += 1;
      return createElement(actual.ProductRow, props);
    }),
  };
});

beforeEach(() => {
  rowRenders.count = 0;
});

afterEach(() => {
  cleanup();
});

describe("R-03 + R-07: rows stay still while typing", () => {
  it("typing in the search box does not re-render product rows", () => {
    render(<App />);
    const before = rowRenders.count;
    fireEvent.change(screen.getByPlaceholderText("Search products"), {
      target: { value: "Product 1" },
    });
    expect(rowRenders.count).toBe(before);
  });
});

describe("R-05: context changes stay local", () => {
  it("changing the theme does not re-render product rows", () => {
    render(<App />);
    const before = rowRenders.count;
    fireEvent.click(screen.getByText("Toggle theme"));
    expect(rowRenders.count).toBe(before);
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
