// Perf regression tests.
// Test 1 proves the smell: unstable props defeat memo.
// Test 2 proves the fix: stable props keep memo working.

import { fireEvent, render } from "@testing-library/react";
import { memo, useCallback, useState } from "react";
import { describe, expect, it, vi } from "vitest";

describe("smell: unstable props defeat memo", () => {
  const innerRender = vi.fn(
    ({ onClick }) => <button onClick={onClick}>bump</button>,
  );
  const InnerUnstable = memo(innerRender);

  function ParentUnstable() {
    const [, setCount] = useState(0);
    // Inline arrow: new identity on every render.
    return <InnerUnstable onClick={() => setCount((c) => c + 1)} />;
  }

  it("re-renders the memoized child when the callback is unstable", () => {
    render(<ParentUnstable />);
    expect(innerRender).toHaveBeenCalledTimes(1);
    fireEvent.click(document.querySelector("button"));
    // This asserts 2 on purpose. It proves the smell is real.
    expect(innerRender).toHaveBeenCalledTimes(2);
  });
});

describe("fix: stable props keep the memo working", () => {
  const innerRender = vi.fn(
    ({ onClick }) => <button onClick={onClick}>bump</button>,
  );
  const InnerStable = memo(innerRender);

  function ParentStable() {
    const [, setCount] = useState(0);
    // useCallback: the callback keeps its identity. memo can bail out.
    const bump = useCallback(() => setCount((c) => c + 1), []);
    return <InnerStable onClick={bump} />;
  }

  it("does not re-render the child when the callback is stable", () => {
    render(<ParentStable />);
    expect(innerRender).toHaveBeenCalledTimes(1);
    fireEvent.click(document.querySelector("button"));
    expect(innerRender).toHaveBeenCalledTimes(1);
  });
});
