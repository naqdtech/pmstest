// ============================================================================
//  Frappe client (imperative). Backs the store adapters below.
//  Bundled SPA => same-origin, cookie-session auth. frappe-js-sdk attaches the
//  CSRF token from window.csrf_token (injected by pms/www/frontend.py) on writes.
// ============================================================================
import { FrappeApp } from "frappe-js-sdk";

const url = typeof window !== "undefined" ? window.location.origin : "";

export const app = new FrappeApp(url);
export const db = app.db();
export const call = app.call();
export const frappeAuth = app.auth();

// ----- JSON + value helpers -----
export function parseJSON(val, fallback) {
  if (val == null || val === "") return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// ISO timestamp -> Frappe "YYYY-MM-DD HH:MM:SS".
export function toFrappeDatetime(v) {
  if (!v) return v;
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// A Frappe field that doesn't accept "" — dates/links/selects — should be null.
export function blankToNull(v) {
  return v === "" ? null : v;
}
