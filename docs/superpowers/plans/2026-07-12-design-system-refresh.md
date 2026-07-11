# Design System Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the static portfolio site (fonts + colors) to the Newsreader/Fraunces/JetBrains Mono + terracotta/olive design system from `docs/superpowers/specs/2026-07-12-design-system-refresh-design.md`, fix the sticky-header brand-name wrap bug, and add a manual light/dark mode toggle with a Claude-Chat-derived dark palette.

**Architecture:** This is a static site with no build step — one `index.html`, one `assets/css/style.css`, one `assets/js/main.js`, plus vendor files. All theming goes through CSS custom properties defined once in `:root` (light) and `:root[data-theme="dark"]` (dark) in `assets/css/style.css`; every hardcoded hex color in that file and in `index.html`'s inline `style="..."` attributes gets replaced with `var(--token)`. A new small `assets/js/theme.js` file drives the toggle button and persists the choice.

**Tech Stack:** Plain HTML/CSS/vanilla JS + jQuery (existing vendor libs untouched). No package manager, no test framework.

## Global Constraints

- No build tooling exists and none is being introduced — edits are made directly to `index.html` / `assets/css/style.css` / `assets/js/*.js`.
- No automated test framework exists for this project. Verification steps use `grep` (exact command + expected output) to assert old hex values are gone and new tokens are present, plus a final manual browser QA pass (Task 13). This replaces the literal red/green unit-test cycle referenced elsewhere in this skill's step templates — there is no application logic here to unit-test, only declarative markup/styles.
- CSS custom property tokens (exact names, defined in Task 1/Task 10):
  `--bg`, `--paper`, `--ink`, `--ink-soft`, `--ink-faint`, `--line`, `--line-strong`,
  `--accent`, `--accent-soft`, `--accent-bright`, `--accent-strong`, `--accent-deep`,
  `--good`, `--good-bright`, `--good-deep`, `--on-accent`.
  Every task after Task 1 must use only these token names — do not invent new ones.
- Fonts: `Newsreader` for body copy, `Fraunces` for all headings/titles, `JetBrains Mono` (uppercase, `letter-spacing`) for nav links, portfolio filter tabs, and small labels/badges.
- The following CSS blocks in `assets/css/style.css` are **dead code** — confirmed via `grep` that no element in `index.html` uses these classes (jQuery only clones `.nav-menu` into `.mobile-nav`/`.mobile-nav-toggle`, which **are** live and are covered in Task 4). Do **not** edit them as part of this plan: `.testimonials*` (509-590), `.resume*` (592-651, except the unrelated `.resume-item::before` bullet which is also dead), `.counts*` (403-441), `.credits*` (1071-1098), `.contact .php-email-form*` (942-1051), `.skills .progress*` (446-476).
- Preserve every existing `href`/`src`, section `id`, and JS behavior (isotope-style filtering, section show/hide on nav click, typed.js). This is a visual re-skin plus the two explicitly-scoped functional additions (header sizing fix, dark-mode toggle) — nothing else about behavior changes.
- Where a rule paints text/icons on a background that is **not** theme-aware (e.g. the portfolio hover scrim `rgba(0,0,0,0.6)`, or a solid `--accent*` circle), use `var(--on-accent)`, not `var(--ink)` — `--ink` flips from dark to light between themes and would go invisible against those fixed-contrast backgrounds.

---

## Task 1: Root tokens (light) + font swap

**Files:**
- Modify: `assets/css/style.css:1-10` (insert token block after the header comment)
- Modify: `index.html:14-17` (Google Fonts link)

**Interfaces:**
- Produces: the 16 CSS custom properties listed in Global Constraints, available to every subsequent task via `var(--token)`.

- [ ] **Step 1: Insert the light-mode token block**

In `assets/css/style.css`, immediately after the opening template-comment block, insert:

```css
/**
* Template Name: Personal - v2.1.0
* Template URL: https://bootstrapmade.com/personal-free-resume-bootstrap-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

:root {
  --bg: #f4f1ea;
  --paper: #fbfaf6;
  --ink: #1c1a17;
  --ink-soft: #56514a;
  --ink-faint: #928b80;
  --line: #e2ddd2;
  --line-strong: #d2ccbe;
  --accent: #b5482e;
  --accent-soft: #e9d9d2;
  --accent-bright: #c9633f;
  --accent-strong: #9d3e28;
  --accent-deep: #8f3925;
  --good: #4f7a4a;
  --good-bright: #5d8a57;
  --good-deep: #37562f;
  --on-accent: #fff8ea;
}
```

(This replaces just the file header comment with itself plus the new block — i.e. add the `:root { ... }` block right after the existing `*/` that closes the template comment, before the `# General` section comment.)

- [ ] **Step 2: Swap the Google Fonts link**

In `index.html`, replace:

```html
  <!-- Google Fonts -->
  <link
    href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Raleway:300,300i,400,400i,500,500i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i"
    rel="stylesheet">
```

with:

```html
  <!-- Google Fonts -->
  <link
    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap"
    rel="stylesheet">
```

- [ ] **Step 3: Verify**

Run: `grep -n ":root {" assets/css/style.css && grep -n "Fraunces" index.html`
Expected: the `:root {` line prints, and the Fraunces `<link>` line prints. No output for `grep -n "Open+Sans" index.html` (returns nothing/exit 1).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "Add design system CSS tokens and swap Google Fonts to Newsreader/Fraunces/JetBrains Mono"
```

---

## Task 2: Base rules (body, links, headings)

**Files:**
- Modify: `assets/css/style.css:19-53` (post-Task-1 line numbers; the `# General` block)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Replace the General block**

Replace:

```css
body {
  font-family: "Open Sans", sans-serif;
  color: #2c3f70;
  position: relative;
  background: transparent;
}

body::before {
  content: "";
  position: fixed;
  background: #fff8e7;
  background-size: cover;
  left: 0;
  right: 0;
  top: 0;
  height: 100vh;
}

@media (min-width: 1024px) {
  body::before {
    background-attachment: fixed;
  }
}

a {
  color: #a5231c;
}

a:hover {
  color: #a5231c;
  text-decoration: none;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Raleway", sans-serif;
}
```

with:

```css
body {
  font-family: "Newsreader", Georgia, serif;
  color: var(--ink);
  position: relative;
  background: transparent;
}

body::before {
  content: "";
  position: fixed;
  background: var(--bg);
  background-size: cover;
  left: 0;
  right: 0;
  top: 0;
  height: 100vh;
}

@media (min-width: 1024px) {
  body::before {
    background-attachment: fixed;
  }
}

a {
  color: var(--accent);
}

a:hover {
  color: var(--accent);
  text-decoration: none;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Fraunces", Georgia, serif;
}
```

- [ ] **Step 2: Verify**

