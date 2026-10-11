import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { formatCurrency } from '../../engine/financialEngine';

interface UnexpectedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnexpectedExpenseModal: React.FC<UnexpectedExpenseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    summary,
    addTransaction,
    setActiveTab,
    runSimulation,
  } = useFinance();

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [title, setTitle] = useState('Emergency Travel');
  const [category, setCategory] = useState<'healthcare' | 'transport' | 'other' | 'bills' | 'shopping'>('transport');

  const PRESETS = [
    { title: 'Emergency Travel', amount: 950, category: 'transport' as const },
    { title: 'Medical Expenses', amount: 1200, category: 'healthcare' as const },
    { title: 'Device Repairs', amount: 2500, category: 'other' as const },
    { title: 'Unplanned Shopping', amount: 1800, category: 'shopping' as const },
  ];

  useKeyboardShortcut('Escape', onClose, isOpen);

  if (!isOpen) return null;

  const effectiveAmount = selectedPreset !== null ? PRESETS[selectedPreset].amount : parseFloat(customAmount) || 0;
  const simulatedAvailable = summary.availableBalance - effectiveAmount;
  const simulatedDaily = summary.remainingDays > 0 ? Math.max(0, Math.floor(simulatedAvailable / summary.remainingDays)) : 0;
  const deltaDaily = simulatedDaily - summary.dailyAllowance;
  const isAffordable = simulatedAvailable >= 0;

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setTitle(PRESETS[idx].title);
    setCategory(PRESETS[idx].category);
    setCustomAmount(PRESETS[idx].amount.toString());
  };

  const handleCommitShockToRealBudget = () => {
    if (effectiveAmount <= 0) return;

    addTransaction({
      title: title.trim(),
      amount: effectiveAmount,
      type: 'expense',
      category: category,
      date: new Date().toISOString().split('T')[0],
      dayNumber: summary.currentDay,
      paymentMethod: 'UPI',
      notes: 'Unexpected Emergency Expense shock committed',
    });

    onClose();
  };

  const handleSendToFullSimulator = () => {
    if (effectiveAmount <= 0) return;
    runSimulation({
      type: 'emergency_shock',
      title,
      amount: effectiveAmount,
      category,
    });
    onClose();
    setActiveTab('simulator');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" role="presentation">
      <div
        className="bg-white dark:bg-[#111726] rounded-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unexpected-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Close unexpected expense modal"
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 id="unexpected-modal-title" className="text-base font-black text-slate-900 dark:text-white">
              Unexpected Expense Shock Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Stress-test your ₹10k budget resilience against sudden emergencies
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Pick a Preset Scenario or Enter Custom:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(idx)}
                className={`p-2.5 text-left rounded-xl border text-xs transition ${
                  selectedPreset === idx
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 font-bold'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="truncate">{p.title}</div>
                <div className="font-extrabold mt-0.5">{formatCurrency(p.amount)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="unexpected-custom-amount" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Custom Amount (₹)
            </label>
            <input
              id="unexpected-custom-amount"
              type="number"
              placeholder="e.g. 1500"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedPreset(null);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label htmlFor="unexpected-custom-title" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Description
            </label>
            <input
              id="unexpected-custom-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Instant Impact Preview */}
        {effectiveAmount > 0 && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              isAffordable
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-200'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-950 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span>Remaining Available Balance:</span>
              <span className="text-sm font-black">
                {formatCurrency(simulatedAvailable)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Daily Allowance Impact:</span>
              <span className="font-bold">
                {formatCurrency(simulatedDaily)}/d ({deltaDaily} /d)
              </span>
            </div>
            <div className="text-[11px] opacity-80 pt-1 border-t border-slate-300/40 dark:border-slate-700/40">
              {isAffordable
                ? `Your budget can absorb this shock, but daily spend must be reduced by ₹${Math.abs(deltaDaily)}/day.`
                : 'Warning: This shock exceeds available funds and would create an immediate deficit!'}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSendToFullSimulator}
            disabled={effectiveAmount <= 0}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 disabled:opacity-40"
          >
            <span>Deep Sandbox Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCommitShockToRealBudget}
              disabled={effectiveAmount <= 0}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-500/20 disabled:opacity-40"
            >
              Commit to Real Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
