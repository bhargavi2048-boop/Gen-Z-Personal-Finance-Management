/**
 * Finance Domain API & Export Service
 * Manages JSON backup import/export, data verification, and transactional payloads.
 * Built with care by Bhargavi N
 */

import {
  CategoryBudget,
  Commitment,
  SavingsGoal,
  Subscription,
  Transaction,
} from '../types';

export interface FinanceExportPayload {
  version: string;
  timestamp: string;
  initialBudget: number;
  currentDay: number;
  totalDays: number;
  transactions: Transaction[];
  categoryBudgets: CategoryBudget[];
  subscriptions: Subscription[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
}

export class FinanceService {
  /**
   * Generates a portable JSON export snapshot
   */
  public static exportSnapshot(data: Omit<FinanceExportPayload, 'version' | 'timestamp'>): string {
    const payload: FinanceExportPayload = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      ...data,
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Validates and imports a JSON backup snapshot
   */
  public static parseSnapshot(jsonString: string): FinanceExportPayload | null {
    try {
      const parsed = JSON.parse(jsonString) as Partial<FinanceExportPayload>;

      // Strict validation checks
      if (
        typeof parsed.initialBudget !== 'number' ||
        typeof parsed.currentDay !== 'number' ||
        typeof parsed.totalDays !== 'number' ||
        !Array.isArray(parsed.transactions) ||
        !Array.isArray(parsed.categoryBudgets) ||
        !Array.isArray(parsed.subscriptions) ||
        !Array.isArray(parsed.commitments) ||
        !Array.isArray(parsed.savingsGoals)
      ) {
        throw new Error('Invalid schema in imported snapshot.');
      }

      return parsed as FinanceExportPayload;
    } catch (error) {
      console.error('[FinanceService] Snapshot parsing error:', error);
      return null;
    }
  }
}
