import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, FileText, ShieldCheck, Send } from 'lucide-react';
import { useHRStore } from '../../store/useHRStore';
import { formatINR } from '../../lib/format';
import { Badge, Button, Card } from '../ui/Primitives';
import type { LeaveType } from '../../types/hr';

export const MobileEmployeeScreen: React.FC = () => {
  const {
    employees,
    currentEmployeeId,
    setCurrentEmployeeId,
    payroll,
    attendance,
    leaves,
    submitLeaveRequest,
  } = useHRStore();

  const activeEmps = useMemo(() => employees.filter((e) => e.status !== 'Exited').slice(0, 12), [employees]);
  const emp = employees.find((e) => e.id === currentEmployeeId) || activeEmps[0];
  const pay = payroll.find((p) => p.employeeId === emp?.id);
  const myAttendance = useMemo(
    () => attendance.filter((a) => a.employeeId === emp?.id),
    [attendance, emp?.id]
  );
  const myLeaves = useMemo(
    () => leaves.filter((l) => l.employeeId === emp?.id),
    [leaves, emp?.id]
  );

  const presentDays = myAttendance.filter((a) => a.status === 'P' || a.status === 'HD').length;

  const [leaveType, setLeaveType] = useState<LeaveType>('CL');
  const [startDate, setStartDate] = useState('2026-11-28');
  const [endDate, setEndDate] = useState('2026-11-28');
  const [reason, setReason] = useState('Personal family work');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emp || !reason.trim()) return;
    const d1 = new Date(startDate);
    const validEnd = endDate < startDate ? startDate : endDate;
    const d2 = new Date(validEnd);
    const days = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1);
    submitLeaveRequest({
      employeeId: emp.id,
      type: leaveType,
      startDate,
      endDate: validEnd,
      days,
      reason: reason.trim(),
      channel: 'Portal',
    });
    setReason('');
  };

  if (!emp) return null;

  return (
    <div className="mx-auto max-w-md space-y-4 pb-8">
      {/* Worker Switcher for Demo */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 py-2.5">
        <span className="text-xs font-medium text-[var(--text-muted)]">Logged in as</span>
        <select
          aria-label="Select employee persona"
          value={emp.id}
          onChange={(e) => setCurrentEmployeeId(e.target.value)}
          className="h-8 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2 text-xs font-medium text-[var(--text-primary)]"
        >
          {activeEmps.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.shift})
            </option>
          ))}
        </select>
      </div>

      {/* Compliance-Aware Notice (Miro card-feature-teal) */}
      <Card tone="teal" className="p-5">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#187574] dark:text-[#0fbcb0]" strokeWidth={1.5} />
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              {emp.uan ? 'EPFO & ESIC Active' : 'Action: Link EPFO UAN'}
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {emp.uan
                ? `UAN ${emp.uan} verified. ${emp.shift === 'US Overlap' ? 'US Overlap late-evening cab & ₹4,500/mo shift allowance active.' : `${emp.shift} work mode synced.`}`
                : 'Your UAN is missing. Submit Aadhaar & PAN KYC to People Ops before 2 Dec.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Payslip Card (Miro cta-banner-dark / pricing-card-enterprise aesthetic) */}
      <div className="rounded-[28px] bg-[#1c1c1e] p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a5a8b5]">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            November 2026 Payslip
          </span>
          <Badge tone="yellow">Processed</Badge>
        </div>
        <div className="mt-2 font-mono-num text-3xl font-medium text-white">
          {formatINR(pay?.netPay || emp.basicSalary + emp.hra)}
        </div>
        <div className="mt-1 text-xs text-[#a5a8b5]">Net take-home pay</div>

        {pay && (
          <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-xs">
            <div className="flex justify-between">
              <dt className="text-[#a5a8b5]">Gross Earnings</dt>
              <dd className="font-mono-num text-white">{formatINR(pay.gross)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#a5a8b5]">PF Deduction (12%)</dt>
              <dd className="font-mono-num text-[#ff9999]">-{formatINR(pay.pfEmployee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#a5a8b5]">ESIC (0.75%)</dt>
              <dd className="font-mono-num text-[#ff9999]">-{formatINR(pay.esiEmployee)}</dd>
            </div>
          </dl>
        )}
      </div>

      {/* Attendance Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            <Calendar className="h-3.5 w-3.5" />
            Attendance (Nov 1–27)
          </span>
          <span className="font-mono-num text-xs font-semibold text-[var(--text-primary)]">
            {presentDays} / {myAttendance.length} days
          </span>
        </div>
        <div className="mt-3 grid grid-cols-9 gap-1">
          {myAttendance.slice(0, 27).map((rec) => (
            <div
              key={rec.date}
              title={`${rec.date}: ${rec.status}`}
              className={`flex h-7 items-center justify-center rounded text-xs font-mono-num font-medium ${
                rec.status === 'P'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : rec.status === 'A'
                    ? 'bg-red-500/15 text-red-700 dark:text-red-400'
                    : rec.status === 'L'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      : 'bg-[var(--bg-raised)] text-[var(--text-muted)]'
              }`}
            >
              {rec.status}
            </div>
          ))}
        </div>
      </Card>

      {/* Apply Leave Form */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Apply for Leave</h3>
        <form onSubmit={handleApply} className="mt-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-[var(--text-muted)]">Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2 text-xs"
              >
                <option value="CL">CL</option>
                <option value="SL">SL</option>
                <option value="EL">EL</option>
                <option value="CompOff">CompOff</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[var(--text-muted)]">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) setEndDate(e.target.value);
                }}
                className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[var(--text-muted)]">To</label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[var(--text-muted)]">Reason</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for leave"
              className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-3 text-xs"
            />
          </div>
          <Button type="submit" variant="primary" size="md" className="w-full">
            <Send className="h-3.5 w-3.5" />
            Submit leave request
          </Button>
        </form>

        {myLeaves.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-[var(--border-hairline)] pt-3">
            <div className="text-[11px] font-medium text-[var(--text-muted)]">Recent requests</div>
            {myLeaves.slice(0, 3).map((lv) => (
              <div key={lv.id} className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">
                  {lv.type} · {lv.startDate} ({lv.days}d)
                </span>
                <Badge
                  tone={
                    lv.status === 'Approved'
                      ? 'success'
                      : lv.status === 'Rejected'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {lv.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                  {lv.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
