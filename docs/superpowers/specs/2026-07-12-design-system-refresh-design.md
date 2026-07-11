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

## Header layout fix

Independent bug fix, bundled into this pass since it touches the same header
CSS. In the scrolled/sticky state (`#header.header-top`), the brand name
wraps onto two lines and crowds the nav menu:

- `#header.header-top h1` is `font-size: 36px` — too large for a 90px-tall bar
  once `Fraunces` (a wider display face) replaces `Poppins`.
- `#header.header-top .container` has no defined gap between `h1` and
  `.nav-menu`; `h1`'s `margin-right: auto` pushes the nav to the far edge but
  provides no minimum spacing, so on medium widths the brand text wraps.

Fix: reduce `#header.header-top h1` to `22px` (`18px` at the existing
`max-width: 768px` breakpoint, down from `26px`), add `white-space: nowrap`
and `flex-shrink: 0` so the brand never wraps, and replace the `margin-right:
auto` push with `justify-content: space-between` plus an explicit `gap: 24px`
on `#header.header-top .container` so there's always breathing room before
the first nav item.

## Dark mode

Add a manual light/dark toggle (not OS-only), with the user's choice
persisted in `localStorage` and `prefers-color-scheme` used only as the
first-visit default.

### Palette (visually extracted from a Claude Chat dark-mode screenshot)

| Role | Token (dark override) | Hex |
|---|---|---|
| Page background | `--bg` | `#1f1e1c` |
| Card/surface | `--paper` | `#2a2926` |
| Primary text | `--ink` | `#ede9de` |
| Secondary text | `--ink-soft` | `#c9c6bd` |
| Muted text | `--ink-faint` | `#8c8983` |
| Border/line | `--line` / `--line-strong` | `#3a3936` / `#46453f` |
| Accent | `--accent` | `#d97757` |

Values are a visual approximation (no live CSS access to claude.ai — blocked
by Cloudflare), confirmed against the provided screenshot and approved by the
user. Tokens not listed (`--good*`, `--accent-bright/strong/deep`, heat scale)
are derived proportionally from the same hue shifts as the light-mode set,
tuned for contrast against `#1f1e1c` during implementation.

### Mechanism

- Define light-mode tokens in `:root` (as today) and dark-mode overrides in
  `:root[data-theme="dark"]` (or `.dark-mode` on `<body>` — decided during
  implementation based on what's simplest with the existing markup).
- A toggle button (sun/moon icon, styled like the existing circular
  `.social-links` icons) sits in the header, visible in both the hero state
  and the scrolled `header-top` state (i.e. NOT nested inside `.social-links`,
  which is hidden when scrolled).
- Small inline `<script>` in `<head>` applies the stored/preferred theme
  before first paint, to avoid a flash of the wrong theme.

## Out of scope

- No layout/structural changes beyond the header fix above — this is
  otherwise a color + typography pass.
- No changes to icon *sets* (boxicons/remixicon/icofont) beyond recoloring.

## Testing

Visual check in browser: open `index.html` (or a local static server) and
verify each section renders with the new palette/fonts, no leftover old hex
colors, adequate contrast against `--bg`/`--paper`, and filter/nav interactions
still work.
