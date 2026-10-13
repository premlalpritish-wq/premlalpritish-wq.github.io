# Redesign Plan — Pritish Premlal Personal Site

**Repository:** `D:\personal-site` (root `index.html`, `style.css`, `script.js`)
**Live site:** `https://premlalpritish-wq.github.io/`
**Date:** 13 October 2026
**Inputs:** `design-reference/audit.md`

---

## 0. Decisions Confirmed

| Question | Decision |
|---|---|
| Contact email | `premlalpritish@gmail.com` (matches the live site) |
| Portrait photo | **No.** Identity stays typographic. |
| Restructure | **Consolidate 9 sections → 7.** ~30% page-length reduction, no content lost. |
| Theming | **Dark only**, polished. |
| Architecture | Keep plain HTML/CSS/JS. No framework, no build step, no dependencies. |
| ScaleUp AI site | Link only. **Not modified.** `https://premlalpritish-wq.github.io/scaleup-ai-website/` |

---

## 1. Positioning & Narrative Arc

> Founder and builder working on AI, scientific computing and biotechnology — turning difficult scientific and technical problems into working products.

The page must read, in order: **who** → **what is built** → **how I work** → **proof it works on me too** → **where the skill came from** → **what I want next** → **how to reach me**.

Reference order was Hero → logos → about → stats → product → personal. Mine inverts the middle: **work comes before self-description**, because for a founder with early-stage evidence, the work is the argument.

---

## 2. Target Section Map (old → new)

| # | New section | Anchor | Replaces / absorbs | Source content |
|---|---|---|---|---|
| 1 | Hero | `#home` | Hero | Old hero + ScaleUp AI status + all outbound links |
| 2 | Work | `#work` | Old `#projects` + *04 Other Builds* | ScaleUp AI (**new**), Animocare, qPCR pipeline (**new**), 4 exploratory builds |
| 3 | Method | `#method` | Old `#thesis` + `#approach` + part of *08 Direction* | Thesis narrative + 5-step loop + 6 principles |
| 4 | Evidence | `#evidence` | Old `#evidence` | Project:Me, physique, skill experiments |
| 5 | Background | `#background` | Old *06 Foundation* + *07 Education* | Skills matrix + education timeline |
| 6 | Statement | — | Old statement band + *08 Direction* | Manifesto quote + the long-term bet |
| 7 | Contact | `#contact` | Old `#contact` | Email, GitHub, LinkedIn, ScaleUp AI |

**Navigation becomes:** `Work · Method · Evidence · Background · Contact` — 5 items, matching the reference's density.

**Content preserved verbatim (not invented):** every project description, every process step, every outcome claim, the education dates and institutions, the method steps, the manifesto quote.

**Content added — only what's verifiable:**
- ScaleUp AI entry, described strictly from its own public README: *"turns scientific literature into structured, machine-readable process knowledge."* Marked `v0.1 · PROTOTYPE`. No capability, accuracy or traction claims.
- GitHub profile link `https://github.com/premlalpritish-wq`
- LinkedIn `https://www.linkedin.com/in/pritish-premlal-9430022a1/`
- ScaleUp AI live site `https://premlalpritish-wq.github.io/scaleup-ai-website/`
- qPCR pipeline `https://github.com/premlalpritish-wq/automated-qPCR-reporting-pipeline`

**Nothing is invented.** No metrics, no testimonials, no logos, no fake numbers, no fake employer marks.

---

## 3. Design System

### 3.1 Retained identity

The dark editorial look, the lime accent, the tight negative tracking and the numbered section eyebrows are this site's own voice and stay. The reference's coral palette, geometry, copy and assets are not used.

### 3.2 Tokens

```css
--bg:            #090909      /* unchanged */
--surface:       #101010
--surface-2:     #151515
--line:          rgba(255,255,255,.085)
--line-strong:   rgba(255,255,255,.16)
--text:          #f4f4f5
--muted:         #a3a3ab      /* 7.3:1 on --bg   (was #969696, 6.7:1) */
--muted-2:       #7c7c86      /* 4.6:1 on --bg   (was #555, 2.55:1 — FIXED) */
--accent:        #c7ff4a      /* 16.9:1 on --bg — unchanged */
--accent-2:      #f0b429      /* new secondary, 9.4:1 on --bg */
--accent-ink:    #0b0f04      /* text on accent fills */
--content:       1180px
--measure:       68ch
```

