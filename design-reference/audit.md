# Reference Site Audit — Design Patterns & Interaction Analysis

**Subject:** `https://www.aashnadoshi.com/` (personal founder site, single-page)
**Date:** 13 October 2026
**Method:** Headless Chromium (Playwright 1.64) at 1440×900, 834×1112, 390×844; DOM + computed-style inspection via `getComputedStyle`; network request log; Lighthouse audit; manual hover/interaction scripting.
**Artifacts:** `design-reference/screenshots/reference/` (full-page + per-section captures, light and dark, hover states, `ref-metrics.json`, `ref-report.json`)

> **Usage note.** This document records *design technique* only. No personal copy, branding, imagery, video or font assets from the reference site are reproduced here or in the redesign. Screenshots are retained locally as internal design reference only and must not be republished or used in the redesign.

---

## 1. Technical Profile

| Aspect | Finding |
|---|---|
| Framework | React 18 + Vite SPA, Tailwind CSS v3, shadcn/ui primitives |
| Routing | Client-side router, **no Netlify SPA fallback configured** |
| Fonts | System UI stack only (`ui-sans-serif, system-ui, sans-serif`) — zero webfont requests |
| Total DOM nodes | 272 |
| Sections on home | 6 |
| Page height | 3124px desktop / 3404px tablet / 4324px mobile |
| Horizontal overflow | 0px at all three breakpoints |
| Console errors | 0 |
| Lighthouse | Accessibility 0.96 · Best Practices 1.00 · SEO 1.00 |
| Payload | 1 JS chunk, 1 CSS chunk, 4 PNG logos, 1 JPG portrait, 2 MP4 |

**Requests on load:** document, 1 JS (~742ms), 1 CSS (~464ms), `nyc-skyline.jpg`, `aashna.jpg`, `bounty-signet.mp4`, `bounty-logo-animation.mp4` (re-requested twice), 4 logo PNGs.

---

## 2. Page Structure & Section Ordering

```
<nav>  sticky, translucent
<main>
  ├─ [fixed] 1px scroll-progress bar (top of viewport, z-60)
  ├─ [fixed] pointer-events-none ambient glow layer (z-55, blend-screen blobs)
  ├─ SECTION 1  Hero                     min-h-[90vh]   py-32   background photo + overlay
  ├─ SECTION 2  Experience & Affiliations py-12          logo marquee
  ├─ SECTION 3  About                    py-20          2-col: copy | portrait card
  ├─ SECTION 4  Stats band               py-16          4-col animated counters
  ├─ SECTION 5  Currently Building       py-20          2-col: copy | brand video
  ├─ SECTION 6  "The Little Things"      py-20          3-col personal card grid
<footer>  social icon row + copyright
```

**Heading hierarchy observed**

| Level | Size @1440 | Weight | Text pattern |
|---|---|---|---|
| `h1` | 96px / lh 1.0 | 700 | Person's name only |
| `h2` | 36px / lh 1.11 | 700 | Conversational, second-person hook ("Hey there!") |
| `h3` | 18px / lh 1.56 | 600 | Card titles |

---

## 3. Design System

### 3.1 Colour tokens (HSL custom properties)

```
--background        0 0% 100%     → #ffffff
--foreground      222.2 84% 4.9%  → #020817
--primary            0 73% 69%    → #ea7676  (coral)
--primary-foreground 0 0% 100%    → #ffffff
--muted            210 40% 96.1%  → #f1f5f9
--muted-foreground  215.4 16.3% 46.9% → #64748b
--border           214.3 31.8% 91.4% → #e2e8f0
--radius            .75rem  (12px)
```

Dark mode flips `background/foreground/card/muted` only — **`--primary` is identical in both themes**, which is why the coral CTA survives a theme switch without a second token. This is an efficient pattern.

### 3.2 Type scale (Tailwind steps only)

| Token | px | Usage |
|---|---|---|
| `text-3xl` | 30 | small card heading |
| `text-4xl` | 36 | section `h2` |
| `text-5xl` | 48 | hero `h1` (mobile) |
| `text-7xl` | 72 | hero `h1` (md) |
| `text-8xl` | 96 | hero `h1` (lg) |
| `text-sm` | 14 | nav links, buttons, eyebrow labels, card meta |
| `text-xs` | 12 | copyright, micro-labels |

