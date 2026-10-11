import {
  CategoryBudget,
  Commitment,
  DecisionImpact,
  DecisionSimulationInput,
  ExpenseCategory,
  FinancialHealth,
  ForecastPoint,
  Insight,
  RiskLevel,
  SavingsGoal,
  Subscription,
  Transaction,
} from '../types';

import { formatCurrency } from '../utils/currency';
export { formatCurrency };

export interface EngineFinancialSummary {
  initialBudget: number;
  totalIncome: number;
  totalSpent: number;
  committedFunds: number;
  totalSavingsAllocated: number;
  cashInHand: number;
  availableBalance: number;
  currentDay: number;
  totalDays: number;
  remainingDays: number;
  dailyAllowance: number;
  burnRatePerDay: number;
  projectedEndBalance: number;
  budgetUtilizationPct: number;
}

/**
 * Calculate the core single-source-of-truth financial metrics
 */
export const calculateFinancialSummary = (
  initialBudget: number,
  currentDay: number,
  totalDays: number,
  transactions: Transaction[],
  commitments: Commitment[],
  savingsGoals: SavingsGoal[],
  subscriptions: Subscription[]
): EngineFinancialSummary => {
  // 1. Calculate Income (exclude initial baseline transaction if marked as income)
  const additionalIncome = transactions
    .filter((t) => t.type === 'income' && t.id !== 'tx-0')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = additionalIncome;

  // 2. Calculate Total Spent (only expenses up to current day)
  const totalSpent = transactions
    .filter((t) => t.type === 'expense' && t.dayNumber <= currentDay)
    .reduce((acc, t) => acc + t.amount, 0);

  // 3. Calculate Upcoming Active Commitments (not yet paid)
  // Check if simulated cancelled subscription affects commitments
  const cancelledSubIds = new Set(
    subscriptions.filter((s) => s.isSimulatedCancelled).map((s) => s.id)
  );

  const committedFunds = commitments
    .filter((c) => {
      if (c.isPaid) return false;
      if (c.subscriptionId && cancelledSubIds.has(c.subscriptionId)) return false;
      return c.dueDay >= currentDay;
    })
    .reduce((acc, c) => acc + c.amount, 0);

  // 4. Calculate Total Savings currently locked/stashed in goals
  const totalSavingsAllocated = savingsGoals.reduce(
    (acc, g) => acc + g.currentAmount,
    0
  );

  // 5. Cash in hand = Total liquid money received minus what has been spent
  const cashInHand = initialBudget + totalIncome - totalSpent;

  // 6. Genuinely Available Discretionary Balance
  // Available = Cash In Hand - Upcoming Fixed Commitments - Money stashed in Savings
  const availableBalance = cashInHand - committedFunds - totalSavingsAllocated;

  // 7. Days remaining (including today)
  const remainingDays = Math.max(1, totalDays - currentDay + 1);

  // 8. Dynamic Daily Allowance
  const dailyAllowance = remainingDays > 0 ? Math.max(0, Math.floor(availableBalance / remainingDays)) : 0;

  // 9. Historical daily burn rate
  const burnRatePerDay = currentDay > 0 ? Math.round(totalSpent / currentDay) : 0;

  // 10. Projected end-of-period balance:
  // Assuming current burn rate continues for remaining days + upcoming commitments
  const projectedEndBalance = Math.round(cashInHand - committedFunds - (burnRatePerDay * remainingDays));

  // 11. Budget utilization %
  const totalEffectiveBudget = initialBudget + totalIncome;
  const budgetUtilizationPct = totalEffectiveBudget > 0
    ? Math.min(100, Math.round(((totalSpent + committedFunds + totalSavingsAllocated) / totalEffectiveBudget) * 100))
    : 0;

  return {
    initialBudget,
    totalIncome,
    totalSpent,
    committedFunds,
    totalSavingsAllocated,
    cashInHand,
    availableBalance,
    currentDay,
    totalDays,
    remainingDays,
    dailyAllowance,
    burnRatePerDay,
    projectedEndBalance,
    budgetUtilizationPct,
  };
};