**Typefaces** — system stack, zero network requests:
- Display/body: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- Technical/labels: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`

The mono pairing is the new signature — every eyebrow, status, tag, step number, filename and metric uses it. It costs zero bytes and immediately separates "technical artefact" from "editorial prose".

### 3.3 Contrast fixes (all verified against WCAG 2.1 AA)

| Element | Before | After | Measured | Target |
|---|---|---|---|---|
| loop-arrow `#555` on `#101010` | 2.55:1 | `#7c7c86` | **4.61:1** | 4.5:1 |
| footer `#666` on `#090909` | 3.47:1 | `#7c7c86` | **4.82:1** | 4.5:1 |
| trajectory arrow `#657c39` on `#10150b` | 3.96:1 | `#8b9a5c` | **6.06:1** | 4.5:1 |

Full token contrast on `--bg` `#090909`:
`--text #f4f4f5` 18.12:1 · `--accent #c7ff4a` 16.91:1 · `--accent-ink` on accent 16.44:1 ·
`--muted #a3a3ab` 7.95:1 · `--muted-2 #7c7c86` 4.82:1 · `--accent-2 #f0b429` 10.68:1 ·
`--trajectory #8b9a5c` 6.06:1 on its band.

---

## 4. Improvement → Destination Map

Every improvement mapped to the exact section it lands in.

### 4.1 Site chrome

| # | Improvement | Destination | Rationale |
|---|---|---|---|
| C1 | **Scroll-progress hairline** — fixed 1px lime bar, `transform: scaleX()`, rAF-throttled | Global (`.progress`) | On a ~9,000px page, position awareness is essential. Reference §4.2. |
| C2 | **Sticky nav with live section highlighting** — `IntersectionObserver` sets `aria-current="true"` on the active link | `.navbar` | Fixes a11y gap (ref had colour-only state) and adds orientation. |
| C3 | **Working mobile menu** — animated hamburger → ✕, `aria-expanded`, `aria-controls`, closes on Escape / outside click / link click | `.menu-toggle` | Current toggle has no ARIA state and no open styling. |
| C4 | **`:focus-visible` ring on every interactive element** — 2px lime + 2px offset | Global | Currently absent; keyboard users get poor defaults on dark. |
| C5 | **Outbound link row** — GitHub, LinkedIn, ScaleUp AI, Email | `.navbar` (compact) + `.linkrow` (footer, hero) | Fixes critical issue #1 — currently zero outbound links. |
| C6 | **JS-fail-safe reveal** — `<html class="js">` gate + 1.5s failsafe that force-reveals | Global | Fixes #11: content must never depend on JS to be readable. |

### 4.2 Section 1 — Hero (`#home`)

| # | Improvement | Rationale |
|---|---|---|
| H1 | **Status pill** "AVAILABLE FOR PROBLEMS WORTH SOLVING" with a pulsing lime dot | Refines ref §4.3 pill; sets founder intent in 4 words |
| H2 | **H1 scale raised** `clamp(3.4rem, 9vw, 8.2rem)`, tracking `-0.07em`, 3-line max | More memorable opening; retains original voice |
| H3 | **Rotating focus line** — mono ticker cycling `ScaleUp AI` → `SCIENTIFIC COMPUTING` → `BIOTECHNOLOGY` → `AUTOMATION`, with a block cursor | Ref §4.3 principle (communicate current focus) in a distinct mono treatment |
| H4 | **Domain pills** — 4 mono chips: `AI SYSTEMS`, `SCIENTIFIC COMPUTING`, `BIOTECH`, `AUTOMATION` | Ref §4.3 pill taxonomy, restyled |
| H5 | **Two CTAs** — "See the work" (filled lime) + "Get in touch" (ghost) | Clear primary path |
| H6 | **Replace empty orbs with an animated system diagram** — inline SVG process graph: 6 nodes (`INGEST → CHUNK → EXTRACT → VALIDATE → GRAPH → REPORT`) with animated dashed edges and travelling pulses | Fixes #6 (empty hero). Memorable + on-positioning (AI/scientific computing). Zero image bytes, ~2 KB SVG, `prefers-reduced-motion` respected |
| H7 | **Scroll cue** — thin vertical rule with a descending dot | Ref §4.3 affordance |
| H8 | **Meta row** — `MSc Biotechnology` · `University of York` in mono | Credibility in one line |

