# Pre-Launch Review — Final Findings

**Date:** 13 October 2026
**Website repository:** `D:\personal-site`
**Verified backup:** `D:\personal-site-backup-20261013-114221`
**qPCR working clone:** `C:\Users\preni\AppData\Local\Temp\opencode\qpcr-work` (from `github.com/premlalpritish-wq/automated-qPCR-reporting-pipeline`)
**Live personal website:** `https://premlalpritish-wq.github.io/` — **unchanged throughout**

> **Nothing has been pushed, deployed or published.** No remote was configured on either repository. The live site still serves the pre-redesign page.

---

## 1. Backup verification

| | |
|---|---|
| Location | `D:\personal-site-backup-20261013-114221` (sibling of the project, outside it) |
| Files | 105 (104 source + `BACKUP-INFO.txt` marker written after the copy) |
| Bytes | 23,030,341 |
| SHA-256 tree digest vs source at copy time | **match** |
| Preserved | **yes** — not deleted or modified |
| Restore | `Copy-Item "D:\personal-site-backup-20261013-114221\*" "D:\personal-site" -Recurse -Force` |

---

## 2. Phase 1 — qPCR reporting defect

### 2.1 Repository located

There was **no local checkout** of the qPCR pipeline anywhere on `C:` or `D:`. The only copy was the public remote, so a fresh working clone was made:

```
https://github.com/premlalpritish-wq/automated-qPCR-reporting-pipeline.git
branch main @ 3f7ca88, clean working tree, remote origin/main
```

Repository state inspected before editing: clean tree, no uncommitted user work, no stashes. Nothing unrelated was touched.

### 2.2 Root cause — it is not in `reporter.py`

The task brief pointed at `reporter.py`. That file is **not** where the table is built: `render_report_md()` passes `context["qc_table_md"]` straight through to the output body (line 87). The table is constructed in **`src/cli.py`**, in `qc_summary_to_markdown()`:

- **Line 36** joins findings with a literal pipe as a display separator:
  `warns = [f"{r.get('sample')}|{r.get('target')}" ...]`
- **Line 64** interpolated the cell into Markdown unescaped:
  `md += f"| {t} | {s} | {n} |\n"`

Markdown reads every `|` as a column separator, so one note became several columns and the renderer kept only the first — 8 of 9 findings vanished.

### 2.3 Fix applied

`src/cli.py`, +14/−1:

```python
def _md_cell(value) -> str:
    """Escape a value so it survives as a single Markdown table cell. ..."""
    text = "" if value is None else str(value)
    text = text.replace("\r\n", " ").replace("\r", " ").replace("\n", " ")
    return text.replace("|", r"\|")
```

```python
-        md += f"| {t} | {s} | {n} |\n"
+        md += f"| {_md_cell(t)} | {_md_cell(s)} | {_md_cell(n)} |\n"
```

**Other Markdown-sensitive characters checked.** Beyond `|`, the only cell-content characters that can break a table row are line breaks (they terminate the row) and leading/trailing pipes (which create empty columns). Both are handled by the same helper. Backticks, asterisks, underscores and brackets are rendered as literal text inside table cells by both Pandoc and GitHub and are not hazards here. The helper is applied to **all three** cells rather than only Notes, because `test`, `status` and `notes` all flow through the same builder and the escape is a no-op for the literal values. Escaping rather than changing the `sample|target` separator preserves the existing output convention.

### 2.4 Regression tests

`tests/test_qc_markdown.py` — **11 tests**, including a `_split_row()` helper that parses the table the way a Markdown renderer does (honouring `\|` as a literal), so a regression shows up as extra columns:

| Test | Covers |
|---|---|
| `test_all_replicate_findings_survive` | **multiple findings in one report** — asserts all 9 `sample\|target` pairs present, and `notes.count("|") == 9` |
| `test_single_finding_unaffected` | one finding; escape present in raw, correct value after parsing |
| `test_no_findings_reports_ok` | existing "All replicates OK" behaviour |
| `test_pipe_in_other_note_columns_also_escaped` | pipes in the NTC and Housekeeping notes |
| `test_multiline_note_does_not_break_table` | **multiline notes** do not create extra rows |
| `test_housekeeping_notes_preserved` | existing housekeeping formatting preserved |
| `test_table_shape_is_always_three_columns` | table stays 3 columns under hostile input |
| `test_header_and_separator_unchanged` | **existing formatting preserved** byte-for-byte |
| `test_md_cell_escapes_pipes` / `_collapses_line_breaks` / `_handles_none_and_empty` | helper units |