/**
 * Category-specific spending calculation and budget comparison
 */
export const calculateCategoryBreakdown = (
  transactions: Transaction[],
  categoryBudgets: CategoryBudget[],
  currentDay: number
) => {
  const spendingMap: Record<ExpenseCategory, number> = {
    food: 0,
    transport: 0,
    education: 0,
    shopping: 0,
    entertainment: 0,
    bills: 0,
    healthcare: 0,
    personal: 0,
    other: 0,
  };

  transactions
    .filter((t) => t.type === 'expense' && t.dayNumber <= currentDay)
    .forEach((t) => {
      const cat = t.category as ExpenseCategory;
      if (spendingMap[cat] !== undefined) {
        spendingMap[cat] += t.amount;
      } else {
        spendingMap.other += t.amount;
      }
    });

  return categoryBudgets.map((b) => {
    const spent = spendingMap[b.category] || 0;
    const remaining = b.limit - spent;
    const percent = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
    const status: 'safe' | 'warning' | 'danger' =
      percent > 90 ? 'danger' : percent >= 70 ? 'warning' : 'safe';

    return {
      category: b.category,
      label: b.label,
      limit: b.limit,
      spent,
      remaining,
      percent,
      status,
      color: b.color,
      icon: b.icon,
    };
  });
};

/**
 * Transparent Financial Health Score Engine (0-100)
 */
