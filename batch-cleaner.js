const fs = require('fs');

// Load all raw problems
const raw = JSON.parse(fs.readFileSync('C:/uil-number-sense-trainer/all-raw-problems.json', 'utf-8'));

// Load already-cleaned problems to preserve them
const cleanedFile = JSON.parse(fs.readFileSync('C:/uil-number-sense-trainer/uil-cleaned-problems-2026-02-08-CORRECTED.json', 'utf-8'));
const alreadyCleaned = new Map();
cleanedFile.problems.forEach(p => {
    const key = `${p.num}-${p.year}-${p.test}`;
    alreadyCleaned.set(key, p);
});

// Symbol replacement map
function replaceSymbols(text) {
    return text
        .replace(/\uf080/g, '+')       //  → +
        .replace(/\u201a/g, '×')       // ‚ → ×
        .replace(/\u0192/g, '÷')       // ƒ → ÷
        .replace(/\u00c8/g, '√')       // È → √
        .replace(/\uf09e/g, '≤')       //  → ≤
        .replace(/\uf09d/g, '≥')       //  → ≥
        .replace(/\uf090/g, '∪')       //  → ∪
        .replace(/\uf08f/g, '∩')       //  → ∩
        .replace(/\u00b8/g, ',')       // ¸ → , (cedilla used as comma in some extractions)
        .replace(/\u02c6/g, '(')       // ˆ → (
        .replace(/\u2030/g, ')')       // ‰ → )
        .replace(/\u0160/g, '⌈')      // Š → ⌈ (ceiling)
        .replace(/\u2039/g, '⌉')      // ‹ → ⌉ (ceiling)
        .replace(/\u00ca/g, '√')      // Ê → √ (variant)
        .replace(/\u00c9/g, '³√')     // É → ³√ (cube root)
        .replace(/\u00c4/g, '→')      // Ä → → (arrow/limit)
        .replace(/\u00b4/g, '≡')      // ´ → ≡ (congruence)
        .replace(/\u00b9/g, '|')       // ¹ → | (absolute value)
        .replace(/\u2018/g, '∪')      // ' → ∪
        .replace(/\u2665/g, '♦')      // ♥ → ♦ (keep as symbol placeholder)
        .replace(/\u00a8/g, '⌊')      // ¨ → ⌊ (floor)
        .replace(/\u00a9/g, '⌋')      // © → ⌋ (floor)
        .replace(/\u0080/g, '')        //  → remove
        .replace(/\u2212/g, '-')       // − → - (proper minus)
        .replace(/\u0178/g, '≤')      // Ÿ → ≤ (less than or equal)
        .replace(/\uf020/g, ' ');      //  → space
}

// Clean up answer field
function cleanAnswer(ans) {
    if (!ans) return '';
    let cleaned = replaceSymbols(ans);
    // Common answer cleanup: 'q' at start/end often means negative
    cleaned = cleaned.replace(/^q\s*/, '-').replace(/\s*q$/, '');
    // Remove trailing garbled chars
    cleaned = cleaned.replace(/\s+$/, '');
    return cleaned;
}

// Clean up question text
function cleanQuestion(q) {
    let cleaned = replaceSymbols(q);

    // 'q' next to operators/numbers often means minus sign
    // But 'q' in words like "square", "equal", "equation" should stay
    // Pattern: 'q' between numbers or after = or at start of expression
    cleaned = cleaned.replace(/(\d)\s*q\s*(\d)/g, '$1 - $2');  // 5 q 3 → 5 - 3
    cleaned = cleaned.replace(/=\s*q\s*/g, '= -');              // = q → = -
    cleaned = cleaned.replace(/\sq$/g, '');                      // trailing q
    cleaned = cleaned.replace(/^q\s/g, '-');                     // leading q

    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

    return cleaned;
}

// Classify problem quality after auto-clean
function assessQuality(original, cleaned) {
    const issues = [];

    // Check for remaining non-standard characters
    const remaining = cleaned.q.match(/[^\x20-\x7E√×÷²³±≈≥≤≡πΣ∞°¼½¾⅓⅔⅛⅜⅝⅞⌈⌉⌊⌋∪∩♦¢→]/g);
    if (remaining) {
        const unique = [...new Set(remaining)];
        issues.push('unusual_chars: ' + unique.join(''));
    }

    // Check if answer exists
    if (!cleaned.a || cleaned.a.trim() === '') {
        issues.push('no_answer');
    }

    // Check if question seems too short
    if (cleaned.q.length < 10) {
        issues.push('too_short');
    }

    // Check if q still has lone 'q' that might be operator
    if (/\bq\b/.test(cleaned.q) && !/square|equation|equal|quotient|question|quart|quarter|seq|freq|unique/.test(cleaned.q.toLowerCase())) {
        issues.push('possible_garbled_q');
    }

    return issues;
}