`tests/conftest.py` was also added — a **test-only shim**, because the suite previously could not run at all:

- `src/_init_.py` is misspelled (should be `__init__.py`), so `src` was a namespace package and `from src import ...` raised `ImportError`;
- `src/cli.py` and siblings use sibling-absolute imports (`from parser import ...`), so `src/` must be importable on its own.

Production code is untouched by the shim.

### 2.5 Suite results

| Run | Result |
|---|---|
| Baseline, unmodified repo | **collection aborted — 0 tests ran** (2 ImportErrors) |
| Baseline with harness only, fix reverted | `1 failed, 3 passed, 3 errors` |
| **With fix** | **17 passed, 1 failed** |

The single remaining failure is **pre-existing and unrelated**: `tests/test_qc.py::test_replicate_variance_check_flags` asserts `fails[0]['range']`, but `replicate_variance_check()` emits `ct_range`. Verified identical with the fix stashed. One-character fix available (`'range'` → `'ct_range'`) — **not applied**, as it is unrelated user work.

The 3 `test_parser.py` errors were **environmental** — pytest could not create `C:\Users\preni\AppData\Local\Temp\pytest-of-preni` (`WinError 5`). With `--basetemp` pointed at the workspace they pass. Also not a repo defect.

### 2.6 Outputs regenerated with the corrected pipeline

Toolchain was missing on this machine, so it was provisioned into the temp workspace (not Program Files): `pypandoc-binary` for Pandoc, and a portable wkhtmltopdf 0.12.6 which the pipeline prefers for HTML→PDF. The pipeline's own code path ran unmodified.

```
Wrote regen_report.md
Wrote regen_report.pdf          (3 pages, wkhtmltopdf "Printing pages (6/6)")
report.full.html regenerated
reports/run_20261013T123829/assets/{fold_change,ddct_values}.png regenerated
```

### 2.7 All nine findings confirmed present

Checked programmatically against the expected set
`Control_1|TargetX, Control_1|GAPDH, Control_2|TargetX, Control_2|GAPDH, ExpA_1|TargetX, ExpA_1|GAPDH, ExpA_2|TargetX, ExpA_2|GAPDH, NTC|TargetX`:

| Output | Findings | Notes cell renders as |
|---|---|---|
| `regen_report.md` | **9 / 9** | `Control_1\|GAPDH; Control_1\|TargetX; …; NTC\|TargetX` |
| `report.full.html` | **9 / 9** | `Control_1\|GAPDH; …` (single cell, 3 columns in the DOM) |
| `regen_report.pdf` | **9 / 9** | extracted via `pypdf`, 3 pages / 1,930 chars |

Rendered HTML row, verbatim:

```
NTC                pass  No amplification in NTC
Replicate variance Warn  Control_1|GAPDH; Control_1|TargetX; Control_2|GAPDH;
                           Control_2|TargetX; ExpA_1|GAPDH; ExpA_1|TargetX;
                           ExpA_2|GAPDH; ExpA_2|TargetX; NTC|TargetX
Housekeeping       Warn  GAPDH: fail; ACTB: missing
```

Every flagged sample identifier survives and is correctly associated.

### 2.8 Commit

```
fbae6ce3369563dcf24b3b4cc21976704087ba56
fix(report): escape pipes in QC markdown table cells
  src/cli.py                | 15 +++-
  tests/conftest.py         | 44 ++++++++++
  tests/test_qc_markdown.py | 204 +++++++++++++++++++++++++++++++++++++++++++++++
```

Staged content scanned for credentials and local paths — **clean**. `report.full.html` was **restored to HEAD and not committed**: it is generated output that embeds absolute `file:///` paths (HEAD contains the original author's `D:/Pritish/...`; regenerating here would have replaced those with this machine's temp paths). Working tree clean after commit. **Not pushed.**

---

## 3. Phase 2 — Project imagery

### 3.1 Assets shipped

