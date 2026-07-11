# Design System Refresh — Design Doc

Date: 2026-07-12

## Purpose

Replace the current portfolio site's visual identity (fonts + color palette) with a
design system referenced from https://planner.amysteriousbeaver.com/, applied
site-wide (not just a few sections).

## Reference source

- Fonts: `Newsreader` (serif body), `Fraunces` (display/headings), `JetBrains Mono` (mono/labels)
- Palette tokens (from the reference site's `:root`):
  `--bg #f4f1ea`, `--paper #fbfaf6`, `--ink #1c1a17`, `--ink-soft #56514a`,
  `--ink-faint #928b80`, `--line #e2ddd2`, `--line-strong #d2ccbe`,
  `--accent #b5482e`, `--accent-soft #e9d9d2`, `--accent-bright #c9633f`,
  `--accent-strong #9d3e28`, `--accent-deep #8f3925`, `--good #4f7a4a`,
  `--good-soft #dde7da`, `--good-bright #5d8a57`, `--good-deep #37562f`,
  `--heat-1 #e7c8bc`, `--heat-2 #d89e85`, `--heat-3 #c66f4e`

## Scope

Apply globally: header, section titles, body copy, nav menu, buttons/filters,
icon accents, portfolio cards, certifications, skills, footer/contact. Both
`assets/css/style.css` and inline `style="..."` attributes in `index.html` are
in scope.

## Implementation approach

Introduce CSS custom properties in a `:root` block at the top of
`assets/css/style.css`, matching the reference site's token names/values.
Replace hardcoded hex colors throughout `style.css` with `var(--token)`.
Replace inline hex colors in `index.html` with the same `var(--token)`
references (CSS custom properties resolve fine in inline `style` attributes).

Rationale: single point of change for future tone adjustments; mirrors how the
reference site itself is structured.

## Color mapping (old → new)

| Role | Old | New token | Hex |
|---|---|---|---|
| Page background | `#fff8e7` | `--bg` | `#f4f1ea` |
| Card/box surface (icon-box, portfolio-wrap, etc.) | (same as bg) | `--paper` | `#fbfaf6` |
| Primary text | `#2c3f70` | `--ink` | `#1c1a17` |
| Secondary/description text | `#3e2723` | `--ink-soft` | `#56514a` |
| Muted/meta text | (n/a) | `--ink-faint` | `#928b80` |
| Borders/dividers | `#e8ebed` | `--line` / `--line-strong` | `#e2ddd2` / `#d2ccbe` |
| Primary accent (links, brand, buttons) | `#a5231c` | `--accent` | `#b5482e` |
| Accent hover/emphasis | `#930500` | `--accent-strong` | `#9d3e28` |
| Accent bright (header typing text) | `#ffc107` | `--accent-bright` | `#c9633f` |
| Accent deep | (n/a) | `--accent-deep` | `#8f3925` |
| Secondary color (was blue/purple, off-tone) | `#8089d2`, `#9e7f25` | `--good` / `--good-bright` / `--good-deep` | `#4f7a4a` / `#5d8a57` / `#37562f` |

### Interests icon colors (unify rainbow → system tokens)

| Interest | New token | Hex |
|---|---|---|
| Computer Vision | `--accent` | `#b5482e` |
| Generative AI | `--accent-bright` | `#c9633f` |
| Deep Learning | `--ink-soft` | `#56514a` |
| Data Science | `--good` | `#4f7a4a` |
| Feature Engineering | `--good-bright` | `#5d8a57` |
| Visualization | `--accent-strong` | `#9d3e28` |
| Algorithms | `--good-deep` | `#37562f` |
| Image Processing | `--accent-deep` | `#8f3925` |

## Typography

- Swap the Google Fonts `<link>` in `index.html` `<head>` from
  Open Sans/Raleway/Poppins to:
  `Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600` +
  `Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400` +
  `JetBrains+Mono:wght@400;500`
- `Newsreader` → body copy: About/Experience/Certifications descriptions, paragraph text generally.
- `Fraunces` → all headings (`h1`–`h6`), `.section-title h2`, project card titles
  (`.portfolio-wrap h4`), header brand name (`#header h1`).
- `JetBrains Mono`, uppercase + wide letter-spacing → nav menu (`.nav-menu a`),
  portfolio filter tabs (`#portfolio-flters li`), the "Work in Progress" badge,
  small tooltip/label text.

## Out of scope

- No dark mode (reference site and current site are both light-only).
- No layout/structural changes — this is a color + typography pass only.
- No changes to icon *sets* (boxicons/remixicon/icofont) beyond recoloring.

## Testing

Visual check in browser: open `index.html` (or a local static server) and
verify each section renders with the new palette/fonts, no leftover old hex
colors, adequate contrast against `--bg`/`--paper`, and filter/nav interactions
still work.
