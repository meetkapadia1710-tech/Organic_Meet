/* ─────────────────────────────────────────────────────────────────────────
   objects.ts — the reusable shapes, matching web/content/types.ts field for
   field, and matching what scripts/cms-export.mjs emits.

   These three files are one contract in three places. If a field is added
   here it has to be added to the exporter and to `types.ts`, or the
   build-time sync will silently drop it.
   ───────────────────────────────────────────────────────────────────────── */

import { defineField, defineType } from 'sanity';

/* Not a Sanity image asset — deliberately.

   The screenshots in web/public are already processed by scripts/images.mjs
   into three widths, and `Figure` rebuilds the `srcset` from the base path by
   convention. Uploading them to Sanity's asset store would discard that
   pipeline and replace three local files with a CDN round-trip.

   So the CMS stores the *path* plus the dimensions the browser needs to
   reserve space (which is why width/height are required, not optional — a
   missing dimension is a layout shift). New images are still added by
   dropping a file in web/public and running the image script. */
export const localImage = defineType({
  name: 'localImage',
  title: 'Image (from web/public)',
  type: 'object',
  fields: [
    defineField({
      name: 'src',
      title: 'Path',
      type: 'string',
      description: 'Absolute path under web/public, e.g. /playhub/MainScreen.webp',
      validation: (Rule) =>
        Rule.required()
          .regex(/^\/.+\.webp$/, { name: 'a /path/to/file.webp' })
          .custom((value) =>
            value && value.includes('-800') || value?.includes('-1200')
              ? 'Point at the base file, not a width variant — Figure builds the srcset itself.'
              : true
          ),
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'text',
      rows: 2,
      description: 'Describe what the screenshot shows, not that it is a screenshot.',
      validation: (Rule) => Rule.required().min(15),
    }),
    // Required, not optional: without these the browser cannot reserve the
    // space and the figure shifts the page as it loads.
    defineField({ name: 'width', type: 'number', validation: (Rule) => Rule.required().positive() }),
    defineField({ name: 'height', type: 'number', validation: (Rule) => Rule.required().positive() }),
  ],
  preview: {
    select: { title: 'src', subtitle: 'alt' },
  },
});

export const projectLink = defineType({
  name: 'projectLink',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'href', type: 'url', validation: (Rule) => Rule.required() }),
  ],
});

export const projectLinks = defineType({
  name: 'projectLinks',
  title: 'Links',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({ name: 'live', title: 'Live URL', type: 'url' }),
    defineField({ name: 'repo', title: 'Repository', type: 'url' }),
    defineField({
      name: 'liveNote',
      title: 'Note on the live link',
      type: 'string',
      description: 'For warning about a cold-starting free-tier host, etc.',
    }),
    defineField({ name: 'extra', title: 'Other links', type: 'array', of: [{ type: 'projectLink' }] }),
  ],
});

export const demoEmbed = defineType({
  name: 'demoEmbed',
  title: 'Embedded demo',
  type: 'object',
  fields: [
    defineField({ name: 'embed', title: 'Embed URL', type: 'url', validation: (Rule) => Rule.required() }),
    defineField({ name: 'label', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'note', type: 'text', rows: 3 }),
  ],
});

export const caseFacts = defineType({
  name: 'caseFacts',
  title: 'Facts sidebar',
  type: 'object',
  fields: [
    defineField({ name: 'role', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'year', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'stack',
      type: 'string',
      description: 'Separated by · — the site splits on it to render icon chips.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'surfaces', type: 'string' }),
  ],
});

export const howCard = defineType({
  name: 'howCard',
  title: 'How it works — card',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'body', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
  ],
  preview: { select: { title: 'title', subtitle: 'body' } },
});
