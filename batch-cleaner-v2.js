const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('C:/uil-number-sense-trainer/all-raw-problems.json', 'utf-8'));
const cleanedFile = JSON.parse(fs.readFileSync('C:/uil-number-sense-trainer/uil-cleaned-problems-2026-02-08-CORRECTED.json', 'utf-8'));

const alreadyCleaned = new Map();
cleanedFile.problems.forEach(p => {
    const key = `${p.num}-${p.year}-${p.test}`;
    alreadyCleaned.set(key, p);
});

// Symbol replacement
function replaceSymbols(text) {
    return text
        .replace(/\uf080/g, '+')
        .replace(/\u201a/g, '×')
        .replace(/\u0192/g, '÷')
        .replace(/\u00c8/g, '√')
        .replace(/\uf09e/g, '≤')
        .replace(/\uf09d/g, '≥')
        .replace(/\uf090/g, '∪')
        .replace(/\uf08f/g, '∩')
        .replace(/\u00b8/g, ',')
        .replace(/\u02c6/g, '(')
        .replace(/\u2030/g, ')')
        .replace(/\u0160/g, '⌈')
        .replace(/\u2039/g, '⌉')
        .replace(/\u00ca/g, '√')
        .replace(/\u00c9/g, '³√')
        .replace(/\u00c4/g, '→')
        .replace(/\u00b4/g, '≡')
        .replace(/\u00b9/g, '|')
        .replace(/\u2018/g, '∪')
        .replace(/\u2665/g, '♦')
        .replace(/\u00a8/g, '⌊')
        .replace(/\u00a9/g, '⌋')
        .replace(/\u0080/g, '')
        .replace(/\u2212/g, '-')
        .replace(/\u0178/g, '≤')
        .replace(/\uf020/g, ' ');
}

// Advanced question cleaning
function cleanQuestion(q, answer) {
    let c = replaceSymbols(q);

    // PATTERN 1: Operator after = sign: "17 71 = ×" → "17 × 71 ="
    // Matches: "NUM NUM = OP" where OP is ×, ÷, +
    c = c.replace(/^(\d[\d,.]*)\s+(\d[\d,.]*)\s*=\s*([×÷+])\s*$/, '$1 $3 $2 =');

    // PATTERN 2: "NUM = OP NUM" → "NUM OP NUM =" (operator displacement)
    c = c.replace(/^(\d[\d,.]*)\s*=\s*([×÷+])\s+(\d[\d,.]*)\s*$/, '$1 $2 $3 =');

    // PATTERN 3: Trailing exponent: "58 = 2" (with answer 3364) → "58² ="
    // Only apply if the trailing number is 2 or 3 and makes sense as exponent
    const expMatch = c.match(/^(\d[\d,.]*)\s*=\s*(\d)\s*$/);
    if (expMatch) {
        const base = parseFloat(expMatch[1].replace(/,/g, ''));
        const exp = parseInt(expMatch[2]);
        const ans = answer ? parseFloat(answer.replace(/,/g, '')) : null;
        if (exp === 2 && ans && Math.abs(ans - base * base) < 1) {
            c = expMatch[1] + '² =';
        } else if (exp === 3 && ans && Math.abs(ans - base * base * base) < 1) {
            c = expMatch[1] + '³ =';
        }
    }

    // PATTERN 4: "(NUM) = 3" → "(NUM)³ =" (cubing pattern)
    const cubeMatch = c.match(/^\((\d+)\)\s*=\s*3\s*$/);
    if (cubeMatch) {
        const base = parseInt(cubeMatch[1]);
        const ans = answer ? parseFloat(answer.replace(/,/g, '')) : null;
        if (ans && Math.abs(ans - base * base * base) < 1) {
            c = cubeMatch[1] + '³ =';
        }
    }

    // PATTERN 5: "NUM = √3" → "³√NUM ="
    c = c.replace(/^(\d[\d,.]*)\s*=\s*√3\s*$/, '³√$1 =');
    c = c.replace(/^(\d[\d,.]*)\s*=\s*√\s*$/, '√$1 =');

    // PATTERN 6: "NUM NUM = × NUM" → "NUM × NUM = NUM" (3-operand with displaced op)
    c = c.replace(/^(\d[\d,.]*)\s+(\d[\d,.]*)\s*=\s*([×÷+])\s*(\d[\d,.]*)\s*$/, '$1 $3 $2 = $4');

    // PATTERN 7: q → - (minus) in mathematical contexts
    // Between numbers: "5 q 3" → "5 - 3"
    c = c.replace(/(\d)\s*q\s*(\d)/g, '$1 - $2');
    // After operator context: "= q" → "= -"
    c = c.replace(/=\s*q\s*/g, '= -');
    // In operator chains: "×q×" → "× - ×" wait, that doesn't make sense
    // Actually "×q" means the operations are: multiply, then subtract
    c = c.replace(/([×÷+])\s*q\s*([×÷+])/g, '$1 - $2');
    c = c.replace(/([×÷+])\s*q/g, '$1 -');
    c = c.replace(/q\s*([×÷+])/g, '- $1');
    // Trailing q (often means the answer is negative or q is operator)
    c = c.replace(/\s+q\s*$/, '');
    // Leading q
    c = c.replace(/^q\s+/, '-');
    // "q " before a number at start
    c = c.replace(/^q(\d)/, '-$1');

    // PATTERN 8: Operator chains after = that represent the expression
    // "NUM NUM NUM NUM = +×÷" type patterns - operators got jumbled to end
    // This is harder to fix automatically, so we'll leave complex ones for review

    // PATTERN 9: "NUM × NUM" where × ended up as just space
    // "666 × 3" with answer 54 - wait that's wrong, 666/3=222... maybe problem is different

    // Clean up whitespace
    c = c.replace(/\s{2,}/g, ' ').trim();

    // Remove trailing lone operators
    c = c.replace(/\s+[×÷+]\s*$/, ' =');

    return c;
}

