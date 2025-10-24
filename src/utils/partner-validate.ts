import type { AestheticTag } from "@/types/domain";
import { parseCsv, toCsv, type CsvRow } from "@/utils/csv";

const REQUIRED = ["id","title","image","price","url","brand","tags","palette"];
const OPTIONAL = ["category","aff_param_key","aff_param_value"];
export const EXPECTED_HEADERS = [...REQUIRED, ...OPTIONAL];

const TAGS: AestheticTag[] = [
  "minimal","maximal","midcentury","brutalist","coquette","vintage","industrial","organic",
  "glasscore","coastal","pastel","monochrome","boldcolor","natural_fiber","metallic",
  "curved","angular","soft_light","high_contrast","neutral_palette"
];

const HEX = /^#([0-9A-F]{6})$/i;
function normHex(h: string) {
  const s = h.trim().toUpperCase();
  if (HEX.test(s)) return "#" + s.replace("#","").toUpperCase();
  return null;
}
function isHttpUrl(u: string) {
  try { const x = new URL(u); return x.protocol === "http:" || x.protocol === "https:"; } catch { return false; }
}

export type RowStatus = "PASS" | "WARN" | "FAIL";
export interface RowReport {
  index: number;                 // original row index (1-based body)
  status: RowStatus;
  errors: string[];
  warnings: string[];
  original: CsvRow;
  normalized: CsvRow | null;
}

export interface ImportReport {
  headersOk: boolean;
  missingHeaders: string[];
  extraHeaders: string[];
  rows: RowReport[];
  counts: { pass: number; warn: number; fail: number; total: number };
  fixedCsv: string;  // only PASS/WARN rows normalized
}

export function validateCsvText(text: string): ImportReport {
  const rows = parseCsv(text);
  // header audit (best-effort from first line)
  const firstLine = text.replace(/\r/g,"").split("\n")[0] || "";
  const gotHeaders = firstLine.split(",").map(h => h.trim());
  const missing = REQUIRED.filter(h => !gotHeaders.includes(h));
  const extra = gotHeaders.filter(h => !EXPECTED_HEADERS.includes(h));
  const headersOk = missing.length === 0;

  const reports: RowReport[] = [];
  const fixedRows: CsvRow[] = [];

  rows.forEach((r, i) => {
    const idx = i + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required presence
    for (const k of REQUIRED) {
      if (!r[k] || !String(r[k]).trim()) errors.push(`Missing ${k}`);
    }

    // URL checks
    if (r.image && !isHttpUrl(r.image)) warnings.push("image is not a valid http(s) URL");
    if (r.url && !isHttpUrl(r.url)) errors.push("url is not a valid http(s) URL");

    // Price
    let priceNum = Number(r.price);
    if (Number.isNaN(priceNum) || priceNum < 0) errors.push("price must be a non-negative number");

    // Tags
    const tags = (r.tags || "").split(/[;,\s]+/).map(s => s.trim()).filter(Boolean) as AestheticTag[];
    const badTags = tags.filter(t => !TAGS.includes(t));
    if (!tags.length) errors.push("tags empty");
    if (badTags.length) errors.push(`invalid tags: ${badTags.join(" ")}`);

    // Palette
    const paletteRaw = (r.palette || "").split(/[;,\s]+/).map(s => s.trim()).filter(Boolean);
    const paletteNorm = paletteRaw.map(normHex).filter(Boolean) as string[];
    if (!paletteRaw.length) warnings.push("palette empty");
    if (paletteRaw.length && paletteNorm.length !== paletteRaw.length) {
      errors.push("palette contains invalid hex values");
    }

    // Affiliate override
    const affKey = (r.aff_param_key || "").trim();
    const affVal = (r.aff_param_value || "").trim();
    if (affKey && !/^[a-zA-Z0-9_\-]+$/.test(affKey)) errors.push("aff_param_key must be alphanumeric/_/-");
    if (affKey && !affVal) errors.push("aff_param_value required when aff_param_key is set");

    // Normalize
    const normalized: CsvRow = {
      id: (r.id || "").trim(),
      title: (r.title || "").trim(),
      image: (r.image || "").trim(),
      price: String(Math.round((priceNum || 0) * 100) / 100),
      url: (r.url || "").trim(),
      brand: (r.brand || "").trim(),
      tags: tags.join(","), // normalized delimiter
      palette: paletteNorm.join(","), // normalized uppercase hexes
      category: (r.category || "").trim(),
      aff_param_key: affKey,
      aff_param_value: affVal
    };

    // Status
    let status: RowStatus = "PASS";
    if (errors.length) status = "FAIL";
    else if (warnings.length) status = "WARN";

    if (status !== "FAIL") fixedRows.push(normalized);

    reports.push({ index: idx, status, errors, warnings, original: r, normalized });
  });

  const fixedCsv = toCsv(fixedRows, EXPECTED_HEADERS);
  const counts = {
    pass: reports.filter(r => r.status === "PASS").length,
    warn: reports.filter(r => r.status === "WARN").length,
    fail: reports.filter(r => r.status === "FAIL").length,
    total: reports.length
  };

  return { headersOk, missingHeaders: missing, extraHeaders: extra, rows: reports, counts, fixedCsv };
}
