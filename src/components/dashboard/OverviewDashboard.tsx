import React from 'react';
import {
  Wallet,
  Zap,
  TrendingDown,
  Lock,
  PiggyBank,
  PlusCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../engine/financialEngine';
import { FinancialHealthCard } from './FinancialHealthCard';
import { CashFlowChart } from './CashFlowChart';
import { CategoryDistribution } from './CategoryDistribution';
import { ImpulseVibeCheck } from '../innovations/ImpulseVibeCheck';

interface OverviewDashboardProps {
  onOpenAddTransaction: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onOpenAddTransaction,
}) => {
  const {
    summary,
    health,
    forecast,
    transactions,
    insights,
    setActiveTab,
    runSimulation,
  } = useFinance();

  // Top critical or warning insight
  const highlightInsight = insights.find((i) => i.type === 'critical' || i.type === 'warning');

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Welcome / Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-[#0A101D] p-6 text-white shadow-xl border border-teal-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Day {summary.currentDay} of {summary.totalDays} • {summary.remainingDays} Days Left
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Gen Z ₹10,000 Financial Command
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Every rupee spent or committed ripples across your daily allowance, savings goals, and month-end runway.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddTransaction}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition backdrop-blur-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Test Decision</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Contextual Warning/Tip Banner if triggered */}
      {highlightInsight && (
        <div className="flex items-start justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pacing Alert • {highlightInsight.title}
              </div>
              <div className="text-sm font-medium mt-0.5">{highlightInsight.message}</div>
              <div className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                <span className="font-semibold">Why this appears:</span> {highlightInsight.evidence}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('insights')}
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 ml-4 mt-1"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5 Core Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Genuinely Available Funds */}
        <div className="bg-white dark:bg-[#111726] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Genuinely Available
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(summary.availableBalance)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              <span>Safe discretionary money</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-2">
            After bills & savings reserved
          </div>
        </div>

        {/* Card 2: Daily Allowance */}
        <div className="bg-white dark:bg-[#111726] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daily Allowance
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
              {formatCurrency(summary.dailyAllowance)}
              <span className="text-xs font-semibold text-slate-400">/day</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              For remaining <span className="font-bold">{summary.remainingDays} days</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-2">
            Dynamic spend target
          </div>
        </div>

        {/* Card 3: Total Spent */}
        <div className="bg-white dark:bg-[#111726] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Spent
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(summary.totalSpent)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Burn rate: ~{formatCurrency(summary.burnRatePerDay)}/day
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-2">
            Budget utilization: {summary.budgetUtilizationPct}%
          </div>
        </div>

        {/* Card 4: Fixed Commitments */}
        <div className="bg-white dark:bg-[#111726] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Committed Funds
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(summary.committedFunds)}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
              Upcoming bills & WiFi
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-2">
            Locked from daily budget
          </div>
        </div>

        {/* Card 5: Savings Stashed */}
        <div className="bg-white dark:bg-[#111726] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Goals Stashed
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(summary.totalSavingsAllocated)}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              Headphones & Cushion
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-2">
            Protected from impulsive taps
          </div>
        </div>
      </div>

      {/* Financial Health & Risk Assessment */}
      <FinancialHealthCard health={health} />

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CashFlowChart forecast={forecast} currentDay={summary.currentDay} />
        </div>
        <div className="lg:col-span-5">
          <CategoryDistribution />
        </div>
      </div>

      {/* Innovative Gen Z Splurge & Impulse Vibe-Check */}
      <ImpulseVibeCheck />

      {/* Bottom Grid: Recent Activity Feed & Interactive Sandbox Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions Feed */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recent UPI & Expense Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Latest transactions registered in your ₹10k cycle
              </p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {tx.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Day {tx.dayNumber}</span>
                      <span>•</span>
                      <span className="capitalize">{tx.category}</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    tx.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Simulator Sandbox Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-500/10 via-slate-900/40 to-cyan-500/10 rounded-2xl p-5 border border-teal-500/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              Hypothetical Sandbox
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Financial Decision Simulator
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Wondering if you can afford that ₹2,000 concert ticket or sneaker drop without busting your ₹10,000 monthly plan? Test it before you swipe.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  runSimulation({
                    type: 'purchase',
                    title: '₹2,000 Sneakers Purchase',
                    amount: 2000,
                    category: 'shopping',
                  });
                  setActiveTab('simulator');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 hover:border-teal-500 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between transition group"
              >
                <span>"Can I afford a ₹2,000 shopping purchase?"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 transition" />
              </button>

              <button
                onClick={() => {
                  runSimulation({
                    type: 'save',
                    title: 'Stash ₹1,000 in Savings',
                    amount: 1000,
                  });
                  setActiveTab('simulator');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 hover:border-teal-500 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between transition group"
              >
                <span>"What happens if I save ₹1,000 this week?"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 transition" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-500/20 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Zero risk • Simulates without editing real data
            </span>
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition"
            >
              Open Sandbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
