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

const en = flatten(JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8')));
const prefixes = ['sections.', 'pages.', 'footer.', 'common.', 'hero.', 'nav.'];
const ignoreExact = new Set([
  'SBOM', 'Core', 'Professional', 'Enterprise', 'CTO / CIO', 'CISO', 'IT / DevSecOps',
  'ForgeHelm', 'Smart Sequence Tech (智序資訊工作室)', 'service@smartsequence.tech',
  'Tax ID: 60295398', 'SaaS', 'PDF', 'Excel', 'CSV', 'Word', 'USD', 'TWD', 'CNY', 'JPY', 'EUR',
  'GitHub Advanced Security', 'Snyk Team / Ignite', 'SonarQube Enterprise', 'Vanta (GRC)', 'Checkmarx',
  'Powered by ForgeHelm', '智序資訊工作室', 'Smart Sequence Tech', 'Enterprise',
]);

let failed = false;
for (const lang of ['ja', 'de']) {
  const loc = flatten(JSON.parse(fs.readFileSync(`src/i18n/locales/${lang}.json`, 'utf8')));
  const same = Object.keys(en).filter(
    (k) =>
      prefixes.some((p) => k.startsWith(p)) &&
      typeof en[k] === 'string' &&
      en[k].length > 12 &&
      loc[k] === en[k] &&
      !ignoreExact.has(en[k]) &&
      !en[k].includes('$') &&
      !en[k].includes('@') &&
      !en[k].startsWith('http')
  );
  console.log(`${lang}: ${same.length} long strings still identical to English`);
  if (same.length > 25) {
    failed = true;
    console.log(same.slice(0, 15).join('\n'));
  }
}

process.exit(failed ? 1 : 0);
