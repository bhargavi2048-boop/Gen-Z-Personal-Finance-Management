import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  CategoryBudget,
  Commitment,
  DecisionImpact,
  DecisionSimulationInput,
  ExpenseCategory,
  FinancialHealth,
  ForecastPoint,
  Insight,
  SavingsGoal,
  Subscription,
  Transaction,
} from '../types';
import {
  INITIAL_CATEGORY_BUDGETS,
  INITIAL_COMMITMENTS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
} from '../constants/initialData';
import {
  calculateCategoryBreakdown,
  calculateFinancialHealth,
  calculateFinancialSummary,
  calculateMonthlyForecast,
  EngineFinancialSummary,
  generateFinancialInsights,
  simulateFinancialDecision,
} from '../engine/financialEngine';
import { StorageService } from '../services/storageService';
import { FinanceService } from '../services/financeService';

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'budget'
  | 'savings'
  | 'subscriptions'
  | 'simulator'
  | 'insights'
  | 'settings';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface FinanceContextType {
  // Config & Days
  initialBudget: number;
  setInitialBudget: (budget: number) => void;
  currentDay: number;
  setCurrentDay: (day: number) => void;
  totalDays: number;
  setTotalDays: (days: number) => void;

  // Active Screen
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Global Toast Feedback
  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Domain Entities
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  categoryBudgets: CategoryBudget[];
  updateCategoryLimit: (category: ExpenseCategory, newLimit: number) => void;

  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  editSubscription: (id: string, updated: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  toggleSimulateCancelSubscription: (id: string) => void;

  commitments: Commitment[];
  addCommitment: (com: Omit<Commitment, 'id'>) => void;
  markCommitmentPaid: (id: string) => void;
  deleteCommitment: (id: string) => void;

  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  editSavingsGoal: (id: string, updated: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToSavingsGoal: (goalId: string, amount: number) => boolean;
  withdrawFromSavingsGoal: (goalId: string, amount: number) => void;

  // Derived Financial Metrics
  summary: EngineFinancialSummary;
  categoryBreakdown: ReturnType<typeof calculateCategoryBreakdown>;
  health: FinancialHealth;
  forecast: ForecastPoint[];
  insights: Insight[];

  // Interactive Decision Simulation
  simulationInput: DecisionSimulationInput | null;
  simulationImpact: DecisionImpact | null;
  runSimulation: (input: DecisionSimulationInput) => void;
  clearSimulation: () => void;
  applySimulationDecision: () => void;

  // System actions
  resetToDefaults: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return StorageService.getItem<boolean>('theme_dark_mode', true);
  });

  const getTabFromHash = (): ActiveTab => {
    const hash = window.location.hash.replace('#/', '').toLowerCase();
    const validTabs: ActiveTab[] = [
      'dashboard',
      'transactions',
      'budget',
      'savings',
      'subscriptions',
      'simulator',
      'insights',
      'settings',
    ];
    return validTabs.includes(hash as ActiveTab) ? (hash as ActiveTab) : 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<ActiveTab>(getTabFromHash);

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    window.location.hash = `#/${tab}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setActiveTabState(tab);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Toast Notification State
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 2800);
  };

  // Core state with StorageService persistence
  const [initialBudget, setInitialBudget] = useState<number>(() => {
    return StorageService.getItem<number>('budget', 10000);
  });

  const [currentDay, setCurrentDay] = useState<number>(() => {
    return StorageService.getItem<number>('currentDay', 12);
  });

  const [totalDays, setTotalDays] = useState<number>(() => {
    return StorageService.getItem<number>('totalDays', 30);
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return StorageService.getItem<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    return StorageService.getItem<CategoryBudget[]>('categoryBudgets', INITIAL_CATEGORY_BUDGETS);
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    return StorageService.getItem<Subscription[]>('subscriptions', INITIAL_SUBSCRIPTIONS);
  });

  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    return StorageService.getItem<Commitment[]>('commitments', INITIAL_COMMITMENTS);
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    return StorageService.getItem<SavingsGoal[]>('savingsGoals', INITIAL_SAVINGS_GOALS);
  });

  // Decision Simulation sandbox state
  const [simulationInput, setSimulationInput] = useState<DecisionSimulationInput | null>(null);

  // Sync theme to document class & StorageService
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    StorageService.setItem('theme_dark_mode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Sync state changes to StorageService
  useEffect(() => {
    StorageService.setItem('budget', initialBudget);
    StorageService.setItem('currentDay', currentDay);
    StorageService.setItem('totalDays', totalDays);
    StorageService.setItem('transactions', transactions);
    StorageService.setItem('categoryBudgets', categoryBudgets);
    StorageService.setItem('subscriptions', subscriptions);
    StorageService.setItem('commitments', commitments);
    StorageService.setItem('savingsGoals', savingsGoals);
  }, [
    initialBudget,
    currentDay,
    totalDays,
    transactions,
    categoryBudgets,
    subscriptions,
    commitments,
    savingsGoals,
  ]);

  // Derived financial summary
  const summary = useMemo(() => {
    return calculateFinancialSummary(
      initialBudget,
      currentDay,
      totalDays,
      transactions,
      commitments,
      savingsGoals,
      subscriptions
    );
  }, [initialBudget, currentDay, totalDays, transactions, commitments, savingsGoals, subscriptions]);

  // Derived category breakdown
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(transactions, categoryBudgets, currentDay);
  }, [transactions, categoryBudgets, currentDay]);

  // Derived financial health
  const health = useMemo(() => {
    return calculateFinancialHealth(summary, categoryBudgets, transactions);
  }, [summary, categoryBudgets, transactions]);

  // Derived cash flow forecast
  const forecast = useMemo(() => {
    return calculateMonthlyForecast(
      initialBudget,
      currentDay,
      totalDays,
      transactions,
      commitments,
      subscriptions
    );
  }, [initialBudget, currentDay, totalDays, transactions, commitments, subscriptions]);

  // Derived insights
  const insights = useMemo(() => {
    return generateFinancialInsights(
      summary,
      categoryBudgets,
      transactions,
      subscriptions,
      savingsGoals
    );
  }, [summary, categoryBudgets, transactions, subscriptions, savingsGoals]);

  // Simulation impact calculation
  const simulationImpact = useMemo(() => {
    if (!simulationInput) return null;
    return simulateFinancialDecision(
      summary,
      health,
      simulationInput,
      categoryBudgets,
      transactions,
      commitments,
      savingsGoals,
      subscriptions
    );
  }, [
    simulationInput,
    summary,
    health,
    categoryBudgets,
    transactions,
    commitments,
    savingsGoals,
    subscriptions,
  ]);

  // Transaction mutations
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Recorded ${tx.type === 'income' ? 'income' : 'expense'}: ${tx.title} (₹${tx.amount})`, 'success');
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
    showToast('Transaction updated successfully', 'info');
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted', 'warning');
  };

  // Category limits
  const updateCategoryLimit = (category: ExpenseCategory, newLimit: number) => {
    setCategoryBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: Math.max(0, newLimit) } : b))
    );
    showToast(`Updated limit for ${category} to ₹${newLimit}`, 'info');
  };

  // Subscriptions
  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    const id = `sub-${Date.now()}`;
    const newSub: Subscription = { ...sub, id };
    setSubscriptions((prev) => [...prev, newSub]);

    // Also auto-create a recurring commitment for future billing
    const newCom: Commitment = {
      id: `com-${Date.now()}`,
      title: `${sub.name} Auto-Debit`,
      amount: sub.amount,
      dueDay: sub.billingDay,
      category: sub.category,
      isPaid: sub.billingDay < currentDay,
      subscriptionId: id,
    };
    setCommitments((prev) => [...prev, newCom]);
  };

  const editSubscription = (id: string, updated: Partial<Subscription>) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
    // Sync commitment amount/name if altered
    if (updated.amount !== undefined || updated.name !== undefined) {
      setCommitments((prev) =>
        prev.map((c) =>
          c.subscriptionId === id
            ? {
                ...c,
                amount: updated.amount !== undefined ? updated.amount : c.amount,
                title: updated.name !== undefined ? `${updated.name} Auto-Debit` : c.title,
              }
            : c
        )
      );
    }
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    // Remove linked upcoming commitment
    setCommitments((prev) => prev.filter((c) => c.subscriptionId !== id));
  };

  const toggleSimulateCancelSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, isSimulatedCancelled: !s.isSimulatedCancelled } : s
      )
    );
  };

  // Commitments
  const addCommitment = (com: Omit<Commitment, 'id'>) => {
    const newCom: Commitment = {
      ...com,
      id: `com-${Date.now()}`,
    };
    setCommitments((prev) => [...prev, newCom]);
  };

  const markCommitmentPaid = (id: string) => {
    const target = commitments.find((c) => c.id === id);
    if (!target) return;

    // 1. Mark commitment as paid
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPaid: true } : c))
    );

    // 2. Add as completed transaction to prevent double counting
    addTransaction({
      title: target.title,
      amount: target.amount,
      type: 'expense',
      category: target.category,
      date: new Date().toISOString().split('T')[0],
      dayNumber: currentDay,
      paymentMethod: 'UPI',
      notes: `Automated payment settlement for commitment`,
      subscriptionId: target.subscriptionId,
    });
  };

  const deleteCommitment = (id: string) => {
    setCommitments((prev) => prev.filter((c) => c.id !== id));
  };

  // Savings Goals
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: `Day ${currentDay}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const editSavingsGoal = (id: string, updated: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const contributeToSavingsGoal = (goalId: string, amount: number): boolean => {
    if (amount <= 0 || amount > summary.availableBalance) {
      return false;
    }

    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) }
          : g
      )
    );
    return true;
  };

  const withdrawFromSavingsGoal = (goalId: string, amount: number) => {
    if (amount <= 0) return;

    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) }
          : g
      )
    );
  };

  // Decision Simulator actions
  const runSimulation = (input: DecisionSimulationInput) => {
    setSimulationInput(input);
  };

  const clearSimulation = () => {
    setSimulationInput(null);
  };

  const applySimulationDecision = () => {
    if (!simulationInput) return;

    const { type, title, amount, category } = simulationInput;

    if (type === 'purchase' || type === 'emergency_shock' || type === 'custom') {
      addTransaction({
        title,
        amount,
        type: 'expense',
        category: category || 'other',
        date: new Date().toISOString().split('T')[0],
        dayNumber: currentDay,
        paymentMethod: 'UPI',
        notes: `Applied from Decision Simulator: ${simulationInput.notes || title}`,
      });
    } else if (type === 'income_boost') {
      addTransaction({
        title,
        amount,
        type: 'income',
        category: 'freelance',
        date: new Date().toISOString().split('T')[0],
        dayNumber: currentDay,
        paymentMethod: 'UPI',
        notes: `Applied from Decision Simulator bonus`,
      });
    } else if (type === 'save') {
      // Allocate to first eligible goal or create a buffer goal
      if (savingsGoals.length > 0) {
        contributeToSavingsGoal(savingsGoals[0].id, amount);
      }
    } else if (type === 'subscription_change') {
      addCommitment({
        title: `${title} (Simulated addition)`,
        amount,
        dueDay: Math.min(30, currentDay + 5),
        category: category || 'bills',
        isPaid: false,
      });
    }

    clearSimulation();
  };

  // Reset demo
  const resetToDefaults = () => {
    setInitialBudget(10000);
    setCurrentDay(12);
    setTotalDays(30);
    setTransactions(INITIAL_TRANSACTIONS);
    setCategoryBudgets(INITIAL_CATEGORY_BUDGETS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setCommitments(INITIAL_COMMITMENTS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setSimulationInput(null);
    StorageService.clearAll();
  };

  // Export & Import using FinanceService
  const exportDataJSON = (): string => {
    return FinanceService.exportSnapshot({
      initialBudget,
      currentDay,
      totalDays,
      transactions,
      categoryBudgets,
      subscriptions,
      commitments,
      savingsGoals,
    });
  };

  const importDataJSON = (jsonString: string): boolean => {
    const parsed = FinanceService.parseSnapshot(jsonString);
    if (!parsed) return false;
    setInitialBudget(parsed.initialBudget);
    setCurrentDay(parsed.currentDay);
    setTotalDays(parsed.totalDays);
    setTransactions(parsed.transactions);
    setCategoryBudgets(parsed.categoryBudgets);
    setSubscriptions(parsed.subscriptions);
    setCommitments(parsed.commitments);
    setSavingsGoals(parsed.savingsGoals);
    return true;
  };

  return (
    <FinanceContext.Provider
      value={{
        initialBudget,
        setInitialBudget,
        currentDay,
        setCurrentDay,
        totalDays,
        setTotalDays,
        activeTab,
        setActiveTab,
        toast,
        showToast,
        isDarkMode,
        toggleDarkMode,
        transactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        categoryBudgets,
        updateCategoryLimit,
        subscriptions,
        addSubscription,
        editSubscription,
        deleteSubscription,
        toggleSimulateCancelSubscription,
        commitments,
        addCommitment,
        markCommitmentPaid,
        deleteCommitment,
        savingsGoals,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        contributeToSavingsGoal,
        withdrawFromSavingsGoal,
        summary,
        categoryBreakdown,
        health,
        forecast,
        insights,
        simulationInput,
        simulationImpact,
        runSimulation,
        clearSimulation,
        applySimulationDecision,
        resetToDefaults,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