function cleanAnswer(ans) {
    if (!ans) return '';
    let c = replaceSymbols(ans);
    c = c.replace(/^q\s*/, '-').replace(/\s*q$/, '').replace(/\s*q\s*/g, '-');
    c = c.replace(/\s+$/, '').replace(/^\s+/, '');
    return c;
}

function categorizeTopic(q, existingTopic, starred) {
    if (starred) return 'starred';
    const ql = q.toLowerCase();
    if (ql.includes('remainder') || ql.includes('mod')) return 'mod';
    if (ql.includes('mean') || ql.includes('median') || ql.includes('average')) return 'mean';
    if (ql.includes('percent') || ql.includes('%')) return 'pct';
    if (ql.includes('fraction') || ql.includes('mixed number') || ql.includes('improper')) return 'fracdec';
    if (/decimal/.test(ql)) return 'fracdec';
    if (ql.includes('roman numeral')) return 'roman';
    if (/base \d/.test(ql)) return 'base';
    if (ql.includes('gcd') || ql.includes('gcf') || ql.includes('lcm') || ql.includes('greatest common')) return 'gcdlcm';
    if (/prime/.test(ql) && !ql.includes('prime divisor')) return 'prime';
    if (ql.includes('factorial') || /\d!/.test(q)) return 'factorial';
    if (ql.includes('permutation') || ql.includes('combination')) return 'combperm';
    if (ql.includes('triangle') || ql.includes('circle') || ql.includes('rectangle') || ql.includes('area') || ql.includes('perimeter') || ql.includes('volume') || ql.includes('polygon') || ql.includes('angle') || ql.includes('°')) return 'geometry';
    if (ql.includes('sin') || ql.includes('cos') || ql.includes('tan')) return 'trig';
    if (ql.includes('log') || ql.includes('ln')) return 'log';
    if (ql.includes('limit') || ql.includes('lim')) return 'calculus';
    if (ql.includes('matrix') || ql.includes('det')) return 'matrix';
    if (ql.includes('sequence') || ql.includes('series') || ql.includes('term of')) return 'sequence';
    if (ql.includes('√') || ql.includes('root')) return 'roots';
    if (/divisor/.test(ql)) return 'divisors';
    if (ql.includes('larger') || ql.includes('smaller') || ql.includes('which is')) return 'compare';
    if (/[×]/.test(q) && /[÷]/.test(q)) return 'multdiv';
    if (/\d\s*[×]\s*\d/.test(q)) return 'mult';
    if (/\d\s*[÷]\s*\d/.test(q)) return 'div';
    if (/\d\s*[+]\s*\d/.test(q) || /\d\s*[-]\s*\d/.test(q)) return 'add';
    if (/²|³|squared|cubed/.test(q)) return 'powers';
    return existingTopic || 'general';
}

