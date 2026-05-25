import fs from 'fs';
const src = fs.readFileSync('dist/en/product/index.html', 'utf8');
const matches = [];
let m;
const re = /<link[^>]+canonical[^>]*>/g;
while ((m = re.exec(src)) !== null) matches.push(m[0]);
console.log('Canonical tags: ' + matches.length);
matches.forEach(tag => console.log('  ' + tag.slice(0, 100)));
