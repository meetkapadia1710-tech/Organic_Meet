# Frontend upgrade implementation plan

Prepared 2026-10-08 for the existing Organic portfolio.

**Status:** core frontend enhancements implemented locally. Typography constraint from the owner: preserve the existing font families, weights and type scale; new elements inherit the established type system. Estimates below are planning ranges, not measured results.

### Implementation record — 8 October 2026

Implemented: project artwork and scoped previews, screenshot viewer with focus restoration, case reading navigation, URL-backed category filters, coordinated route/theme/presentation transitions, quieter pointer effects, live reduced-motion controls, background animation cleanup, mobile menu focus containment, and clearer search/copy feedback. Existing Caprasimo and Figtree fonts are unchanged; work-row titles retain 42px and deck titles retain their original scale.

Validation: production and `/Organic_Meet/` builds pass, including type checking, content validation, prerendering and all four static/CMS tests. The production output contains 25 prerendered pages and 24 sitemap URLs. Browser checks cover original font loading, desktop/mobile filtering, canonical URLs, mobile menu navigation, reduced-motion changes, and gallery advancement, Escape, focus and scroll restoration. No horizontal overflow was found in the checked 375px and 1440px layouts. Initial app plus vendor JavaScript is approximately 121.5 KB gzip, about 2.5 KB above the recorded baseline.

Remaining release checks: Firefox/Safari and physical devices, the complete viewport/zoom matrix, slow/broken image scenarios, rapid competing transitions, interaction recordings, and performance traces/field metrics. Optional developer effects and new factual results/captions remain dependent on taste and confirmed source material. These checks are not implied by the successful static tests. Local screenshots are saved under `artifacts/frontend-upgrade/` (ignored by Git). No deployment was performed.

## 1. Design direction

Keep the cream paper surface, terracotta and olive accents, expressive display typography, rounded controls, and dark palette. Make the portfolio feel more composed through a few memorable interactions: a project expanding into its case study, a screenshot opening into an inspection view, and a work section that responds consistently to pointer, touch, and keyboard input.

The highest-value upgrade is better presentation of the actual work. Motion should connect that presentation and make controls feel responsive. Keep the hero's name legible and the route to projects/contact obvious throughout every sequence.

Do not restore the previously rejected fixed backdrop, WebGL hero, decorative blobs, or surrounding floating layers as part of this plan. The repository records those as deliberate removals. The existing hero vines can be refined without introducing another background system.

## 2. What already exists

| Existing capability | Source | Upgrade opportunity |
| --- | --- | --- |
| Router-owned page transitions and project-title morphs | `web/hooks/useTransitionNavigate.ts`, `web/components/TLink.tsx`, `web/styles/motion.css` | Coordinate screenshots, title and page entrances; verify reverse navigation. |
| Split headlines, word reveals, scramble labels and underline sweeps | `web/components/SplitText.tsx`, `web/components/ScrambleText.tsx`, `web/hooks/useMotionPlus.ts` | Reduce overlapping entrances and give headings/prose different timing. |
| Custom cursor, magnetic controls, tilt and parallax | `web/hooks/useMotion.ts`, `web/hooks/useCursorLift.ts` | Tune amplitude and remove competing responses on the same element. |
| Pointer-following work preview | `web/components/WorkPreview.tsx` | Clamp to viewport, improve image readiness and provide a keyboard equivalent. |
| Project list, sticky work index and 3D deck | `web/components/WorkRow.tsx`, `web/components/WorkIndex.tsx`, `web/components/Deck.tsx` | Smooth view switching, clearer active-card behavior and mobile presentation. |
| Hero grain and SVG vines | `web/pages/Home.tsx`, `web/components/HeroVines.tsx`, `web/styles/site.css` | Refine the existing entrance; pause decorative movement offscreen. |
| Circular theme wipe | `web/state/theme.ts`, `web/styles/theme.css` | Handle rapid toggles, theme/navigation conflicts and reduced-motion changes. |
| Search palette, mobile menu and copy feedback | `web/components/CommandPalette.tsx`, `web/components/Nav.tsx`, `web/components/CopyEmail.tsx` | Consistent open/close timing and stronger focus/feedback states. |
| Figure reveal and responsive images | `web/components/Figure.tsx`, `web/pages/CasePage.tsx` | Add image inspection, purposeful crops and a case-study gallery. |

