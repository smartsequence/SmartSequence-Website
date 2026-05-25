import fs from 'fs';

// hreflang check
const html = fs.readFileSync('dist/en/index.html', 'utf8');
const linkTags = html.match(/<link rel="alternate"[^>]+>/g) || [];
console.log('hreflang link tags in /en/index.html:');
linkTags.forEach(t => console.log(' ', t));

// robots.txt
const robots = fs.readFileSync('public/robots.txt', 'utf8');
console.log('\nrobots.txt:\n' + robots);

// Schema.org content
const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (schemaMatch) {
  const schema = JSON.parse(schemaMatch[1]);
  console.log('\nSchema.org type:', schema['@type']);
  console.log('Schema.org name:', schema.name);
  console.log('Schema.org url:', schema.url);
}

// Sitemap URL count per locale
const sitemap = fs.readFileSync('dist/sitemap-0.xml', 'utf8');
const allUrls = sitemap.match(/<loc>[^<]+<\/loc>/g) || [];
const byLocale = { root: 0, en: 0, ja: 0, de: 0 };
for (const u of allUrls) {
  if (u.includes('/en/')) byLocale.en++;
  else if (u.includes('/ja/')) byLocale.ja++;
  else if (u.includes('/de/')) byLocale.de++;
  else byLocale.root++;
}
console.log('\nSitemap URL count by locale:', byLocale, '— total:', allUrls.length);
