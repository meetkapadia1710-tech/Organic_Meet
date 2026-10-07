# Repository status

Updated 2026-10-08. Production origin supplied by the owner: https://meetkapadiaweb.vercel.app. Source changes are local; this work has not deployed the site.

The active app is React 19 + TypeScript + Vite with React Router. There are 19 source projects, 17 public cases, four featured projects and two pending entries (`hindsight`, `paymatrix`). Seven fixed routes plus the cases produce 24 public HTML pages. The orphan LocateMe case was removed from active content and retained in `_archive/locateme-content.txt`.

The build now includes content validation, social-image generation, prerendering, route-specific canonical/social tags, a noindex 404 fallback, and a sitemap for the real domain. Vercel serves the generated pages; GitHub Pages applies its hosting subpath. Assets and browser routing use the same base path.

The project deck preserves drag suppression after crossing a card threshold. Unknown case slugs lead to a real contact route. Images without source assets are omitted. The portrait is served as responsive WebP. Route failures have a recovery screen. Portfolio counters describe projects rather than claiming every in-progress entry is shipped.

Sanity Studio now has executable configuration and complete schemas. Its import/export preserves project previews and figure slots and rejects invalid references, duplicate/reserved slugs and unsupported rich formatting. No external project or dataset has been configured or modified. The website dependency audit is clean; the separate Studio has 16 unresolved upstream advisories (7 high, 9 moderate), documented in `report.md`.

The separately versioned Python detector validates input and model outputs, explicitly maps classifier labels and truncates inference to the model's 512-token limit. Root Git does not contain its internal diff: inspect `_AI_Detector_Space` separately when committing.

## Information still needed

- Real CV PDF; resume controls remain disabled.
- Confirmed education/work dates, the four client delivery years, and team contributions for DealAI and Ambulance Triage.
- Approved testimonials, hardware details and any missing project screenshots or public links.
- Sanity project/dataset credentials if hosted content management is wanted.

Existing unconfirmed delivery-year copy is flagged in source comments; it has not been independently verified. Missing personal sections and screenshots are hidden rather than replaced with invented content.

## Maintenance constraints

- Do not restore the reverted decorative backdrop without the owner's request.
- Preserve reduced-motion support, reveal timeouts and the smooth-scroll watchdog.
- Keep runtime navigation and prerendered routes in sync; run the build tests after changing routes or content.
- Heatmaps depend on third-party APIs; their error states keep profile links available.
- New assets must work under a hosting subpath as well as at `/`.

See `report.md` for verification scope and `README.md` for commands and CMS setup.