Line-height is *not* tightened — it stays at Tailwind defaults (1.0–1.5). No negative letter-spacing. This is the single biggest typographic difference from the current personal site.

### 3.3 Spacing & layout

- Container: `max-width: 1400px`, `padding-inline: 16px`, `margin-inline: auto`
- Section rhythm: **128 / 80 / 64 / 48** px — a deliberate 4-step ladder, not one uniform value
- Grid gaps: **48px** (two-column editorial), **32px** (four-up cards), **16px** (tight card grid)
- Inner content caps: `max-w-6xl` (1152px) for two-column sections, `max-w-5xl` (1024px) for the personal grid, `max-w-4xl` (896px) for hero copy, `max-w-4xl` for the stats band

### 3.4 Surfaces

| Radius | Applied to |
|---|---|
| 9999px | Pills / badges |
| 10px | Buttons, icon buttons |
| 12px | Small cards ("Little Things") |
| 16px | Portrait card, brand video frame |

Elevation is used sparingly and in a clear hierarchy:
`0 1px 2px` (hairline) → `0 10px 15px -3px` (card) → `0 25px 50px -12px` (hero media) → focus ring `primary/30 0 0 0 4px`.

**Border discipline:** every surface is `1px solid rgba(border, .4–.6)` plus a muted-tint background — **no hard borders anywhere.**

---

## 4. Section-by-Section Pattern Breakdown

### 4.1 Navigation
- `position: sticky; top: 0; z-50`, 64px tall (`h-16`), `background/95` with `backdrop-blur(8px)`; when the browser lacks backdrop-filter support it falls back to a more opaque `background/60`.
- Wordmark left in `--primary`, 20px/700. Links right, 14px/500, 32px gaps, `--muted-foreground`, current page in `--primary`.
- Active link is communicated by **colour only** — no underline, no pill, no `aria-current`.
- Two separate "Toggle theme" buttons exist in the DOM simultaneously (one desktop `md:flex`, one mobile `md:hidden`), both correctly labelled via a visually-hidden span.
- **No visible mobile menu is wired in this build** — the `md:hidden` container renders the theme button plus a second icon button with no accessible name.

### 4.2 Scroll-progress bar
Fixed 1px rail at the very top, `z-60`. Inner fill uses `background: linear-gradient(to right, primary, primary/70, primary)`, `transform-origin: left`, `transition: transform 100ms ease-out`, plus `box-shadow: 0 0 12px primary/60`. Cheap, high-signal feedback.

### 4.3 Hero — the strongest idea on the page
Four stacked absolutely-positioned layers behind the copy:

1. `bg-cover bg-center` photo, pre-scaled to `scale-110`, `transition: transform 300ms ease-out` — **the image drifts slightly as the pointer/scroll moves** (parallax without a scroll listener).
2. Vertical scrim `from-background/40 via-background/70 to-background` — guarantees text legibility over any photo.
3. Two more `opacity-60` transform layers for parallax depth.
4. Two `blur-3xl` radial blobs (`bg-primary/20`, `bg-primary/10`) with an `animate-blob` keyframe that morphs `border-radius` — cheap organic motion, GPU-cheap.

Content stack, centred, `max-w-4xl`, `space-y-8`:
- `h1` — name only, 96px, with a **gradient "shimmer" text fill** (`background-clip: text` + animated gradient position) and `drop-shadow-sm` for separation from the photo.
- Static tagline with pipe separators.
- A **typewriter line** (`currently <rotating phrase> |▌`) — monospace, `--primary`, live cursor block.
- Four **icon pills** with lucide icons — domain tags. These do the job of a skills row without becoming one.
- A single filled CTA.

Section is `min-h-[90vh] flex items-center`, `py-32`. Centring + 90vh means the hero always resolves to roughly one screen.

### 4.4 Logo marquee
`flex animate-marquee w-max` containing the logo set **triplicated**, inside a wrapper masked with
`mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent)`.
Each logo: `h-20 w-40 shrink-0 grayscale opacity-70` → `hover:grayscale-0 hover:opacity-100`, `transition: all 300ms`.
Triplication + `w-max` is what makes the loop seamless. The mask is the detail that stops it looking broken at the edges.

