const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('C:/uil-number-sense-trainer/all-raw-problems.json', 'utf-8'));
const cleanedFile = JSON.parse(fs.readFileSync('C:/uil-number-sense-trainer/uil-cleaned-problems-2026-02-08-CORRECTED.json', 'utf-8'));

const alreadyCleaned = new Map();
cleanedFile.problems.forEach(p => {
    const key = `${p.num}-${p.year}-${p.test}`;
    alreadyCleaned.set(key, p);
});

function replaceSymbols(text) {
    return text
        .replace(/\uf080/g, '+').replace(/\u201a/g, '×').replace(/\u0192/g, '÷')
        .replace(/\u00c8/g, '√').replace(/\uf09e/g, '≤').replace(/\uf09d/g, '≥')
        .replace(/\uf090/g, '∪').replace(/\uf08f/g, '∩').replace(/\u00b8/g, ',')
        .replace(/\u02c6/g, '(').replace(/\u2030/g, ')').replace(/\u0160/g, '⌈')
        .replace(/\u2039/g, '⌉').replace(/\u00ca/g, '√').replace(/\u00c9/g, '³√')
        .replace(/\u00c4/g, '→').replace(/\u00b4/g, '≡').replace(/\u00b9/g, '|')
        .replace(/\u2018/g, '∪').replace(/\u2665/g, '♦').replace(/\u00a8/g, '⌊')
        .replace(/\u00a9/g, '⌋').replace(/\u0080/g, '').replace(/\u2212/g, '-')
        .replace(/\u0178/g, '≤').replace(/\uf020/g, ' ');
}

function cleanQuestion(q, answer) {
    let c = replaceSymbols(q);

    // Operator after = sign: "17 71 = ×" → "17 × 71 ="
    c = c.replace(/^(\d[\d,.]*)\s+(\d[\d,.]*)\s*=\s*([×÷+])\s*$/, '$1 $3 $2 =');
    c = c.replace(/^(\d[\d,.]*)\s*=\s*([×÷+])\s+(\d[\d,.]*)\s*$/, '$1 $2 $3 =');

    // Trailing exponent with answer validation
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

    // "(NUM) = 3" → "NUM³ ="
    const cubeMatch = c.match(/^\((\d+)\)\s*=\s*3\s*$/);
    if (cubeMatch) {
        const base = parseInt(cubeMatch[1]);
        const ans = answer ? parseFloat(answer.replace(/,/g, '')) : null;
        if (ans && Math.abs(ans - base * base * base) < 1) {
            c = cubeMatch[1] + '³ =';
        }
    }

    // "(NUM) = 2" → "NUM² ="
    const sqMatch = c.match(/^\((\d+)\)\s*=\s*2\s*$/);
    if (sqMatch) {
        const base = parseInt(sqMatch[1]);
        const ans = answer ? parseFloat(answer.replace(/,/g, '')) : null;
        if (ans && Math.abs(ans - base * base) < 1) {
            c = sqMatch[1] + '² =';
        }
    }

    // Root patterns
    c = c.replace(/^(\d[\d,.]*)\s*=\s*√3\s*$/, '³√$1 =');
    c = c.replace(/^(\d[\d,.]*)\s*=\s*√\s*$/, '√$1 =');

    // q → - in math contexts
    c = c.replace(/(\d)\s*q\s*(\d)/g, '$1 - $2');
    c = c.replace(/=\s*q\s*/g, '= -');
    c = c.replace(/([×÷+])\s*q\s*([×÷+])/g, '$1 - $2');
    c = c.replace(/([×÷+])\s*q/g, '$1 -');
    c = c.replace(/q\s*([×÷+])/g, '- $1');
    c = c.replace(/\s+q\s*$/, '');
    c = c.replace(/^q\s+/, '-');
    c = c.replace(/^q(\d)/, '-$1');

    // Clean whitespace
    c = c.replace(/\s{2,}/g, ' ').trim();

    return c;
}

function cleanAnswer(ans) {
    if (!ans) return '';
    let c = replaceSymbols(ans);
    c = c.replace(/^q\s*/, '-').replace(/\s*q$/, '').replace(/\s*q\s*/g, '-');
    return c.trim();
}

