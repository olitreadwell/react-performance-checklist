import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { onCLS, onINP, onLCP } from "web-vitals";
import App from "./App";
import "./styles.css";

// M-01 fix: field data for the Core Web Vitals budgets.
function reportMetric(metric) {
  console.log(`[web-vitals] ${metric.name}: ${metric.value}`);
}
onCLS(reportMetric);
onINP(reportMetric);
onLCP(reportMetric);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
