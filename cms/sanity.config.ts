import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) throw new Error('Set SANITY_STUDIO_PROJECT_ID in cms/.env to your Sanity project ID.');

export default defineConfig({
  name: 'portfolio', title: 'Meet Kapadia — Content',
  projectId, dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()], schema: { types: schemaTypes },
});
