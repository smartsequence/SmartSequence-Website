/**
 * 找出 en.json 中從未被任何 .astro 使用的 key（孤兒 key）
 * 以及各頁面使用的 key 統計
 */
import fs from 'fs';
import path from 'path';

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, p));
    else out[p] = v;
  }
  return out;
}

const enFlat = flatten(JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8')));

function collectAstro(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectAstro(full));
    else if (entry.name.endsWith('.astro')) results.push(full);
  }
  return results;
}

const allFiles = collectAstro('src');
const usedKeys = new Set();

for (const f of allFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const re = /\bt\(['"]([^'"]+)['"]\)/g;
  for (const m of src.matchAll(re)) usedKeys.add(m[1]);
}

// Keys in en.json never referenced anywhere (orphan keys)
const orphans = Object.keys(enFlat).filter(k => !usedKeys.has(k)).sort();
console.log(`\nTotal keys in en.json: ${Object.keys(enFlat).length}`);
console.log(`Keys referenced in pages: ${usedKeys.size}`);
console.log(`Orphan keys (in en.json but never used by pages): ${orphans.length}`);

// Show orphan keys grouped by prefix
const byPrefix = {};
for (const k of orphans) {
  const prefix = k.split('.').slice(0, 2).join('.');
  if (!byPrefix[prefix]) byPrefix[prefix] = [];
  byPrefix[prefix].push(k);
}

for (const [prefix, keys] of Object.entries(byPrefix).sort()) {
  console.log(`\n  [${prefix}] (${keys.length})`);
  keys.slice(0, 8).forEach(k => console.log(`    ${k}`));
  if (keys.length > 8) console.log(`    ...+${keys.length - 8} more`);
}
