# GSD Plan — Production-Ready End-to-End Audit & Hardening (Nexora HR)

## Audit Findings (Read-Only Inspection)

### 1. Functional & Logic Gaps
- **`EmployeesScreen.tsx` Search Conflict & CSV Edge Cases:**
  - `externalSearch || localSearch` prevents editing the local search input whenever `externalSearch` is non-empty.
  - Uploading an empty or header-only `.csv` file transitions to Step 2 with 0 rows and no inline error message.
  - Profile Slide-Over Drawer lacks `Escape`-key dismissal and `role="dialog"` / `aria-modal="true"`.
- **`AttendanceScreen.tsx` & `MobileEmployeeScreen.tsx` Form Validation:**
  - `endDate` input has no `min={startDate}` constraint, allowing inverted date ranges (`endDate < startDate`).
  - Whitespace-only leave `reason` can bypass HTML `required`.
  - Leave Approval Queue lacks an explicit empty state when `leaves.length === 0`.
- **`AppShell.tsx` Mobile Drawer:**
  - Mobile navigation drawer lacks `Escape`-key close and `role="dialog"` / `aria-modal="true"`.

### 2. Code Quality & Performance
- **Unused Symbols (`tsc --noEmit --noUnusedLocals --noUnusedParameters`):**
  - `src/App.tsx:1` — unused `React` default import
  - `src/data/seed.ts:35` — unused `DEPARTMENTS` constant
  - `src/store/useHRStore.ts:312` — unused `state` parameter in `completeOnboarding`
- **Large Single JS Bundle (`942.14 kB`):**
  - `vite.config.ts` lacks `manualChunks` (`vendor-react`, `vendor-charts`, `vendor-motion`) and `App.tsx` loads all 7 screens eagerly instead of lazy-loading secondary screens with `Suspense` + loading skeleton.

### 3. UI/UX, Responsiveness & Accessibility (WCAG)
- Missing `aria-live="polite"` / `role="status"` on dynamic filter result counts and missing `focus-visible` rings on several secondary `<select>` and `<input>` controls.
- `tsconfig.json` has `noUnusedLocals: false` and `noUnusedParameters: false`, hiding dead code during builds.

### 4. Production Readiness
- **No Error Boundary:** A runtime error in any chart or screen crashes the app to a blank screen with no recovery path.
- **Missing Meta Tags:** `index.html` lacks `<meta name="description">` and `<meta name="theme-color">`.

---

## Phase 2 Execution Milestones (Pending Approval)

- **Milestone 1 — Code Quality & Error Boundary:**
  - Add `src/components/ui/ErrorBoundary.tsx` wrapping `App` with a clean recovery UI + "Reset Demo Data" fallback.
  - Enable `noUnusedLocals: true` & `noUnusedParameters: true` in `tsconfig.json` and fix all 3 TypeScript warnings.
- **Milestone 2 — Functional & Validation Fixes:**
  - Unify `globalSearch` + `localSearch` in `EmployeesScreen.tsx`, add CSV validation error state, and add `Escape` + `role="dialog"` to the Profile Drawer and `AppShell.tsx` mobile drawer.
  - Add `min={startDate}` + trimmed `reason` validation in `AttendanceScreen.tsx` and `MobileEmployeeScreen.tsx`, plus empty states.
- **Milestone 3 — Performance & Production Build:**
  - Configure `build.rollupOptions.output.manualChunks` in `vite.config.ts` and `React.lazy` + skeleton fallback in `App.tsx` to eliminate the >500 kB chunk warning.
  - Add SEO `<meta name="description">` & `<meta name="theme-color">` in `index.html`.
  - Run `tsc -b && vite build` and verify 0 errors and clean chunking.
