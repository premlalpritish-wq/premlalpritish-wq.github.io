# Change Report — Personal Site Redesign

> **Status: superseded.** This report covers the redesign phase only. For the
> final pre-launch findings — the qPCR reporting fix, the regenerated project
> screenshots, the Git baseline and the release-candidate verification — see
> **`design-reference/prelaunch-review.md`**.

**Date:** 13 October 2026
**Repository:** `D:\personal-site`
**Files changed:** `index.html`, `style.css`, `script.js` (all rewritten)
**Files added:** `design-reference/audit.md`, `design-reference/redesign-plan.md`, `design-reference/change-report.md`, `design-reference/test-results.json`, `design-reference/screenshots/**`
**Files untouched:** `pritish-website-updated/`, `pritish-website-updated (1)/`, `pritish-website-updated*.zip`, the ScaleUp AI project repository

**Nothing has been pushed or deployed.** The repository is not a git repository, so there is no commit or diff — the changed files are listed above in full.

---

## 1. Summary

The site was restructured from 9 sections to 7, rebuilt on a new design system, and had 10 defects fixed — including three rated **critical**: no outbound links at all, ScaleUp AI completely absent, and a placeholder email address that would have failed for every visitor.

| Metric | Before | After |
|---|---|---|
| Lighthouse Accessibility | — | **1.00** |
| Lighthouse Best Practices | — | **1.00** |
| Lighthouse SEO | — | **1.00** |
| Console errors | 0 | **0** |
| Console warnings | — | **0** |
| Horizontal overflow (mobile 390) | **4px** | **0px** |
| Horizontal overflow (10 widths, 320–1920) | — | **0px** |
| Outbound links | **0** | **6** |
| Sections | 9 | **7** |
| Desktop page height | 12,891px | **11,208px** |
| Mobile page height | 15,313px | **15,157px** |
| Contrast failures (WCAG AA) | **3** | **0** |
| Third-party requests | 0 | **0** |
| Payload | 56,440 B | **84,088 B** |
| Images / webfonts | 0 | 0 |

---

## 2. What Changed and Why

### 2.1 Critical fixes

| # | Change | Why |
|---|---|---|
| 1 | Added **GitHub, LinkedIn, ScaleUp AI** link rows to the hero and footer | The old draft had **zero** outbound links. A founder site with no reachable proof of work fails at its only job. |
| 2 | Added a full **ScaleUp AI project card** as the flagship | The flagship product was entirely missing from the site. Description taken strictly from its own public README. |
| 3 | Replaced `mailto:your-email@example.com` with **`premlalpritish@gmail.com`** | The contact CTA was a placeholder — it would have failed for every visitor. |
| 4 | Restored the **qPCR pipeline** project with its GitHub link | Present on the live site, lost in the repo draft. Removed the last piece of real evidence from the page. |
| 5 | Fixed **4px horizontal overflow** on mobile | `.company-status` overflowed the viewport at 390px. Fixed with `flex-wrap` + `min-width: 0` in the card header. |

### 2.2 Accessibility fixes

| # | Change | Why |
|---|---|---|
| 6 | **Three contrast failures corrected** | `#555`→`#7c7c86` (2.55→4.61:1), footer `#666`→`#7c7c86` (3.47→4.82:1), trajectory `#657c39`→`#8b9a5c` (3.96→6.06:1). All now pass WCAG AA. |
| 7 | **Reveal no longer depends on JS** | The old script set inline `opacity: 0` on 24+ elements before observing them. If JS failed, whole sections were permanently invisible. Now gated behind `html.js` (set inline in `<head>`) **plus** a 2.5s failsafe that force-reveals everything. |
| 8 | **`:focus-visible` ring** on every interactive element | Previously absent — keyboard users got browser defaults on a near-black background. |
| 9 | **Mobile menu ARIA + behaviour** | `.menu-toggle` had no `aria-expanded`, no `aria-controls`, and no open styling. Now: animated hamburger→✕, correct ARIA, closes on link click / Escape / outside click / resize. |
| 10 | **Active nav section** via `IntersectionObserver` + `aria-current` | The reference site signals the active link by colour alone — an accessibility gap this avoids. |
| 11 | **Skip link** to `#main`, visible on focus | New. |
| 12 | Descriptive link names | External links carry a visually-hidden "(opens in a new tab)"; the logo uses a hidden span rather than an `aria-label` that clashed with its visible text. |
| 13 | `prefers-reduced-motion` extended | Already existed. Now also suppresses SMIL SVG motion, which the CSS override cannot reach, and disables the ticker. |
| 14 | `prefers-contrast: more` block added | Raises line and text contrast for high-contrast users. |

