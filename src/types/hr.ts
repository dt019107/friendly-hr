export type Role = 'Owner' | 'HR' | 'Employee';
export type IndianState = 'Karnataka' | 'Haryana' | 'Maharashtra';
export type Department =
  | 'Engineering'
  | 'Product'
  | 'Design'
  | 'QA & DevOps'
  | 'Data & AI'
  | 'People & Ops';
export type Shift = 'Hybrid' | 'Remote' | 'US Overlap';
export type EmploymentType = 'Full-Time' | 'Contractor';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Notice' | 'Exited';
export type AttendanceCode = 'P' | 'A' | 'L' | 'HD' | 'WO';
export type LeaveType = 'CL' | 'SL' | 'EL' | 'CompOff';
export type ComplianceArea = 'PF' | 'ESI' | 'PT' | 'LWF';

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  role: string;
  department: Department;
  shift: Shift;
  employmentType: EmploymentType;
  contractorName?: string;
  tenureMonths: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  status: EmployeeStatus;
  state: IndianState;
  phone: string;
  email: string;
  joinedAt: string;
  uan?: string;
  esicNo?: string;
  performance: 'Good' | 'Average' | 'Needs Review';
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  contractorName: string;
  department: Department;
  shift: Shift;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: 'Expiring' | 'Renewed' | 'Terminated';
}

export interface AttendanceRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceCode;
  shift: Shift;
  overtimeHours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  shift: Shift;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  channel: 'Portal' | 'WhatsApp';
  createdAt: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  employmentType: EmploymentType;
  gross: number;
  pfEmployee: number;
  pfEmployer: number;
  esiEmployee: number;
  esiEmployer: number;
  pt: number;
  tds: number;
  netPay: number;
  overtimePay: number;
  anomalyReason?: string;
  anomalyResolved?: boolean;
}

export interface ComplianceRule {
  id: string;
  state: IndianState;
  area: ComplianceArea;
  title: string;
  dueDate: string; // YYYY-MM-DD
  frequency: 'Monthly' | 'Half-Yearly' | 'Annual';
  thresholdNote: string;
  penaltyNote: string;
  weight: number; // risk weight 10-35
  status: 'Pending' | 'Overdue' | 'Filed';
  filedAt?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export interface CompanyConfig {
  companyName: string;
  plantLocation: string;
  state: IndianState;
  industry: 'SaaS / Product' | 'IT Services' | 'AI & Cloud';
  onboardingCompleted: boolean;
}

export type NavTab =
  | 'home'
  | 'employees'
  | 'attendance'
  | 'payroll'
  | 'compliance'
  | 'mobile'
  | 'onboarding';
