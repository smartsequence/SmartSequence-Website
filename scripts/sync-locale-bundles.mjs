/**
 * 把 src/i18n/bundles/{ja,de}-*.json 的值同步成 src/i18n/locales/{ja,de}.json 的現行值。
 *
 * bundle 是某次翻譯匯入留下的快照，只被 apply-locale-bundles.mjs 使用；若 locale 改了而 bundle 沒改，
 * 日後誰跑一次 apply 就會把舊文案灌回去。本腳本只覆寫 bundle 內既有鍵的值，不新增、不刪除鍵。
 * 改過 ja／de locale 之後跑一次再 commit。
 */
import fs from 'fs';
import path from 'path';

const root = new URL('../src/i18n/', import.meta.url);
const bundlesDir = new URL('bundles/', root);
const localesDir = new URL('locales/', root);

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

function setDeep(obj, key, value) {
  const parts = key.split('.');
  let cur = obj;
  for (const p of parts.slice(0, -1)) {
    if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

let totalUpdated = 0;
for (const file of fs.readdirSync(bundlesDir).filter(f => f.endsWith('.json')).sort()) {
  const locale = file.split('-')[0];
  const localePath = new URL(`${locale}.json`, localesDir);
  if (!fs.existsSync(localePath)) {
    console.warn(`skip ${file}: no locale file for ${locale}`);
    continue;
  }
  const live = flatten(JSON.parse(fs.readFileSync(localePath, 'utf8')));
  const bundlePath = new URL(file, bundlesDir);
  const bundleFlat = flatten(JSON.parse(fs.readFileSync(bundlePath, 'utf8')));

  const rebuilt = {};
  let updated = 0;
  for (const key of Object.keys(bundleFlat)) {
    const value = key in live ? live[key] : bundleFlat[key];
    if (value !== bundleFlat[key]) updated++;
    setDeep(rebuilt, key, value);
  }
  fs.writeFileSync(bundlePath, JSON.stringify(rebuilt, null, 2) + '\n', 'utf8');
  totalUpdated += updated;
  console.log(`${file.padEnd(22)} keys ${Object.keys(bundleFlat).length}  updated ${updated}`);
}
console.log(`done; ${totalUpdated} value(s) refreshed from live locales`);
