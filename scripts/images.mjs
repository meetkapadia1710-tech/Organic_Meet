/* ─────────────────────────────────────────────────────────────────────────
   images.mjs — convert the screenshots in web/public to WebP.

   The originals are ~1900px wide PNGs or JPEGs and several are over 2 MB.
   They are screenshots of interfaces: large flat areas, hard edges, a
   handful of colours — exactly the case where PNG/JPEG is heavy and WebP is
   not. Case studies on this site claim deliberate image weight budgets, so
   shipping a 2 MB hero would be the page contradicting itself.

   Originals are kept. This writes a .webp beside each source file and leaves
   the source alone, because there is no git repository here and a conversion
   script that deletes its own inputs is unrecoverable if the settings turn
   out to be wrong.

     node scripts/images.mjs

   Re-running is safe: a .webp newer than its source is skipped.
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.join(import.meta.dirname, '..', 'web', 'public');

/* Three widths, not one. A phone rendering a figure at ~340 CSS pixels was
   downloading the 1600px file and throwing away 95% of it; `srcset` lets it
   ask for the 800 instead. The 1600 keeps the base filename so every existing
   reference in cases.ts stays valid.

   Chosen for the two real slots: a full-bleed hero (up to ~1400 CSS px, so
   1600 covers it) and a half-width figure in the two-up grid (~650, so 800
   covers it at 1x and 1200 at closer to 2x). */
const WIDTHS = [800, 1200, 1600];
const BASE_WIDTH = 1600;
const QUALITY = 78;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

let before = 0;
let after = 0;
let converted = 0;

const SOURCE_EXT = /\.(png|jpe?g)$/i;

for (const file of walk(ROOT)) {
  if (!SOURCE_EXT.test(file)) continue;
  if (path.basename(file) === 'og.png') continue; // social card must stay PNG

  const srcStat = fs.statSync(file);
  before += srcStat.size;

  const sizes = [];

  for (const width of WIDTHS) {
    // The widest keeps the plain name so existing references stay valid;
    // the narrower ones get a -<width> suffix that Figure builds srcset from.
    const out =
      width === BASE_WIDTH
        ? file.replace(SOURCE_EXT, '.webp')
        : file.replace(SOURCE_EXT, `-${width}.webp`);

    if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < srcStat.mtimeMs) {
      await sharp(file)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      converted += 1;
    }

    const size = fs.statSync(out).size;
    if (width === BASE_WIDTH) after += size;
    sizes.push(`${width}:${(size / 1024).toFixed(0)}KB`);
  }

  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  console.log(`  ${rel}  ${(srcStat.size / 1024).toFixed(0)}KB → ${sizes.join('  ')}`);
}

const kb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
console.log(
  `\n${converted} converted. ${kb(before)} → ${kb(after)} ` +
    `(${(100 - (after / before) * 100).toFixed(0)}% smaller)`
);
