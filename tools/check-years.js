const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.resolve(__dirname, '..', 'embedded-problems.js'), 'utf8');
eval(src.replace('const BUILTIN_PROBLEMS', 'var BUILTIN_PROBLEMS'));

// Count by year
const years = {};
BUILTIN_PROBLEMS.forEach(p => {
  if (!(p.year in years)) years[p.year] = 0;
  years[p.year]++;
});
console.log('Problems by year:', JSON.stringify(years, null, 2));

// Count by year+test
const combos = {};
BUILTIN_PROBLEMS.forEach(p => {
  const key = p.year + '-' + p.test;
  if (!(key in combos)) combos[key] = 0;
  combos[key]++;
});
console.log('\nProblems by year-test combo:');
Object.keys(combos).sort().forEach(k => console.log('  ' + k + ': ' + combos[k]));

// 2020 specifically
const p2020 = BUILTIN_PROBLEMS.filter(p => String(p.year) === '2020');
console.log('\n2020 problems total:', p2020.length);
if (p2020.length > 0) {
  console.log('Sample 2020:', JSON.stringify(p2020[0]));
}

console.log('\nTotal problems:', BUILTIN_PROBLEMS.length);
