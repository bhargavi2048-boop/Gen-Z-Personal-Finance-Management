import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { Subscription, ExpenseCategory } from '../../types';
import { formatCurrency } from '../../engine/financialEngine';

export const SubscriptionManager: React.FC = () => {
  const {
    subscriptions,
    addSubscription,
    editSubscription,
    deleteSubscription,
    toggleSimulateCancelSubscription,
    summary,
    currentDay,
    totalDays,
  } = useFinance();

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useKeyboardShortcut('Escape', () => setIsModalOpen(false), isModalOpen);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDay, setBillingDay] = useState(15);
  const [category, setCategory] = useState<ExpenseCategory>('bills');
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setBillingDay(15);
    setCategory('bills');
    setProvider('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingId(sub.id);
    setName(sub.name);
    setAmount(sub.amount.toString());
    setBillingDay(sub.billingDay);
    setCategory(sub.category);
    setProvider(sub.provider);
    setDescription(sub.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim()) {
      setFormError('Please enter a service name.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid subscription amount.');
      return;
    }

    if (editingId) {
      editSubscription(editingId, {
        name: name.trim(),
        amount: parsedAmount,
        billingDay,
        category,
        provider: provider.trim() || name.trim(),
        description: description.trim(),
      });
    } else {
      addSubscription({
        name: name.trim(),
        amount: parsedAmount,
        billingDay,
        category,
        provider: provider.trim() || name.trim(),
        description: description.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Calculations
  const activeSubs = subscriptions.filter((s) => !s.isSimulatedCancelled);
  const totalMonthlyCost = activeSubs.reduce((sum, s) => sum + s.amount, 0);
  const simulatedSavedAmount = subscriptions
    .filter((s) => s.isSimulatedCancelled)
    .reduce((sum, s) => sum + s.amount, 0);

  const budgetLoadPercent = Math.round(
    (totalMonthlyCost / (summary.initialBudget + summary.totalIncome)) * 100
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Recurring Subscriptions & OTT
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit recurring micro-drains and simulate cancellation savings
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Subscription Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Monthly Auto-Debit Load
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalMonthlyCost)}
            <span className="text-xs font-normal text-slate-400"> / month</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Consumes <span className="font-bold text-teal-600 dark:text-teal-400">{budgetLoadPercent}%</span> of ₹10,000 budget
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Simulated Cancellation Savings
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +{formatCurrency(simulatedSavedAmount)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {simulatedSavedAmount > 0
              ? `Unlocks ~₹${Math.round(simulatedSavedAmount / summary.remainingDays)}/day for daily allowance`
              : 'Toggle "Simulate Cancel" on any card below'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Subscriptions
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {activeSubs.length}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {subscriptions.length} tracked
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audited for Gen Z students & grads
          </div>
        </div>
      </div>

      {/* Smart Sub-Killer & Wealth Accumulator Innovation Feature */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-indigo-500/10 rounded-2xl p-5 border border-teal-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Smart Sub-Killer & Wealth Accumulator
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {simulatedSavedAmount > 0
              ? `You are freeing up ${formatCurrency(simulatedSavedAmount * 12)}/year by cancelling simulated subscriptions!`
              : 'Simulate cancelling subscriptions to visualize 10-year compounding wealth'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {simulatedSavedAmount > 0
              ? `Redirecting ₹${simulatedSavedAmount}/mo into an index fund/SIP at 12% CAGR yields ~₹${Math.round(simulatedSavedAmount * 42).toLocaleString('en-IN')} in 3 years and ~₹${Math.round(simulatedSavedAmount * 230).toLocaleString('en-IN')} in 10 years.`
              : 'Every ₹200/mo subscription eliminated equals ₹2,400/yr saved or ₹55,000+ invested over a decade.'}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Annualized Saved</div>
            <div className="text-base font-black text-teal-600 dark:text-teal-400">
              +{formatCurrency(simulatedSavedAmount * 12)}
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subscriptions.map((sub) => {
          const isCancelled = sub.isSimulatedCancelled;
          const isUpcomingThisMonth = sub.billingDay >= currentDay;
          const dailyBoost = Math.round(sub.amount / summary.remainingDays);

          return (
            <div
              key={sub.id}
              className={`rounded-2xl p-5 border transition shadow-sm flex flex-col justify-between space-y-4 ${
                isCancelled
                  ? 'bg-slate-100/80 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-700 opacity-75'
                  : 'bg-white dark:bg-[#111726] border-slate-200/80 dark:border-slate-800/80 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        isCancelled
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      <Repeat className="w-5 h-5" />
                    </div>

                    <div>
                      <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{sub.name}</span>
                        {isCancelled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Simulated Cancelled
                          </span>
                        )}
                      </h2>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{sub.provider}</span>
                        <span>•</span>
                        <span className="capitalize">{sub.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-base font-black ${
                        isCancelled
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {formatCurrency(sub.amount)}
                      <span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                  </div>
                </div>

                {sub.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    {sub.description}
                  </p>
                )}

                {/* Billing Info Pill */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Auto-Debit Day: Day {sub.billingDay}</span>
                  </div>
                  <div>
                    {isUpcomingThisMonth ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                        Due in {sub.billingDay - currentDay} days
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        Billed for this cycle
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(sub)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Subscription"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete Subscription"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulate Cancel Toggle Button */}
                <button
                  onClick={() => toggleSimulateCancelSubscription(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isCancelled
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {isCancelled
                      ? 'Reactivate Subscription'
                      : `Simulate Cancel (+₹${dailyBoost}/d)`}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" role="presentation">
          <div
            className="bg-white dark:bg-[#111726] rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sub-modal-title"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Close subscription modal"
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 id="sub-modal-title" className="text-lg font-black text-slate-900 dark:text-white">
              {editingId ? 'Edit Subscription' : 'Add Recurring Subscription'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically creates upcoming auto-debit commitment
            </p>

            {formError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label htmlFor="sub-form-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Name
                </label>
                <input
                  id="sub-form-name"
                  type="text"
                  placeholder="e.g. Netflix Mobile, Spotify, Gym, Cloud Storage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sub-form-amount" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Fee (₹)
                  </label>
                  <input
                    id="sub-form-amount"
                    type="number"
                    min="1"
                    placeholder="199"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="sub-form-billing-day" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Debit Day (1-{totalDays})
                  </label>
                  <input
                    id="sub-form-billing-day"
                    type="number"
                    min="1"
                    max={totalDays}
                    value={billingDay}
                    onChange={(e) => setBillingDay(parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sub-form-cat" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="sub-form-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 capitalize"
                  >
                    <option value="bills">Bills & Utilities</option>
                    <option value="entertainment">Entertainment / OTT</option>
                    <option value="healthcare">Healthcare / Gym</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="sub-form-provider" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Entity / App
                  </label>
                  <input
                    id="sub-form-provider"
                    type="text"
                    placeholder="e.g. Apple, Google, Jio"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sub-form-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  id="sub-form-notes"
                  type="text"
                  placeholder="e.g. Split with roommate, cancel after exam"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md shadow-teal-500/20 active:scale-95"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
