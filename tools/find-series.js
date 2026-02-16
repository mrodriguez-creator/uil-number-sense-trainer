const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.resolve(__dirname, '..', 'embedded-problems.js'), 'utf8');
eval(src.replace('const BUILTIN_PROBLEMS', 'var BUILTIN_PROBLEMS'));

// Find problems that mention series, sum, arithmetic, geometric, etc.
const found = [];
BUILTIN_PROBLEMS.forEach(p => {
  const q = p.q.toLowerCase();
  if (q.includes('sum') || q.includes('series') || q.includes('…') || q.includes('...') ||
      q.includes('arithmetic') || q.includes('geometric') || q.includes('sequence') ||
      q.includes('triangular') || q.includes('first') || q.includes('mean') ||
      q.includes('consecutive') || q.includes('infinite') || q.includes('converge')) {
    found.push(p);
  }
});

console.log('Found', found.length, 'series/sum-like problems:\n');
found.forEach(p => {
  console.log(`#${p.num} (${p.year}-${p.test}) [${p.t}] ${p.q} => ${p.a}`);
});
