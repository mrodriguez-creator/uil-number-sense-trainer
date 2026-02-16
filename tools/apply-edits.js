// apply-edits.js - Apply problem edits from JSON to embedded-problems.js
// Run from project root: node tools/apply-edits.js
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

// Read the edits
const edits = JSON.parse(fs.readFileSync(path.join(root, 'data', 'problem-edits-2026-02-16.json'), 'utf8'));

// Read embedded-problems.js and extract the JSON array
const raw = fs.readFileSync(path.join(root, 'embedded-problems.js'), 'utf8');
const match = raw.match(/^const BUILTIN_PROBLEMS = (\[[\s\S]*\]);?\s*$/);
if (!match) {
  console.error('Could not parse embedded-problems.js');
  process.exit(1);
}
const problems = JSON.parse(match[1]);
console.log(`Loaded ${problems.length} problems`);
console.log(`Loaded ${Object.keys(edits).length} edits`);

// Build a lookup: "num-year-test" -> index in problems array
const index = {};
for (let i = 0; i < problems.length; i++) {
  const p = problems[i];
  const key = `${p.num}-${p.year}-${p.test}`;
  if (index[key]) {
    console.warn(`Duplicate key: ${key} at indices ${index[key]} and ${i}`);
  }
  index[key] = i;
}

// Apply edits
let applied = 0;
let notFound = 0;
const missing = [];

for (const [key, edit] of Object.entries(edits)) {
  const idx = index[key];
  if (idx === undefined) {
    notFound++;
    missing.push(key);
    continue;
  }

  const p = problems[idx];
  const oldQ = p.q;
  const oldA = p.a;

  // Apply question edit if present
  if (edit.q !== undefined) {
    p.q = edit.q;
  }
  // Apply answer edit if present
  if (edit.a !== undefined) {
    p.a = edit.a;
  }

  applied++;

  // Log changes
  const changes = [];
  if (edit.q !== undefined && edit.q !== oldQ) changes.push(`Q: "${oldQ}" -> "${edit.q}"`);
  if (edit.a !== undefined && edit.a !== oldA) changes.push(`A: "${oldA}" -> "${edit.a}"`);
  if (changes.length > 0) {
    // Only log first 20 for brevity
    if (applied <= 20) console.log(`  ${key}: ${changes.join(', ')}`);
  }
}

if (applied > 20) console.log(`  ... and ${applied - 20} more edits`);

console.log(`\nApplied: ${applied}`);
console.log(`Not found: ${notFound}`);
if (missing.length > 0) {
  console.log(`Missing keys: ${missing.join(', ')}`);
}

// Write back
const output = 'const BUILTIN_PROBLEMS = ' + JSON.stringify(problems) + ';';
fs.writeFileSync(path.join(root, 'embedded-problems.js'), output, 'utf8');
console.log(`\nWrote updated embedded-problems.js (${problems.length} problems)`);