export const calculateFinancialHealth = (
  summary: EngineFinancialSummary,
  categoryBudgets: CategoryBudget[],
  transactions: Transaction[]
): FinancialHealth => {
  const {
    initialBudget,
    totalIncome,
    committedFunds,
    availableBalance,
    currentDay,
    totalDays,
    burnRatePerDay,
    totalSavingsAllocated,
  } = summary;

  const totalFunds = initialBudget + totalIncome;
  const idealDailySpend = totalFunds / totalDays;

  // 1. Pacing Score (0 - 25 pts)
  let pacingScore = 25;
  if (currentDay > 0) {
    const paceRatio = burnRatePerDay / Math.max(1, idealDailySpend);
    if (paceRatio <= 1.0) pacingScore = 25;
    else if (paceRatio <= 1.15) pacingScore = 20;
    else if (paceRatio <= 1.35) pacingScore = 14;
    else if (paceRatio <= 1.6) pacingScore = 8;
    else pacingScore = 3;
  }

  // 2. Commitments Score (0 - 20 pts)
  const commitmentRatio = committedFunds / Math.max(1, totalFunds);
  let commitmentsScore = 20;
  if (commitmentRatio <= 0.15) commitmentsScore = 20;
  else if (commitmentRatio <= 0.25) commitmentsScore = 16;
  else if (commitmentRatio <= 0.4) commitmentsScore = 11;
  else commitmentsScore = 5;

  // 3. Category Discipline Score (0 - 20 pts)
  const categoryStats = calculateCategoryBreakdown(transactions, categoryBudgets, currentDay);
  const breachedCategories = categoryStats.filter((c) => c.spent > c.limit).length;
  const warningCategories = categoryStats.filter((c) => c.status === 'warning').length;
  const disciplineScore = Math.max(0, 20 - breachedCategories * 8 - warningCategories * 3);

  // 4. Savings Progress Score (0 - 20 pts)
  const savingsRatio = totalSavingsAllocated / Math.max(1, totalFunds);
  let savingsScore = 10;
  if (savingsRatio >= 0.2) savingsScore = 20;
  else if (savingsRatio >= 0.12) savingsScore = 16;
  else if (savingsRatio >= 0.05) savingsScore = 12;
  else savingsScore = 6;

  // 5. Emergency Resilience Score (0 - 15 pts)
  // Ability to absorb unexpected ₹1,500 shock with available balance
  let resilienceScore = 0;
  if (availableBalance >= 2500) resilienceScore = 15;
  else if (availableBalance >= 1500) resilienceScore = 11;
  else if (availableBalance >= 800) resilienceScore = 7;
  else if (availableBalance > 0) resilienceScore = 3;
  else resilienceScore = 0;

  const totalScore = Math.min(
    100,
    Math.max(0, pacingScore + commitmentsScore + disciplineScore + savingsScore + resilienceScore)
  );

  let tier: FinancialHealth['tier'] = 'Good';
  let riskLevel: RiskLevel = 'Low';

  if (totalScore >= 85) {
    tier = 'Excellent';
    riskLevel = 'Low';
  } else if (totalScore >= 70) {
    tier = 'Good';
    riskLevel = 'Low';
  } else if (totalScore >= 50) {
    tier = 'Fair';
    riskLevel = 'Moderate';
  } else if (totalScore >= 35) {
    tier = 'Vulnerable';
    riskLevel = 'High';
  } else {
    tier = 'Critical';
    riskLevel = 'Critical';
  }

  // Summary generation
  let summaryText = '';
  if (tier === 'Excellent') {
    summaryText = 'Outstanding financial discipline! Your daily pace is healthy, commitments are well-buffered, and savings goals are well protected.';
  } else if (tier === 'Good') {
    summaryText = 'Solid financial management. You are comfortably pacing your ₹10,000 budget with reasonable room for daily needs.';
  } else if (tier === 'Fair') {
    summaryText = 'Moderate financial stress. Daily burn rate is slightly outpacing targets. A small pullback on dining or entertainment will stabilize your runway.';
  } else if (tier === 'Vulnerable') {
    summaryText = 'Elevated financial risk. Upcoming bill commitments and recent spending are squeezing your remaining daily allowance.';
  } else {
    summaryText = 'Critical cash-flow alert! Available funds are depleted or dangerously close to zero. Immediate spending freeze recommended.';
  }

  const keyFactors = [
    {
      title: 'Daily Spend Pacing',
      status: pacingScore >= 18 ? ('good' as const) : pacingScore >= 10 ? ('warning' as const) : ('danger' as const),
      desc: `Pacing score: ${pacingScore}/25. Averaging ₹${burnRatePerDay}/day vs target ₹${Math.round(idealDailySpend)}/day.`,
    },
    {
      title: 'Upcoming Commitments Burden',
      status: commitmentsScore >= 15 ? ('good' as const) : ('warning' as const),
      desc: `Burden score: ${commitmentsScore}/20. ₹${committedFunds} reserved for fixed dues (${Math.round(commitmentRatio * 100)}% of budget).`,
    },
    {
      title: 'Category Adherence',
      status: breachedCategories === 0 ? ('good' as const) : breachedCategories <= 1 ? ('warning' as const) : ('danger' as const),
      desc: `Discipline score: ${disciplineScore}/20. ${breachedCategories} categories over limit, ${warningCategories} near limit.`,
    },
    {
      title: 'Savings & Goals Progress',
      status: savingsScore >= 14 ? ('good' as const) : ('warning' as const),
      desc: `Savings score: ${savingsScore}/20. ₹${totalSavingsAllocated} stashed across active goals.`,
    },
    {
      title: 'Emergency Cushion Resilience',
      status: resilienceScore >= 11 ? ('good' as const) : resilienceScore >= 5 ? ('warning' as const) : ('danger' as const),
      desc: `Resilience score: ${resilienceScore}/15. ₹${availableBalance} uncommitted buffer available.`,
    },
  ];

  return {
    score: totalScore,
    tier,
    riskLevel,
    breakdown: {
      pacingScore,
      commitmentsScore,
      disciplineScore,
      savingsScore,
      resilienceScore,
    },
    summary: summaryText,
    keyFactors,
  };
};