### 2.3 New design-system features borrowed from the reference (as principles)

| # | Feature | Reference principle |
|---|---|---|
| 15 | **Scroll-progress hairline** — 2px lime bar, `transform: scaleX()`, single rAF-throttled listener | Position awareness on a long page |
| 16 | **Status pill** with a pulsing status dot | Compact intent signal above the headline |
| 17 | **Rotating focus ticker** — mono line cycling four phrases | Communicates current focus without a CV |
| 18 | **Domain pills** replacing a skills list | Compact taxonomy |
| 19 | **Animated system diagram** in the hero — an inline SVG pipeline (`INGEST → CHUNK → EXTRACT → VALIDATE → GRAPH → REPORT`) with animated dashed edges and travelling pulses | Replaces the previous empty concentric circles. On-positioning for AI / scientific computing, zero image bytes |
| 20 | **Monospace pairing** for all technical text | The new signature: zero bytes, instantly separates artefact from prose |
| 21 | **Consistent project card anatomy** — index · category · title · problem · mechanism · scope note · links | Makes projects comparable at a glance |
| 22 | **Semantic status chips** — lime = active, amber = prototype, neutral = completed | Faster scanning than plain text |
| 23 | **Hover micro-interactions** — cards lift and brighten, principle cards wipe a lime top rule, loop rows indent, nav underlines scale in | All `transform`/`opacity` only |
| 24 | **4-step spacing ladder** (16 / 28 / 56 / 96–130px) and a **4-step type scale** | Section rhythm reads as designed |

### 2.4 Content consolidation (9 → 7 sections)

| Old | New | Action |
|---|---|---|
| Hero | **1 Hero** | Rewritten; visual replaced |
| 01 Thesis + 05 How I work | **3 Method** | Merged. Thesis cut from 4 paragraphs to 3; the 5-step loop promoted to a numbered rail; 6 principles compressed to one line each |
| 02 Evidence | **4 Evidence** | Reordered — Project:Me promoted to first, as it is the most substantial |
| 03 Animocare + 04 Other Builds | **2 Work** | Merged; ScaleUp AI added first; qPCR pipeline added third |
| 06 Foundation + 07 Education | **5 Background** | Merged; skill lists converted to chips |
| 08 The Bet | **6 Statement** | Folded into the lime band as a secondary block |
| 09 Contact | **7 Contact** | Expanded with the full link row |
| — | *footer* | Expanded from one muted line to brand + links + year |

All factual content, project descriptions, process steps, outcome claims, dates and institutions were preserved. The only content added is ScaleUp AI, described from its own README, and the outbound links.

---

## 3. Tests Run

Full results in `design-reference/test-results.json`.

### 3.1 Automated

