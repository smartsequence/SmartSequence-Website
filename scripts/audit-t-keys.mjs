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

// 掃目錄而非手維護清單（原寫死 en/zh-TW/ja/de，新增語系時會靜默漏查）。
const locales = fs
  .readdirSync('src/i18n/locales')
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort();
const flat = {};
for (const l of locales) {
  flat[l] = flatten(JSON.parse(fs.readFileSync(`src/i18n/locales/${l}.json`, 'utf8')));
}

// Collect all .astro files recursively
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
  // match t('key') and t("key")
  const re = /\bt\(['"]([^'"]+)['"]\)/g;
  for (const m of src.matchAll(re)) usedKeys.add(m[1]);
}

// Keys in pages but missing from en.json
const missing = [...usedKeys].filter(k => flat['en'][k] === undefined).sort();
console.log(`\n=== Keys used in .astro files but MISSING from en.json (${missing.length}) ===`);
if (missing.length) missing.forEach(k => console.log('  MISSING: ' + k));
else console.log('  None ✓');

// Check en keys not covered by other locales
console.log('\n=== Missing per locale ===');
for (const l of locales.filter(x => x !== 'en')) {
  const enKeys = Object.keys(flat['en']);
  const miss = enKeys.filter(k => flat[l][k] === undefined);
  console.log(`  ${l}: ${miss.length} missing`);
  if (miss.length) miss.slice(0, 5).forEach(k => console.log(`    ${k}`));
}

console.log(`\nTotal t() keys referenced in pages: ${usedKeys.size}`);
console.log(`Total keys in en.json: ${Object.keys(flat['en']).length}`);