| File | Source | Size | Bytes |
|---|---|---|---|
| `assets/scaleup-evidence.webp` | **Live public** ScaleUp AI demo, `#evidence` section | 1200×700 | 42,364 |
| `assets/qpcr-report-tables.webp` | **Regenerated** qPCR report — QC Summary + cleaned CT + ΔCT/ΔΔCT | 1100×1201 | 75,412 |
| `assets/qpcr-foldchange.webp` | **Regenerated** qPCR `fold_change.png` | 1100×738 | 15,872 |
| `assets/og-image.png` | Original, generated for this site | 1200×630 | 66,393 |

All WebP, `loading="lazy"`, `decoding="async"`, explicit `width`/`height` (no layout shift). Three figures, three captions, three images with detailed alt text that names the actual values shown.

### 3.2 ScaleUp AI accuracy — re-verified

Re-fetched the live page this session. Its own hero note states:

> "An early-stage research prototype. The structured-knowledge layer is built and demonstrable; **executable model generation, evaluation, composition and simulation are the work ahead, not working features.**"

The screenshot shows the **evidence inspector** — claim → value → source → PDF page → verbatim excerpt → recorded findings → limitation, including the line *"an excerpt match proves the words are on the page. It does not prove the claim is scientifically correct."* That is extraction and provenance only. The website copy pairs it with the existing "Scope, stated plainly" note stating it is a demonstrable prototype, not a product surface, that the demo data is a verified fixture rather than a live model response, and that no accuracy figures are claimed. **No simulation capability is implied.**

### 3.3 Erosys Automation logo — excluded, as instructed

The qPCR report template embeds `templates/logo.png`, the **Erosys Automation** logo. The screenshot crop starts **below** the report header (`headerBottom + 8px`), so the logo appears nowhere in the asset. Kept excluded. Nothing to do unless permission and the implied affiliation are independently established.

### 3.4 Legibility on mobile

The report-tables screenshot is 1100×1201 and cannot stay legible scaled into a 350px column. It is therefore wrapped in a `overflow-x: auto` container with `min-width: 760px` below 560px:

| Viewport | Rendered width | Scale | Behaviour |
|---|---|---|---|
| Desktop 1440 | 1096px | 0.996 | fully legible, no scrolling |
| Mobile 390 | 760px in a 306px pane | 0.691 | pans horizontally; table body ≈11px, legible |

The pan is intentional and is the only element wider than the viewport at any breakpoint; it is clipped by its scroll container, so **document horizontal overflow is 0px** everywhere.

### 3.5 Animocare

Unchanged. No imagery added, launch not delayed. The existing project presentation stands until genuine, shareable evidence exists.

---

## 4. Phase 3 — Git baseline

### 4.1 Pre-commit inspection

| Check | Result |
|---|---|
| Already a repository | **No** — initialised here |
| Credential scan (AKIA, `ghp_`, `github_pat_`, `sk-`, PEM headers, api_key/secret/password/bearer assignments) across all 25 text files | **clean** |
| `.env*`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa*`, `*.keystore` | **none present** |
| Username / AppData / temp paths in staged content | **none** |
| Only local references found | `http://127.0.0.1:8899` (loopback dev URL) inside the user's own design notes and the test-report JSONs, and `D:\personal-site` in the notes |

### 4.2 `.gitignore`

```
# Third-party reference material — must not be republished from a public repo
design-reference/screenshots/reference/

# Redundant snapshots of the previous version of this site
pritish-website-updated/
pritish-website-updated (1)/
pritish-website-updated.zip
pritish-website-updated (1).zip

# Local / environment
.env
.env.*
*.log
*.tmp

# OS and editor cruft
.DS_Store
Thumbs.db
desktop.ini
.vscode/
.idea/
*.swp
*~

# Backup markers
BACKUP-INFO.txt
```

**Why the reference screenshots are excluded.** `design-reference/screenshots/reference/` is **14.15 MB** of captures and extracted measurements of another person's public website — including `ref-hero-text.txt`, which holds their personal copy. `audit.md` itself states these are retained as internal reference only and must not be republished. This repository is the public GitHub Pages source, so they stay on disk and out of version control.

### 4.3 Initial commit

```
branch  main
commit  <see §4.5>
100 files staged
```

| Group | Files |
|---|---|
| Site | `index.html`, `style.css`, `script.js`, `assets/` (4) |
| Documentation | `design-reference/` — `audit.md`, `redesign-plan.md`, `change-report.md`, `prelaunch-review.md`, `test-results.json` |
| Own-site evidence | `design-reference/screenshots/` — `after` (22), `final` (20), `current-local` (20), `review` (18), `current` (7) |
| Config | `.gitignore` |

