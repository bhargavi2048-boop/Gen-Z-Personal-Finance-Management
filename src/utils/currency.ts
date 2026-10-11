/**
 * Indian Rupee & Monetary Utilities
 * Built with care by Bhargavi N
 */

/**
 * Formats a numeric value into the standard Indian numbering system (lakhs, crores).
 * Example: 10000 -> "₹10,000", 150000 -> "₹1,50,000"
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const absValue = Math.abs(rounded);

  // Standard Indian formatting
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(absValue);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Converts integer paise to rupees
 */
export function paiseToRupees(paise: number): number {
  return Math.round(paise / 100);
}

/**
 * Converts rupees to integer paise to eliminate floating-point imprecision
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