### 4.3 Section 2 — Work (`#work`)

| # | Improvement | Rationale |
|---|---|---|
| W1 | **ScaleUp AI as the flagship**, placed first | Critical gap #2. Gets a full-width featured card |
| W2 | Featured card: oversized `SCALEUP AI` wordmark, `v0.1 · PROTOTYPE` amber status, one-line description from its own README, 6-stage pipeline rail, and three explicit capability chips | Ref §4.7 "Currently Building" pattern: one hero case study per flagship product, with a media/artefact |
| W3 | **"Currently in scope" rail** under the flagship: the six published pipeline stages | Real, verifiable detail = evidence of actual work |
| W4 | **Honesty strip** on the flagship — an explicit "what this is not" note | Mirrors the existing qPCR "engineering demonstration, not a diagnostic tool" honesty. Differentiates from inflated founder sites. |
| W5 | **Animocare** becomes the second featured project, with the existing loop rail | Preserved content |
| W6 | **qPCR pipeline** becomes the third project, with a real **GitHub link** and its module list (`parser.py → cleaner.py → qc.py → analysis.py → plots.py → reporter.py`) as mono chips | Restores a link that existed on the live site and was lost in the repo draft |
| W7 | **4 exploratory builds** compressed into a single 2×2 grid with hover lift | Old *04 Other Builds* collapsed into Work |
| W8 | **Consistent project anatomy** — every card: index · category · title · one-line problem · mechanism rail · status · links | Makes the section scannable and comparable |
| W9 | Project cards get **hover state**: border brightens to lime at 22%, background lifts, card translates −3px | Ref's hover vocabulary, applied where it has meaning |

### 4.4 Section 3 — Method (`#method`)

| # | Improvement | Rationale |
|---|---|---|
| M1 | **Thesis narrative** kept but cut from 4 paragraphs to 2 + the large-type pull quote | Density; the original repeats itself across three sections |
| M2 | **Loop rail** — horizontal 5-step rail (`DEFINE → MEASURE → DIAGNOSE → INTERVENE → ITERATE`) with numbered nodes and connecting line | Turns a text list into a diagram. Consolidates old thesis + approach |
| M3 | **6 principles** compressed to a 3×2 grid of short cards with a single line each | Retains the content, halves the word count |
| M4 | Each principle card gets a **hover highlight** and a lime top rule | Micro-interaction |

### 4.5 Section 4 — Evidence (`#evidence`)

