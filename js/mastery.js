// ═══════════════════════════════════════════════════════════════════════════
// MASTERY TRACKING SYSTEM
// Tracks per-skill learning progress: not_started → learning → practicing → mastered
// ═══════════════════════════════════════════════════════════════════════════

const SKILL_DEFS = [
  { id: 'add',      name: 'Addition',              icon: '➕', position: '1, 3',  gens: ['add'],            group: 'core' },
  { id: 'sub',      name: 'Subtraction',           icon: '➖', position: '2, 3',  gens: ['sub'],            group: 'core' },
  { id: 'mul',      name: 'Multiplication',        icon: '✖️', position: '4, 5',  gens: ['mul'],            group: 'core' },
  { id: 'ops',      name: 'Order of Operations',   icon: '🧮', position: '5, 6',  gens: ['ops'],            group: 'core' },
  { id: 'mul11',    name: 'Multiply by 11',        icon: '⛓',  position: '7-8',   gens: ['mul11'],          group: 'trick' },
  { id: 'mul25',    name: 'Multiply by 25/75',     icon: '¼',  position: '7-8',   gens: ['mul25'],          group: 'trick' },
  { id: 'near100',  name: 'Near-100 Multiply',     icon: '💯', position: '7-8',   gens: ['near100'],        group: 'trick' },
  { id: 'sq5',      name: 'Squares Ending in 5',   icon: '⁵²', position: '7-8',   gens: ['sq5','equidist'], group: 'trick' },
  { id: 'sq',       name: 'Squares',               icon: '²',  position: '9',     gens: ['sq'],             group: 'core' },
  { id: 'starred1', name: '4-Term Arithmetic',     icon: '⭐', position: '10*',   gens: ['_starred1'],      group: 'starred' },
  { id: 'div',      name: 'Division',              icon: '➗', position: '11',    gens: ['div'],            group: 'core' },
  { id: 'fracdec',  name: 'Fractions & Decimals',  icon: '⅛',  position: '12, 16',gens: ['fracdec','pct'],  group: 'core' },
  { id: 'conv',     name: 'Conversions',           icon: '🔄', position: '13-14', gens: ['conv'],           group: 'core' },
  { id: 'roman',    name: 'Roman Numerals',        icon: 'Ⅹ',  position: '13-14', gens: ['roman'],          group: 'core' },
  { id: 'lcm',      name: 'LCM & GCD',            icon: '🔢', position: '15',    gens: ['lcm','gcd'],      group: 'core' },
  { id: 'mean',     name: 'Mean / Average',        icon: '📊', position: '17',    gens: ['mean'],           group: 'core' },
  { id: 'series',   name: 'Series & Sequences',    icon: '∑',  position: '18',    gens: ['series'],         group: 'core' },
  { id: 'rem',      name: 'Remainders',            icon: '🔁', position: '19',    gens: ['rem'],            group: 'core' },
];

// ── Mastery localStorage persistence ──

function loadMastery() {
  try {
    let raw = localStorage.getItem('uilMastery');
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    console.error('Failed to load mastery:', e);
    return {};
  }
}

function saveMastery(mastery) {
  try {
    localStorage.setItem('uilMastery', JSON.stringify(mastery));
  } catch(e) {
    console.error('Failed to save mastery:', e);
  }
}

function getSkillMastery(skillId) {
  let m = loadMastery();
  return m[skillId] || {
    status: 'not_started',       // not_started | learning | level_1 | level_2 | level_3 | mastered
    tutorialDone: false,
    levels: {},
    masteryCheck: null,
    lastPracticed: null,
    totalProblems: 0,
    totalCorrect: 0
  };
}

function updateSkillMastery(skillId, patch) {
  let m = loadMastery();
  let current = m[skillId] || {
    status: 'not_started',
    tutorialDone: false,
    levels: {},
    masteryCheck: null,
    lastPracticed: null,
    totalProblems: 0,
    totalCorrect: 0
  };
  m[skillId] = Object.assign(current, patch);
  m[skillId].lastPracticed = new Date().toISOString();
  saveMastery(m);
  return m[skillId];
}

