const fs = require('fs');
const content = fs.readFileSync('C:/uil-number-sense-trainer/uil-cleanup-tool.html', 'utf-8');
const lines = content.split('\n');
const line128 = lines[127];

// Extract the JSON array
const jsonStr = line128.replace('const PROBLEMS_DATA = ', '').replace(';// Initialize', '');
const problems = JSON.parse(jsonStr);

console.log('Total problems:', problems.length);
console.log('');

// Stats by year
const yearStats = {};
problems.forEach(p => {
    const key = p.year;
    if (!yearStats[key]) yearStats[key] = { total: 0, withAnswer: 0, starred: 0 };
    yearStats[key].total++;
    if (p.a && p.a.trim()) yearStats[key].withAnswer++;
    if (p.starred) yearStats[key].starred++;
});
console.log('By year:');
Object.keys(yearStats).sort().forEach(y => {
    const s = yearStats[y];
    console.log(`  ${y}: ${s.total} problems, ${s.withAnswer} with answers, ${s.starred} starred`);
});

// Find unique non-ASCII characters in questions
const charMap = {};
problems.forEach(p => {
    for (const ch of p.q) {
        const code = ch.charCodeAt(0);
        if (code > 127) {
            if (!charMap[ch]) charMap[ch] = { char: ch, code: code, hex: '0x' + code.toString(16), count: 0, samples: [] };
            charMap[ch].count++;
            if (charMap[ch].samples.length < 2) {
                charMap[ch].samples.push(`#${p.num} ${p.year} ${p.test}: ${p.q.substring(0, 60)}`);
            }
        }
    }
});

console.log('\nNon-ASCII characters found in questions:');
Object.values(charMap).sort((a, b) => b.count - a.count).forEach(c => {
    console.log(`  '${c.char}' (U+${c.hex}) - ${c.count} occurrences`);
    c.samples.forEach(s => console.log(`    Example: ${s}`));
});

// Count already cleaned (from corrected JSON)
const cleanedJson = JSON.parse(fs.readFileSync('C:/uil-number-sense-trainer/uil-cleaned-problems-2026-02-08-CORRECTED.json', 'utf-8'));
console.log(`\nAlready cleaned: ${cleanedJson.cleaned} problems`);
console.log(`Remaining: ${problems.length - cleanedJson.cleaned} problems`);

// Show symbol replacement map that would be needed
console.log('\nSuggested symbol replacements:');
console.log('  \\u201a (‚) -> × (multiplication)');
console.log('  \\u0192 (ƒ) -> ÷ (division)');
console.log('  \\uf080 -> + (addition)');
console.log('  \\u00c8 (È) -> √ (square root)');
console.log('  \\uf020 -> (space/operator)');

// Write all problems to a JSON for processing
fs.writeFileSync('C:/uil-number-sense-trainer/all-raw-problems.json', JSON.stringify(problems, null, 2));
console.log('\nWrote all problems to all-raw-problems.json');
