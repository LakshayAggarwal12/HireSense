import api from "./api";

/**
 * Pings the backend's /health endpoint and reports how long it took, so the
 * status pill in the header can show real connectivity rather than a guess.
 *
 * Timed with `performance.now()` around the request itself so the latency
 * reflects the round trip, not just server processing.
 */
export async function getHealth() {
  const started = performance.now();
  await api.get("/health");
  return { latencyMs: Math.round(performance.now() - started), checkedAt: new Date() };
}