| Test | Result |
|---|---|
| Lighthouse (accessibility / best-practices / SEO) | **1.00 / 1.00 / 1.00**, zero failing audits |
| Console errors + warnings, 3 viewports | **0 / 0** |
| Horizontal overflow sweep — 320, 360, 390, 430, 768, 834, 1024, 1280, 1440, 1920 | **0px at all 10 widths** |
| Content-still-hidden after full scroll | **0 elements** (was the old page's main failure mode) |
| Broken images | 0 images used; 0 |
| Heading order | 1 × `h1`, 29 headings, **0 skipped levels** |
| Landmarks | 1 each: `header`, `nav`, `main`, `footer` |
| Links/buttons without an accessible name | **0** |
| `target="_blank"` without `rel="noopener"` | **0** |
| In-page anchors that do not resolve | **0** |
| Outbound link reachability | GitHub 200 · ScaleUp site 200 · 2 repos 200 · LinkedIn returns `999` (LinkedIn's bot block, not a broken link — this URL was already live on the existing site) |

### 3.2 Behavioural

| Test | Result |
|---|---|
| Keyboard tab order | skip link → logo → 5 nav links → Email CTA → hero CTAs → link row → scroll cue. Every stop gets a 2px lime focus ring. |
| Skip link on focus | Becomes visible at `top: 12px` |
| Anchor navigation | `#evidence` lands at **92px** from viewport top (= `nav height 76 + scroll-padding 16`), and `aria-current="true"` is set on the matching nav link |
| Mobile menu open | `aria-expanded="true"`, label flips to "Close navigation", panel 290px tall |
| Mobile menu Escape | Closes, `aria-expanded="false"` |
| Mobile menu link click | Closes; smooth scroll proceeds to target |
| Scroll progress | `scaleX(0)` at top → `scaleX(0.598)` at 55% scroll |
| Navbar scrolled state | Applied past 12px |
| **`prefers-reduced-motion: reduce`** | 0 of 25 reveal blocks hidden; SVG pulses and status ping removed; edge animation `1e-05s`; ticker frozen |
| **JavaScript disabled** | All 25 reveal blocks visible; full 8,766-character content readable |

### 3.3 Visual

Before/after full-page captures at 1440, 834 and 390, plus section captures, hover states, focus state, mobile-menu-open, and a reduced-motion full page — in `design-reference/screenshots/`.

---

## 4. Payload

| File | Bytes |
|---|---|
| `index.html` | 39,015 |
| `style.css` | 37,746 |
| `script.js` | 7,327 |
| **Total** | **84,088** |

Zero third-party requests. No frameworks, no build step, no webfonts, no images, no CDN. The only visual asset is an inline SVG; the favicon is a data URI. Drops straight onto GitHub Pages as-is.

---

## 5. Unresolved Issues & Notes

| # | Item | Detail |
|---|---|---|
| 1 | **Page length target missed** | Planned −30%; delivered −13% desktop, −1% mobile. Cause and reasoning documented in `redesign-plan.md` §7. The added ScaleUp AI + qPCR content consumed the savings from consolidation. |
| 2 | **LinkedIn link unverified** | Returns `999` to automated requests (LinkedIn's bot block). The URL came from the existing live site, so it is very likely correct — but worth one manual click before publishing. |
| 3 | **ScaleUp AI description is a summary** | Taken from the project's own README. If you want different wording, or a screenshot/logo from that project, say so — I did not touch that repository. |
| 4 | **No thumbnail imagery** | Projects are text-and-diagram cards, not screenshot cards. Adding real UI screenshots of ScaleUp AI and the qPCR report output would make the Work section materially stronger. Needs assets from you. |
| 5 | **No OG image** | `og:image` is not set, so link previews on social platforms will render as plain text. Needs a 1200×630 image. |
| 6 | **Animocare copy unchanged** | I preserved the existing wording exactly. If you have sharper numbers or a clearer description, that card is the place to improve it. |
| 7 | **Font is the system stack** | `Inter` is first in the stack but never loaded, so most machines will render their system UI face. Deliberate: it keeps the site at zero network cost. If you want Inter, self-hosting one woff2 (~25KB) is the cheap option. |
| 8 | **Sub-folder snapshots left in place** | `pritish-website-updated/` and `pritish-website-updated (1)/` contain copies of the *old live* site and the two `.zip` archives duplicate them. They are dead weight in the deployed root. I did not delete them — your call. |
| 9 | **Repository is not under version control** | There is no `.git` in `D:\personal-site`, so this redesign has no rollback point. Initialising git before publishing would be prudent. |
| 10 | **Not deployed** | The live site still serves the old page. Nothing pushed. |

---

## 6. Review Checklist

- [x] Audit of the reference site complete — `design-reference/audit.md`
- [x] Redesign plan with improvement → section mapping — `design-reference/redesign-plan.md`
- [x] Implementation in the existing lightweight architecture
- [x] No new dependencies, no build tooling, no hosting cost
- [x] ScaleUp AI project repository untouched
- [x] Existing factual content and links preserved
- [x] Keyboard, responsive, console, overflow and performance tested
- [x] Reduced-motion and no-JS paths tested
- [ ] **Owner review**
- [ ] **Approval to publish**

---

## 7. How to Preview

```powershell
cd D:\personal-site
python -m http.server 8899
# → http://127.0.0.1:8899
```

Or open `index.html` directly — the page has no server-side requirements.
