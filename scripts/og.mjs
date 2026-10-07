import fs from 'node:fs';
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f5ead8"/><circle cx="1130" cy="80" r="240" fill="#ffe1d0"/><circle cx="990" cy="620" r="160" fill="#7a8a5e"/><text x="80" y="130" font-family="sans-serif" font-size="32" fill="#8c491a">MEET KAPADIA</text><text x="80" y="285" font-family="sans-serif" font-weight="bold" font-size="72" fill="#201e1d">Software developer,</text><text x="80" y="380" font-family="sans-serif" font-weight="bold" font-size="72" fill="#8c491a">systems builder.</text><text x="80" y="480" font-family="sans-serif" font-size="28" fill="#645c50">Full-stack web apps · AI tooling · Local-first systems</text><rect x="80" y="550" width="260" height="12" rx="6" fill="#c67139"/></svg>`;
fs.mkdirSync('web/public', { recursive: true });
await sharp(Buffer.from(svg)).png().toFile('web/public/og.png');
console.log('Generated web/public/og.png');
