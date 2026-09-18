import fs from 'fs';

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, p));
    else out[p] = v;
  }
  return out;
}

// 掃目錄而非手維護清單（原寫死 en/zh-TW/ja/de，新增語系時漏改會讓新 locale 完全不受檢）。
const locales = fs
  .readdirSync('src/i18n/locales')
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort();
const flat = Object.fromEntries(
  locales.map((l) => [l, flatten(JSON.parse(fs.readFileSync(`src/i18n/locales/${l}.json`, 'utf8')))])
);

const enKeys = Object.keys(flat.en).sort();
let failed = false;

for (const l of locales.filter((x) => x !== 'en')) {
  const missing = enKeys.filter((k) => flat[l][k] === undefined);
  const extra = Object.keys(flat[l]).filter((k) => flat.en[k] === undefined);
  if (missing.length || extra.length) {
    failed = true;
    console.log(`\n${l}: missing ${missing.length}, extra ${extra.length}`);
    if (missing.length) console.log('  missing:', missing.slice(0, 20).join(', '), missing.length > 20 ? '...' : '');
    if (extra.length) console.log('  extra:', extra.slice(0, 20).join(', '), extra.length > 20 ? '...' : '');
  }
}

// Spot-check: no empty string values in non-en locales for pages.useCases
for (const l of locales.filter((x) => x !== 'en')) {
  const bad = enKeys
    .filter((k) => k.startsWith('pages.useCases.') && flat.en[k] && !flat[l][k])
    .slice(0, 10);
  if (bad.length) {
    failed = true;
    console.log(`${l} empty/missing useCases keys:`, bad);
  }
}

if (!failed) console.log('All locales have identical key structure to en.json');
process.exit(failed ? 1 : 0);
