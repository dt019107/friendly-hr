import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/format';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'yellow' | 'teal' | 'rose' | 'coral';
}

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col gap-3 border-b border-[var(--border-hairline)] pb-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export const Card: React.FC<CardProps> = ({
  tone = 'default',
  className,
  children,
  ...props
}) => {
  const toneClasses = {
    default: 'rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] card-elevated',
    yellow: 'rounded-[28px] border border-[var(--border-hairline)] bg-[var(--brand-yellow-soft)] text-[var(--text-primary)]',
    teal: 'rounded-[28px] border border-[var(--border-hairline)] bg-[var(--brand-teal-soft)] text-[var(--text-primary)]',
    rose: 'rounded-[28px] border border-[var(--border-hairline)] bg-[var(--brand-rose-soft)] text-[var(--text-primary)]',
    coral: 'rounded-[28px] border border-[var(--border-hairline)] bg-[var(--brand-coral-soft)] text-[var(--text-primary)]',
  };

  return (
    <div className={cn(toneClasses[tone], className)} {...props}>
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'blue' | 'yellow';
  size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-[transform,background-color,color,border-color] duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 disabled:opacity-45 disabled:pointer-events-none cursor-pointer';
  const variants = {
    primary:
      'rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]',
    secondary:
      'rounded-full bg-transparent text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-raised)]',
    blue:
      'rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
    yellow:
      'rounded-full bg-[var(--brand-yellow)] text-[#1c1c1e] hover:opacity-90',
    ghost:
      'rounded-lg bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-raised)]',
    danger: 'rounded-full bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'h-8 px-3.5 text-xs',
    md: 'h-9 px-5 text-sm',
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'yellow' | 'success' | 'warning' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', className, children, ...props }) => {
  const tones = {
    neutral: 'bg-[var(--bg-raised)] text-[var(--text-secondary)] border-[var(--border-hairline)]',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)] border-transparent',
    yellow: 'bg-[var(--brand-yellow-soft)] text-[var(--brand-yellow-dark)] border-transparent',
    success: 'bg-[#00b473]/12 text-[#008f5b] dark:text-[#00b473] border-transparent',
    warning: 'bg-[var(--brand-yellow-soft)] text-[var(--brand-yellow-dark)] border-transparent',
    danger: 'bg-[#ffc6c6]/60 text-[#600000] dark:bg-red-500/15 dark:text-red-400 border-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ open, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) => {
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050038]/35 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'w-full rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 shadow-2xl',
              maxWidth
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="modal-title" className="text-base font-medium text-[var(--text-primary)]">
                  {title}
                </h2>
                {subtitle && <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
