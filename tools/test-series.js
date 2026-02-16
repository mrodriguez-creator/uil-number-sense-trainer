const fs = require('fs');
const path = require('path');

// Load app.js
const src = fs.readFileSync(path.resolve(__dirname, '..', 'app.js'), 'utf8');
const lines = src.split('\n');

// Extract series generator body (lines 503 to 627 based on grep)
// Find exact bounds
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'series: ()=>{') start = i;
  if (start >= 0 && i > start && lines[i].trim() === '},') { end = i; break; }
}
if (start < 0 || end < 0) { console.error('Could not find series generator bounds'); process.exit(1); }
console.log(`Found series generator at lines ${start+1}-${end+1}`);

// Extract function body (between { and })
const bodyLines = lines.slice(start + 1, end);
const body = bodyLines.join('\n');

// Helper functions
function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Build the function
const seriesFn = new Function('ri', 'pick', body);

// Generate and verify
const typeCounts = {};
let errors = 0;
let total = 300;

for (let i = 0; i < total; i++) {
  try {
    const result = seriesFn(ri, pick);

    // Classify type
    let typeKey = 'unknown';
    if (result.q.includes('1 + 2 + 3')) typeKey = 'T0:1+2+3+...+n';
    else if (result.q.includes('divisor')) typeKey = 'T5:divisors';
    else if (result.q.includes('triangular')) typeKey = 'T6:triangular';
    else if (result.q.includes('1²')) typeKey = 'T7:sum_squares';
    else if (result.q.includes('1³')) typeKey = 'T8:sum_cubes';
    else if (result.q.startsWith('(') && result.q.includes(')²')) typeKey = 'T9:series_squared';
    else if (result.q.includes('+ … =')) typeKey = 'T4:geo_infinite';
    else {
      const nums = result.q.match(/^(\d+) \+ (\d+)/);
      if (nums) {
        const a = parseInt(nums[1]), b = parseInt(nums[2]);
        const d = b - a;
        if (d === 2 && a % 2 === 1) typeKey = 'T2:odd_series';
        else if (d === 2 && a % 2 === 0) typeKey = 'T3:even_series';
        else typeKey = 'T1:arith_series';
      }
    }

    typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;

    // Verify answer is valid
    const a = result.a;
    if (a === undefined || a === null || (typeof a === 'number' && isNaN(a))) {
      console.error(`ERROR #${i}: NaN/null answer for: ${result.q} => ${result.a}`);
      errors++;
    } else if (typeof a === 'number' && !Number.isFinite(a)) {
      console.error(`ERROR #${i}: Infinite answer for: ${result.q} => ${result.a}`);
      errors++;
    }

    // Verify specific formulas
    // Type 0: 1+2+...+n
    if (result.q.match(/^1 \+ 2 \+ 3 \+ … \+ (\d+) =/)) {
      const n = parseInt(result.q.match(/… \+ (\d+)/)[1]);
      const expected = n * (n + 1) / 2;
      if (result.a !== expected) { console.error(`WRONG: ${result.q} => ${result.a}, expected ${expected}`); errors++; }
    }

    // Type 7: sum of squares
    if (result.q.match(/^1² \+ 2² \+ 3² \+ … \+ (\d+)² =/)) {
      const n = parseInt(result.q.match(/(\d+)² =/)[1]);
      const expected = n * (n + 1) * (2 * n + 1) / 6;
      if (result.a !== expected) { console.error(`WRONG: ${result.q} => ${result.a}, expected ${expected}`); errors++; }
    }

    // Type 8: sum of cubes
    if (result.q.match(/^1³ \+ 2³ \+ 3³ \+ … \+ (\d+)³ =/)) {
      const n = parseInt(result.q.match(/(\d+)³ =/)[1]);
      const tri = n * (n + 1) / 2;
      const expected = tri * tri;
      if (result.a !== expected) { console.error(`WRONG: ${result.q} => ${result.a}, expected ${expected}`); errors++; }
    }

    // Verify arithmetic series answers by brute force
    if (typeKey === 'T1:arith_series' || typeKey === 'T2:odd_series' || typeKey === 'T3:even_series') {
      // Parse first, second, and last terms
      const parts = result.q.replace(' =', '').split(' + ');
      const first = parseFloat(parts[0]);
      const second = parseFloat(parts[1]);
      const last = parseFloat(parts[parts.length - 1]);
      const d = second - first;
      if (d > 0) {
        let bruteSum = 0;
        for (let v = first; v <= last + 0.001; v += d) bruteSum += Math.round(v);
        if (Math.abs(result.a - bruteSum) > 0.01) {
          console.error(`WRONG: ${result.q} => ${result.a}, brute-force says ${bruteSum}`);
          errors++;
        }
      }
    }

    if (i < 30) {
      console.log(`  [${typeKey}] ${result.q} => ${result.a}`);
    }
  } catch(e) {
    console.error(`CRASH #${i}:`, e.message);
    errors++;
  }
}

console.log('\n=== TYPE DISTRIBUTION (of ' + total + ') ===');
Object.keys(typeCounts).sort().forEach(k => {
  console.log(`  ${k}: ${typeCounts[k]} (${(typeCounts[k]/total*100).toFixed(1)}%)`);
});
console.log(`\nTotal: ${total}, Errors: ${errors}`);
if (errors === 0) console.log('✓ ALL PASSED');
else console.log('✗ SOME FAILED');
