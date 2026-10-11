import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wallet,
  CheckCircle2,
  ArrowRight,
  X,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" role="presentation">
      <div
        className="bg-white dark:bg-[#111726] rounded-3xl w-full max-w-lg p-6 sm:p-8 border border-teal-500/30 shadow-2xl relative space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Close onboarding modal"
          className="absolute right-5 top-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-teal-500'
                  : s < step
                  ? 'w-4 bg-teal-500/40'
                  : 'w-4 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
          <span className="text-[11px] font-bold text-slate-400 ml-2">
            Step {step} of 3
          </span>
        </div>

        {/* Step 1: Welcome & ₹10,000 baseline */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 font-black text-xl">
              ₹
            </div>
            <div>
              <h2 id="onboarding-modal-title" className="text-xl font-extrabold text-slate-900 dark:text-white">
                Welcome to Z-Finance
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                You have a ₹10,000 monthly allowance managed across 30 days. Most apps only tell you what you spent *yesterday*. Z-Finance predicts what you can safely spend *today*.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-200 space-y-1">
              <div className="font-bold">✨ Realistic Seed Data Pre-Loaded:</div>
              <div>
                We've set your dashboard to <strong>Day 12 of 30</strong> with authentic college UPI payments, Wi-Fi splits, Spotify, and active savings targets.
              </div>
            </div>
          </div>
        )}

        {/* Step 2: The 3 Capital Buckets */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                The 3 Capital Buckets
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Never confuse "bank balance" with "safe-to-spend balance" again.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-slate-800 dark:text-slate-200">
                <strong className="text-orange-600 dark:text-orange-400">1. Spent Money:</strong> Past dining, metro passes, and groceries.
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-800 dark:text-slate-200">
                <strong className="text-blue-600 dark:text-blue-400">2. Committed Dues:</strong> Auto-debits locked away (Broadband ₹499, Spotify ₹59).
              </div>
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-slate-800 dark:text-slate-200">
                <strong className="text-teal-600 dark:text-teal-400">3. Genuinely Available:</strong> Truly free discretionary cash divided dynamically by remaining days.
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Decision Sandbox */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                The Decision Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Wondering: <em>"Can I afford that ₹2,000 sneaker purchase today?"</em>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p>
                Our interactive sandbox models the exact delta on your <strong>daily allowance</strong>, <strong>health score</strong>, and <strong>Day 30 runway</strong> before you swipe.
              </p>
              <p className="font-semibold text-teal-600 dark:text-teal-400">
                Test emergencies, price hikes, or bonuses with zero financial risk.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Skip Tour
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-teal-500/25 flex items-center gap-1.5 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch Command Center</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
