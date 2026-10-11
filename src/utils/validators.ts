/**
 * Input Validation & Sanitization Utilities
 * Robust checks protecting against invalid transactions, NaN values, and XSS.
 * Built with care by Bhargavi N
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class Validators {
  /**
   * Sanitizes user input string against HTML injection
   */
  public static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/<[^>]*>?/gm, '');
  }

  /**
   * Validates monetary transaction amount
   */
  public static validateAmount(amount: number | string, maxAllowed: number = 1000000): ValidationResult {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) {
      return { isValid: false, error: 'Please enter a valid numeric amount.' };
    }
    if (num <= 0) {
      return { isValid: false, error: 'Amount must be greater than ₹0.' };
    }
    if (num > maxAllowed) {
      return { isValid: false, error: `Amount cannot exceed ₹${maxAllowed.toLocaleString('en-IN')}.` };
    }
    return { isValid: true };
  }

  /**
   * Validates cycle day number
   */
  public static validateDayNumber(day: number, totalDays: number = 30): ValidationResult {
    if (!Number.isInteger(day) || day < 1 || day > totalDays) {
      return { isValid: false, error: `Day must be an integer between 1 and ${totalDays}.` };
    }
    return { isValid: true };
  }
}
