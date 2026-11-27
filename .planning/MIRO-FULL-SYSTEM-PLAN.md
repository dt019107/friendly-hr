# GSD Plan — Full Miro Design System Rollout (Every Section & Feature)

> **Goal:** Apply every token and component pattern from `Miro-design-analysis` (`design.md`) across 100% of screens, sections, modals, inputs, charts, and tables.

## Phase 1: Input, Tab & Table Primitives (`src/components/ui/Primitives.tsx`, `src/components/ui/Toaster.tsx`)
- Add `Input` (`44px` height, `rounded-lg`, `1px solid #c7cad5`, `2px solid #4262ff` focus ring) and `Select` (`filter-dropdown` / `text-input`) styles.
- Update `Toaster.tsx` to Miro `rounded-2xl` surface with `#00b473` success, `#ffd02f` warning, and `#4262ff` info accents.

## Phase 2: Shell & Home (`AppShell.tsx`, `HomeScreen.tsx`)
- **`AppShell.tsx`:** Style topbar search as Miro `search-pill` (`40px` height, `#f7f8fa` bg, `rounded-lg`, `#e0e2e8` border), state selector as `filter-dropdown` (`rounded-full`, `#c7cad5` border), and notification bell as `button-icon-circular` (`36×36px`, `rounded-full`).
- **`HomeScreen.tsx`:** Apply Miro `comparison-table` hairlines (`#eef0f3`) to the Contractor SOW Watchlist and `#ffd02f` / `#4262ff` / `#00b473` semantic indicators across all 4 KPI cards.

## Phase 3: Directory, Attendance & Payroll (`EmployeesScreen.tsx`, `AttendanceScreen.tsx`, `PayrollScreen.tsx`)
- **`EmployeesScreen.tsx`:** Apply `44px` `text-input` + `filter-dropdown` controls, `comparison-table` rows, `rounded-full` pagination & CSV wizard step pills (`pill-tab` / `pill-tab-active`), and `card-feature-yellow` / `card-feature-teal` accents in the Profile Drawer.
- **`AttendanceScreen.tsx`:** Style Leave Queue items with Miro `card-base` / pastel accents, `pill-tab` department/work-mode filters, `44px` form inputs in New Leave Modal, and Miro `rounded-2xl` WhatsApp Approval Modal.
- **`PayrollScreen.tsx`:** Apply `#4262ff` (Net Pay) + `#0fbcb0` (Statutory) bar chart palette, pastel `card-feature-yellow` / `card-feature-coral` highlight for anomalies, and `comparison-table` styling.

## Phase 4: Compliance, Mobile Self-Service & Onboarding (`ComplianceScreen.tsx`, `MobileEmployeeScreen.tsx`, `OnboardingScreen.tsx`)
- **`ComplianceScreen.tsx`:** Style the priority exposure banner with Miro `pricing-card-featured` (`#f5f3ff` bg + `2px solid #4262ff` border) or `card-feature-coral` when overdue, `pill-tab` area filters, and Miro `comparison-table` register.
- **`MobileEmployeeScreen.tsx`:** Apply Miro `cta-banner-dark` (`#1c1c1e` dark card with `#ffd02f` badge) for the Payslip hero card, `card-feature-teal` for the Compliance Notice, `44px` inputs for Apply Leave, and `rounded-full` submit button.
- **`OnboardingScreen.tsx`:** Style stepper with `pill-tab` / `pill-tab-active`, `44px` inputs, and `card-feature-yellow` / `card-feature-teal` selection tiles.

## Phase 5: Build Verification
- Run `npm run build` (`tsc -b && vite build`) to confirm 0 errors.
