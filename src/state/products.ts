import type { Product } from "@/types/domain";

const KEY = "aesthetiq.products.v1";

export function loadProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProducts(ps: Product[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ps));
  } catch {}
}
