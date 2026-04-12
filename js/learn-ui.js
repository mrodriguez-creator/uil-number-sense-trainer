// ═══════════════════════════════════════════════════════════════════════════
// LEARNING UI — Skill Map, Tutorial, and Guided Practice Screens
// Depends on: mastery.js (SKILL_DEFS, loadMastery, etc.), app.js (GEN, setState, etc.)
// ═══════════════════════════════════════════════════════════════════════════

// ── Internal state for learning screens (separate from main app state) ──
let learnState = {
  // Tutorial
  tutorialSkill: null,    // current skill ID being learned
  tutorialStep: 0,        // current step in tutorial
  tutorialPhase: 'intro', // intro | steps | tryit
  tryItIdx: 0,            // which try-it problem
  tryItAnswer: '',
  tryItFeedback: '',
  tryItHintShown: false,

  // Guided Practice
  practiceSkill: null,
  practiceLevel: 1,
  practiceProblem: null,
  practiceAnswer: '',
  practiceFeedback: '',    // '' | 'correct' | 'wrong'
  practiceSolution: '',
  practiceResults: [],     // array of {correct: bool} for current level
  practiceComplete: false, // level completed
  practiceStartTime: 0,
  practiceTrickShown: false,

  // Mastery Check
  masteryCheckActive: false,
  masteryCheckResults: [],
  masteryCheckTimer: null,
  masteryCheckTimeLeft: 0,
};

function setLearnState(patch) {
  Object.assign(learnState, patch);
}

