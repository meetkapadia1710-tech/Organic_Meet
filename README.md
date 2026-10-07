# Meet Kapadia portfolio

React 19, TypeScript, Vite and React Router portfolio with project case studies, search, themes, motion, a project deck and developer mode. Production URL: https://meetkapadiaweb.vercel.app.

## Run and verify

Use Node 22.22+ (Node 24 recommended).

```sh
npm ci
npm run dev
npm run build
npm test
npm run preview
```

The build validates content, creates the social preview image, builds assets, renders 24 public routes plus a 404 page, and generates the sitemap and robots file in `site-react/`. Tests run against that completed build. `npm run typecheck` and `npm run check:content` are useful while editing.

## Code map

- `web/content/`: projects, case-study prose, technologies, biography and site settings. Source content is the default when no CMS is configured.
- `web/pages/`, `web/router.tsx`: seven fixed pages, project case studies and a 404 fallback. Browser routes are lazy loaded except Home.
- `web/components/`: navigation, command palette, work list/deck, figures, demos and developer mode.
- `web/hooks/`, `web/state/`, `web/styles/`: interaction, motion, shared preferences and the design system.
- `scripts/`: CMS conversion, image generation, prerendering and sitemap generation.
- `cms/`: optional Sanity Studio, schemas and a seed export.
- `_AI_Detector_Space/`: separately versioned Python/Gradio model demo; it is not part of the portfolio build.
- `_archive/`: historical assets and experiments, excluded from the active site.

## Content and assets

Add projects in `web/content/projects.ts`; case-tier projects also need a matching entry in `web/content/cases.ts`. `pending: true` excludes a project from public routes, counters and sitemap. Keep local images in `web/public/` and use root-relative paths in content; asset helpers apply the hosting base path.

The current source has 19 projects, 17 public case studies and two hidden entries. Missing screenshots are omitted. The CV button stays hidden until a real `web/public/resume.pdf` exists and `RESUME_READY` in `web/content/site.ts` is enabled. Dates, quotes and team attribution require confirmation; do not fabricate them.

## Deployment

Vercel builds with `npm run build` and serves `site-react/` with clean URLs and the generated 404 fallback. The public production origin is committed in `.env.production`. Override `VITE_SITE_URL` and, for subdirectory hosting, `VITE_BASE_PATH` as necessary. URLs must use HTTP(S), with no query or fragment. Never use a placeholder domain.

The GitHub Pages workflow uses Node 24 and sets both values for its repository path. A root `owner.github.io` repository uses `/`. Hosting elsewhere requires directory index support and a custom 404 page. Do not rewrite every route to the homepage: that discards route-specific prerendered metadata.

## Optional CMS

The portfolio works without a Sanity account. To enable editing:

1. Install the separate Studio dependencies: `npm --prefix cms ci`.
2. Copy `cms/.env.example` to `cms/.env.local` and supply your project ID and dataset. Run `npm --prefix cms run dev`.
3. Generate a seed with `npm run cms:export`; import `cms/seed.ndjson` into your own dataset with the Sanity CLI after checking the target project.
4. Set `SANITY_PROJECT_ID`, `SANITY_DATASET` and, for private data, `SANITY_API_TOKEN` in the portfolio build environment. A configured build pulls published content; an unconfigured build uses local files.

`npm run cms:pull -- --file cms/seed.ndjson --check` verifies conversion without changing source files. Without `--check`, pulling writes the project, case and stack content files. Back up local edits first. Case paragraphs support plain text only; unsupported formatting fails rather than silently disappearing. Preview images and positional figure slots survive a round trip.

## Python demo

Install `_AI_Detector_Space/requirements.txt` into a Python environment and run its `app.py`. Model inference downloads the published Hugging Face model. Input validation and score mapping can be tested without that download:

```sh
python -m unittest discover -s _AI_Detector_Space
```

The demo limits text length, processes at most 512 tokens and rejects unknown classifier labels. Its reported benchmark is not a guarantee for arbitrary input. Full model inference requires the model and ML dependencies; it is separate from the website checks.
