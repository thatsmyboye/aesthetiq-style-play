import { AestheticTag } from '@/types/domain';

export interface ParsedImage {
  url: string;
  tags: string[];
  palette: string[];
  source?: string;
}

export interface ImageParseResult {
  images: ParsedImage[];
  errors: string[];
}

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function parseImageCSV(csvText: string): ImageParseResult {
  const lines = csvText.trim().split('\n');
  const errors: string[] = [];
  const images: ParsedImage[] = [];

  if (lines.length < 2) {
    errors.push('CSV must contain a header row and at least one image');
    return { images, errors };
  }

  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const requiredColumns = ['url', 'tags', 'palette'];

  // Validate header
  for (const col of requiredColumns) {
    if (!header.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  }

  if (errors.length > 0) {
    return { images, errors };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: Record<string, string> = {};

    header.forEach((col, idx) => {
      row[col] = values[idx] || '';
    });

    // Validate and parse row
    const rowErrors: string[] = [];

    if (!row.url) {
      rowErrors.push(`Row ${i}: Missing URL`);
    } else if (!row.url.startsWith('http')) {
      rowErrors.push(`Row ${i}: Invalid URL "${row.url}"`);
    }

    // Parse tags
    const tagStrings = row.tags
      ? row.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    if (tagStrings.length === 0) {
      rowErrors.push(`Row ${i}: No tags found`);
    }

    // Parse palette
    const paletteStrings = row.palette
      ? row.palette.split(',').map((p) => p.trim()).filter(Boolean)
      : [];
    const validPalette: string[] = [];
    const invalidPalette: string[] = [];

    for (const hex of paletteStrings) {
      if (isValidHex(hex)) {
        validPalette.push(hex.toUpperCase());
      } else {
        invalidPalette.push(hex);
      }
    }

    if (validPalette.length === 0) {
      rowErrors.push(`Row ${i}: No valid palette colors found`);
    }
    if (invalidPalette.length > 0) {
      rowErrors.push(`Row ${i}: Invalid palette colors: ${invalidPalette.join(', ')}`);
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      images.push({
        url: row.url,
        tags: tagStrings,
        palette: validPalette,
        source: row.source || undefined,
      });
    }
  }

  return { images, errors };
}
