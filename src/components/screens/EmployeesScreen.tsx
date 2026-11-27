import React, { useMemo, useState } from 'react';
import {
  Search,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { useHRStore } from '../../store/useHRStore';
import { formatINR, getInitials, cn } from '../../lib/format';
import { Badge, Button, Card, Modal, PageHeader } from '../ui/Primitives';
import type { Department, Employee, EmploymentType, IndianState, Shift } from '../../types/hr';

interface EmployeesScreenProps {
  externalSearch: string;
  onExternalSearchChange?: (val: string) => void;
}

const SAMPLE_MESSY_CSV = `Full Name,Dept,Work_Mode,Type,Monthly Basic,Phone,State
Vikramaditya Rana,Engineering,US Overlap,Contractor,68000,+91 9811223344,Karnataka
Meenakshi Chauhan,Product,Hybrid,Full-Time,85000,+91 9811223355,Karnataka
Harshvardhan Saini,QA & DevOps,Remote,Full-Time,58000,+91 9811223366,Haryana
Roshni Kulkarni,Design,Hybrid,Contractor,62000,+91 9811223377,Maharashtra`;

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(',').map((c) => c.trim()));
  return { headers, rows };
}

export const EmployeesScreen: React.FC<EmployeesScreenProps> = ({
  externalSearch,
  onExternalSearchChange,
}) => {
  const { employees, importEmployees } = useHRStore();

  const [localSearch, setLocalSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [shiftFilter, setShiftFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // CSV Wizard state
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvStep, setCsvStep] = useState<1 | 2 | 3>(1);
  const [csvRaw, setCsvRaw] = useState('');
  const [csvError, setCsvError] = useState('');
  const [mapping, setMapping] = useState<Record<string, string>>({
    name: '',
    department: '',
    shift: '',
    employmentType: '',
    basicSalary: '',
    phone: '',
    state: '',
  });

  React.useEffect(() => {
    if (!selectedEmployee) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedEmployee(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEmployee]);

  const query = (externalSearch || localSearch).trim().toLowerCase();

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (deptFilter !== 'All' && e.department !== deptFilter) return false;
      if (shiftFilter !== 'All' && e.shift !== shiftFilter) return false;
      if (typeFilter !== 'All' && e.employmentType !== typeFilter) return false;
      if (query) {
        const hay = `${e.name} ${e.empCode} ${e.role} ${e.department} ${e.contractorName || ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [employees, deptFilter, shiftFilter, typeFilter, query]);

  const pageSize = 14;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const parsedCSV = useMemo(() => parseCSV(csvRaw), [csvRaw]);

  const autoMapHeaders = (headers: string[]) => {
    const find = (patterns: string[]) =>
      headers.find((h) => patterns.some((p) => h.toLowerCase().includes(p))) || headers[0] || '';
    setMapping({
      name: find(['name', 'worker', 'employee']),
      department: find(['dept', 'department']),
      shift: find(['shift']),
      employmentType: find(['type', 'contract', 'category']),
      basicSalary: find(['basic', 'salary', 'wage']),
      phone: find(['phone', 'mobile', 'contact']),
      state: find(['state', 'location']),
    });
  };

  const handleLoadSampleCSV = () => {
    setCsvError('');
    setCsvRaw(SAMPLE_MESSY_CSV);
    const { headers } = parseCSV(SAMPLE_MESSY_CSV);
    autoMapHeaders(headers);
    setCsvStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const parsed = parseCSV(content);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setCsvError('The uploaded CSV needs a header row and at least one employee row.');
        return;
      }
      setCsvError('');
      setCsvRaw(content);
      autoMapHeaders(parsed.headers);
      setCsvStep(2);
    };
    reader.readAsText(file);
  };

  const previewMappedRows = useMemo(() => {
    if (parsedCSV.headers.length === 0) return [];
    const idxOf = (col: string) => parsedCSV.headers.indexOf(col);
    const validDepts: Department[] = [
      'Engineering',
      'Product',
      'Design',
      'QA & DevOps',
      'Data & AI',
      'People & Ops',
    ];
    const validShifts: Shift[] = ['Hybrid', 'Remote', 'US Overlap'];
    const validStates: IndianState[] = ['Karnataka', 'Haryana', 'Maharashtra'];

    return parsedCSV.rows.map((row, idx) => {
      const getVal = (field: string) => {
        const i = idxOf(mapping[field]);
        return i >= 0 ? row[i] || '' : '';
      };
      const rawDept = getVal('department');
      const department = (validDepts.find((d) => d.toLowerCase() === rawDept.toLowerCase()) ||
        'Engineering') as Department;
      const rawShift = getVal('shift');
      const shift = (validShifts.find((s) => s.toLowerCase() === rawShift.toLowerCase()) ||
        'Hybrid') as Shift;
      const rawType = getVal('employmentType');
      const employmentType: EmploymentType = rawType.toLowerCase().includes('contract')
        ? 'Contractor'
        : 'Full-Time';
      const basicSalary = Math.max(
        25000,
        Number(getVal('basicSalary').replace(/[^0-9]/g, '')) || 45000
      );
      const rawState = getVal('state');
      const state = (validStates.find((st) => st.toLowerCase() === rawState.toLowerCase()) ||
        'Karnataka') as IndianState;

      return {
        empCode: `NX-${1200 + idx + 1}`,
        name: getVal('name') || `Engineer ${idx + 1}`,
        role: department === 'Design' ? 'Product Designer' : 'Software Engineer',
        department,
        shift,
        employmentType,
        contractorName: employmentType === 'Contractor' ? 'Apex Tech Consultants' : undefined,
        tenureMonths: 1,
        basicSalary,
        hra: Math.round(basicSalary * 0.4),
        allowances: Math.round(basicSalary * 0.25),
        status: 'Active' as const,
        state,
        phone: getVal('phone') || '+91 9811000000',
        email: `member${idx + 1}@nexorasystems.in`,
        joinedAt: '2026-11-27',
        uan: `10099${String(100000 + idx)}`,
        performance: 'Good' as const,
      };
    });
  }, [parsedCSV, mapping]);

  const handleConfirmImport = () => {
    if (previewMappedRows.length === 0) return;
    importEmployees(previewMappedRows);
    setCsvOpen(false);
    setCsvStep(1);
    setCsvRaw('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees Directory"
        subtitle={`Showing ${filtered.length} of ${employees.length} employees across squads & SOW contractors`}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setCsvStep(1);
              setCsvOpen(true);
            }}
          >
            <Upload className="h-4 w-4" strokeWidth={1.5} />
            Import CSV
          </Button>
        }
      />

      {/* Refined Filter Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          {/* Pill Search */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              strokeWidth={1.5}
            />
            <input
              type="search"
              value={externalSearch || localSearch}
              onChange={(e) => {
                if (externalSearch && onExternalSearchChange) {
                  onExternalSearchChange(e.target.value);
                } else {
                  setLocalSearch(e.target.value);
                }
                setPage(1);
              }}
              placeholder="Search name, code, role, or contractor"
              className="h-10 w-full rounded-full border border-transparent bg-[var(--bg-raised)] pl-10 pr-9 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus-visible:outline-none"
            />
            {(externalSearch || localSearch) && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setLocalSearch('');
                  onExternalSearchChange?.('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Custom-Arrow Filter Pills */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:items-center">
            <div className="relative">
              <select
                aria-label="Filter by department"
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  'h-10 w-full appearance-none rounded-full border pl-4 pr-9 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer',
                  deptFilter !== 'All'
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                )}
              >
                <option value="All">All departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="QA & DevOps">QA &amp; DevOps</option>
                <option value="Data & AI">Data &amp; AI</option>
                <option value="People & Ops">People &amp; Ops</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
                strokeWidth={1.5}
              />
            </div>

            <div className="relative">
              <select
                aria-label="Filter by work mode"
                value={shiftFilter}
                onChange={(e) => {
                  setShiftFilter(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  'h-10 w-full appearance-none rounded-full border pl-4 pr-9 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer',
                  shiftFilter !== 'All'
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                )}
              >
                <option value="All">All work modes</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="US Overlap">US Overlap</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
                strokeWidth={1.5}
              />
            </div>

            <div className="relative">
              <select
                aria-label="Filter by employment type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  'h-10 w-full appearance-none rounded-full border pl-4 pr-9 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer',
                  typeFilter !== 'All'
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                )}
              >
                <option value="All">All employment types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Contractor">Contractor</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
                strokeWidth={1.5}
              />
            </div>

            {(deptFilter !== 'All' || shiftFilter !== 'All' || typeFilter !== 'All' || query) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setLocalSearch('');
                  onExternalSearchChange?.('');
                  setDeptFilter('All');
                  setShiftFilter('All');
                  setTypeFilter('All');
                  setPage(1);
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border-hairline)] bg-[var(--bg-raised)]/60 text-xs font-medium text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Gross / mo</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    <p>No employees match your filters.</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-3"
                      onClick={() => {
                        setLocalSearch('');
                        onExternalSearchChange?.('');
                        setDeptFilter('All');
                        setShiftFilter('All');
                        setTypeFilter('All');
                        setPage(1);
                      }}
                    >
                      Clear all filters
                    </Button>
                  </td>
                </tr>
              ) : (
                pageRows.map((emp) => {
                  const gross = emp.basicSalary + emp.hra + emp.allowances;
                  const statusTone =
                    emp.status === 'Active'
                      ? 'success'
                      : emp.status === 'On Leave'
                        ? 'warning'
                        : emp.status === 'Notice'
                          ? 'warning'
                          : 'danger';

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className="cursor-pointer transition-colors hover:bg-[var(--bg-raised)]/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                            {getInitials(emp.name)}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmployee(emp);
                              }}
                              className="text-left font-medium text-[var(--text-primary)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                            >
                              {emp.name}
                            </button>
                            <div className="font-mono-num text-xs text-[var(--text-muted)] truncate">
                              {emp.empCode} · {emp.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{emp.department}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{emp.shift}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[var(--text-secondary)]">
                          {emp.employmentType}
                        </span>
                        {emp.contractorName && (
                          <div className="truncate max-w-36 text-xs text-[var(--text-muted)]">
                            {emp.contractorName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-num font-medium text-[var(--text-primary)]">
                        {formatINR(gross)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone}>{emp.status}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--border-hairline)] px-4 py-3 text-xs text-[var(--text-muted)]">
          <span>
            Page <span className="font-mono-num text-[var(--text-primary)]">{currentPage}</span> of{' '}
            <span className="font-mono-num text-[var(--text-primary)]">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Profile Drawer */}
      {selectedEmployee && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedEmployee.name} profile`}
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEmployee(null);
          }}
        >
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                  {getInitials(selectedEmployee.name)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {selectedEmployee.name}
                  </h3>
                  <p className="font-mono-num text-xs text-[var(--text-muted)]">
                    {selectedEmployee.empCode} · {selectedEmployee.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                aria-label="Close profile drawer"
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-raised)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-raised)]/50 p-4 text-xs">
                <div>
                  <span className="text-[var(--text-muted)]">Department</span>
                  <div className="mt-0.5 font-medium text-[var(--text-primary)]">
                    {selectedEmployee.department}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Shift &amp; Tenure</span>
                  <div className="mt-0.5 font-medium text-[var(--text-primary)]">
                    {selectedEmployee.shift} · {selectedEmployee.tenureMonths} mo
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Employment</span>
                  <div className="mt-0.5 font-medium text-[var(--text-primary)]">
                    {selectedEmployee.employmentType}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">State</span>
                  <div className="mt-0.5 font-medium text-[var(--text-primary)]">
                    {selectedEmployee.state}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--brand-yellow-soft)] p-4">
                <h4 className="text-xs font-medium text-[var(--text-muted)]">Monthly Salary Structure</h4>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--text-secondary)]">Basic Pay</dt>
                    <dd className="font-mono-num text-[var(--text-primary)]">
                      {formatINR(selectedEmployee.basicSalary)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--text-secondary)]">HRA</dt>
                    <dd className="font-mono-num text-[var(--text-primary)]">
                      {formatINR(selectedEmployee.hra)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--text-secondary)]">Allowances</dt>
                    <dd className="font-mono-num text-[var(--text-primary)]">
                      {formatINR(selectedEmployee.allowances)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border-hairline)] pt-2 font-semibold">
                    <dt>Gross Monthly</dt>
                    <dd className="font-mono-num">
                      {formatINR(
                        selectedEmployee.basicSalary +
                          selectedEmployee.hra +
                          selectedEmployee.allowances
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-[var(--border-hairline)] p-4 text-xs space-y-2">
                <h4 className="font-medium text-[var(--text-muted)]">Statutory &amp; Contact</h4>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">EPFO UAN</span>
                  <span className="font-mono-num text-[var(--text-primary)]">
                    {selectedEmployee.uan || 'Missing (needs KYC)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">ESIC Number</span>
                  <span className="font-mono-num text-[var(--text-primary)]">
                    {selectedEmployee.esicNo || 'Above ₹21,000 ceiling'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Phone</span>
                  <span className="font-mono-num text-[var(--text-primary)]">
                    {selectedEmployee.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-Step CSV Import Wizard */}
      <Modal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Import Employees via CSV"
        subtitle={`Step ${csvStep} of 3: upload, map columns, and preview before adding to roster`}
        maxWidth="max-w-2xl"
      >
        {/* Step Indicator (Miro pill-tab) */}
        <div className="mb-5 flex items-center gap-2 text-xs">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium',
                csvStep === step
                  ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                  : csvStep > step
                    ? 'border-transparent bg-[#00b473]/15 text-[#008f5b] dark:text-[#00b473]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-muted)]'
              )}
            >
              {csvStep > step ? <Check className="h-3 w-3" /> : <span>{step}.</span>}
              <span>{step === 1 ? 'Upload' : step === 2 ? 'Map columns' : 'Preview & Import'}</span>
            </div>
          ))}
        </div>

        {csvStep === 1 && (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-hairline)] bg-[var(--bg-raised)]/40 p-8 text-center hover:border-[var(--accent)]">
              <FileSpreadsheet className="h-8 w-8 text-[var(--accent)]" strokeWidth={1.5} />
              <span className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                Choose a .csv file from your computer
              </span>
              <span className="mt-1 text-xs text-[var(--text-muted)]">
                Messy headers like Full Name, Dept, Shift_Code are supported
              </span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="sr-only" />
            </label>

            {csvError && (
              <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400">
                {csvError}
              </p>
            )}

            <div className="flex items-center justify-between rounded-xl border border-[var(--border-hairline)] p-3.5">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Testing the demo?
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Load a 4-row sample manufacturing CSV with non-standard column names.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLoadSampleCSV}>
                Load sample messy CSV
              </Button>
            </div>
          </div>
        )}

        {csvStep === 2 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ['name', 'Employee Name'],
                  ['department', 'Department'],
                  ['shift', 'Shift'],
                  ['employmentType', 'Employment Type'],
                  ['basicSalary', 'Basic Salary (INR)'],
                  ['phone', 'Phone Number'],
                  ['state', 'Plant State'],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                    {label}
                  </label>
                  <select
                    value={mapping[field]}
                    onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2.5 text-sm text-[var(--text-primary)]"
                  >
                    {parsedCSV.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCsvStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={parsedCSV.rows.length === 0 || !mapping.name}
                onClick={() => setCsvStep(3)}
              >
                Preview {parsedCSV.rows.length} rows
              </Button>
            </div>
          </div>
        )}

        {csvStep === 3 && (
          <div className="space-y-4">
            <div className="max-h-60 overflow-auto rounded-xl border border-[var(--border-hairline)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-raised)] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Shift</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Basic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {previewMappedRows.map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-[var(--text-primary)]">{r.name}</td>
                      <td className="px-3 py-2">{r.department}</td>
                      <td className="px-3 py-2">{r.shift}</td>
                      <td className="px-3 py-2">{r.employmentType}</td>
                      <td className="px-3 py-2 text-right font-mono-num">{formatINR(r.basicSalary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCsvStep(2)}>
                Back to mapping
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmImport}>
                Import {previewMappedRows.length} employees
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
