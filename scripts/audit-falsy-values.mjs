/**
 * 檢查所有翻譯值是否有空字串、0、false 等 falsy 值
 * （t() 函式使用 value || key 回退，falsy 值會導致 fallback 到 key）
 */
import fs from 'fs';

const locales = fs.readdirSync(new URL('../src/i18n/locales/', import.meta.url)).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
const issues = [];

function walk(obj, prefix, locale) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      walk(v, key, locale);
    } else if (typeof v === 'string') {
      if (v === '') issues.push(`EMPTY: [${locale}] ${key}`);
      if (v.trim() === '') issues.push(`WHITESPACE_ONLY: [${locale}] ${key}`);
    } else if (v === 0 || v === false || v === null) {
      issues.push(`FALSY: [${locale}] ${key} = ${JSON.stringify(v)}`);
    }
  }
}

for (const loc of locales) {
  const data = JSON.parse(fs.readFileSync(`src/i18n/locales/${loc}.json`, 'utf8'));
  walk(data, '', loc);
}

if (issues.length === 0) {
  console.log(`✅ No empty/falsy values found in ${locales.length} locale files`);
} else {
  console.log(`❌ ${issues.length} issue(s):`);
  issues.forEach(i => console.log('  ' + i));
}