// Topic categorization based on content
function categorizeTopic(q, existingTopic) {
    const ql = q.toLowerCase();

    if (ql.includes('remainder') || ql.includes('mod')) return 'mod';
    if (ql.includes('mean') || ql.includes('median') || ql.includes('average')) return 'mean';
    if (ql.includes('percent') || ql.includes('%')) return 'pct';
    if (ql.includes('fraction') || ql.includes('mixed number') || ql.includes('improper')) return 'fracdec';
    if (ql.includes('decimal')) return 'fracdec';
    if (ql.includes('roman numeral')) return 'roman';
    if (ql.includes('base ') && /base \d/.test(ql)) return 'base';
    if (ql.includes('gcd') || ql.includes('gcf') || ql.includes('lcm') || ql.includes('greatest common')) return 'gcdlcm';
    if (ql.includes('prime')) return 'prime';
    if (ql.includes('factorial') || ql.includes('!')) return 'factorial';
    if (ql.includes('permutation') || ql.includes('combination') || ql.includes('P(') || ql.includes('C(')) return 'combperm';
    if (ql.includes('triangle') || ql.includes('circle') || ql.includes('rectangle') || ql.includes('area') || ql.includes('perimeter') || ql.includes('volume') || ql.includes('polygon') || ql.includes('angle')) return 'geometry';
    if (ql.includes('sin') || ql.includes('cos') || ql.includes('tan')) return 'trig';
    if (ql.includes('log') || ql.includes('ln')) return 'log';
    if (ql.includes('limit') || ql.includes('lim')) return 'calculus';
    if (ql.includes('matrix') || ql.includes('det')) return 'matrix';
    if (ql.includes('sequence') || ql.includes('series') || ql.includes('term of')) return 'sequence';
    if (ql.includes('√') || ql.includes('root')) return 'roots';
    if (/divisor/.test(ql)) return 'divisors';
    if (ql.includes('larger') || ql.includes('smaller') || ql.includes('which is')) return 'compare';
    if (/\d+\s*[×]\s*\d+/.test(q) || /\d+\s*[÷]\s*\d+/.test(q)) return 'multdiv';
    if (/\d+\s*[+]\s*\d+/.test(q) || /\d+\s*[-]\s*\d+/.test(q)) return 'add';

    return existingTopic || 'general';
}

// Process all problems
const results = {
    autoCleaned: [],
    needsReview: [],
    alreadyClean: [],
    stats: { total: 0, autoCleaned: 0, needsReview: 0, preserved: 0 }
};

raw.forEach(p => {
    results.stats.total++;
    const key = `${p.num}-${p.year}-${p.test}`;

    // If already manually cleaned, preserve it
    if (alreadyCleaned.has(key)) {
        results.alreadyClean.push(alreadyCleaned.get(key));
        results.stats.preserved++;
        return;
    }

    // Auto-clean
    const cleaned = {
        num: p.num,
        q: cleanQuestion(p.q),
        a: cleanAnswer(p.a),
        t: p.t,
        year: p.year,
        test: p.test,
        starred: p.starred,
        source: p.source
    };

    // Categorize topic
    cleaned.t = categorizeTopic(cleaned.q, p.t);

    // Assess quality
    const issues = assessQuality(p, cleaned);

    if (issues.length === 0) {
        results.autoCleaned.push(cleaned);
        results.stats.autoCleaned++;
    } else {
        cleaned._issues = issues;
        cleaned._rawQ = p.q; // Keep original for reference
        cleaned._rawA = p.a;
        results.needsReview.push(cleaned);
        results.stats.needsReview++;
    }
});

// Output stats
console.log('=== Batch Cleaning Results ===');
console.log(`Total problems: ${results.stats.total}`);
console.log(`Already cleaned (preserved): ${results.stats.preserved}`);
console.log(`Auto-cleaned successfully: ${results.stats.autoCleaned}`);
console.log(`Needs manual review: ${results.stats.needsReview}`);
console.log('');

// Break down review issues
const issueCounts = {};
results.needsReview.forEach(p => {
    p._issues.forEach(issue => {
        const type = issue.split(':')[0].trim();
        if (!issueCounts[type]) issueCounts[type] = 0;
        issueCounts[type]++;
    });
});
console.log('Review issues breakdown:');
Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).forEach(([issue, count]) => {
    console.log(`  ${issue}: ${count}`);
});

// Combine auto-cleaned + preserved into export
const exportData = {
    exported: new Date().toISOString(),
    total: results.stats.total,
    cleaned: results.stats.preserved + results.stats.autoCleaned,
    autoCleanedCount: results.stats.autoCleaned,
    preservedCount: results.stats.preserved,
    problems: [...results.alreadyClean, ...results.autoCleaned]
};

fs.writeFileSync('C:/uil-number-sense-trainer/auto-cleaned-problems.json', JSON.stringify(exportData, null, 2));
console.log(`\nExported ${exportData.cleaned} clean problems to auto-cleaned-problems.json`);

// Also export the ones needing review
fs.writeFileSync('C:/uil-number-sense-trainer/needs-review-problems.json', JSON.stringify(results.needsReview, null, 2));
console.log(`Exported ${results.needsReview.length} problems needing review to needs-review-problems.json`);

// Show some samples of auto-cleaned problems
console.log('\n=== Sample Auto-Cleaned Problems ===');
const samples = results.autoCleaned.filter(p => p.year === '2025').slice(0, 10);
samples.forEach(p => {
    console.log(`  #${p.num} (${p.year} ${p.test}) [${p.t}]: ${p.q} → ${p.a}`);
});

// Show some needing review
console.log('\n=== Sample Problems Needing Review ===');
results.needsReview.slice(0, 10).forEach(p => {
    console.log(`  #${p.num} (${p.year} ${p.test}): ${p.q}`);
    console.log(`    Issues: ${p._issues.join(', ')}`);
    console.log(`    Raw: ${p._rawQ}`);
});
