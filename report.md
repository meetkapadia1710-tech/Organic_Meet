# Website QA & Status Report

**Date:** 2026-08-15
**Tech stack:** React 19 + TypeScript + Vite + React Router v8 + Vanilla CSS
**Pages reviewed:** / (Home), /projects, /approach, /about, /contact, /stats, /uses, /:slug (18 case studies), /* (404)
**Viewports:** Desktop (1920x1080, 1440x900, 1366x768) + Mobile (390x844, 375x667, 412x915)
**Method:** Full static code audit — no live server run; responsive findings marked (inferred from code) where applicable.

---

## Summary

| Type | Count |
|---|---|
| Next to Implement | 7 |
| Suggestion | 4 |
| Error | 4 |
| Glitch | 3 |
| Bug | 2 |

Critical: 5, High: 9, Medium: 6

---

## Top 20 Critical & Major Items

| # | Type | Platform | Priority | Page / Component | Description | Steps to Reproduce | Suggested Fix | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Error | Both | Critical | All pages — og:image meta | og.png does not exist. index.html references /og.png but no such file is in web/public/. Every shared link shows a broken card preview. | Share any page URL on LinkedIn or iMessage. | Run npm run og (python tools/make-og.py), copy output to web/public/og.png. | Open |
| 2 | Error | Both | Critical | About page — portrait img tag | Portrait image has no width/height, no srcset, and no LQIP placeholder, causing layout shift (CLS). Every other site image uses the image pipeline; this one does not. | Load /about on any connection — the slot shifts as the image arrives. | Add width, height, srcset, sizes, loading=lazy in About.tsx. Convert portrait.jpeg to WebP via scripts/images.mjs. | Open |
| 3 | Next | Both | Critical | About page — content/about.ts | Education and Experience timelines are 100% placeholder (todo: true on every entry). The entire timeline section is suppressed — a recruiter sees no timeline. | Visit /about — Education/Experience section is absent. | Fill in EDUCATION[0] and EXPERIENCE[0] in content/about.ts, remove todo: true flags. | Open |
| 4 | Next | Both | Critical | content/site.ts — VITE_SITE_URL | No canonical URL is configured. SITE_URL is empty: no canonical link tag is emitted on any page, the sitemap refuses to generate, and og:image is a relative path crawlers may reject. | Inspect source of deployed page — no link rel=canonical present. | Set VITE_SITE_URL=https://your-domain in Vercel env vars and local .env. | Open |
| 5 | Next | Both | Critical | About page — ResumeButton.tsx | CV download is hidden. RESUME_READY = false in site.ts and web/public/resume.pdf does not exist. The Download CV button is invisible to every visitor, including recruiters. | Visit /about — no Download CV button present. | Drop PDF at web/public/resume.pdf and flip RESUME_READY = true in content/site.ts. | Open |
| 6 | Next | Both | High | Uses page — content/uses.ts | Hardware and daily-driver sections are completely empty (todo: true on all three USES groups). The Desk section does not render; /uses shows only the Software grid. | Visit /uses — Desk section is absent. | Fill in hardware items in content/uses.ts and remove todo: true flags. | Open |
| 7 | Error | Both | High | Stats page — Heatmap.tsx API fetches | No fetch timeout on GitHub or LeetCode API calls. A slow cold-start on the free-tier Render endpoint can leave the skeleton spinner running indefinitely. | Throttle DevTools network to Offline, open /stats — skeleton never resolves. | Add AbortController with ~10s timeout to both fetch calls in Heatmap.tsx. | Open |
| 8 | Next | Both | High | projects.ts — client-work entries | Delivery years are unconfirmed for 4 of 5 client projects: bhumi-developers, bd-buildcon, mann-loyalty, mann-attendance all carry TODO: confirm the delivery year. Years appear prominently in work rows and the case sidebar. | Open any of those four case pages. | Confirm and fill correct years in projects.ts. | Open |
| 9 | Glitch | Desktop | High | About page — .about-grid | Portrait column forces a 1.3fr/1fr two-column layout at 900–1024px with no intermediate breakpoint. At ~950px the portrait may be shorter than the text column leaving dead space. (Inferred from code — ui.css L166-300) | Resize browser to ~950px and open /about. | Add a breakpoint at ~1024px to collapse or adjust the two-column grid, matching other grid breakpoints. | Open |
| 10 | Bug | Mobile | High | Nav — Nav.tsx | Get in touch CTA (href=#contact) does nothing useful on the 404 page, which has no #contact anchor. Tapping it from the mobile sheet on a 404 jumps to the page top. | Open any broken URL, open the mobile nav sheet, tap Get in touch. | On pages without a #contact anchor, navigate to /contact. Convert the CTA to a TLink to=/contact or make it conditional. | Open |
| 11 | Glitch | Mobile | High | Home — .hero-band marquee pill | If the OS pauses CSS animations without triggering prefers-reduced-motion (battery saver modes), the nowrap marquee track overflows the pill container at narrow widths. No reduced-motion fallback exists inside .hero-band. (Inferred from code) | Enable power-saving mode that pauses animations without the media query; check hero band at 375px. | Add a prefers-reduced-motion rule inside .hero-band that wraps or hides the marquee, matching the tech-track treatment. | Open |
| 12 | Next | Both | High | Home — Testimonials component | Testimonials section is intentionally empty and returns null, but represents a visible gap in social proof. TESTIMONIALS = []; three paying clients exist; the infrastructure is ready. | Visit / — no What clients said section despite paying clients. | Obtain written permission from Bhumi Developers, BD Buildcon, or Mann Beauty and add a quote to content/testimonials.ts. | Open |
| 13 | Suggestion | Both | High | All pages — useDocumentMeta.ts | og:image is never updated per-route. Every page updates og:title/description but og:image stays as the global /og.png. Case study screenshots (project.preview already in projects.ts) would make shared links far more compelling. | Share any case-study URL on LinkedIn; the preview is the generic site image, not the project screenshot. | Extend useDocumentMeta to accept an optional image param and update og:image where provided. | Open |
| 14 | Error | Both | Medium | CasePage.tsx — most case studies | Most case-study hero figures show a striped placeholder, not a real screenshot. Of 18 case studies only ~5 have heroImage populated. The rest open on a grey striped box as their first visual. | Open /locateme, /learnflex, /jarvis, /mann-loyalty, /mann-attendance, /transitops, /stayfinder, /refractor, /ambulance, /engram. | Add heroImage (and figureImages) to cases.ts for missing cases using the WebP pipeline. | Open |
| 15 | Suggestion | Both | Medium | Stats page — content/stats.ts | Codolio and HackerRank profile handles are not configured (TODO comments present). If profiles exist, the matching card appears with no other changes needed. | Visit /stats — Problem solving shows only LeetCode. | Add codolio and/or hackerrank values to stats.ts if profiles exist. | Open |
| 16 | Glitch | Both | Medium | DealAI Agent — projects.ts / cases.ts | Solo vs. team attribution is unresolved. Comment: TODO: README says we built this — confirm solo or team. The case study currently reads as a solo build; an incorrect attribution could be raised in an interview. | Read the Role field on /dealai. | Confirm with the repo commit history and update facts.role in cases.ts. | Open |
| 17 | Suggestion | Both | Medium | All pages — index.html | No link rel=preload for the display font weight. Figtree 800 is used for the hero headline (the largest LCP element) but is not preloaded, causing FOUT/font swap on slower connections. | Test with DevTools throttled to 3G and Lighthouse; observe FOUT on the hero name. | Add link rel=preload as=font crossorigin for the Figtree 800 woff2, or self-host and preload directly. | Open |
| 18 | Suggestion | Desktop | Medium | All pages — Nav.tsx Get in touch CTA | The desktop Get in touch nav CTA is a plain a href=#contact, not a NavLink viewTransition. Every other nav item triggers a view transition; this CTA does not, creating a visible inconsistency. | Click Get in touch from desktop nav and compare the animation to any other nav link. | Wrap the CTA in NavLink viewTransition or convert to TLink. | Open |
| 19 | Bug | Both | Medium | Home / Projects — WorkRow.tsx | h2 is nested inside a (via TLink), which is invalid HTML. Interactive content (a) may not contain heading elements; this causes axe-core violations and can disrupt screen-reader announcement order. | Run Lighthouse accessibility audit on / or /projects. | Replace h2 inside WorkRow with div role=heading aria-level=2, or restructure the link to wrap only the title text. | Open |
| 20 | Next | Both | Medium | Connected Ambulance — projects.ts / cases.ts | Individual contribution scope on a team project is unresolved. The case study describes the system generically without claiming any specific technical decision, weakening it as a portfolio piece. | Read the Role and How it works sections on /ambulance. | Identify specific owned components (e.g. the ML model, the store-and-forward buffer) and update cases.ts accordingly. | Open |

---

## Notes

### Assumptions
- No live server was run. All findings derive from static analysis of the React/TypeScript source, CSS, and content files.
- og.png absence confirmed by directory listing of web/public/ — file not present.
- resume.pdf absence confirmed by file search across web/ — file does not exist; RESUME_READY = false.
- portrait.jpeg exists in web/public/ (60 KB) so the About portrait will render; the issue is the missing width/height/srcset/WebP/LQIP treatment.
- Third-party API reliability assessed from code only — actual endpoint uptime not measured.

### What was not tested
- JavaScript console errors at runtime (no live dev server)
- Actual network requests to GitHub / LeetCode APIs
- View transition animation quality between routes
- The 3D deck view (Deck.tsx / Three.js chunk — lazy-loaded)
- EasterEgg component (Konami code, 7-tap on mobile)
- Print stylesheet output for case studies
- CommandPalette fuzzy-search beyond code inspection

### Recommended next step
Run Lighthouse in Chrome DevTools against the deployed Vercel URL for /, /about, /projects, and one case study at both 1440x900 desktop and 390x844 mobile emulation to surface actual CLS, LCP, and accessibility scores.

---

Generated 2026-08-15 by code audit. Update each item Status (Open to Fixed or Won't Fix) when addressed and re-run the audit to append any newly found issues.