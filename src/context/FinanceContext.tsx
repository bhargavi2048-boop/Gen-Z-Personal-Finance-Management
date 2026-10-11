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

const STORAGE_KEY = 'genz_finance_state_v1';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme_preference');
    return saved ? saved === 'dark' : true; // Default to dark for premium Gen Z look
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

  // Core state with local storage fallback
  const [initialBudget, setInitialBudget] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_budget`);
    return saved ? Number(saved) : 10000;
  });

  const [currentDay, setCurrentDay] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentDay`);
    return saved ? Number(saved) : 12;
  });

  const [totalDays, setTotalDays] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_totalDays`);
    return saved ? Number(saved) : 30;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_categoryBudgets`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORY_BUDGETS;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subscriptions`);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_commitments`);
    return saved ? JSON.parse(saved) : INITIAL_COMMITMENTS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_savingsGoals`);
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  // Decision Simulation sandbox state
  const [simulationInput, setSimulationInput] = useState<DecisionSimulationInput | null>(null);

  // Sync theme to document class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_preference', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_preference', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_budget`, initialBudget.toString());
    localStorage.setItem(`${STORAGE_KEY}_currentDay`, currentDay.toString());
    localStorage.setItem(`${STORAGE_KEY}_totalDays`, totalDays.toString());
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${STORAGE_KEY}_categoryBudgets`, JSON.stringify(categoryBudgets));
    localStorage.setItem(`${STORAGE_KEY}_subscriptions`, JSON.stringify(subscriptions));
    localStorage.setItem(`${STORAGE_KEY}_commitments`, JSON.stringify(commitments));
    localStorage.setItem(`${STORAGE_KEY}_savingsGoals`, JSON.stringify(savingsGoals));
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
    localStorage.clear();
  };

  // Export & Import
  const exportDataJSON = (): string => {
    const data = {
      initialBudget,
      currentDay,
      totalDays,
      transactions,
      categoryBudgets,
      subscriptions,
      commitments,
      savingsGoals,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.initialBudget !== undefined) setInitialBudget(Number(data.initialBudget));
      if (data.currentDay !== undefined) setCurrentDay(Number(data.currentDay));
      if (data.totalDays !== undefined) setTotalDays(Number(data.totalDays));
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.categoryBudgets)) setCategoryBudgets(data.categoryBudgets);
      if (Array.isArray(data.subscriptions)) setSubscriptions(data.subscriptions);
      if (Array.isArray(data.commitments)) setCommitments(data.commitments);
      if (Array.isArray(data.savingsGoals)) setSavingsGoals(data.savingsGoals);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
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
