/**
 * 驗證 legal overlay JSON 結構一致性：
 * - terms: 每個語系都有 pages.legal.terms { title, description, h1, lastUpdated, sections[] }
 * - privacy: 每個語系都有 pages.legal.privacy { title, description, h1, lastUpdated, blocks[] }
 */
import fs from 'fs';

const locales = ['en', 'zh-TW', 'ja', 'de'];
const issues = [];

for (const loc of locales) {
  const termsFile = `src/i18n/legal/${loc}.json`;
  const privacyFile = `src/i18n/legal/privacy-${loc}.json`;

  // Terms
  if (!fs.existsSync(termsFile)) {
    issues.push(`MISSING: ${termsFile}`);
  } else {
    const data = JSON.parse(fs.readFileSync(termsFile, 'utf8'));
    const terms = data?.pages?.legal?.terms;
    if (!terms) issues.push(`[${loc}] terms: missing pages.legal.terms`);
    else {
      for (const f of ['title', 'description', 'h1', 'lastUpdated']) {
        if (!terms[f]) issues.push(`[${loc}] terms: missing ${f}`);
      }
      if (!Array.isArray(terms.sections) || terms.sections.length === 0) {
        issues.push(`[${loc}] terms: sections is empty or not array`);
      } else {
        terms.sections.forEach((s, i) => {
          if (!s.heading) issues.push(`[${loc}] terms.sections[${i}]: missing heading`);
        });
      }
    }
  }

  // Privacy
  if (!fs.existsSync(privacyFile)) {
    issues.push(`MISSING: ${privacyFile}`);
  } else {
    const data = JSON.parse(fs.readFileSync(privacyFile, 'utf8'));
    const privacy = data?.pages?.legal?.privacy;
    if (!privacy) issues.push(`[${loc}] privacy: missing pages.legal.privacy`);
    else {
      for (const f of ['title', 'description', 'h1', 'lastUpdated']) {
        if (!privacy[f]) issues.push(`[${loc}] privacy: missing ${f}`);
      }
      if (!Array.isArray(privacy.blocks) || privacy.blocks.length === 0) {
        issues.push(`[${loc}] privacy: blocks is empty or not array`);
      } else {
        privacy.blocks.forEach((b, i) => {
          if (!b.type) issues.push(`[${loc}] privacy.blocks[${i}]: missing type`);
        });
      }
    }
  }
}

// Cross-locale: check terms section count parity
const sectionCounts = {};
const blockCounts = {};
for (const loc of locales) {
  const t = JSON.parse(fs.readFileSync(`src/i18n/legal/${loc}.json`, 'utf8'));
  sectionCounts[loc] = t.pages.legal.terms.sections.length;
  const p = JSON.parse(fs.readFileSync(`src/i18n/legal/privacy-${loc}.json`, 'utf8'));
  blockCounts[loc] = p.pages.legal.privacy.blocks.length;
}

const uniqueSections = new Set(Object.values(sectionCounts));
if (uniqueSections.size > 1) {
  issues.push(`Terms section count mismatch: ${JSON.stringify(sectionCounts)}`);
} else {
  console.log(`Terms sections: ${Object.values(sectionCounts)[0]} per locale ✓`);
}

const uniqueBlocks = new Set(Object.values(blockCounts));
if (uniqueBlocks.size > 1) {
  issues.push(`Privacy block count mismatch: ${JSON.stringify(blockCounts)}`);
} else {
  console.log(`Privacy blocks: ${Object.values(blockCounts)[0]} per locale ✓`);
}

if (issues.length === 0) {
  console.log(`✅ All 8 legal overlay files have correct structure`);
} else {
  console.log(`❌ ${issues.length} issue(s):`);
  issues.forEach(i => console.log('  ' + i));
}
