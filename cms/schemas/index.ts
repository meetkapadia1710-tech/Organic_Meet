import { defineField, defineType } from 'sanity';
import { localImage, projectLink, projectLinks, demoEmbed, caseFacts, howCard } from './objects';

const text = (name: string) => defineField({ name, type: 'string' });
const paragraphs = (name: string) => defineField({ name, type: 'array', of: [{ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }], lists: [], marks: { decorators: [], annotations: [] } }] });
const strings = (name: string) => defineField({ name, type: 'array', of: [{ type: 'string' }] });
const images = (name: string) => defineField({ name, type: 'array', of: [{ type: 'localImage' }] });

const project = defineType({
  name: 'project', title: 'Project', type: 'document',
  fields: [
    text('name'), defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
    text('year'), defineField({ name: 'tier', type: 'string', options: { list: ['case', 'archive'] }, validation: (r) => r.required() }),
    text('category'), text('status'), text('preview'), strings('tags'),
    defineField({ name: 'summary', type: 'text' }), text('seoTitle'), defineField({ name: 'seoDescription', type: 'text' }),
    defineField({ name: 'featured', type: 'boolean' }), defineField({ name: 'pending', type: 'boolean' }),
    defineField({ name: 'order', type: 'number' }), defineField({ name: 'links', type: 'projectLinks' }),
    defineField({ name: 'demoKind', type: 'string', options: { list: ['news2'] } }), defineField({ name: 'demoEmbed', type: 'demoEmbed' }),
  ],
  orderings: [{ title: 'Site order', name: 'siteOrder', by: [{ field: 'order', direction: 'asc' }] }],
});
const caseStudy = defineType({
  name: 'caseStudy', title: 'Case study', type: 'document',
  fields: [
    defineField({ name: 'project', type: 'reference', to: [{ type: 'project' }], validation: (r) => r.required() }),
    text('heroFigure'), defineField({ name: 'heroImage', type: 'localImage' }), text('problemHeading'), paragraphs('problemBody'),
    defineField({ name: 'facts', type: 'caseFacts' }), defineField({ name: 'how', type: 'array', of: [{ type: 'howCard' }] }),
    strings('figures'), images('figureImages'), images('gallery'), paragraphs('hardBody'), text('nextKicker'), paragraphs('nextBody'),
  ],
  preview: { select: { title: 'project.name' } },
});
const stackGroup = defineType({ name: 'stackGroup', title: 'Stack group', type: 'document', fields: [text('name'), strings('items'), defineField({ name: 'order', type: 'number' })] });
const siteSettings = defineType({ name: 'siteSettings', title: 'Site settings', type: 'document', fields: [strings('categories')] });

export const schemaTypes = [localImage, projectLink, projectLinks, demoEmbed, caseFacts, howCard, project, caseStudy, stackGroup, siteSettings];
