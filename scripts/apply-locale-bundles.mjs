import fs from 'fs';
import path from 'path';

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== 'object') target[k] = {};
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

const root = path.join(process.cwd(), 'src/i18n/bundles');
const localesDir = path.join(process.cwd(), 'src/i18n/locales');

for (const lang of ['ja', 'de']) {
  const localePath = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const files = fs
    .readdirSync(root)
    .filter((f) => f.startsWith(`${lang}-`) && f.endsWith('.json'))
    .sort();
  for (const file of files) {
    const bundle = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    deepMerge(data, bundle);
  }
  fs.writeFileSync(localePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`merged ${files.length} bundles into ${lang}.json`);
}