### 4.5 About — portrait treatment
Two-column `md:grid-cols-2 gap-12 items-center`:
- **Left:** one oversized `h2` set in sentence case as a greeting, then two body paragraphs with key nouns **wrapped in a `Badge` component that reuses the primary token** (coral chip), then one outline CTA.
- **Right:** a card — soft primary-tinted background, `rounded-2xl`, `shadow-2xl` — containing a **circular portrait** with a `ring` border in the primary colour, a bold `h3` caption and a one-line sub-caption.

The circular crop + coloured ring is the single strongest "person" signal on the site, and it costs one `border-radius: 9999px` and one `ring`.

### 4.6 Stats band
`border-y`, `py-16`, `grid-cols-2 md:grid-cols-4 gap-8`, centred inside `max-w-4xl`.
Each cell: a large number (`text-4xl font-bold`, primary) + a `text-xs uppercase tracking-widest` label in muted grey.
Numbers **count up** when scrolled into view.

### 4.7 "Currently Building"
`bg-muted/30` + `border-y` + a full-bleed decorative layer at `opacity-[0.15]` with
`mask-image: radial-gradient(70% 70% at 50% 50%, black, transparent)` — a faint technical grid/dot field fading out from the centre.
Two-column: eyebrow → `h2` (company name picks up the primary colour as the second line) → paragraph → small icon buttons, against a large **autoplaying, looping, muted 16:9 brand video** in a `rounded-2xl border shadow-2xl` frame.

### 4.8 "The Little Things"
`text-center` heading block, then `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
Each card: **tinted rounded square icon chip** (primary/10 bg, primary icon, 10px radius) → uppercase tracked micro-label → short value line. Humanising, low-density, visually breaks up the page.

### 4.9 Footer
Centred, `border-t`, `py-8`. Row of four 40×40 rounded icon buttons (Lucide icons, 10px radius) with `hover:text-primary`, then a 14px muted copyright line. No sitemap.

---

## 5. Motion & Interaction Inventory

| Interaction | Implementation | Cost |
|---|---|---|
| Scroll progress | `transform: scaleX()` on a fixed 1px bar, 100ms ease-out | negligible |
| Navbar tint | `bg/95` + `backdrop-blur`, sticky | negligible |
| Hero parallax | `transition: transform` on 3 pre-scaled layers | negligible |
| Ambient blobs | `@keyframes blob` morphing `border-radius`, `blur-3xl`, `mix-blend` | low |
| Shimmer text | animated `background-position` on a clipped gradient | low |
| Typewriter | JS string rotation with a blinking block cursor | low |
| Count-up | JS `requestAnimationFrame` on `IntersectionObserver` entry | low |
| Logo marquee | CSS `@keyframes marquee` translating `-50%` | negligible |
| Card hover | `grayscale/opacity` transition, 300ms | negligible |
| Link/button hover | `color` + `bg-primary/90` transitions | negligible |
| Reveal on scroll | `fade-in-up` (translateY 40px → 0, 800ms) | low |

Every animation is either a compositor-only property (`transform`, `opacity`) or a short opacity crossfade. Nothing animates layout.

---

## 6. Accessibility Findings

**Lighthouse 0.96.** Passing: `heading-order`, `link-name`, `button-name`, `image-alt`, `aria-hidden-focus`, `meta-description`, `html-has-lang`.

**Failing — `color-contrast` (2 nodes):**

| Element | Ratio | Detail |
|---|---|---|
| Primary CTA button | **2.85:1** | `#ffffff` on `#ea7676` @14px/500 — needs 4.5:1 |
| Coral eyebrow label | **2.78:1** | `#ea7676` on `#fbfcfd` @14px — needs 4.5:1 |

Root cause: a mid-lightness coral is used as **both** a surface fill and a text colour. The token is correct; the two roles are not.

**Other observations**
- Active nav link has no `aria-current` and no non-colour affordance.
- Icon-only social buttons in the footer have no accessible names.
- Two identically-labelled theme buttons exist in the DOM at once; only visibility differs.
- Mobile menu button is present but unlabelled and appears non-functional.
- Animations (marquee, blob, shimmer, typewriter) run indefinitely — **no `prefers-reduced-motion` block was found** in the shipped stylesheet.
- The scroll-reveal wrapper means content depends entirely on JS to become visible.

---

## 7. Bugs & Anti-Patterns Observed (do **not** copy)

