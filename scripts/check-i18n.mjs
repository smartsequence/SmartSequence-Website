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

const locales = ['en', 'zh-TW', 'ja', 'de'];
const flat = {};
for (const l of locales) {
  flat[l] = flatten(JSON.parse(fs.readFileSync(`src/i18n/locales/${l}.json`, 'utf8')));
}

const re = /t\(['"`]([^'"`]+)['"`]\)/g;
const keys = new Set();

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) walk(fp);
    else if (/\.(astro|tsx?)$/.test(f)) {
      const s = fs.readFileSync(fp, 'utf8');
      let m;
      while ((m = re.exec(s))) keys.add(m[1]);
    }
  }
}
walk('src');

for (const l of locales) {
  const missing = [...keys].filter((k) => flat[l][k] === undefined).sort();
  console.log(`${l}: ${missing.length} missing`);
  if (missing.length) console.log(missing.join('\n'));
}
