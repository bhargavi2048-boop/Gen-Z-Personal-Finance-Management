import React, { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const FinancialInsightsView: React.FC = () => {
  const { insights } = useFinance();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredInsights = insights.filter((i) => {
    if (filterType === 'all') return true;
    return i.type === filterType;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-500/20">
            <Lightbulb className="w-3.5 h-3.5" />
            Contextual Rule Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Intelligent Financial Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent, data-backed recommendations computed from your actual UPI transactions and commitments
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'critical', 'warning', 'tip', 'positive'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                filterType === type
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {type === 'all' ? 'All Insights' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInsights.map((insight) => {
          const isCritical = insight.type === 'critical';
          const isWarning = insight.type === 'warning';
          const isTip = insight.type === 'tip';

          return (
            <div
              key={insight.id}
              className={`rounded-2xl p-5 border transition shadow-sm flex flex-col justify-between space-y-4 ${
                isCritical
                  ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30'
                  : isWarning
                  ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30'
                  : isTip
                  ? 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/30'
                  : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${
                        isCritical
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : isWarning
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : isTip
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isCritical ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isTip ? (
                        <Lightbulb className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          isCritical
                            ? 'text-rose-600 dark:text-rose-400'
                            : isWarning
                            ? 'text-amber-600 dark:text-amber-400'
                            : isTip
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {insight.type.toUpperCase()} INSIGHT
                      </span>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {insight.title}
                      </h2>
                    </div>
                  </div>

                  {insight.metric && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-white/70 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                      {insight.metric}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 font-medium leading-relaxed">
                  {insight.message}
                </p>

                {/* Plain-English Evidence: "Why this appears" */}
                <div className="mt-3 p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 text-xs space-y-1">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Why this appears in your dashboard:
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {insight.evidence}
                  </p>
                </div>
              </div>

              {/* Actionable Advice & Navigation Link */}
              {insight.actionable && (
                <div className="pt-3 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-xs">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    💡 Next Step: {insight.actionable}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
