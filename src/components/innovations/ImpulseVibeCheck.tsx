import React, { useState } from 'react';
import { Sparkles, Clock, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../engine/financialEngine';

export const ImpulseVibeCheck: React.FC = () => {
  const { summary } = useFinance();
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [hourlyWage, setHourlyWage] = useState('150'); // Student gig hourly rate

  const price = parseFloat(itemPrice) || 0;
  const wage = parseFloat(hourlyWage) || 150;

  // Calculations
  const daysOfAllowance = summary.dailyAllowance > 0 ? (price / summary.dailyAllowance).toFixed(1) : '∞';
  const hoursOfWork = wage > 0 ? (price / wage).toFixed(1) : '0';
  const percentOfAvailable = summary.availableBalance > 0 ? Math.round((price / summary.availableBalance) * 100) : 100;

  // Gen Z Vibe Assessment
  const getVibeStatus = () => {
    if (price <= 0) return null;
    if (price > summary.availableBalance) {
      return {
        label: '💀 Critical Deficit (Instant Debt)',
        badge: 'Deficit Risk',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        advice: 'This purchase exceeds all liquid available funds and will crash your runway.',
      };
    }
    const days = parseFloat(daysOfAllowance);
    if (days <= 0.8) {
      return {
        label: '💅 Certified Safe to Splurge',
        badge: 'Safe Vibe',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        advice: 'Fits comfortably within your daily spending runway. Go ahead and treat yourself!',
      };
    }
    if (days <= 2.5) {
      return {
        label: '⚠️ Caution: Runway Compression',
        badge: 'Moderate Strain',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        advice: `Takes away ${daysOfAllowance} full days of your spending allowance. You'll need to tighten spend tomorrow.`,
      };
    }
    return {
      label: '🛑 High Impulse Trap (Downbad Warning)',
      badge: 'High Risk',
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      advice: `Consumes ${daysOfAllowance} days of allowance! We recommend a 24-hour cool-off rule before swiping.`,
    };
  };

  const vibe = getVibeStatus();

  return (
    <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-pink-600 dark:text-pink-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Gen Z Impulse Vibe-Check</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-extrabold uppercase">
                AI Splurge Filter
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Calculate the true opportunity cost before swiping UPI or Card
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="vibe-item-name" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Impulse Item / Cravings
          </label>
          <input
            id="vibe-item-name"
            type="text"
            placeholder="e.g. Boba Tea, Zara Hoodie, Concert Pass"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label htmlFor="vibe-item-price" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Price (₹)
          </label>
          <input
            id="vibe-item-price"
            type="number"
            min="1"
            placeholder="e.g. 499"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label htmlFor="vibe-hourly-wage" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Your Hourly Gig / Freelance Rate (₹/hr)
          </label>
          <input
            id="vibe-hourly-wage"
            type="number"
            min="1"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {price > 0 && vibe && (
        <div className={`p-4 rounded-xl border space-y-3 transition-all ${vibe.color}`}>
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm flex items-center gap-1.5">
              {price <= summary.availableBalance ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {vibe.label}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/40 dark:bg-slate-800/40">
              {percentOfAvailable}% of Available
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/40 text-xs">
            <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-900/40">
              <span className="text-[10px] opacity-75 block font-semibold">Runway Sacrificed:</span>
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {daysOfAllowance} Daily Allowances
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-900/40">
              <span className="text-[10px] opacity-75 block font-semibold">Life Energy Cost:</span>
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                {hoursOfWork} Hours of Labor
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-white/50 dark:bg-slate-900/40">
              <span className="text-[10px] opacity-75 block font-semibold">Remaining After:</span>
              <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                {formatCurrency(Math.max(0, summary.availableBalance - price))}
              </span>
            </div>
          </div>

          <p className="text-xs opacity-90 leading-relaxed font-medium">
            {vibe.advice}
          </p>
        </div>
      )}
    </div>
  );
};
