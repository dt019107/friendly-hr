# GSD Plan — Premium Dark Theme & Unslop Polish (Nexora HR)

## Phase 1: Premium Dark Mode Ramp & Surface Depth (`src/index.css`, `src/components/ui/Primitives.tsx`)
- **Graphite-Obsidian Dark Ramp** (from `unslop/references/tokens.md`):
  - `--bg-sidebar`: `#0c0d10` (deepest surface)
  - `--bg-canvas`: `#111216` (rich neutral obsidian canvas)
  - `--bg-surface`: `#17181d` (elevated card surface)
  - `--bg-raised`: `#202229` (inputs, active rows, secondary buttons)
  - `--border-hairline`: `rgba(237, 237, 237, 0.08)`
  - Text roles: `#ededed` primary, `#a1a1a6` secondary, `#7c7c85` muted.
- **Tactile Dark Depth:** Add `inset 0 1px 0 rgba(255, 255, 255, 0.05)` top hairline highlight on `.dark .card-elevated` so cards separate cleanly from the canvas without heavy drop-shadows.
- **Nested Radius:** Update `Badge` in `Primitives.tsx` from `rounded-full` to `rounded-md` (`6px`).

## Phase 2: Unslop Pass on Home & Chrome (`src/components/screens/HomeScreen.tsx`, `src/components/layout/AppShell.tsx`)
- **Remove KPI Corner Mosaics & Rainbow Icon Circles:** Remove the 2×2 corner tile decorations and 4 separate colored icon backgrounds; keep clean monochrome/accent-tinted icon badges and `tabular-nums` figures.
- **Remove AI Sparkle & Card Jump:** Remove `<Sparkles />` from the Insight modal CTA and remove `hover:-translate-y-0.5` from KPI cards.
- **Cohesive Chart Palette:** Update `Payroll Split` donut colors to lead with cobalt accent (`#4f6ef7`) + neutral slate steps (`#64748b`, `#94a3b8`, `#475569`) instead of 4 competing neon hues.
- **Uniform Icon Strokes:** Standardize Lucide icons to `strokeWidth={1.5}`.

## Phase 3: Dark Mode Contrast Check & Build Verification
- Verify dark mode contrast on `ComplianceScreen.tsx` calendar cells, `AttendanceScreen.tsx` grid & WhatsApp modal, and `MobileEmployeeScreen.tsx`.
- Run `npm run build` (`tsc -b && vite build`) to verify zero errors.