Excluded: the 40 reference-site files, the two old-site folders, the two archives.

**No remote was configured. No push. No publication.**

---

## 5. Phase 4 — Release-candidate verification

### 5.1 Functional

| Check | Result |
|---|---|
| Navigation and section anchors | all 5 resolve; **0 dead anchors**; `#evidence` lands at exactly 92px from viewport top |
| Active-section indicator | `aria-current="true"` follows scroll (`Evidence` at mid-page) |
| Outbound links | **6 unique**, listed below |
| Email link | `mailto:premlalpritish@gmail.com` — real address, no placeholder anywhere |
| Mobile navigation | opens (`aria-expanded="true"`, label flips, 290px panel), closes on **Escape**, **link click** and **outside click**; keyboard reachable |
| Focus states | every tab stop gets a 2px lime `outline` at 3px offset |
| Skip link | hidden at rest (`top: -60px`), visible on focus (`top: 12px`) |
| JavaScript errors / missing assets | **0 console messages**; 0 broken images; 0 failed requests |
| Scroll progress | `scaleX(0)` at top → `scaleX(0.588)` at mid-page; navbar tints past 12px |
| **Works without JavaScript** | all **25** reveal blocks visible, full 9,243-character content readable |
| **`prefers-reduced-motion: reduce`** | 0 of 25 blocks hidden; SVG pulses suppressed; edge animation `1e-05s`; ticker frozen |

**Outbound links**

| Link | Status |
|---|---|
| `https://github.com/premlalpritish-wq` | **200** |
| `https://www.linkedin.com/in/pritish-premlal-9430022a1/` | **999** — LinkedIn bot-block, not a dead link |
| `https://premlalpritish-wq.github.io/scaleup-ai-website/` | **200** |
| `https://github.com/premlalpritish-wq/scaleup-ai-website` | **200** |
| `https://github.com/premlalpritish-wq/automated-qPCR-reporting-pipeline` | **200** |
| `mailto:premlalpritish@gmail.com` | correct address |

### 5.2 Visual and accessibility

| Check | Result |
|---|---|
| Document horizontal overflow — **13 widths, 320 → 1920** | **0px at every width** |
| Real (unclipped) overflow offenders | **0** |
| Content still hidden after full scroll | **0 elements** |
| Pipeline diagram legibility | mobile labels **13.74px** at 390px (was 8.08px), 10.99px at 320px; desktop 12.83px; **0 nodes overflow**, captions fit the viewBox |
| Text sizes | **0 styles below 11px** (was 11, smallest 9.92px) |
| Contrast | all tokens ≥4.6:1; Lighthouse `color-contrast` passes |
| `prefers-reduced-motion` | intact |
| Screenshot/caption spacing | `margin-top: 36px` desktop / `26px` mobile; 14px 18px caption padding; verified visually at 1440 and 390 |
| Dark identity retained | unchanged `#090909` base, `#c7ff4a` accent, mono pairing |
| Heading order | 1 × `h1`, 31 headings, **0 skipped levels** |
| Landmarks | 1 each `header` / `nav` / `main` / `footer` |
| Links/buttons without an accessible name | **0** |
| `target="_blank"` missing `rel="noopener"` | **0** |

### 5.3 Metadata and performance

| Check | Result |
|---|---|
| `<title>` | `Pritish Premlal — Founder & Builder · AI, Scientific Computing, Biotech` (71 chars) |
| `meta description` | 211 chars, ends on "Currently building ScaleUp AI." |
| Open Graph | **11 tags**: type, site_name, title, description, url, image, image:type, image:width, image:height, image:alt, locale |
| X / Twitter | **5 tags**: `summary_large_image`, title, description, image, image:alt |
| `og:image` | `https://premlalpritish-wq.github.io/assets/og-image.png` — absolute, `image/png`, 1200×630 |
| Image on disk | **verified 1200×630 PNG, 66,393 bytes**, RGB |
| Absolute-URL reachability | `…/scaleup-ai-website/assets/app.js` → **200**, proving the pages domain serves root-level `/assets/*`. `og-image.png` 404s only until these files are pushed. |
| **Lighthouse** | **accessibility 1.00 · best-practices 1.00 · SEO 1.00 — 0 failing audits** |
| Console | **0** |
| Third-party requests | **0** — 5 requests total (html, css, js, 3 images) |
| Page height | 13,971 desktop · 14,979 tablet · 16,843 mobile |
| Deployed payload | **293,596 bytes** |

