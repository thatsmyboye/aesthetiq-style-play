import { AestheticTag } from '@/types/domain';

export interface ParsedProduct {
  title: string;
  image: string;
  price: number;
  url: string;
  brand: string;
  tags: AestheticTag[];
  palette: string[];
}

export interface ParseResult {
  products: ParsedProduct[];
  errors: string[];
}

const VALID_TAGS: AestheticTag[] = [
  'minimal',
  'maximal',
  'midcentury',
  'brutalist',
  'coquette',
  'vintage',
  'industrial',
  'organic',
  'glasscore',
  'coastal',
  'pastel',
  'monochrome',
  'boldcolor',
  'natural_fiber',
  'metallic',
  'curved',
  'angular',
  'soft_light',
  'high_contrast',
  'neutral_palette',
];

function isValidTag(tag: string): tag is AestheticTag {
  return VALID_TAGS.includes(tag as AestheticTag);
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

export function parseCSV(csvText: string): ParseResult {
  const lines = csvText.trim().split('\n');
  const errors: string[] = [];
  const products: ParsedProduct[] = [];

  if (lines.length < 2) {
    errors.push('CSV must contain a header row and at least one product');
    return { products, errors };
  }

  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const requiredColumns = ['title', 'image', 'price', 'url', 'brand', 'tags', 'palette'];

  // Validate header
  for (const col of requiredColumns) {
    if (!header.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  }

  if (errors.length > 0) {
    return { products, errors };
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

    if (!row.title) rowErrors.push(`Row ${i}: Missing title`);
    if (!row.image) rowErrors.push(`Row ${i}: Missing image URL`);
    if (!row.url) rowErrors.push(`Row ${i}: Missing product URL`);
    if (!row.brand) rowErrors.push(`Row ${i}: Missing brand`);

    const price = parseFloat(row.price);
    if (isNaN(price) || price <= 0) {
      rowErrors.push(`Row ${i}: Invalid price "${row.price}"`);
    }

    // Parse tags
    const tagStrings = row.tags.split(',').map((t) => t.trim());
    const validTags: AestheticTag[] = [];
    const invalidTags: string[] = [];

    for (const tag of tagStrings) {
      if (isValidTag(tag)) {
        validTags.push(tag);
      } else {
        invalidTags.push(tag);
      }
    }

    if (validTags.length === 0) {
      rowErrors.push(`Row ${i}: No valid tags found`);
    }
    if (invalidTags.length > 0) {
      rowErrors.push(`Row ${i}: Invalid tags: ${invalidTags.join(', ')}`);
    }

    // Parse palette
    const paletteStrings = row.palette.split(',').map((p) => p.trim());
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
      products.push({
        title: row.title,
        image: row.image,
        price,
        url: row.url,
        brand: row.brand,
        tags: validTags,
        palette: validPalette,
      });
    }
  }

  return { products, errors };
}

export function getValidTags(): AestheticTag[] {
  return [...VALID_TAGS];
}
