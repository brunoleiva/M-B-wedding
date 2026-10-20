/** Escape a spreadsheet cell and neutralize formulas (including leading whitespace). */
export function csvCell(value: unknown): string {
  const raw = String(value ?? "");
  // Excel and other spreadsheets can interpret cells beginning with formula markers.
  // Neutralize even when the formula is preceded by whitespace/control characters.
  const safe = /^[\s\u0000-\u001f\u007f]*[=+\-@]/u.test(raw) ? "'" + raw : raw;
  return '"' + safe.replaceAll('"', '""') + '"';
}