function recordLevelAttempt(skillId, level, correct, total, avgTime) {
  let m = loadMastery();
  let skill = m[skillId] || { status: 'not_started', tutorialDone: false, levels: {}, masteryCheck: null, lastPracticed: null, totalProblems: 0, totalCorrect: 0 };

  if (!skill.levels[level]) {
    skill.levels[level] = { attempted: 0, correct: 0, bestStreak: 0, avgTime: 0, passed: false };
  }

  let lv = skill.levels[level];
  lv.attempted += total;
  lv.correct += correct;
  if (avgTime > 0) lv.avgTime = avgTime;

  // Pass a level: 5+ correct with 80%+ accuracy
  if (correct >= 5 && (correct / total) >= 0.8) {
    lv.passed = true;
  }

  skill.totalProblems += total;
  skill.totalCorrect += correct;

  // Update status based on highest level passed
  if (lv.passed) {
    if (level === 3) skill.status = 'level_3';
    else if (level === 2 && skill.status !== 'level_3') skill.status = 'level_2';
    else if (level === 1 && skill.status !== 'level_2' && skill.status !== 'level_3') skill.status = 'level_1';
  }

  skill.lastPracticed = new Date().toISOString();
  m[skillId] = skill;
  saveMastery(m);
  return skill;
}

function recordMasteryCheck(skillId, correct, total, avgTime) {
  let m = loadMastery();
  let skill = m[skillId] || { status: 'not_started', tutorialDone: false, levels: {}, masteryCheck: null, lastPracticed: null, totalProblems: 0, totalCorrect: 0 };

  let passed = correct >= 8 && (correct / total) >= 0.8;
  skill.masteryCheck = {
    attempts: (skill.masteryCheck ? skill.masteryCheck.attempts : 0) + 1,
    bestScore: Math.max(correct, skill.masteryCheck ? skill.masteryCheck.bestScore : 0),
    bestTime: avgTime,
    passed: passed,
    passedDate: passed ? new Date().toISOString() : null
  };

  if (passed) skill.status = 'mastered';

  skill.totalProblems += total;
  skill.totalCorrect += correct;
  skill.lastPracticed = new Date().toISOString();
  m[skillId] = skill;
  saveMastery(m);
  return skill;
}

function getReadinessPercent() {
  let m = loadMastery();
  let mastered = SKILL_DEFS.filter(s => m[s.id] && m[s.id].status === 'mastered').length;
  return Math.round((mastered / SKILL_DEFS.length) * 100);
}

function getRecommendedSkill() {
  let m = loadMastery();
  let now = Date.now();
  let DAY = 86400000;

  // Priority 1: Skills currently being practiced (in-progress)
  let inProgress = SKILL_DEFS.filter(s => {
    let ms = m[s.id];
    return ms && ['learning','level_1','level_2','level_3'].includes(ms.status);
  });
  if (inProgress.length > 0) {
    // Pick the one practiced least recently
    inProgress.sort((a, b) => {
      let ta = m[a.id].lastPracticed ? new Date(m[a.id].lastPracticed).getTime() : 0;
      let tb = m[b.id].lastPracticed ? new Date(m[b.id].lastPracticed).getTime() : 0;
      return ta - tb;
    });
    return inProgress[0];
  }

  // Priority 2: Mastered skills needing review (7+ days)
  let needsReview = SKILL_DEFS.filter(s => {
    let ms = m[s.id];
    if (!ms || ms.status !== 'mastered') return false;
    let last = ms.lastPracticed ? new Date(ms.lastPracticed).getTime() : 0;
    return (now - last) > 7 * DAY;
  });
  if (needsReview.length > 0) return needsReview[0];

  // Priority 3: Not started skills (in order)
  let notStarted = SKILL_DEFS.filter(s => !m[s.id] || m[s.id].status === 'not_started');
  if (notStarted.length > 0) return notStarted[0];

  return null;
}

