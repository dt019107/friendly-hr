import React, { useMemo, useState } from 'react';
import { MessageCircle, Plus, Check, X as XIcon } from 'lucide-react';
import { useHRStore } from '../../store/useHRStore';
import { cn } from '../../lib/format';
import { Badge, Button, Card, Modal, PageHeader } from '../ui/Primitives';
import type { AttendanceCode, LeaveRequest, LeaveType } from '../../types/hr';

const DAYS = Array.from({ length: 27 }, (_, i) => i + 1);
const NEXT_STATUS: Record<AttendanceCode, AttendanceCode> = {
  P: 'HD',
  HD: 'L',
  L: 'A',
  A: 'P',
  WO: 'P',
};

export const AttendanceScreen: React.FC = () => {
  const {
    employees,
    attendance,
    leaves,
    toggleAttendanceCell,
    updateLeaveStatus,
    submitLeaveRequest,
  } = useHRStore();

  const [deptFilter, setDeptFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [whatsappModalLeave, setWhatsappModalLeave] = useState<LeaveRequest | null>(null);
  const [newLeaveOpen, setNewLeaveOpen] = useState(false);

  // Form state for new leave
  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status !== 'Exited'),
    [employees]
  );
  const [formEmpId, setFormEmpId] = useState(activeEmployees[0]?.id || 'emp-1');
  const [formType, setFormType] = useState<LeaveType>('CL');
  const [formStart, setFormStart] = useState('2026-11-26');
  const [formEnd, setFormEnd] = useState('2026-11-27');
  const [formReason, setFormReason] = useState('Family medical checkup');

  const filteredEmployees = useMemo(() => {
    return activeEmployees
      .filter((e) => (deptFilter === 'All' ? true : e.department === deptFilter))
      .filter((e) => (shiftFilter === 'All' ? true : e.shift === shiftFilter))
      .slice(0, 18); // Show first 18 rows in grid for crisp readability
  }, [activeEmployees, deptFilter, shiftFilter]);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceCode>();
    for (const rec of attendance) {
      map.set(`${rec.employeeId}:${rec.date}`, rec.status);
    }
    return map;
  }, [attendance]);

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReason.trim()) return;
    const d1 = new Date(formStart);
    const d2 = new Date(formEnd < formStart ? formStart : formEnd);
    const days = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1);
    submitLeaveRequest({
      employeeId: formEmpId,
      type: formType,
      startDate: formStart,
      endDate: formEnd < formStart ? formStart : formEnd,
      days,
      reason: formReason.trim(),
      channel: 'Portal',
    });
    setNewLeaveOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & Leave"
        subtitle="November 2026 squad availability grid & leave approval queue"
        actions={
          <Button variant="primary" size="md" onClick={() => setNewLeaveOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Apply leave
          </Button>
        }
      />

      {/* Pending Leave Requests */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Leave Approval Queue
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Approving a request automatically marks &quot;L&quot; on the attendance grid below
            </p>
          </div>
          <Badge tone={pendingLeaves.length > 0 ? 'accent' : 'success'}>
            {pendingLeaves.length} pending
          </Badge>
        </div>

        <div className="space-y-2.5">
          {leaves.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-hairline)] py-8 text-center text-xs text-[var(--text-muted)]">
              No leave requests recorded yet.
            </div>
          ) : (
            leaves.slice(0, 8).map((lv) => (
            <div
              key={lv.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-raised)]/40 p-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {lv.employeeName}
                  </span>
                  <Badge tone="neutral">{lv.type}</Badge>
                  <span className="font-mono-num text-xs text-[var(--text-muted)]">
                    {lv.startDate} ({lv.days}d)
                  </span>
                  {lv.channel === 'WhatsApp' && (
                    <Badge tone="success">
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {lv.department} · {lv.shift}: &quot;{lv.reason}&quot;
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {lv.status === 'Pending' ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setWhatsappModalLeave(lv)}
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => updateLeaveStatus(lv.id, 'Approved', lv.channel)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateLeaveStatus(lv.id, 'Rejected', lv.channel)}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </>
                ) : (
                  <Badge tone={lv.status === 'Approved' ? 'success' : 'danger'}>
                    {lv.status}
                  </Badge>
                )}
              </div>
            </div>
          ))
          )}
        </div>
      </Card>

      {/* Monthly Attendance Grid */}
      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              November 2026 Attendance Grid
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Click any cell to cycle status (P → HD → L → A)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter grid by department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 text-xs font-medium"
            >
              <option value="All">All departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="QA & DevOps">QA &amp; DevOps</option>
              <option value="Data & AI">Data &amp; AI</option>
            </select>
            <select
              aria-label="Filter grid by work mode"
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="h-9 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 text-xs font-medium"
            >
              <option value="All">All work modes</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="US Overlap">US Overlap</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[var(--text-muted)]">
                <th className="sticky left-0 bg-[var(--bg-surface)] py-2 pr-4 text-left font-medium min-w-40">
                  Worker
                </th>
                {DAYS.map((d) => (
                  <th key={d} className="px-1 py-2 text-center font-mono-num font-normal">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={DAYS.length + 1} className="py-10 text-center text-xs text-[var(--text-muted)]">
                    No workers match the selected department and shift filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="sticky left-0 bg-[var(--bg-surface)] py-2 pr-4">
                      <div className="font-medium text-[var(--text-primary)] truncate max-w-40">
                        {emp.name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {emp.department} · {emp.shift}
                      </div>
                    </td>
                    {DAYS.map((d) => {
                      const date = `2026-11-${String(d).padStart(2, '0')}`;
                      const code = attendanceMap.get(`${emp.id}:${date}`) || 'P';
                      const cellStyle =
                        code === 'P'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : code === 'A'
                            ? 'bg-red-500/15 text-red-700 dark:text-red-400 font-semibold'
                            : code === 'L'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold'
                              : code === 'HD'
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                                : 'bg-[var(--bg-raised)] text-[var(--text-muted)]';

                      return (
                        <td key={d} className="p-0.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleAttendanceCell(emp.id, date, NEXT_STATUS[code])}
                            title={`${emp.name} on ${date}: ${code}`}
                            className={cn(
                              'h-7 w-7 rounded text-xs font-mono-num transition-colors hover:ring-1 hover:ring-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                              cellStyle
                            )}
                          >
                            {code}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approve via WhatsApp Mock Modal */}
      <Modal
        open={Boolean(whatsappModalLeave)}
        onClose={() => setWhatsappModalLeave(null)}
        title="Approve via WhatsApp Business"
        subtitle="Send an instant bilingual confirmation to the worker's phone"
      >
        {whatsappModalLeave && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[#efeae2] dark:bg-[#111b21] p-4 space-y-3">
              <div className="max-w-[85%] rounded-lg bg-white dark:bg-[#202c33] p-3 text-xs shadow-sm">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {whatsappModalLeave.employeeName} ({whatsappModalLeave.shift})
                </p>
                <p className="mt-1 text-neutral-800 dark:text-neutral-200">
                  Hi, requesting {whatsappModalLeave.days} day(s) {whatsappModalLeave.type} from{' '}
                  {whatsappModalLeave.startDate}. Reason: {whatsappModalLeave.reason}.
                </p>
                <span className="mt-1 block text-right text-xs text-neutral-400">08:42 AM</span>
              </div>

              <div className="ml-auto max-w-[85%] rounded-lg bg-[#d9fdd3] dark:bg-[#005c4b] p-3 text-xs shadow-sm">
                <p className="text-neutral-900 dark:text-neutral-100">
                  Approved: Your {whatsappModalLeave.type} from {whatsappModalLeave.startDate} is confirmed. Squad roster updated.
                </p>
                <span className="mt-1 block text-right text-xs text-neutral-500 dark:text-emerald-200">
                  Ready to send
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setWhatsappModalLeave(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  updateLeaveStatus(whatsappModalLeave.id, 'Approved', 'WhatsApp');
                  setWhatsappModalLeave(null);
                }}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Send WhatsApp &amp; Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Apply Leave Modal */}
      <Modal
        open={newLeaveOpen}
        onClose={() => setNewLeaveOpen(false)}
        title="New Leave Request"
        subtitle="Submit a leave request on behalf of a worker"
      >
        <form onSubmit={handleCreateLeave} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Employee
            </label>
            <select
              value={formEmpId}
              onChange={(e) => setFormEmpId(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-3 text-sm"
            >
              {activeEmployees.slice(0, 30).map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department} · {emp.shift})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as LeaveType)}
                className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2.5 text-sm"
              >
                <option value="CL">CL</option>
                <option value="SL">SL</option>
                <option value="EL">EL</option>
                <option value="CompOff">CompOff</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Start
              </label>
              <input
                type="date"
                value={formStart}
                onChange={(e) => {
                  setFormStart(e.target.value);
                  if (formEnd < e.target.value) setFormEnd(e.target.value);
                }}
                className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                End
              </label>
              <input
                type="date"
                min={formStart}
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
                className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Reason
            </label>
            <input
              type="text"
              required
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-3 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setNewLeaveOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
