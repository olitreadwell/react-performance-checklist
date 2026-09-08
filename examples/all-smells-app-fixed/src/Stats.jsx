import { useContext, useEffect, useState } from "react";
import { CartContext } from "./AppContext";

function checkStatus(response) {
  if (!response.ok) throw new Error("stats request failed");
  return response;
}

export function Stats() {
  const { cart } = useContext(CartContext);
  const [summary, setSummary] = useState(null);
  const open = cart.length > 0;

  useEffect(() => {
    // D-03 fix: the cheap local check runs first. No request at all
    // while the panel is closed. The slow version awaited a remote gate
    // first and paid a round trip every time.
    if (!open) return;
    let cancelled = false;
    async function load() {
      // D-01 fix: independent requests start together, so the total
      // wait is the slowest one, not the sum.
      const [sales, top] = await Promise.all([
        fetch("/api/sales-summary").then(checkStatus).then((response) =>
          response.json(),
        ),
        fetch("/api/top-products").then(checkStatus).then((response) =>
          response.json(),
        ),
      ]);
      if (!cancelled) setSummary({ sales, top });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!summary) return null;
  return (
    <section data-testid="stats">
      <p>Sales: {summary.sales.total}</p>
      <p>Top: {summary.top.map((product) => product.name).join(", ")}</p>
    </section>
  );
}
