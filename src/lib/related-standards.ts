// Shared loader for the Related Standards section (public/data/related-standards.json).
import fs from "fs";
import path from "path";

export function loadRelated() {
  const d = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "data", "related-standards.json"), "utf8"),
  );
  // {act.approved}-style placeholders let the ACT counts, refreshed weekly by
  // scripts/check-related-standards.mjs, appear inside hand-written text.
  const fill = (s: unknown) =>
    typeof s === "string"
      ? s.replace(/\{act\.(\w+)\}/g, (m, k) => (d.act?.[k] ?? m).toString())
      : s;
  const walk = (v: any): any =>
    Array.isArray(v) ? v.map(walk) : v && typeof v === "object"
      ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]))
      : fill(v);
  return walk(d);
}

export function loadCatalogBySlug(): Record<string, any> {
  const p = path.join(process.cwd(), "public", "data", "wcag3-catalog.json");
  if (!fs.existsSync(p)) return {};
  return Object.fromEntries(JSON.parse(fs.readFileSync(p, "utf8")).map((i: any) => [i.slug, i]));
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function formatDate(iso: string | null | undefined) {
  if (!iso) return "Ongoing";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
