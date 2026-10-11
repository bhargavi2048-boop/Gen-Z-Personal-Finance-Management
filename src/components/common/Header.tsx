import React from 'react';
import {
  Moon,
  Sun,
  Zap,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../engine/financialEngine';

interface HeaderProps {
  onOpenUnexpectedModal: () => void;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUnexpectedModal,
  onToggleMobileNav,
}) => {
  const {
    currentDay,
    setCurrentDay,
    totalDays,
    summary,
    health,
    isDarkMode,
    toggleDarkMode,
  } = useFinance();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileNav}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-400 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20 text-white font-black text-lg tracking-wider">
                Z
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                    Z-Finance
                  </span>
                  <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    Gen Z ₹10k
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  30-Day Budget & Decision Engine
                </p>
              </div>
            </div>
          </div>

          {/* Center: Interactive Day Scrubber */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
            <button
              onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
              disabled={currentDay <= 1}
              className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
              title="Previous Day"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-2.5 text-center min-w-[110px]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Simulation Day
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-teal-600 dark:text-teal-400 flex items-center justify-center gap-1">
                Day {currentDay}{' '}
                <span className="text-slate-400 font-normal text-xs">/ {totalDays}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentDay(Math.min(totalDays, currentDay + 1))}
              disabled={currentDay >= totalDays}
              className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
              title="Next Day"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Quick KPI badges, Unexpected Simulator Button & Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Health Score Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70">
              <ShieldCheck
                className={`w-4 h-4 ${
                  health.riskLevel === 'Low'
                    ? 'text-teal-500'
                    : health.riskLevel === 'Moderate'
                    ? 'text-amber-500'
                    : 'text-rose-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Score:
              </span>
              <span
                className={`text-xs font-bold ${
                  health.score >= 70
                    ? 'text-teal-600 dark:text-teal-400'
                    : health.score >= 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-500'
                }`}
              >
                {health.score}/100
              </span>
            </div>

            {/* Daily Allowance Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300">
              <Zap className="w-3.5 h-3.5 text-teal-500" />
              <div className="text-xs">
                <span className="font-normal opacity-80">Daily: </span>
                <span className="font-bold">{formatCurrency(summary.dailyAllowance)}/d</span>
              </div>
            </div>

            {/* Unexpected Expense Simulator Quick Button */}
            <button
              onClick={onOpenUnexpectedModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition shadow-sm active:scale-95"
              title="Test Unexpected Expense Shock"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Shock</span>
              <span className="sm:hidden">Shock</span>
            </button>

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Toggle dark mode"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
