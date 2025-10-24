type Fit = "cover" | "contain";

export function imgUrl(u: string, w: number, h?: number, fit: Fit = "cover") {
  try {
    const url = new URL(u);
    const host = url.hostname;
    
    if (/images\.unsplash\.com$/.test(host)) {
      // Unsplash params
      url.searchParams.set("w", String(w));
      if (h) url.searchParams.set("h", String(h));
      url.searchParams.set("fit", fit === "cover" ? "crop" : "max");
      return url.toString();
    }
    
    if (/res\.cloudinary\.com|cloudinary\.com/.test(host)) {
      // Cloudinary
      const path = url.pathname;
      const prefix = path.includes("/upload/") ? path.split("/upload/")[0] + "/upload" : "/upload";
      const transform = `c_${fit === "cover" ? "fill" : "fit"},w_${w}${h ? ",h_"+h : ""}`;
      url.pathname = `${prefix}/${transform}${path.split("/upload")[1]}`;
      return url.toString();
    }
    
    if (/imgix\.net$/.test(host)) {
      url.searchParams.set("w", String(w));
      if (h) url.searchParams.set("h", String(h));
      url.searchParams.set("fit", fit === "cover" ? "crop" : "max");
      url.searchParams.set("auto", "format,compress");
      return url.toString();
    }
    
    // Fallback: return original
    return u;
  } catch {
    return u;
  }
}
