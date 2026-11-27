# GSD Plan — Framer-Grade Editorial Redesign (ShramFlow HR)

## Diagnosis: Why It Still Feels AI-Generated
1. **Identical Box Repetition:** Every section uses the same `rounded-2xl border p-5` white card, creating a heavy "template grid" feel instead of an airy, editorial workspace.
2. **Loud Chrome & Decorative Tints:** Corner mosaics, colored circular icon backgrounds, and tinted pill badges compete with the actual numbers and actions.
3. **Loose Typography:** Headings and KPI figures lack tight display tracking (`-0.02em`), and 13px/12px hierarchy isn't sharp enough.

## GSD Execution Phases

### Phase 1: Neutral Zinc Palette & Framer Surface System (`src/index.css`, `src/components/ui/Primitives.tsx`)
- Shift from generic cool-blue-grey (`#f4f7fb`) to crisp **neutral zinc/graphite** (`#fafafa` canvas, `#ffffff` elevated sheet, `rgba(9,9,11,0.07)` hairlines in light mode; `#09090b` canvas, `#111113` sheet, `rgba(255,255,255,0.08)` hairlines in dark mode).
- Replace puffy `rounded-2xl` shadows with sharp `rounded-xl` (`12px`) hairlines and `0 1px 2px rgba(0,0,0,0.03)` micro-elevation.
- Make `Badge` ultra-quiet: `6px` dot + plain text or `bg-zinc-100` / `dark:bg-white/[0.06]` subtle chip.

### Phase 2: Minimalist Rail & Topbar (`src/components/layout/AppShell.tsx`)
- Narrow `232px` sidebar on `#fafafa` / `#09090b` with `32px` nav rows, `15px` icons (`strokeWidth={1.5}`), and a quiet active state (`bg-zinc-900 text-white` in light mode or subtle `bg-black/[0.05]` with crisp `#09090b` text).
- Clean `56px` topbar with breadcrumb context, `⌘K`-style search input, state selector, and minimal theme toggle.

### Phase 3: Editorial Home Dashboard (`src/components/screens/HomeScreen.tsx`)
- **Inline Metric Strip:** 4 metrics inside one unified horizontal container separated by `1px` vertical hairlines (Vercel/Stripe/Framer style) — no corner mosaics, no colored icon circles.
- **Hero Chart + Priority Action Feed:** 2/3-width clean Recharts Area/Bar chart (smooth line/area or crisp bars, muted grid, mono ticks) + 1/3-width Priority Action Feed (`divide-y`, 1-click Resolve / Approve / Mark Filed).
- **Shop-Floor Watchlist:** Clean table-list with subtle hover states and inline `Renew` actions.

### Phase 4: Polish Secondary Screens & Build Check
- Apply the exact same `13px` table density, hairline dividers, and tight `-0.02em` heading tracking across `ComplianceScreen.tsx`, `EmployeesScreen.tsx`, `AttendanceScreen.tsx`, and `PayrollScreen.tsx`.
- Run `npm run build` (`tsc -b && vite build`) to verify 0 errors.