1. **Every nav link 404s.** `/projects`, `/podcast`, `/press`, `/contact` all return Netlify's "Page not found" card. A missing SPA rewrite makes the primary navigation worthless.
2. **Scroll-reveal is fragile.** On a slow scripted scroll, whole sections (About, Currently Building, Little Things, and the stat numbers) stayed at `opacity: 0`, leaving ~1000px of blank page. A first capture produced a 2978px page where the About section and all stats rendered empty. Content should never depend on an observer to become readable.
3. **Contrast failures** on the two highest-salience coral elements (see §6).
4. **No `prefers-reduced-motion` support.**
5. **Copyright says "© 2024"** — hard-coded year.
6. Marquee duplicates the logo set 3× in the DOM; assistive tech reads the same alt text nine times.
7. Nav active-state relies on colour alone.

---

## 8. What Is Worth Taking (Principles Only)

| # | Principle | Why it works |
|---|---|---|
| 1 | **One dominant hero image with a legibility scrim**, not a decorative gradient | Gives a founder site an immediate sense of place and personality |
| 2 | **Name at maximum scale, tagline beneath** | The `h1` is a single proper noun — instantly unambiguous |
| 3 | **A rotating line of intent** ("currently ___") | Communicates motion and current focus without a CV |
| 4 | **Icon pills as a domain taxonomy** | Compact, scannable, replaces a skills list |
| 5 | **Scroll-progress hairline** | Perceptible page-length awareness at near-zero cost |
| 6 | **Circular portrait with a coloured ring inside a tinted card** | Cheap, high-impact "human" signal |
| 7 | **Count-up numbers in a bordered band** | Turns achievements into a scannable strip |
| 8 | **One hero case-study per flagship product, with media** | "Currently building" proves the work exists |
| 9 | **Edge-masked logo marquee** | Social proof without a wall of imagery |
| 10 | **Humanising card grid** | Breaks the résumé tone; makes the page memorable |
| 11 | **Consistent 16/32/48/128 spacing ladder** | Section rhythm reads as designed, not accidental |
| 12 | **One primary token reused in both themes** | Minimal token surface, no theme-specific drift |
| 13 | **Dark mode** | Expected default for a technical audience |

**Explicitly not taken:** the coral hue, the exact copy, the gradient-shimmer `h1`, the typewriter cursor, the "fun facts" grid, the emoji, the layout geometry, and every visual asset.

---

## 9. Current Personal Site — Baseline Audit

### 9.1 Repository state (`D:\personal-site`)

| File | Size | Status |
|---|---|---|
| `index.html` | 32,228 B | 1,212 lines — **newer draft, not deployed** |
| `style.css` | 22,115 B | 1,472 lines |
| `script.js` | 2,097 B | 101 lines |
| `pritish-website-updated/` | 18 KB | snapshot of the **live** site |
| `pritish-website-updated (1)/` | 18 KB | second snapshot of the live site |
| `pritish-website-updated*.zip` | 8 KB | archives of the live site |

The repository is **not a git repository**. Root files and the deployed site differ substantially:

| | Root draft (repo) | Live `premlalpritish-wq.github.io` |
|---|---|---|
| Nav | Thesis / Evidence / Projects / Approach / Contact | Thesis / Evidence / Animocare / How I work / Background |
| Experiments | Physique, Skill, Project:Me | Physique, Skill, qPCR pipeline, Animocare |
| ScaleUp AI | **absent** | **absent** |
| GitHub link | **absent** | present |
| LinkedIn link | **absent** | present |
| Contact email | `mailto:your-email@example.com` (**placeholder**) | `mailto:premlalpritish@gmail.com` |
| Page height (1440) | 12,891px | 10,179px |

### 9.2 Strengths to keep

