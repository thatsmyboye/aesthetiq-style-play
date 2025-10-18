import { config } from '@/config';

/**
 * Append affiliate ID to product URL if in affiliate mode
 */
export function getAffiliateUrl(baseUrl: string, brandId: string): string {
  if (!config.AFFILIATE_MODE) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('affid', brandId);
    return url.toString();
  } catch (error) {
    // If URL parsing fails, just append as query string
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}affid=${encodeURIComponent(brandId)}`;
  }
}