Run: `sed -n '19,53p' assets/css/style.css | grep -n "Open Sans\|Raleway"`
Expected: no output within this line range (the General block's own font-family declarations no longer say Open Sans/Raleway). Note: `grep -n "Open Sans\|Raleway" assets/css/style.css` over the *whole file* will still find one hit in `.counts .count-box p` — that's dead CSS excluded from this entire plan per Global Constraints, not a leftover from this task. Poppins is still used elsewhere too and gets removed in later tasks.

- [ ] **Step 3: Commit**

```bash
git add assets/css/style.css
git commit -m "Apply design system tokens and fonts to base body/link/heading rules"
```

---

## Task 3: Header, sticky header-top fix, and header inline styles

**Files:**
- Modify: `assets/css/style.css` (`# Header` block and `Header Top` block)
- Modify: `index.html:34-35` (brand h1 wrapper unaffected; h2/span inline colors)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Replace the `# Header` CSS block**

Replace:

```css
#header h1 {
  font-size: 48px;
  margin-top: 0px;
  padding: 0;
  line-height: 1;
  font-weight: 700;
  font-family: "Poppins", sans-serif;
}

#header h1 a, #header h1 a:hover {
  color: #a5231c;
  line-height: 1;
  display: inline-block;
}

#header h2 {
  font-size: 24px;
  margin-top: 20px;
  color: #a5231c;
}

#header h2 span {
  color: #ffc107;
  border-bottom: 2px solid #930500;
  padding-bottom: 6px;
}

#header img {
  padding: 0;
  margin: 0;
}

#header .social-links {
  margin-top: 40px;
  display: flex;
}

#header .social-links a {
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #8089d2 ;
  color: #fff8ea;
  line-height: 1;
  margin-right: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

#header .social-links a:hover {
  background: #930500;
}
```

with:

```css
#header h1 {
  font-size: 48px;
  margin-top: 0px;
  padding: 0;
  line-height: 1;
  font-weight: 600;
  font-family: "Fraunces", Georgia, serif;
}

#header h1 a, #header h1 a:hover {
  color: var(--accent);
  line-height: 1;
  display: inline-block;
}

#header h2 {
  font-size: 24px;
  margin-top: 20px;
  color: var(--ink);
}

#header h2 span {
  color: var(--accent);
  border-bottom: 2px solid var(--accent-strong);
  padding-bottom: 6px;
}

#header img {
  padding: 0;
  margin: 0;
}

#header .social-links {
  margin-top: 40px;
  display: flex;
}

#header .social-links a {
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--good);
  color: var(--on-accent);
  line-height: 1;
  margin-right: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

#header .social-links a:hover {
  background: var(--accent-strong);
}
```

Note: `#header h2 span` previously had a CSS `color: #ffc107` that was always overridden by the inline `style="color:#a5231c"` on the actual `<span class="typing">` element (inline styles win). Step 3 fixes that inline value to match the token this rule now uses, removing the dead double-standard.

- [ ] **Step 2: Fix the sticky header-top layout (font size + brand/nav gap)**

Replace:

```css
/* Header Top */
#header.header-top {
  height: 90px;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  background: #fff8e7;
}

#header.header-top .social-links, #header.header-top h2 {
  display: none;
}

#header.header-top h1 {
  margin-right: auto;
  font-size: 36px;
}

#header.header-top .container {
  display: flex;
  align-items: center;
}

#header.header-top .nav-menu {
  margin: 0;
}

@media (max-width: 768px) {
  #header.header-top {
    height: 60px;
  }
  #header.header-top h1 {
    font-size: 26px;
  }
}
```

with:

```css
/* Header Top */
#header.header-top {
  height: 90px;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  background: var(--bg);
}

#header.header-top .social-links, #header.header-top h2 {
  display: none;
}

#header.header-top h1 {
  font-size: 22px;
  white-space: nowrap;
  flex-shrink: 0;
}

#header.header-top .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

#header.header-top .nav-menu {
  margin: 0;
}

@media (max-width: 768px) {
  #header.header-top {
    height: 60px;
  }
  #header.header-top h1 {
    font-size: 18px;
  }
}
```

- [ ] **Step 3: Fix the header inline styles in `index.html`**

Replace:

```html
      <h1><a href="index.html">Anh Thu Tran</a></h1>
      <h2 style="color:#2c3f70">I'm a <span class="typing" style="color:#a5231c"></span></h2>
```

with:

```html
      <h1><a href="index.html">Anh Thu Tran</a></h1>
      <h2 style="color:var(--ink)">I'm a <span class="typing" style="color:var(--accent)"></span></h2>
```

- [ ] **Step 4: Verify**

Run: `grep -n "#a5231c\|#2c3f70\|#ffc107\|#930500\|#8089d2\|#fff8ea\|#fff8e7\|Poppins" assets/css/style.css | sed -n '1,20p'`
Expected: no hits from the `# Header` or `Header Top` blocks (lines roughly 60-150 pre-edit); remaining hits, if any, belong to sections not yet converted by later tasks.

Manual check: open `index.html` in a browser (or `python3 -m http.server 8000` from the repo root and visit `http://localhost:8000`), click a nav link so `#header` gets the `.header-top` class, and confirm "Anh Thu Tran" stays on one line with visible spacing before "Home".

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "Retheme header, fix sticky header-top brand text wrapping"
```

---

## Task 4: Navigation (desktop nav-menu, mobile nav, mobile toggle)

**Files:**
- Modify: `assets/css/style.css` (`# Navigation Menu` block, lines covering `.nav-menu*`, `.mobile-nav*`)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Replace desktop nav-menu rules with mono-uppercase styling**

Replace:

```css
.nav-menu a {
  display: block;
  position: relative;
  color: #2c3f70;
  font-size: 19px;
  font-family: "Poppins", sans-serif;
  font-weight: 400;
}

.nav-menu a:before {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 0;
  background-color: #9e7f25;
  visibility: hidden;
  width: 0px;
  transition: all 0.3s ease-in-out 0s;
}

.nav-menu a:hover:before, .nav-menu li:hover > a:before, .nav-menu .active > a:before {
  visibility: visible;
  width: 25px;
}

.nav-menu a:hover, .nav-menu .active > a, .nav-menu li:hover > a {
  color: #a5231c;
  text-decoration: none;
}
```

with:

```css
.nav-menu a {
  display: block;
  position: relative;
  color: var(--ink);
  font-size: 13px;
  font-family: "JetBrains Mono", monospace;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.nav-menu a:before {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 0;
  background-color: var(--good);
  visibility: hidden;
  width: 0px;
  transition: all 0.3s ease-in-out 0s;
}

.nav-menu a:hover:before, .nav-menu li:hover > a:before, .nav-menu .active > a:before {
  visibility: visible;
  width: 25px;
}

.nav-menu a:hover, .nav-menu .active > a, .nav-menu li:hover > a {
  color: var(--accent);
  text-decoration: none;
}
```

- [ ] **Step 2: Replace mobile nav toggle + mobile nav panel rules**

Replace:

```css
.mobile-nav-toggle i {
  color: #a5231c;
}

.mobile-nav {
  position: fixed;
  top: 55px;
  right: 15px;
  bottom: 15px;
  left: 15px;
  z-index: 9999;
  overflow-y: auto;
  background: #e8ebed;
  transition: ease-in-out 0s;
  opacity: 0;
  visibility: hidden;
  border-radius: 10px;
  padding: 10px 0;
  border: 2px solid rgba(255, 255, 255, 0.12);
}

.mobile-nav * {
  margin: 0;
  padding: 0;
  list-style: none;
}

.mobile-nav a {
  display: block;
  position: relative;
  color: #2c3f70;
  padding: 10px 20px;
  font-weight: 500;
  outline: none;
}

.mobile-nav a:hover, .mobile-nav .active > a, .mobile-nav li:hover > a {
  color: #930500;
  text-decoration: none;
}
```

with:

```css
.mobile-nav-toggle i {
  color: var(--accent);
}

.mobile-nav {
  position: fixed;
  top: 55px;
  right: 15px;
  bottom: 15px;
  left: 15px;
  z-index: 9999;
  overflow-y: auto;
  background: var(--paper);
  transition: ease-in-out 0s;
  opacity: 0;
  visibility: hidden;
  border-radius: 10px;
  padding: 10px 0;
  border: 2px solid rgba(255, 255, 255, 0.12);
}

.mobile-nav * {
  margin: 0;
  padding: 0;
  list-style: none;
}

.mobile-nav a {
  display: block;
  position: relative;
  color: var(--ink);
  padding: 10px 20px;
  font-weight: 500;
  outline: none;
}

.mobile-nav a:hover, .mobile-nav .active > a, .mobile-nav li:hover > a {
  color: var(--accent-strong);
  text-decoration: none;
}
```

- [ ] **Step 3: Fix the mobile-nav-active toggle icon color**

Replace:

```css
.mobile-nav-active .mobile-nav-toggle i {
  color: #2c3f70;
}
```

with:

```css
.mobile-nav-active .mobile-nav-toggle i {
  color: var(--ink);
}
```

- [ ] **Step 4: Verify**

Run: `grep -n "#a5231c\|#2c3f70\|#9e7f25\|#930500\|#e8ebed\|Poppins" assets/css/style.css | grep -E "1[5-9][0-9]|2[0-6][0-9]"`
Expected: no output (no old hex/Poppins remaining in the ~150-270 line range covering nav + mobile nav).

Manual check: shrink the browser window below 992px width, open the mobile nav (hamburger icon), confirm links are legible and mono/uppercase, and hover/active states show the olive underline + red text on desktop nav.

- [ ] **Step 5: Commit**

```bash
git add assets/css/style.css
git commit -m "Retheme nav menu to mono-uppercase style and retheme mobile nav"
```

---

## Task 5: Section titles, shared `.services .icon-box`, portfolio filter tabs

**Files:**
- Modify: `assets/css/style.css` (`.section-title*`, `.services .icon-box*`, `#portfolio-flters*`)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Replace `.section-title` rules**

Replace:

```css
.section-title h2 {
  font-size: 14px;
  font-weight: 500;
  padding: 0;
  line-height: 1px;
  margin: 0 0 20px 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #2c3f70;
  font-family: "Poppins", sans-serif;
}

.section-title h2::after {
  content: "";
  width: 120px;
  height: 1px;
  display: inline-block;
  background: #2c3f70;
  margin: 4px 10px;
}

.section-title p {
  margin: 0;
  margin: -15px 0 15px 0;
  font-size: 36px;
  font-weight: 700;
  text-transform: uppercase;
  font-family: "Poppins", sans-serif;
  color: #2c3f70;
}
```

with:

```css
.section-title h2 {
  font-size: 13px;
  font-weight: 500;
  padding: 0;
  line-height: 1px;
  margin: 0 0 20px 0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
}

.section-title h2::after {
  content: "";
  width: 120px;
  height: 1px;
  display: inline-block;
  background: var(--line-strong);
  margin: 4px 10px;
}

.section-title p {
  margin: 0;
  margin: -15px 0 15px 0;
  font-size: 36px;
  font-weight: 600;
  text-transform: uppercase;
  font-family: "Fraunces", Georgia, serif;
  color: var(--ink);
}
```

- [ ] **Step 2: Replace `.about-me .content h3`/`ul i` rules**

Replace:

```css
.about-me .content h3 {
  font-weight: 700;
  font-size: 26px;
  color: #930500;
}

.about-me .content ul li {
  padding-bottom: 10px;
}

.about-me .content ul i {
  font-size: 20px;
  padding-right: 2px;
  color: #930500;
}
```

with:

```css
.about-me .content h3 {
  font-weight: 600;
  font-size: 26px;
  color: var(--accent-strong);
}

.about-me .content ul li {
  padding-bottom: 10px;
}

.about-me .content ul i {
  font-size: 20px;
  padding-right: 2px;
  color: var(--accent-strong);
}
```

(Only the two color declarations change here; the surrounding `ul`/list rules are shown for anchoring and are otherwise untouched.)

- [ ] **Step 3: Replace `.services .icon-box` rules**

Replace:

```css
.services .icon-box {
  text-align: center;
  background: #fff8e7;
  padding: 40px 40px;
  transition: all ease-in-out 0.3s;
  margin: 10px
}

.services .icon-box .icon {
  margin: 0 auto;
  width: 64px;
  height: 64px;
  background: #930500;
  border-radius: 5px;
  transition: all .3s ease-out 0s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transform-style: preserve-3d;
}

.services .icon-box .icon i {
  color: #2c3f70;
  font-size: 28px;
}

.services .icon-box .icon::before {
  position: absolute;
  content: '';
  left: -8px;
  top: -8px;
  height: 100%;
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  transition: all .3s ease-out 0s;
  transform: translateZ(-1px);
}

.services .icon-box h4 {
  font-weight: 700;
  margin-bottom: 15px;
  font-size: 24px;
}

.services .icon-box h4 a {
  color: #2c3f70;
}

.services .icon-box p {
  line-height: 24px;
  font-size: 14px;
  margin-bottom: 0;
}

.services .icon-box:hover {
  background: #e8d4e5;
  border-color: #930500;
}

.services .icon-box:hover .icon {
  background: #2c3f70;
}

.services .icon-box:hover .icon i {
  color: #930500;
}

.services .icon-box:hover .icon::before {
  background: #35e888;
}

.services .icon-box:hover h4 a, .services .icon-box:hover p {
  color: #a5231c;
}
```

with:

```css
.services .icon-box {
  text-align: center;
  background: var(--paper);
  padding: 40px 40px;
  transition: all ease-in-out 0.3s;
  margin: 10px
}

.services .icon-box .icon {
  margin: 0 auto;
  width: 64px;
  height: 64px;
  background: var(--accent-strong);
  border-radius: 5px;
  transition: all .3s ease-out 0s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transform-style: preserve-3d;
}

.services .icon-box .icon i {
  color: var(--on-accent);
  font-size: 28px;
}

.services .icon-box .icon::before {
  position: absolute;
  content: '';
  left: -8px;
  top: -8px;
  height: 100%;
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  transition: all .3s ease-out 0s;
  transform: translateZ(-1px);
}

.services .icon-box h4 {
  font-weight: 600;
  margin-bottom: 15px;
  font-size: 24px;
}

.services .icon-box h4 a {
  color: var(--ink);
}

.services .icon-box p {
  line-height: 24px;
  font-size: 14px;
  margin-bottom: 0;
}

.services .icon-box:hover {
  background: var(--accent-soft);
  border-color: var(--accent-strong);
}

.services .icon-box:hover .icon {
  background: var(--ink);
}

.services .icon-box:hover .icon i {
  color: var(--accent-strong);
}

.services .icon-box:hover .icon::before {
  background: var(--accent-soft);
}

.services .icon-box:hover h4 a, .services .icon-box:hover p {
  color: var(--accent);
}
```

Note: `.services .icon-box .icon i` changes from `--ink` to `--on-accent` (not the naive `--ink` swap) because this glyph always sits on the solid `--accent-strong` circle — `--ink` flips to a light color in dark mode and would go invisible there. This is also why the earlier `icofont-read-book` inline `color:#fff8e7` overrides on the Certifications icons (Task 9) become redundant and get removed rather than converted.

- [ ] **Step 4: Replace `#portfolio-flters` rules with mono-uppercase styling**

Replace:

```css
.portfolio #portfolio-flters li {
  cursor: pointer;
  display: inline-block;
  padding: 8px 16px 10px 16px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  color: #2c3f70;
  background: ;
  margin: 0 3px 10px 3px;
  transition: all 0.3s ease-in-out;
  border-radius: 4px;
}

.portfolio #portfolio-flters li:hover, .portfolio #portfolio-flters li.filter-active {
  background: #930500;
}
```

with:

```css
.portfolio #portfolio-flters li {
  cursor: pointer;
  display: inline-block;
  padding: 8px 16px 10px 16px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-family: "JetBrains Mono", monospace;
  color: var(--ink);
  background: ;
  margin: 0 3px 10px 3px;
  transition: all 0.3s ease-in-out;
  border-radius: 4px;
}

.portfolio #portfolio-flters li:hover, .portfolio #portfolio-flters li.filter-active {
  background: var(--accent-strong);
  color: var(--on-accent);
}
```

(Added `color: var(--on-accent)` on the hover/active state, which the original design didn't need because white text was implied by browser default — with `--ink` as the base color this must be set explicitly or the dark ink text becomes unreadable on the `--accent-strong` active background.)

- [ ] **Step 5: Verify**

Run: `grep -n "#2c3f70\|#930500\|#fff8e7\|#e8d4e5\|#35e888\|#a5231c\|Poppins" assets/css/style.css | grep -E "^3[4-9][0-9]:|^7[0-6][0-9]:"`
Expected: no output in the `.section-title`/`.about-me`/`.services`/`#portfolio-flters` line ranges (roughly 340-770 pre-edit; exact numbers will have shifted from earlier tasks — visually confirm the matched lines belong to these blocks, not leftover dead CSS).

- [ ] **Step 6: Commit**

```bash
git add assets/css/style.css
git commit -m "Retheme section titles, shared icon-box block, and portfolio filter tabs"
```

---

## Task 6: Interests section (container CSS + inline icon colors)

**Files:**
- Modify: `assets/css/style.css` (`# Interests` block)
- Modify: `index.html` (8 inline `<i style="color:...">` in the Interests grid)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Replace `.interests .icon-box` CSS rules**

Replace:

```css
.interests .icon-box {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff8e7;
  transition: ease-in-out 0.3s;
}


.interests .icon-box i {
  font-size: 32px;
  padding-right: 10px;
  line-height: 1;
}

.interests .icon-box h3 {
  font-weight: 700;
  margin: 0;
  padding: 0;
  line-height: 1;
  font-size: 16px;
  color: #2c3f70;
}

.interests .icon-box:hover {
  background: #c8d4e5;
}
```

with:

```css
.interests .icon-box {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--paper);
  transition: ease-in-out 0.3s;
}


.interests .icon-box i {
  font-size: 32px;
  padding-right: 10px;
  line-height: 1;
}

.interests .icon-box h3 {
  font-weight: 600;
  margin: 0;
  padding: 0;
  line-height: 1;
  font-size: 16px;
  color: var(--ink);
}

.interests .icon-box:hover {
  background: var(--accent-soft);
}
```

- [ ] **Step 2: Replace the 8 inline Interests icon colors in `index.html`**

Replace:

```html
        <div class="col-lg-3 col-md-4">
          <div class="icon-box">
            <i class="ri-eye-line" style="color: #f06292;"></i>
            <h3>Computer Vision</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4 mt-md-0">
          <div class="icon-box">
            <i class="ri-magic-line" style="color: #f48fb1;"></i>
            <h3>Generative AI</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4 mt-md-0">
          <div class="icon-box">
            <i class="ri-cpu-line" style="color: #ffbb2c;"></i>
            <h3>Deep Learning</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4 mt-lg-0">
          <div class="icon-box">
            <i class="ri-bar-chart-box-line" style="color: #47aeff;"></i>
            <h3>Data Science</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4">
          <div class="icon-box">
            <i class="ri-database-2-line" style="color: #28a745;"></i>
            <h3>Feature Engineering</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4">
          <div class="icon-box">
            <i class="ri-pie-chart-line" style="color: #f1081f;"></i>
            <h3>Visualization</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4">
          <div class="icon-box">
            <i class="ri-code-line" style="color: #0cc21b;"></i>
            <h3>Algorithms</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4">
          <div class="icon-box">
            <i class="ri-image-line" style="color: #ffc107;"></i>
            <h3>Image Processing</h3>
          </div>
        </div>
```

with:

```html
        <div class="col-lg-3 col-md-4">
          <div class="icon-box">
            <i class="ri-eye-line" style="color: var(--accent);"></i>
            <h3>Computer Vision</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4 mt-md-0">
          <div class="icon-box">
            <i class="ri-magic-line" style="color: var(--accent-bright);"></i>
            <h3>Generative AI</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4 mt-md-0">
          <div class="icon-box">
            <i class="ri-cpu-line" style="color: var(--ink-soft);"></i>
            <h3>Deep Learning</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4 mt-lg-0">
          <div class="icon-box">
            <i class="ri-bar-chart-box-line" style="color: var(--good);"></i>
            <h3>Data Science</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4">
          <div class="icon-box">
            <i class="ri-database-2-line" style="color: var(--good-bright);"></i>
            <h3>Feature Engineering</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4">
          <div class="icon-box">
            <i class="ri-pie-chart-line" style="color: var(--accent-strong);"></i>
            <h3>Visualization</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4">
          <div class="icon-box">
            <i class="ri-code-line" style="color: var(--good-deep);"></i>
            <h3>Algorithms</h3>
          </div>
        </div>
        <div class="col-lg-3 col-md-4 mt-4">
          <div class="icon-box">
            <i class="ri-image-line" style="color: var(--accent-deep);"></i>
            <h3>Image Processing</h3>
          </div>
        </div>
```

- [ ] **Step 3: Verify**

Run: `grep -n "#f06292\|#f48fb1\|#ffbb2c\|#47aeff\|#28a745\|#f1081f\|#0cc21b\|#ffc107" index.html`
Expected: no output (all 8 rainbow hex values gone from the Interests grid — note some of these hex codes may still appear later in the file in the Awards section, which Task 9 handles).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "Retheme Interests section icons to design-system tokens"
```

---

## Task 7: Portfolio project cards (portfolio-wrap/info/links)

**Files:**
- Modify: `assets/css/style.css` (`# Portfolio` block, `.portfolio-wrap*` rules)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Replace the portfolio-wrap/info/links color rules**

Replace:

```css
.portfolio .portfolio-wrap .portfolio-info::before {
  display: block;
  content: "";
  width: 48px;
  height: 48px;
  position: absolute;
  top: 35px;
  left: 35px;
  border-top: 3px solid #2c3f70;
  border-left: 3px solid #2c3f70;
  transition: all 0.5s ease 0s;
  z-index: 9994;
}

.portfolio .portfolio-wrap .portfolio-info::after {
  display: block;
  content: "";
  width: 48px;
  height: 48px;
  position: absolute;
  bottom: 35px;
  right: 35px;
  border-bottom: 3px solid #2c3f70;
  border-right: 3px solid #2c3f70;
  transition: all 0.5s ease 0s;
  z-index: 9994;
}

.portfolio .portfolio-wrap .portfolio-info h4 {
  font-size: 20px;
  color: #2c3f70;
  font-weight: 600;
}

.portfolio .portfolio-wrap .portfolio-info p {
  color: #2c3f70;
  font-size: 14px;
  text-transform: uppercase;
  padding: 0;
  margin: 0;
}

.portfolio .portfolio-wrap .portfolio-links {
  text-align: center;
  z-index: 4;
}

.portfolio .portfolio-wrap .portfolio-links a {
  color: #2c3f70;
  margin: 0 2px;
  font-size: 28px;
  display: inline-block;
  transition: 0.3s;
}

.portfolio .portfolio-wrap .portfolio-links a:hover {
  color: #63eda3;
}
```

with:

```css
.portfolio .portfolio-wrap .portfolio-info::before {
  display: block;
  content: "";
  width: 48px;
  height: 48px;
  position: absolute;
  top: 35px;
  left: 35px;
  border-top: 3px solid var(--on-accent);
  border-left: 3px solid var(--on-accent);
  transition: all 0.5s ease 0s;
  z-index: 9994;
}

.portfolio .portfolio-wrap .portfolio-info::after {
  display: block;
  content: "";
  width: 48px;
  height: 48px;
  position: absolute;
  bottom: 35px;
  right: 35px;
  border-bottom: 3px solid var(--on-accent);
  border-right: 3px solid var(--on-accent);
  transition: all 0.5s ease 0s;
  z-index: 9994;
}

.portfolio .portfolio-wrap .portfolio-info h4 {
  font-size: 20px;
  color: var(--on-accent);
  font-weight: 600;
  font-family: "Fraunces", Georgia, serif;
}

.portfolio .portfolio-wrap .portfolio-info p {
  color: var(--on-accent);
  font-size: 14px;
  text-transform: uppercase;
  padding: 0;
  margin: 0;
}

.portfolio .portfolio-wrap .portfolio-links {
  text-align: center;
  z-index: 4;
}

.portfolio .portfolio-wrap .portfolio-links a {
  color: var(--on-accent);
  margin: 0 2px;
  font-size: 28px;
  display: inline-block;
  transition: 0.3s;
}

.portfolio .portfolio-wrap .portfolio-links a:hover {
  color: var(--accent-bright);
}
```

`var(--on-accent)` is used throughout (not `var(--ink)`) because all of this text/border sits on the fixed `rgba(0,0,0,0.6)` dark hover scrim, not on `--bg`/`--paper` — it must stay light in both themes. This is also a contrast **improvement** over the original (navy-on-black-overlay was already low-contrast; cream-on-black-overlay reads clearly).

- [ ] **Step 2: Verify**

Run: `grep -n "#2c3f70\|#63eda3" assets/css/style.css`
Expected: no output.

Manual check: hover over any project card in the Projects section and confirm the title/description/link icons are clearly legible against the darkened overlay.

- [ ] **Step 3: Commit**

```bash
git add assets/css/style.css
git commit -m "Retheme portfolio card hover overlay with on-accent text for contrast"
```

---

## Task 8: Contact info-box + icofont bullet color

**Files:**
- Modify: `assets/css/style.css` (`.contact .info-box*` rules, `.icofont-rounded-right:before`)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Replace `.contact .info-box` rules**

Replace:

```css
.contact .info-box {
  color: #444444;
  padding: 20px;
  width: 100%;
  background: #e8dbcc;
}

.contact .info-box i.bx {
  font-size: 24px;
  color: #3c0e18;
  border-radius: 50%;
  padding: 14px;
  float: left;
  background: rgba(255, 255, 255, 0.1);
}

.contact .info-box h3 {
  font-size: 20px;
  color: #5f0c2f;
  font-weight: 700;
  margin: 10px 0 8px 68px;
}

.contact .info-box p {
  padding: 0;
  color: #3c0e18;
  line-height: 24px;
  font-size: 14px;
  margin: 0 0 0 68px;
}

.contact .info-box .social-links {
  margin: 5px 0 0 68px;
  display: flex;
}

.contact .info-box .social-links a {
  font-size: 18px;
  display: inline-block;
  color: #3c0e18;
  line-height: 1;
  margin-right: 12px;
  transition: 0.3s;
}

.contact .info-box .social-links a:hover {
  color: #a5231c;
}
```

with:

```css
.contact .info-box {
  color: var(--ink-soft);
  padding: 20px;
  width: 100%;
  background: var(--paper);
}

.contact .info-box i.bx {
  font-size: 24px;
  color: var(--ink-soft);
  border-radius: 50%;
  padding: 14px;
  float: left;
  background: rgba(255, 255, 255, 0.1);
}

.contact .info-box h3 {
  font-size: 20px;
  color: var(--ink);
  font-weight: 600;
  margin: 10px 0 8px 68px;
}

.contact .info-box p {
  padding: 0;
  color: var(--ink-soft);
  line-height: 24px;
  font-size: 14px;
  margin: 0 0 0 68px;
}

.contact .info-box .social-links {
  margin: 5px 0 0 68px;
  display: flex;
}

.contact .info-box .social-links a {
  font-size: 18px;
  display: inline-block;
  color: var(--ink-soft);
  line-height: 1;
  margin-right: 12px;
  transition: 0.3s;
}

.contact .info-box .social-links a:hover {
  color: var(--accent);
}
```

- [ ] **Step 2: Replace the icofont bullet color**

Replace:

```css
.icofont-rounded-right:before {
  color: #8089d2;  /* đổi thành màu hồng của bạn */
}
```

with:

```css
.icofont-rounded-right:before {
  color: var(--good);
}
```

- [ ] **Step 3: Verify**

Run: `grep -n "#444444\|#3c0e18\|#5f0c2f\|#e8dbcc\|#8089d2" assets/css/style.css`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add assets/css/style.css
git commit -m "Retheme contact info boxes and about-section bullet icon color"
```

---

## Task 9: Remaining `index.html` inline color sweep

**Files:**
- Modify: `index.html` (Education, Awards & Publications, Experience, Certifications, Links/Resume, Skills sections)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Education section transcript block**

Replace:

```html
            <p style="text-align:left; color:#a5231c; padding:5px 10px; font-weight:bold; font-size:16px;"><em>Bachelor
                of Data Science — GPA: 3.64 / 4.00</em></p>
            <h5 style="text-align:left;padding: 0px 10px;">October 2021 – August 2025</h5>
            <h6 style="text-align:left;color:#420d19;padding: 0px 10px;font-weight:600;">Key Courses</h6>
            <ul style="text-align:left;color:#3e2723;margin-bottom:6px;">
```

with:

```html
            <p style="text-align:left; color:var(--accent); padding:5px 10px; font-weight:bold; font-size:16px;"><em>Bachelor
                of Data Science — GPA: 3.64 / 4.00</em></p>
            <h5 style="text-align:left;padding: 0px 10px;">October 2021 – August 2025</h5>
            <h6 style="text-align:left;color:var(--ink);padding: 0px 10px;font-weight:600;">Key Courses</h6>
            <ul style="text-align:left;color:var(--ink-soft);margin-bottom:6px;">
```

- [ ] **Step 2: Education section transcript link**

Replace:

```html
              <a href="https://drive.google.com/file/d/13Eu2nOHoEkKm-QjUieBX9q-Bglb5xL3B/view?usp=drive_link"
                target="_blank" style="color:#a5231c;font-size:13px;">
```

with:

```html
              <a href="https://drive.google.com/file/d/13Eu2nOHoEkKm-QjUieBX9q-Bglb5xL3B/view?usp=drive_link"
                target="_blank" style="color:var(--accent);font-size:13px;">
```

- [ ] **Step 3: Awards & Publications icons and description text**

Replace:

```html
                <i class="ri-medal-line" style="font-size:40px; color:#f06292;"></i>
                <h3 style="margin:0;"><a
                    href="https://drive.google.com/file/d/12YJuNLnvXGwZ56ZIm9WnMBGy7-6963T3/view?usp=sharing"
                    target="_blank" style="color:inherit;">2nd Prize — Research Conference</a></h3>
              </div>
              <p style="color:#3e2723; margin:0; font-size:14px;">Technology &amp; Engineering Category · Van Lang
                Student Research Conference 2023–2024 · May 2024</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4" data-aos="fade-up" data-aos-delay="100">
            <div class="icon-box" style="flex-direction:column; align-items:flex-start; gap:10px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <i class="ri-award-line" style="font-size:40px; color:#ffbb2c;"></i>
                <h3 style="margin:0;"><a
                    href="https://drive.google.com/file/d/1RKBUQewBtAYJ-4v-nUMp4trEsAuJgQC5/view?usp=drive_link"
                    target="_blank" style="color:inherit;">Semifinalist — Euréka 2024</a></h3>
              </div>
              <p style="color:#3e2723; margin:0; font-size:14px;">National Student Research Award · October 2024</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4" data-aos="fade-up" data-aos-delay="200">
            <div class="icon-box" style="flex-direction:column; align-items:flex-start; gap:10px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <i class="ri-honour-line" style="font-size:40px; color:#47aeff;"></i>
                <h3 style="margin:0;">Academic Scholarship</h3>
              </div>
              <p style="color:#3e2723; margin:0; font-size:14px;">100% (2021) · 25% (2023) · 50% (2024) · 25% (2025)</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4" data-aos="fade-up" data-aos-delay="300">
            <div class="icon-box" style="flex-direction:column; align-items:flex-start; gap:10px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <i class="ri-pen-nib-line" style="font-size:40px; color:#e080a0;"></i>
                <h3 style="margin:0;"><a href="https://link.springer.com/chapter/10.1007/978-981-95-4724-1_19"
                    target="_blank" style="color:inherit;">Published — Springer FDSE 2025</a></h3>
              </div>
              <p style="color:#3e2723; margin:0; font-size:14px;">Robust ResNet-Based Models for Skin Lesion Detection ·
                CCIS vol 2709</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4" data-aos="fade-up" data-aos-delay="400">
            <div class="icon-box" style="flex-direction:column; align-items:flex-start; gap:10px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <i class="ri-pen-nib-line" style="font-size:40px; color:#e080a0;"></i>
                <h3 style="margin:0;"><a href="https://journals.sagepub.com/doi/10.1177/15741699251334321"
                    target="_blank" style="color:inherit;">Published — MASA Journal 2025</a></h3>
              </div>
              <p style="color:#3e2723; margin:0; font-size:14px;">MRI Image Segmentation Using Fuzzy Clustering &amp;
                Naïve Bayes · Vol 20(3)</p>
```

with:

```html
                <i class="ri-medal-line" style="font-size:40px; color:var(--accent);"></i>
                <h3 style="margin:0;"><a
                    href="https://drive.google.com/file/d/12YJuNLnvXGwZ56ZIm9WnMBGy7-6963T3/view?usp=sharing"
                    target="_blank" style="color:inherit;">2nd Prize — Research Conference</a></h3>
              </div>
              <p style="color:var(--ink-soft); margin:0; font-size:14px;">Technology &amp; Engineering Category · Van Lang
                Student Research Conference 2023–2024 · May 2024</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4" data-aos="fade-up" data-aos-delay="100">
            <div class="icon-box" style="flex-direction:column; align-items:flex-start; gap:10px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <i class="ri-award-line" style="font-size:40px; color:var(--accent-bright);"></i>
                <h3 style="margin:0;"><a
                    href="https://drive.google.com/file/d/1RKBUQewBtAYJ-4v-nUMp4trEsAuJgQC5/view?usp=drive_link"
                    target="_blank" style="color:inherit;">Semifinalist — Euréka 2024</a></h3>
              </div>
              <p style="color:var(--ink-soft); margin:0; font-size:14px;">National Student Research Award · October 2024</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4" data-aos="fade-up" data-aos-delay="200">
            <div class="icon-box" style="flex-direction:column; align-items:flex-start; gap:10px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <i class="ri-honour-line" style="font-size:40px; color:var(--good);"></i>
                <h3 style="margin:0;">Academic Scholarship</h3>
              </div>
              <p style="color:var(--ink-soft); margin:0; font-size:14px;">100% (2021) · 25% (2023) · 50% (2024) · 25% (2025)</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4" data-aos="fade-up" data-aos-delay="300">
            <div class="icon-box" style="flex-direction:column; align-items:flex-start; gap:10px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <i class="ri-pen-nib-line" style="font-size:40px; color:var(--good-bright);"></i>
                <h3 style="margin:0;"><a href="https://link.springer.com/chapter/10.1007/978-981-95-4724-1_19"
                    target="_blank" style="color:inherit;">Published — Springer FDSE 2025</a></h3>
              </div>
              <p style="color:var(--ink-soft); margin:0; font-size:14px;">Robust ResNet-Based Models for Skin Lesion Detection ·
                CCIS vol 2709</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4" data-aos="fade-up" data-aos-delay="400">
            <div class="icon-box" style="flex-direction:column; align-items:flex-start; gap:10px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <i class="ri-pen-nib-line" style="font-size:40px; color:var(--good-bright);"></i>
                <h3 style="margin:0;"><a href="https://journals.sagepub.com/doi/10.1177/15741699251334321"
                    target="_blank" style="color:inherit;">Published — MASA Journal 2025</a></h3>
              </div>
              <p style="color:var(--ink-soft); margin:0; font-size:14px;">MRI Image Segmentation Using Fuzzy Clustering &amp;
                Naïve Bayes · Vol 20(3)</p>
```

- [ ] **Step 4: Experience section links and descriptions**

Replace:

```html
            <h4 style="text-align:left;"><a href="https://i-stech.net/vn/" target="_blank" style="color:#a5231c">i-STECH
                (formerly Sprite Plus)</a></h4>
            <h5 style="text-align:left;">February 2024 – May 2024</h5>
            <p style="text-align:left;color:#3e2723"><em>Data Science Intern · Ho Chi Minh City, Vietnam</em></p>
```

with:

```html
            <h4 style="text-align:left;"><a href="https://i-stech.net/vn/" target="_blank" style="color:var(--accent)">i-STECH
                (formerly Sprite Plus)</a></h4>
            <h5 style="text-align:left;">February 2024 – May 2024</h5>
            <p style="text-align:left;color:var(--ink-soft)"><em>Data Science Intern · Ho Chi Minh City, Vietnam</em></p>
```

- [ ] **Step 5: Experience section, second entry**

Replace:

```html
            <h4 style="text-align:left;"><a href="https://wecheer.io/" target="_blank"
                style="color:#a5231c">WECHEER.IO</a></h4>
            <h5 style="text-align:left;">August 2021 – Present</h5>
            <p style="text-align:left;color:#3e2723"><em>Freelance Data Reviewer · Remote (Switzerland)</em></p>
```

with:

```html
            <h4 style="text-align:left;"><a href="https://wecheer.io/" target="_blank"
                style="color:var(--accent)">WECHEER.IO</a></h4>
            <h5 style="text-align:left;">August 2021 – Present</h5>
            <p style="text-align:left;color:var(--ink-soft)"><em>Freelance Data Reviewer · Remote (Switzerland)</em></p>
```

- [ ] **Step 6: Skills section icon-box background + heading color (3 blocks)**

Replace:

```html
          <div class="col-md-12 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100" style="background:#fff">
            <h4 style="text-align:left;color:#1a0a10">Languages & Databases</h4>
```

with:

```html
          <div class="col-md-12 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100" style="background:var(--paper)">
            <h4 style="text-align:left;color:var(--ink)">Languages & Databases</h4>
```

Replace:

```html
          <div class="col-md-12 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100" style="background:#fff">
            <h4 style="text-align:left;color:#1a0a10">ML / DL Frameworks</h4>
```

with:

```html
          <div class="col-md-12 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100" style="background:var(--paper)">
            <h4 style="text-align:left;color:var(--ink)">ML / DL Frameworks</h4>
```

Replace:

```html
          <div class="col-md-12 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100" style="background:#fff">
            <h4 style="text-align:left;color:#1a0a10">Tools & Platforms</h4>
```

with:

```html
          <div class="col-md-12 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100" style="background:var(--paper)">
            <h4 style="text-align:left;color:var(--ink)">Tools & Platforms</h4>
```

- [ ] **Step 7: Certifications — first (well-formed) block**

Replace:

```html
        <div class="col-md-6 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100">
          <div class="icon"><i class="icofont-read-book" style="color:#fff8e7"></i></div>
          <h4 class="title">
            <a href="https://drive.google.com/file/d/1PUL4vRgq5-_tuigrihtabgS8aIuSetR-/view?usp=drive_link"
              target="_blank" style="color:#2c3f70">
              IBM Data Science Professional Certificate
            </a>
          </h4>
          <div class="description" style="color:#3e2723; font-size: 14px; line-height: 1.6;">
```

with:

```html
        <div class="col-md-6 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100">
          <div class="icon"><i class="icofont-read-book"></i></div>
          <h4 class="title">
            <a href="https://drive.google.com/file/d/1PUL4vRgq5-_tuigrihtabgS8aIuSetR-/view?usp=drive_link"
              target="_blank" style="color:var(--ink)">
              IBM Data Science Professional Certificate
            </a>
          </h4>
          <div class="description" style="color:var(--ink-soft); font-size: 14px; line-height: 1.6;">
```

The inline `color:#fff8e7` on the icon glyph is removed (not converted) because `.services .icon-box .icon i` now sets `color: var(--on-accent)` globally (Task 5, Step 3), which is the same value — the inline override is redundant.

- [ ] **Step 8: Certifications — second block (also fixes malformed markup)**

Replace:

```html
        <div class="col-md-6 mt-4 mt-md-0 icon-box" data-aos="fade-up">
          <div class="icon"><i class="icofont-read-book" style="color:#fff8e7"></i></div>
          <h4 class="title">
            <a href="https://doi.org/10.1007/978-981-95-4724-1_19" target="_blank" style="color:#2c3f70">
              IBM Data Engineering Professional Certificate
            </a>
          </h4>
          <p class="description" style="color:#3e2723;">
          </p>
          Expected Completion: 06/2026
          </p>
          Focusing on: ETL Pipelines, NoSQL, and Relational Databases.
          </p>
          </p>
        </div>
```

with:

```html
        <div class="col-md-6 mt-4 mt-md-0 icon-box" data-aos="fade-up">
          <div class="icon"><i class="icofont-read-book"></i></div>
          <h4 class="title">
            <a href="https://doi.org/10.1007/978-981-95-4724-1_19" target="_blank" style="color:var(--ink)">
              IBM Data Engineering Professional Certificate
            </a>
          </h4>
          <div class="description" style="color:var(--ink-soft); font-size: 14px; line-height: 1.6;">
            <p>Expected Completion: 06/2026</p>
            <p>Focusing on: ETL Pipelines, NoSQL, and Relational Databases.</p>
          </div>
        </div>
```

This also fixes pre-existing invalid markup (a `<p>` opened and immediately closed, followed by bare text and stray `</p>` tags) using the same `<div class="description">` + `<p>` structure the first certification block already uses — both blocks are now structurally consistent.

- [ ] **Step 9: Links/Resume section**

Replace:

```html
        <div class="col-md-3 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100">
          <a href="https://drive.google.com/file/d/1bRGgcBV-aJDKkD_ePtwb-8UXs9yj-ZvK/view?usp=sharing" target="_blank">
            <div class="icon"><i class="icofont-page"></i></div>
          </a>
          <h4 class="title"><a href="https://drive.google.com/file/d/1bRGgcBV-aJDKkD_ePtwb-8UXs9yj-ZvK/view?usp=sharing"
              target="_blank">Resume</a></h4>
          <p class="description" style="color:#fff;">The link contains downloadable resume</p>
        </div>
```

with:

```html
        <div class="col-md-3 mt-4 mt-md-0 icon-box" data-aos="fade-up" data-aos-delay="100">
          <a href="https://drive.google.com/file/d/1bRGgcBV-aJDKkD_ePtwb-8UXs9yj-ZvK/view?usp=sharing" target="_blank">
            <div class="icon"><i class="icofont-page"></i></div>
          </a>
          <h4 class="title"><a href="https://drive.google.com/file/d/1bRGgcBV-aJDKkD_ePtwb-8UXs9yj-ZvK/view?usp=sharing"
              target="_blank">Resume</a></h4>
          <p class="description" style="color:var(--ink-soft);">The link contains downloadable resume</p>
        </div>
```

(`color:#fff` was a pre-existing bug — white text on the `.services .icon-box` cream/paper background was already unreadable before this plan; fixed to match the description-text pattern used everywhere else on the site.)

- [ ] **Step 10: Full-file verification**

Run:
```bash
grep -noE "#[0-9a-fA-F]{3,6}" index.html
```
Expected: no output (zero raw hex colors remain anywhere in `index.html` — everything now goes through `var(--token)`).

Run:
```bash
grep -noE "#[0-9a-fA-F]{3,6}" assets/css/style.css | grep -vE "^(40[2-9]|4[1-4][0-9]|59[0-9]|6[0-4][0-9]|94[2-9]|9[5-9][0-9]|10[0-4][0-9]|107[0-9]|108[0-9]|109[0-8]):"
```
Expected: no output (any remaining hex hits fall only inside the dead-CSS line ranges called out in Global Constraints — adjust the excluded ranges if line numbers have drifted from prior edits, and manually confirm every reported hit is inside `.counts`, `.testimonials`, `.resume`, `.php-email-form`, `.skills .progress`, or `.credits`).

- [ ] **Step 11: Commit**

```bash
git add index.html
git commit -m "Retheme remaining inline colors across Education, Awards, Experience, Skills, Certifications, Links sections; fix two pre-existing markup/contrast bugs"
```

---

## Task 10: Dark mode tokens

**Files:**
- Modify: `assets/css/style.css` (insert dark override block right after the `:root { ... }` block from Task 1)

**Interfaces:**
- Produces: `:root[data-theme="dark"]` overrides for all 16 tokens. No visual effect yet — nothing sets `data-theme` until Task 12.

- [ ] **Step 1: Insert the dark-mode token block**

In `assets/css/style.css`, immediately after the closing `}` of the `:root { ... }` block added in Task 1, insert:

```css
:root[data-theme="dark"] {
  --bg: #1f1e1c;
  --paper: #2a2926;
  --ink: #ede9de;
  --ink-soft: #c9c6bd;
  --ink-faint: #8c8983;
  --line: #3a3936;
  --line-strong: #46453f;
  --accent: #d97757;
  --accent-soft: #3a2e28;
  --accent-bright: #e2916f;
  --accent-strong: #c8663f;
  --accent-deep: #b85f3f;
  --good: #6f9a68;
  --good-bright: #85b17d;
  --good-deep: #547d4d;
  --on-accent: #fff8ea;
}
```

- [ ] **Step 2: Verify**

Run: `grep -n ':root\[data-theme="dark"\]' assets/css/style.css`
Expected: one match.

Run: `grep -c -- "--accent:" assets/css/style.css`
Expected: `2` (one in the light block, one in the dark block).

- [ ] **Step 3: Commit**

```bash
git add assets/css/style.css
git commit -m "Add dark-mode CSS custom property overrides"
```

---

## Task 11: Dark mode toggle button (markup + styling)

**Files:**
- Modify: `index.html:50-55` (header `.social-links`, add sibling `<button>`)
- Modify: `assets/css/style.css` (add `.theme-toggle` rules near `#header .social-links`)

**Interfaces:**
- Produces: `<button id="theme-toggle" class="theme-toggle">` containing an `<i>` icon, present in both the hero header state and the sticky `header-top` state.
- Consumes: `#header.header-top .container`'s `gap: 24px` from Task 3 (no extra spacing CSS needed for that state).

- [ ] **Step 1: Add the toggle button to the header markup**

Replace:

```html
      <div class="social-links">
        <a href="https://www.linkedin.com/in/anh-thu-tran-001064276/" target="_blank" class="linkedin"><i
            class="bx bxl-linkedin"></i></a>
        <a href="https://github.com/tn-anhthu" target="_blank" class="github"><i class="bx bxl-github"></i></a>
        <a href="mailto:anhthutran.tnat@gmail.com" class="google"><i class="bx bxl-google"></i></a>
      </div>
    </div>
  </header><!-- End Header -->
```

with:

```html
      <div class="social-links">
        <a href="https://www.linkedin.com/in/anh-thu-tran-001064276/" target="_blank" class="linkedin"><i
            class="bx bxl-linkedin"></i></a>
        <a href="https://github.com/tn-anhthu" target="_blank" class="github"><i class="bx bxl-github"></i></a>
        <a href="mailto:anhthutran.tnat@gmail.com" class="google"><i class="bx bxl-google"></i></a>
      </div>
      <button type="button" id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
        <i class="bx bx-moon"></i>
      </button>
    </div>
  </header><!-- End Header -->
```

(Note this button lives outside `.social-links`, as its own `.container` child — `#header.header-top .social-links, #header.header-top h2 { display: none; }` from Task 3 does not target `.theme-toggle`, so it stays visible when the header collapses to the sticky bar.)

- [ ] **Step 2: Style the toggle button**

In `assets/css/style.css`, immediately after the `#header .social-links a:hover { background: var(--accent-strong); }` rule (added in Task 3), insert:

```css
#header .theme-toggle {
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--accent);
  color: var(--on-accent);
  line-height: 1;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 0;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.3s;
}

#header .theme-toggle:hover {
  background: var(--accent-strong);
}

#header.header-top .theme-toggle {
  margin-top: 0;
}
```

- [ ] **Step 3: Verify**

Run: `grep -n "theme-toggle" index.html assets/css/style.css`
Expected: matches in both files (the `<button>` + two `<i>`-adjacent references in `index.html`, and the three CSS rules in `style.css`).

Manual check: open `index.html` in a browser — a filled circular button with a moon icon appears near the social icons in the hero, and also next to the nav once a section is opened (sticky header-top state). Clicking it does nothing yet (JS comes in Task 12).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "Add dark mode toggle button markup and styling"
```

---

## Task 12: Dark mode toggle behavior (JS)

**Files:**
- Create: `assets/js/theme.js`
- Modify: `index.html:4-6` (anti-flash inline script in `<head>`)
- Modify: `index.html` end-of-body script list (load `assets/js/theme.js`)

**Interfaces:**
- Consumes: `document.documentElement` (`<html>`), `#theme-toggle` button and its child `<i>` from Task 11, `:root[data-theme="dark"]` CSS from Task 10.
- Produces: `localStorage.getItem('theme')` / `localStorage.setItem('theme', ...)` with values `"light"` or `"dark"`.

- [ ] **Step 1: Add the anti-flash inline script to `<head>`**

Replace:

```html
<head>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <meta charset="utf-8">
```

with:

```html
<head>
  <script>
    (function () {
      var stored = localStorage.getItem('theme');
      var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <meta charset="utf-8">
```

This is a synchronous, blocking, inline script (no `src`, no `defer`) placed first in `<head>` specifically so it runs and sets `data-theme` before the browser paints — avoiding a flash of the wrong theme.

- [ ] **Step 2: Create `assets/js/theme.js`**

```js
(function () {
  "use strict";

  var toggle = document.getElementById('theme-toggle');
  var icon = toggle.querySelector('i');

  function applyIcon(theme) {
    if (theme === 'dark') {
      icon.classList.remove('bx-moon');
      icon.classList.add('bx-sun');
    } else {
      icon.classList.remove('bx-sun');
      icon.classList.add('bx-moon');
    }
  }

  applyIcon(document.documentElement.getAttribute('data-theme'));

  toggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    applyIcon(next);
  });
})();
```

- [ ] **Step 3: Load the script**

Replace:

```html
  <!-- Template Main JS File -->
  <script src="assets/js/main.js"></script>

</body>
```

with:

```html
  <!-- Template Main JS File -->
  <script src="assets/js/main.js"></script>
  <script src="assets/js/theme.js"></script>

</body>
```

- [ ] **Step 4: Verify**

Run: `ls assets/js/theme.js && grep -n "theme.js" index.html`
Expected: file exists; the `<script src="assets/js/theme.js">` line prints.

Manual check (this is the real functional test — do it in an actual browser, not just via grep):
1. Open `index.html`. Confirm it renders in light mode (assuming light OS preference) with a moon icon in the toggle.
2. Click the toggle. Page immediately switches to the dark palette; icon becomes a sun.
3. Reload the page. Dark mode persists (no flash of light mode first) because `localStorage.getItem('theme')` now returns `"dark"`.
4. Click again to switch back to light; reload; confirm light mode persists.
5. Clear `localStorage` (`localStorage.removeItem('theme')` in devtools console) and reload — theme should follow the OS `prefers-color-scheme` setting.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/js/theme.js
git commit -m "Wire up dark mode toggle: anti-flash inline script + persisted theme.js"
```

---

## Task 13: Final QA pass

**Files:** none (verification only)

**Interfaces:** none.

- [ ] **Step 1: Whole-repo hex sweep**

Run:
```bash
grep -noE "#[0-9a-fA-F]{3,6}" index.html
```
Expected: no output.

Run:
```bash
grep -noE "#[0-9a-fA-F]{3,6}" assets/css/style.css
```
Expected: output only from the documented dead-CSS blocks (`.testimonials`, `.resume`, `.counts`, `.credits`, `.contact .php-email-form`, `.skills .progress`). For every line reported, open `assets/css/style.css` at that line and confirm it's inside one of those blocks — if any hit is outside them, go back and convert it before proceeding.

- [ ] **Step 2: Font sweep**

Run:
```bash
grep -n "Open Sans\|Raleway\|Poppins" index.html assets/css/style.css
```
Expected: no output.

- [ ] **Step 3: Manual browser QA (light mode)**

Serve the site locally and open it:
```bash
python3 -m http.server 8000
```
Visit `http://localhost:8000`. Walk through every nav section (Home, About, Education, Experience, Projects, Skills, Certifications, Resume, Contact) and confirm:
- Headings render in Fraunces, body copy in Newsreader, nav/filter labels in uppercase JetBrains Mono.
- Background is the warm cream `--bg`, text is readable everywhere (no invisible white-on-light or dark-on-dark text).
- The Interests icons and Awards icons show the new terracotta/olive rotation, not the old rainbow colors.
- Portfolio card hover overlays show clearly legible cream text/icons.
- The sticky header (click any nav link) keeps "Anh Thu Tran" on one line with visible spacing before "Home".

- [ ] **Step 4: Manual browser QA (dark mode)**

Click the theme toggle. Repeat the same section walkthrough and confirm:
- Background/surfaces switch to the dark warm-charcoal palette, text switches to the cream tones, accent stays a warm terracotta/coral.
- Nothing goes invisible: portfolio hover overlay text, icon-on-accent-circle glyphs (Skills/Certifications/Links `.icon` circles), and the theme-toggle icon itself all stay legible.
- Toggle back to light mode; confirm a clean switch back with no leftover dark-mode styling stuck anywhere.

- [ ] **Step 5: Responsive check**

Resize the browser (or use devtools device toolbar) to a mobile width (~375px) and a tablet width (~768px). Confirm:
- Mobile nav (hamburger) opens/closes and uses the retheme colors.
- Header text doesn't overflow or overlap at any width.

- [ ] **Step 6: Final commit (only if Step 1-5 required fixes)**

If any QA step above required a follow-up edit, stage and commit it with a message describing what was fixed. If everything already passed clean from Tasks 1-12, there is nothing to commit here — this task is verification-only.