// ── Leveled Problem Generators ──
// Wrap existing GEN functions with difficulty scaling

function generateLeveled(skillId, level) {
  let def = SKILL_DEFS.find(s => s.id === skillId);
  if (!def) return null;

  // Special handling for starred problems
  if (skillId === 'starred1') {
    return typeof APPROX !== 'undefined' ? APPROX.tier1() : null;
  }

  // Leveled generators override the defaults for key skills
  if (LEVELED_GEN[skillId]) {
    return LEVELED_GEN[skillId](level);
  }

  // Fallback: use existing GEN
  let genKey = def.gens[ri(0, def.gens.length - 1)];
  if (typeof GEN !== 'undefined' && GEN[genKey]) {
    return GEN[genKey]();
  }
  return null;
}

const LEVELED_GEN = {
  add: (level) => {
    if (level === 1) { let a = ri(10, 999), b = ri(10, 999); return { q: `${a} + ${b} =`, a: a+b, t: 'add' }; }
    if (level === 2) { let a = ri(100, 9999), b = ri(100, 9999); return { q: `${a} + ${b} =`, a: a+b, t: 'add' }; }
    let a = ri(1000, 50000), b = ri(100, 9999); return { q: `${a} + ${b} =`, a: a+b, t: 'add' };
  },
  sub: (level) => {
    if (level === 1) { let a = ri(50, 999), b = ri(10, Math.min(a-1, 500)); return { q: `${a} − ${b} =`, a: a-b, t: 'sub' }; }
    if (level === 2) { let a = ri(500, 9999), b = ri(100, Math.min(a-1, 5000)); return { q: `${a} − ${b} =`, a: a-b, t: 'sub' }; }
    let a = ri(1000, 50000), b = ri(100, Math.min(a-1, 9999)); return { q: `${a} − ${b} =`, a: a-b, t: 'sub' };
  },
  mul: (level) => {
    if (level === 1) { let a = ri(2, 12), b = ri(2, 12); return { q: `${a} × ${b} =`, a: a*b, t: 'mul' }; }
    if (level === 2) { let a = ri(10, 99), b = ri(2, 9); return { q: `${a} × ${b} =`, a: a*b, t: 'mul' }; }
    let a = ri(10, 99), b = ri(10, 99); return { q: `${a} × ${b} =`, a: a*b, t: 'mul' };
  },
  mul11: (level) => {
    if (level === 1) { let a = ri(10, 49); return { q: `${a} × 11 =`, a: a*11, t: 'mul11' }; }
    if (level === 2) { let a = ri(50, 99); return { q: `${a} × 11 =`, a: a*11, t: 'mul11' }; }
    let a = ri(100, 999); return { q: `${a} × 11 =`, a: a*11, t: 'mul11' };
  },
  mul25: (level) => {
    if (level === 1) { let a = pick([4,8,12,16,20,24,28,32,36,40,44,48]); return { q: `${a} × 25 =`, a: a*25, t: 'mul25' }; }
    if (level === 2) { let a = ri(10, 99); return { q: `${a} × 25 =`, a: a*25, t: 'mul25' }; }
    let a = ri(10, 200); let m = pick([25,75]); return { q: `${a} × ${m} =`, a: a*m, t: 'mul25' };
  },
  near100: (level) => {
    if (level === 1) { let a = ri(91, 99), b = ri(91, 99); return { q: `${a} × ${b} =`, a: a*b, t: 'near100' }; }
    if (level === 2) { let a = ri(101, 109), b = ri(101, 109); return { q: `${a} × ${b} =`, a: a*b, t: 'near100' }; }
    let a = ri(90, 110), b = ri(90, 110); return { q: `${a} × ${b} =`, a: a*b, t: 'near100' };
  },
  sq5: (level) => {
    if (level === 1) { let a = pick([15, 25, 35, 45]); return { q: `${a}² =`, a: a*a, t: 'sq5' }; }
    if (level === 2) { let a = pick([55, 65, 75, 85, 95]); return { q: `${a}² =`, a: a*a, t: 'sq5' }; }
    let a = pick([15,25,35,45,55,65,75,85,95,105,115,125]); return { q: `${a}² =`, a: a*a, t: 'sq5' };
  },
  sq: (level) => {
    if (level === 1) { let a = ri(10, 25); return { q: `${a}² =`, a: a*a, t: 'sq' }; }
    if (level === 2) { let a = ri(20, 50); return { q: `${a}² =`, a: a*a, t: 'sq' }; }
    let a = ri(30, 80); return { q: `${a}² =`, a: a*a, t: 'sq' };
  },
  div: (level) => {
    if (level === 1) { let d = pick([2,3,4,5,6]); let q = ri(10, 100); return { q: `${d*q} ÷ ${d} =`, a: q, t: 'div' }; }
    if (level === 2) { let d = pick([7,8,9,11,12]); let q = ri(10, 200); return { q: `${d*q} ÷ ${d} =`, a: q, t: 'div' }; }
    let d = pick([13,15,17,19,23,25]); let q = ri(10, 800); return { q: `${d*q} ÷ ${d} =`, a: q, t: 'div' };
  },
  fracdec: (level) => {
    if (level === 1) {
      // Simple well-known fractions
      let pairs = [[1,2,'0.5'],[1,4,'0.25'],[3,4,'0.75'],[1,5,'0.2'],[2,5,'0.4'],[3,5,'0.6']];
      let [n,d,dec] = pick(pairs);
      if (ri(0,1) === 0) return { q: `${n}/${d} as a decimal =`, a: dec, t: 'fracdec' };
      return { q: `${dec} as a fraction =`, a: `${n}/${d}`, t: 'fracdec' };
    }
    if (level === 2) {
      let pairs = [[1,8,'0.125'],[3,8,'0.375'],[5,8,'0.625'],[7,8,'0.875'],[1,6,'0.1667'],[5,6,'0.8333']];
      let [n,d,dec] = pick(pairs);
      if (ri(0,1) === 0) return { q: `${n}/${d} as a decimal =`, a: dec, t: 'fracdec' };
      return { q: `${dec} as a fraction =`, a: `${n}/${d}`, t: 'fracdec' };
    }
    // Level 3: use existing generator
    return typeof GEN !== 'undefined' ? GEN.fracdec() : { q: '1/3 as a decimal =', a: '0.333', t: 'fracdec' };
  },
  rem: (level) => {
    if (level === 1) { let d = pick([3,4]); let n = ri(10, 999); return { q: `${n} ÷ ${d} remainder?`, a: n%d, t: 'rem' }; }
    if (level === 2) { let d = pick([3,4,6,9]); let n = ri(100, 9999); return { q: `${n} ÷ ${d} remainder?`, a: n%d, t: 'rem' }; }
    let d = pick([3,4,6,9]); let n = ri(10000, 999999); return { q: `${n} ÷ ${d} remainder?`, a: n%d, t: 'rem' };
  },
  series: (level) => {
    if (level === 1) {
      // Simple 1+2+...+n
      let n = pick([5, 8, 10, 12, 15]);
      return { q: `1 + 2 + 3 + ... + ${n} =`, a: n*(n+1)/2, t: 'series' };
    }
    if (level === 2) {
      // Sum of first n odd/even
      if (ri(0,1) === 0) {
        let n = pick([5, 8, 10, 12]);
        return { q: `Sum of first ${n} odd numbers =`, a: n*n, t: 'series' };
      }
      let n = pick([5, 8, 10, 12]);
      return { q: `Sum of first ${n} even numbers =`, a: n*(n+1), t: 'series' };
    }
    return typeof GEN !== 'undefined' ? GEN.series() : { q: '1 + 2 + 3 + ... + 20 =', a: 210, t: 'series' };
  },
  lcm: (level) => {
    if (level === 1) {
      let pairs = [[4,6],[6,8],[3,5],[6,10],[4,10],[8,12]];
      let [a,b] = pick(pairs);
      if (ri(0,1) === 0) return { q: `The GCD of ${a} and ${b} =`, a: gcd(a,b), t: 'gcd' };
      return { q: `The LCM of ${a} and ${b} =`, a: lcmFn(a,b), t: 'lcm' };
    }
    if (level === 2) {
      let pairs = [[12,18],[15,20],[14,21],[24,36],[9,15]];
      let [a,b] = pick(pairs);
      if (ri(0,1) === 0) return { q: `The GCD of ${a} and ${b} =`, a: gcd(a,b), t: 'gcd' };
      return { q: `The LCM of ${a} and ${b} =`, a: lcmFn(a,b), t: 'lcm' };
    }
    return typeof GEN !== 'undefined' ? (ri(0,1) === 0 ? GEN.lcm() : GEN.gcd()) : { q: 'The LCM of 12 and 18 =', a: 36, t: 'lcm' };
  },
  mean: (level) => {
    if (level === 1) {
      let nums = [ri(1,20), ri(1,20)];
      let avg = (nums[0]+nums[1])/2;
      return { q: `The arithmetic mean of ${nums.join(', ')} =`, a: avg, t: 'mean' };
    }
    if (level === 2) {
      let nums = [ri(1,50), ri(1,50), ri(1,50)];
      let avg = (nums[0]+nums[1]+nums[2])/3;
      if (avg !== Math.floor(avg)) return LEVELED_GEN.mean(2); // retry for clean answer
      return { q: `The arithmetic mean of ${nums.join(', ')} =`, a: avg, t: 'mean' };
    }
    return typeof GEN !== 'undefined' ? GEN.mean() : { q: 'The arithmetic mean of 10, 20, 30 =', a: 20, t: 'mean' };
  },
  ops: (level) => {
    if (level === 1) {
      let a = ri(2,10), b = ri(2,10), c = ri(1,10);
      return { q: `${a} × ${b} + ${c} =`, a: a*b+c, t: 'ops' };
    }
    if (level === 2) {
      let a = ri(5,20), b = ri(2,9), c = ri(10,50);
      return { q: `${a} × ${b} − ${c} =`, a: a*b-c, t: 'ops' };
    }
    return typeof GEN !== 'undefined' ? GEN.ops() : { q: '12 × 15 + 8 =', a: 188, t: 'ops' };
  },
  conv: (level) => {
    // Use existing generator at all levels since conversion facts are fixed
    return typeof GEN !== 'undefined' ? GEN.conv() : { q: '3 gallons = ? pints', a: 24, t: 'conv' };
  },
  roman: (level) => {
    return typeof GEN !== 'undefined' ? GEN.roman() : { q: 'XLII =', a: 42, t: 'roman' };
  },
};

// Difficulty metadata per skill (seconds-per-problem targets)
const DIFFICULTY_TARGETS = {
  add:     { 1: 12, 2: 10, 3: 7 },
  sub:     { 1: 12, 2: 10, 3: 7 },
  mul:     { 1: 10, 2: 12, 3: 15 },
  ops:     { 1: 10, 2: 12, 3: 15 },
  mul11:   { 1: 8,  2: 10, 3: 12 },
  mul25:   { 1: 8,  2: 10, 3: 12 },
  near100: { 1: 10, 2: 12, 3: 15 },
  sq5:     { 1: 6,  2: 8,  3: 10 },
  sq:      { 1: 8,  2: 12, 3: 15 },
  div:     { 1: 10, 2: 12, 3: 15 },
  fracdec: { 1: 8,  2: 12, 3: 15 },
  rem:     { 1: 10, 2: 12, 3: 15 },
  series:  { 1: 10, 2: 15, 3: 20 },
  lcm:     { 1: 10, 2: 15, 3: 20 },
  mean:    { 1: 8,  2: 12, 3: 15 },
  conv:    { 1: 10, 2: 10, 3: 10 },
  roman:   { 1: 10, 2: 10, 3: 10 },
};