/**
 * 30-Day Cash Flow Projection Engine
 * Computes day-by-day curves for Actual, Expected, Optimistic, and Stress/High-spend scenarios
 */
export const calculateMonthlyForecast = (
  initialBudget: number,
  currentDay: number,
  totalDays: number,
  transactions: Transaction[],
  commitments: Commitment[],
  subscriptions: Subscription[]
): ForecastPoint[] => {
  const points: ForecastPoint[] = [];

  const cancelledSubIds = new Set(
    subscriptions.filter((s) => s.isSimulatedCancelled).map((s) => s.id)
  );

  // Group commitments by dueDay
  const commitmentsByDay: Record<number, number> = {};
  commitments.forEach((c) => {
    if (c.subscriptionId && cancelledSubIds.has(c.subscriptionId)) return;
    commitmentsByDay[c.dueDay] = (commitmentsByDay[c.dueDay] || 0) + c.amount;
  });

  // Calculate day-by-day actual balance up to currentDay
  let runningActual = initialBudget;
  const actualsByDay: Record<number, number> = {};

  for (let d = 1; d <= totalDays; d++) {
    const dayIncome = transactions
      .filter((t) => t.type === 'income' && t.dayNumber === d && t.id !== 'tx-0')
      .reduce((sum, t) => sum + t.amount, 0);

    const dayExpense = transactions
      .filter((t) => t.type === 'expense' && t.dayNumber === d)
      .reduce((sum, t) => sum + t.amount, 0);

    runningActual = runningActual + dayIncome - dayExpense;

    if (d <= currentDay) {
      actualsByDay[d] = runningActual;
    }
  }

  const currentActualBalance = actualsByDay[currentDay] ?? runningActual;
  const totalSpentSoFar = initialBudget - currentActualBalance;
  const currentBurnRate = currentDay > 0 ? Math.max(120, totalSpentSoFar / currentDay) : 300;
  const disciplinedRate = Math.max(80, currentBurnRate * 0.7);
  const stressRate = currentBurnRate * 1.45;

  let expectedBalance = currentActualBalance;
  let optimisticBalance = currentActualBalance;
  let highSpendBalance = currentActualBalance;

  for (let d = 1; d <= totalDays; d++) {
    const dayCommitment = commitmentsByDay[d] || 0;

    if (d <= currentDay) {
      points.push({
        day: d,
        label: `Day ${d}`,
        isActual: true,
        actualBalance: actualsByDay[d],
        expectedBalance: actualsByDay[d],
        optimisticBalance: actualsByDay[d],
        highSpendBalance: actualsByDay[d],
        dailyCommitment: dayCommitment,
      });
    } else {
      // Future projection
      expectedBalance = Math.round(expectedBalance - currentBurnRate - dayCommitment);
      optimisticBalance = Math.round(optimisticBalance - disciplinedRate - dayCommitment);
      highSpendBalance = Math.round(highSpendBalance - stressRate - dayCommitment);

      points.push({
        day: d,
        label: `Day ${d}`,
        isActual: false,
        expectedBalance,
        optimisticBalance,
        highSpendBalance,
        dailyCommitment: dayCommitment,
      });
    }
  }

  return points;
};

/**
 * Intelligent Rule-Based Financial Insights Engine
 * Dynamically produces context-rich insights with transparent evidence
 */
