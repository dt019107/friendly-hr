import type {
  AttendanceRecord,
  ComplianceRule,
  Contract,
  Employee,
  IndianState,
  LeaveRequest,
  PayrollEntry,
} from '../types/hr';

export interface InsightCardData {
  id: string;
  metricLabel: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'warning';
  comparison: string;
  headline: string;
  drivers: string[];
  actionLabel: string;
  actionType: 'stay-interviews' | 'review-attendance' | 'resolve-contracts' | 'file-compliance';
}

export function computeDashboardMetrics(params: {
  employees: Employee[];
  contracts: Contract[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payroll: PayrollEntry[];
  complianceRules: ComplianceRule[];
  selectedState: IndianState;
}) {
  const { employees, contracts, attendance, leaves, payroll, complianceRules, selectedState } = params;

  const activeEmployees = employees.filter((e) => e.status !== 'Exited');
  const totalHeadcount = activeEmployees.length;
  const contractWorkers = activeEmployees.filter((e) => e.employmentType === 'Contractor').length;
  const permanentWorkers = totalHeadcount - contractWorkers;

  const exitedCount = employees.filter((e) => e.status === 'Exited').length;
  const noticeCount = employees.filter((e) => e.status === 'Notice').length;
  const attritionRate = employees.length > 0 ? ((exitedCount / employees.length) * 100).toFixed(1) : '0.0';

  const usOverlapContractors = employees.filter(
    (e) => e.shift === 'US Overlap' && e.employmentType === 'Contractor' && e.tenureMonths < 6
  );
  const usOverlapExited = usOverlapContractors.filter(
    (e) => e.status === 'Exited' || e.status === 'Notice'
  ).length;
  const usOverlapRate =
    usOverlapContractors.length > 0
      ? Math.round((usOverlapExited / usOverlapContractors.length) * 100)
      : 0;

  const latestDayRecords = attendance.filter((a) => a.date === '2026-11-27');
  const presentToday = latestDayRecords.filter((a) => a.status === 'P' || a.status === 'HD').length;
  const attendanceRate =
    latestDayRecords.length > 0 ? Math.round((presentToday / latestDayRecords.length) * 100) : 0;

  const calcShiftRate = (shiftName: 'Hybrid' | 'Remote' | 'US Overlap') => {
    const recs = latestDayRecords.filter((a) => a.shift === shiftName);
    if (recs.length === 0) return 0;
    const ok = recs.filter((a) => a.status === 'P' || a.status === 'HD').length;
    return Math.round((ok / recs.length) * 100);
  };

  const workModeRates = {
    hybrid: calcShiftRate('Hybrid'),
    remote: calcShiftRate('Remote'),
    usOverlap: calcShiftRate('US Overlap'),
  };

  const totalMonthlyPayroll = payroll.reduce((sum, p) => sum + p.gross, 0);
  const totalPF = payroll.reduce((sum, p) => sum + p.pfEmployee + p.pfEmployer, 0);
  const totalESI = payroll.reduce((sum, p) => sum + p.esiEmployee + p.esiEmployer, 0);
  const totalTDS = payroll.reduce((sum, p) => sum + p.tds, 0);
  const totalOvertime = payroll.reduce((sum, p) => sum + p.overtimePay, 0);
  const unresolvedAnomalies = payroll.filter((p) => p.anomalyReason && !p.anomalyResolved);

  const expiringContracts = contracts.filter((c) => c.status === 'Expiring');
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  const stateRules = complianceRules.filter((r) => r.state === selectedState);
  const riskScore = stateRules.reduce((score, rule) => {
    if (rule.status === 'Overdue') return score + rule.weight;
    if (rule.status === 'Pending') return score + Math.round(rule.weight * 0.45);
    return score;
  }, 0);

  const clampedRisk = Math.min(100, riskScore);
  const overdueRules = stateRules.filter((r) => r.status === 'Overdue');
  const upcomingRules = stateRules.filter((r) => r.status === 'Pending');

  const insights: InsightCardData[] = [
    {
      id: 'attrition-insight',
      metricLabel: 'Monthly Attrition',
      value: `${attritionRate}%`,
      delta: '+2.1 pts',
      deltaType: 'negative',
      comparison: 'vs last month (3.8%)',
      headline: `US Overlap contractors under 6 months tenure account for ${usOverlapExited} of ${exitedCount + noticeCount} exits and notices (${usOverlapRate}% cohort churn).`,
      drivers: [
        `US Overlap (< 6 mo SOW): ${usOverlapRate}% churn vs 2.9% Hybrid`,
        `${noticeCount} engineers currently serving notice in Engineering & QA`,
        'Top exit reason: late-night US standup fatigue & SOW renewal uncertainty',
      ],
      actionLabel: 'Schedule 1:1 stay interviews',
      actionType: 'stay-interviews',
    },
    {
      id: 'attendance-insight',
      metricLabel: 'Today Availability',
      value: `${attendanceRate}%`,
      delta: `${presentToday}/${latestDayRecords.length}`,
      deltaType: attendanceRate >= 88 ? 'positive' : 'warning',
      comparison: 'active across squads today',
      headline: `${pendingLeaves.length} leave requests are awaiting approval, including ${pendingLeaves.filter((l) => l.channel === 'WhatsApp').length} sent via WhatsApp.`,
      drivers: [
        `Hybrid: ${workModeRates.hybrid}% · Remote: ${workModeRates.remote}% · US Overlap: ${workModeRates.usOverlap}% (Nov 27)`,
        `${unresolvedAnomalies.length} payroll anomalies flagged for UAN, Form 12BB & on-call`,
        `${pendingLeaves.length} pending approvals ahead of Sprint 14 freeze`,
      ],
      actionLabel: 'Review pending leaves',
      actionType: 'review-attendance',
    },
    {
      id: 'contracts-insight',
      metricLabel: 'Expiring SOWs',
      value: `${expiringContracts.length}`,
      delta: expiringContracts.length > 0 ? 'Next 30 days' : 'All clear',
      deltaType: expiringContracts.length > 5 ? 'warning' : 'positive',
      comparison: `${contractWorkers} total contractors`,
      headline:
        expiringContracts.length > 0
          ? `${expiringContracts.length} SOW contractor agreements expire within 30 days across Engineering and QA & DevOps.`
          : 'All vendor SOW agreements for the current 30-day window are renewed.',
      drivers: [
        `${expiringContracts.filter((c) => c.daysRemaining <= 7).length} SOWs expire in ≤ 7 days`,
        'Unrenewed SOWs risk IP assignment & billing continuity gaps',
      ],
      actionLabel: 'Resolve SOWs',
      actionType: 'resolve-contracts',
    },
    {
      id: 'compliance-insight',
      metricLabel: `${selectedState} Compliance Risk`,
      value: `${clampedRisk}/100`,
      delta: overdueRules.length > 0 ? `${overdueRules.length} overdue` : 'On track',
      deltaType: clampedRisk >= 40 ? 'negative' : clampedRisk >= 20 ? 'warning' : 'positive',
      comparison: `${stateRules.filter((r) => r.status === 'Filed').length}/${stateRules.length} filings done`,
      headline:
        overdueRules.length > 0
          ? `${overdueRules[0].title} is overdue (${overdueRules[0].dueDate}), adding ${overdueRules[0].weight} risk points.`
          : `No overdue filings in ${selectedState}. ${upcomingRules.length} upcoming deadlines tracked.`,
      drivers: [
        ...overdueRules.map((r) => `Overdue (${r.area}): ${r.penaltyNote}`),
        ...upcomingRules.slice(0, 2).map((r) => `Due ${r.dueDate}: ${r.title}`),
      ],
      actionLabel: 'Open compliance calendar',
      actionType: 'file-compliance',
    },
  ];

  const deptBreakdown = (
    ['Engineering', 'Product', 'Design', 'QA & DevOps', 'Data & AI', 'People & Ops'] as const
  ).map((dept) => {
    const deptEmps = activeEmployees.filter((e) => e.department === dept);
    const deptPayroll = payroll
      .filter((p) => p.department === dept)
      .reduce((s, p) => s + p.gross, 0);
    return {
      department: dept,
      headcount: deptEmps.length,
      permanent: deptEmps.filter((e) => e.employmentType === 'Full-Time').length,
      contract: deptEmps.filter((e) => e.employmentType === 'Contractor').length,
      payrollLakhs: Number((deptPayroll / 100000).toFixed(2)),
    };
  });

  return {
    totalHeadcount,
    contractWorkers,
    permanentWorkers,
    attritionRate,
    attendanceRate,
    presentToday,
    workModeRates,
    totalMonthlyPayroll,
    totalPF,
    totalESI,
    totalTDS,
    totalOvertime,
    unresolvedAnomalies,
    expiringContracts,
    pendingLeaves,
    clampedRisk,
    overdueRules,
    upcomingRules,
    stateRules,
    insights,
    deptBreakdown,
  };
}
