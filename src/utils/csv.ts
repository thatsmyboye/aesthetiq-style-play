export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  // Simple CSV parser (quotes + commas)
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  if (!lines.length) return [];
  const headers = splitLine(lines[0]);
  return lines.slice(1).map(line => {
    const cols = splitLine(line);
    const row: CsvRow = {};
    headers.forEach((h, i) => (row[h.trim()] = (cols[i] ?? "").trim()));
    return row;
  });
}

function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "", inQ = false;
  for (let i=0;i<line.length;i++){
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export function toCsv(rows: CsvRow[], headers: string[]): string {
  const esc = (s: string | number | undefined | null) => {
    const str = String(s ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const head = headers.map(esc).join(",");
  const body = rows.map(r => headers.map(h => esc(r[h] ?? "")).join(",")).join("\n");
  return head + "\n" + body;
}
