import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  FileCheck2,
  MoreVertical,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useHRStore } from '../../store/useHRStore';
import { computeDashboardMetrics, type InsightCardData } from '../../lib/insights';
import { formatINR, getInitials, cn } from '../../lib/format';
import { Badge, Button, Card, Modal, PageHeader } from '../ui/Primitives';
import { AnimatedNumber, EASE_OUT_EXPO } from '../ui/MotionPrimitives';

const DONUT_COLORS = ['#4262ff', '#0fbcb0', '#ffd02f', '#ff9999'];

export const HomeScreen: React.FC = () => {
  const {
    employees,
    contracts,
    attendance,
    leaves,
    payroll,
    complianceRules,
    selectedState,
    setActiveTab,
    resolveContract,
    resolveAllUrgentContracts,
    scheduleStayInterviews,
    stayInterviewsScheduled,
    markComplianceFiled,
    updateLeaveStatus,
  } = useHRStore();

  const [selectedInsight, setSelectedInsight] = useState<InsightCardData | null>(null);
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);

  const metrics = useMemo(
    () =>
      computeDashboardMetrics({
        employees,
        contracts,
        attendance,
        leaves,
        payroll,
        complianceRules,
        selectedState,
      }),
    [employees, contracts, attendance, leaves, payroll, complianceRules, selectedState]
  );

  const nextComplianceTarget = metrics.overdueRules[0] || metrics.upcomingRules[0];
  const nextLeave = metrics.pendingLeaves[0];

  const payrollDonutData = useMemo(() => {
    const net = payroll.reduce((s, p) => s + p.netPay, 0);
    const pf = metrics.totalPF;
    const esi = metrics.totalESI;
    const tds = metrics.totalTDS;
    const total = Math.max(1, net + pf + esi + tds);
    return [
      { name: 'Net Wages', value: Math.round((net / total) * 100), amount: net },
      { name: 'EPF (EE+ER)', value: Math.round((pf / total) * 100), amount: pf },
      { name: 'ESIC', value: Math.round((esi / total) * 100), amount: esi },
      { name: 'TDS', value: Math.max(1, Math.round((tds / total) * 100)), amount: tds },
    ];
  }, [payroll, metrics]);

  const complianceHealthPct = Math.max(0, 100 - metrics.clampedRisk);
  const gaugeData = [
    { name: 'Compliant', value: complianceHealthPct },
    { name: 'Risk', value: metrics.clampedRisk },
  ];

  const kpiCards = [
    {
      id: 'attrition-insight',
      title: 'Monthly Attrition',
      numericValue: Number(metrics.attritionRate),
      formatter: (v: number) => `${v.toFixed(1)}%`,
      trend: '+2.1 pts',
      trendUp: false,
      footer: 'US Overlap contractor churn',
      insight: metrics.insights[0],
    },
    {
      id: 'attendance-insight',
      title: 'Team Availability',
      numericValue: metrics.attendanceRate,
      formatter: (v: number) => `${Math.round(v)}%`,
      trend: `${metrics.presentToday}/${metrics.totalHeadcount}`,
      trendUp: true,
      footer: 'Active across squads (Nov 27)',
      insight: metrics.insights[1],
    },
    {
      id: 'payroll-insight',
      title: 'Salary Overview',
      numericValue: metrics.totalMonthlyPayroll,
      formatter: (v: number) => formatINR(v, true),
      trend: `${metrics.unresolvedAnomalies.length} anomalies`,
      trendUp: metrics.unresolvedAnomalies.length === 0,
      footer: `${metrics.totalHeadcount} active employees`,
      insight: metrics.insights[2],
    },
    {
      id: 'compliance-insight',
      title: `${selectedState} Risk Score`,
      numericValue: metrics.clampedRisk,
      formatter: (v: number) => `${Math.round(v)}/100`,
      trend: metrics.overdueRules.length > 0 ? `${metrics.overdueRules.length} overdue` : 'On track',
      trendUp: metrics.overdueRules.length === 0,
      footer: `${metrics.stateRules.filter((r) => r.status === 'Filed').length} of ${metrics.stateRules.length} filings done`,
      insight: metrics.insights[3],
    },
  ];

  const handleInsightAction = (actionType: InsightCardData['actionType']) => {
    setSelectedInsight(null);
    if (actionType === 'stay-interviews') {
      scheduleStayInterviews();
    } else if (actionType === 'review-attendance') {
      setActiveTab('attendance');
    } else if (actionType === 'resolve-contracts') {
      setShowContractsModal(true);
    } else if (actionType === 'file-compliance') {
      setActiveTab('compliance');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Overview"
        subtitle={`${selectedState} hub · ${metrics.totalHeadcount} active employees across Hybrid, Remote & US Overlap`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('onboarding')}>
              Setup wizard
            </Button>
            <Button variant="primary" size="sm" onClick={() => setActiveTab('employees')}>
              Import CSV
            </Button>
          </>
        }
      />

      {/* Tier 1: Sourced KPI Strip */}
      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.045, ease: EASE_OUT_EXPO }}
          >
            <Card className="relative h-full p-5">
              <div className="text-xs font-medium text-[var(--text-muted)]">
                {card.title}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-mono-num text-2xl font-medium tracking-tight text-[var(--text-primary)]">
                  <AnimatedNumber value={card.numericValue} formatter={card.formatter} />
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono-num text-xs font-medium',
                    card.trendUp
                      ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                      : 'bg-red-500/12 text-red-700 dark:text-red-400'
                  )}
                >
                  {card.trendUp ? (
                    <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
                  ) : (
                    <TrendingDown className="h-3 w-3" strokeWidth={1.5} />
                  )}
                  {card.trend}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[var(--border-hairline)] pt-2.5">
                <span className="text-xs text-[var(--text-muted)] truncate">
                  {card.footer}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedInsight(card.insight)}
                  className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  Explain <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Row 2: 3-Column Asymmetric Analytics */}
      <section className="grid gap-5 lg:grid-cols-12">
        {/* Donut Card with Shared-Element layoutId Legend Hover */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.16, ease: EASE_OUT_EXPO }}
          className="lg:col-span-4"
        >
          <Card className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Payroll Split</h3>
              <span className="rounded-full border border-[var(--border-hairline)] px-2.5 py-0.5 text-xs text-[var(--text-muted)]">
                Nov 2026
              </span>
            </div>

            <div className="relative my-2 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payrollDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {payrollDonutData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        opacity={hoveredLegend && hoveredLegend !== entry.name ? 0.45 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
                  <AnimatedNumber
                    value={payrollDonutData[0]?.value || 0}
                    formatter={(v) => `${Math.round(v)}%`}
                  />
                </span>
                <span className="text-xs text-[var(--text-muted)]">Net Payout</span>
              </div>
            </div>

            <div
              className="grid grid-cols-2 gap-1.5 text-xs"
              onMouseLeave={() => setHoveredLegend(null)}
            >
              {payrollDonutData.map((item, idx) => (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredLegend(item.name)}
                  className="relative flex cursor-default items-center justify-between rounded-lg px-2.5 py-1.5"
                >
                  {hoveredLegend === item.name && (
                    <motion.span
                      layoutId="payroll-legend-pill"
                      transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                      className="absolute inset-0 rounded-lg bg-[var(--bg-raised)]"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: DONUT_COLORS[idx] }}
                    />
                    {item.name}
                  </span>
                  <span className="relative z-10 font-mono-num font-medium text-[var(--text-primary)]">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Compliance Target Gauge Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.2, ease: EASE_OUT_EXPO }}
          className="lg:col-span-3"
        >
          <Card className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Compliance Target</h3>
              <button
                type="button"
                onClick={() => setActiveTab('compliance')}
                aria-label="Open compliance calendar"
                className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--bg-raised)]"
              >
                <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
              </button>
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
                    <Cell fill="#00b473" />
                    <Cell fill="var(--bg-raised)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center">
                <span className="font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
                  <AnimatedNumber
                    value={complianceHealthPct}
                    formatter={(v) => `${Math.round(v)}%`}
                  />
                </span>
                <span className="text-xs text-[var(--text-muted)]">{selectedState} readiness</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-[var(--border-hairline)] pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="h-2 w-2 rounded-full bg-[#00b473]" /> Hybrid (Nov 27)
                </span>
                <span className="font-mono-num font-medium">{metrics.workModeRates.hybrid}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="h-2 w-2 rounded-full bg-[#4262ff]" /> Remote (Nov 27)
                </span>
                <span className="font-mono-num font-medium">{metrics.workModeRates.remote}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="h-2 w-2 rounded-full bg-[#ffd02f]" /> US Overlap (Nov 27)
                </span>
                <span className="font-mono-num font-medium">{metrics.workModeRates.usOverlap}%</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contractor SOW Watchlist with AnimatePresence + layout collapse */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.24, ease: EASE_OUT_EXPO }}
          className="lg:col-span-5"
        >
          <Card className="flex h-full flex-col justify-between p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Contractor SOW Watchlist
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Expiring SOWs &amp; engineering squad retention
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowContractsModal(true)}>
                View all ({metrics.expiringContracts.length})
              </Button>
            </div>

            <div className="divide-y divide-[var(--border-hairline)] overflow-hidden">
              {metrics.expiringContracts.length === 0 ? (
                <div className="py-10 text-center">
                  <FileCheck2 className="mx-auto h-6 w-6 text-[#00b473]" strokeWidth={1.5} />
                  <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                    All contractor SOWs resolved
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {metrics.expiringContracts.slice(0, 4).map((ctr) => (
                    <motion.div
                      key={ctr.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                          {getInitials(ctr.employeeName)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {ctr.employeeName}
                          </div>
                          <div className="truncate text-xs text-[var(--text-muted)]">
                            {ctr.contractorName}
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:block text-xs text-[var(--text-secondary)]">
                        {ctr.department}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge tone={ctr.daysRemaining <= 7 ? 'danger' : 'warning'}>
                          {ctr.daysRemaining}d left
                        </Badge>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => resolveContract(ctr.id, 'Renewed')}
                        >
                          Renew
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Row 3: Miro Pastel Feature Action Cards (Yellow, Teal, Rose) with Stagger */}
      <section aria-label="Today's priority actions" className="grid gap-5 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.28, ease: EASE_OUT_EXPO }}
        >
          <Card tone="yellow" className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between">
                <Badge tone={metrics.expiringContracts.length > 0 ? 'warning' : 'success'}>
                  <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {metrics.expiringContracts.length} expiring SOWs
                </Badge>
                <span className="font-mono-num text-xs text-[var(--text-muted)]">SOW / 30d</span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                {metrics.expiringContracts.length > 0
                  ? `${metrics.expiringContracts.filter((c) => c.daysRemaining <= 10).length} tech contractors expire within 10 days.`
                  : 'All contractor SOW agreements are renewed beyond 30 days.'}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {metrics.expiringContracts.length > 0 ? (
                <>
                  <Button variant="primary" size="sm" onClick={() => setShowContractsModal(true)}>
                    Review &amp; resolve
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resolveAllUrgentContracts}>
                    Renew urgent
                  </Button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00b473]">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> Completed
                </span>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.32, ease: EASE_OUT_EXPO }}
        >
          <Card tone="teal" className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between">
                <Badge tone={metrics.pendingLeaves.length > 0 ? 'accent' : 'success'}>
                  {metrics.pendingLeaves.length} pending leaves
                </Badge>
                <span className="font-mono-num text-xs text-[var(--text-muted)]">
                  {metrics.pendingLeaves.filter((l) => l.channel === 'WhatsApp').length} WhatsApp
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                {nextLeave
                  ? `${nextLeave.employeeName} (${nextLeave.department}): ${nextLeave.days}d ${nextLeave.type}, "${nextLeave.reason}"`
                  : 'All leave requests have been processed.'}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {nextLeave ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => updateLeaveStatus(nextLeave.id, 'Approved', nextLeave.channel)}
                  >
                    Approve next
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('attendance')}>
                    Open queue
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('attendance')}>
                  View attendance
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.36, ease: EASE_OUT_EXPO }}
        >
          <Card tone="rose" className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between">
                <Badge
                  tone={
                    nextComplianceTarget?.status === 'Overdue'
                      ? 'danger'
                      : nextComplianceTarget
                        ? 'warning'
                        : 'success'
                  }
                >
                  {nextComplianceTarget?.status || 'Compliant'}
                </Badge>
                <span className="font-mono-num text-xs text-[var(--text-muted)]">
                  {selectedState} · {nextComplianceTarget?.area || 'All'}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                {nextComplianceTarget
                  ? `${nextComplianceTarget.title}: ${nextComplianceTarget.penaltyNote}`
                  : `All ${selectedState} statutory filings are up to date.`}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {nextComplianceTarget ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => markComplianceFiled(nextComplianceTarget.id)}
                  >
                    Mark as filed
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('compliance')}>
                    Calendar
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('compliance')}>
                  Compliance ledger
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Rule-Based Driver Explanation Modal */}
      <Modal
        open={Boolean(selectedInsight)}
        onClose={() => setSelectedInsight(null)}
        title={selectedInsight ? `${selectedInsight.metricLabel}: Driver Breakdown` : ''}
        subtitle="Computed directly from engineering roster, squad attendance, and statutory rules"
      >
        {selectedInsight && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-raised)] p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-mono-num text-3xl font-semibold text-[var(--text-primary)]">
                  {selectedInsight.value}
                </span>
                <Badge
                  tone={
                    selectedInsight.deltaType === 'positive'
                      ? 'success'
                      : selectedInsight.deltaType === 'warning'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {selectedInsight.delta}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--text-primary)]">{selectedInsight.headline}</p>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-medium text-[var(--text-muted)]">
                Likely drivers in seed data
              </h4>
              <ul className="space-y-2">
                {selectedInsight.drivers.map((driver, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-[var(--border-hairline)] px-3 py-2 text-xs text-[var(--text-secondary)]"
                  >
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" strokeWidth={1.5} />
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {stayInterviewsScheduled && selectedInsight.id === 'attrition-insight' && (
                <Badge tone="success">Stay interviews scheduled</Badge>
              )}
              <Button variant="ghost" size="sm" onClick={() => setSelectedInsight(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleInsightAction(selectedInsight.actionType)}
              >
                {selectedInsight.actionLabel}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Expiring Contracts Resolution Modal */}
      <Modal
        open={showContractsModal}
        onClose={() => setShowContractsModal(false)}
        title="Expiring Contractor SOWs (Next 30 Days)"
        subtitle="Renew or close SOW agreements to maintain sprint velocity and IP compliance"
        maxWidth="max-w-2xl"
      >
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {metrics.expiringContracts.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">
              All expiring contracts have been resolved.
            </p>
          ) : (
            metrics.expiringContracts.map((ctr) => (
              <div
                key={ctr.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border-hairline)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {ctr.employeeName}{' '}
                    <span className="font-mono-num text-xs text-[#746019] dark:text-[#ffd02f]">
                      ({ctr.daysRemaining}d left · ends {ctr.endDate})
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {ctr.contractorName} · {ctr.department} · {ctr.shift}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => resolveContract(ctr.id, 'Renewed')}
                  >
                    Renew 6 mo
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => resolveContract(ctr.id, 'Terminated')}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--border-hairline)] pt-3">
          <Button variant="secondary" size="sm" onClick={resolveAllUrgentContracts}>
            Renew all ≤ 10 days
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowContractsModal(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};
