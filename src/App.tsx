import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { TransactionManager } from './components/transactions/TransactionManager';
import { BudgetPlanner } from './components/budget/BudgetPlanner';
import { SavingsGoalsView } from './components/savings/SavingsGoalsView';
import { SubscriptionManager } from './components/subscriptions/SubscriptionManager';
import { DecisionSimulatorView } from './components/simulator/DecisionSimulatorView';
import { FinancialInsightsView } from './components/insights/FinancialInsightsView';
import { SettingsView } from './components/settings/SettingsView';
import { UnexpectedExpenseModal } from './components/simulator/UnexpectedExpenseModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { HelpCircle } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [unexpectedModalOpen, setUnexpectedModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    const seen = localStorage.getItem('onboarding_seen');
    return !seen;
  });

  const handleCloseOnboarding = () => {
    setOnboardingOpen(false);
    localStorage.setItem('onboarding_seen', 'true');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header
        onOpenUnexpectedModal={() => setUnexpectedModalOpen(true)}
        onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          mobileNavOpen={mobileNavOpen}
          onCloseMobileNav={() => setMobileNavOpen(false)}
        />

        {/* Content View Container */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              onOpenAddTransaction={() => setActiveTab('transactions')}
            />
          )}
          {activeTab === 'transactions' && <TransactionManager />}
          {activeTab === 'budget' && <BudgetPlanner />}
          {activeTab === 'savings' && <SavingsGoalsView />}
          {activeTab === 'subscriptions' && <SubscriptionManager />}
          {activeTab === 'simulator' && <DecisionSimulatorView />}
          {activeTab === 'insights' && <FinancialInsightsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Footer with Mandatory Branding */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-4 bg-white/50 dark:bg-[#0B0F19]/50 backdrop-blur-sm text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Z-Finance
            </span>
            <span>•</span>
            <span>Gen Z Personal Budget & Decision Engine (₹10,000 / 30-Day Model)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setOnboardingOpen(true)}
              className="hover:text-teal-500 transition flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How It Works</span>
            </button>
            <span>•</span>
            <span className="font-semibold text-teal-600 dark:text-teal-400">
              Built with care by Bhargavi N
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <UnexpectedExpenseModal
        isOpen={unexpectedModalOpen}
        onClose={() => setUnexpectedModalOpen(false)}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={handleCloseOnboarding}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
};

export default App;
