import complianceRulesData from './complianceRules.json';
import type {
  AttendanceCode,
  AttendanceRecord,
  ComplianceRule,
  Contract,
  Department,
  Employee,
  EmploymentType,
  IndianState,
  LeaveRequest,
  PayrollEntry,
  Shift,
} from '../types/hr';

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Rohan', 'Vikram', 'Siddharth', 'Arjun', 'Manish', 'Deepak', 'Karthik',
  'Anirudh', 'Karan', 'Nikhil', 'Pranav', 'Rahul', 'Harsh', 'Gaurav', 'Pankaj', 'Amit', 'Varun',
  'Priya', 'Neha', 'Pooja', 'Anjali', 'Kavita', 'Shruti', 'Ishita', 'Meera', 'Divya', 'Sneha',
  'Shalini', 'Ritu', 'Kiran', 'Aarti', 'Swati', 'Nisha', 'Tanvi', 'Riya', 'Nandini', 'Aditi',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Iyer', 'Nair', 'Kulkarni', 'Gupta', 'Patel', 'Mishra', 'Tiwari', 'Chauhan',
  'Pandey', 'Joshi', 'Deshmukh', 'Menon', 'Saini', 'Rao', 'Bhat', 'Agarwal', 'Kapoor', 'Malhotra',
];

const CONTRACTORS = [
  'Apex Tech Consultants',
  'Vanguard Cloud Staffing',
  'Deccan IT Talent',
  'NovaSoft Contractors',
];

