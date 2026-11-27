import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useHRStore } from '../../store/useHRStore';

export const Toaster: React.FC = () => {
  const { toasts, dismissToast } = useHRStore();

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon =
            toast.variant === 'success'
              ? CheckCircle2
              : toast.variant === 'warning' || toast.variant === 'danger'
                ? AlertTriangle
                : Info;
          const iconColor =
            toast.variant === 'success'
              ? 'text-[#00b473]'
              : toast.variant === 'warning'
                ? 'text-[#746019] dark:text-[#ffd02f]'
                : toast.variant === 'danger'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-[var(--accent)]';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 shadow-xl"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
