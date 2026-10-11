import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { DecisionSimulationInput, ExpenseCategory } from '../../types';
import { formatCurrency } from '../../engine/financialEngine';

export const DecisionSimulatorView: React.FC = () => {
  const {
    summary,
    simulationInput,
    simulationImpact,
    runSimulation,
    clearSimulation,
    applySimulationDecision,
  } = useFinance();

  // Custom Form state
  const [customTitle, setCustomTitle] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customType, setCustomType] = useState<DecisionSimulationInput['type']>('purchase');
  const [customCategory, setCustomCategory] = useState<ExpenseCategory>('shopping');

  // Preset Scenarios specified in user prompt
  const PRESET_SCENARIOS: {
    id: string;
    title: string;
    description: string;
    badge: string;
    input: DecisionSimulationInput;
  }[] = [
    {
      id: 'sc-1',
      title: 'Can I afford a ₹2,000 sneaker / shopping splurge?',
      description: 'Test buying high-ticket lifestyle merchandise or concert tickets today.',
      badge: 'Purchase Test',
      input: {
        type: 'purchase',
        title: '₹2,000 Sneaker Purchase',
        amount: 2000,
        category: 'shopping',
      },
    },
    {
      id: 'sc-2',
      title: 'What happens if I save ₹1,000 this week?',
      description: 'Move ₹1,000 uncommitted cash directly into high-priority savings goals.',
      badge: 'Savings Boost',
      input: {
        type: 'save',
        title: 'Weekly ₹1,000 Savings Stash',
        amount: 1000,
      },
    },
    {
      id: 'sc-3',
      title: 'What if monthly subscriptions increase by ₹350?',
      description: 'Simulate a price hike across OTT plans or broadband tier upgrades.',
      badge: 'Recurring Increase',
      input: {
        type: 'subscription_change',
        title: 'Subscription Price Hikes',
        amount: 350,
        category: 'bills',
        isRecurringMonthly: true,
      },
    },
    {
      id: 'sc-4',
      title: 'What if I receive an extra ₹2,000 freelance stipend?',
      description: 'Analyze liquidity and score lift if client pays milestone bonus early.',
      badge: 'Income Boost',
      input: {
        type: 'income_boost',
        title: 'Freelance Design Stipend',
        amount: 2000,
      },
    },
    {
      id: 'sc-5',
      title: 'What happens if an emergency costs ₹3,000?',
      description: 'Stress-test a major unplanned medical, travel, or gadget repair shock.',
      badge: 'Emergency Shock',
      input: {
        type: 'emergency_shock',
        title: '₹3,000 Sudden Emergency',
        amount: 3000,
        category: 'healthcare',
      },
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (!customTitle.trim() || isNaN(amount) || amount <= 0) return;

    runSimulation({
      type: customType,
      title: customTitle.trim(),
      amount,
      category: customCategory,
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Decision Sandbox & Risk Modeler
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Decision Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Test any purchase, income, or emergency shock. See immediate consequences before committing real money.
          </p>
        </div>

        {simulationImpact && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearSimulation}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sandbox</span>
            </button>
            <button
              onClick={applySimulationDecision}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Real Budget</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Quick Test Scenarios Carousel / Grid */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Preset Real-World Gen Z Scenarios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_SCENARIOS.map((scenario) => {
            const isSelected = simulationInput?.title === scenario.input.title;
            return (
              <button
                key={scenario.id}
                onClick={() => runSimulation(scenario.input)}
                className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between space-y-2 group ${
                  isSelected
                    ? 'bg-teal-500/10 border-teal-500 ring-2 ring-teal-500/30'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                      {scenario.badge}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {scenario.input.type === 'income_boost' ? '+' : '-'}
                      {formatCurrency(scenario.input.amount)}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-500 transition">
                    {scenario.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {scenario.description}
                  </p>
                </div>

                <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 pt-1">
                  <span>Simulate Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Simulation Builder Form */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Custom Decision Builder
        </h2>

        <form onSubmit={handleCustomSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Decision Description
            </label>
            <input
              type="text"
              placeholder="e.g. Goa Trip Weekend Split, Noise-cancelling Pods"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              placeholder="1500"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Action Nature
            </label>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as DecisionSimulationInput['type'])}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="purchase">Discretionary Purchase (-)</option>
              <option value="save">Transfer to Savings (- Available)</option>
              <option value="income_boost">Extra Income Bonus (+)</option>
              <option value="subscription_change">Recurring Cost Shift (-)</option>
              <option value="emergency_shock">Unexpected Emergency Shock (-)</option>
            </select>
          </div>

          {customType === 'purchase' && (
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 capitalize"
              >
                <option value="shopping">Shopping</option>
                <option value="food">Food & Dining</option>
                <option value="entertainment">Entertainment</option>
                <option value="transport">Transport</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md shadow-teal-500/20 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Decision</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Simulation Comparison Dashboard */}
      {simulationImpact ? (
        <div className="space-y-6 animate-fade-in">
          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              simulationImpact.isAffordable
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-950 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {simulationImpact.isAffordable ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm">
                  {simulationImpact.isAffordable
                    ? `Feasible Decision: "${simulationImpact.input.title}"`
                    : `Budget Deficit Alert: "${simulationImpact.input.title}" exceeds safe available funds!`}
                </span>
                <p className="text-xs opacity-85 mt-0.5">
                  Simulated impact on remaining {summary.remainingDays} days of your ₹10,000 cycle.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={applySimulationDecision}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-sm transition active:scale-95"
              >
                Apply to Budget
              </button>
            </div>
          </div>

          {/* Side-by-Side Current Plan vs Simulated Plan Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Available Balance */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Available Discretionary
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-400">Current</div>
                  <div className="text-lg font-bold text-slate-600 dark:text-slate-300">
                    {formatCurrency(simulationImpact.currentAvailable)}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="text-right">
                  <div className="text-xs text-teal-600 dark:text-teal-400 font-bold">Simulated</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(simulationImpact.simulatedAvailable)}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold flex items-center justify-between">
                <span className="text-slate-400">Impact Delta:</span>
                <span
                  className={
                    simulationImpact.deltaAvailable >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }
                >
                  {simulationImpact.deltaAvailable >= 0 ? '+' : ''}
                  {formatCurrency(simulationImpact.deltaAvailable)}
                </span>
              </div>
            </div>

            {/* Metric 2: Daily Allowance */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Daily Allowance
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-400">Current</div>
                  <div className="text-lg font-bold text-slate-600 dark:text-slate-300">
                    {formatCurrency(simulationImpact.currentDailyAllowance)}/d
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="text-right">
                  <div className="text-xs text-teal-600 dark:text-teal-400 font-bold">Simulated</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(simulationImpact.simulatedDailyAllowance)}/d
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold flex items-center justify-between">
                <span className="text-slate-400">Daily Delta:</span>
                <span
                  className={
                    simulationImpact.deltaDailyAllowance >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }
                >
                  {simulationImpact.deltaDailyAllowance >= 0 ? '+' : ''}
                  {formatCurrency(simulationImpact.deltaDailyAllowance)}/d
                </span>
              </div>
            </div>

            {/* Metric 3: Financial Health Score */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Health Score
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-400">Current</div>
                  <div className="text-lg font-bold text-slate-600 dark:text-slate-300">
                    {simulationImpact.currentHealthScore} pts
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="text-right">
                  <div className="text-xs text-teal-600 dark:text-teal-400 font-bold">Simulated</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {simulationImpact.simulatedHealthScore} pts
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold flex items-center justify-between">
                <span className="text-slate-400">Score Shift:</span>
                <span
                  className={
                    simulationImpact.deltaHealthScore >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }
                >
                  {simulationImpact.deltaHealthScore >= 0 ? '+' : ''}
                  {simulationImpact.deltaHealthScore} pts
                </span>
              </div>
            </div>

            {/* Metric 4: Projected Day 30 Balance */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                End-of-Month Forecast
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-400">Current</div>
                  <div className="text-lg font-bold text-slate-600 dark:text-slate-300">
                    {formatCurrency(simulationImpact.currentForecastEnd)}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="text-right">
                  <div className="text-xs text-teal-600 dark:text-teal-400 font-bold">Simulated</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(simulationImpact.simulatedForecastEnd)}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold flex items-center justify-between">
                <span className="text-slate-400">Risk Tier:</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] uppercase ${
                    simulationImpact.simulatedRiskLevel === 'Low'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : simulationImpact.simulatedRiskLevel === 'Moderate'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  {simulationImpact.simulatedRiskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Deep Trade-off & Strategic Recommendation Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Direct Trade-offs */}
            <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
                Direct Financial Trade-Offs
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {simulationImpact.tradeOffs.map((tradeoff, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{tradeoff}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-slate-900 dark:text-white">Savings Goal Impact: </strong>
                    {simulationImpact.savingsGoalImpact}
                  </span>
                </li>
              </ul>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                Algorithmic Action Recommendations
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {simulationImpact.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Scenario Active in Sandbox
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Pick one of the Gen Z presets above or use the Custom Decision Builder to test how any purchase or income modifies your ₹10,000 roadmap.
          </p>
        </div>
      )}
    </div>
  );
};
