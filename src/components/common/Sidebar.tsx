import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Repeat,
  Sparkles,
  Lightbulb,
  Settings,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ActiveTab, useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../engine/financialEngine';

interface SidebarProps {
  mobileNavOpen: boolean;
  onCloseMobileNav: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileNavOpen,
  onCloseMobileNav,
}) => {
  const { activeTab, setActiveTab, summary, health, insights } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budget', label: 'Budget Planner', icon: PieChart },
    { id: 'savings', label: 'Savings Goals', icon: Target },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'simulator', label: 'Decision Simulator', icon: Sparkles, badge: 'Sandbox' },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb, badge: insights.length },
    { id: 'settings', label: 'Settings & About', icon: Settings },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobileNav();
  };

  const content = (
    <div className="flex flex-col h-full justify-between p-4 bg-white dark:bg-[#0E1322] border-r border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="space-y-6">
        {/* Navigation links */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25 dark:bg-teal-500 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-teal-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : item.id === 'simulator'
                        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini status card in sidebar footer */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Genuinely Available
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Discretionary
            </span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {formatCurrency(summary.availableBalance)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-teal-500" />
              {formatCurrency(summary.dailyAllowance)}/d
            </span>
            <span className="flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-3 h-3" />
              {health.score} pts
            </span>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Personal Finance v1.0 • Gen Z Edition
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobileNav}
          />
          <div className="relative w-72 max-w-xs h-full bg-white dark:bg-[#0E1322] shadow-2xl flex flex-col z-10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="font-bold text-sm text-slate-900 dark:text-white">Menu Navigation</div>
              <button
                onClick={onCloseMobileNav}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
          </div>
        </div>
      )}
    </>
  );
};