// ── 10-KEY PAD HELPERS ──
function _setLearnKey(stateKey, v) {
  if (stateKey === 'tryItAnswer') learnState.tryItAnswer = v;
  else if (stateKey === 'practiceAnswer') learnState.practiceAnswer = v;
  else if (stateKey === 'posAnswer') posState.answer = v;
}
// Track cursor position so touch-device keypad works (input loses focus on tap)
let _learnCursor = { s: null, e: null };
function _learnTrackCursor(inputId) {
  let inp = document.getElementById(inputId);
  if (inp) { _learnCursor.s = inp.selectionStart; _learnCursor.e = inp.selectionEnd; }
}
function _learnGetCursor(inp) {
  let s = inp.selectionStart, e = inp.selectionEnd;
  if (document.activeElement !== inp && _learnCursor.s !== null) { s = _learnCursor.s; e = _learnCursor.e; }
  if (s === null || s === undefined) s = inp.value.length;
  if (e === null || e === undefined) e = s;
  return { s, e };
}
function learnKeypad(inputId, stateKey, val) {
  let inp = document.getElementById(inputId);
  if (!inp) return;
  let { s, e } = _learnGetCursor(inp);
  let v = inp.value;
  inp.value = v.slice(0, s) + val + v.slice(e);
  _setLearnKey(stateKey, inp.value);
  let pos = s + val.length;
  inp.focus();
  inp.setSelectionRange(pos, pos);
  _learnCursor.s = pos; _learnCursor.e = pos;
}
function learnBackspace(inputId, stateKey) {
  let inp = document.getElementById(inputId);
  if (!inp) return;
  let { s, e } = _learnGetCursor(inp);
  let v = inp.value;
  if (s !== e) { inp.value = v.slice(0, s) + v.slice(e); }
  else if (s > 0) { inp.value = v.slice(0, s - 1) + v.slice(s); s--; }
  _setLearnKey(stateKey, inp.value);
  inp.focus();
  inp.setSelectionRange(s, s);
  _learnCursor.s = s; _learnCursor.e = s;
}
function learnClearInput(inputId, stateKey) {
  let inp = document.getElementById(inputId);
  if (!inp) return;
  inp.value = '';
  _setLearnKey(stateKey, '');
  inp.focus();
  _learnCursor.s = 0; _learnCursor.e = 0;
}
function buildKeypadHTML(inputId, stateKey, submitFn) {
  let pd = 'onpointerdown="event.preventDefault()"';
  return `<div class="keypad">
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','7')">7</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','8')">8</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','9')">9</button>
    <button class="key key-op" ${pd} onclick="learnBackspace('${inputId}','${stateKey}')">⌫</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','4')">4</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','5')">5</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','6')">6</button>
    <button class="key key-op" ${pd} onclick="learnClearInput('${inputId}','${stateKey}')">C</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','1')">1</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','2')">2</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','3')">3</button>
    <button class="key key-neg" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','-')">−</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','0')">0</button>
    <button class="key" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','.')">.</button>
    <button class="key key-frac" ${pd} onclick="learnKeypad('${inputId}','${stateKey}','/')">/</button>
    <button class="key key-enter" ${pd} onclick="${submitFn}()">⏎</button>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL MAP SCREEN
// ═══════════════════════════════════════════════════════════════════════════

function renderSkillMap() {
  let mastery = loadMastery();
  let readiness = getReadinessPercent();
  let recommended = getRecommendedSkill();

  // Group skills
  let coreSkills = SKILL_DEFS.filter(s => s.group === 'core');
  let trickSkills = SKILL_DEFS.filter(s => s.group === 'trick');
  let starredSkills = SKILL_DEFS.filter(s => s.group === 'starred');

  let recommendHTML = '';
  if (recommended) {
    let ms = mastery[recommended.id];
    let status = ms ? ms.status : 'not_started';
    let actionText = status === 'not_started' ? 'Start Learning' :
                     status === 'mastered' ? 'Review' : 'Continue';
    let descText = status === 'not_started' ? 'Learn this skill to boost your Problems 1-20 readiness' :
                   status === 'mastered' ? 'Keep your skills sharp with a quick review' :
                   'Pick up where you left off';
    recommendHTML = `
      <div class="recommend-banner" onclick="openSkill('${recommended.id}')">
        <div class="recommend-tag">Recommended Next</div>
        <div class="recommend-title">${recommended.icon} ${recommended.name}</div>
        <div class="recommend-desc">${descText}</div>
        <div class="recommend-btn">${actionText} &rarr;</div>
      </div>`;
  }

  return `
    <div class="header">
      <a href="https://mrodriguez-creator.github.io/uil-STEM/" class="back-home">&larr; STEM Home</a>
      <h1>Number Sense Trainer</h1>
      <p>Master mental math for UIL competition</p>
    </div>
    <div class="skillmap-body">
      <div class="readiness-bar">
        <div class="readiness-label">
          <span>Problems 1-20 Readiness</span>
          <span>${readiness}%</span>
        </div>
        <div class="readiness-track">
          <div class="readiness-fill" style="width:${readiness}%"></div>
        </div>
      </div>

      ${recommendHTML}

      <div class="section-tag">Core Skills</div>
      <div class="skill-grid">
        ${coreSkills.map(s => renderSkillTile(s, mastery[s.id])).join('')}
      </div>

      <div class="section-tag">Shortcut Tricks</div>
      <div class="skill-grid">
        ${trickSkills.map(s => renderSkillTile(s, mastery[s.id])).join('')}
      </div>

      ${starredSkills.length > 0 ? `
        <div class="section-tag">Starred Problems</div>
        <div class="skill-grid">
          ${starredSkills.map(s => renderSkillTile(s, mastery[s.id])).join('')}
        </div>
      ` : ''}

      <div class="section-tag">Test Yourself</div>
      <div class="test-actions-grid">
        <div class="test-action-card">
          <div class="ta-title">Timed Round</div>
          <div class="ta-desc">20 problems in UIL order, scored +5/−4</div>
          <div class="time-picker">
            <button class="time-btn" onclick="startTimed(150)">2:30</button>
            <button class="time-btn" onclick="startTimed(300)">5:00</button>
            <button class="time-btn" onclick="startTimed(450)">7:30</button>
            <button class="time-btn" onclick="startTimed(600)">10:00</button>
          </div>
        </div>
        <div class="test-action-card">
          <div class="ta-title">Position Practice</div>
          <div class="ta-desc">Practice all 20 positions in order with hints</div>
          <button class="ta-start-btn" onclick="startPositionPractice()">Start &rarr;</button>
        </div>
      </div>

      <div class="section-tag">More</div>
      <div class="quick-actions">
        <button class="qa-btn" onclick="startDrill()">Drill Mode</button>
        <button class="qa-btn" onclick="setState({screen:'dashboard'})">Progress & Stats</button>
        <button class="qa-btn" onclick="setState({screen:'menu'})">Classic Menu</button>
      </div>
    </div>`;
}

function renderSkillTile(skill, ms) {
  let status = ms ? ms.status : 'not_started';

  // Calculate ring progress (0-100)
  let progress = 0;
  let ringClass = '';
  let statusLabel = '';
  let statusClass = 'st-new';
  let tileClass = '';

  switch(status) {
    case 'not_started':
      progress = 0; statusLabel = 'New'; statusClass = 'st-new'; break;
    case 'learning':
      progress = 15; ringClass = 'learning'; statusLabel = 'Learning'; statusClass = 'st-learning'; tileClass = 'in-progress'; break;
    case 'level_1':
      progress = 35; ringClass = 'practicing'; statusLabel = 'Level 1'; statusClass = 'st-l1'; tileClass = 'in-progress'; break;
    case 'level_2':
      progress = 55; ringClass = 'practicing'; statusLabel = 'Level 2'; statusClass = 'st-l2'; tileClass = 'in-progress'; break;
    case 'level_3':
      progress = 75; ringClass = 'practicing'; statusLabel = 'Level 3'; statusClass = 'st-l3'; tileClass = 'in-progress'; break;
    case 'mastered':
      progress = 100; ringClass = 'mastered'; statusLabel = 'Mastered'; statusClass = 'st-mastered'; tileClass = 'mastered'; break;
  }

  // SVG ring
  let r = 14, c = 2 * Math.PI * r;
  let offset = c - (progress / 100) * c;
  let centerIcon = status === 'mastered' ? '&#9733;' : skill.icon;

  return `
    <div class="skill-tile ${tileClass}" onclick="openSkill('${skill.id}')">
      <div class="mastery-ring">
        <svg viewBox="0 0 36 36">
          <circle class="ring-bg" cx="18" cy="18" r="${r}"/>
          <circle class="ring-fill ${ringClass}" cx="18" cy="18" r="${r}"
            stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
        </svg>
        <span class="ring-center">${centerIcon}</span>
      </div>
      <div class="skill-name">${skill.name}</div>
      <div class="skill-pos">Position ${skill.position}</div>
      <span class="skill-status ${statusClass}">${statusLabel}</span>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// TUTORIAL (LEARN) SCREEN
// ═══════════════════════════════════════════════════════════════════════════

function renderLesson() {
  let skill = SKILL_DEFS.find(s => s.id === learnState.tutorialSkill);
  if (!skill) return renderSkillMap();

  let tutorial = typeof TUTORIALS !== 'undefined' ? TUTORIALS[skill.id] : null;
  if (!tutorial) {
    // No tutorial content yet - go straight to practice
    return renderNoPractice(skill);
  }

  if (learnState.tutorialPhase === 'intro') return renderTutorialIntro(skill, tutorial);
  if (learnState.tutorialPhase === 'steps') return renderTutorialSteps(skill, tutorial);
  if (learnState.tutorialPhase === 'tryit') return renderTutorialTryIt(skill, tutorial);
  return renderTutorialIntro(skill, tutorial);
}

function renderNoPractice(skill) {
  return `
    <div class="header">
      <h1>${skill.icon} ${skill.name}</h1>
      <p>Position ${skill.position}</p>
    </div>
    <div class="learn-body">
      <div class="learn-header">
        <button class="learn-back" onclick="setState({screen:'skillmap'})">&larr; Back</button>
      </div>
      <div class="tutorial-card">
        <h3>Tutorial coming soon!</h3>
        <p>The detailed tutorial for this skill is being written. In the meantime, you can jump straight into practice.</p>
      </div>
      <div class="learn-nav">
        <button class="btn-next" onclick="startGuidedPractice('${skill.id}', 1)">Start Practice &rarr;</button>
      </div>
    </div>`;
}

function renderTutorialIntro(skill, tutorial) {
  let totalSteps = 1 + tutorial.steps.length + 1; // intro + steps + tryit
  return `
    <div class="header">
      <h1>${skill.icon} ${skill.name}</h1>
      <p>Position ${skill.position}</p>
    </div>
    <div class="learn-body">
      <div class="learn-header">
        <button class="learn-back" onclick="setState({screen:'skillmap'})">&larr; Back</button>
        <span class="learn-step-count">Step 1 of ${totalSteps}</span>
      </div>
      <div class="step-progress">
        <div class="step-dot current"></div>
        ${Array(totalSteps - 1).fill('<div class="step-dot"></div>').join('')}
      </div>
      <div class="tutorial-card">
        <h3>${tutorial.title}</h3>
        <p>${tutorial.intro}</p>
        ${tutorial.position ? `<p><span class="highlight">Where it appears:</span> Problem position ${tutorial.position} on UIL tests</p>` : ''}
      </div>
      ${tutorial.keyPatterns ? `
        <div class="patterns-box">
          <h4>What to Look For</h4>
          <ul>
            ${tutorial.keyPatterns.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>` : ''}
      <div class="learn-nav">
        <button class="btn-next" onclick="tutorialNext()">Learn the Trick &rarr;</button>
      </div>
    </div>`;
}

function renderTutorialSteps(skill, tutorial) {
  let stepIdx = learnState.tutorialStep;
  let step = tutorial.steps[stepIdx];
  let totalSteps = 1 + tutorial.steps.length + 1;
  let currentStep = 2 + stepIdx;

  return `
    <div class="header">
      <h1>${skill.icon} ${skill.name}</h1>
      <p>Step-by-step technique</p>
    </div>
    <div class="learn-body">
      <div class="learn-header">
        <button class="learn-back" onclick="tutorialPrev()">&larr; Back</button>
        <span class="learn-step-count">Step ${currentStep} of ${totalSteps}</span>
      </div>
      <div class="step-progress">
        ${Array(totalSteps).fill(0).map((_, i) =>
          `<div class="step-dot ${i < currentStep ? 'done' : ''} ${i === currentStep - 1 ? 'current' : ''}"></div>`
        ).join('')}
      </div>
      <div class="tutorial-card">
        <h3>${step.title || 'Step ' + (stepIdx + 1)}</h3>
        <p>${step.text}</p>
      </div>
      ${step.example ? `
        <div class="example-box">
          <div class="ex-problem">${step.example.problem}</div>
          ${step.example.steps.map((s, i) => `
            <div class="ex-step revealed">
              <span class="step-num">${i+1}.</span>
              <span>${s.text}</span>
              ${s.result ? `<span class="step-result">${s.result}</span>` : ''}
            </div>
          `).join('')}
        </div>` : ''}
      <div class="learn-nav">
        <button class="btn-prev" onclick="tutorialPrev()">&larr; Previous</button>
        <button class="btn-next" onclick="tutorialNext()">${stepIdx < tutorial.steps.length - 1 ? 'Next Step' : 'Try It Yourself'} &rarr;</button>
      </div>
    </div>`;
}

function renderTutorialTryIt(skill, tutorial) {
  let tryIt = tutorial.tryIt;
  if (!tryIt || tryIt.length === 0) {
    completeTutorial(skill.id);
    return renderSkillMap();
  }

  let idx = learnState.tryItIdx;
  if (idx >= tryIt.length) {
    // All try-it done
    return renderTutorialComplete(skill);
  }

  let problem = tryIt[idx];
  let totalSteps = 1 + tutorial.steps.length + 1;

  return `
    <div class="header">
      <h1>${skill.icon} ${skill.name}</h1>
      <p>Try it yourself!</p>
    </div>
    <div class="learn-body">
      <div class="learn-header">
        <button class="learn-back" onclick="tutorialPrev()">&larr; Back</button>
        <span class="learn-step-count">Practice ${idx + 1} of ${tryIt.length}</span>
      </div>
      <div class="step-progress">
        ${Array(totalSteps).fill(0).map((_, i) => `<div class="step-dot done"></div>`).join('')}
      </div>
      <div class="tryit-section">
        <div class="tryit-problem">
          <div class="tryit-q">${problem.q}</div>
          <div class="tryit-input-row">
            <input type="text" class="tryit-input" id="tryit-ans" placeholder="Your answer" value="${learnState.tryItAnswer}"
              onkeydown="if(event.key==='Enter')checkTryIt()" onblur="_learnTrackCursor('tryit-ans')" onkeyup="_learnTrackCursor('tryit-ans')" ontouchend="_learnTrackCursor('tryit-ans')" onmouseup="_learnTrackCursor('tryit-ans')" autocomplete="off" inputmode="none">
          </div>
          ${buildKeypadHTML('tryit-ans', 'tryItAnswer', 'checkTryIt')}
          ${!learnState.tryItHintShown ? `
            <button class="tryit-hint-btn" onclick="showTryItHint()">Show Hint</button>
          ` : `
            <div class="tryit-hint">${problem.walkthrough}</div>
          `}
          ${learnState.tryItFeedback === 'correct' ? `
            <div class="tryit-feedback correct">Correct! ${idx < tryIt.length - 1 ? '' : 'Tutorial complete!'}</div>
          ` : ''}
          ${learnState.tryItFeedback === 'wrong' ? `
            <div class="tryit-feedback wrong">Not quite. The answer is ${problem.a}. ${problem.walkthrough}</div>
          ` : ''}
        </div>
      </div>
      ${learnState.tryItFeedback ? `
        <div class="learn-nav">
          <button class="btn-next" onclick="nextTryIt()">${idx < tryIt.length - 1 ? 'Next Problem' : 'Complete Tutorial'} &rarr;</button>
        </div>
      ` : ''}
    </div>`;
}

function renderTutorialComplete(skill) {
  return `
    <div class="header">
      <h1>${skill.icon} ${skill.name}</h1>
      <p>Tutorial Complete!</p>
    </div>
    <div class="learn-body">
      <div class="level-complete" style="border-color: #667eea;">
        <h3 style="color: #667eea;">Tutorial Complete!</h3>
        <p>You've learned the technique for ${skill.name}. Now let's practice with increasing difficulty.</p>
        <button class="btn-next-level" style="background:#667eea;" onclick="startGuidedPractice('${skill.id}', 1)">Start Level 1 Practice &rarr;</button>
      </div>
      <div class="learn-nav">
        <button class="btn-prev" onclick="setState({screen:'skillmap'})">&larr; Back to Skills</button>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// GUIDED PRACTICE SCREEN
// ═══════════════════════════════════════════════════════════════════════════

function renderPractice() {
  let skill = SKILL_DEFS.find(s => s.id === learnState.practiceSkill);
  if (!skill) return renderSkillMap();

  // Level complete?
  if (learnState.practiceComplete) {
    return renderLevelComplete(skill);
  }

  // Mastery check complete?
  if (learnState.masteryCheckActive && learnState.masteryCheckResults.length >= 10) {
    return renderMasteryResult(skill);
  }

  let level = learnState.practiceLevel;
  let results = learnState.masteryCheckActive ? learnState.masteryCheckResults : learnState.practiceResults;
  let problem = learnState.practiceProblem;
  let target = learnState.masteryCheckActive ? 10 : 5;

  if (!problem) {
    // Generate first problem
    generatePracticeProblem();
    problem = learnState.practiceProblem;
  }

  let correct = results.filter(r => r.correct).length;
  let total = results.length;
  let levelLabel = learnState.masteryCheckActive ? 'Mastery Check' : `Level ${level}`;
  let levelClass = learnState.masteryCheckActive ? 'lv3' : `lv${level}`;

  return `
    <div class="header">
      <h1>${skill.icon} ${skill.name}</h1>
      <p>${learnState.masteryCheckActive ? 'Prove your mastery!' : 'Guided Practice'}</p>
    </div>
    <div class="practice-body">
      <div class="practice-header">
        <button class="learn-back" onclick="exitPractice()">&larr; Back</button>
        <span class="practice-title">${skill.name}</span>
        <span class="practice-level-badge ${levelClass}">${levelLabel}</span>
      </div>

      <div class="level-progress">
        <div class="level-progress-label">
          <span>${correct}/${target} correct needed</span>
          <span>${total}/${target} attempted</span>
        </div>
        <div class="level-progress-track">
          ${Array(target).fill(0).map((_, i) => {
            if (i < results.length) {
              return `<div class="level-pip ${results[i].correct ? 'correct' : 'wrong'}"></div>`;
            }
            return `<div class="level-pip"></div>`;
          }).join('')}
        </div>
      </div>

      <div class="practice-problem">
        <div class="practice-q">${problem ? problem.q : 'Loading...'}</div>
        ${learnState.practiceFeedback === '' ? `
          <div class="practice-input-row">
            <input type="text" class="practice-input" id="practice-ans" placeholder="Answer"
              value="${learnState.practiceAnswer}"
              onkeydown="if(event.key==='Enter')submitPractice()"
              onblur="_learnTrackCursor('practice-ans')" onkeyup="_learnTrackCursor('practice-ans')" ontouchend="_learnTrackCursor('practice-ans')" onmouseup="_learnTrackCursor('practice-ans')"
              autocomplete="off" inputmode="none">
          </div>
          ${buildKeypadHTML('practice-ans', 'practiceAnswer', 'submitPractice')}
          <div class="practice-actions">
            ${level === 1 || learnState.practiceTrickShown ? '' : `
              <button class="btn-show-trick" onclick="showPracticeTrick()">Show Trick</button>
            `}
            <button class="btn-skip-practice" onclick="skipPractice()">Skip</button>
          </div>
          ${learnState.practiceTrickShown && learnState.practiceSolution ? `
            <div class="tryit-hint" style="margin-top:16px; text-align:left;">${learnState.practiceSolution}</div>
          ` : ''}
          ${level === 1 && learnState.practiceSolution ? `
            <div class="tryit-hint" style="margin-top:16px; text-align:left;">${learnState.practiceSolution}</div>
          ` : ''}
        ` : `
          <div class="practice-feedback ${learnState.practiceFeedback}">
            <h4>${learnState.practiceFeedback === 'correct' ? 'Correct!' : 'Not quite'}</h4>
            ${learnState.practiceFeedback === 'wrong' ? `
              <p>The answer is <strong>${problem ? displayAnswer(problem.a) : ''}</strong></p>
              ${learnState.practiceSolution ? `<div class="solution-steps" style="margin-top:10px; text-align:left;">${learnState.practiceSolution}</div>` : ''}
            ` : ''}
          </div>
          <div class="practice-actions" style="margin-top:16px;">
            <button class="btn-next" onclick="nextPracticeProblem()">Next &rarr;</button>
          </div>
        `}
      </div>

      <div class="practice-stats">
        <span class="stat-item">&#10003; ${correct} correct</span>
        <span class="stat-item">&#10007; ${total - correct} wrong</span>
        ${total > 0 ? `<span class="stat-item">${Math.round(correct/total*100)}% accuracy</span>` : ''}
      </div>
    </div>`;
}

function renderLevelComplete(skill) {
  let level = learnState.practiceLevel;
  let results = learnState.practiceResults;
  let correct = results.filter(r => r.correct).length;
  let total = results.length;
  let accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
  let passed = correct >= 5 && accuracy >= 80;

  let ms = getSkillMastery(skill.id);
  let nextAction = '';
  if (passed) {
    if (level < 3) {
      nextAction = `<button class="btn-next-level" onclick="startGuidedPractice('${skill.id}', ${level + 1})">Start Level ${level + 1} &rarr;</button>`;
    } else {
      nextAction = `<button class="btn-next-level" style="background:#d69e2e;" onclick="startMasteryCheck('${skill.id}')">Take Mastery Check &rarr;</button>`;
    }
  } else {
    nextAction = `<button class="btn-next-level" style="background:#ed8936;" onclick="startGuidedPractice('${skill.id}', ${level})">Retry Level ${level} &rarr;</button>`;
  }

  return `
    <div class="header">
      <h1>${skill.icon} ${skill.name}</h1>
      <p>Level ${level} ${passed ? 'Complete!' : 'Results'}</p>
    </div>
    <div class="practice-body">
      <div class="level-complete" ${!passed ? 'style="border-color:#ed8936;"' : ''}>
        <h3 ${!passed ? 'style="color:#ed8936;"' : ''}>${passed ? 'Level ' + level + ' Complete!' : 'Keep Practicing!'}</h3>
        <p>${correct}/${total} correct (${accuracy}% accuracy)</p>
        <p>${passed ? 'You\'re ready for the next challenge.' : 'You need 5+ correct with 80%+ accuracy to advance.'}</p>
        ${nextAction}
      </div>
      <div class="learn-nav">
        <button class="btn-prev" onclick="setState({screen:'skillmap'})">&larr; Back to Skills</button>
      </div>
    </div>`;
}

function renderMasteryResult(skill) {
  let results = learnState.masteryCheckResults;
  let correct = results.filter(r => r.correct).length;
  let total = results.length;
  let passed = correct >= 8;

  if (passed) {
    recordMasteryCheck(skill.id, correct, total, 0);
  }

  return `
    <div class="header">
      <h1>${skill.icon} ${skill.name}</h1>
      <p>Mastery Check Results</p>
    </div>
    <div class="practice-body">
      ${passed ? `
        <div class="mastery-complete">
          <div class="star-burst">&#11088;</div>
          <h3>Skill Mastered!</h3>
          <p>You scored ${correct}/10 — outstanding!</p>
          <p>This skill is now marked as mastered on your skill map.</p>
          <button class="btn-next-level" style="background:#d69e2e;" onclick="setState({screen:'skillmap'})">Back to Skill Map &rarr;</button>
        </div>
      ` : `
        <div class="level-complete" style="border-color:#ed8936;">
          <h3 style="color:#ed8936;">Not quite yet</h3>
          <p>You scored ${correct}/10 — you need 8/10 to earn mastery.</p>
          <p>Review the technique and practice more at Level 3.</p>
          <button class="btn-next-level" style="background:#ed8936;" onclick="startGuidedPractice('${skill.id}', 3)">Practice Level 3 &rarr;</button>
        </div>
      `}
      <div class="learn-nav">
        <button class="btn-prev" onclick="setState({screen:'skillmap'})">&larr; Back to Skills</button>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION / ACTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function openSkill(skillId) {
  let ms = getSkillMastery(skillId);
  let tutorial = typeof TUTORIALS !== 'undefined' ? TUTORIALS[skillId] : null;

  if (ms.status === 'not_started' && tutorial) {
    // Start tutorial
    setLearnState({
      tutorialSkill: skillId,
      tutorialStep: 0,
      tutorialPhase: 'intro',
      tryItIdx: 0,
      tryItAnswer: '',
      tryItFeedback: '',
      tryItHintShown: false
    });
    setState({ screen: 'learn' });
  } else if (ms.status === 'not_started' && !tutorial) {
    // No tutorial - go to practice
    startGuidedPractice(skillId, 1);
  } else if (ms.status === 'learning') {
    // Resume at level 1 practice
    startGuidedPractice(skillId, 1);
  } else if (ms.status === 'mastered') {
    // Review - go to level 3 practice
    startGuidedPractice(skillId, 3);
  } else if (ms.status === 'level_3') {
    // All levels passed - go straight to mastery check
    startMasteryCheck(skillId);
  } else {
    // In progress - figure out current level
    let level = ms.status === 'level_1' ? 2 : ms.status === 'level_2' ? 3 : 3;
    startGuidedPractice(skillId, level);
  }
}

function tutorialNext() {
  let tutorial = typeof TUTORIALS !== 'undefined' ? TUTORIALS[learnState.tutorialSkill] : null;
  if (!tutorial) return;

  if (learnState.tutorialPhase === 'intro') {
    setLearnState({ tutorialPhase: 'steps', tutorialStep: 0 });
  } else if (learnState.tutorialPhase === 'steps') {
    if (learnState.tutorialStep < tutorial.steps.length - 1) {
      setLearnState({ tutorialStep: learnState.tutorialStep + 1 });
    } else {
      setLearnState({ tutorialPhase: 'tryit', tryItIdx: 0, tryItAnswer: '', tryItFeedback: '', tryItHintShown: false });
    }
  }
  render();
}

function tutorialPrev() {
  if (learnState.tutorialPhase === 'tryit') {
    let tutorial = typeof TUTORIALS !== 'undefined' ? TUTORIALS[learnState.tutorialSkill] : null;
    setLearnState({ tutorialPhase: 'steps', tutorialStep: tutorial ? tutorial.steps.length - 1 : 0 });
  } else if (learnState.tutorialPhase === 'steps') {
    if (learnState.tutorialStep > 0) {
      setLearnState({ tutorialStep: learnState.tutorialStep - 1 });
    } else {
      setLearnState({ tutorialPhase: 'intro' });
    }
  } else {
    setState({ screen: 'skillmap' });
    return;
  }
  render();
}

function checkTryIt() {
  let input = document.getElementById('tryit-ans');
  if (!input) return;
  let userAns = input.value.trim();
  if (!userAns) return;

  let tutorial = typeof TUTORIALS !== 'undefined' ? TUTORIALS[learnState.tutorialSkill] : null;
  if (!tutorial || !tutorial.tryIt) return;

  let problem = tutorial.tryIt[learnState.tryItIdx];
  let correct = answerMatches(userAns, problem.a, false);

  setLearnState({
    tryItAnswer: userAns,
    tryItFeedback: correct ? 'correct' : 'wrong'
  });
  render();
}

function showTryItHint() {
  setLearnState({ tryItHintShown: true });
  render();
}

function nextTryIt() {
  let tutorial = typeof TUTORIALS !== 'undefined' ? TUTORIALS[learnState.tutorialSkill] : null;
  if (!tutorial) return;

  let nextIdx = learnState.tryItIdx + 1;
  if (nextIdx >= tutorial.tryIt.length) {
    completeTutorial(learnState.tutorialSkill);
    setLearnState({ tutorialPhase: 'tryit', tryItIdx: nextIdx });
    render();
    return;
  }

  setLearnState({
    tryItIdx: nextIdx,
    tryItAnswer: '',
    tryItFeedback: '',
    tryItHintShown: false
  });
  render();
}

function completeTutorial(skillId) {
  updateSkillMastery(skillId, { status: 'learning', tutorialDone: true });
}

// ── Guided Practice ──

function startGuidedPractice(skillId, level) {
  setLearnState({
    practiceSkill: skillId,
    practiceLevel: level,
    practiceProblem: null,
    practiceAnswer: '',
    practiceFeedback: '',
    practiceSolution: '',
    practiceResults: [],
    practiceComplete: false,
    practiceStartTime: Date.now(),
    practiceTrickShown: false,
    masteryCheckActive: false,
    masteryCheckResults: []
  });

  // Ensure mastery status is at least 'learning'
  let ms = getSkillMastery(skillId);
  if (ms.status === 'not_started') {
    updateSkillMastery(skillId, { status: 'learning', tutorialDone: false });
  }

  generatePracticeProblem();
  setState({ screen: 'practice' });
}

function startMasteryCheck(skillId) {
  setLearnState({
    practiceSkill: skillId,
    practiceLevel: 3,
    practiceProblem: null,
    practiceAnswer: '',
    practiceFeedback: '',
    practiceSolution: '',
    practiceResults: [],
    practiceComplete: false,
    practiceStartTime: Date.now(),
    practiceTrickShown: false,
    masteryCheckActive: true,
    masteryCheckResults: []
  });
  generatePracticeProblem();
  setState({ screen: 'practice' });
}

function generatePracticeProblem() {
  let level = learnState.practiceLevel;
  let skillId = learnState.practiceSkill;
  let problem = generateLeveled(skillId, level);

  if (problem) {
    // Generate solution hint for level 1
    let solutionHTML = '';
    if (level === 1 || learnState.practiceTrickShown) {
      try {
        let sol = getStructuredSolution(problem.q, problem.a, problem.t);
        if (sol && sol.steps) {
          solutionHTML = '<strong>' + sol.trickName + '</strong><br>' +
            sol.steps.map(s => '<em>' + s.label + ':</em> ' + s.text).join('<br>');
        }
      } catch(e) {}
    }
    setLearnState({
      practiceProblem: problem,
      practiceAnswer: '',
      practiceFeedback: '',
      practiceSolution: level === 1 ? solutionHTML : '',
      practiceTrickShown: false
    });
  }
}

function submitPractice() {
  let input = document.getElementById('practice-ans');
  if (!input) return;
  let userAns = input.value.trim();
  if (!userAns) return;

  let problem = learnState.practiceProblem;
  if (!problem) return;

  let correct = answerMatches(userAns, problem.a, false);

  // Get solution for wrong answers
  let solutionHTML = '';
  if (!correct) {
    try {
      let sol = getStructuredSolution(problem.q, problem.a, problem.t);
      if (sol && sol.steps) {
        solutionHTML = '<strong>' + sol.trickName + '</strong><br>' +
          sol.steps.map(s => '<em>' + s.label + ':</em> ' + s.text).join('<br>');
      }
    } catch(e) {}
  }

  let results = learnState.masteryCheckActive ? learnState.masteryCheckResults : learnState.practiceResults;
  results.push({ correct: correct });

  setLearnState({
    practiceAnswer: userAns,
    practiceFeedback: correct ? 'correct' : 'wrong',
    practiceSolution: solutionHTML,
    practiceResults: learnState.masteryCheckActive ? learnState.practiceResults : results,
    masteryCheckResults: learnState.masteryCheckActive ? results : learnState.masteryCheckResults
  });

  // Check if level is done
  let target = learnState.masteryCheckActive ? 10 : 5;
  if (results.length >= target) {
    let correctCount = results.filter(r => r.correct).length;
    let accuracy = correctCount / results.length;

    if (!learnState.masteryCheckActive) {
      let elapsed = (Date.now() - learnState.practiceStartTime) / 1000;
      let avgTime = elapsed / results.length;
      recordLevelAttempt(learnState.practiceSkill, learnState.practiceLevel, correctCount, results.length, avgTime);
      setLearnState({ practiceComplete: true });
    }
    // Mastery check results handled in renderMasteryResult
  }

  render();
}

function skipPractice() {
  let results = learnState.masteryCheckActive ? learnState.masteryCheckResults : learnState.practiceResults;
  results.push({ correct: false });

  setLearnState({
    practiceResults: learnState.masteryCheckActive ? learnState.practiceResults : results,
    masteryCheckResults: learnState.masteryCheckActive ? results : learnState.masteryCheckResults
  });

  // Check if done
  let target = learnState.masteryCheckActive ? 10 : 5;
  if (results.length >= target) {
    let correctCount = results.filter(r => r.correct).length;
    if (!learnState.masteryCheckActive) {
      recordLevelAttempt(learnState.practiceSkill, learnState.practiceLevel, correctCount, results.length, 0);
      setLearnState({ practiceComplete: true });
    }
    render();
    return;
  }

  generatePracticeProblem();
  render();
}

function nextPracticeProblem() {
  let results = learnState.masteryCheckActive ? learnState.masteryCheckResults : learnState.practiceResults;
  let target = learnState.masteryCheckActive ? 10 : 5;
  if (results.length >= target) {
    if (!learnState.masteryCheckActive) {
      setLearnState({ practiceComplete: true });
    }
    render();
    return;
  }
  generatePracticeProblem();
  render();
}

function showPracticeTrick() {
  let problem = learnState.practiceProblem;
  if (!problem) return;

  let solutionHTML = '';
  try {
    let sol = getStructuredSolution(problem.q, problem.a, problem.t);
    if (sol && sol.steps) {
      solutionHTML = '<strong>' + sol.trickName + '</strong><br>' +
        sol.steps.map(s => '<em>' + s.label + ':</em> ' + s.text).join('<br>');
    }
  } catch(e) {}

  setLearnState({ practiceTrickShown: true, practiceSolution: solutionHTML });
  render();
}

function exitPractice() {
  setState({ screen: 'skillmap' });
}

// ═══════════════════════════════════════════════════════════════════════════
// POSITION PRACTICE MODE — Practice all 20 positions in UIL order
// ═══════════════════════════════════════════════════════════════════════════

const POSITION_LABELS = [
  'Add', 'Sub', 'Add/Sub', 'Mul', 'Mul/Ops', 'PEMDAS',
  'Shortcut', 'Shortcut', 'Squares', '4-Term*',
  'Division', 'Frac/Dec', 'Conv/Roman', 'Conv/Roman', 'LCM/GCD',
  'Percent', 'Mean', 'Series', 'Remainder', 'Large Ops*'
];

let posState = {
  active: false,
  problems: [],     // 20 generated problems
  idx: 0,           // current position (0-19)
  answer: '',
  feedback: '',     // '' | 'correct' | 'wrong'
  solution: '',
  results: [],      // per-position: null (not attempted), true, false
  showSolution: false,
};

function startPositionPractice() {
  // Generate one problem per position using the SEQ_1_20 chart
  let problems = [];
  let seq = typeof SEQ_1_20 !== 'undefined' ? SEQ_1_20 : [];
  for (let i = 0; i < 20; i++) {
    let genKeys = seq[i] || ['add'];
    let prob = null;

    // Position 10 (idx 9): starred tier1
    if (i === 9 && typeof APPROX !== 'undefined') {
      prob = APPROX.tier1();
    }
    // Position 20 (idx 19): starred tier1hard
    else if (i === 19 && typeof APPROX !== 'undefined') {
      prob = APPROX.tier1hard();
    }
    else {
      let genKey = genKeys[Math.floor(Math.random() * genKeys.length)];
      if (typeof GEN !== 'undefined' && GEN[genKey]) {
        prob = GEN[genKey]();
      }
    }

    if (prob) {
      prob.num = i + 1;
      prob.starred = (i === 9 || i === 19);
      problems.push(prob);
    } else {
      problems.push({ q: 'Problem unavailable', a: 0, t: 'unknown', num: i+1 });
    }
  }

  posState = {
    active: true,
    problems: problems,
    idx: 0,
    answer: '',
    feedback: '',
    solution: '',
    results: new Array(20).fill(null),
    showSolution: false
  };
  setState({ screen: 'position' });
}

function renderPositionPractice() {
  if (!posState.active) return renderSkillMap();

  let prob = posState.problems[posState.idx];
  let pos = posState.idx + 1;
  let label = POSITION_LABELS[posState.idx] || '?';
  let done = posState.results.filter(r => r !== null).length;
  let correct = posState.results.filter(r => r === true).length;

  // Get solution for current problem
  let solutionHTML = '';
  if (posState.showSolution || posState.feedback === 'wrong') {
    try {
      let sol = getStructuredSolution(prob.q, prob.a, prob.t);
      if (sol && sol.steps) {
        solutionHTML = '<strong>' + sol.trickName + '</strong><br>' +
          sol.steps.map(s => '<em>' + s.label + ':</em> ' + s.text).join('<br>');
      }
    } catch(e) {}
  }

  return `
    <div class="header">
      <h1>Position Practice</h1>
      <p>Problems 1-20 in UIL order</p>
    </div>
    <div class="practice-body">
      <div class="practice-header">
        <button class="learn-back" onclick="exitPositionPractice()">&larr; Back</button>
        <span class="practice-title">Position ${pos}: ${label}</span>
        <span style="font-size:0.85rem;color:#a0aec0;">${correct}/${done} correct</span>
      </div>

      <div class="pos-map">
        ${posState.problems.map((p, i) => {
          let cls = i === posState.idx ? 'current' :
                    posState.results[i] === true ? 'correct' :
                    posState.results[i] === false ? 'wrong' :
                    '';
          return `<div class="pos-pip ${cls}" onclick="jumpToPosition(${i})">
            <div class="pos-num">${i+1}${(i===9||i===19)?'*':''}</div>
            <div class="pos-topic">${POSITION_LABELS[i]}</div>
          </div>`;
        }).join('')}
      </div>

      <div class="practice-problem">
        <div class="practice-q">${prob.q}</div>
        ${posState.feedback === '' ? `
          <div class="practice-input-row">
            <input type="text" class="practice-input" id="pos-ans" placeholder="Answer"
              value="${posState.answer}"
              onkeydown="if(event.key==='Enter')submitPosition()"
              onblur="_learnTrackCursor('pos-ans')" onkeyup="_learnTrackCursor('pos-ans')" ontouchend="_learnTrackCursor('pos-ans')" onmouseup="_learnTrackCursor('pos-ans')"
              autocomplete="off" inputmode="none">
          </div>
          ${buildKeypadHTML('pos-ans', 'posAnswer', 'submitPosition')}
          <div class="practice-actions">
            <button class="btn-show-trick" onclick="showPositionSolution()">Show Trick</button>
            <button class="btn-skip-practice" onclick="skipPosition()">Skip</button>
          </div>
          ${posState.showSolution && solutionHTML ? `
            <div class="tryit-hint" style="margin-top:16px;text-align:left;">${solutionHTML}</div>
          ` : ''}
        ` : `
          <div class="practice-feedback ${posState.feedback}">
            <h4>${posState.feedback === 'correct' ? 'Correct!' : 'Not quite'}</h4>
            ${posState.feedback === 'wrong' ? `
              <p>The answer is <strong>${displayAnswer(prob.a)}</strong></p>
              ${solutionHTML ? `<div style="margin-top:10px;text-align:left;">${solutionHTML}</div>` : ''}
            ` : ''}
          </div>
          <div class="practice-actions" style="margin-top:16px;">
            ${posState.idx < 19 ? `
              <button class="btn-next" onclick="nextPosition()">Position ${pos+1} &rarr;</button>
            ` : `
              <button class="btn-next" onclick="finishPositionPractice()">See Results &rarr;</button>
            `}
          </div>
        `}
      </div>
    </div>`;
}

function submitPosition() {
  let input = document.getElementById('pos-ans');
  if (!input) return;
  let userAns = input.value.trim();
  if (!userAns) return;

  let prob = posState.problems[posState.idx];
  let correct = answerMatches(userAns, prob.a, prob.starred || false);

  posState.answer = userAns;
  posState.feedback = correct ? 'correct' : 'wrong';
  posState.results[posState.idx] = correct;
  render();
}

function skipPosition() {
  posState.results[posState.idx] = false;
  if (posState.idx < 19) {
    posState.idx++;
    posState.answer = '';
    posState.feedback = '';
    posState.showSolution = false;
  }
  render();
}

function nextPosition() {
  if (posState.idx < 19) {
    posState.idx++;
    posState.answer = '';
    posState.feedback = '';
    posState.showSolution = false;
  }
  render();
  // Focus input after render
  setTimeout(() => { let el = document.getElementById('pos-ans'); if(el) el.focus(); }, 50);
}

function jumpToPosition(idx) {
  posState.idx = idx;
  posState.answer = '';
  posState.feedback = '';
  posState.showSolution = false;
  render();
}

function showPositionSolution() {
  posState.showSolution = true;
  render();
}

function exitPositionPractice() {
  posState.active = false;
  setState({ screen: 'skillmap' });
}

function finishPositionPractice() {
  let correct = posState.results.filter(r => r === true).length;
  let total = posState.results.filter(r => r !== null).length;
  posState.active = false;

  // Record as a session
  if (typeof recordSession !== 'undefined') {
    let topicBreakdown = {};
    posState.problems.forEach((p, i) => {
      let t = p.t || 'unknown';
      if (!topicBreakdown[t]) topicBreakdown[t] = { correct: 0, total: 0 };
      topicBreakdown[t].total++;
      if (posState.results[i]) topicBreakdown[t].correct++;
    });
    recordSession({ mode: 'position', score: correct, total: total, topicBreakdown: topicBreakdown });
  }

  setState({ screen: 'skillmap' });
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

function renderDashboard() {
  let mastery = loadMastery();
  let stats = typeof getStats !== 'undefined' ? getStats() : {};
  let readiness = getReadinessPercent();

  // Skill breakdown
  let skillRows = SKILL_DEFS.map(s => {
    let ms = mastery[s.id] || {};
    let status = ms.status || 'not_started';
    let total = ms.totalProblems || 0;
    let correct = ms.totalCorrect || 0;
    let accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
    let lastPracticed = ms.lastPracticed ? timeSince(new Date(ms.lastPracticed)) : 'Never';

    let statusLabel = status === 'mastered' ? 'Mastered' :
                      status === 'not_started' ? 'Not Started' :
                      status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    let statusClass = status === 'mastered' ? 'st-mastered' :
                      status === 'not_started' ? 'st-new' : 'st-learning';

    return `<tr>
      <td>${s.icon} ${s.name}</td>
      <td><span class="skill-status ${statusClass}" style="font-size:0.65rem;">${statusLabel}</span></td>
      <td>${total > 0 ? accuracy + '%' : '—'}</td>
      <td>${total}</td>
      <td>${lastPracticed}</td>
    </tr>`;
  }).join('');

  // Weekly activity (last 7 days)
  let weekDays = [];
  let now = new Date();
  for (let i = 6; i >= 0; i--) {
    let d = new Date(now);
    d.setDate(d.getDate() - i);
    let dayStr = d.toISOString().slice(0, 10);
    let sessions = stats.sessions ? stats.sessions.filter(s => s.date && s.date.slice(0, 10) === dayStr) : [];
    let problems = sessions.reduce((sum, s) => sum + (s.total || 0), 0);
    weekDays.push({ label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], problems: problems });
  }
  let maxProblems = Math.max(...weekDays.map(d => d.problems), 1);

  return `
    <div class="header">
      <h1>Progress Dashboard</h1>
      <p>Your learning journey</p>
    </div>
    <div class="practice-body" style="max-width:800px;">
      <div class="learn-header">
        <button class="learn-back" onclick="setState({screen:'skillmap'})">&larr; Back</button>
      </div>

      <div class="readiness-bar" style="margin-bottom:20px;">
        <div class="readiness-label">
          <span>Problems 1-20 Readiness</span>
          <span>${readiness}%</span>
        </div>
        <div class="readiness-track">
          <div class="readiness-fill" style="width:${readiness}%"></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;">
        <div class="dash-stat-card">
          <div class="dash-stat-val">${SKILL_DEFS.filter(s => mastery[s.id] && mastery[s.id].status === 'mastered').length}</div>
          <div class="dash-stat-label">Skills Mastered</div>
        </div>
        <div class="dash-stat-card">
          <div class="dash-stat-val">${SKILL_DEFS.filter(s => mastery[s.id] && ['learning','level_1','level_2','level_3'].includes(mastery[s.id].status)).length}</div>
          <div class="dash-stat-label">In Progress</div>
        </div>
        <div class="dash-stat-card">
          <div class="dash-stat-val">${stats.totalSessions || 0}</div>
          <div class="dash-stat-label">Total Sessions</div>
        </div>
        <div class="dash-stat-card">
          <div class="dash-stat-val">${stats.overallAccuracy || 0}%</div>
          <div class="dash-stat-label">Overall Accuracy</div>
        </div>
      </div>

      <div class="section-tag">This Week</div>
      <div class="week-chart">
        ${weekDays.map(d => `
          <div class="week-day">
            <div class="week-bar-wrap">
              <div class="week-bar" style="height:${Math.max(d.problems / maxProblems * 100, d.problems > 0 ? 8 : 0)}%"></div>
            </div>
            <div class="week-label">${d.label}</div>
            <div class="week-count">${d.problems || ''}</div>
          </div>
        `).join('')}
      </div>

      <div class="section-tag">Skill Breakdown</div>
      <div style="overflow-x:auto;">
        <table class="skill-table">
          <thead><tr><th>Skill</th><th>Status</th><th>Accuracy</th><th>Problems</th><th>Last Practiced</th></tr></thead>
          <tbody>${skillRows}</tbody>
        </table>
      </div>
    </div>`;
}

function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  let minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  let hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  let days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return days + 'd ago';
  return Math.floor(days / 7) + 'w ago';
}

// ── Attach listeners for learning screens ──

function attachLearnListeners() {
  // Auto-focus answer inputs
  let tryitInput = document.getElementById('tryit-ans');
  if (tryitInput) tryitInput.focus();

  let practiceInput = document.getElementById('practice-ans');
  if (practiceInput) practiceInput.focus();

  // Timed round button from skill map
  let timedBtn = document.getElementById('qa-timed');
  if (timedBtn) {
    timedBtn.onclick = () => {
      document.getElementById('time-modal') ?
        document.getElementById('time-modal').style.display = 'flex' :
        setState({ screen: 'menu' });
    };
  }
}

// Re-render now that all learning scripts are loaded
// (app.js renders before these scripts load, so the skillmap wasn't available)
if (typeof render !== 'undefined') render();
