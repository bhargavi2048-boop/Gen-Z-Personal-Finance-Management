import React, { useState } from 'react';
import {
  Plus,
  Lock,
  Wallet,
  TrendingDown,
  Edit2,
  Check,
  X,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory } from '../../types';
import { formatCurrency } from '../../engine/financialEngine';

export const BudgetPlanner: React.FC = () => {
  const {
    categoryBreakdown,
    updateCategoryLimit,
    commitments,
    addCommitment,
    markCommitmentPaid,
    deleteCommitment,
    summary,
    currentDay,
    totalDays,
  } = useFinance();

  // Inline limit edit state
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editingLimitValue, setEditingLimitValue] = useState<string>('');

  // Add commitment modal state
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [comTitle, setComTitle] = useState('');
  const [comAmount, setComAmount] = useState('');
  const [comDueDay, setComDueDay] = useState(currentDay + 3);
  const [comCategory, setComCategory] = useState<ExpenseCategory>('bills');
  const [comError, setComError] = useState('');

  const handleStartEditLimit = (category: ExpenseCategory, currentLimit: number) => {
    setEditingCategory(category);
    setEditingLimitValue(currentLimit.toString());
  };

  const handleSaveLimit = (category: ExpenseCategory) => {
    const val = parseFloat(editingLimitValue);
    if (!isNaN(val) && val >= 0) {
      updateCategoryLimit(category, val);
    }
    setEditingCategory(null);
  };

  const handleAddCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(comAmount);
    if (!comTitle.trim()) {
      setComError('Please enter a title for the commitment.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setComError('Please enter a valid amount.');
      return;
    }

    addCommitment({
      title: comTitle.trim(),
      amount: parsedAmount,
      dueDay: comDueDay,
      category: comCategory,
      isPaid: false,
    });

    setIsCommitmentModalOpen(false);
    setComTitle('');
    setComAmount('');
    setComError('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Budget Planning & Commitments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Differentiate spent, locked upcoming commitments, and truly uncommitted cash
          </p>
        </div>

        <button
          onClick={() => setIsCommitmentModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Fixed Commitment</span>
        </button>
      </div>

      {/* 3-Way Fund Segmentation: Spent vs Committed vs Genuinely Available */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          3-Way Capital Allocation • ₹10,000 Budget Pool
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Spent */}
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                1. Spent Capital
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(summary.totalSpent)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Completed transactions to Day {currentDay}
              </div>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-300">
              {Math.round((summary.totalSpent / (summary.initialBudget + summary.totalIncome)) * 100)}%
            </span>
          </div>

          {/* 2. Committed */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                2. Committed Capital
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(summary.committedFunds)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Reserved for WiFi, Spotify, recharges
              </div>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
              {Math.round((summary.committedFunds / (summary.initialBudget + summary.totalIncome)) * 100)}%
            </span>
          </div>

          {/* 3. Genuinely Available */}
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                3. Genuinely Available
              </div>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                {formatCurrency(summary.availableBalance)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Free discretionary pool ({summary.remainingDays} days)
              </div>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300">
              {formatCurrency(summary.dailyAllowance)}/d
            </span>
          </div>
        </div>
      </div>

      {/* Category Limits Management Grid */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Category Spending Limits & Utilization
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Click any limit to adjust allocation and test sensitivity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBreakdown.map((cat) => (
            <div
              key={cat.category}
              className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/30 space-y-3 transition hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.label}
                </span>

                {editingCategory === cat.category ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editingLimitValue}
                      onChange={(e) => setEditingLimitValue(e.target.value)}
                      className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-teal-500 rounded font-bold text-slate-900 dark:text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveLimit(cat.category)}
                      className="p-1 text-emerald-500 hover:text-emerald-400"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEditLimit(cat.category, cat.limit)}
                    className="text-xs font-semibold text-slate-500 hover:text-teal-500 flex items-center gap-1 group"
                    title="Click to edit category limit"
                  >
                    <span>Limit: {formatCurrency(cat.limit)}</span>
                    <Edit2 className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Spent: {formatCurrency(cat.spent)}</span>
                  <span
                    className={`font-bold ${
                      cat.status === 'danger'
                        ? 'text-rose-500'
                        : cat.status === 'warning'
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}
                  >
                    {cat.percent}% used
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.status === 'danger'
                        ? 'bg-rose-500'
                        : cat.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.min(100, cat.percent)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Remaining Cushion:</span>
                <span
                  className={`font-bold ${
                    cat.remaining < 0
                      ? 'text-rose-500'
                      : cat.remaining < 200
                      ? 'text-amber-500'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {formatCurrency(cat.remaining)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Fixed Commitments Table */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Upcoming Fixed Dues & Commitments
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              These funds are reserved to ensure you never default on recurring obligations
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {commitments.map((com) => {
            const isDueSoon = com.dueDay >= currentDay && com.dueDay <= currentDay + 3;
            const isPastDue = com.dueDay < currentDay && !com.isPaid;

            return (
              <div
                key={com.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      com.isPaid
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : isDueSoon
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {com.title}
                      </span>
                      {com.isPaid && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Settled
                        </span>
                      )}
                      {isDueSoon && !com.isPaid && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Due in {com.dueDay - currentDay} days
                        </span>
                      )}
                      {isPastDue && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Due on Day {com.dueDay} of {totalDays}</span>
                      <span>•</span>
                      <span className="capitalize">{com.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(com.amount)}
                  </div>

                  {!com.isPaid ? (
                    <button
                      onClick={() => markCommitmentPaid(com.id)}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500 text-teal-600 dark:text-teal-400 hover:text-slate-950 font-bold text-xs transition border border-teal-500/20"
                    >
                      Settle Now
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteCommitment(com.id)}
                      className="text-xs text-slate-400 hover:text-rose-500 transition"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Commitment Modal */}
      {isCommitmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#111726] rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsCommitmentModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Add Fixed Commitment
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reserve funds from your available runway before due date
            </p>

            {comError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {comError}
              </div>
            )}

            <form onSubmit={handleAddCommitment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Commitment Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Broadband Share, Gym Fee, Tuition Installment"
                  value={comTitle}
                  onChange={(e) => setComTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="499"
                    value={comAmount}
                    onChange={(e) => setComAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Day (1-{totalDays})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalDays}
                    value={comDueDay}
                    onChange={(e) => setComDueDay(parseInt(e.target.value) || currentDay)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={comCategory}
                  onChange={(e) => setComCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 capitalize"
                >
                  <option value="bills">Bills & Utilities</option>
                  <option value="entertainment">Entertainment / OTT</option>
                  <option value="healthcare">Healthcare / Gym</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCommitmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md shadow-teal-500/20 active:scale-95"
                >
                  Lock Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
