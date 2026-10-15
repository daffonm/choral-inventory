/**
 * Deterministic number formatter for Next.js SSR & Client Hydration.
 * Prevents "Hydration failed because the server rendered text didn't match the client"
 * caused by locale discrepancy (e.g. Node.js en-US comma vs Browser id-ID dot).
 */
export function formatNumber(val) {
  if (val === null || val === undefined) return "0";
  const num = typeof val === "number" ? val : Number(val);
  if (isNaN(num)) return String(val);
  // Pure deterministic regex thousand separator: 1250 -> "1.250"
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
