/**
 * 驗證 built HTML 的 <title> 標籤是否有實際翻譯（不是 key 字串或重複英文）
 */
import fs from 'fs';
import path from 'path';

function collectHtml(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectHtml(full));
    else if (entry.name === 'index.html') result.push(full);
  }
  return result;
}

const pages = [
  'product', 'pricing', 'architecture', 'compliance',
  'use-cases', 'about', 'contact', 'get-started',
  'terms', 'privacy'
];

const locales = ['', 'en/', 'ja/', 'de/'];
const issues = [];

for (const page of pages) {
  const titles = {};
  for (const loc of locales) {
    const file = `dist/${loc}${page}/index.html`;
    if (!fs.existsSync(file)) {
      issues.push(`MISSING: ${file}`);
      continue;
    }
    const src = fs.readFileSync(file, 'utf8');
    const m = src.match(/<title>([^<]+)<\/title>/);
    if (!m) {
      issues.push(`NO_TITLE: ${file}`);
      continue;
    }
    const lang = loc.replace('/', '') || 'zh-TW';
    titles[lang] = m[1].trim();
  }

  // Check that ja and de titles differ from en (i.e. actually translated)
  const enTitle = titles['en'];
  for (const lang of ['ja', 'de']) {
    if (titles[lang] && titles[lang] === enTitle) {
      issues.push(`UNTRANSLATED title [${lang}/${page}]: "${titles[lang]}"`);
    }
  }

  // Check zh-TW is CJK
  if (titles['zh-TW'] && !/[\u4e00-\u9fff\u3400-\u4dbf]/.test(titles['zh-TW'])) {
    issues.push(`zh-TW title has no CJK [${page}]: "${titles['zh-TW']}"`);
  }
}

if (issues.length === 0) {
  console.log(`✅ All ${pages.length} pages × 4 locales have correct, locale-specific <title> tags`);
} else {
  console.log(`❌ ${issues.length} issue(s):`);
  issues.forEach(i => console.log('  ' + i));
}
