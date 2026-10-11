/**
 * Date and Pacing Utilities for 30-Day Budget Cycles
 * Built with care by Bhargavi N
 */

/**
 * Calculates remaining days in cycle inclusive of current day
 */
export function getRemainingDays(currentDay: number, totalDays: number = 30): number {
  return Math.max(0, totalDays - currentDay + 1);
}

/**
 * Computes calendar date offset for simulation day
 */
export function getCycleCalendarDate(dayNumber: number, baseDate: Date = new Date()): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + (dayNumber - 1));
  return date.toISOString().split('T')[0];
}

/**
 * Formats a short display date
 */
export function formatDisplayDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return isoDate;
  }
}
