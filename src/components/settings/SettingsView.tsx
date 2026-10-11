import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Download,
  Upload,
  Moon,
  Sun,
  ShieldCheck,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../engine/financialEngine';

export const SettingsView: React.FC = () => {
  const {
    initialBudget,
    setInitialBudget,
    currentDay,
    setCurrentDay,
    totalDays,
    setTotalDays,
    isDarkMode,
    toggleDarkMode,
    resetToDefaults,
    exportDataJSON,
    importDataJSON,
    summary,
  } = useFinance();

  const [budgetInput, setBudgetInput] = useState(initialBudget.toString());
  const [totalDaysInput, setTotalDaysInput] = useState(totalDays.toString());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveBudgetConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const b = parseFloat(budgetInput);
    const d = parseInt(totalDaysInput);
    if (!isNaN(b) && b > 0) setInitialBudget(b);
    if (!isNaN(d) && d >= 1) setTotalDays(d);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `z_finance_backup_day_${currentDay}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setImportStatus('Data backup successfully restored!');
        } else {
          setImportStatus('Error importing JSON. Please verify file format.');
        }
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System Settings & Simulation Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure baseline budget, simulate advancing timeline, manage data backups
        </p>
      </div>

      {/* Interactive Day Progression Slider */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                30-Day Simulation Timeline Scrubber
              </h2>
              <p className="text-xs text-slate-400">
                Slide forward or backward to test how daily allowance and health score adapt
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-teal-600 dark:text-teal-400">
              Day {currentDay}
            </span>
            <span className="text-xs text-slate-400"> / {totalDays}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <input
            type="range"
            min="1"
            max={totalDays}
            value={currentDay}
            onChange={(e) => setCurrentDay(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
            <span>Day 1 (Cycle Start)</span>
            <span>Day 15 (Midpoint)</span>
            <span>Day {totalDays} (End-of-Month)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Remaining Cycle Days: <strong>{summary.remainingDays} days</strong></span>
          <span>Calculated Daily Allowance: <strong className="text-teal-600 dark:text-teal-400">{formatCurrency(summary.dailyAllowance)}/day</strong></span>
        </div>
      </div>

      {/* Budget & Cycle Parameters */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
          Base Financial Parameters
        </h2>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Budget parameters updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveBudgetConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Budget Baseline (₹)
            </label>
            <input
              type="number"
              min="1000"
              step="500"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: ₹10,000 allowance</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cycle Duration (Days)
            </label>
            <input
              type="number"
              min="7"
              max="90"
              value={totalDaysInput}
              onChange={(e) => setTotalDaysInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: 30 days</p>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-sm"
            >
              Update Cycle Parameters
            </button>
          </div>
        </form>
      </div>

      {/* Theme & Display Options */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Interface Theme
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between deep fintech dark mode and clean daylight theme
          </p>
        </div>

        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          <span>{isDarkMode ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
      </div>

      {/* Data Backup, Export & Reset */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
          Data Management & Reset
        </h2>

        {importStatus && (
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExport}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-teal-500" />
            <span>Export Data (JSON)</span>
          </button>

          <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-500" />
            <span>Import Backup (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={resetToDefaults}
            className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </div>

      {/* About Section & Required Personal Branding */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-[#0B0F19] border border-teal-500/20 text-center space-y-3 shadow-md">
        <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="text-base font-extrabold text-white">
          About Z-Finance Web Application
        </h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
          Engineered specifically for Gen Z students and early-career young adults navigating a ₹10,000 monthly allowance over 30 days. Designed to eliminate floating-point currency anomalies, prevent double-counting of commitments, and simulate major life purchases safely before swiping.
        </p>

        <div className="pt-4 border-t border-teal-500/20">
          <p className="text-sm font-bold text-teal-400 tracking-wide flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>Built with care by Bhargavi N</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Senior AI Engineer & Full-Stack Architect
          </p>
        </div>
      </div>
    </div>
  );
};