export const generateFinancialInsights = (
  summary: EngineFinancialSummary,
  categoryBudgets: CategoryBudget[],
  transactions: Transaction[],
  subscriptions: Subscription[],
  savingsGoals: SavingsGoal[]
): Insight[] => {
  const insights: Insight[] = [];
  const { availableBalance, currentDay, remainingDays, dailyAllowance, burnRatePerDay, initialBudget, totalIncome } = summary;
  const categoryStats = calculateCategoryBreakdown(transactions, categoryBudgets, currentDay);

  // Rule 1: High Category Burn Rate
  const foodCat = categoryStats.find((c) => c.category === 'food');
  if (foodCat && foodCat.percent > 65 && currentDay <= 15) {
    insights.push({
      id: 'ins-food-pace',
      type: 'warning',
      title: 'Food & Dining Burn Rate Alert',
      message: `You've utilized ${foodCat.percent}% of your food budget in only ${currentDay} days.`,
      evidence: `You spent ₹${foodCat.spent} out of ₹${foodCat.limit}. At this rate, food funds will exhaust around Day ${Math.round((foodCat.limit / foodCat.spent) * currentDay)}.`,
      actionable: `Cap dining out / Swiggy to ₹120/day to stay within limit through Day 30.`,
      category: 'food',
      metric: `${foodCat.percent}% used`,
    });
  }

  // Rule 2: Subscriptions optimization
  const activeSubs = subscriptions.filter((s) => !s.isSimulatedCancelled);
  const totalSubCost = activeSubs.reduce((acc, s) => acc + s.amount, 0);
  if (totalSubCost > 800) {
    insights.push({
      id: 'ins-sub-optimization',
      type: 'tip',
      title: 'Subscription Trim Opportunity',
      message: `Recurring subscriptions cost ₹${totalSubCost}/month (${Math.round((totalSubCost / (initialBudget + totalIncome)) * 100)}% of your monthly funds).`,
      evidence: `You have ${activeSubs.length} active recurring services auto-debited this cycle.`,
      actionable: 'Test cancelling an unused entertainment service in the Subscriptions tab to boost your daily allowance.',
      category: 'bills',
      metric: `₹${totalSubCost}/mo`,
    });
  }

  // Rule 3: Daily Allowance & Runway Stability
  if (dailyAllowance < 150 && remainingDays > 10) {
    insights.push({
      id: 'ins-allowance-tight',
      type: 'critical',
      title: 'Tight Daily Spending Allowance',
      message: `Your recommended allowance has dropped to ${formatCurrency(dailyAllowance)}/day.`,
      evidence: `You have ₹${availableBalance} uncommitted funds remaining across ${remainingDays} days.`,
      actionable: `Defer non-essential shopping or thrift purchases until the next cycle to avoid overdraft.`,
      metric: `${formatCurrency(dailyAllowance)}/day`,
    });
  } else if (dailyAllowance >= 300) {
    insights.push({
      id: 'ins-allowance-healthy',
      type: 'positive',
      title: 'Comfortable Daily Runway',
      message: `Healthy pace! You have ${formatCurrency(dailyAllowance)} available per day.`,
      evidence: `Uncommitted balance of ₹${availableBalance} safely covers remaining ${remainingDays} days.`,
      actionable: `Consider routing ₹200 extra into your savings goal to hit it ahead of schedule.`,
      metric: `${formatCurrency(dailyAllowance)}/day`,
    });
  }

  // Rule 4: Pacing vs Exhaustion
  if (burnRatePerDay > 0) {
    const daysUntilZero = Math.floor(availableBalance / burnRatePerDay);
    if (daysUntilZero < remainingDays) {
      insights.push({
        id: 'ins-burn-exhaustion',
        type: 'critical',
        title: 'Projected Budget Shortfall Ahead',
        message: `At your current burn rate of ₹${burnRatePerDay}/day, discretionary balance will run out in ${daysUntilZero} days (Day ${currentDay + daysUntilZero}).`,
        evidence: `Current balance ₹${availableBalance} cannot sustain ₹${burnRatePerDay}/day for all ${remainingDays} remaining days.`,
        actionable: `Trimming ₹${burnRatePerDay - dailyAllowance} from daily discretionary spend will guarantee reaching Day 30 safely.`,
        metric: `Short by Day ${currentDay + daysUntilZero}`,
      });
    }
  }

  // Rule 5: Savings Goal Progress
  const pendingGoals = savingsGoals.filter((g) => g.currentAmount < g.targetAmount);
  if (pendingGoals.length > 0) {
    const closestGoal = pendingGoals[0];
    const needed = closestGoal.targetAmount - closestGoal.currentAmount;
    const daysLeft = Math.max(1, closestGoal.deadlineDay - currentDay);
    const dailyNeeded = Math.ceil(needed / daysLeft);

    insights.push({
      id: 'ins-goal-path',
      type: 'tip',
      title: `Goal Pacing: "${closestGoal.title}"`,
      message: `Need ₹${needed} more in ${daysLeft} days to reach target.`,
      evidence: `You are at ${Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100)}% progress (₹${closestGoal.currentAmount} / ₹${closestGoal.targetAmount}).`,
      actionable: `Saving ₹${dailyNeeded}/day will complete this goal on schedule.`,
      metric: `₹${dailyNeeded}/day`,
    });
  }

  // Rule 6: Emergency Reserve Resilience
  if (availableBalance < 1000) {
    insights.push({
      id: 'ins-emergency-warning',
      type: 'warning',
      title: 'Low Emergency Resilience Buffer',
      message: 'Your buffer is currently insufficient to withstand a sudden ₹1,500 emergency.',
      evidence: `Available uncommitted funds are ${formatCurrency(availableBalance)}. A medical or phone repair shock would cause an immediate deficit.`,
      actionable: 'Avoid any discretionary impulse purchases over ₹300 for the next 5 days.',
      metric: formatCurrency(availableBalance),
    });
  }

  return insights;
};

