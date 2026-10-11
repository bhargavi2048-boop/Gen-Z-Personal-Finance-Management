// Standalone Verification Suite for Financial Rules & Math
// Directly exercises core calculation functions and edge cases

const formatCurrency = (amount) => {
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const absAmount = Math.abs(rounded);
  const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(absAmount);
  return `${isNegative ? '-' : ''}₹${formatted}`;
};

const calculateFinancialSummary = (
  initialBudget,
  currentDay,
  totalDays,
  transactions,
  commitments,
  savingsGoals,
  subscriptions
) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.id !== 'tx-0')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSpent = transactions
    .filter((t) => t.type === 'expense' && t.dayNumber <= currentDay)
    .reduce((acc, t) => acc + t.amount, 0);

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

  const totalSavingsAllocated = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const cashInHand = initialBudget + totalIncome - totalSpent;
  const availableBalance = cashInHand - committedFunds - totalSavingsAllocated;
  const remainingDays = Math.max(1, totalDays - currentDay + 1);
  const dailyAllowance = remainingDays > 0 ? Math.max(0, Math.floor(availableBalance / remainingDays)) : 0;
  const burnRatePerDay = currentDay > 0 ? Math.round(totalSpent / currentDay) : 0;
  const projectedEndBalance = Math.round(cashInHand - committedFunds - (burnRatePerDay * remainingDays));

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
  };
};

console.log('--- EXECUTING VERIFICATION SUITE ---');

// Test 1: Indian Rupee formatting
console.log('\n[1] Testing Indian Currency Formatter:');
if (formatCurrency(10000) !== '₹10,000') throw new Error('Failed: 10000 should format as ₹10,000');
if (formatCurrency(150000) !== '₹1,50,000') throw new Error('Failed: 150000 should format as ₹1,50,000');
if (formatCurrency(-2500) !== '-₹2,500') throw new Error('Failed: -2500 should format as -₹2,500');
console.log('✓ formatCurrency passed for standard, large lakhs, and negative amounts.');

// Test 2: Double counting prevention and accounting balance
console.log('\n[2] Testing Double-Counting Prevention & Balance Equation:');
const sampleTx = [
  { id: 'tx-0', amount: 10000, type: 'income', dayNumber: 1 },
  { id: 'tx-1', amount: 500, type: 'expense', dayNumber: 2 },
  { id: 'tx-2', amount: 180, type: 'expense', dayNumber: 3 },
  { id: 'tx-3', amount: 1200, type: 'income', dayNumber: 11 }, // freelance bonus
];
const sampleCommitments = [
  { id: 'com-1', amount: 499, dueDay: 18, isPaid: false },
  { id: 'com-2', amount: 600, dueDay: 5, isPaid: true }, // already paid, must NOT be counted in upcoming committed
];
const sampleGoals = [
  { id: 'g-1', currentAmount: 1400, targetAmount: 3500 },
  { id: 'g-2', currentAmount: 900, targetAmount: 1500 },
];

const res = calculateFinancialSummary(10000, 12, 30, sampleTx, sampleCommitments, sampleGoals, []);
console.log('Day 12 Summary:');
console.log('Total Income:', formatCurrency(res.totalIncome));
console.log('Total Spent:', formatCurrency(res.totalSpent));
console.log('Committed Upcoming:', formatCurrency(res.committedFunds));
console.log('Savings Stashed:', formatCurrency(res.totalSavingsAllocated));
console.log('Available Balance:', formatCurrency(res.availableBalance));
console.log('Daily Allowance:', formatCurrency(res.dailyAllowance) + '/day');

if (res.committedFunds !== 499) {
  throw new Error(`Double-counting error: Paid commitment was counted! Expected 499, got ${res.committedFunds}`);
}
if (res.cashInHand !== res.availableBalance + res.committedFunds + res.totalSavingsAllocated) {
  throw new Error('Balance identity broken: Cash in hand != Available + Committed + Savings');
}
console.log('✓ Double-counting prevention verified. Identity holds perfectly.');

// Test 3: Zero remaining days and negative balance edge cases
console.log('\n[3] Testing Day 30 and Overdraft Edge Cases:');
const endOfMonth = calculateFinancialSummary(10000, 30, 30, sampleTx, [], sampleGoals, []);
if (endOfMonth.remainingDays !== 1) throw new Error('Day 30 remaining days should be 1');
if (endOfMonth.dailyAllowance !== endOfMonth.availableBalance) throw new Error('Day 30 daily allowance must equal available balance');

// Overdraft simulation
const overdraftTx = [
  { id: 'tx-1', amount: 12000, type: 'expense', dayNumber: 5 }
];
const overdraftRes = calculateFinancialSummary(10000, 10, 30, overdraftTx, [], [], []);
if (endOfMonth.availableBalance < 0) console.log('Negative balance handled cleanly');
if (overdraftRes.dailyAllowance !== 0) throw new Error('Daily allowance on negative balance must clamp to 0');
console.log('✓ Deficit and boundary edge cases passed.');

console.log('\n========================================');
console.log('✅ ALL VERIFICATION CHECKS PASSED (100%)');
console.log('========================================\n');
