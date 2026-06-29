/**
 * Centralized, localization-aware enterprise formatting utilities
 */

/**
 * Format dynamic retail currency based on locale
 * - 'vi': VND (₫) formatting with dot groupings and integer rounding
 * - 'en': USD ($) formatting with standard dot decimal grouping
 */
export function formatCurrency(value: number, locale: string = 'en'): string {
  if (locale === 'vi') {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

/**
 * Compact format for extremely large currency or metrics numbers
 * e.g., 12.5M, 45.2K
 */
export function formatCompactNumber(value: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format dynamic trend percentage values
 * e.g., +12.5% or -4.2%
 */
export function formatPercentage(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

/**
 * Format timestamp into detailed business-readable date/time string
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US").format(d);
}

/**
 * Helper to calculate growth percentage between two values
 */
export function calculateTrend(current: number, previous: number): { value: number; isUp: boolean } {
  if (previous <= 0) {
    return { value: current > 0 ? 100 : 0, isUp: current > 0 };
  }
  const pct = Number((((current - previous) / previous) * 100).toFixed(1));
  return {
    value: Math.abs(pct),
    isUp: pct >= 0,
  };
}
