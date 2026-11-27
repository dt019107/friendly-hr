# GSD Scoped Unslop Plan — Non-Dashboard Screens

> Scope: All screens and shared chrome **except** `src/components/screens/HomeScreen.tsx` (which keeps the CreatiHR-style reference layout).

## Phase 1: Shell & Shared Primitives
- **`src/components/ui/Primitives.tsx`**: Use nested radius (`rounded-md`) on `Badge`; `font-medium` (500) on modal titles.
- **`src/components/ui/Toaster.tsx`**: Standardize Lucide icon strokes to `strokeWidth={1.5}`.

## Phase 2: Operations Screens
- **`src/components/screens/EmployeesScreen.tsx`**: Replace arbitrary `max-w-[140px]` with `max-w-36`, normalize headings to `font-medium`, unify `strokeWidth={1.5}`.
- **`src/components/screens/AttendanceScreen.tsx`**: Standardize `strokeWidth={1.5}` and `font-medium` headings.
- **`src/components/screens/PayrollScreen.tsx`**: Use `font-medium` for figures/headings, single cobalt accent (`var(--accent)`) + neutral slate (`#94a3b8`) on Department Cost Breakdown, and `tabular-nums` INR formatting.
- **`src/components/screens/ComplianceScreen.tsx`**: Replace unicode `✓ Filed on` with `<CheckCircle2 strokeWidth={1.5} />`, normalize headings to `font-medium`.

## Phase 3: Self-Service, Setup & Build Verification
- **`src/components/screens/MobileEmployeeScreen.tsx`**: Normalize headings/figures to `font-medium`, unify `strokeWidth={1.5}`.
- **`src/components/screens/OnboardingScreen.tsx`**: Replace `'Imported ✓'` with `'Imported'`, normalize headings to `font-medium`, unify `strokeWidth={1.5}`.
- **Verify**: Run `npm run build` (`tsc -b && vite build`) with 0 errors.