`useSmoothScroll()` currently returns without intercepting scrolling. Keep native scrolling. Its historical comments should not be mistaken for an active scrolling implementation. The `Hero3D` folder exists but Home does not import it.

## 3. Prioritized upgrades

Priority: **P0** establishes reliable behavior; **P1** produces the main visual improvement; **P2** adds polish after the primary interactions work. Sizes: S is a focused change, M spans a few components, L needs a coordinated interaction and broader verification.

| Priority | Upgrade | Visitor-visible result | Size |
| --- | --- | --- | --- |
| P0 | Shared motion policy and timing tokens | Consistent timing, optional reduced motion, fewer simultaneous effects | M |
| P1 | Project-to-case screenshot transition | Selected artwork expands into the case header while its title moves with it | L |
| P1 | Better project previews | Stable, readable artwork on hover/focus, clear work cards on phones | M |
| P1 | Screenshot inspection/gallery | Visitors can inspect real interfaces at a useful size | M |
| P1 | Hero and section choreography | Clear entrance order and quieter reading sections | M |
| P1 | Mobile interaction pass | Touch-first work browsing and a polished navigation sheet | M |
| P2 | List/deck view transition | Switching presentation feels connected and keeps the current project | M |
| P2 | Category filters | Visitors find relevant work quickly, with restrained list rearrangement | M |
| P2 | Case-study reading navigation | Section anchors and progress explain where the reader is | M |
| P2 | Navigation and feedback polish | Active links, buttons, theme switches and copy actions feel finished | S–M |
| P2 | Palette polish | Search feedback feels immediate without animated distractions | S |
| P2 | Optional developer-mode details | Small surprises for interested visitors, outside the main reading path | S |

Recommended first release: motion policy, project previews, screenshot inspection, entrance tuning, and mobile polish. Add screenshot morphing once suitable artwork and transition behavior have been verified. Filters and extra developer-mode effects can follow.

## 4. Implementation specifications

### A. Motion policy and shared tokens — P0

**Change:** create `web/hooks/useMotionPreference.ts` and `web/state/motion.ts` if a user setting is added. Listen for live OS preference changes rather than reading `matchMedia` only at mount. Suggested settings are `system`, `reduced`, and `full`; `full` must still honor an OS request to reduce motion. Persist only an explicit user choice and initialize the DOM before first paint to avoid a motion flash. Inspect the existing theme bootstrap before choosing where to initialize it.

Add tokens to the existing `web/styles/motion.css`; do not introduce a third overlapping motion stylesheet. Suggested starting values:

| Token/behavior | Proposed range |
| --- | --- |
| Press/hover response | 120–180 ms |
| Menu/palette entrance | 180–260 ms |
| Route crossfade | 220–320 ms |
| Shared screenshot/title transition | 420–520 ms |
| Hero entrance | 600–800 ms total |
| Group stagger | 35–50 ms, total delay capped at 160–200 ms |
| Row hover lift | 2–4 px |
| Artwork hover scale | 1.015–1.025 |
| Tilt | At most 2 degrees on large artwork; none for body copy |

