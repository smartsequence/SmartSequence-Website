/**
 * 找出 ja/de 中值與 en 完全相同的 key（排除名詞/縮寫等合理重複）
 * 這比 verify-translation-quality 更嚴格——任何完全相同的值都要標記
 */
import fs from 'fs';

const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));

function flatten(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      Object.assign(result, flatten(v, key));
    } else if (typeof v === 'string') {
      result[key] = v;
    }
  }
  return result;
}

const enFlat = flatten(en);

// Known-identical exceptions: brand names, acronyms, symbols, short codes
const allowIdentical = new Set([
  'CycloneDX', 'SPDX', 'CTO / CIO', 'CISO', 'IT / DevSecOps',
  'SignalR', 'SQLite', 'ForgeHelm', 'Smart Sequence Tech',
  'SaaS', 'BYOL', 'Ollama', 'vLLM', 'pgvector', 'Stripe',
  'service@smartsequence.tech', 'PDF', 'CSV', 'Excel', 'Word',
  '© 2026 Smart Sequence Tech (智序資訊工作室). All rights reserved.'
]);

function isAllowedIdentical(enVal) {
  if (enVal.length <= 10) return true; // short names, icons, abbreviations
  if (/^[A-Z0-9\s\-\/\.\+\,\(\)×~]+$/.test(enVal)) return true; // ALL-CAPS acronyms
  if (/^[\$€¥]/.test(enVal) || /^\d/.test(enVal)) return true; // prices, numbers
  if (/^✓$|^✗$/.test(enVal)) return true; // check symbols
  if (enVal.startsWith('NT$') || enVal.startsWith('USD') || enVal.startsWith('JPY')) return true;
  if (allowIdentical.has(enVal)) return true;
  return false;
}

for (const loc of ['ja', 'de']) {
  const data = JSON.parse(fs.readFileSync(`src/i18n/locales/${loc}.json`, 'utf8'));
  const flat = flatten(data);
  const identical = [];
  for (const [key, val] of Object.entries(flat)) {
    if (enFlat[key] && val === enFlat[key] && !isAllowedIdentical(enFlat[key])) {
      identical.push({ key, value: val.substring(0, 80) });
    }
  }
  if (identical.length === 0) {
    console.log(`${loc}: ✅ No suspicious identical values`);
  } else {
    console.log(`${loc}: ⚠️  ${identical.length} potentially untranslated:`);
    identical.forEach(({ key, value }) => console.log(`  ${key}: "${value}"`));
  }
}
