# Documentation for Coaches & Developers

## Table of Contents
1. [For Coaches](#for-coaches)
2. [For Developers](#for-developers)
3. [Problem Structure](#problem-structure)
4. [Adding Content](#adding-content)
5. [Architecture Overview](#architecture-overview)

---

## For Coaches

### Understanding the Training Modes

**Drill Mode** (Best for beginners)
- Unlimited problems with instant feedback
- Shows hints on wrong answers
- Automatically refills problem queue
- No timer pressure
- Use this to build foundational skills

**Timed Rounds** (Intermediate practice)
- 20 problems from tier 1 (basics)
- Customizable time: 2:30 (real test pace) up to 10:00
- Good for building speed on fundamentals
- Student should aim for 18-20 correct in 2:30 before moving to full tests

**Full 80-Problem Simulation** (Advanced)
- Complete UIL format with proper sequencing
- 10 minutes total
- Mirrors actual test difficulty progression
- Use for final preparation and benchmarking

### Interpreting Results

**Seconds per Problem**
- <10 sec: Excellent (competitive level)
- 10-15 sec: Good progress
- >15 sec: Needs more drill work

**Accuracy**
- 90%+: Ready for tier advancement
- 70-90%: Continue drilling weak areas
- <70%: Focus on fundamentals, slow down

**Weakest Topic Callout**
- If 2+ errors in same topic, system highlights it
- Assign focused topic drills for that skill
- Don't advance until 85%+ accuracy on weak topics

### Recommended Training Path

**Week 1-2: Fundamentals**
- Drill Mode on: add, sub, mul, div, sq
- Target: 95% accuracy, <8 sec average
- 15-20 minutes daily

**Week 3-4: Speed Building**
- Timed Rounds starting at 5:00
- Gradually reduce to 2:30
- Introduction to trick drills (×11, ×25, squaring ÷5)

**Week 5-6: Advanced Topics**
- Topic drills on: pct, lcm, mean, series, rem
- Introduce tier 2 problems (21-40)
- Mix timed rounds with topic focus

**Week 7-8: Test Simulation**
- Full 80-problem tests 2-3x per week
- Review all mistakes using "How?" solution buttons
- Focus on time management and problem skipping strategy

**Competition Week**
- Light practice only (avoid burnout)
- One full simulation for confidence
- Review formula reference sheet

### Tips for Coaches

1. **Don't skip the basics** — students who can't nail problems 1-20 consistently will struggle on 21-80
2. **Use the "How?" button** — Make students explain the solution in their own words
3. **Track progress over time** — Screenshot or record weekly best scores
4. **Encourage pattern recognition** — The trick drills teach shortcuts that save seconds
5. **Simulate test conditions** — No calculator, timed, quiet environment

---

## For Developers

### Tech Stack
- **Pure vanilla JavaScript** — No frameworks, no build process
- **LocalStorage** — Client-side data persistence (coming soon)
- **CSS Grid & Flexbox** — Responsive layout
- **Mobile-first design** — Touch-optimized controls

### File Structure (Recommended)
```
uil-number-sense-trainer/
├── index.html           # Main app (currently all-in-one)
├── css/
│   └── styles.css       # Extract styles here
├── js/
│   ├── app.js          # Core application logic
│   ├── generators.js   # Problem generators
│   ├── data/
│   │   ├── real-problems.js  # UIL problem bank
│   │   └── topics.js         # Topic metadata
│   └── utils/
│       └── answer-matcher.js # Fraction/string comparison
├── docs/
│   ├── README.md
│   └── COACHES.md
└── tests/
    └── generator-tests.js
```

### Code Organization

**State Management**
- Single global `state` object
- `setState(patch)` updates and re-renders
- No framework needed for this scale

**Rendering**
- `renderMenu()`, `renderTest()`, `renderResults()`
- String-based HTML generation
- `attachListeners()` after each render

**Problem Generation**
- Generator functions return `{q, a, t, hint?, starred?}`
- `buildSequencedTest()` uses predefined sequences
- `buildTimedRound()` uses tier 1 sequence
- `buildBasicPool()` for drill modes

### Key Functions

```javascript
// Answer matching (handles fractions, decimals, complex numbers)
answerMatches(userInput, expectedAnswer, isStarred)

// Problem builders
buildSequencedTest()      // Full 80-problem test
buildTimedRound(count)    // Tier 1 problems
buildBasicPool(count, topicKey)  // Drill mode

// Solution hints (for learning)
getSolutionHint(question, answer, topic)
```

### Testing Generators

Every generator should:
1. Never return `undefined`, `null`, `NaN`, or `Infinity` as answer
2. Match answer type to input type (text input can't handle number-only keyboards for fractions)
3. Produce readable question text (no "x+-3" ugliness)
4. Include a hint for common student mistakes

**Test template:**
```javascript
for(let i=0; i<1000; i++){
  let p = GEN.yourGenerator();
  assert(p.a !== undefined);
  assert(typeof p.a === 'string' || typeof p.a === 'number');
  assert(!/\+-/.test(p.q));  // No ugly signs
}
```

---

## Problem Structure

### Problem Object Format
```javascript
{
  q: "23 × 17 =",           // Question text (string)
  a: 391,                    // Answer (number or string for fractions)
  t: "mul",                  // Topic key (matches TOPICS object)
  hint: "Use (20+3)(20-3)...", // Optional hint for wrong answers
  starred: false,            // Optional: ±5% tolerance
  num: 15,                   // Problem number (auto-assigned)
  source: "UIL 2023"         // Optional: where it came from
}
```

### Answer Types

**Numeric answers:**
```javascript
{q: "12 + 34 =", a: 46, t: "add"}
```

**Fraction answers (as strings):**
```javascript
{q: "25% = ?", a: "1/4", t: "fracdec"}
// User can type "1/4" or "0.25" (both accepted)
```

**Complex number answers:**
```javascript
{q: "(3+2i) + (1-i) =", a: "4+i", t: "complex"}
```

**Special handling:**
- Starred problems: `answerMatches()` allows ±5% tolerance
- Negative numbers: handled automatically
- Whitespace: normalized (spaces ignored)

---

## Adding Content

### Adding a Real UIL Problem

1. Add to `REAL_BASIC` array (for tier 1) or create `REAL_UPPER` arrays:
```javascript
const REAL_BASIC = [
  // ... existing problems
  {
    q: "18 × 24 =",
    a: 432,
    t: "mul",
    hint: "Break into (20-2)×24 = 480-48 = 432",
    source: "UIL 2025 District"
  }
];
```

2. Make sure `t` (topic) matches a key in `TOPICS` object
3. Add a helpful `hint` for students who get it wrong
4. Optionally add `source` for attribution

### Creating a New Generator

1. Pick the right generator tier (GEN, GEN2, GEN3, GEN4, GEN5)
2. Add function to appropriate object:

```javascript
const GEN2 = {
  // ... existing generators
  
  yourNewTopic: ()=>{
    // Generate random values
    let a = ri(1,10);  // Random integer 1-10
    let b = ri(2,20);
    
    // Compute answer
    let ans = a * b;
    
    // Return problem object
    return {
      q: `${a} × ${b} =`,
      a: ans,
      t: "yourTopic",
      hint: "Use mental math shortcut..."
    };
  }
};
```

3. Add topic metadata to `TOPICS`:
```javascript
const TOPICS = {
  // ... existing topics
  yourTopic: {
    name: "Your Topic Name",
    icon: "🔢",
    desc: "Brief description"
  }
};
```

4. Add to appropriate sequence array (SEQ_21_40, etc.)

### Adding Solution Hints

Edit `getSolutionHint()` function:
```javascript
function getSolutionHint(q, ans, topic){
  // ... existing logic
  
  if(topic === 'yourTopic'){
    return "Step-by-step explanation here...";
  }
  
  // ... rest
}
```

---

## Architecture Overview

### Application Flow

```
Menu Screen
  ↓ (user picks mode)
Test Screen
  ↓ (submit/skip until done)
Results Screen
  ↓ (retry or back to menu)
Menu Screen
```

### State Transitions

```javascript
// Menu → Test
startTimed(seconds)     // Timed round
startDrill()           // Drill mode
startTopicDrill(key)   // Topic drill
startFullTest()        // Full 80

// Test → Results
endTest()              // Called when done or time expires

// Results → Menu or Test
goMenu()               // Back to menu
// (retry button calls original start function)
```

### Data Flow

```
Generator → Problem Object → Test Array → State
                                          ↓
                                       Render
                                          ↓
                                    User Input
                                          ↓
                                    Validate
                                          ↓
                                  Update State
                                          ↓
                                    Re-render
```

### Mobile Considerations

**Input Handling**
- `inputmode="decimal"` for numeric answers
- `inputmode="text"` for fractions/strings
- Fraction slash helper button for mobile keyboards

**Touch Targets**
- Minimum 44×44px for all buttons
- Adequate spacing between clickable elements

**Viewport**
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Responsive layout adapts to screen size

---

## Common Tasks

### Change Problem Sequencing
Edit `SEQ_1_20`, `SEQ_21_40`, etc. arrays in the code.

### Adjust Time Limits
Edit the time picker modal options in `renderMenu()`.

### Modify Hint Aggressiveness
Change `TOPICS[key].hint` or generator `hint` fields.

### Add New Topic Drill
1. Add generator to appropriate GEN object
2. Add topic to TOPICS metadata
3. Add topic key to CORE_KEYS or TRICK_KEYS in renderMenu()

---

## Future Enhancements

See [improvement roadmap](../improvements.md) for:
- LocalStorage progress tracking
- User accounts & cloud sync
- AI-powered problem generation
- Multiplayer/social features
- Progressive Web App (offline mode)

---

**Questions?** Open an issue on GitHub or contact the maintainers.
