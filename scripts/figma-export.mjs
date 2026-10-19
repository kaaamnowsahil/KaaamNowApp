// Exports every top-level frame of the KaamNow Figma file as PNG plus a JSON summary.
// Usage: FIGMA_TOKEN in .env.local, then `npm run figma:export`.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const FILE_KEY = 'qtCoCV096jOWdNxpfqBquH';
const OUT_DIR = path.resolve('design/figma');

async function loadToken() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN;
  const env = await readFile('.env.local', 'utf8').catch(() => '');
  const match = env.match(/^FIGMA_TOKEN=(.+)$/m);
  if (!match) throw new Error('FIGMA_TOKEN not found in environment or .env.local');
  return match[1].trim();
}

async function figma(token, url) {
  const res = await fetch(`https://api.figma.com/v1${url}`, { headers: { 'X-Figma-Token': token } });
  if (!res.ok) throw new Error(`Figma API ${res.status} for ${url}: ${await res.text()}`);
  return res.json();
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'frame';

const token = await loadToken();
const file = await figma(token, `/files/${FILE_KEY}?depth=2`);

const frames = [];
for (const page of file.document.children) {
  for (const node of page.children ?? []) {
    if (['FRAME', 'COMPONENT', 'SECTION', 'COMPONENT_SET'].includes(node.type)) {
      frames.push({ id: node.id, name: node.name, page: page.name, type: node.type });
    }
  }
}
console.log(`Found ${frames.length} frames across ${file.document.children.length} page(s).`);

await mkdir(OUT_DIR, { recursive: true });
const BATCH = 50;
for (let i = 0; i < frames.length; i += BATCH) {
  const batch = frames.slice(i, i + BATCH);
  const ids = batch.map((f) => f.id).join(',');
  const { images } = await figma(token, `/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=2`);
  for (const [index, frame] of batch.entries()) {
    const url = images[frame.id];
    if (!url) continue;
    const fileName = `${String(i + index + 1).padStart(3, '0')}-${slug(frame.page)}-${slug(frame.name)}.png`;
    const png = Buffer.from(await (await fetch(url)).arrayBuffer());
    await writeFile(path.join(OUT_DIR, fileName), png);
    frame.file = fileName;
  }
}

await writeFile(path.join(OUT_DIR, 'frames.json'), JSON.stringify({ fileName: file.name, lastModified: file.lastModified, frames }, null, 2));
console.log(`Exported ${frames.filter((f) => f.file).length} PNGs to ${OUT_DIR}`);
