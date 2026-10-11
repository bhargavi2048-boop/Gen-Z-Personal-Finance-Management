import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ForecastPoint } from '../../types';
import { formatCurrency } from '../../engine/financialEngine';

interface CashFlowChartProps {
  forecast: ForecastPoint[];
  currentDay: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-md">
        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-2">
          {label}
        </div>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  forecast,
  currentDay,
}) => {
  return (
    <div className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            30-Day Cash Flow Projection
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Optimistic, Expected, and High-spending runway models with commitments
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Expected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Optimistic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">High Spend</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorHighSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />

            <XAxis
              dataKey="day"
              tickFormatter={(d) => `D${d}`}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={2}
            />

            <YAxis
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Marker for Current Day */}
            <ReferenceLine
              x={currentDay}
              stroke="#06B6D4"
              strokeDasharray="4 4"
              label={{
                value: `Today (D${currentDay})`,
                position: 'insideTopLeft',
                fill: '#06B6D4',
                fontSize: 10,
                fontWeight: 700,
              }}
            />

            {/* Zero balance danger line */}
            <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="2 2" opacity={0.5} />

            <Area
              type="monotone"
              dataKey="optimisticBalance"
              name="Optimistic"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOptimistic)"
            />

            <Area
              type="monotone"
              dataKey="expectedBalance"
              name="Expected Pace"
              stroke="#14B8A6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorExpected)"
            />

            <Area
              type="monotone"
              dataKey="highSpendBalance"
              name="High Spend"
              stroke="#F43F5E"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorHighSpend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Includes upcoming auto-debits (WiFi ₹499, Spotify ₹59, etc.)</span>
        <span className="font-semibold text-teal-600 dark:text-teal-400">
          Target Day 30 Finish: ₹{forecast[forecast.length - 1]?.expectedBalance ?? 0}
        </span>
      </div>
    </div>
  );
};