Use these as a tuning baseline, not a promise that every element needs animation. Prefer transform and opacity for ongoing movement; large blurs, SVG filters and clipping transitions need profiling because they can cause expensive painting. [Performance guidance](https://web.dev/articles/animations-and-performance/).

**Done when:** changing the OS setting immediately cancels decorative animation; all content remains visible; no animation loop continues in a hidden tab; unmounts clean up listeners and animation frames. Preserve existing reveal timeouts. Reduced motion removes spatial effects and leaves instant state changes or a brief opacity transition. [Reduced-motion reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).

### B. Project artwork expanding into its case — P1

**Experience:** activating a project connects its visible screenshot to the case-study hero. The name moves into its final heading position; the surrounding content fades in afterward. This extends the existing title morph.

**Files:** `WorkRow.tsx`, `Deck.tsx`, `WorkPreview.tsx`, `CasePage.tsx`, `TLink.tsx`, `useTransitionNavigate.ts`, `motion.css`.

**Steps:**

1. Choose a visible preview surface for the source. Start with an inline work thumbnail or active deck card. A pointer-following panel is a less reliable source because it disappears on pointer leave and has no touch counterpart.
2. Assign `project-art-{slug}` to exactly one eligible source image and the matching destination hero image. Assign names only to the selected transition participant; a row, deck card and floating preview must not share a name simultaneously. Transition names must be unique in a rendered view. [MDN reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-name).
3. Keep React Router in charge of the transition and preserve the existing instant scroll-reset ordering. Do not wrap navigation in a second `document.startViewTransition()` call.
4. Ensure the destination image is ready without waiting indefinitely. If decoding/loading misses the transition window, use the existing title morph or a plain crossfade. Do not delay navigation to download artwork.
5. Reset temporary transition attributes after completion, rejection, interrupted navigation and unmount. When returning to the list, restore scroll position and morph only if the destination row is available and visible.

Use the same crop at both ends where possible. If source and destination images differ materially, fade between them instead of stretching one into the other. For projects with no screenshot, retain a typographic card and the title transition.

**Done when:** mouse, keyboard, touch, direct URL visits, rapid navigation, Back/Forward, reduced motion and unsupported browsers all reach the correct page; no duplicate-name errors or offscreen title flights occur. The screenshot never obscures navigation or contact controls. [View Transition usage](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using).

### C. Project preview presentation — P1

**Desktop:** improve the existing floating preview rather than adding a second follower. Clamp its position with a 16–24 px viewport margin; flip its anchor near right/bottom edges. Crossfade artwork over roughly 160 ms, and preload/decode only the next hovered or focused image. Keep a stable typographic fallback until that image is ready.

**Keyboard:** focusing a project exposes the same preview in a stable location beside or within that row. Pointer movement must not move a keyboard-driven preview. Essential project information stays in the row; the preview remains supplementary.

**Mobile:** show a small inline thumbnail for selected/featured projects, with title, tags and action in normal document flow. No tap-to-preview followed by a second tap to navigate. Use the existing deck only when explicitly selected.

**Files:** `WorkPreview.tsx`, `WorkRow.tsx`, `Home.tsx`, `Projects.tsx`, `site.css`. Pass an explicit list ref or container identifier rather than relying on the first global `.work-list` if previews are added to more than one section.

**Done when:** the panel stays on screen at all supported widths, never covers the focused link, never intercepts clicks, and never flashes the previous project's screenshot as the current one loads. Existing screenshot-free projects remain intentional and readable.

### D. Screenshot inspection and gallery — P1

**Experience:** screenshots become useful evidence. An inspect button opens a larger view with the original caption, next/previous controls and a visible Close button. Use a modest 180–240 ms entrance. Existing gallery images can form a sequence; no extra images are fabricated.

**Files:** `Figure.tsx`, `CasePage.tsx`, new `web/components/ImageViewer.tsx`, `ui.css`.

Use a native `<dialog>` where suitable, with a tested fallback if required by the target browsers. Keep the figure's meaningful alt text. The dialog needs an accessible label, contained focus, Escape close, background interaction suppression and focus restoration to its opener. Reserve image dimensions before decoding. Avoid animating the entire full-resolution bitmap on every pointer movement.

Touch should support comfortable scrolling and browser zoom. A swipe gesture is optional; visible buttons must provide the same navigation. Do not trap gestures that the browser needs for zoom.

**Done when:** the image is useful at laptop and phone widths; opening and closing restores the page's scroll position; keyboard and screen-reader users can inspect captions and exit; no layout shifts occur while an image loads.

### E. Hero and section choreography — P1

Refine the existing `.hero-min-*` beat system rather than adding another hero timeline. Suggested order: metadata/rule, role, name, actions, facts. Actions should be usable from the start; the full sequence should settle within about 800 ms. Do not make visitors wait through the preloader and then another full entrance sequence.

For `HeroVines`, shorten or simplify the existing entrance if it competes with the name. Pause ambient sway when the hero is outside the viewport or the document is hidden. Keep the grain static. Do not add cursor-driven distortion to the vines while the headline already responds to pointer proximity.

Use one reveal per section heading and a short stagger for related work rows. Long case-study prose should remain immediately readable; avoid repeated word masks, skew and parallax on reading paragraphs. Prevent a shared-element title morph from simultaneously replaying its split-text entrance.

**Files:** `Home.tsx`, `HeroVines.tsx`, `SplitText.tsx`, `useMotion.ts`, `useMotionPlus.ts`, `site.css`, `motion.css`, `motion-plus.css`.

**Done when:** heading, artwork and navigation never compete for attention; the hero's largest text paints promptly; direct visits and Back navigation do not replay unnecessary long sequences; JS-disabled/prerendered content remains visible.

### F. Mobile interaction pass — P1

Refine the existing menu sheet with a restrained slide/fade, a clearly changing menu icon, and an active-page indicator. Keep all links available and a visible Close control. Inspect the existing focus behavior before adding a focus trap; do not leave two competing keyboard handlers.

Keep touch targets at least 44 px in the project's design convention. Disable cursor followers, magnetic offsets, pointer tilt and decorative skew on coarse pointers. Inline artwork carries the visual interest on phones. Sticky headers should never consume a large part of a short landscape viewport.

**Files:** `Nav.tsx`, `WorkRow.tsx`, `Deck.tsx`, `site.css`, `ui.css`.

**Done when:** the menu handles Escape, outside dismissal and route selection; focus returns correctly; artwork and controls fit at 320 px width and 200% zoom; a deck swipe does not accidentally activate a link.

### G. List/deck switching — P2

Keep the active project when switching presentations. Use a brief container crossfade or a supported view transition, around 240–320 ms. Reserve a stable minimum container size, then let content take its natural height; do not animate arbitrary heights on every frame.

Store a selected slug alongside the existing work-view preference. Respect that slug when activating the deck and when focusing the corresponding list row. Switching views should not open a project or jump to the page top. If a route or theme transition is running, switch directly rather than competing for the browser's transition snapshots.

**Files:** `Home.tsx`, `Deck.tsx`, `web/state/view.ts`, `deck.css`, `site.css`.

**Done when:** the same project remains selected; only the visible presentation can receive focus; no double-rendered transition names occur; reduced motion gets an immediate switch.

### H. Category filters — P2

Add category chips above `/projects`, sourced from `CATEGORIES`, with an All option and result count. Preserve the selection in a query parameter so shared URLs and Back/Forward behave sensibly. Filtering should update immediately; animate the retained rows' transforms/opacity only when practical.

Use one reorder mechanism: a progressive view transition or a measured FLIP implementation. Do not combine both. Keep stable slug keys, preserve DOM reading order, and announce the result count politely. Do not move focus into the list after every selection.

**Files:** `Projects.tsx`, `WorkRow.tsx`, `site.css`; optional new `web/components/ProjectFilters.tsx`.

**Done when:** chips work by keyboard and touch; refreshing a filtered URL restores the selection; search and pending-project exclusion remain correct; filtered views do not change the canonical URL into a separate indexed page.

### I. Case-study reading navigation — P2

Use the section IDs already computed in `CasePage.tsx`. Add a compact sticky section navigation on wide screens and a collapsible section list on mobile. Highlight the current section using a scoped IntersectionObserver; reserve `aria-current="location"` for the active anchor. Keep the existing global progress bar rather than creating a second fixed progress overlay.

Set `scroll-margin-top` so anchors clear the fixed nav. Native anchor URLs and hash sharing must keep working. Smooth anchor movement is optional and must become instant under reduced motion. Sticky elements remain within the case content column.

**Files:** `CasePage.tsx`, new `web/components/CaseNavigation.tsx`, `site.css`.

**Done when:** all generated anchors resolve, headings are not hidden by the nav, the active section does not flicker at boundaries, and the navigation never overlaps text or screenshot captions.

### J. Controls, theme and search polish — P2

- **Navigation:** animate a single active-link underline/pill over 160–220 ms. Keep active styling visible without animation and in dark mode.
- **Buttons:** a 1–2 px press response, restrained arrow movement, clear focus rings, and consistent disabled/loading states. Keep the existing SwapText/Arrow components rather than adding a competing text animation.
- **Copy email:** keep the button's width stable, show a check/success label and a polite live announcement. Clipboard failure must expose a readable/selectable address and an honest failure state.
- **Theme:** keep the existing circular wipe for eligible desktop users. Clean up after interrupted transitions, handle repeated toggles and avoid starting a theme wipe during route navigation. Mobile/reduced motion retain the existing direct swap.
- **Command palette:** refine its existing scale/fade; keep typing and result selection immediate. Use an empty state with useful navigation options. Decorative result staggers must not interrupt arrow-key movement or defer the first result.

**Files:** `Nav.tsx`, `Arrow.tsx`, `CopyEmail.tsx`, `CommandPalette.tsx`, `state/theme.ts`, `theme.css`, `ui.css`, `site.css`.

**Done when:** controls respond during animation, rapid interactions leave the correct state, copy feedback does not shift layout, and keyboard selection never gets lost behind an exit animation.

### K. Optional developer-mode details — P2

Add small terminal command completion cues or a tasteful achievement entrance using the existing developer-mode components. Trigger each effect only from an intentional action. Pause any continuous effect when its panel closes or the tab hides. Keep surprises isolated from normal portfolio browsing.

**Files:** `web/components/EasterEgg/DeveloperTerminal.tsx`, `AchievementToast.tsx`, `DeveloperMode.tsx`, `web/styles/devmode.css`.

Do not add autoplay sound, random popups, a second cursor trail, or default full-screen particles. These would obscure the work and expand maintenance cost.

## 5. Content and surface improvements

These can make a larger visual difference than additional animation:

1. Add intentional interface detail crops for featured projects. Small previews should show a readable UI region; opening the viewer can show the full screenshot. Existing `preview` supports the overview; an optional `previewAlt`/crop field should be added only if actually needed.
2. Standardize figure caption spacing, case-header artwork ratios and typography across cases. Use real imagery where supplied and the existing typographic fallback elsewhere.
3. Give case studies a concise results block when verified outcomes exist: actual measurements, scope or delivered features. No invented percentages, client quotes or dates.
4. Refine section spacing, mobile type sizes, image framing and dark-theme borders before adding more moving decoration.

If content fields change, update `web/content/types.ts`, Sanity schemas, CMS export/import and round-trip tests together. All new local assets must pass through `assetUrl()` and work under GitHub Pages' base path.

## 6. Implementation phases

| Phase | Work | Deliverable | Rough effort |
| --- | --- | --- | --- |
| 0 | Baseline recordings, image inventory, motion policy, live preference handling | Reliable foundation and agreed motion timings | 0.5–1.5 days |
| 1 | Previews, screenshot inspection, typography/spacing, hero/section timing, mobile menu | First visible upgrade with the same theme | 2–4 days |
| 2 | Shared screenshot transition, list/deck switch, theme conflict handling | Connected navigation and presentation changes | 2–4 days |
| 3 | Filters, reading navigation, palette/feedback refinements | Better exploration and reading | 1.5–3 days |
| 4 | Optional developer details and cross-browser/performance tuning | Release-ready polish | 1–2 days |

Effort depends on screenshot availability, browser behavior and review cycles. Build one complete interaction at a time; do not launch every proposed effect in one change.

## 7. Engineering and performance rules

- Start with the existing CSS, Web Animations API, React Router transitions and IntersectionObserver. This plan does not require an animation dependency. Evaluate a library only if measured complexity justifies it.
- Keep the prerenderer browser-independent. Read `window`, `document` and storage in guarded effects or a controlled client bootstrap; provide stable server defaults for new hooks.
- Use stable component keys. Scope observers to their section and process newly added nodes rather than rescanning the entire page on every mutation.
- Give each moving surface one transform owner. Nest wrappers when an entrance, hover and shared transition need independent transforms.
- Apply `will-change` briefly around the relevant animation, then remove it. Avoid retaining GPU layers for every project row.
- Stop requestAnimationFrame loops after settling and cancel them on unmount, hidden documents and preference changes. Keep native scroll behavior and browser gestures.
- Treat timers as fallbacks, not as guarantees of frame delivery. Content and actions must stay available if an animation never runs.
- Record bundle and interaction baselines before implementing. Proposed acceptance goals: no new eager Three.js import; no more than approximately 10 KB extra gzip in initial-route JS for the first release; no animation-attributable layout shift; no introduced interaction long tasks over 50 ms in the profiled flows. These are targets to verify, not current measurements.
- Measure LCP, CLS and INP before/after using the same setup. Lab timing informs tuning; production INP requires field data. Do not claim a performance improvement from appearance alone.

## 8. Verification and release checklist

- [ ] `npm run typecheck`, `npm run build`, `npm test` pass.
- [ ] A subdirectory build also passes; new images, dialogs and internal links honor `BASE_URL`.
- [ ] Test Home → case → Back, a direct case URL, repeated rapid clicks, list/deck switching, menu navigation, filtering, image inspection and theme toggling during navigation.
- [ ] Test keyboard-only browsing, focus restoration, Escape, screen-reader labels, OS reduced-motion changes while the page is open, and JS-disabled prerendered content.
- [ ] Test light/dark themes at 320, 375, 768 and 1440 px; include landscape mobile and 200% zoom.
- [ ] Test current Chrome, Firefox and Safari, with direct fallbacks for unsupported APIs; include iOS Safari and Android Chrome when available. Feature-detect rather than assuming identical support.
- [ ] Check slow image loading, broken images, route loading failure and background-tab return. No effect may leave text hidden or navigation locked.
- [ ] Record before/after interaction clips and performance traces. Inspect duplicate transition names, console errors, frame drops and unexpected layout shifts.
- [ ] Add behavioral tests for filter URL state, dialog focus/close, drag-versus-click and transition cleanup where these are introduced. The existing static-build tests do not prove animation behavior.
- [ ] Verify all public pages still contain prerendered text and correct canonical/social metadata.

## 9. Suggested first implementation ticket

**Title:** Refine Organic project previews and add screenshot inspection.

**Scope:** viewport-clamped desktop previews, a stable focused-row preview, inline featured artwork on mobile, an accessible screenshot dialog, and shared timing tokens. Preserve the current theme, typography, routes, native scrolling and developer-mode behavior.

**Files:** `WorkPreview.tsx`, `WorkRow.tsx`, `Figure.tsx`, `Home.tsx`, `CasePage.tsx`, new `ImageViewer.tsx`, and the existing motion/site/ui stylesheets.

**Acceptance:** visible artwork never clips outside the viewport or covers the focused link; keyboard and touch users can inspect the same screenshots; dialog close restores focus and scroll; reduced motion removes spatial effects; production and subpath builds pass. Deliver screenshots and an interaction recording before proceeding to shared screenshot morphing.