| # | Improvement | Rationale |
|---|---|---|
| E1 | **Reorder** — Project:Me first (it's the most substantial), then physique, then skill | Old order ran small→small→large |
| E2 | **Project:Me gets the featured treatment** — trajectory rail + active status | Already the featured card; promote it |
| E3 | Shared **experiment card anatomy**: number · category · status chip · title · question · detail rows | Consistency with Work section |
| E4 | **Status chips** get semantic colour: lime = active, neutral = completed | Currently only `.active` is styled |
| E5 | Keep the "THE LOOP" rail, restyled with `--muted-2` arrows (contrast fix) | Fixes #9 |

### 4.6 Section 5 — Background (`#background`)

| # | Improvement | Rationale |
|---|---|---|
| B1 | Merge old Foundation + Education into one section | Consolidation target |
| B2 | **4 skill domains** as a bordered 2×2 with mono labels and skill chips (converted from `·`-separated strings into individual chips) | Much scannable; chips use `+` separators in the HTML source for screen readers |
| B3 | **Education timeline** as two rows: date range · degree · institution | Preserved, tightened |
| B4 | Alternating `muted-section` background | Rhythm |

### 4.7 Section 6 — Statement

| # | Improvement | Rationale |
|---|---|---|
| S1 | Keep the lime full-bleed band — the site's best moment | Strongest original asset |
| S2 | Absorb the old *08 Direction* long-term bet as a second, quieter block inside the band | Removes a whole section |
| S3 | Oversized closing line + `LET'S BUILD SOMETHING` micro-caption | Punctuation |

### 4.8 Section 7 — Contact + footer

| # | Improvement | Rationale |
|---|---|---|
| T1 | **Real email** `premlalpritish@gmail.com` | Fixes critical #3 |
| T2 | **Large email CTA** as the primary action | One obvious next step |
| T3 | **Full link row** — Email, GitHub, LinkedIn, ScaleUp AI, each with a descriptive `aria-label` and `rel="noopener noreferrer"` | Fixes critical #1 |
| T4 | Footer gains the link row + year + "Built from scratch" | Currently a single muted line |

---

## 5. Bug Fixes Carried Into Implementation

| # | Fix | Where |
|---|---|---|
| F1 | 4px mobile overflow from `.company-status` | Grid becomes `1fr auto` with `flex-wrap: wrap` + `min-width: 0`; `.section` width uses `calc(100% - 32px)` |
| F2 | Contrast: `#555` → `#7c7c86`; footer `#666` → `#7c7c86`; `#657c39` → `#8b9a5c` | `.experiment-loop b`, `footer`, `.project-trajectory i` |
| F3 | Reveal depends on JS | `html.js` gate + failsafe timer + `prefers-reduced-motion` override |
| F4 | No `:focus-visible` | Global rule for `a`, `button` |
| F5 | Menu toggle has no ARIA state | `aria-expanded`, `aria-controls`, `.open` styling, Escape handler |
| F6 | Nav has no current-section state | `IntersectionObserver` + `aria-current` |
| F7 | No scroll-progress | New `.progress` element |
| F8 | No outbound links | Link row |
| F9 | Placeholder mailto | Real address |
| F10 | Emoji/`·` dependence in labels | Replaced with mono uppercase + tracking |

---

## 6. Technical Approach

| Concern | Approach | Measured |
|---|---|---|
| Architecture | **Unchanged.** 3 files, no build, no dependencies, GitHub Pages ready. | — |
| New assets | One inline `<svg>` + a data-URI favicon. No external images, no webfonts, no CDN. | 0 third-party requests |
| Payload | HTML + CSS + JS | **84,088 bytes** uncompressed |
| JS | Vanilla: rAF-throttled progress bar, mobile nav, `IntersectionObserver` reveals + active nav, failsafe timers, ticker. | 7,327 B |
| Performance | No layout-animating properties; motion is `transform`/`opacity`; SVG pulses use SMIL `animateMotion`. | 0 console messages |
| Accessibility | Landmarks, one `h1`, sequential headings, skip link, visible focus, `prefers-reduced-motion`, `prefers-contrast`. | **Lighthouse a11y 1.00** |
| Responsive | Breakpoints `1080px`, `860px`, `560px`, `380px`. | 0px overflow at 320 / 360 / 390 / 430 / 768 / 834 / 1024 / 1280 / 1440 / 1920 |
| Verification | Console check, 10-width overflow sweep, Lighthouse, contrast table, keyboard walkthrough, no-JS and reduced-motion passes, before/after screenshots. | `test-results.json` |

---

## 7. Page-Length Result

**Planned target vs. measured outcome:**

| | Before | Target | Measured |
|---|---|---|---|
| Desktop 1440 | 12,891px | ~9,000px | **11,208px** (−13%) |
| Tablet 834 | 12,965px | — | **12,996px** (+0.2%) |
| Mobile 390 | 15,313px | ~11,000px | **15,157px** (−1%) |
| Sections | 9 | 7 | **7** ✅ |

**Why the target was not met.** The −30% target assumed consolidation alone would dominate the result. In practice the redesign also *added* content the previous page did not have:

- a full **ScaleUp AI** project card (~1,100px on mobile) — required by the brief
- the **qPCR pipeline** project card, restored from the live site but absent from the repo draft
- GitHub / LinkedIn / ScaleUp AI link rows in the hero and footer
- the "scope, stated plainly" honesty strip

The consolidation (9 → 7 sections) removed roughly 3,000px of desktop height; the added content put most of it back. The net result is a shorter, much denser desktop page and a mobile page of essentially the same length that now shows real work instead of padding. Mobile density was explicitly reduced (card padding, rail padding, detail-row padding, section rhythm) to offset it.

---

## 8. Out of Scope

- The ScaleUp AI website (`premlalpritish-wq/scaleup-ai-website`) — **not modified**, only linked.
- `pritish-website-updated/`, `pritish-website-updated (1)/` and the two `.zip` archives — left untouched as historical snapshots of the live site.
- No analytics, no cookie banner, no CMS, no deploy configuration changes.
- No push, no deploy, no git initialisation without approval.

---

## 9. Approval Gate

Implementation starts only after this plan is approved. Nothing is pushed or deployed.
