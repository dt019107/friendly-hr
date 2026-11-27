import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  List,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useHRStore } from '../../store/useHRStore';
import { cn } from '../../lib/format';
import { Badge, Button, Card, PageHeader } from '../ui/Primitives';
import type { ComplianceArea, ComplianceRule, IndianState } from '../../types/hr';

const AREAS: ComplianceArea[] = ['PF', 'ESI', 'PT', 'LWF'];

const STATE_META: Record<IndianState, { city: string; note: string }> = {
  Karnataka: {
    city: 'Bengaluru · Outer Ring Road',
    note: 'Karnataka PT (₹200/mo) · EPFO Koramangala · KLWF Annual Return',
  },
  Haryana: {
    city: 'Gurugram · Cyber City',
    note: 'Haryana ₹0 PT · LWF 0.2% (cap ₹31) · US-Overlap S&E Exemption',
  },
  Maharashtra: {
    city: 'Pune · Hinjewadi Phase II',
    note: 'Maharashtra PT (₹200/mo) · EPFO Akurdi · PoSH IC Register',
  },
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonthDays(year: number, monthIndexZeroBased: number) {
  const firstDay = new Date(year, monthIndexZeroBased, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndexZeroBased + 1, 0).getDate();
  const cells: Array<{ day: number | null; dateStr: string | null; isWeekend: boolean }> = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: null, dateStr: null, isWeekend: i >= 5 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const col = (startOffset + d - 1) % 7;
    const dateStr = `${year}-${String(monthIndexZeroBased + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, isWeekend: col >= 5 });
  }
  while (cells.length % 7 !== 0) {
    const col = cells.length % 7;
    cells.push({ day: null, dateStr: null, isWeekend: col >= 5 });
  }
  return cells;
}

export const ComplianceScreen: React.FC = () => {
  const { complianceRules, selectedState, setSelectedState, markComplianceFiled } = useHRStore();
  const [viewMode, setViewMode] = useState<'register' | 'calendar'>('calendar');
  const [areaFilter, setAreaFilter] = useState<'All' | ComplianceArea>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState<10 | 11>(10);

  const stateRules = useMemo(
    () =>
      complianceRules
        .filter((r) => r.state === selectedState)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [complianceRules, selectedState]
  );

  const filteredRules = useMemo(
    () => (areaFilter === 'All' ? stateRules : stateRules.filter((r) => r.area === areaFilter)),
    [stateRules, areaFilter]
  );

  const riskScore = useMemo(() => {
    const raw = stateRules.reduce((score, rule) => {
      if (rule.status === 'Overdue') return score + rule.weight;
      if (rule.status === 'Pending') return score + Math.round(rule.weight * 0.45);
      return score;
    }, 0);
    return Math.min(100, raw);
  }, [stateRules]);

  const readinessPct = Math.max(0, 100 - riskScore);
  const gaugeData = [
    { name: 'Ready', value: readinessPct },
    { name: 'Risk', value: riskScore },
  ];

  const areaBreakdown = useMemo(() => {
    return AREAS.map((area) => {
      const rules = stateRules.filter((r) => r.area === area);
      const pts = rules.reduce(
        (s, r) =>
          s + (r.status === 'Overdue' ? r.weight : r.status === 'Pending' ? Math.round(r.weight * 0.45) : 0),
        0
      );
      const status: ComplianceRule['status'] = rules.some((r) => r.status === 'Overdue')
        ? 'Overdue'
        : rules.some((r) => r.status === 'Pending')
          ? 'Pending'
          : 'Filed';
      const dotColor =
        status === 'Overdue'
          ? 'bg-red-500'
          : status === 'Pending'
            ? 'bg-amber-500'
            : 'bg-emerald-500';
      return { area, pts, status, dotColor };
    });
  }, [stateRules]);

  const filedCount = stateRules.filter((r) => r.status === 'Filed').length;
  const overdueCount = stateRules.filter((r) => r.status === 'Overdue').length;
  const priorityRule =
    stateRules.find((r) => r.status === 'Overdue') ||
    stateRules.find((r) => r.status === 'Pending');
  const nextUpcomingRule = stateRules.find((r) => r.status === 'Pending');

  const calendarCells = useMemo(() => getMonthDays(2026, calMonth), [calMonth]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Calendar"
        subtitle={`${STATE_META[selectedState].city} · ${STATE_META[selectedState].note}`}
        actions={
          <div
            role="tablist"
            aria-label="Select state rules"
            className="inline-flex rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1 card-elevated"
          >
            {(['Karnataka', 'Haryana', 'Maharashtra'] as IndianState[]).map((st) => (
              <button
                key={st}
                role="tab"
                aria-selected={selectedState === st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                  selectedState === st
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {st}
              </button>
            ))}
          </div>
        }
      />

      {/* Top Row: Readiness Gauge (4 cols) + Priority Exposure & Metrics (8 cols) — Zero Duplication */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: CreatiHR Semi-Circular Gauge + Interactive Area Filter Legend */}
        <Card className="flex flex-col justify-between p-5 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {selectedState} Readiness
            </h3>
            <Badge tone={overdueCount > 0 ? 'danger' : 'success'}>
              {overdueCount > 0 ? `${overdueCount} overdue` : 'Compliant'}
            </Badge>
          </div>

          <div className="relative mx-auto my-2 h-36 w-full max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="82%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={64}
                  outerRadius={82}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={readinessPct >= 80 ? '#00b473' : readinessPct >= 60 ? '#ffd02f' : '#4262ff'} />
                  <Cell fill="var(--bg-raised)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center">
              <span className="font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
                {readinessPct}%
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Risk {riskScore}/100
              </span>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-[var(--border-hairline)] pt-3 text-xs">
            {areaBreakdown.map((item) => (
              <button
                key={item.area}
                type="button"
                onClick={() => setAreaFilter((prev) => (prev === item.area ? 'All' : item.area))}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition-colors',
                  areaFilter === item.area
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'hover:bg-[var(--bg-raised)]'
                )}
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className={cn('h-2 w-2 rounded-full', item.dotColor)} />
                  {item.area}
                </span>
                <span className="font-mono-num text-[var(--text-secondary)]">
                  {item.status} · {item.pts} pts
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Right: Miro Featured / Pastel Priority Action Card (8 cols) */}
        <Card
          className={cn(
            'flex flex-col justify-between p-6 lg:col-span-8',
            priorityRule?.status === 'Overdue'
              ? 'border-2 border-[#ff9999] bg-[var(--brand-coral-soft)]/35'
              : priorityRule
                ? 'border-2 border-[var(--accent)] bg-[var(--accent-soft)]'
                : ''
          )}
        >
          {priorityRule ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={priorityRule.status === 'Overdue' ? 'danger' : 'warning'}>
                    {priorityRule.status === 'Overdue' ? (
                      <ShieldAlert className="h-3.5 w-3.5" strokeWidth={1.5} />
                    ) : (
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                    {priorityRule.status === 'Overdue' ? 'Immediate Action Required' : 'Next Upcoming Filing'}
                  </Badge>
                  <span className="font-mono-num text-xs text-[var(--text-muted)]">
                    {priorityRule.area} · Due {priorityRule.dueDate}
                  </span>
                </div>
                <span className="font-mono-num text-xs font-medium text-[var(--text-muted)]">
                  Weight: {priorityRule.weight} risk pts
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                {priorityRule.title}
              </h3>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                {priorityRule.thresholdNote}
              </p>

              <div className="mt-4 rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-3 text-xs text-red-700 dark:text-red-400">
                <strong className="font-semibold">Statutory Penalty Exposure:</strong>{' '}
                {priorityRule.penaltyNote}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button variant="primary" size="md" onClick={() => markComplianceFiled(priorityRule.id)}>
                  Mark {priorityRule.area} as filed
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setViewMode(viewMode === 'calendar' ? 'register' : 'calendar')}
                >
                  {viewMode === 'calendar' ? 'Switch to register' : 'View on calendar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start justify-center py-4">
              <Badge tone="success">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                All {selectedState} filings complete
              </Badge>
              <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                Zero statutory risk exposure for {selectedState}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                All PF, ESI, PT, and LWF filings for this cycle have been marked filed.
              </p>
            </div>
          )}

          {/* Clean 3-Stat Footer Strip */}
          <div className="mt-6 grid grid-cols-3 divide-x divide-[var(--border-hairline)] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-raised)]/40 py-3">
            <div className="px-4">
              <div className="text-xs text-[var(--text-muted)]">Completed</div>
              <div className="mt-0.5 font-mono-num text-base font-semibold text-[var(--text-primary)]">
                {filedCount} / {stateRules.length}
              </div>
            </div>
            <div className="px-4">
              <div className="text-xs text-[var(--text-muted)]">Overdue</div>
              <div className="mt-0.5 font-mono-num text-base font-semibold text-red-600 dark:text-red-400">
                {overdueCount}
              </div>
            </div>
            <div className="px-4">
              <div className="text-xs text-[var(--text-muted)]">Next Deadline</div>
              <div className="mt-0.5 font-mono-num text-base font-semibold text-[var(--text-primary)]">
                {nextUpcomingRule ? nextUpcomingRule.dueDate.slice(5) : 'None'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Workspace: Calendar or Register with Area Filter Bar */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--border-hairline)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-semibold text-[var(--text-primary)]">
              {viewMode === 'calendar'
                ? calMonth === 10
                  ? 'November 2026'
                  : 'December 2026'
                : `${selectedState} Filing Register`}
            </span>
            {(['All', ...AREAS] as const).map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setAreaFilter(area)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  areaFilter === area
                    ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]'
                )}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'calendar' && (
              <div className="flex items-center gap-1 mr-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={calMonth === 10}
                  onClick={() => setCalMonth(10)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Nov
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={calMonth === 11}
                  onClick={() => setCalMonth(11)}
                >
                  Dec
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
              </div>
            )}

            <div className="inline-flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  viewMode === 'calendar'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setViewMode('register')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  viewMode === 'register'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                <List className="h-3.5 w-3.5" strokeWidth={1.5} />
                Register
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="overflow-x-auto p-5">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-7 border-b border-[var(--border-hairline)] pb-2.5 text-xs font-medium text-[var(--text-muted)]">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="px-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border-hairline)] border-x border-b border-[var(--border-hairline)] rounded-b-xl overflow-hidden">
                {calendarCells.map((cell, idx) => {
                  const dayRules = cell.dateStr
                    ? filteredRules.filter((r) => r.dueDate === cell.dateStr)
                    : [];
                  const isToday = cell.dateStr === '2026-11-27';

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'min-h-24 p-2.5 transition-colors',
                        !cell.day
                          ? 'bg-[var(--bg-raised)]/40'
                          : cell.isWeekend
                            ? 'bg-[var(--bg-raised)]/20'
                            : 'bg-[var(--bg-surface)]'
                      )}
                    >
                      {cell.day && (
                        <>
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded-full font-mono-num text-xs',
                                isToday
                                  ? 'bg-[var(--accent)] font-medium text-white'
                                  : 'text-[var(--text-secondary)]'
                              )}
                            >
                              {cell.day}
                            </span>
                            {isToday && (
                              <span className="text-[11px] font-medium text-[var(--accent)]">
                                Today
                              </span>
                            )}
                          </div>

                          <div className="mt-2 space-y-1">
                            {dayRules.map((rule) => (
                              <button
                                key={rule.id}
                                type="button"
                                disabled={rule.status === 'Filed'}
                                onClick={() => markComplianceFiled(rule.id)}
                                title={`${rule.title} (click to mark filed)`}
                                className={cn(
                                  'w-full rounded-lg border px-2 py-1 text-left text-xs font-medium transition-colors',
                                  rule.status === 'Overdue'
                                    ? 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20'
                                    : rule.status === 'Pending'
                                      ? 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20'
                                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 cursor-default'
                                )}
                              >
                                <div className="truncate font-mono-num">
                                  {rule.area} · {rule.status}
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border-hairline)] bg-[var(--bg-raised)]/50 text-xs font-medium text-[var(--text-muted)]">
                <tr>
                  <th className="px-5 py-3">Filing</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredRules.map((rule) => {
                  const isExpanded = expandedId === rule.id;
                  return (
                    <React.Fragment key={rule.id}>
                      <tr className="transition-colors hover:bg-[var(--bg-raised)]/40">
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                            className="flex items-center gap-1.5 text-left font-medium text-[var(--text-primary)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                          >
                            <span>{rule.title}</span>
                            <ChevronDown
                              className={cn(
                                'h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                              strokeWidth={1.5}
                            />
                          </button>
                          <div className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">
                            {rule.thresholdNote}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono-num text-xs font-medium text-[var(--text-secondary)]">
                          {rule.area}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono-num text-xs text-[var(--text-primary)]">
                          {rule.dueDate}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge
                            tone={
                              rule.status === 'Overdue'
                                ? 'danger'
                                : rule.status === 'Pending'
                                  ? 'warning'
                                  : 'success'
                            }
                          >
                            {rule.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {rule.status === 'Filed' ? (
                            <span className="inline-flex items-center gap-1 font-mono-num text-xs text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                              {rule.filedAt}
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant={rule.status === 'Overdue' ? 'primary' : 'secondary'}
                              onClick={() => markComplianceFiled(rule.id)}
                            >
                              Mark as filed
                            </Button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[var(--bg-raised)]/35">
                          <td colSpan={5} className="px-5 py-3 text-xs">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-[var(--text-secondary)]">
                                <strong className="font-medium text-[var(--text-primary)]">Rule:</strong>{' '}
                                {rule.thresholdNote}
                              </span>
                              <span className="text-red-600 dark:text-red-400">
                                <strong className="font-medium">Penalty:</strong> {rule.penaltyNote}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
