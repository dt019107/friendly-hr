# GSD Plan — Miro Design System Implementation (Nexora HR)

> **Source:** `Miro-design-analysis` (`design.md` provided by user)

## Phase 1: Miro Token & Surface Foundation (`src/index.css`, `index.html`, `src/components/ui/Primitives.tsx`)
- **Color Tokens (`src/index.css`):**
  - Light canvas `#ffffff`, subtle surface `#f7f8fa`, soft surface `#fafbfc`.
  - Primary `#1c1c1e` (black-pill CTAs), `brand-yellow` `#ffd02f` (wordmark badge & tag chips only), `brand-blue` `#4262ff` (links & active borders), `success-accent` `#00b473`.
  - Pastel feature tints (`#fff8e0` yellow, `#c3faf5` teal, `#fde0f0` rose, `#ffc6c6` coral) & hairlines (`#e0e2e8`, `#eef0f3`, `#c7cad5`).
  - Keep Graphite-Obsidian dark mode tokens (`#111216` / `#17181d` / `#202229`) with Miro accents.
- **Typography (`index.html`, `src/index.css`):**
  - Declare `'Roobert PRO', 'Plus Jakarta Sans', 'Noto Sans', sans-serif` (weights `400`, `500`, `600` only) + `JetBrains Mono` for `tabular-nums` INR figures.
- **Core Components (`src/components/ui/Primitives.tsx`):**
  - `Button`: Black-pill primary (`rounded-full`, `#1c1c1e` bg, `#ffffff` text), outlined pill secondary (`rounded-full`, `1px solid #c7cad5`), `brand-blue` / `brand-yellow` variants, and `ghost`.
  - `Badge`: `rounded-full` pill tags (`badge-tag-yellow`, `badge-tag-purple`, `badge-tag-coral`, `badge-success`, `neutral`).
  - `Card`: `rounded-2xl` (`16px`) with `1px solid` hairline-soft border + pastel `tone` prop (`default`, `yellow`, `teal`, `rose`, `coral`) with `rounded-[28px]` for feature highlights.

## Phase 2: Navigation & Shell (`src/components/layout/AppShell.tsx`)
- Canary-yellow `#ffd02f` `NX` brand mark with `#1c1c1e` ink on white `#ffffff` sidebar.
- Pill-style active navigation state (`#1c1c1e` text on `#f7f8fa` or black-pill `#1c1c1e` primary) and Miro `search-pill` (`40px`, `#f7f8fa`, `#e0e2e8` border) in the topbar.

## Phase 3: Apply Miro System Across All 7 Screens
- **`HomeScreen.tsx`:** Pastel-tinted KPI / Priority Action highlights (yellow, teal, rose, coral) paired with crisp white cards, Miro `#4262ff` + `#0fbcb0` + `#ffd02f` + `#ff9999` chart palette, and black-pill primary actions.
- **`EmployeesScreen.tsx`, `AttendanceScreen.tsx`, `PayrollScreen.tsx`, `ComplianceScreen.tsx`, `MobileEmployeeScreen.tsx`, `OnboardingScreen.tsx`:** Apply Miro `comparison-table` hairlines, `pill-tab` / `pill-tab-active` filters, `44px` `text-input` styling, and `rounded-full` CTAs consistently across every screen.

## Phase 4: Build Verification
- Run `npm run build` (`tsc -b && vite build`) to confirm 0 errors.
