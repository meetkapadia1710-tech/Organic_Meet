import { build } from 'esbuild';

export async function loadContent() {
  const result = await build({
    stdin: { contents: "export * from './web/content/projects.ts'; export * from './web/content/cases.ts'; export * from './web/content/routes.ts';", resolveDir: process.cwd() },
    bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent',
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
