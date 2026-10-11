import React, { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  Calendar,
  X,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../engine/financialEngine';
import { triggerConfetti } from '../../utils/confetti';

export const SavingsGoalsView: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    deleteSavingsGoal,
    contributeToSavingsGoal,
    withdrawFromSavingsGoal,
    summary,
    currentDay,
    totalDays,
  } = useFinance();

  // Create Goal Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalInitial, setGoalInitial] = useState('');
  const [goalDeadline, setGoalDeadline] = useState(28);
  const [goalCategory, setGoalCategory] = useState('gadget');
  const [createError, setCreateError] = useState('');

  // Deposit / Withdraw Modal State
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferError, setTransferError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false);
        setActiveGoal(null);
      }
    };
    if (isCreateModalOpen || activeGoal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, activeGoal]);

  const handleOpenTransfer = (goal: SavingsGoal, type: 'deposit' | 'withdraw') => {
    setActiveGoal(goal);
    setTransferType(type);
    setTransferAmount('');
    setTransferError('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;

    const parsed = parseFloat(transferAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setTransferError('Please enter a valid amount.');
      return;
    }

    if (transferType === 'deposit') {
      if (parsed > summary.availableBalance) {
        setTransferError(
          `Insufficient available balance. You only have ${formatCurrency(summary.availableBalance)} uncommitted.`
        );
        return;
      }
      const success = contributeToSavingsGoal(activeGoal.id, parsed);
      if (success) {
        // If this deposit completes the goal, fire celebratory confetti!
        if (activeGoal.currentAmount + parsed >= activeGoal.targetAmount) {
          triggerConfetti();
        }
      }
    } else {
      if (parsed > activeGoal.currentAmount) {
        setTransferError('Cannot withdraw more than what is currently stashed in this goal.');
        return;
      }
      withdrawFromSavingsGoal(activeGoal.id, parsed);
    }

    setActiveGoal(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget);
    const initial = parseFloat(goalInitial) || 0;

    if (!goalTitle.trim()) {
      setCreateError('Please enter a title for your goal.');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setCreateError('Please enter a valid target amount.');
      return;
    }
    if (initial > summary.availableBalance) {
      setCreateError('Initial deposit cannot exceed your current available balance.');
      return;
    }

    addSavingsGoal({
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: initial,
      deadlineDay: goalDeadline,
      category: goalCategory,
      icon: goalCategory === 'gadget' ? 'Headphones' : 'ShieldCheck',
      color: '#06B6D4',
    });

    setIsCreateModalOpen(false);
    setGoalTitle('');
    setGoalTarget('');
    setGoalInitial('');
    setCreateError('');
  };

  const totalTargetAllGoals = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalStashedAllGoals = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Savings Goals & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Lock capital away from impulse taps to fund gadgets, travel, and safety cushions
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Progress Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Goals Portfolio
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalStashedAllGoals)}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {formatCurrency(totalTargetAllGoals)} Target
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Overall Progress: </span>
            <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">
              {totalTargetAllGoals > 0
                ? Math.round((totalStashedAllGoals / totalTargetAllGoals) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 shadow-glow-teal"
            style={{
              width: `${
                totalTargetAllGoals > 0
                  ? Math.min(100, Math.round((totalStashedAllGoals / totalTargetAllGoals) * 100))
                  : 0
              }%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>{savingsGoals.length} Active targets</span>
          <span>Uncommitted available for deposit: {formatCurrency(summary.availableBalance)}</span>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {savingsGoals.map((goal) => {
          const percent = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);
          const daysUntilDeadline = Math.max(1, goal.deadlineDay - currentDay);
          const recommendedDailySave = Math.ceil(remainingNeeded / daysUntilDeadline);
          const isCompleted = percent >= 100;

          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between transition hover:shadow-md space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                      {goal.category === 'gadget' ? (
                        <Headphones className="w-5 h-5" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {goal.title}
                      </h2>
                      <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Deadline: Day {goal.deadlineDay} ({daysUntilDeadline}d left)</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
                    }`}
                  >
                    {percent}% Funded
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-slate-400 font-medium">
                      Target: {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Recommendation engine callout */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 text-xs space-y-1">
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Goal achieved! Ready to purchase without guilt.</span>
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        Remaining: <span className="font-bold">{formatCurrency(remainingNeeded)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Pacing recommendation: Save <span className="font-bold text-teal-600 dark:text-teal-400">{formatCurrency(recommendedDailySave)}/day</span> to complete by Day {goal.deadlineDay}.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Transfer Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => deleteSavingsGoal(goal.id)}
                  className="text-xs text-slate-400 hover:text-rose-500 transition px-2 py-1"
                >
                  Delete
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenTransfer(goal, 'withdraw')}
                    disabled={goal.currentAmount <= 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 transition"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => handleOpenTransfer(goal, 'deposit')}
                    disabled={summary.availableBalance <= 0 || isCompleted}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-sm shadow-teal-500/20 disabled:opacity-40 transition active:scale-95"
                  >
                    + Contribute
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit / Withdraw Action Modal */}
      {activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" role="presentation">
          <div
            className="bg-white dark:bg-[#111726] rounded-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-modal-title"
          >
            <button
              onClick={() => setActiveGoal(null)}
              aria-label="Close transfer modal"
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 id="transfer-modal-title" className="text-base font-black text-slate-900 dark:text-white">
              {transferType === 'deposit' ? 'Contribute to Goal' : 'Withdraw from Goal'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{activeGoal.title}</p>

            {transferError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {transferError}
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="space-y-4 mt-4">
              <div>
                <label htmlFor="transfer-amount-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount to {transferType === 'deposit' ? 'Contribute' : 'Withdraw'} (₹)
                </label>
                <input
                  id="transfer-amount-input"
                  type="number"
                  min="1"
                  max={
                    transferType === 'deposit'
                      ? summary.availableBalance
                      : activeGoal.currentAmount
                  }
                  placeholder="300"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  autoFocus
                />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>
                  {transferType === 'deposit' ? 'Available Balance:' : 'Currently Saved:'}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(
                    transferType === 'deposit'
                      ? summary.availableBalance
                      : activeGoal.currentAmount
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md shadow-teal-500/20 active:scale-95"
                >
                  Confirm {transferType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" role="presentation">
          <div
            className="bg-white dark:bg-[#111726] rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-goal-modal-title"
          >
            <button
              onClick={() => setIsCreateModalOpen(false)}
              aria-label="Close create goal modal"
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 id="create-goal-modal-title" className="text-lg font-black text-slate-900 dark:text-white">
              Create New Savings Target
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Set aside money specifically for goals to build disciplined financial habits
            </p>

            {createError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-4 mt-4">
              <div>
                <label htmlFor="goal-form-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Name
                </label>
                <input
                  id="goal-form-title"
                  type="text"
                  placeholder="e.g. Goa Trip Fund, Mechanical Keyboard, Emergency"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-form-target" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    id="goal-form-target"
                    type="number"
                    min="1"
                    placeholder="2500"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="goal-form-initial" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Deposit (₹)
                  </label>
                  <input
                    id="goal-form-initial"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={goalInitial}
                    onChange={(e) => setGoalInitial(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-form-deadline" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline Day (1-{totalDays})
                  </label>
                  <input
                    id="goal-form-deadline"
                    type="number"
                    min="1"
                    max={totalDays}
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(parseInt(e.target.value) || 28)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="goal-form-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="goal-form-category"
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="gadget">Tech & Gadget</option>
                    <option value="emergency">Emergency Buffer</option>
                    <option value="travel">Travel & Outing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md shadow-teal-500/20 active:scale-95"
                >
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
