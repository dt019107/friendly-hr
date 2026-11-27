import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateSeedData } from '../data/seed';
import type {
  AttendanceCode,
  AttendanceRecord,
  CompanyConfig,
  ComplianceRule,
  Contract,
  Employee,
  IndianState,
  LeaveRequest,
  LeaveType,
  NavTab,
  PayrollEntry,
  Role,
  ToastMessage,
} from '../types/hr';

interface HRState {
  role: Role;
  activeTab: NavTab;
  darkMode: boolean;
  selectedState: IndianState;
  currentEmployeeId: string;
  showRoleModal: boolean;
  company: CompanyConfig;
  toasts: ToastMessage[];
  stayInterviewsScheduled: boolean;

  employees: Employee[];
  contracts: Contract[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payroll: PayrollEntry[];
  complianceRules: ComplianceRule[];

  setRole: (role: Role) => void;
  setActiveTab: (tab: NavTab) => void;
  toggleDarkMode: () => void;
  setSelectedState: (state: IndianState) => void;
  setShowRoleModal: (show: boolean) => void;
  setCurrentEmployeeId: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  resolveContract: (contractId: string, action: 'Renewed' | 'Terminated') => void;
  resolveAllUrgentContracts: () => void;
  scheduleStayInterviews: () => void;
  updateLeaveStatus: (leaveId: string, status: 'Approved' | 'Rejected', via?: 'Portal' | 'WhatsApp') => void;
  submitLeaveRequest: (input: {
    employeeId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    channel?: 'Portal' | 'WhatsApp';
  }) => void;
  toggleAttendanceCell: (employeeId: string, date: string, nextStatus: AttendanceCode) => void;
  resolvePayrollAnomaly: (payrollId: string) => void;
  markComplianceFiled: (ruleId: string) => void;
  importEmployees: (newEmployees: Omit<Employee, 'id'>[]) => void;
  completeOnboarding: (config: Omit<CompanyConfig, 'onboardingCompleted'>) => void;
  resetDemoData: () => void;
}

const initialSeed = generateSeedData();

export const useHRStore = create<HRState>()(
  persist(
    (set, get) => ({
      role: 'HR',
      activeTab: 'home',
      darkMode: false,
      selectedState: 'Karnataka',
      currentEmployeeId: 'emp-1',
      showRoleModal: false,
      company: {
        companyName: 'Nexora Systems Pvt Ltd',
        plantLocation: 'Bengaluru · Outer Ring Road',
        state: 'Karnataka',
        industry: 'SaaS / Product',
        onboardingCompleted: true,
      },
      toasts: [],
      stayInterviewsScheduled: false,

      employees: initialSeed.employees,
      contracts: initialSeed.contracts,
      attendance: initialSeed.attendance,
      leaves: initialSeed.leaves,
      payroll: initialSeed.payroll,
      complianceRules: initialSeed.complianceRules,

      setRole: (role) =>
        set((state) => ({
          role,
          activeTab: role === 'Employee' ? 'mobile' : state.activeTab === 'mobile' ? 'home' : state.activeTab,
          showRoleModal: false,
        })),

      setActiveTab: (activeTab) => set({ activeTab }),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      setSelectedState: (selectedState) =>
        set((state) => ({
          selectedState,
          company: { ...state.company, state: selectedState },
        })),

      setShowRoleModal: (showRoleModal) => set({ showRoleModal }),

      setCurrentEmployeeId: (currentEmployeeId) => set({ currentEmployeeId }),

      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({ toasts: [...state.toasts.slice(-3), { ...toast, id }] }));
        setTimeout(() => {
          get().dismissToast(id);
        }, 4200);
      },

      dismissToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      resolveContract: (contractId, action) => {
        const contract = get().contracts.find((c) => c.id === contractId);
        set((state) => ({
          contracts: state.contracts.map((c) => (c.id === contractId ? { ...c, status: action } : c)),
        }));
        if (contract) {
          get().addToast({
            title: `SOW ${action.toLowerCase()}`,
            description: `${contract.employeeName} (${contract.contractorName}) marked as ${action}.`,
            variant: action === 'Renewed' ? 'success' : 'warning',
          });
        }
      },

      resolveAllUrgentContracts: () => {
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.status === 'Expiring' && c.daysRemaining <= 10 ? { ...c, status: 'Renewed' } : c
          ),
        }));
        get().addToast({
          title: 'Urgent SOWs renewed',
          description: 'All contractor SOWs expiring within 10 days have been extended by 6 months.',
          variant: 'success',
        });
      },

      scheduleStayInterviews: () => {
        set({ stayInterviewsScheduled: true });
        get().addToast({
          title: '1:1 stay interviews scheduled',
          description: 'US Overlap contractors (<6 mo) booked for Engineering Manager check-ins this Friday.',
          variant: 'success',
        });
      },

      updateLeaveStatus: (leaveId, status, via = 'Portal') => {
        const target = get().leaves.find((l) => l.id === leaveId);
        set((state) => {
          const updatedLeaves = state.leaves.map((l) =>
            l.id === leaveId ? { ...l, status } : l
          );

          let updatedAttendance = state.attendance;
          if (status === 'Approved' && target) {
            updatedAttendance = state.attendance.map((rec) => {
              if (
                rec.employeeId === target.employeeId &&
                rec.date >= target.startDate &&
                rec.date <= target.endDate
              ) {
                return { ...rec, status: 'L' as AttendanceCode };
              }
              return rec;
            });
          }

          return { leaves: updatedLeaves, attendance: updatedAttendance };
        });

        if (target) {
          get().addToast({
            title: `Leave ${status.toLowerCase()} (${via})`,
            description: `${target.employeeName}: ${target.days}d ${target.type} (${target.startDate}). Squad roster synced.`,
            variant: status === 'Approved' ? 'success' : 'warning',
          });
        }
      },

      submitLeaveRequest: ({ employeeId, type, startDate, endDate, days, reason, channel = 'Portal' }) => {
        const emp = get().employees.find((e) => e.id === employeeId) || get().employees[0];
        if (!emp) return;
        const newLeave: LeaveRequest = {
          id: `lv-${Date.now()}`,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          shift: emp.shift,
          type,
          startDate,
          endDate,
          days,
          reason,
          status: 'Pending',
          channel,
          createdAt: '2026-11-27',
        };
        set((state) => ({ leaves: [newLeave, ...state.leaves] }));
        get().addToast({
          title: 'Leave request submitted',
          description: `${emp.name} requested ${days}d ${type} from ${startDate}.`,
          variant: 'success',
        });
      },

      toggleAttendanceCell: (employeeId, date, nextStatus) => {
        set((state) => ({
          attendance: state.attendance.map((a) =>
            a.employeeId === employeeId && a.date === date ? { ...a, status: nextStatus } : a
          ),
        }));
      },

      resolvePayrollAnomaly: (payrollId) => {
        const entry = get().payroll.find((p) => p.id === payrollId);
        set((state) => ({
          payroll: state.payroll.map((p) =>
            p.id === payrollId ? { ...p, anomalyResolved: true } : p
          ),
        }));
        if (entry) {
          get().addToast({
            title: 'Payroll anomaly verified',
            description: `${entry.employeeName} cleared for monthly salary disbursement.`,
            variant: 'success',
          });
        }
      },

      markComplianceFiled: (ruleId) => {
        const rule = get().complianceRules.find((r) => r.id === ruleId);
        set((state) => ({
          complianceRules: state.complianceRules.map((r) =>
            r.id === ruleId ? { ...r, status: 'Filed', filedAt: '2026-11-27' } : r
          ),
        }));
        if (rule) {
          get().addToast({
            title: `${rule.area} filing marked done`,
            description: `${rule.title} filed. ${rule.state} risk score updated.`,
            variant: 'success',
          });
        }
      },

      importEmployees: (newEmployees) => {
        const baseIdx = get().employees.length;
        const created: Employee[] = newEmployees.map((emp, idx) => ({
          ...emp,
          id: `emp-imp-${Date.now()}-${idx}`,
          empCode: emp.empCode || `NX-${1001 + baseIdx + idx}`,
        }));

        const newPayroll: PayrollEntry[] = created.map((emp) => {
          const gross = emp.basicSalary + emp.hra + emp.allowances;
          const pfBase = Math.min(emp.basicSalary, 15000);
          const pfEmployee = Math.round(pfBase * 0.12);
          const pfEmployer = Math.round(pfBase * 0.12);
          const esiEligible = gross <= 21000;
          const esiEmployee = esiEligible ? Math.round(gross * 0.0075) : 0;
          const esiEmployer = esiEligible ? Math.round(gross * 0.0325) : 0;
          const pt = emp.state === 'Karnataka' || emp.state === 'Maharashtra' ? 200 : 0;
          const tds = gross > 60000 ? Math.round((gross - 55000) * 0.12) : 0;
          return {
            id: `pay-${emp.id}`,
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            employmentType: emp.employmentType,
            gross,
            pfEmployee,
            pfEmployer,
            esiEmployee,
            esiEmployer,
            pt,
            tds,
            netPay: gross - pfEmployee - esiEmployee - pt - tds,
            overtimePay: 0,
          };
        });

        set((state) => ({
          employees: [...created, ...state.employees],
          payroll: [...newPayroll, ...state.payroll],
        }));

        get().addToast({
          title: `${created.length} employees imported`,
          description: 'Team roster and monthly payroll estimates updated.',
          variant: 'success',
        });
      },

      completeOnboarding: (config) => {
        set(() => ({
          company: { ...config, onboardingCompleted: true },
          selectedState: config.state,
          activeTab: 'home',
        }));
        get().addToast({
          title: 'Workspace configured',
          description: `${config.companyName} (${config.state}) is live with ${get().employees.length} employees.`,
          variant: 'success',
        });
      },

      resetDemoData: () => {
        const fresh = generateSeedData();
        set({
          role: 'HR',
          activeTab: 'home',
          selectedState: 'Karnataka',
          stayInterviewsScheduled: false,
          employees: fresh.employees,
          contracts: fresh.contracts,
          attendance: fresh.attendance,
          leaves: fresh.leaves,
          payroll: fresh.payroll,
          complianceRules: fresh.complianceRules,
        });
        get().addToast({
          title: 'Demo data restored',
          description: 'All 200 IT employees, 14 expiring SOWs, and compliance rules reset.',
          variant: 'default',
        });
      },
    }),
    {
      name: 'nexora-hr-v1',
      partialize: (state) => ({
        role: state.role,
        activeTab: state.activeTab,
        darkMode: state.darkMode,
        selectedState: state.selectedState,
        currentEmployeeId: state.currentEmployeeId,
        company: state.company,
        stayInterviewsScheduled: state.stayInterviewsScheduled,
        employees: state.employees,
        contracts: state.contracts,
        attendance: state.attendance,
        leaves: state.leaves,
        payroll: state.payroll,
        complianceRules: state.complianceRules,
      }),
    }
  )
);
