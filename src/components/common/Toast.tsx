import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { ToastNotification } from '../../context/FinanceContext';

interface ToastProps {
  toast: ToastNotification | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-teal-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200',
    info: 'border-teal-500/20 bg-teal-500/10 text-teal-950 dark:text-teal-200',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-950 dark:text-amber-200',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 animate-bounce-subtle pointer-events-none"
    >
      <div
        className={`px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md bg-white/95 dark:bg-[#111726]/95 flex items-center gap-2.5 text-xs font-semibold max-w-sm ${borders[toast.type]}`}
      >
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