const ROLES_BY_DEPT: Record<Department, string[]> = {
  Engineering: ['Frontend Engineer', 'Backend Engineer', 'Staff Architect'],
  Product: ['Product Manager', 'Senior PM', 'Product Analyst'],
  Design: ['Product Designer', 'Design Systems Lead', 'UX Researcher'],
  'QA & DevOps': ['QA Automation Lead', 'SRE / DevOps Engineer', 'Release Engineer'],
  'Data & AI': ['ML Engineer', 'Data Engineer', 'Analytics Lead'],
  'People & Ops': ['HR Business Partner', 'Talent Acquisition Lead', 'IT Admin'],
};

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeedData() {
  const rand = mulberry32(20261127);
  const employees: Employee[] = [];
  const contracts: Contract[] = [];
  const attendance: AttendanceRecord[] = [];
  const leaves: LeaveRequest[] = [];
  const payroll: PayrollEntry[] = [];

  const states: IndianState[] = ['Karnataka', 'Haryana', 'Maharashtra'];

  for (let i = 1; i <= 200; i++) {
    const firstName = FIRST_NAMES[(i * 7 + Math.floor(rand() * 10)) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 11 + Math.floor(rand() * 10)) % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;

    const deptRoll = rand();
    let department: Department = 'Engineering';
    if (deptRoll < 0.42) department = 'Engineering';
    else if (deptRoll < 0.56) department = 'QA & DevOps';
    else if (deptRoll < 0.70) department = 'Data & AI';
    else if (deptRoll < 0.82) department = 'Product';
    else if (deptRoll < 0.92) department = 'Design';
    else department = 'People & Ops';

    const roles = ROLES_BY_DEPT[department];
    const role = roles[i % roles.length];

    // Work modes: Hybrid 48%, Remote 28%, US Overlap 24%
    const shiftRoll = rand();
    const shift: Shift = shiftRoll < 0.48 ? 'Hybrid' : shiftRoll < 0.76 ? 'Remote' : 'US Overlap';

    // Employment type: ~30% SOW Contractors, ~70% Full-Time
    const employmentType: EmploymentType =
      department === 'People & Ops' ? 'Full-Time' : rand() < 0.32 ? 'Contractor' : 'Full-Time';

    const contractorName =
      employmentType === 'Contractor' ? CONTRACTORS[i % CONTRACTORS.length] : undefined;

    // Deliberate pattern: US Overlap contractors under 6 months tenure show higher attrition
    let tenureMonths = Math.floor(rand() * 48) + 2;
    if (shift === 'US Overlap' && employmentType === 'Contractor') {
      tenureMonths = Math.floor(rand() * 8) + 1;
    }

    let status: Employee['status'] = 'Active';
    if (shift === 'US Overlap' && employmentType === 'Contractor' && tenureMonths < 6) {
      const attrRoll = rand();
      if (attrRoll < 0.16) status = 'Exited';
      else if (attrRoll < 0.28) status = 'Notice';
    } else if (rand() < 0.02) {
      status = 'Exited';
    } else if (rand() < 0.04) {
      status = 'On Leave';
    }

    // Realistic Indian IT salaries (Basic ~50% of gross)
    const basicSalary =
      department === 'Engineering' || department === 'Data & AI'
        ? 42000 + Math.floor(rand() * 48000)
        : department === 'People & Ops' && i % 8 === 0
          ? 12500 // Junior IT admin eligible for ESIC
          : 34000 + Math.floor(rand() * 36000);
    const hra = Math.round(basicSalary * 0.4);
    const allowances = Math.round(basicSalary * 0.25);

    const state = states[i % 3];
    const joinedYear = 2026 - Math.floor(tenureMonths / 12);
    const joinedMonth = ((11 - (tenureMonths % 12) + 12) % 12) + 1;
    const joinedAt = `${joinedYear}-${String(joinedMonth).padStart(2, '0')}-04`;

    const emp: Employee = {
      id: `emp-${i}`,
      empCode: `NX-${String(1000 + i)}`,
      name,
      role,
      department,
      shift,
      employmentType,
      contractorName,
      tenureMonths,
      basicSalary,
      hra,
      allowances,
      status,
      state,
      phone: `+91 98${String(10000000 + i * 3917).slice(0, 8)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@nexorasystems.in`,
      joinedAt,
      uan: i === 18 || i === 44 ? undefined : `100${String(450000000 + i * 173)}`,
      esicNo: basicSalary + hra + allowances <= 21000 ? `31${String(10000000 + i * 97)}` : undefined,
      performance: rand() < 0.68 ? 'Good' : rand() < 0.9 ? 'Average' : 'Needs Review',
    };

    employees.push(emp);
  }

  // 14 SOW / Contractor agreements expiring within 30 days
  const contractEmployees = employees.filter(
    (e) => e.employmentType === 'Contractor' && e.status !== 'Exited'
  );
  for (let c = 0; c < Math.min(14, contractEmployees.length); c++) {
    const emp = contractEmployees[c];
    const daysRemaining = 3 + ((c * 2) % 25);
    const endDay = 27 + daysRemaining;
    const endMonth = endDay > 30 ? '12' : '11';
    const actualDay = endDay > 30 ? endDay - 30 : endDay;
    contracts.push({
      id: `ctr-${c + 1}`,
      employeeId: emp.id,
      employeeName: emp.name,
      contractorName: emp.contractorName || CONTRACTORS[0],
      department: emp.department,
      shift: emp.shift,
      startDate: emp.joinedAt,
      endDate: `2026-${endMonth}-${String(actualDay).padStart(2, '0')}`,
      daysRemaining,
      status: 'Expiring',
    });
  }

  // Attendance for November 2026 (Days 1..27)
  for (const emp of employees) {
    if (emp.status === 'Exited') continue;
    for (let day = 1; day <= 27; day++) {
      const date = `2026-11-${String(day).padStart(2, '0')}`;
      const isWeekend = (day + 6) % 7 === 0 || (day + 6) % 7 === 6; // Sat/Sun in Nov 2026
      let attStatus: AttendanceCode = 'P';
      let overtimeHours = 0;

      if (isWeekend) {
        attStatus = 'WO';
      } else {
        const r = rand();
        if (r < 0.91) {
          attStatus = 'P';
          if (rand() < 0.12) overtimeHours = Math.floor(rand() * 2) + 1;
        } else if (r < 0.96) {
          attStatus = 'L';
        } else if (r < 0.985) {
          attStatus = 'HD';
        } else {
          attStatus = 'A';
        }
      }

      attendance.push({
        employeeId: emp.id,
        date,
        status: attStatus,
        shift: emp.shift,
        overtimeHours,
      });
    }
  }

  // 7 Pending Leave Requests
  const activeEmps = employees.filter((e) => e.status === 'Active');
  const leaveTemplates: Array<{
    idx: number;
    type: LeaveRequest['type'];
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: LeaveRequest['status'];
    channel: LeaveRequest['channel'];
  }> = [
    {
      idx: 0,
      type: 'SL',
      startDate: '2026-11-28',
      endDate: '2026-11-29',
      days: 2,
      reason: 'Migraine & fever, taking 2 days rest',
      status: 'Pending',
      channel: 'WhatsApp',
    },
    {
      idx: 1,
      type: 'CompOff',
      startDate: '2026-11-30',
      endDate: '2026-11-30',
      days: 1,
      reason: 'Production v4.2 weekend release on-call support',
      status: 'Pending',
      channel: 'WhatsApp',
    },
    {
      idx: 2,
      type: 'EL',
      startDate: '2026-12-03',
      endDate: '2026-12-05',
      days: 3,
      reason: 'Family wedding in Pune',
      status: 'Pending',
      channel: 'Portal',
    },
    {
      idx: 3,
      type: 'CL',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      days: 1,
      reason: 'Passport renewal appointment at Koramangala PSK',
      status: 'Pending',
      channel: 'Portal',
    },
    {
      idx: 4,
      type: 'CL',
      startDate: '2026-12-02',
      endDate: '2026-12-03',
      days: 2,
      reason: 'Relocating apartment closer to Outer Ring Road',
      status: 'Pending',
      channel: 'Portal',
    },
    {
      idx: 5,
      type: 'SL',
      startDate: '2026-11-28',
      endDate: '2026-11-28',
      days: 1,
      reason: 'Dental surgery recovery',
      status: 'Pending',
      channel: 'Portal',
    },
    {
      idx: 6,
      type: 'EL',
      startDate: '2026-12-07',
      endDate: '2026-12-10',
      days: 4,
      reason: 'Year-end annual travel',
      status: 'Pending',
      channel: 'Portal',
    },
    {
      idx: 7,
      type: 'CL',
      startDate: '2026-11-18',
      endDate: '2026-11-19',
      days: 2,
      reason: 'Personal errands',
      status: 'Approved',
      channel: 'WhatsApp',
    },
    {
      idx: 8,
      type: 'CompOff',
      startDate: '2026-11-14',
      endDate: '2026-11-14',
      days: 1,
      reason: 'AWS migration cutover weekend',
      status: 'Approved',
      channel: 'Portal',
    },
  ];

  leaveTemplates.forEach((tpl, i) => {
    const emp = activeEmps[tpl.idx];
    if (!emp) return;
    leaves.push({
      id: `lv-${i + 1}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      shift: emp.shift,
      type: tpl.type,
      startDate: tpl.startDate,
      endDate: tpl.endDate,
      days: tpl.days,
      reason: tpl.reason,
      status: tpl.status,
      channel: tpl.channel,
      createdAt: '2026-11-26',
    });
  });

  // Payroll entries
  for (let idx = 0; idx < employees.length; idx++) {
    const emp = employees[idx];
    if (emp.status === 'Exited') continue;

    const grossBase = emp.basicSalary + emp.hra + emp.allowances;
    const overtimePay = emp.id === 'emp-12' ? 18500 : Math.round((idx % 4) * 1200);
    const gross = grossBase + overtimePay;

    const pfBase = Math.min(emp.basicSalary, 15000);
    const pfEmployee = emp.uan ? Math.round(pfBase * 0.12) : 0;
    const pfEmployer = emp.uan ? Math.round(pfBase * 0.12) : 0;

    const esiEligible = grossBase <= 21000;
    const esiEmployee = esiEligible ? Math.round(gross * 0.0075) : 0;
    const esiEmployer = esiEligible ? Math.round(gross * 0.0325) : 0;

    const pt = emp.state === 'Karnataka' || emp.state === 'Maharashtra' ? 200 : 0;
    const tds = gross > 60000 ? Math.round((gross - 55000) * 0.12) : 0;
    const netPay = gross - pfEmployee - esiEmployee - pt - tds;

    let anomalyReason: string | undefined;
    if (emp.id === 'emp-12') {
      anomalyReason = 'On-call weekend allowance (₹18,500) exceeds policy cap';
    } else if (!emp.uan) {
      anomalyReason = 'Missing EPFO UAN: ECR challan upload will fail';
    } else if (emp.id === 'emp-29') {
      anomalyReason = 'Form 12BB investment proof pending: higher TDS applied';
    }

    payroll.push({
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
      netPay,
      overtimePay,
      anomalyReason,
      anomalyResolved: false,
    });
  }

  const complianceRules: ComplianceRule[] = (complianceRulesData as ComplianceRule[]).map((r) => ({
    ...r,
  }));

  return {
    employees,
    contracts,
    attendance,
    leaves,
    payroll,
    complianceRules,
  };
}
