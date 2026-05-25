/**
 * zh-TW 風格檢查：
 * 1. 找出仍包含全英文句子的值（可能未翻譯）
 * 2. 找出帶英文但未加括號的（應該是「繁中（English）」格式）
 */
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/i18n/locales/zh-TW.json', 'utf8'));
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

const zhFlat = flatten(data);
const enFlat = flatten(en);

const issues = [];

for (const [key, val] of Object.entries(zhFlat)) {
  const enVal = enFlat[key];
  if (!enVal) continue;

  // Skip plan names in form dropdowns, emails, company names, copyright
  if (key.includes('contact.plan') && ['Core', 'Professional', 'Enterprise'].includes(val)) continue;
  if (key.includes('email') || key.includes('copyright') || key.includes('companyName')) continue;
  if (val.includes('service@') || val.includes('60295398')) continue;

  // Detect values identical to English (possibly untranslated)
  if (val === enVal && val.length > 10 && !/^[A-Z0-9\s\-\/\.\+\,\(\)×~\$\¥€]+$/.test(val)) {
    issues.push(`IDENTICAL: ${key}: "${val.substring(0, 60)}"`);
  }
}

if (issues.length === 0) {
  console.log('✅ zh-TW: No values still identical to English');
} else {
  console.log(`⚠️  zh-TW: ${issues.length} values identical to English:`);
  issues.forEach(i => console.log('  ' + i));
}