The payload grew from 216,556 to 293,596 bytes because the qPCR card now ships the report-tables screenshot as well as the plot. All three images are lazy-loaded and none blocks first paint.

---

## 6. Files modified

### 6.1 `D:\personal-site`

| File | Change |
|---|---|
| `index.html` | qPCR card: report-tables figure added, plot figure re-scoped, alt text and captions rewritten |
| `style.css` | `.shot-scroll` horizontal-pan wrapper; `.shot-wide` mobile `min-width: 760px` |
| `assets/qpcr-report-tables.webp` | **added** (75,412 bytes) |
| `.gitignore` | **added** |
| `design-reference/prelaunch-review.md` | **rewritten** (this document) |
| `design-reference/change-report.md` | superseded-pointer added |
| `design-reference/test-results.json` | regenerated |

### 6.2 `automated-qPCR-reporting-pipeline` (local clone, not pushed)

| File | Change |
|---|---|
| `src/cli.py` | **modified** — `_md_cell()` added, QC row builder escapes cells (+14/−1) |
| `tests/test_qc_markdown.py` | **added** — 11 regression tests |
| `tests/conftest.py` | **added** — test-only import shim |

### 6.3 Untouched

`audit.md`, `redesign-plan.md`, `script.js`, the ScaleUp AI project (all three local checkouts and the live site), the ScaleUp AI website repository, `pritish-website-updated*/`, both `.zip` archives, the backup, and the live personal website.

---

## 7. Remaining blockers and recommendations

| # | Item | Severity | Action |
|---|---|---|---|
| 1 | **`tests/test_qc.py::test_replicate_variance_check_flags` still fails** — asserts `'range'`, engine emits `'ct_range'` | Medium | One-character fix. Left alone as unrelated work. Suite is 17/18. |
| 2 | **`.gitignore` in the qPCR repo is corrupted** — contains a literal `@"` on line 1 and `git add .gitignore / git commit -m "chore: add .gitignore"` as its last lines, from a PowerShell here-string. Entries inside it are inert as a result. | Medium | Rewrite the file. Deliberately not touched here. |
| 3 | **`tests/test_analysis.py` asserts nothing** — the file contains only a comment | Low | Delete or implement |
| 4 | **`report.full.html` is tracked but gitignored** and embeds absolute `file:///` paths; the committed copy has the original author's local paths baked in | Low | `git rm --cached report.full.html` |
| 5 | **qPCR clone lives in temp** | Low | The fix exists only as a local commit. Clone it somewhere permanent or push when approved. |
| 6 | **LinkedIn link returns 999** to automated requests | Low | Bot-block. One manual click confirms it. |
| 7 | **`title` is 71 chars and `description` 211** | Low | Both exceed the ~60/~160 sweet spot. Search engines truncate rather than penalise; the `og:title`/`og:description` used for social are shorter. Trim if you want. |
| 8 | **Animocare has no visual evidence** | Low | Explicitly deferred by instruction. |
| 9 | **ScaleUp AI validation record not shown** | Low | Its most differentiated feature is publishing where the system fails. |
| 10 | **Website reference screenshots excluded from git** | Info | Kept out deliberately — third-party content. They remain on disk at `design-reference/screenshots/reference/`. |
| 11 | **Deploying needs a decision on `pritish-website-updated*/` and the `.zip` files** | Info | Now gitignored, so they will not be pushed. They stay on disk. |

---

## 8. Completion checklist

- [x] qPCR defect fixed, 11 regression tests added, 17/18 suite passing (1 pre-existing failure)
- [x] All **9** QC findings verified present in `report.md`, `report.full.html` and `report.pdf`
- [x] qPCR fix committed locally as `fbae6ce`, **not pushed**
- [x] Website project screenshots are real, regenerated output and ready
- [x] Erosys Automation logo remains excluded
- [x] Animocare unchanged, launch not delayed
- [x] Personal website has a Git baseline; backup verified and preserved
- [x] Release candidate passes every applicable check
- [x] **Live personal site unchanged throughout**
- [x] **Nothing pushed, deployed or published; no remote configured on either repo**
- [ ] **Owner approval to push / deploy**
