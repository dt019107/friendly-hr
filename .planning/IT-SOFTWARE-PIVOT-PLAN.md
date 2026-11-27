# GSD Plan — Pivot ShramFlow HR to IT & Software Company

> **Constraint:** Keep the exact current design, layout, structure, sections, and interactive features intact. Replace all manufacturing domain content with authentic Indian IT & Software company HR data.

## Phase 1: Types, State Rules & IT Seed Data (`src/types/hr.ts`, `src/data/complianceRules.json`, `src/data/seed.ts`)
- **Company & Tech Hubs:** `Nexora Systems Pvt Ltd` across `Karnataka (Bengaluru)`, `Haryana (Gurugram Cyber City)`, and `Maharashtra (Pune Hinjewadi)`.
- **Departments:** `Engineering`, `Product`, `Design`, `QA & DevOps`, `Data & AI`, `People & Ops`.
- **Work Modes (replacing Shifts):** `Hybrid`, `Remote`, `US Overlap`.
- **Employment Types:** `Full-Time`, `Contractor` (SOW/consulting vendors: `Apex Tech Consultants`, `Vanguard Cloud Staffing`, `Deccan IT Talent`, `NovaSoft Contractors`).
- **Deliberate IT Patterns (200 Employees):**
  - `US Overlap` contractor churn (`< 6 months` tenure) triggering the Attrition insight & "Schedule 1:1 stay interviews" action.
  - 14 SOW / contractor agreements expiring within 30 days.
  - 7 pending leave requests (Casual, Sick, Earned, Comp-Off for release weekend) with 2 via WhatsApp/Slack.
  - IT compensation (`₹45k–₹2.4L/mo` gross), TDS deductions, and 4 payroll anomalies (Missing UAN/PAN, Variable Bonus crossing ESIC ceiling, Weekend Release On-Call payout > cap, Pending Form 12BB).
- **State-Wise IT Compliance Rules (`complianceRules.json`):**
  - **Karnataka (Bengaluru):** EPFO ECR, ESIC, Karnataka PT (₹200/mo for salary ≥ ₹25,000), Karnataka Shops & Establishments / POSH Annual Return.
  - **Haryana (Gurugram):** EPFO ECR, ESIC, Haryana LWF (0.2% cap ₹31), Haryana Shops & Commercial Establishments Night/US-Shift Exemption.
  - **Maharashtra (Pune):** EPFO ECR, ESIC, Maharashtra PT (₹200/mo, ₹300 in Feb), Maharashtra LWF.

## Phase 2: Store, Insights & Shell Copy (`src/store/useHRStore.ts`, `src/lib/insights.ts`, `src/components/layout/AppShell.tsx`)
- Update Zustand store defaults, `insights.ts` rule-based driver explanations (`US Overlap` churn, sprint/release leave impact, SOW renewals), and `AppShell.tsx` state selector (`KA · Bengaluru`, `HR · Gurugram`, `MH · Pune`) and role descriptions.

## Phase 3: Screens Content Replacement (Keep Exact Layout & Features)
- **`HomeScreen.tsx`:** IT KPIs, Payroll Split donut, Compliance Target gauge, Engineering/Contractor Watchlist, Priority Actions.
- **`EmployeesScreen.tsx`:** IT role directory, department/work-mode filters, sample messy IT CSV (`Full Name,Dept,Work_Mode,Type,Monthly Basic,Phone,State`).
- **`AttendanceScreen.tsx`:** Monthly attendance grid for Engineering/Product/QA squads, WhatsApp/Slack approval modal, Comp-Off / EL / SL / CL requests.
- **`PayrollScreen.tsx`:** Department cost breakdown in ₹ Lakhs, TDS/PF/ESIC/PT totals, IT payroll anomalies.
- **`ComplianceScreen.tsx`:** IT statutory compliance calendar & register (PT, PF, ESI, Shops & Establishments, LWF) for KA / HR / MH.
- **`MobileEmployeeScreen.tsx` & `OnboardingScreen.tsx`:** Software engineer self-service (payslip, UAN/Form 12BB notice, US-overlap cab/allowance notice) and 15-min IT company setup wizard.

## Phase 4: Verification
- Run `npm run build` (`tsc -b && vite build`) to confirm zero TypeScript or bundle errors.