1. **No dependencies, no build step.** Three files, ~56 KB total, deployable to GitHub Pages as-is.
2. **Strong dark identity** — near-black `#090909` with a lime accent reads as technical and confident.
3. **Excessive negative letter-spacing on display type** (`-.055em` to `-.075em`) gives the current draft a distinctive editorial voice the reference lacks.
4. **Honest content model** — "Evidence", "Working hypothesis", "Trajectory", explicit "not a claim that the problem is already solved" caveats. Rare and worth protecting.
5. **Numbered section eyebrows** (`01 — THE THESIS`) give a clear spine through a very long page.
6. **`prefers-reduced-motion` block already present.**
7. **Real, specific project detail** (the qPCR pipeline's QC/analysis/output breakdown) — genuine evidence of work.
8. **Lime full-bleed statement band** breaks the dark page effectively.

### 9.3 Weaknesses

| # | Issue | Severity | Detail |
|---|---|---|---|
| 1 | **No outbound links at all** | **Critical** | No GitHub, LinkedIn, email (placeholder), or ScaleUp AI. A founder site with no reachable proof of work. |
| 2 | **ScaleUp AI entirely missing** | **Critical** | The flagship project is not represented. Live URL: `https://premlalpritish-wq.github.io/scaleup-ai-website/` |
| 3 | **Contact link is a placeholder** | **Critical** | `mailto:your-email@example.com` — will fail for every visitor. |
| 4 | **4px horizontal overflow on mobile** | High | `.company-status` ("ACTIVE") pushed past 390px viewport inside `.company-project-top`. Verified: `scrollWidth 394 / clientWidth 390`. |
| 5 | **Page far too long** | High | 12,891px desktop / 15,313px mobile. Nine numbered sections; several repeat the same idea (Thesis ≈ Approach ≈ Direction). |
| 6 | **Hero visual is empty** | High | Two CSS-only concentric circles with a rotation animation. It is a placeholder, not a visual. |
| 7 | **No scroll-progress feedback** | Medium | On a 13,000px page there is no indication of position or length. |
| 8 | **No portrait / human signal** | Medium | The reference's strongest trust device is entirely absent. |
| 9 | **Contrast failures** | Medium | `.experiment-loop b` `#555` on `#101010` = **2.55:1** (needs 4.5:1); footer `#666` on `#090909` = **3.47:1**; `.project-trajectory i` `#657c39` on `#10150b` = **3.96:1**. |
| 10 | **No mobile menu button styling** | Medium | `.menu-toggle` exists but has no `aria-expanded`, no `aria-controls`, and the bar never animates to an "open" state. |
| 11 | **Reveal depends on JS** | Medium | `script.js` sets inline `opacity: 0` before observing. If JS fails, six content types are permanently invisible. |
| 12 | **No `:focus-visible` styling** | Medium | Keyboard users get browser defaults on a dark background. |
| 13 | **Reveal has no stagger** | Low | All 24+ elements animate simultaneously per section. |
| 14 | **No dark/light or theme control** | Low | Acceptable given the identity, but noted. |
| 15 | **Emoji/text special characters** | Low | `·` and `→` used heavily; the `01 — THE THESIS` eyebrows rely on the em-dash rhythm. |
| 16 | **Contact/footer redundancy** | Low | Footer is a single muted line; no social icons anywhere. |

### 9.4 Measured baseline

| Metric | Live site | Root draft |
|---|---|---|
| Desktop page height | 10,179px | 12,891px |
| Mobile page height | 13,957px | 15,313px |
| Mobile overflow | 0px | **4px** |
| Console errors | 0 | 0 |
| Outbound links | 2 | **0** |

---

## 10. Screenshots Index

| File | Contents |
|---|---|
| `screenshots/reference/ref-desktop-full.png` | Reference home, full page, light, 1440px |
| `screenshots/reference/ref-tablet-full.png` | 834px |
| `screenshots/reference/ref-mobile-full.png` | 390px |
| `screenshots/reference/ref-dark-full.png` | Dark theme, full page |
| `screenshots/reference/ref-dark-fold.png` | Dark theme, above the fold |
| `screenshots/reference/ref-section-0..5-*.png` | Per-section captures |
| `screenshots/reference/ref-hover-*.png` | Hover states |
| `screenshots/reference/ref-metrics.json` | Computed styles at 1440px |
| `screenshots/reference/ref-report.json` | Per-viewport metrics + console output |
| `screenshots/reference/reference-projects-desktop-full.png` | Evidence of the broken `/projects` route |
| `screenshots/current/current-live-{desktop,tablet,mobile}-full.png` | Current live site |
| `screenshots/current-local/repo-{desktop,tablet,mobile}-full.png` | Current repo draft |
| `screenshots/current-local/repo-sec*.png` | Per-section captures of the repo draft |
