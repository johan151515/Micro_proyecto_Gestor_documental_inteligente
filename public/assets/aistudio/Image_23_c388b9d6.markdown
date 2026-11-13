---
name: DocuMind Enterprise
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#adc6ff'
  on-tertiary: '#002e6a'
  tertiary-container: '#005cc6'
  on-tertiary-container: '#cedbff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  label-mono-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.5rem
  margin: 1.5rem
  margin-mobile: 0.75rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system targets enterprise teams handling high-throughput document verification, intelligent OCR parsing, and AI narrative synthesis. The aesthetic blends the dense utility of Linear, the precision and financial rigor of Stripe Dashboard, and the calm structural clarity of Notion.

### Visual Aesthetic & Philosophy
- **Style:** Modern Enterprise Precision. Dark slate navy base paired with razor-sharp surface contrasts, micro-hairlines (`1px`), and structured typographic hierarchies.
- **Density:** High-density, data-first. Every viewport pixel serves context, synthesis status, or execution workflows without superfluous visual noise.
- **Emotion:** Analytical confidence, speed, institutional reliability, and algorithmic precision.

## Colors

The palette operates in a native dark environment designed for prolonged visual focus during complex document review sessions.

### Functional Tones
- **Primary (`#4f46e5` - Indigo-600):** System anchors, primary actions, selected document tabs, AI extraction triggers, active pipeline nodes.
- **Success (`#10b981` - Emerald-600):** Completed OCR extractions, validated legal clauses, high-confidence AI summaries.
- **Processing (`#3b82f6` - Blue-500):** Real-time neural processing, streaming transcription tokens, active background sync.
- **Warning / Review (`#f59e0b` - Amber-500):** Low-confidence OCR flags, schema mismatches needing human-in-the-loop audit.
- **Critical / Error (`#ef4444` - Rose-500):** Corrupt uploads, failed signature verifications, rate/quota limit breaches.

### Surface Tiers
- **Canvas Base (`#0b0f19`):** Lowest layer, framing the application shell and side navigation.
- **Surface Level 1 (`#0f172a`):** Main dashboard panel, data grids, and workspace backdrops.
- **Surface Level 2 (`#1e293b`):** Data cards, popovers, contextual inspectors, and hovering split-views.
- **Border Hairlines (`#334155` at 40% to 60% opacity):** Structural dividers that replace heavy drop shadows.

## Typography

The type system prioritizes micro-legibility at compact scales. 

- **Primary Typeface (Inter):** Leveraged for all navigation, headings, metadata, and core synthesized outputs. Numerical values utilize tabular figures (`tnum`, `cv05`) across data tables.
- **Technical Monospace (JetBrains Mono):** Dedicated to OCR confidence percentages, raw JSON schemas, entity anchors, token tallies, and document cryptographic hashes.

## Layout & Spacing

This system utilizes a compact, split-view workbench model:
- **Workspace Split Layout:** A collapsible tree navigation sidebar (fixed 240px or 64px icon rail), a fluid list or data table index, and a resizable secondary inspect/synthesis panel (min 380px, max 600px).
- **Rhythm:** Spacing follows a dense 4px grid. Standard table cell vertical padding is held strictly at `space-xs` (4px) to `space-sm` (8px) to maximize row visibility without scrolling.
- **Breakpoints:**
  - `Desktop (>1280px)`: Full 3-pane workbench (Nav, Registry Table, Live Split-Screen Document/AI Inspector).
  - `Tablet (768px - 1279px)`: Sidebar collapses to rail icon mode; Synthesis Inspector slides out as an overlay drawer.
  - `Mobile (<767px)`: Single-column linear layout. Tables convert to dense card stacks; document OCR review defaults to paginated tab panels.

## Elevation & Depth

Visual separation relies primarily on sharp tonal layering and 1px borders rather than heavy blur shadows, maintaining a clean, technical appearance.

