import React, { useState, Suspense, lazy } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { useFinance } from './hooks/useFinance';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Toast } from './components/common/Toast';
import { UnexpectedExpenseModal } from './components/simulator/UnexpectedExpenseModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { HelpCircle } from 'lucide-react';

// Dynamic lazy-loaded view chunks for optimized bundle performance
const OverviewDashboard = lazy(() =>
  import('./components/dashboard/OverviewDashboard').then((m) => ({ default: m.OverviewDashboard }))
);
const TransactionManager = lazy(() =>
  import('./components/transactions/TransactionManager').then((m) => ({ default: m.TransactionManager }))
);
const BudgetPlanner = lazy(() =>
  import('./components/budget/BudgetPlanner').then((m) => ({ default: m.BudgetPlanner }))
);
const SavingsGoalsView = lazy(() =>
  import('./components/savings/SavingsGoalsView').then((m) => ({ default: m.SavingsGoalsView }))
);
const SubscriptionManager = lazy(() =>
  import('./components/subscriptions/SubscriptionManager').then((m) => ({ default: m.SubscriptionManager }))
);
const DecisionSimulatorView = lazy(() =>
  import('./components/simulator/DecisionSimulatorView').then((m) => ({ default: m.DecisionSimulatorView }))
);
const FinancialInsightsView = lazy(() =>
  import('./components/insights/FinancialInsightsView').then((m) => ({ default: m.FinancialInsightsView }))
);
const SettingsView = lazy(() =>
  import('./components/settings/SettingsView').then((m) => ({ default: m.SettingsView }))
);

const ViewSkeletonLoader: React.FC = () => (
  <div className="space-y-6 animate-pulse p-2" aria-label="Loading view content">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="lg:col-span-4 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  </div>
);

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, toast } = useFinance();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [unexpectedModalOpen, setUnexpectedModalOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage<boolean>('onboarding_seen', false);
  const [onboardingManualOpen, setOnboardingManualOpen] = useState(false);

  const onboardingOpen = !hasSeenOnboarding || onboardingManualOpen;

  const handleCloseOnboarding = () => {
    setHasSeenOnboarding(true);
    setOnboardingManualOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-500 focus:text-slate-950 focus:rounded-xl focus:font-bold focus:shadow-xl outline-none"
      >
        Skip to main content
      </a>

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

        {/* Content View Container with Error Boundary & Suspense */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto focus:outline-none"
        >
          <ErrorBoundary>
            <Suspense fallback={<ViewSkeletonLoader />}>
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
            </Suspense>
          </ErrorBoundary>
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
              onClick={() => setOnboardingManualOpen(true)}
              aria-label="Open how it works walkthrough"
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

      {/* Global Toast Notifications */}
      <Toast toast={toast} />

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