function categorizeTopic(q, existingTopic, starred) {
    if (starred) return 'starred';
    const ql = q.toLowerCase();
    if (ql.includes('remainder') || /\bmod\b/.test(ql)) return 'mod';
    if (ql.includes('mean') || ql.includes('median') || ql.includes('average')) return 'mean';
    if (ql.includes('percent') || ql.includes('%')) return 'pct';
    if (ql.includes('fraction') || ql.includes('mixed number') || ql.includes('improper')) return 'fracdec';
    if (/decimal/.test(ql)) return 'fracdec';
    if (ql.includes('roman numeral') || /^[MDCLXVI]+\s/.test(q)) return 'roman';
    if (/base \d/.test(ql)) return 'base';
    if (ql.includes('gcd') || ql.includes('gcf') || ql.includes('lcm') || ql.includes('greatest common') || ql.includes('least common')) return 'gcdlcm';
    if (/factorial|\d!/.test(q)) return 'factorial';
    if (ql.includes('permutation') || ql.includes('combination')) return 'combperm';
    if (ql.includes('triangle') || ql.includes('circle') || ql.includes('rectangle') || ql.includes('area') || ql.includes('perimeter') || ql.includes('volume') || ql.includes('polygon') || ql.includes('angle') || ql.includes('°') || ql.includes('diagonal')) return 'geometry';
    if (ql.includes('sin') || ql.includes('cos') || ql.includes('tan') || ql.includes('cot') || ql.includes('sec') || ql.includes('csc')) return 'trig';
    if (/\blog\b|\bln\b/.test(ql)) return 'log';
    if (ql.includes('limit') || ql.includes('lim')) return 'calculus';
    if (ql.includes('matrix') || ql.includes('det')) return 'matrix';
    if (ql.includes('sequence') || ql.includes('series') || /\bterm\b/.test(ql)) return 'sequence';
    if (ql.includes('√') || ql.includes('root')) return 'roots';
    if (/divisor/.test(ql)) return 'divisors';
    if (ql.includes('larger') || ql.includes('smaller') || ql.includes('which is')) return 'compare';
    if (/²|³|squared|cubed/.test(q)) return 'powers';
    if (/prime/.test(ql)) return 'prime';
    if (/[×]/.test(q)) return 'mult';
    if (/[÷]/.test(q)) return 'div';
    if (/\d\s*[+]\s*\d/.test(q) || /\d\s*[-]\s*\d/.test(q)) return 'add';
    return existingTopic || 'general';
}

function assessQuality(original, cleaned) {
    const issues = [];
    const remaining = cleaned.q.match(/[^\x20-\x7E√×÷²³±≈≥≤≡πΣ∞°¼½¾⅓⅔⅛⅜⅝⅞⌈⌉⌊⌋∪∩♦¢→−]/g);
    if (remaining) {
        issues.push('unusual_chars: ' + [...new Set(remaining)].join(''));
    }
    if (!cleaned.a || cleaned.a.trim() === '') issues.push('no_answer');

    // Only flag as too_short if < 5 chars AND no answer (truly broken)
    if (cleaned.q.length < 5) issues.push('too_short');

    // Very strict q check - only flag obvious garbled cases
    const qMatches = cleaned.q.match(/\bq\b/g);
    if (qMatches) {
        const ql = cleaned.q.toLowerCase();
        const isVariable = /(square|equation|equal|quotient|question|quart|quarter|seq|freq|unique|quad|quint|quartic)/.test(ql) ||
            /[,]\s*q\s*[,]/.test(cleaned.q) ||
            /\bq\s*[=<>]/.test(cleaned.q) ||
            /[=<>]\s*q\b/.test(cleaned.q) ||
            /(find|then)\s+q/.test(ql) ||
            /f\(q\)/.test(cleaned.q) ||
            /\bp,\s*q/.test(cleaned.q) ||
            /\bq,\s*r/.test(cleaned.q);
        if (!isVariable) {
            issues.push('possible_garbled_q');
        }
    }
    return issues;
}

// Process all
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

console.log('=== Batch Cleaning V3 Results ===');
console.log(`Total: ${results.stats.total}`);
console.log(`Preserved (manually cleaned): ${results.stats.preserved}`);
console.log(`Auto-cleaned: ${results.stats.autoCleaned}`);
console.log(`Needs review: ${results.stats.needsReview}`);
console.log(`TOTAL CLEAN: ${results.stats.preserved + results.stats.autoCleaned} (${((results.stats.preserved + results.stats.autoCleaned) / results.stats.total * 100).toFixed(1)}%)`);

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

// Year breakdown
const yearBreak = {};
[...results.autoCleaned, ...results.alreadyClean].forEach(p => {
    if (!yearBreak[p.year]) yearBreak[p.year] = 0;
    yearBreak[p.year]++;
});
const yearTotal = {};
raw.forEach(p => {
    if (!yearTotal[p.year]) yearTotal[p.year] = 0;
    yearTotal[p.year]++;
});
console.log('\nClean by year:');
Object.keys(yearTotal).sort().forEach(y => {
    const clean = yearBreak[y] || 0;
    const total = yearTotal[y];
    console.log(`  ${y}: ${clean}/${total} (${(clean / total * 100).toFixed(0)}%)`);
});

// Export
const exportData = {
    exported: new Date().toISOString(),
    total: results.stats.total,
    cleaned: results.stats.preserved + results.stats.autoCleaned,
    problems: [...results.alreadyClean, ...results.autoCleaned]
};
fs.writeFileSync('C:/uil-number-sense-trainer/auto-cleaned-v3.json', JSON.stringify(exportData, null, 2));
console.log(`\nExported ${exportData.cleaned} clean problems to auto-cleaned-v3.json`);

fs.writeFileSync('C:/uil-number-sense-trainer/needs-review-v3.json', JSON.stringify(results.needsReview, null, 2));
console.log(`Exported ${results.needsReview.length} for review to needs-review-v3.json`);

// Show some review samples
console.log('\n=== Still Needs Review (samples) ===');
results.needsReview.slice(0, 10).forEach(p => {
    console.log(`  #${p.num} (${p.year} ${p.test}): "${p.q}" | A="${p.a}" [${p._issues}]`);
});
