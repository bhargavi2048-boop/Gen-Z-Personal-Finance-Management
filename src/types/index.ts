export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'education'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'healthcare'
  | 'personal'
  | 'other';

export type IncomeCategory =
  | 'allowance'
  | 'stipend'
  | 'freelance'
  | 'gift'
  | 'cashback'
  | 'other_income';

export type Category = ExpenseCategory | IncomeCategory;

export type PaymentMethod = 'UPI' | 'Card' | 'Cash' | 'NetBanking';

export interface Transaction {
  id: string;
  title: string;
  amount: number; // stored in rupees (integer or 2 decimals)
  type: TransactionType;
  category: Category;
  date: string; // YYYY-MM-DD
  dayNumber: number; // Day 1 to 30 within current cycle
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  subscriptionId?: string;
  createdAt: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  limit: number;
  label: string;
  color: string;
  icon: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDay: number; // 1 to 30
  category: ExpenseCategory;
  provider: string;
  isSimulatedCancelled?: boolean;
  description?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadlineDay: number; // 1 to 30
  category: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface Commitment {
  id: string;
  title: string;
  amount: number;
  dueDay: number; // 1 to 30
  category: ExpenseCategory;
  isPaid: boolean;
  subscriptionId?: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface HealthScoreBreakdown {
  pacingScore: number;      // 0 - 25: daily burn rate vs ideal
  commitmentsScore: number; // 0 - 20: commitments burden ratio
  disciplineScore: number;  // 0 - 20: category adherence
  savingsScore: number;     // 0 - 20: savings contributions & progress
  resilienceScore: number;  // 0 - 15: buffer to absorb ₹1500 emergency
}

export interface FinancialHealth {
  score: number; // 0 - 100
  tier: 'Excellent' | 'Good' | 'Fair' | 'Vulnerable' | 'Critical';
  riskLevel: RiskLevel;
  breakdown: HealthScoreBreakdown;
  summary: string;
  keyFactors: { title: string; status: 'good' | 'warning' | 'danger'; desc: string }[];
}

export interface ForecastPoint {
  day: number;
  label: string;
  isActual: boolean;
  actualBalance?: number;
  expectedBalance: number;
  optimisticBalance: number;
  highSpendBalance: number;
  dailyCommitment: number;
}

export interface Insight {
  id: string;
  type: 'critical' | 'warning' | 'tip' | 'positive';
  title: string;
  message: string;
  evidence: string; // Transparent "Why this appears"
  actionable?: string;
  metric?: string;
  category?: string;
}

export interface DecisionSimulationInput {
  type: 'purchase' | 'save' | 'subscription_change' | 'income_boost' | 'emergency_shock' | 'custom';
  title: string;
  amount: number;
  category?: ExpenseCategory;
  isRecurringMonthly?: boolean;
  notes?: string;
}

export interface DecisionImpact {
  input: DecisionSimulationInput;
  currentAvailable: number;
  simulatedAvailable: number;
  deltaAvailable: number;
  
  currentDailyAllowance: number;
  simulatedDailyAllowance: number;
  deltaDailyAllowance: number;
  
  currentForecastEnd: number;
  simulatedForecastEnd: number;
  deltaForecastEnd: number;
  
  currentHealthScore: number;
  simulatedHealthScore: number;
  deltaHealthScore: number;
  
  currentRiskLevel: RiskLevel;
  simulatedRiskLevel: RiskLevel;
  
  savingsGoalImpact: string;
  recommendations: string[];
  tradeOffs: string[];
  isAffordable: boolean;
}

export interface FinancialState {
  initialBudget: number; // ₹10,000 default
  currentDay: number;    // e.g. Day 12
  totalDays: number;     // 30
  transactions: Transaction[];
  categoryBudgets: Record<ExpenseCategory, number>;
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  commitments: Commitment[];
}