function assessQuality(original, cleaned) {
    const issues = [];
    const remaining = cleaned.q.match(/[^\x20-\x7E√×÷²³±≈≥≤≡πΣ∞°¼½¾⅓⅔⅛⅜⅝⅞⌈⌉⌊⌋∪∩♦¢→−]/g);
    if (remaining) {
        const unique = [...new Set(remaining)];
        issues.push('unusual_chars: ' + unique.join(''));
    }
    if (!cleaned.a || cleaned.a.trim() === '') issues.push('no_answer');
    if (cleaned.q.length < 10) issues.push('too_short');
    // More lenient q check - only flag if q appears as standalone letter in math context
    if (/\bq\b/.test(cleaned.q)) {
        const ql = cleaned.q.toLowerCase();
        // Allow q in common math contexts
        if (!/(square|equation|equal|quotient|question|quart|quarter|seq|freq|unique|quad|quint|quartic)/.test(ql) &&
            !/[,]\s*q\s*[,]/.test(cleaned.q) && // q as variable in sequences like p, q, r
            !/\bq\s*[=<>]/.test(cleaned.q) &&    // q as variable: q = ...
            !/[=<>]\s*q\b/.test(cleaned.q) &&    // ... = q
            !/(find|then)\s+q/.test(ql) &&        // find q, then q
            !/f\(q\)/.test(cleaned.q)) {          // f(q)
            issues.push('possible_garbled_q');
        }
    }
    return issues;
}

// Process
const results = { autoCleaned: [], needsReview: [], alreadyClean: [], stats: { total: 0, autoCleaned: 0, needsReview: 0, preserved: 0 } };

raw.forEach(p => {
    results.stats.total++;
    const key = `${p.num}-${p.year}-${p.test}`;
    if (alreadyCleaned.has(key)) {
        results.alreadyClean.push(alreadyCleaned.get(key));
        results.stats.preserved++;
        return;
    }

    const cleaned = {
        num: p.num,
        q: cleanQuestion(p.q, p.a),
        a: cleanAnswer(p.a),
        t: p.t,
        year: p.year,
        test: p.test,
        starred: p.starred,
        source: p.source
    };
    cleaned.t = categorizeTopic(cleaned.q, p.t, p.starred);

    const issues = assessQuality(p, cleaned);
    if (issues.length === 0) {
        results.autoCleaned.push(cleaned);
        results.stats.autoCleaned++;
    } else {
        cleaned._issues = issues;
        cleaned._rawQ = p.q;
        cleaned._rawA = p.a;
        results.needsReview.push(cleaned);
        results.stats.needsReview++;
    }
});

console.log('=== Batch Cleaning V2 Results ===');
console.log(`Total: ${results.stats.total}`);
console.log(`Preserved (manually cleaned): ${results.stats.preserved}`);
console.log(`Auto-cleaned: ${results.stats.autoCleaned}`);
console.log(`Needs review: ${results.stats.needsReview}`);
console.log(`TOTAL CLEAN: ${results.stats.preserved + results.stats.autoCleaned} (${((results.stats.preserved + results.stats.autoCleaned) / results.stats.total * 100).toFixed(1)}%)`);

// Issue breakdown
const issueCounts = {};
results.needsReview.forEach(p => {
    p._issues.forEach(issue => {
        const type = issue.split(':')[0].trim();
        if (!issueCounts[type]) issueCounts[type] = 0;
        issueCounts[type]++;
    });
});
console.log('\nRemaining issues:');
Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).forEach(([issue, count]) => {
    console.log(`  ${issue}: ${count}`);
});

// Export
const exportData = {
    exported: new Date().toISOString(),
    total: results.stats.total,
    cleaned: results.stats.preserved + results.stats.autoCleaned,
    autoCleanedCount: results.stats.autoCleaned,
    preservedCount: results.stats.preserved,
    problems: [...results.alreadyClean, ...results.autoCleaned]
};
fs.writeFileSync('C:/uil-number-sense-trainer/auto-cleaned-v2.json', JSON.stringify(exportData, null, 2));
console.log(`\nExported ${exportData.cleaned} problems to auto-cleaned-v2.json`);

fs.writeFileSync('C:/uil-number-sense-trainer/needs-review-v2.json', JSON.stringify(results.needsReview, null, 2));
console.log(`Exported ${results.needsReview.length} for review to needs-review-v2.json`);

// Samples of newly fixed problems
console.log('\n=== Newly Fixed (was broken, now clean) ===');
const fixed = results.autoCleaned.filter(p => p.year === '2022' || p.year === '2021').slice(0, 15);
fixed.forEach(p => {
    console.log(`  #${p.num} (${p.year} ${p.test}): ${p.q} → ${p.a}`);
});

// Remaining review samples
console.log('\n=== Still Needs Review (samples) ===');
results.needsReview.slice(0, 15).forEach(p => {
    console.log(`  #${p.num} (${p.year} ${p.test}): "${p.q}" [${p._issues}]`);
});