/**
 * Dedicated Interactive Decision Simulation Engine
 * Computes before vs after impact of any financial choice without modifying real state
 */
export const simulateFinancialDecision = (
  currentSummary: EngineFinancialSummary,
  currentHealth: FinancialHealth,
  input: DecisionSimulationInput,
  categoryBudgets: CategoryBudget[],
  transactions: Transaction[],
  _commitments: Commitment[],
  _savingsGoals: SavingsGoal[],
  _subscriptions: Subscription[]
): DecisionImpact => {
  const { amount, type } = input;
  const currentAvailable = currentSummary.availableBalance;
  const currentDailyAllowance = currentSummary.dailyAllowance;
  const currentForecastEnd = currentSummary.projectedEndBalance;
  const currentHealthScore = currentHealth.score;
  const currentRiskLevel = currentHealth.riskLevel;

  let simulatedAvailable = currentAvailable;
  let simulatedCommitments = currentSummary.committedFunds;
  let simulatedSavings = currentSummary.totalSavingsAllocated;
  let simulatedIncome = currentSummary.totalIncome;

  if (type === 'purchase' || type === 'emergency_shock') {
    simulatedAvailable -= amount;
  } else if (type === 'save') {
    simulatedSavings += amount;
    simulatedAvailable -= amount;
  } else if (type === 'income_boost') {
    simulatedIncome += amount;
    simulatedAvailable += amount;
  } else if (type === 'subscription_change') {
    // If recurring increases
    simulatedCommitments += amount;
    simulatedAvailable -= amount;
  } else if (type === 'custom') {
    // Default treated as expense unless amount is negative
    simulatedAvailable -= amount;
  }

  const remainingDays = currentSummary.remainingDays;
  const simulatedDailyAllowance = remainingDays > 0 ? Math.max(0, Math.floor(simulatedAvailable / remainingDays)) : 0;
  const simulatedForecastEnd = Math.round(currentForecastEnd + (simulatedAvailable - currentAvailable));

  // Compute simulated health score
  const simulatedSummary: EngineFinancialSummary = {
    ...currentSummary,
    availableBalance: simulatedAvailable,
    totalIncome: simulatedIncome,
    committedFunds: simulatedCommitments,
    totalSavingsAllocated: simulatedSavings,
    dailyAllowance: simulatedDailyAllowance,
    projectedEndBalance: simulatedForecastEnd,
  };

  const simulatedHealth = calculateFinancialHealth(simulatedSummary, categoryBudgets, transactions);

  const deltaAvailable = simulatedAvailable - currentAvailable;
  const deltaDailyAllowance = simulatedDailyAllowance - currentDailyAllowance;
  const deltaForecastEnd = simulatedForecastEnd - currentForecastEnd;
  const deltaHealthScore = simulatedHealth.score - currentHealthScore;

  const isAffordable = simulatedAvailable >= 0;

  // Generate personalized trade-offs and recommendations
  const tradeOffs: string[] = [];
  const recommendations: string[] = [];

  if (deltaAvailable < 0) {
    tradeOffs.push(`Reduces total available funds by ${formatCurrency(Math.abs(deltaAvailable))}.`);
    tradeOffs.push(
      `Daily allowance decreases by ${formatCurrency(Math.abs(deltaDailyAllowance))}/day for the next ${remainingDays} days.`
    );
  } else {
    tradeOffs.push(`Increases available liquidity by ${formatCurrency(deltaAvailable)}.`);
    tradeOffs.push(`Boosts daily spending runway by +${formatCurrency(deltaDailyAllowance)}/day.`);
  }

  if (type === 'purchase') {
    if (simulatedDailyAllowance < 120) {
      tradeOffs.push('Leaves dangerously slim margin for daily food, transport, and unexpected emergencies.');
    }
    if (isAffordable) {
      recommendations.push(
        `If you proceed, balance it by trimming ₹${Math.ceil(amount / remainingDays)}/day from discretionary categories.`
      );
      recommendations.push('Wait 24 hours (cooling-off rule) before confirming non-essential purchases.');
    } else {
      recommendations.push('Not recommended right now: This purchase would trigger an immediate budget deficit.');
      recommendations.push('Consider setting up a targeted Savings Goal instead of buying outright.');
    }
  } else if (type === 'save') {
    recommendations.push('Excellent financial habit! Stashing funds protects money from impulse spending.');
    recommendations.push(`Goal completion accelerated by approximately ${Math.min(remainingDays, Math.ceil(amount / Math.max(50, currentDailyAllowance)))} days.`);
  } else if (type === 'emergency_shock') {
    if (isAffordable) {
      recommendations.push('Your emergency cushion absorbed the shock without tipping your balance into negative.');
      recommendations.push(`Recalibrate daily spending to ₹${simulatedDailyAllowance}/day until Day 30.`);
    } else {
      recommendations.push('Deficit warning: This emergency exceeds liquid uncommitted funds.');
      recommendations.push('Consider liquidating a portion of savings goal reserves to cover the shortfall.');
    }
  } else if (type === 'income_boost') {
    recommendations.push('Smart allocation: Channel at least 40% of this bonus into savings goals.');
    recommendations.push(`Improves financial health score by +${deltaHealthScore} points.`);
  }

  let savingsGoalImpact = '';
  if (type === 'save') {
    savingsGoalImpact = `Accelerates savings goals by +${formatCurrency(amount)}, boosting your long-term security.`;
  } else if (!isAffordable) {
    savingsGoalImpact = 'Severe risk: You may need to withdraw from existing savings goals to cover obligations.';
  } else {
    savingsGoalImpact = `Goal contributions remain intact, but future contribution capacity reduces by ₹${Math.abs(deltaDailyAllowance)}/day.`;
  }

  return {
    input,
    currentAvailable,
    simulatedAvailable,
    deltaAvailable,
    currentDailyAllowance,
    simulatedDailyAllowance,
    deltaDailyAllowance,
    currentForecastEnd,
    simulatedForecastEnd,
    deltaForecastEnd,
    currentHealthScore,
    simulatedHealthScore: simulatedHealth.score,
    deltaHealthScore,
    currentRiskLevel,
    simulatedRiskLevel: simulatedHealth.riskLevel,
    savingsGoalImpact,
    recommendations,
    tradeOffs,
    isAffordable,
  };
};
