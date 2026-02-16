const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '..', 'embedded-problems.js');
const src = fs.readFileSync(filePath, 'utf8');

// Parse the array from the file
const match = src.match(/const BUILTIN_PROBLEMS\s*=\s*(\[[\s\S]*\]);?\s*$/);
if (!match) { console.error('Could not find BUILTIN_PROBLEMS array'); process.exit(1); }

const problems = JSON.parse(match[1]);
console.log('Total problems before:', problems.length);

const filtered = problems.filter(p => String(p.year) !== '2020');
console.log('Total problems after removing 2020:', filtered.length);
console.log('Removed:', problems.length - filtered.length, 'problems');

// Write back
const output = 'const BUILTIN_PROBLEMS = ' + JSON.stringify(filtered) + ';\n';
fs.writeFileSync(filePath, output, 'utf8');
console.log('Written to', filePath);
