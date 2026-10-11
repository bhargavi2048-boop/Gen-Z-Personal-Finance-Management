import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../engine/financialEngine';

export const CategoryDistribution: React.FC = () => {
  const { categoryBreakdown } = useFinance();

  // Filter only categories with spending > 0 for pie chart
  const activePieData = categoryBreakdown
    .filter((c) => c.spent > 0)
    .map((c) => ({
      name: c.label,
      value: c.spent,
      color: c.color,
      category: c.category,
      percent: c.percent,
    }));

  return (
    <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Spending Breakdown & Utilization
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Real-time expense distribution vs set category limits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mt-4">
        {/* Donut Chart */}
        <div className="lg:col-span-5 h-56 flex items-center justify-center relative">
          {activePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {activePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Spent']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '0.75rem',
                    border: '1px solid #334155',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-400">No expenses recorded yet</div>
          )}

          {/* Center text for donut */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Spent
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(activePieData.reduce((acc, d) => acc + d.value, 0))}
            </span>
          </div>
        </div>

        {/* Category Limit Utilization Bars */}
        <div className="lg:col-span-7 space-y-3 max-h-64 overflow-y-auto pr-1">
          {categoryBreakdown.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                      cat.status === 'danger'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : cat.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {cat.percent}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
          ))}
        </div>
      </div>
    </div>
  );
};
