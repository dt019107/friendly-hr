# GSD Figma Design Plan — ShramFlow HR (Non-Dashboard Screens)

## Phase 1: File & Token Foundation
- Create a new Figma Design file (`ShramFlow HR — Operations & Mobile`) using `create_new_file`.
- Create Light/Dark color variables (`bg-canvas`, `bg-surface`, `bg-raised`, `text-primary`, `text-secondary`, `text-muted`, `accent`, `success`, `warning`, `danger`) and spacing/radius variables from `src/index.css`.
- Build core `Button`, `Badge`, and `Card` component sets in Figma.

## Phase 2: Operations & Mobile Screens
- Generate desktop (`1440×900`) frames for:
  - Employees Directory & 3-Step CSV Import Wizard
  - Attendance Grid & WhatsApp Approval Modal
  - Payroll Summary & Anomalies
  - State-wise Compliance Calendar (UP / Delhi / Haryana)
- Generate mobile (`390×844`) frame for Employee Self-Service + 15-Min Onboarding Wizard.

## Phase 3: FigJam Architecture & Demo Flow
- Generate a FigJam flowchart (`generate_diagram`) for the 7-step demo workflow and Leave Approval → Attendance Sync state flow.
