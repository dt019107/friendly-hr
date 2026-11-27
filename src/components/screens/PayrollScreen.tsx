import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useHRStore } from '../../store/useHRStore';
import { formatINR } from '../../lib/format';
import { Badge, Button, Card, PageHeader } from '../ui/Primitives';

export const PayrollScreen: React.FC = () => {
  const { payroll, resolvePayrollAnomaly, selectedState } = useHRStore();

  const summary = useMemo(() => {
    const gross = payroll.reduce((s, p) => s + p.gross, 0);
    const pfTotal = payroll.reduce((s, p) => s + p.pfEmployee + p.pfEmployer, 0);
    const esiTotal = payroll.reduce((s, p) => s + p.esiEmployee + p.esiEmployer, 0);
    const tdsTotal = payroll.reduce((s, p) => s + p.tds, 0);
    const ptTotal = payroll.reduce((s, p) => s + p.pt, 0);
    const netTotal = payroll.reduce((s, p) => s + p.netPay, 0);
    const overtimeTotal = payroll.reduce((s, p) => s + p.overtimePay, 0);
    const anomalies = payroll.filter((p) => p.anomalyReason);
    return { gross, pfTotal, esiTotal, tdsTotal, ptTotal, netTotal, overtimeTotal, anomalies };
  }, [payroll]);

  const chartData = useMemo(() => {
    const depts = ['Engineering', 'Product', 'Design', 'QA & DevOps', 'Data & AI', 'People & Ops'];
    return depts.map((dept) => {
      const rows = payroll.filter((p) => p.department === dept);
      return {
        department: dept,
        netPay: Math.round(rows.reduce((s, r) => s + r.netPay, 0) / 100000),
        statutory: Math.round(
          rows.reduce((s, r) => s + r.pfEmployee + r.pfEmployer + r.esiEmployee + r.esiEmployer + r.tds, 0) /
            100000
        ),
      };
    });
  }, [payroll]);

  const unresolvedCount = summary.anomalies.filter((a) => !a.anomalyResolved).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Summary (November 2026)"
        subtitle={`Computed across ${payroll.length} active employees · ${selectedState} statutory rules applied`}
        actions={
          <Badge tone={unresolvedCount > 0 ? 'warning' : 'success'}>
            {unresolvedCount > 0 ? `${unresolvedCount} anomalies to verify` : 'Ready for bank payout'}
          </Badge>
        }
      />

      {/* Statutory Totals Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="text-xs font-medium text-[var(--text-muted)]">Total Gross Payroll</div>
          <div className="mt-2 font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
            {formatINR(summary.gross, true)}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">
            Includes {formatINR(summary.overtimeTotal)} overtime
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-medium text-[var(--text-muted)]">EPF (EE + ER)</div>
          <div className="mt-2 font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
            {formatINR(summary.pfTotal, true)}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">12% + 12% on ₹15k cap</div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-medium text-[var(--text-muted)]">ESIC (0.75% + 3.25%)</div>
          <div className="mt-2 font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
            {formatINR(summary.esiTotal, true)}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">Workers earning ≤ ₹21,000</div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-medium text-[var(--text-muted)]">TDS &amp; PT Withheld</div>
          <div className="mt-2 font-mono-num text-2xl font-semibold text-[var(--text-primary)]">
            {formatINR(summary.tdsTotal + summary.ptTotal)}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">
            PT: {formatINR(summary.ptTotal)} ({selectedState})
          </div>
        </Card>
      </div>

      {/* Cost Breakdown Chart + Anomaly List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Department Cost Breakdown (₹ Lakhs)
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Net take-home vs statutory deductions (PF, ESI, TDS)
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
                <XAxis
                  dataKey="department"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  unit="L"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="netPay" name="Net Pay (₹L)" stackId="a" fill="#4262ff" radius={[0, 0, 4, 4]} />
                <Bar dataKey="statutory" name="Statutory (₹L)" stackId="a" fill="#0fbcb0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Payroll Anomalies
            </h3>
            <span className="font-mono-num text-xs text-[var(--text-muted)]">
              {unresolvedCount} open
            </span>
          </div>

          <div className="space-y-3">
            {summary.anomalies.map((item) => (
              <div
                key={item.id}
                className={
                  item.anomalyResolved
                    ? 'rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-raised)]/50 p-3.5'
                    : 'rounded-2xl border border-[var(--border-hairline)] bg-[var(--brand-yellow-soft)] p-3.5'
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                      {item.anomalyResolved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                      {item.employeeName}
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.anomalyReason}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono-num text-xs text-[var(--text-muted)]">
                    Net: {formatINR(item.netPay)}
                  </span>
                  {item.anomalyResolved ? (
                    <Badge tone="success">Verified</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => resolvePayrollAnomaly(item.id)}
                    >
                      Verify &amp; clear
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
