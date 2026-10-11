import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Tag,
  X,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useDebounce } from '../../hooks/useDebounce';
import { Category, PaymentMethod, Transaction, TransactionType } from '../../types';
import { formatCurrency } from '../../engine/financialEngine';
import { CATEGORY_METADATA } from '../../constants/initialData';

export const TransactionManager: React.FC = () => {
  const {
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    currentDay,
    totalDays,
    summary,
  } = useFinance();

  // Search, filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 200);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'day_desc' | 'day_asc' | 'amount_desc' | 'amount_asc'>('day_desc');

  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formCategory, setFormCategory] = useState<Category>('food');
  const [formDayNumber, setFormDayNumber] = useState(currentDay);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('UPI');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormAmount('');
    setFormType('expense');
    setFormCategory('food');
    setFormDayNumber(currentDay);
    setFormPaymentMethod('UPI');
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingId(tx.id);
    setFormTitle(tx.title);
    setFormAmount(tx.amount.toString());
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormDayNumber(tx.dayNumber);
    setFormPaymentMethod(tx.paymentMethod);
    setFormNotes(tx.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount);

    if (!formTitle.trim()) {
      setFormError('Please enter a description or title.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (editingId) {
      editTransaction(editingId, {
        title: formTitle.trim(),
        amount: parsedAmount,
        type: formType,
        category: formCategory,
        dayNumber: formDayNumber,
        paymentMethod: formPaymentMethod,
        notes: formNotes.trim(),
      });
    } else {
      addTransaction({
        title: formTitle.trim(),
        amount: parsedAmount,
        type: formType,
        category: formCategory,
        date: new Date().toISOString().split('T')[0],
        dayNumber: formDayNumber,
        paymentMethod: formPaymentMethod,
        notes: formNotes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Filtered & sorted transaction list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search query
        if (
          debouncedSearchQuery &&
          !t.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
          !(t.notes || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        ) {
          return false;
        }

        // Type filter
        if (filterType !== 'all' && t.type !== filterType) return false;

        // Category filter
        if (filterCategory !== 'all' && t.category !== filterCategory) return false;

        // Payment method filter
        if (filterPayment !== 'all' && t.paymentMethod !== filterPayment) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'day_desc') return b.dayNumber - a.dayNumber;
        if (sortBy === 'day_asc') return a.dayNumber - b.dayNumber;
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, debouncedSearchQuery, filterType, filterCategory, filterPayment, sortBy]);

  const totalInflow = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track daily UPI, card, and cash spends with automatic budget impact
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Inflow
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatCurrency(totalInflow)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Outflow
            </div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
              -{formatCurrency(totalOutflow)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Available Runway
            </div>
            <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {formatCurrency(summary.availableBalance)}
            </div>
          </div>
          <div className="text-xs text-right text-slate-400">
            <div>{summary.remainingDays} days remaining</div>
            <div className="font-bold text-slate-700 dark:text-slate-300">
              {formatCurrency(summary.dailyAllowance)}/day
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Type filter */}
          <div className="md:col-span-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'expense' | 'income')}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="md:col-span-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 capitalize"
            >
              <option value="all">All Categories</option>
              {Object.keys(CATEGORY_METADATA).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_METADATA[cat as keyof typeof CATEGORY_METADATA].label}
                </option>
              ))}
              <option value="allowance">Allowance</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          {/* Payment method filter */}
          <div className="md:col-span-2">
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Payments</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="NetBanking">Net Banking</option>
            </select>
          </div>

          {/* Sort order */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'day_desc' | 'day_asc' | 'amount_desc' | 'amount_asc')}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="day_desc">Newest (Day Desc)</option>
              <option value="day_asc">Oldest (Day Asc)</option>
              <option value="amount_desc">Amount (High to Low)</option>
              <option value="amount_asc">Amount (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No transactions match your criteria
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterCategory('all');
                setFilterPayment('all');
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 text-xs font-bold transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {tx.title}
                      </span>
                      {tx.isRecurring && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                          Recurring
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      <span className="font-semibold text-teal-600 dark:text-teal-400">
                        Day {tx.dayNumber}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{tx.category}</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {tx.paymentMethod}
                      </span>
                      {tx.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-500 max-w-xs truncate">
                            {tx.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div
                    className={`text-base font-extrabold tracking-tight ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" role="presentation">
          <div
            className="bg-white dark:bg-[#111726] rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tx-modal-title"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Close transaction modal"
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 id="tx-modal-title" className="text-lg font-black text-slate-900 dark:text-white">
              {editingId ? 'Edit Transaction' : 'Record New Transaction'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Updates your ₹10,000 budget and daily allowance in real time
            </p>

            {formError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    formType === 'expense'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Expense (-)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    formType === 'income'
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Income (+)
                </button>
              </div>

              {/* Title input */}
              <div>
                <label htmlFor="tx-form-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Merchant
                </label>
                <input
                  id="tx-form-title"
                  type="text"
                  placeholder="e.g. Canteen Lunch, Swiggy, Metro Recharge"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Amount & Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tx-form-amount" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    id="tx-form-amount"
                    type="number"
                    step="1"
                    min="1"
                    placeholder="250"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tx-form-day" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cycle Day (1-{totalDays})
                  </label>
                  <input
                    id="tx-form-day"
                    type="number"
                    min="1"
                    max={totalDays}
                    value={formDayNumber}
                    onChange={(e) => setFormDayNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tx-form-cat" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="tx-form-cat"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 capitalize"
                  >
                    {formType === 'expense' ? (
                      <>
                        <option value="food">Food & Dining</option>
                        <option value="transport">Transport & Metro</option>
                        <option value="education">Education</option>
                        <option value="shopping">Shopping</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="bills">Bills & Utilities</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="personal">Personal Care</option>
                        <option value="other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="allowance">Allowance / Stipend</option>
                        <option value="freelance">Freelance Gig</option>
                        <option value="gift">Gift / Cash</option>
                        <option value="cashback">Cashback / Refund</option>
                        <option value="other_income">Other Income</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="tx-form-payment" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    id="tx-form-payment"
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="NetBanking">Net Banking</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="tx-form-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  id="tx-form-notes"
                  type="text"
                  placeholder="e.g. Split with Ananya, hackathon ticket"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Actions */}
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
                  {editingId ? 'Save Changes' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
