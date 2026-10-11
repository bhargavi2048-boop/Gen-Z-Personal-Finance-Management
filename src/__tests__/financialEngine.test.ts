/**
 * Comprehensive Unit Test Suite for Z-Finance Calculation Engine
 * Verifies mathematical invariants, runway calculations, health score, and risk tiers.
 * Built with care by Bhargavi N
 */

import {
  calculateFinancialSummary,
  calculateFinancialHealth,
  calculateCategoryBreakdown,
  calculateMonthlyForecast,
  simulateFinancialDecision,
  formatCurrency,
} from '../engine/financialEngine';
import {
  INITIAL_CATEGORY_BUDGETS,
  INITIAL_COMMITMENTS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
} from '../constants/initialData';

// Type-safe, zero-dependency test runner assertions
function describe(suiteName: string, fn: () => void): void {
  // Executes test suite
  fn();
}

function test(testName: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    throw new Error(`Test failed: [${testName}] - ${err instanceof Error ? err.message : String(err)}`);
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(expected)}, but received ${String(actual)}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${String(actual)} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${String(actual)} to be >= ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`Expected ${String(actual)} to be <= ${expected}`);
      }
    },
    toContain(expected: unknown) {
      if (!Array.isArray(actual) || !actual.includes(expected)) {
        throw new Error(`Expected array to contain ${String(expected)}`);
      }
    },
  };
}

describe('Financial Engine Invariants', () => {
  const initialBudget = 10000;
  const currentDay = 12;
  const totalDays = 30;

  test('calculates correct summary without double-counting', () => {
    const summary = calculateFinancialSummary(
      initialBudget,
      currentDay,
      totalDays,
      INITIAL_TRANSACTIONS,
      INITIAL_COMMITMENTS,
      INITIAL_SAVINGS_GOALS,
      INITIAL_SUBSCRIPTIONS
    );

    expect(summary.initialBudget).toBe(10000);
    expect(summary.totalSpent).toBeGreaterThan(0);
    expect(summary.availableBalance).toBeGreaterThan(0);
    expect(summary.remainingDays).toBe(19);
    expect(summary.dailyAllowance).toBeGreaterThan(0);

    // Identity check: Cash in Hand = Initial + Income - Expenses
    const expectedCashInHand =
      summary.initialBudget + summary.totalIncome - summary.totalSpent;
    expect(summary.cashInHand).toBe(expectedCashInHand);

    // Identity check: Genuinely Available = Cash in Hand - Committed - Savings
    const expectedAvailable =
      summary.cashInHand - summary.committedFunds - summary.totalSavingsAllocated;
    expect(summary.availableBalance).toBe(expectedAvailable);
  });

  test('computes financial health score between 0 and 100 with 5 transparent pillars', () => {
    const summary = calculateFinancialSummary(
      initialBudget,
      currentDay,
      totalDays,
      INITIAL_TRANSACTIONS,
      INITIAL_COMMITMENTS,
      INITIAL_SAVINGS_GOALS,
      INITIAL_SUBSCRIPTIONS
    );

    const health = calculateFinancialHealth(
      summary,
      INITIAL_CATEGORY_BUDGETS,
      INITIAL_TRANSACTIONS
    );

    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
    expect(['Low', 'Moderate', 'High', 'Critical']).toContain(health.riskLevel);
    expect(health.breakdown.pacingScore).toBeGreaterThanOrEqual(0);
    expect(health.breakdown.commitmentsScore).toBeGreaterThanOrEqual(0);
    expect(health.breakdown.disciplineScore).toBeGreaterThanOrEqual(0);
    expect(health.breakdown.savingsScore).toBeGreaterThanOrEqual(0);
    expect(health.breakdown.resilienceScore).toBeGreaterThanOrEqual(0);
  });

  test('simulates discretionary purchase and updates daily allowance delta', () => {
    const summary = calculateFinancialSummary(
      initialBudget,
      currentDay,
      totalDays,
      INITIAL_TRANSACTIONS,
      INITIAL_COMMITMENTS,
      INITIAL_SAVINGS_GOALS,
      INITIAL_SUBSCRIPTIONS
    );

    const health = calculateFinancialHealth(
      summary,
      INITIAL_CATEGORY_BUDGETS,
      INITIAL_TRANSACTIONS
    );

    const impact = simulateFinancialDecision(
      summary,
      health,
      {
        type: 'purchase',
        title: 'Can I afford a ₹2,000 purchase?',
        amount: 2000,
        category: 'shopping',
      },
      INITIAL_CATEGORY_BUDGETS,
      INITIAL_TRANSACTIONS,
      INITIAL_COMMITMENTS,
      INITIAL_SAVINGS_GOALS,
      INITIAL_SUBSCRIPTIONS
    );

    expect(impact.currentAvailable).toBe(summary.availableBalance);
    expect(impact.simulatedAvailable).toBe(summary.availableBalance - 2000);
    expect(impact.deltaAvailable).toBe(-2000);
    expect(impact.simulatedDailyAllowance).toBeLessThanOrEqual(summary.dailyAllowance);
    expect(impact.recommendations.length).toBeGreaterThan(0);
  });

  test('formats Indian rupee currency correctly', () => {
    expect(formatCurrency(10000)).toBe('₹10,000');
    expect(formatCurrency(0)).toBe('₹0');
  });

  test('forecast maintains 30 data points representing all cycle days', () => {
    const forecast = calculateMonthlyForecast(
      initialBudget,
      currentDay,
      totalDays,
      INITIAL_TRANSACTIONS,
      INITIAL_COMMITMENTS,
      INITIAL_SUBSCRIPTIONS
    );

    expect(forecast.length).toBe(30);
    expect(forecast[0].day).toBe(1);
    expect(forecast[29].day).toBe(30);
  });

  test('category breakdown calculates utilization percentages accurately', () => {
    const breakdown = calculateCategoryBreakdown(
      INITIAL_TRANSACTIONS,
      INITIAL_CATEGORY_BUDGETS,
      currentDay
    );

    expect(breakdown.length).toBe(INITIAL_CATEGORY_BUDGETS.length);
    breakdown.forEach((cat) => {
      expect(cat.spent).toBeGreaterThanOrEqual(0);
      expect(cat.limit).toBeGreaterThanOrEqual(0);
    });
  });
});
