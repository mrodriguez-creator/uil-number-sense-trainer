// ═══════════════════════════════════════════════════════════════════════════
// TUTORIAL CONTENT — Step-by-step mental math technique tutorials
// Each skill has: title, intro, keyPatterns, steps (with examples), tryIt problems
// ═══════════════════════════════════════════════════════════════════════════

const TUTORIALS = {

  // ── 1. MULTIPLY BY 11 ──
  mul11: {
    title: 'The ×11 Trick',
    intro: 'Multiplying by 11 is one of the fastest tricks in Number Sense. Instead of doing long multiplication, you can get the answer almost instantly by adding adjacent digits and inserting the results.',
    position: '7-8',
    keyPatterns: [
      'Look for "× 11" or "× 11 =" in the problem',
      'Works with any number — 2-digit, 3-digit, or larger',
      'The key is adding pairs of adjacent digits'
    ],
    steps: [
      {
        title: 'The Basic Rule (2-digit)',
        text: 'For a 2-digit number like <span class="highlight">AB × 11</span>: Write A, then (A+B), then B. The middle digit is the sum of the two digits.',
        example: {
          problem: '34 × 11 = ?',
          steps: [
            { text: 'Write the first digit', result: '3' },
            { text: 'Add the two digits: 3 + 4', result: '7' },
            { text: 'Write the last digit', result: '4' },
            { text: 'Read the answer', result: '374' }
          ]
        }
      },
      {
        title: 'When the Sum is 10 or More',
        text: 'If the digit sum is 10 or more, you carry the 1 to the left — just like regular addition. This is the only tricky part!',
        example: {
          problem: '67 × 11 = ?',
          steps: [
            { text: 'Add digits: 6 + 7 = 13', result: '13' },
            { text: 'Write 3 in the middle, carry 1 to the left', result: '_3_' },
            { text: 'First digit: 6 + 1 (carry) = 7', result: '7' },
            { text: 'Last digit stays: 7', result: '7' },
            { text: 'Answer', result: '737' }
          ]
        }
      },
      {
        title: '3-Digit Numbers',
        text: 'For 3-digit numbers like <span class="highlight">ABC × 11</span>: Write A, then (A+B), then (B+C), then C. Work right to left and carry as needed.',
        example: {
          problem: '234 × 11 = ?',
          steps: [
            { text: 'Last digit: 4', result: '4' },
            { text: '3 + 4 = 7', result: '74' },
            { text: '2 + 3 = 5', result: '574' },
            { text: 'First digit: 2', result: '2574' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '23 × 11 =', a: 253, walkthrough: '2_(2+3)_3 = 2_5_3 = 253' },
      { q: '45 × 11 =', a: 495, walkthrough: '4_(4+5)_5 = 4_9_5 = 495' },
      { q: '78 × 11 =', a: 858, walkthrough: '7+8=15, carry 1: (7+1)_5_8 = 858' }
    ]
  },

  // ── 2. MULTIPLY BY 25/75 ──
  mul25: {
    title: 'The ×25 Shortcut',
    intro: 'Since 25 = 100/4, multiplying by 25 is the same as dividing by 4 and multiplying by 100. This turns a hard multiplication into an easy division!',
    position: '7-8',
    keyPatterns: [
      'Look for "× 25" in the problem',
      'Also works for ×75 (multiply by 3, then ×25)',
      'Key insight: 25 = 100 ÷ 4'
    ],
    steps: [
      {
        title: 'The Core Trick',
        text: 'To multiply by 25: <span class="highlight">divide the number by 4</span>, then <span class="highlight">multiply by 100</span> (add two zeros). If there\'s a remainder from the division, handle it as 25s.',
        example: {
          problem: '48 × 25 = ?',
          steps: [
            { text: 'Divide by 4: 48 ÷ 4', result: '12' },
            { text: 'Multiply by 100: 12 × 100', result: '1200' }
          ]
        }
      },
      {
        title: 'When It Doesn\'t Divide Evenly',
        text: 'If dividing by 4 gives a remainder, each remainder unit is worth 25. Remainder 1 = +25, Remainder 2 = +50, Remainder 3 = +75.',
        example: {
          problem: '37 × 25 = ?',
          steps: [
            { text: 'Divide by 4: 37 ÷ 4 = 9 remainder 1', result: '9 R1' },
            { text: '9 × 100 = 900', result: '900' },
            { text: 'Remainder 1 × 25 = 25', result: '+25' },
            { text: 'Answer: 900 + 25', result: '925' }
          ]
        }
      },
      {
        title: 'Multiply by 75',
        text: 'For ×75: multiply by 3 first, then use the ×25 trick. Since 75 = 3 × 25, this works perfectly.',
        example: {
          problem: '16 × 75 = ?',
          steps: [
            { text: 'Multiply by 3: 16 × 3 = 48', result: '48' },
            { text: 'Now ×25: 48 ÷ 4 = 12', result: '12' },
            { text: 'Multiply by 100', result: '1200' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '32 × 25 =', a: 800, walkthrough: '32 ÷ 4 = 8, × 100 = 800' },
      { q: '56 × 25 =', a: 1400, walkthrough: '56 ÷ 4 = 14, × 100 = 1400' },
      { q: '22 × 25 =', a: 550, walkthrough: '22 ÷ 4 = 5 R2, 500 + 50 = 550' }
    ]
  },

  // ── 3. NEAR-100 MULTIPLICATION ──
  near100: {
    title: 'Near-100 Multiplication',
    intro: 'When both numbers are close to 100, there\'s a lightning-fast shortcut. Instead of multiplying two big numbers, you work with how far each is from 100.',
    position: '7-8',
    keyPatterns: [
      'Both numbers are close to 100 (usually 85-115)',
      'Look for products like 97 × 94 or 103 × 106',
      'Works for numbers above AND below 100'
    ],
    steps: [
      {
        title: 'Both Numbers Below 100',
        text: 'Find each number\'s deficit from 100. Cross-subtract (either number minus the other\'s deficit) for the first part. Multiply the deficits for the last two digits.',
        example: {
          problem: '97 × 94 = ?',
          steps: [
            { text: 'Deficits: 97 is 3 below, 94 is 6 below', result: '−3, −6' },
            { text: 'Cross-subtract: 97 − 6 = 91 (or 94 − 3 = 91)', result: '91__' },
            { text: 'Multiply deficits: 3 × 6 = 18', result: '__18' },
            { text: 'Combine', result: '9118' }
          ]
        }
      },
      {
        title: 'Both Numbers Above 100',
        text: 'Find each excess over 100. Cross-add (either number plus the other\'s excess) for the first part. Multiply excesses for last two digits.',
        example: {
          problem: '103 × 106 = ?',
          steps: [
            { text: 'Excesses: 103 is +3, 106 is +6', result: '+3, +6' },
            { text: 'Cross-add: 103 + 6 = 109', result: '109__' },
            { text: 'Multiply excesses: 3 × 6 = 18', result: '__18' },
            { text: 'Combine', result: '10918' }
          ]
        }
      },
      {
        title: 'One Above, One Below',
        text: 'Cross-subtract/add as before. For the last part, multiply deficit × excess and <span class="highlight">subtract</span> from the first part (since one is negative).',
        example: {
          problem: '97 × 104 = ?',
          steps: [
            { text: 'Deficit/excess: 97 is −3, 104 is +4', result: '−3, +4' },
            { text: 'Cross-add: 97 + 4 = 101', result: '101__' },
            { text: 'Product: 3 × 4 = 12', result: '12' },
            { text: '10100 − 12', result: '10088' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '96 × 95 =', a: 9120, walkthrough: 'Deficits: 4, 5. Cross: 96−5=91. Product: 4×5=20. Answer: 9120' },
      { q: '98 × 97 =', a: 9506, walkthrough: 'Deficits: 2, 3. Cross: 98−3=95. Product: 2×3=06. Answer: 9506' },
      { q: '102 × 105 =', a: 10710, walkthrough: 'Excesses: 2, 5. Cross: 102+5=107. Product: 2×5=10. Answer: 10710' }
    ]
  },

  // ── 4. SQUARES ENDING IN 5 ──
  sq5: {
    title: 'Squaring Numbers Ending in 5',
    intro: 'Any number ending in 5 can be squared instantly. The last two digits are always 25, and the leading digits come from a simple multiplication.',
    position: '7-8',
    keyPatterns: [
      'The number ends in 5 (15, 25, 35, 45, ... 95, 105, ...)',
      'Look for "²" or "squared" with a number ending in 5',
      'Answer always ends in 25'
    ],
    steps: [
      {
        title: 'The Rule',
        text: 'For a number ending in 5, like N5: Take the digit(s) before the 5 (call it n). Multiply n × (n+1). Append 25. That\'s your answer!',
        example: {
          problem: '35² = ?',
          steps: [
            { text: 'Digit before 5: n = 3', result: '3' },
            { text: 'Multiply n × (n+1): 3 × 4', result: '12' },
            { text: 'Append 25', result: '1225' }
          ]
        }
      },
      {
        title: 'Larger Numbers',
        text: 'This works for any size number. For 65², n = 6, so 6 × 7 = 42, append 25 → 4225. For 115², n = 11, so 11 × 12 = 132, append 25 → 13225.',
        example: {
          problem: '85² = ?',
          steps: [
            { text: 'Digit before 5: n = 8', result: '8' },
            { text: 'Multiply: 8 × 9', result: '72' },
            { text: 'Append 25', result: '7225' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '25² =', a: 625, walkthrough: '2 × 3 = 6, append 25 → 625' },
      { q: '45² =', a: 2025, walkthrough: '4 × 5 = 20, append 25 → 2025' },
      { q: '75² =', a: 5625, walkthrough: '7 × 8 = 56, append 25 → 5625' }
    ]
  },

  // ── 5. SQUARES (GENERAL) ──
  sq: {
    title: 'Squaring Numbers Quickly',
    intro: 'Squaring numbers is a core UIL skill. You should memorize squares up to 30, but there are also tricks for computing larger squares mentally.',
    position: '9',
    keyPatterns: [
      'Look for "²" or "squared" after a number',
      'Numbers 10-80 appear most often',
      'Memorize up to 30²; use tricks for the rest'
    ],
    steps: [
      {
        title: 'Memorize the Basics (10-30)',
        text: 'For speed, memorize these: 10²=100, 11²=121, 12²=144, 13²=169, 14²=196, 15²=225, 16²=256, 17²=289, 18²=324, 19²=361, 20²=400, 21²=441, 22²=484, 23²=529, 24²=576, 25²=625, 26²=676, 27²=729, 28²=784, 29²=841, 30²=900.',
        example: {
          problem: '23² = ?',
          steps: [
            { text: 'Recall from memory', result: '529' }
          ]
        }
      },
      {
        title: 'Near a Known Square',
        text: 'For numbers near a known square, use: <span class="highlight">(a+b)² = a² + 2ab + b²</span>. Example: 32² = 30² + 2(30)(2) + 4 = 900 + 120 + 4.',
        example: {
          problem: '32² = ?',
          steps: [
            { text: 'Closest known: 30² = 900', result: '900' },
            { text: 'Difference: b = 2', result: '+2' },
            { text: '2ab = 2 × 30 × 2 = 120', result: '+120' },
            { text: 'b² = 4', result: '+4' },
            { text: 'Total: 900 + 120 + 4', result: '1024' }
          ]
        }
      },
      {
        title: 'The Equidistant Trick',
        text: 'If a number is near a round number, use: <span class="highlight">n² = (n-d)(n+d) + d²</span>. Pick d so one factor is easy to multiply.',
        example: {
          problem: '48² = ?',
          steps: [
            { text: 'Use d=2: (48-2)(48+2) + 4', result: '46 × 50 + 4' },
            { text: '46 × 50 = 2300', result: '2300' },
            { text: '2300 + 4', result: '2304' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '19² =', a: 361, walkthrough: 'Memorized: 19² = 361' },
      { q: '31² =', a: 961, walkthrough: '30² + 2(30)(1) + 1 = 900 + 60 + 1 = 961' },
      { q: '42² =', a: 1764, walkthrough: '40×44 + 4 = 1760 + 4 = 1764 (equidistant trick, d=2)' }
    ]
  },

  // ── 6. FRACTIONS, DECIMALS & PERCENTAGES ──
  fracdec: {
    title: 'Fractions, Decimals & Percents',
    intro: 'UIL tests frequently ask you to convert between fractions, decimals, and percentages. The key is memorizing the common conversions and knowing the formulas for the rest.',
    position: '12, 16',
    keyPatterns: [
      'Problems asking to convert fractions to decimals or vice versa',
      '"What percent" or "% of" questions',
      'Comparing fractions and decimals'
    ],
    steps: [
      {
        title: 'Must-Know Conversions',
        text: 'Memorize these: <span class="highlight">1/2=0.5=50%</span>, 1/3≈0.333=33⅓%, 1/4=0.25=25%, 1/5=0.2=20%, 1/6≈0.167=16⅔%, 1/8=0.125=12.5%, 3/8=0.375=37.5%, 5/8=0.625=62.5%, 7/8=0.875=87.5%.',
        example: {
          problem: '3/8 as a decimal = ?',
          steps: [
            { text: 'Recall: 1/8 = 0.125', result: '0.125' },
            { text: '3 × 0.125', result: '0.375' }
          ]
        }
      },
      {
        title: 'The Percent Formula',
        text: 'For percentage problems: <span class="highlight">Part = Percent × Whole</span> or equivalently Part/Whole = Percent/100. Rearrange to find whichever is missing.',
        example: {
          problem: '20% of 150 = ?',
          steps: [
            { text: '20% = 0.2 or 1/5', result: '1/5' },
            { text: '150 ÷ 5', result: '30' }
          ]
        }
      },
      {
        title: 'Converting Repeating Decimals',
        text: 'For repeating decimals: 0.333... = 1/3, 0.666... = 2/3, 0.1666... = 1/6, 0.8333... = 5/6, 0.142857... = 1/7.',
        example: {
          problem: '0.625 as a fraction = ?',
          steps: [
            { text: 'Recognize: 0.625 = 5/8', result: '5/8' },
            { text: '(Or: 625/1000 = 5/8 after dividing by 125)', result: '5/8' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '1/8 as a decimal =', a: '0.125', walkthrough: 'Memorized: 1/8 = 0.125' },
      { q: '25% of 84 =', a: 21, walkthrough: '25% = 1/4, so 84 ÷ 4 = 21' },
      { q: '0.375 as a fraction =', a: '3/8', walkthrough: 'Memorized: 0.375 = 3/8' }
    ]
  },

  // ── 7. REMAINDERS ──
  rem: {
    title: 'Finding Remainders Fast',
    intro: 'Remainder problems appear at position 19 on UIL tests. You don\'t need to do the full division — there are digit tricks that give you the remainder instantly.',
    position: '19',
    keyPatterns: [
      'Look for "remainder" or "÷ N remainder?"',
      'Most common divisors: 3, 4, 6, 9',
      'Use casting-out-digits for ÷3 and ÷9'
    ],
    steps: [
      {
        title: 'Remainder by 3 or 9 (Digit Sum)',
        text: 'To find the remainder when dividing by 3 or 9: <span class="highlight">add up all the digits</span>. Keep adding until you get a single digit. The remainder when dividing by 9 is that digit (or 0 if it\'s 9). For ÷3, take that result mod 3.',
        example: {
          problem: '247531 ÷ 9 remainder?',
          steps: [
            { text: 'Sum digits: 2+4+7+5+3+1 = 22', result: '22' },
            { text: 'Sum again: 2+2 = 4', result: '4' },
            { text: 'Remainder is 4', result: '4' }
          ]
        }
      },
      {
        title: 'Remainder by 4 (Last Two Digits)',
        text: 'For ÷4: <span class="highlight">only look at the last two digits</span>. Divide those by 4 to get the remainder. The hundreds, thousands, etc. don\'t matter because 100 is divisible by 4.',
        example: {
          problem: '93847 ÷ 4 remainder?',
          steps: [
            { text: 'Last two digits: 47', result: '47' },
            { text: '47 ÷ 4 = 11 remainder 3', result: 'R3' },
            { text: 'Remainder is 3', result: '3' }
          ]
        }
      },
      {
        title: 'Remainder by 6',
        text: 'For ÷6: A number\'s remainder by 6 depends on its remainders by 2 and 3. If the number is odd, the remainder is (digit-sum mod 3) + 3 if it\'s less than 3, or (digit-sum mod 3) otherwise. Simpler: just find remainder by 3 first, then check if the number is even/odd.',
        example: {
          problem: '2461 ÷ 6 remainder?',
          steps: [
            { text: 'Digit sum: 2+4+6+1 = 13, 1+3 = 4', result: '4' },
            { text: 'Remainder by 3: 4 mod 3 = 1', result: '1' },
            { text: 'Number is odd, so remainder by 6: need to check more', result: '' },
            { text: '2461 = 410×6 + 1, so remainder is 1', result: '1' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '12345 ÷ 9 remainder?', a: 6, walkthrough: 'Digits: 1+2+3+4+5=15, 1+5=6. Remainder = 6' },
      { q: '98765 ÷ 4 remainder?', a: 1, walkthrough: 'Last two digits: 65. 65÷4=16 R1. Remainder = 1' },
      { q: '333333 ÷ 9 remainder?', a: 0, walkthrough: 'Digits: 3+3+3+3+3+3=18, 1+8=9. Remainder = 0' }
    ]
  },

  // ── 8. SERIES & SEQUENCES ──
  series: {
    title: 'Series & Sequence Sums',
    intro: 'Series problems ask you to find the sum of a sequence of numbers. The most important formula is for adding consecutive integers: n(n+1)/2. This appears at position 18 on UIL tests.',
    position: '18',
    keyPatterns: [
      '"1 + 2 + 3 + ... + n" pattern',
      'Sum of first n odd or even numbers',
      'Arithmetic series with a pattern (2, 5, 8, 11, ...)'
    ],
    steps: [
      {
        title: 'Sum of 1 to n',
        text: 'The sum 1 + 2 + 3 + ... + n = <span class="highlight">n(n+1)/2</span>. This is the most important formula. Example: 1+2+...+100 = 100×101/2 = 5050.',
        example: {
          problem: '1 + 2 + 3 + ... + 50 = ?',
          steps: [
            { text: 'Use formula: n(n+1)/2', result: '50×51/2' },
            { text: '50 × 51 = 2550', result: '2550' },
            { text: '2550 ÷ 2', result: '1275' }
          ]
        }
      },
      {
        title: 'Sum of First n Odd Numbers',
        text: 'The sum of the first n odd numbers (1, 3, 5, 7, ...) = <span class="highlight">n²</span>. That\'s it! First 5 odd: 1+3+5+7+9 = 25 = 5².',
        example: {
          problem: 'Sum of first 8 odd numbers = ?',
          steps: [
            { text: 'First 8 odd: 1,3,5,7,9,11,13,15', result: '' },
            { text: 'Formula: n² = 8²', result: '64' }
          ]
        }
      },
      {
        title: 'Arithmetic Series (General)',
        text: 'For any arithmetic series (constant difference): Sum = <span class="highlight">(number of terms) × (first + last) / 2</span>. Count the terms carefully!',
        example: {
          problem: '3 + 7 + 11 + 15 + 19 = ?',
          steps: [
            { text: 'Count terms: 5 terms', result: '5' },
            { text: 'First = 3, Last = 19', result: '' },
            { text: 'Sum = 5 × (3+19)/2 = 5 × 11', result: '55' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '1 + 2 + 3 + ... + 20 =', a: 210, walkthrough: '20 × 21 / 2 = 210' },
      { q: 'Sum of first 6 odd numbers =', a: 36, walkthrough: '6² = 36' },
      { q: '2 + 4 + 6 + 8 + 10 =', a: 30, walkthrough: '5 terms, (2+10)/2 × 5 = 6 × 5 = 30' }
    ]
  },

  // ── 9. LCM & GCD ──
  lcm: {
    title: 'LCM and GCD',
    intro: 'LCM (Least Common Multiple) and GCD (Greatest Common Divisor) problems appear at position 15. The fastest method is prime factorization, but for common pairs you should memorize the answers.',
    position: '15',
    keyPatterns: [
      '"The LCM of A and B =" or "The GCD of A and B ="',
      'GCD is the largest number that divides both evenly',
      'LCM is the smallest number both divide into evenly'
    ],
    steps: [
      {
        title: 'Prime Factorization Method',
        text: 'Break each number into prime factors. <span class="highlight">GCD = product of shared prime factors (lowest powers)</span>. <span class="highlight">LCM = product of all prime factors (highest powers)</span>.',
        example: {
          problem: 'GCD and LCM of 12 and 18?',
          steps: [
            { text: '12 = 2² × 3', result: '2²×3' },
            { text: '18 = 2 × 3²', result: '2×3²' },
            { text: 'GCD: shared primes, lowest powers = 2¹ × 3¹', result: '6' },
            { text: 'LCM: all primes, highest powers = 2² × 3²', result: '36' }
          ]
        }
      },
      {
        title: 'The Shortcut Formula',
        text: 'If you know the GCD, you can find the LCM: <span class="highlight">LCM(a,b) = a × b / GCD(a,b)</span>. This saves time when one is easier to find than the other.',
        example: {
          problem: 'LCM of 15 and 20 = ?',
          steps: [
            { text: 'GCD: largest divisor of both = 5', result: '5' },
            { text: 'LCM = 15 × 20 / 5 = 300/5', result: '60' }
          ]
        }
      }
    ],
    tryIt: [
      { q: 'The GCD of 24 and 36 =', a: 12, walkthrough: '24=2³×3, 36=2²×3². GCD=2²×3=12' },
      { q: 'The LCM of 8 and 12 =', a: 24, walkthrough: 'GCD=4. LCM=8×12/4=24' },
      { q: 'The GCD of 56 and 84 =', a: 28, walkthrough: '56=2³×7, 84=2²×3×7. GCD=2²×7=28' }
    ]
  },

  // ── 10. DIVISION ──
  div: {
    title: 'Division Strategies',
    intro: 'Division problems at position 11 always have clean (integer) answers. The key is recognizing divisibility patterns and using factor shortcuts to divide quickly.',
    position: '11',
    keyPatterns: [
      'Look for "÷" followed by a number',
      'The answer is always a whole number',
      'Common divisors: 3-9, 11, 12, 13, 15, 17, 19, 23, 25'
    ],
    steps: [
      {
        title: 'Divide by Small Numbers',
        text: 'For ÷2, ÷3, ÷4, ÷5: use standard long division or chunking. For ÷5: double the number and move the decimal (multiply by 2, divide by 10). For ÷4: halve twice.',
        example: {
          problem: '4692 ÷ 12 = ?',
          steps: [
            { text: 'Break into chunks: 4692 = 4800 − 108', result: '' },
            { text: '4800 ÷ 12 = 400', result: '400' },
            { text: '108 ÷ 12 = 9', result: '9' },
            { text: '400 − 9', result: '391' }
          ]
        }
      },
      {
        title: 'Divide by 25',
        text: 'For ÷25: <span class="highlight">multiply by 4, then divide by 100</span> (drop two zeros). Since 25 × 4 = 100.',
        example: {
          problem: '1575 ÷ 25 = ?',
          steps: [
            { text: 'Multiply by 4: 1575 × 4', result: '6300' },
            { text: 'Divide by 100 (drop two zeros)', result: '63' }
          ]
        }
      },
      {
        title: 'Factor Recognition',
        text: 'For harder divisors (13, 17, 19, 23), look for the answer being a familiar number. If you know 13 × 14 = 182, then 182 ÷ 13 = 14 instantly.',
        example: {
          problem: '391 ÷ 17 = ?',
          steps: [
            { text: 'Try: 17 × 20 = 340', result: '340' },
            { text: '391 − 340 = 51', result: '51' },
            { text: '51 ÷ 17 = 3', result: '3' },
            { text: '20 + 3', result: '23' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '225 ÷ 9 =', a: 25, walkthrough: '9 × 25 = 225, or chunk: 180÷9=20, 45÷9=5, 20+5=25' },
      { q: '750 ÷ 25 =', a: 30, walkthrough: '750 × 4 = 3000, ÷ 100 = 30' },
      { q: '336 ÷ 12 =', a: 28, walkthrough: '12 × 28: 12×30=360, 360−24=336, so answer is 28' }
    ]
  },

  // ── ADDITIONAL SKILLS (simpler tutorials) ──

  add: {
    title: 'Mental Addition',
    intro: 'Addition appears at positions 1 and 3 on UIL tests. The key to speed is working left-to-right (not right-to-left like on paper) and using rounding tricks.',
    position: '1, 3',
    keyPatterns: [
      'Large numbers being added together',
      'Look for opportunities to round to the nearest 10 or 100'
    ],
    steps: [
      {
        title: 'Left-to-Right Addition',
        text: 'Add the largest place values first, then adjust. For 347 + 286: 300+200=500, 40+80=120, 7+6=13. Total: 500+120+13=633.',
        example: {
          problem: '2847 + 1365 = ?',
          steps: [
            { text: 'Thousands: 2000 + 1000', result: '3000' },
            { text: 'Hundreds: 800 + 300', result: '+1100' },
            { text: 'Tens: 40 + 60', result: '+100' },
            { text: 'Ones: 7 + 5', result: '+12' },
            { text: 'Total', result: '4212' }
          ]
        }
      },
      {
        title: 'Rounding Trick',
        text: 'If one number is near a round number, round it up, add, then subtract the difference. Example: 456 + 98 = 456 + 100 − 2 = 554.',
        example: {
          problem: '1247 + 998 = ?',
          steps: [
            { text: 'Round 998 up to 1000', result: '1000' },
            { text: '1247 + 1000 = 2247', result: '2247' },
            { text: 'Subtract the extra 2', result: '2245' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '456 + 327 =', a: 783, walkthrough: '400+300=700, 50+20=70, 6+7=13. Total: 783' },
      { q: '1500 + 2750 =', a: 4250, walkthrough: '1500 + 2750 = 4250' },
      { q: '895 + 207 =', a: 1102, walkthrough: '900+207=1107, subtract 5 → 1102' }
    ]
  },

  sub: {
    title: 'Mental Subtraction',
    intro: 'Subtraction appears at positions 2 and 3. The complement method and left-to-right strategies make these problems fast.',
    position: '2, 3',
    keyPatterns: [
      'Large numbers being subtracted',
      'Look for numbers near round values for shortcuts'
    ],
    steps: [
      {
        title: 'Left-to-Right Subtraction',
        text: 'Subtract place by place from left to right. Borrow as needed. For 5000-level problems, try subtracting from the larger rounded number first.',
        example: {
          problem: '6834 − 2517 = ?',
          steps: [
            { text: 'Thousands: 6000 − 2000', result: '4000' },
            { text: 'Hundreds: 800 − 500', result: '+300' },
            { text: 'Tens: 30 − 10', result: '+20' },
            { text: 'Ones: 4 − 7 = −3 (borrow)', result: '−3' },
            { text: 'Total: 4320 − 3', result: '4317' }
          ]
        }
      },
      {
        title: 'Complement Method',
        text: 'When subtracting near a round number: 5000 − 1997 = 5000 − 2000 + 3 = 3003.',
        example: {
          problem: '10000 − 6543 = ?',
          steps: [
            { text: 'Complement each digit from 9 (last from 10)', result: '' },
            { text: '9-6=3, 9-5=4, 9-4=5, 10-3=7', result: '3457' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '5000 − 1234 =', a: 3766, walkthrough: 'Complement: 9-1=8→3, 9-2=7, 9-3=6, 10-4=6 → 3766' },
      { q: '8475 − 3250 =', a: 5225, walkthrough: '8000-3000=5000, 475-250=225 → 5225' },
      { q: '10000 − 4567 =', a: 5433, walkthrough: 'Complement: 5,4,3,3 → 5433' }
    ]
  },

  mul: {
    title: 'Multiplication Strategies',
    intro: 'Multiplication at positions 4-5 is about breaking numbers apart. Use the distributive property to turn hard multiplications into easy ones.',
    position: '4, 5',
    keyPatterns: [
      '2-digit × 2-digit or 2-digit × 3-digit',
      'Look for one number being close to a round number',
      'Break the smaller number apart'
    ],
    steps: [
      {
        title: 'Break-Apart Method',
        text: 'Split one number into parts: 23 × 47 = 23 × 50 − 23 × 3 = 1150 − 69 = 1081. Or: 23 × 47 = 20×47 + 3×47 = 940 + 141 = 1081.',
        example: {
          problem: '34 × 27 = ?',
          steps: [
            { text: 'Break 27 = 30 − 3', result: '' },
            { text: '34 × 30 = 1020', result: '1020' },
            { text: '34 × 3 = 102', result: '102' },
            { text: '1020 − 102', result: '918' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '15 × 16 =', a: 240, walkthrough: '15×16 = 15×(20-4) = 300−60 = 240' },
      { q: '25 × 32 =', a: 800, walkthrough: '25×32 = 25×4×8 = 100×8 = 800' },
      { q: '43 × 12 =', a: 516, walkthrough: '43×12 = 43×10 + 43×2 = 430+86 = 516' }
    ]
  },

  ops: {
    title: 'Order of Operations (PEMDAS)',
    intro: 'Order of operations problems test whether you correctly apply PEMDAS: Parentheses, Exponents, Multiply/Divide (left to right), Add/Subtract (left to right).',
    position: '5, 6',
    keyPatterns: [
      'Multiple operations in one expression',
      'Watch for multiplication before addition',
      'Left to right within the same precedence level'
    ],
    steps: [
      {
        title: 'The PEMDAS Rule',
        text: 'Do operations in this order: <span class="highlight">P</span>arentheses first, then <span class="highlight">E</span>xponents, then <span class="highlight">M</span>ultiply/<span class="highlight">D</span>ivide (left to right), then <span class="highlight">A</span>dd/<span class="highlight">S</span>ubtract (left to right).',
        example: {
          problem: '12 × 5 + 8 × 3 − 10 = ?',
          steps: [
            { text: 'Multiplications first: 12×5=60, 8×3=24', result: '60, 24' },
            { text: 'Now add/subtract left to right: 60+24−10', result: '' },
            { text: '60 + 24 = 84', result: '84' },
            { text: '84 − 10', result: '74' }
          ]
        }
      }
    ],
    tryIt: [
      { q: '6 × 7 + 3 =', a: 45, walkthrough: '6×7=42, 42+3=45' },
      { q: '15 × 4 − 20 =', a: 40, walkthrough: '15×4=60, 60−20=40' },
      { q: '8 + 5 × 9 =', a: 53, walkthrough: '5×9=45 first, then 8+45=53' }
    ]
  },

  mean: {
    title: 'Arithmetic Mean (Average)',
    intro: 'Mean problems ask for the average of a set of numbers. Add them all up and divide by the count. The balancing method can speed this up.',
    position: '17',
    keyPatterns: [
      '"The arithmetic mean of..." or "average of..."',
      'Usually 2-5 numbers to average',
      'The answer might be a decimal or fraction'
    ],
    steps: [
      {
        title: 'Add and Divide',
        text: 'Mean = sum of all values ÷ number of values. For 3, 7, 14: sum = 24, count = 3, mean = 8.',
        example: {
          problem: 'The arithmetic mean of 12, 18, 24, 6 = ?',
          steps: [
            { text: 'Sum: 12+18+24+6 = 60', result: '60' },
            { text: 'Count: 4 numbers', result: '4' },
            { text: '60 ÷ 4', result: '15' }
          ]
        }
      },
      {
        title: 'Balancing Method',
        text: 'Pick a guess for the mean. Find how far each number is from your guess. Average those differences and adjust. Useful when numbers are close together.',
        example: {
          problem: 'Mean of 48, 52, 47, 53 = ?',
          steps: [
            { text: 'Guess: 50', result: '50' },
            { text: 'Differences: −2, +2, −3, +3 = 0', result: '0' },
            { text: 'Mean = 50 + 0', result: '50' }
          ]
        }
      }
    ],
    tryIt: [
      { q: 'The arithmetic mean of 10, 20, 30 =', a: 20, walkthrough: '(10+20+30)/3 = 60/3 = 20' },
      { q: 'The arithmetic mean of 5, 15 =', a: 10, walkthrough: '(5+15)/2 = 20/2 = 10' },
      { q: 'The arithmetic mean of 8, 12, 16, 4 =', a: 10, walkthrough: '(8+12+16+4)/4 = 40/4 = 10' }
    ]
  },
};
