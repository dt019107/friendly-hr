# GSD Unslop Plan — ShramFlow HR

## Phase 0: Unslop Audit (from `unslop/references/signs.md`)

### 1. Surfaces, Color & Decorative Filler
- **Decorative corner mosaics & multi-colored icon circles** in `src/components/screens/HomeScreen.tsx` (4 KPI cards each have a 2x2 colored corner tile `bg-blue-500/10`, `bg-emerald-500/10`, `bg-indigo-500/10`, `bg-cyan-500/10` and 4 different colored icon circles). Fix: remove corner mosaics and colored icon circles; keep stat cards clean (label, tabular figure, change vs comparison).
- **Multi-hue donut chart** in `src/components/screens/HomeScreen.tsx` (`DONUT_COLORS` uses 4 saturated hues `#4f6ef7`, `#10b981`, `#8b5cf6`, `#f59e0b`). Fix: use one cobalt accent (`#4f6ef7`) for the primary series and neutral ramp steps for the rest.
- **Two circular charts side-by-side** in `src/components/screens/HomeScreen.tsx` (Payroll Split Donut + Compliance Target Semi-Gauge). Fix: keep one main chart (2/3 width) and a narrower ranked list / compliance status block (1/3 width) so hierarchy is clear.

### 2. Icons & Badges
- **Sparkle AI icon** (`<Sparkles />`) in `src/components/screens/HomeScreen.tsx` on the Insight Modal primary CTA. Fix: remove `<Sparkles />` and use a plain label or `ArrowRight`.
- **Inconsistent icon stroke widths** (`1.75` in `HomeScreen.tsx` & `Toaster.tsx`, `1.5` in `AppShell.tsx`, default `2` in other screens). Fix: standardize Lucide icons to `16px` (`h-4 w-4`) with `strokeWidth={1.5}` and text-role color.
- **Full-pill badges everywhere** (`rounded-full` in `src/components/ui/Primitives.tsx` `Badge`). Fix: use nested radius `rounded-md` (`6px`) for tags/badges so not everything is a pill.
- **Unicode checkmarks in strings** (`Imported ✓` in `OnboardingScreen.tsx`, `✓ Filed on` in `ComplianceScreen.tsx`). Fix: replace with plain text or a `16px` `Check` icon.

### 3. Type, Copy & Spacing
- **Arbitrary pixel values** (`text-[10px]`, `text-[11px]`, `max-w-[150px]`, `max-w-[160px]`, `max-w-[420px]`, `max-w-[220px]`) across `AppShell.tsx`, `HomeScreen.tsx`, `EmployeesScreen.tsx`, `AttendanceScreen.tsx`, `MobileEmployeeScreen.tsx`. Fix: snap to the 4px spacing scale and standard `text-xs` (`12px`) minimum.
- **Weight 600 overuse** on headings and card figures. Fix: use `font-medium` (`500`) for card figures and section headings, reserving `600` only for the brand/page title.

### 4. Motion
- **Card hover lift** (`hover:-translate-y-0.5` in `HomeScreen.tsx`). Fix: remove card translation on hover; use quiet border/surface step.
- **`transition-all`** in `ComplianceScreen.tsx` risk bar. Fix: replace with `transition-[width,background-color]` or `transition-colors` / `transition-transform`.

---

## 5-Line Direction
- **Product:** ShramFlow HR — workforce, shift attendance, payroll, and statutory compliance operations for Indian manufacturing plants.
- **Character:** Calm, exact, operational.
- **World:** Factory floor & compliance ledger — slate-tinted neutrals (`#f4f7fb` light / `#0b0d14` dark) with one cobalt accent (`#4f6ef7` / `#5c7cfa`).
- **Moments:** (1) The department payroll & headcount bar/donut chart with real INR figures, and (2) the state-wise compliance ledger (UP / Delhi / Haryana) with live risk score.
- **Signature:** A 4px status dot paired with `JetBrains Mono` `tabular-nums` figures for shift, INR, and compliance counts.

---

## GSD Execution Passes (In Order)
- **Pass 1 — Spacing & Layout Hierarchy:** Remove arbitrary `[*px]` sizes; replace duplicate circular charts in `HomeScreen.tsx` with 1 main chart (2/3) + 1 narrower watchlist/ranked list (1/3).
- **Pass 2 — Color & Surfaces:** Remove KPI corner mosaics and colored icon circles; unify chart palette to 1 accent + neutral steps; update `Badge` to `rounded-md`.
- **Pass 3 — Icons:** Remove `<Sparkles />` and unicode `✓`; standardize all Lucide icons to `strokeWidth={1.5}`.
- **Pass 4 — Copy & Type:** Standardize weights (`400`/`500`), ensure every trend shows its comparison, and enforce `text-xs` (`12px`) minimum.
- **Pass 5 — Motion & Final Build Check:** Remove `hover:-translate-y-0.5` and `transition-all`; run `npm run build` (`tsc -b && vite build`) to verify 0 errors.
