import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { FinancialHealth } from '../../types';

interface FinancialHealthCardProps {
  health: FinancialHealth;
}

export const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({ health }) => {
  const { score, tier, riskLevel, breakdown, summary, keyFactors } = health;

  // Determine color accents based on score
  const getBadgeColors = () => {
    if (riskLevel === 'Low') {
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        ring: '#10B981',
      };
    }
    if (riskLevel === 'Moderate') {
      return {
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        ring: '#F59E0B',
      };
    }
    return {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      ring: '#F43F5E',
    };
  };

  const badge = getBadgeColors();

  // SVG circular gauge calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Financial Health & Risk Score
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Transparent algorithmic rating based on 5 financial pillars
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} flex items-center gap-1.5`}>
          {riskLevel === 'Low' ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5" />
          )}
          <span>{riskLevel} Risk</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-5">
        {/* Radial Gauge & Tier Description */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 text-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={badge.ring}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {score}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>Tier: {tier}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px] leading-relaxed">
              {summary}
            </p>
          </div>
        </div>

        {/* 5 Transparent Pillars Breakdown */}
        <div className="md:col-span-7 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Factor Weights & Breakdown
          </div>

          {/* Pillar 1: Pacing */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                1. Daily Spend Pacing (Runway)
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {breakdown.pacingScore} <span className="text-slate-400 font-normal">/ 25</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.pacingScore / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Pillar 2: Commitments */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                2. Fixed Commitments Burden
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {breakdown.commitmentsScore} <span className="text-slate-400 font-normal">/ 20</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.commitmentsScore / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Pillar 3: Category Discipline */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                3. Category Discipline (No Overspends)
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {breakdown.disciplineScore} <span className="text-slate-400 font-normal">/ 20</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.disciplineScore / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Pillar 4: Savings */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                4. Savings Goals Funding Rate
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {breakdown.savingsScore} <span className="text-slate-400 font-normal">/ 20</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.savingsScore / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Pillar 5: Emergency Resilience */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                5. Emergency Cushion Resilience (₹1,500 shock)
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {breakdown.resilienceScore} <span className="text-slate-400 font-normal">/ 15</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.resilienceScore / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Explanation Box */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {keyFactors.slice(0, 3).map((factor, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 text-xs"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                {factor.status === 'good' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span>{factor.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {factor.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Credit Score Disclaimer */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-300">Educational Disclaimer: </strong>
          This financial health score is an algorithmic simulation based on 30-day budget pacing. It is not a formal credit rating or professional financial assessment.
        </p>
      </div>
    </div>
  );
};
