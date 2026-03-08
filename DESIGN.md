# BlindLane Design System

> Brutalist black-and-white aesthetic with hard borders, offset shadows, and serif typography.

---

## Design Direction

BlindLane uses a **brutalist visual system** built on shadcn/ui primitives with zero border-radius, 2px hard borders, offset box shadows, and Noto Serif/Sans typography.

Core principles:
1. Editor-first workflow remains the primary interaction model.
2. Arena remains embedded in workspace, not a separate product.
3. Zero border-radius everywhere (sole exception: Switch for usability).
4. High-contrast black-and-white palette with highlight accent colors.
5. Typography: uppercase tracking-heavy labels, serif headings, sans body.

---

## Typography

| Role | Font | Weight | Style |
|------|------|--------|-------|
| Headings | Noto Serif | 900 (black) | uppercase, tight tracking |
| Body | Noto Sans | 400-600 | normal |
| Labels | Noto Sans | 900 (black) | `text-[10px] uppercase tracking-[0.2em]` |
| Buttons | Noto Sans | 900 (black) | `text-xs uppercase tracking-widest` |
| Code/mono | JetBrains Mono | 400 | normal |

---

## Colors

### Base Tokens (CSS variables)
- Light: `--background: #f6f7f8`, `--foreground: #040e19`
- Dark: `--background: #0a0c10`, `--foreground: ~95% slate`
- Borders: slate-900 (light) / slate-800 (dark) -- strong, visible

### Highlight Accents
| Name | Hex | Use |
|------|-----|-----|
| `highlight-hook` | `#FFFFE0` | Top pick badges, primary callouts |
| `highlight-impact` | `#E0FFE0` | Runner-up badges, success states |
| `highlight-cta` | `#E0F0FF` | Action callouts |

---

## Borders and Shadows

- All components: `border-2 border-slate-900 dark:border-slate-800`
- Cards: `brutalist-shadow` (4px 4px 0px black / dark: #1e293b)
- Dialogs, dropdowns, select content: `brutalist-shadow`
- Dashed borders for empty/draft states: `border-2 border-dashed`
- No rounded corners anywhere except Switch (`rounded-full`)

---

## Component Patterns

### Buttons
- Default: solid primary with `hover:invert`, border-2
- Outline: border-2 with transparent background
- All: `text-xs font-black uppercase tracking-widest`

### Cards
- `border-2 border-slate-900 dark:border-slate-800 brutalist-shadow`
- No rounded corners

### Badges
- Square (no rounded), `border-2`, `font-black uppercase tracking-wider`
- Variants: default, secondary, destructive, outline, hook, impact, cta

### Tables
- Outer border-2 wrapper
- Header: `bg-primary text-primary-foreground`, `border-b-2`
- Head cells: `text-xs font-black uppercase tracking-wider`

### Inputs/Textareas
- `border-2 border-slate-900 dark:border-slate-800`

### Progress Bars
- No rounded corners on track or fill

### Separator
- `h-[2px]` for visibility

---

## Page Patterns

### Headings
- `font-serif text-4xl font-black tracking-tight uppercase`
- Left accent: `border-l-4 border-primary pl-6`

### Section Labels
- `text-[10px] font-black uppercase tracking-[0.2em] text-slate-400`

### Layout
- Max width: `max-w-[1600px]`
- Header: `border-b-2`, no backdrop-blur
- Footer: `border-t-2`
- Logo: square bg-primary box + `font-serif text-xl font-black tracking-tighter uppercase italic`

---

## Anti-Patterns (Do Not Reintroduce)

- `rounded-*` classes (except Switch)
- `backdrop-blur` on header
- Thin `border` (always use `border-2`)
- `shadow` or `shadow-md` (use `brutalist-shadow` utility)
- Soft/gradient backgrounds
- Legacy terminal-* classes

---

## Reference

- shadcn/ui docs: [https://ui.shadcn.com](https://ui.shadcn.com)
- BlindLane routes: workspace (`/`), leaderboard (`/leaderboard`), about (`/about`), admin (`/admin/*`)
