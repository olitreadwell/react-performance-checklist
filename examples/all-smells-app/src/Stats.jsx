import { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";

// D-03 + D-01: data-fetching smells. The stats panel should load only
// after the user adds something to the cart, and the two requests are
// independent.
export function Stats() {
  const { cart } = useContext(AppContext);
  const [summary, setSummary] = useState(null);
  const open = cart.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // D-03: awaits the remote gate before checking the cheap local
      // condition. The request runs even when the panel is closed.
      const flags = await fetch("/api/feature-flags").then((response) =>
        response.json(),
      );
      if (!flags.statsEnabled || !open || cancelled) return;
      // D-01: independent requests run one after another. Each adds a
      // full round trip to the total wait.
      const sales = await fetch("/api/sales-summary").then((response) =>
        response.json(),
      );
      const top = await fetch("/api/top-products").then((response) =>
        response.json(),
      );
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
