import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  IndianRupee,
  ShieldCheck,
  Smartphone,
  Wand2,
  Sun,
  Moon,
  RotateCcw,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useHRStore } from '../../store/useHRStore';
import { cn } from '../../lib/format';
import type { IndianState, NavTab, Role } from '../../types/hr';
import { Modal, Button, Badge } from '../ui/Primitives';

interface AppShellProps {
  children: React.ReactNode;
  globalSearch: string;
  onGlobalSearch: (val: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  globalSearch,
  onGlobalSearch,
}) => {
  const {
    role,
    setRole,
    activeTab,
    setActiveTab,
    darkMode,
    toggleDarkMode,
    selectedState,
    setSelectedState,
    company,
    showRoleModal,
    setShowRoleModal,
    resetDemoData,
    leaves,
    complianceRules,
  } = useHRStore();

  const [workforceOpen, setWorkforceOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;
  const overdueCount = complianceRules.filter(
    (r) => r.state === selectedState && r.status === 'Overdue'
  ).length;

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeTone?: 'danger' | 'accent';
    roles: Role[];
  }> = [
    { id: 'home', label: "Today's Actions", icon: LayoutDashboard, roles: ['Owner', 'HR'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['Owner', 'HR'] },
    {
      id: 'attendance',
      label: 'Attendance & Leave',
      icon: CalendarCheck2,
      badge: pendingLeavesCount,
      badgeTone: 'accent',
      roles: ['Owner', 'HR'],
    },
    { id: 'payroll', label: 'Payroll Summary', icon: IndianRupee, roles: ['Owner', 'HR'] },
    {
      id: 'compliance',
      label: 'Compliance Calendar',
      icon: ShieldCheck,
      badge: overdueCount,
      badgeTone: 'danger',
      roles: ['Owner', 'HR'],
    },
    { id: 'mobile', label: 'Employee Self-Service', icon: Smartphone, roles: ['Owner', 'HR', 'Employee'] },
    { id: 'onboarding', label: '15-Min Setup Wizard', icon: Wand2, roles: ['Owner', 'HR'] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  const SidebarContent = () => {
    const opsItems = visibleNav.filter((item) =>
      ['employees', 'attendance', 'payroll', 'compliance'].includes(item.id)
    );
    const workspaceItems = visibleNav.filter((item) =>
      ['mobile', 'onboarding'].includes(item.id)
    );

    const renderNavButton = (item: (typeof navItems)[number]) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            setActiveTab(item.id);
            setMobileMenuOpen(false);
          }}
          className={cn(
            'relative flex h-9 w-full items-center justify-between rounded-xl px-3 text-[13px] transition-colors',
            isActive
              ? 'font-medium text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-[var(--text-primary)]'
          )}
        >
          {isActive && (
            <motion.span
              layoutId="sidebar-active-pill"
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] shadow-[0_2px_8px_rgba(28,28,30,0.04)] dark:bg-white/[0.07] dark:shadow-none"
            />
          )}
          {isActive && (
            <span className="relative z-10 mr-2 h-4 w-[3px] shrink-0 rounded-full bg-[var(--brand-yellow)]" />
          )}
          <span className="relative z-10 flex min-w-0 flex-1 items-center gap-2.5">
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
              )}
              strokeWidth={1.5}
            />
            <span className="truncate">{item.label}</span>
          </span>
          {typeof item.badge === 'number' && item.badge > 0 && (
            <span
              className={cn(
                'relative z-10 ml-2 rounded-full px-2 py-0.5 font-mono-num text-[11px] font-semibold',
                item.badgeTone === 'danger'
                  ? 'bg-[#ffc6c6]/70 text-[#600000] dark:bg-red-500/20 dark:text-red-400'
                  : 'bg-[var(--brand-yellow-soft)] text-[var(--brand-yellow-dark)]'
              )}
            >
              {item.badge}
            </span>
          )}
        </button>
      );
    };

    return (
      <div className="flex h-full flex-col justify-between px-4 py-5">
        <div>
          {/* Official friendly HR Brand Header */}
          <div className="mb-6 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg
                width="36"
                height="28"
                viewBox="0 0 64 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="shrink-0"
              >
                {/* Left navy person */}
                <circle cx="15" cy="11" r="5" className="fill-[#0b2e59] dark:fill-[#60a5fa]" />
                <path
                  d="M7 22C7 18.5 10.5 17 15 17C19 17 21.5 19.5 21 23C20.5 26 17.5 27.5 17.5 31C17.5 34.5 20.5 37 23 38.5C15 39.5 8 34 7 22Z"
                  className="fill-[#0b2e59] dark:fill-[#60a5fa]"
                />
                {/* Right teal person */}
                <circle cx="49" cy="11" r="5" fill="#00a398" />
                <path
                  d="M57 22C57 18.5 53.5 17 49 17C45 17 42.5 19.5 43 23C43.5 26 46.5 27.5 46.5 31C46.5 34.5 43.5 37 41 38.5C49 39.5 56 34 57 22Z"
                  fill="#00a398"
                />
                {/* Coral smile arc */}
                <path
                  d="M21 35C26.5 41 37.5 41 43 35"
                  stroke="#f26659"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="min-w-0">
                <div className="truncate text-[17px] font-medium tracking-tight leading-none">
                  <span className="text-[#0b2e59] dark:text-[#ededed]">friendly </span>
                  <span className="text-[#00a398]">HR</span>
                </div>
                <div className="mt-1 truncate text-[11px] text-[var(--text-muted)]">
                  {company.plantLocation}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Overview Pill */}
          {role !== 'Employee' && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className={cn(
                'mb-6 flex h-10 w-full items-center justify-between rounded-full px-4 text-[13px] font-medium transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.98]',
                activeTab === 'home'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-[0_6px_18px_rgba(28,28,30,0.16)] dark:shadow-none'
                  : 'border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-raised)]'
              )}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
                Today&apos;s Actions
              </span>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  activeTab === 'home' ? 'bg-[var(--brand-yellow)]' : 'bg-[var(--text-muted)]'
                )}
              />
            </button>
          )}

          {/* Operations Group */}
          {role !== 'Employee' && (
            <div>
              <button
                type="button"
                onClick={() => setWorkforceOpen((v) => !v)}
                className="mb-1.5 flex w-full items-center justify-between px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <span>Operations</span>
                {workforceOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </button>
              {workforceOpen && (
                <nav aria-label="Operations navigation" className="space-y-1">
                  {opsItems.map(renderNavButton)}
                </nav>
              )}
            </div>
          )}

          {/* Workspace Group */}
          <div className={role !== 'Employee' ? 'mt-5' : ''}>
            <div className="mb-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">
              Self-Service &amp; Setup
            </div>
            <nav aria-label="Workspace navigation" className="space-y-1">
              {workspaceItems.map(renderNavButton)}
            </nav>
          </div>
        </div>

        {/* Bottom Luxury Persona Card */}
        <div className="space-y-2.5 border-t border-[var(--border-hairline)] pt-4">
          <button
            type="button"
            onClick={() => setShowRoleModal(true)}
            className="group flex w-full items-center justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 text-left transition-colors hover:border-[var(--border-strong)] card-elevated"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--btn-primary-bg)] text-xs font-semibold text-[var(--btn-primary-text)]">
                {role === 'Owner' ? 'OW' : role === 'HR' ? 'HR' : 'EM'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-[var(--text-primary)]">
                  {role} View
                </div>
                <div className="truncate text-[11px] text-[var(--text-muted)]">
                  Switch persona
                </div>
              </div>
            </div>
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </button>

          <button
            type="button"
            onClick={resetDemoData}
            className="flex w-full items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Reset demo data
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)]')}>
      <aside className="hidden lg:block w-64 shrink-0 border-r border-[var(--border-hairline)] bg-[var(--bg-sidebar)]">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-hairline)]">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-raised)]"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 px-4 backdrop-blur-sm lg:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                  {company.companyName}
                </h1>
                <Badge tone="neutral" className="hidden sm:inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  November 2026
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {role !== 'Employee' && (
              <div className="relative hidden md:block w-56">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.5} />
                <input
                  type="search"
                  value={globalSearch}
                  onChange={(e) => {
                    onGlobalSearch(e.target.value);
                    if (e.target.value.trim() && activeTab !== 'employees') {
                      setActiveTab('employees');
                    }
                  }}
                  placeholder="Search"
                  aria-label="Search employees"
                  className="h-9 w-full rounded-full border border-transparent bg-[var(--bg-raised)] pl-9 pr-3.5 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus-visible:outline-none"
                />
              </div>
            )}

            <label className="sr-only" htmlFor="state-selector">
              Select State
            </label>
            <div className="relative">
              <select
                id="state-selector"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value as IndianState)}
                className="h-9 appearance-none rounded-full border border-[var(--border-hairline)] bg-[var(--bg-raised)] pl-3.5 pr-8 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
              >
                <option value="Karnataka">KA (Bengaluru)</option>
                <option value="Haryana">HR (Gurugram)</option>
                <option value="Maharashtra">MH (Pune)</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
                strokeWidth={1.5}
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('compliance')}
              aria-label="View compliance alerts"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)]"
            >
              <Bell className="h-4 w-4" strokeWidth={1.5} />
              {overdueCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-[var(--bg-raised)]" />
              )}
            </button>

            <div className="flex h-9 items-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-raised)] p-0.5">
              <button
                type="button"
                onClick={() => darkMode && toggleDarkMode()}
                aria-label="Light mode"
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
                  !darkMode
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                <Sun className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Light</span>
              </button>
              <button
                type="button"
                onClick={() => !darkMode && toggleDarkMode()}
                aria-label="Dark mode"
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
                  darkMode
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                <Moon className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Dark</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1480px] flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>

      <Modal
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Switch Demo Role"
        subtitle="Preview friendly HR from each persona in one click"
      >
        <div className="space-y-2.5">
          {(
            [
              {
                r: 'Owner',
                desc: 'Founder / CTO: focuses on engineering burn, attrition risk, and statutory compliance',
              },
              {
                r: 'HR',
                desc: 'People Ops Lead: full access to onboarding, CSV import, leave approvals, and filings',
              },
              {
                r: 'Employee',
                desc: 'Software Engineer: mobile-first self-service for payslips, leave, and attendance',
              },
            ] as const
          ).map((item) => (
            <button
              key={item.r}
              type="button"
              onClick={() => setRole(item.r)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-colors',
                role === item.r
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border-hairline)] hover:bg-[var(--bg-raised)]'
              )}
            >
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{item.r}</div>
                <div className="mt-0.5 text-xs text-[var(--text-secondary)]">{item.desc}</div>
              </div>
              {role === item.r && <Badge tone="accent">Active</Badge>}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setShowRoleModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