- **Level 0 (App Shell/Base):** Solid `#0b0f19`.
- **Level 1 (Data Grids & Primary Surfaces):** `#0f172a` bordered by `1px solid rgba(255, 255, 255, 0.08)`.
- **Level 2 (Popovers, Flyout Menus, Floating Toolbars):** `#1e293b` with a crisp `1px solid rgba(255, 255, 255, 0.12)` and a muted directional shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.45)`.
- **Level 3 (Modal Dialogs & Command Bar):** `#1e293b` resting above a backdrop blur mask (`rgba(11, 15, 25, 0.8)` with `backdrop-filter: blur(8px)`), framed with a subtle top highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.15)`).
- **Interactive Focus States:** Active or focused panels gain an outline highlight of `1px solid #4f46e5` accompanied by an ambient edge glow: `box-shadow: 0 0 0 1px #4f46e5, 0 0 12px rgba(79, 70, 229, 0.25)`.

## Shapes

The geometric framework favors subtle rounding (`roundedness: 1`, 4px default) to mirror professional IDEs and financial dashboards.

- **Buttons, Inputs, and Table Rows:** `rounded` (4px).
- **Panels, Modals, and Main Grid Containers:** `rounded-lg` (8px).
- **Status Indicators & Pill Badges:** Full pill radius (`rounded-full` / `9999px`) to create distinction between square functional UI elements and metadata indicators.

## Components

### Buttons
- **Primary:** Background `#4f46e5`, text `#ffffff`, hover `#4338ca`. Single-pixel inset top border (`rgba(255, 255, 255, 0.2)`). Height: 32px for data toolbars; 36px for primary calls to action.
- **Secondary / Ghost:** Transparent surface with `1px solid rgba(255, 255, 255, 0.12)`, text `#94a3b8`, hover background `rgba(255, 255, 255, 0.05)`, hover text `#ffffff`.
- **Destructive:** Background `rgba(239, 68, 68, 0.1)`, text `#f87171`, border `1px solid rgba(239, 68, 68, 0.2)`.

### High-Density Data Tables
- **Header:** Sticky top, height 32px, text `label-mono-xs` uppercase `#64748b`, background `#0f172a`, bottom border `1px solid rgba(255, 255, 255, 0.06)`.
- **Rows:** Height 36px (compact) to 44px (spacious). Alternating hover effect: `background: rgba(255, 255, 255, 0.02)`. Selected row: `background: rgba(79, 70, 229, 0.08)`, left border indicator `2px solid #4f46e5`.
- **Cells:** Numeric and technical values rendered in `JetBrains Mono` (`label-mono-sm`) with `font-variant-numeric: tabular-nums`.

### Status Badges (Pills)
Full-pill container (`rounded-full`), height 20px, horizontal padding 8px.
- **Success (Validated):** Background `rgba(16, 185, 129, 0.12)`, text `#34d399`, border `1px solid rgba(16, 185, 129, 0.25)`.
- **Processing (AI Parsing):** Background `rgba(59, 130, 246, 0.12)`, text `#60a5fa`, border `1px solid rgba(59, 130, 246, 0.25)`. Features a 6px pulsing dot (`#3b82f6`).
- **Warning (Low Confidence):** Background `rgba(245, 158, 11, 0.12)`, text `#fbbf24`, border `1px solid rgba(245, 158, 11, 0.25)`.
- **Error (Extraction Failed):** Background `rgba(239, 68, 68, 0.12)`, text `#f87171`, border `1px solid rgba(239, 68, 68, 0.25)`.

### Input Fields & Search Bars
- **Style:** Height 32px or 36px, background `#0b0f19`, border `1px solid rgba(255, 255, 255, 0.1)`. Focus: border `#4f46e5`, box-shadow `0 0 0 1px #4f46e5`.
- **Command Palette (`Cmd+K`):** Centered floating overlay, width 640px, inline search input with instant schema/document fuzzy filtering.

### Checkboxes & Radios
- Size: 14px x 14px, corner radius 3px (`rounded-sm`).
- Unchecked: `1px solid rgba(255, 255, 255, 0.2)` over transparent background.
- Checked: `#4f46e5` background with a crisp white 1.5px checkmark icon.

### Synthesis & OCR Inspection Cards
- Side-by-side inspection blocks: source PDF scan preview on the left with interactive bounding-box highlights; extracted JSON keys and AI summary nodes on the right.
- Highlighting markers: translucent overlays matching the status hue (e.g., `rgba(79, 70, 229, 0.2)` with `1px solid #4f46e5`).