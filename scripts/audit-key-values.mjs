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

// Load all locale flat maps (locales + legal overlays)
async function loadAll(lang) {
  let merged = {};
  const deep = (t, s) => {
    for (const [k, v] of Object.entries(s)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        if (!t[k] || typeof t[k] !== 'object') t[k] = {};
        deep(t[k], v);
      } else { t[k] = v; }
    }
  };
  try { deep(merged, JSON.parse(fs.readFileSync(`src/i18n/locales/${lang}.json`, 'utf8'))); } catch {}
  try { deep(merged, JSON.parse(fs.readFileSync(`src/i18n/legal/${lang}.json`, 'utf8'))); } catch {}
  try { deep(merged, JSON.parse(fs.readFileSync(`src/i18n/legal/privacy-${lang}.json`, 'utf8'))); } catch (e) {
    try { deep(merged, JSON.parse(fs.readFileSync(`src/i18n/legal/privacy-en.json`, 'utf8'))); } catch {}
  }
  return flatten(merged);
}

// Important keys to check across locales
const checkKeys = [
  'pages.architecture.byolItem1',
  'pages.architecture.byolTitle',
  'pages.architecture.contractsTitle',
  'pages.architecture.deploy3Title',
  'pages.pricing.tcoForgeHelm',
  'pages.pricing.planEntF2',
  'pages.pricing.planCore',
  'pages.pricing.planPro',
  'pages.pricing.planEnterprise',
  'hero.badge',
  'nav.requestDemo',
  'pages.getStarted.optionDemoTitle',
  'pages.legal.terms.title',
  'pages.legal.privacy.h1',
  'pages.legal.privacy.blocks',
  'sections.modules.m1.title',
  'sections.deployment.d1.title',
  'sections.coreValues.v1.title',
  'pages.useCases.i1.title',
  'pages.contact.subjectPoC',
  'footer.poweredBy',
];

let hasError = false;
for (const lang of ['zh-TW', 'en', 'ja', 'de']) {
  const flat = await loadAll(lang);
  console.log(`\n--- ${lang} ---`);
  for (const k of checkKeys) {
    const v = flat[k];
    if (v === undefined) {
      console.log(`  ❌ MISSING: ${k}`);
      hasError = true;
    } else {
      const display = typeof v === 'string' ? JSON.stringify(v).slice(0, 70) : `[${typeof v}]`;
      console.log(`  ✓ ${k}: ${display}`);
    }
  }
}

process.exit(hasError ? 1 : 0);
