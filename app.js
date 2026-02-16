// ═══════════════════════════════════════════════════════════════════════════
// BUILT-IN REAL UIL PROBLEMS (2,969 auto-cleaned from 2019-2026 tests)
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS TRACKING SYSTEM (LocalStorage)
// ═══════════════════════════════════════════════════════════════════════════

function loadStats(){
  try{
    let raw = localStorage.getItem('uilNsStats');
    return raw ? JSON.parse(raw) : {sessions:[], topicStats:{}, firstUse:new Date().toISOString()};
  }catch(e){
    console.error('Failed to load stats:', e);
    return {sessions:[], topicStats:{}, firstUse:new Date().toISOString()};
  }
}

function saveStats(stats){
  try{
    localStorage.setItem('uilNsStats', JSON.stringify(stats));
    return true;
  }catch(e){
    console.error('Failed to save stats:', e);
    return false;
  }
}

function recordSession(sessionData){
  let stats = loadStats();
  
  // Add new session
  let session = {
    date: new Date().toISOString(),
    mode: sessionData.mode,
    score: sessionData.score,
    total: sessionData.total,
    timeUsed: sessionData.timeUsed || 0,
    secondsPerProblem: sessionData.timeUsed && sessionData.total > 0 ? Math.round(sessionData.timeUsed / sessionData.total * 10) / 10 : null,
    topics: sessionData.topicBreakdown || {}
  };
  
  stats.sessions.push(session);
  
  // Keep last 200 sessions only
  if(stats.sessions.length > 200){
    stats.sessions = stats.sessions.slice(-200);
  }
  
  // Update per-topic cumulative stats
  Object.entries(session.topics).forEach(([topic, data]) => {
    if(!stats.topicStats[topic]){
      stats.topicStats[topic] = {correct:0, total:0, lastPracticed:session.date};
    }
    stats.topicStats[topic].correct += data.correct || 0;
    stats.topicStats[topic].total += data.total || 0;
    stats.topicStats[topic].lastPracticed = session.date;
  });
  
  saveStats(stats);
  return stats;
}

function getTopicBreakdown(answered){
  let breakdown = {};
  answered.forEach(item => {
    let topic = item.t || 'unknown';
    if(!breakdown[topic]) breakdown[topic] = {correct:0, total:0};
    breakdown[topic].total++;
    if(item.correct) breakdown[topic].correct++;
  });
  return breakdown;
}

function getStats(){
  let stats = loadStats();
  
  // Calculate derived stats
  let totalSessions = stats.sessions.length;
  let totalProblems = stats.sessions.reduce((sum, s) => sum + s.total, 0);
  let totalCorrect = stats.sessions.reduce((sum, s) => sum + s.score, 0);
  let overallAccuracy = totalProblems > 0 ? Math.round(totalCorrect / totalProblems * 100) : 0;
  
  // Recent performance (last 10 sessions)
  let recent = stats.sessions.slice(-10);
  let recentTotal = recent.reduce((sum, s) => sum + s.total, 0);
  let recentAccuracy = recent.length > 0 && recentTotal > 0 ? 
    Math.round(recent.reduce((sum, s) => sum + s.score, 0) / recentTotal * 100) : 0;
  
  // Personal bests
  let bestScore = stats.sessions.reduce((best, s) => {
    if(s.mode === 'timed20' && s.total === 20){
      return s.score > best.score ? s : best;
    }
    return best;
  }, {score:0, date:null});
  
  let bestFullTest = stats.sessions.reduce((best, s) => {
    if(s.mode === 'full' && s.total === 80){
      return s.score > best.score ? s : best;
    }
    return best;
  }, {score:0, date:null});
  
  // Streak calculation (days with at least 1 session)
  let streak = 0;
  if(stats.sessions.length > 0){
    let today = new Date();
    today.setHours(0,0,0,0);
    let sessionDates = [...new Set(stats.sessions.map(s => {
      let d = new Date(s.date);
      d.setHours(0,0,0,0);
      return d.getTime();
    }))].sort((a,b) => b-a);
    
    for(let i=0; i<sessionDates.length; i++){
      let expectedDate = new Date(today.getTime() - i * 86400000);
      if(sessionDates[i] === expectedDate.getTime()){
        streak++;
      } else {
        break;
      }
    }
  }
  
  // Speed improvement (compare first 10 sessions to last 10)
  let timedSessions = stats.sessions.filter(s => s.secondsPerProblem !== null);
  let speedImprovement = null;
  if(timedSessions.length >= 20){
    let firstAvg = timedSessions.slice(0,10).reduce((sum,s) => sum + s.secondsPerProblem, 0) / 10;
    let lastAvg = timedSessions.slice(-10).reduce((sum,s) => sum + s.secondsPerProblem, 0) / 10;
    speedImprovement = Math.round((firstAvg - lastAvg) * 10) / 10;
  }
  
  return {
    totalSessions,
    totalProblems,
    totalCorrect,
    overallAccuracy,
    recentAccuracy,
    bestScore,
    bestFullTest,
    streak,
    speedImprovement,
    topicStats: stats.topicStats,
    recentSessions: stats.sessions.slice(-20).reverse(),
    firstUse: stats.firstUse
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS INSIGHTS – Motivational messages from session data
// ═══════════════════════════════════════════════════════════════════════════
function getProgressInsights(){
  let stats = loadStats();
  let insights = [];
  let sessions = stats.sessions;
  if(sessions.length === 0) return insights;

  let now = Date.now();
  let DAY = 86400000;
  let WEEK = 7 * DAY;

  // ── Milestone messages ──
  let totalProblems = sessions.reduce((s,x) => s + x.total, 0);
  let milestones = [50, 100, 250, 500, 1000, 2500, 5000];
  for(let m of milestones){
    if(totalProblems >= m && totalProblems < m * 1.15){
      insights.push({type:'milestone', icon:'🏅', message:`You've solved ${m}+ problems!`, detail:'Keep pushing — every problem makes you faster.'});
      break;
    }
  }

  let sessionMilestones = [5, 10, 25, 50, 100];
  for(let m of sessionMilestones){
    if(sessions.length >= m && sessions.length < m + 3){
      insights.push({type:'milestone', icon:'🎯', message:`${m} practice sessions completed!`, detail:'Consistency is the key to UIL success.'});
      break;
    }
  }

  // Sessions this week
  let thisWeekSessions = sessions.filter(s => now - new Date(s.date).getTime() < WEEK);
  if(thisWeekSessions.length >= 5){
    insights.push({type:'milestone', icon:'🔥', message:`${thisWeekSessions.length} sessions this week!`, detail:'You\'re on fire — keep this momentum going.'});
  }

  // ── Week-over-week comparison (timed20) ──
  let timed20 = sessions.filter(s => s.mode === 'timed20' && s.total === 20);
  let thisWeekT20 = timed20.filter(s => now - new Date(s.date).getTime() < WEEK);
  let lastWeekT20 = timed20.filter(s => {
    let age = now - new Date(s.date).getTime();
    return age >= WEEK && age < 2 * WEEK;
  });
  if(thisWeekT20.length >= 2 && lastWeekT20.length >= 2){
    let thisAvg = Math.round(thisWeekT20.reduce((s,x) => s + x.score, 0) / thisWeekT20.length);
    let lastAvg = Math.round(lastWeekT20.reduce((s,x) => s + x.score, 0) / lastWeekT20.length);
    if(thisAvg > lastAvg){
      insights.push({type:'improvement', icon:'📈', message:`Timed Round: ${lastAvg} → ${thisAvg} pts this week!`, detail:`+${thisAvg - lastAvg} improvement over last week.`});
    } else if(thisAvg < lastAvg){
      insights.push({type:'tip', icon:'💪', message:`Timed Round dipped from ${lastAvg} to ${thisAvg} pts.`, detail:'That\'s normal — focus on accuracy over speed.'});
    }
  }

  // ── First 5 vs last 5 sessions comparison ──
  if(sessions.length >= 10){
    let first5 = sessions.slice(0, 5);
    let last5 = sessions.slice(-5);
    let firstTotal = first5.reduce((s,x) => s + x.total, 0);
    let lastTotal = last5.reduce((s,x) => s + x.total, 0);
    if(firstTotal === 0 || lastTotal === 0) return insights;
    let firstAcc = Math.round(first5.reduce((s,x) => s + x.score, 0) / firstTotal * 100);
    let lastAcc = Math.round(last5.reduce((s,x) => s + x.score, 0) / lastTotal * 100);
    if(lastAcc > firstAcc + 3){
      insights.push({type:'improvement', icon:'🚀', message:`Overall accuracy: ${firstAcc}% → ${lastAcc}%!`, detail:'Your first sessions vs your recent ones — real growth!'});
    }
  }

  // ── Topic improvement ──
  let topicEntries = Object.entries(stats.topicStats).filter(([t,d]) => d.total >= 10);
  // We need per-session topic data to compare first vs recent
  // Use cumulative stats + recent sessions for a rough estimate
  for(let [topic, data] of topicEntries){
    let acc = data.total > 0 ? Math.round(data.correct / data.total * 100) : 0;
    if(acc >= 90 && data.total >= 20){
      let name = (typeof TOPICS !== 'undefined' && TOPICS[topic]) ? TOPICS[topic].name : topic;
      insights.push({type:'improvement', icon:'⭐', message:`${name}: ${acc}% accuracy!`, detail:`Mastery level on ${data.total} problems.`});
    }
  }

  // ── Personal best detection ──
  if(timed20.length >= 2){
    let latest = timed20[timed20.length - 1];
    let prevBest = Math.max(...timed20.slice(0, -1).map(s => s.score));
    if(latest.score > prevBest){
      insights.push({type:'improvement', icon:'🏆', message:`New personal best: ${latest.score} pts!`, detail:`Previous best was ${prevBest} pts — you crushed it!`});
    }
  }

  // ── Speed improvement ──
  let timedSessions = sessions.filter(s => s.secondsPerProblem !== null && s.secondsPerProblem > 0);
  if(timedSessions.length >= 10){
    let first5spd = timedSessions.slice(0, 5).reduce((s,x) => s + x.secondsPerProblem, 0) / 5;
    let last5spd = timedSessions.slice(-5).reduce((s,x) => s + x.secondsPerProblem, 0) / 5;
    if(first5spd - last5spd >= 1){
      insights.push({type:'improvement', icon:'⚡', message:`Speed up: ${first5spd.toFixed(1)}s → ${last5spd.toFixed(1)}s per problem!`, detail:'Getting faster with practice.'});
    }
  }

  // ── Encouraging tip if no major improvement ──
  if(insights.length === 0 && sessions.length >= 3){
    insights.push({type:'tip', icon:'💡', message:'Keep practicing — improvement comes with consistency!', detail:`You've done ${sessions.length} sessions. Stay at it!`});
  }

  // Limit to 5 most relevant
  return insights.slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════════════
// REAL PROBLEMS FROM UIL TESTS 2020-2022 (Problems 1-20 range)
// Each has a .t (type) tag for topic filtering
// ═══════════════════════════════════════════════════════════════════════════
const REAL_BASIC = [
  // Addition
  {q:"2050 + 202 =",a:2252,t:"add"},{q:"417 + 1820 =",a:2237,t:"add"},
  {q:"5080 + 911 =",a:5991,t:"add"},{q:"322 + 2126 =",a:2448,t:"add"},
  {q:"6528 + 949 =",a:7477,t:"add"},{q:"3394 + 902 =",a:4296,t:"add"},
  {q:"20720 + 31420 =",a:52140,t:"add"},
  // Subtraction
  {q:"6834 − 17 =",a:6817,t:"sub"},{q:"41720 − 18420 =",a:23300,t:"sub"},
  {q:"1141 − 393 =",a:748,t:"sub"},{q:"34194 − 8542 =",a:25652,t:"sub"},
  {q:"31420 − 20720 =",a:10700,t:"sub"},{q:"2328 − 232 =",a:2096,t:"sub"},
  {q:"5622 − 1247 + 525 =",a:4900,t:"sub"},
  // Multiplication
  {q:"122 × 5 =",a:610,t:"mul"},{q:"33 × 27 =",a:891,t:"mul"},
  {q:"14 × 31 =",a:434,t:"mul"},{q:"17 × 71 =",a:1207,t:"mul"},
  {q:"13 × 24 =",a:312,t:"mul"},{q:"46 × 34 =",a:1564,t:"mul"},
  {q:"2.5 × 1.6 =",a:4,t:"mul"},{q:"58 × 62 =",a:3596,t:"mul"},
  {q:"4.8 × 1.5 =",a:7.2,t:"mul"},{q:"72 × 88 =",a:6336,t:"mul"},
  {q:"73 × 33 =",a:2409,t:"mul"},{q:"18 × 81 =",a:1458,t:"mul"},
  {q:"14 × 312 =",a:4368,t:"mul"},{q:"37 × 15 =",a:555,t:"mul"},
  {q:"73 × 87 =",a:6351,t:"mul"},
  // Division (exact)
  {q:"20520 ÷ 5 =",a:4104,t:"div"},{q:"4692 ÷ 23 =",a:204,t:"div"},
  {q:"3672 ÷ 12 =",a:306,t:"div"},{q:"1957 ÷ 19 =",a:103,t:"div"},
  {q:"26052 ÷ 13 =",a:2004,t:"div"},
  // Squares
  {q:"58² =",a:3364,t:"sq"},{q:"42² =",a:1764,t:"sq"},{q:"23² =",a:529,t:"sq"},
  {q:"43² =",a:1849,t:"sq"},{q:"54² =",a:2916,t:"sq"},{q:"47² =",a:2209,t:"sq"},
  {q:"16² =",a:256,t:"sq"},{q:"48² =",a:2304,t:"sq"},{q:"49² =",a:2401,t:"sq"},
  {q:"31² =",a:961,t:"sq"},{q:"28² =",a:784,t:"sq"},{q:"44² − 42² =",a:172,t:"sq"},
  // Cubes
  {q:"12³ =",a:1728,t:"cube"},{q:"15³ =",a:3375,t:"cube"},
  // Remainders
  {q:"50220 ÷ 9 remainder?",a:0,t:"rem"},{q:"2020 ÷ 6 remainder?",a:4,t:"rem"},
  {q:"107205 ÷ 6 remainder?",a:3,t:"rem"},{q:"41718 ÷ 6 remainder?",a:0,t:"rem"},
  {q:"2126 ÷ 4 remainder?",a:2,t:"rem"},{q:"50622 ÷ 9 remainder?",a:6,t:"rem"},
  {q:"110220 ÷ 3 remainder?",a:0,t:"rem"},{q:"2328 ÷ 9 remainder?",a:6,t:"rem"},
  {q:"2328 ÷ 6 remainder?",a:0,t:"rem"},
  // LCM / GCD
  {q:"The LCM of 52 and 24 =",a:312,t:"lcm"},{q:"LCM(15, 21, 30) =",a:210,t:"lcm"},
  {q:"The LCM of 78 and 24 =",a:312,t:"lcm"},{q:"The LCM of 24 and 42 =",a:168,t:"lcm"},
  // Percentages
  {q:"24 is what % of 20?",a:120,t:"pct"},{q:"170 less 30% of 170 =",a:119,t:"pct"},
  {q:"48 is x% of 160. Find x.",a:30,t:"pct"},{q:"3/16 = ?%",a:18.75,t:"pct"},
  {q:"17 is what % of 85?",a:20,t:"pct"},{q:"24 is what % of 60?",a:40,t:"pct"},
  {q:"21 is what % of 105?",a:20,t:"pct"},{q:"140 less 14% of 140 =",a:120.4,t:"pct"},
  // Conversions
  {q:"3 gallons = ? pints",a:24,t:"conv"},
  // Mean
  {q:"The arithmetic mean of 41, 46, 57 =",a:48,t:"mean"},
  // Roman numerals (added for coverage)
  {q:"MMXXI =",a:2021,t:"roman"},{q:"MDCLXVI =",a:1666,t:"roman"},
  {q:"MCMXCIX =",a:1999,t:"roman"},{q:"MMXX =",a:2020,t:"roman"},
];

// ═══════════════════════════════════════════════════════════════════════════
// GENERATORS – one per skill type, matching real UIL Problems 1-20
// ═══════════════════════════════════════════════════════════════════════════
function gcd(a,b){return b?gcd(b,a%b):a;}
function lcmFn(a,b){return(a/gcd(a,b))*b;}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=ri(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a){return a[ri(0,a.length-1)];}
function ri(lo,hi){return Math.floor(Math.random()*(hi-lo+1))+lo;}

function toRoman(n){
  let v=[[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let r="";for(let[val,s]of v)while(n>=val){r+=s;n-=val;}return r;
}

const GEN = {
  add: ()=>{
    let a=ri(100,50000),b=ri(100,9999);
    return {q:`${a} + ${b} =`,a:a+b,t:"add"};
  },
  sub: ()=>{
    let a=ri(500,50000),b=ri(100,Math.min(a-1,9999));
    return {q:`${a} − ${b} =`,a:a-b,t:"sub"};
  },
  mul: ()=>{
    // Mix of 2-digit × 2-digit, 2-digit × 3-digit, and single-digit × larger
    let type=ri(0,2);
    if(type===0){ let a=ri(10,99),b=ri(10,99); return {q:`${a} × ${b} =`,a:a*b,t:"mul"}; }
    if(type===1){ let a=ri(10,99),b=ri(100,999); return {q:`${a} × ${b} =`,a:a*b,t:"mul"}; }
    let a=ri(2,9),b=ri(100,9999); return {q:`${a} × ${b} =`,a:a*b,t:"mul"};
  },
  div: ()=>{
    let d=pick([3,4,5,6,7,8,9,11,12,13,15,17,19,23,25]);
    let q=ri(10,800); return {q:`${d*q} ÷ ${d} =`,a:q,t:"div"};
  },
  sq: ()=>{
    let a=ri(10,80); return {q:`${a}² =`,a:a*a,t:"sq"};
  },
  cube: ()=>{
    let a=ri(2,18); return {q:`${a}³ =`,a:a*a*a,t:"cube"};
  },
  rem: ()=>{
    let d=pick([3,4,6,9]);
    let n;
    if(d===4){
      // For ÷4 the remainder only depends on the last two digits,
      // so use numbers big enough that students can't just divide mentally end-to-end.
      n=ri(1000,99999);
    } else {
      // For ÷3, ÷6, ÷9 the casting-out-digits rule applies to ALL digits,
      // so bigger numbers are more useful practice.
      n=ri(10000,999999);
    }
    return {q:`${n} ÷ ${d} remainder?`,a:n%d,t:"rem"};
  },
  lcm: ()=>{
    let pairs=[[12,18],[8,12],[15,20],[24,36],[14,21],[9,15],[16,24],[6,10],[18,30],[20,28],
      [24,42],[52,24],[78,24],[15,21],[10,14],[8,6],[9,12],[16,12],[20,30],[36,48],
      [15,10],[42,30],[24,18],[28,42],[30,45],[12,16],[18,24],[36,60],[15,35],[20,24],
      [40,56],[21,28],[18,45],[24,40],[30,42]];
    let[a,b]=pick(pairs);
    return {q:`The LCM of ${a} and ${b} =`,a:lcmFn(a,b),t:"lcm"};
  },
  gcd: ()=>{
    let pairs=[[56,84],[12,40],[24,36],[18,48],[30,45],[42,70],[36,60],[24,60],
      [48,72],[20,50],[35,49],[54,81],[16,44],[28,42],[40,60],[32,48],
      [21,63],[15,45],[24,80],[36,54],[60,84],[45,75],[48,80],[66,88]];
    let[a,b]=pick(pairs);
    return {q:`The GCD of ${a} and ${b} =`,a:gcd(a,b),t:"gcd"};
  },
  pct: ()=>{
    let type=ri(0,3);
    if(type===0){
      // X% of Y  →  nice numbers
      let y=pick([20,25,40,50,60,80,100,120,150,200,250,300,400,500]);
      let x=pick([10,12,15,20,25,30,40,50,60,75,80]);
      return {q:`${x}% of ${y} =`,a:y*x/100,t:"pct"};
    }
    if(type===1){
      // A is what % of B?  →  ensure clean %
      let pcts=[10,12,15,20,25,30,40,50,60,75,80,100,120,150,200];
      let p=pick(pcts);
      let bases=[20,25,40,50,60,80,100,120,150,200,250,300,400,500];
      let b=pick(bases);
      let a=b*p/100;
      return {q:`${a} is what % of ${b}?`,a:p,t:"pct"};
    }
    if(type===2){
      // Y less X% of Y
      let y=pick([40,50,60,80,100,120,150,200,250,300,400,500]);
      let x=pick([10,15,20,25,30,40,50]);
      return {q:`${y} less ${x}% of ${y} =`,a:y*(1-x/100),t:"pct"};
    }
    // fraction → %
    let fracs=[[1,2,50],[1,4,25],[3,4,75],[1,5,20],[2,5,40],[3,5,60],[4,5,80],
      [1,8,12.5],[3,8,37.5],[5,8,62.5],[7,8,87.5],[1,10,10],[3,10,30],[7,10,70],
      [1,16,6.25],[3,16,18.75],[5,16,31.25],[7,16,43.75],[1,20,5],[3,20,15],
      [1,25,4],[2,25,8],[3,25,12],[1,3,33.33]];
    let[n,d,p]=pick(fracs);
    return {q:`${n}/${d} = ?%`,a:p,t:"pct"};
  },
  conv: ()=>{
    let type=ri(0,3);
    if(type===0){ let g=ri(1,10); return {q:`${g} gallon${g>1?'s':''} = ? pints`,a:g*8,t:"conv"}; }
    if(type===1){ let p=pick([8,16,24,32,40,48,56,64]); return {q:`${p} pints = ? gallons`,a:p/8,t:"conv"}; }
    if(type===2){ let q=pick([4,8,12,16,20,24]); return {q:`${q} quarts = ? gallons`,a:q/4,t:"conv"}; }
    // yards ↔ feet
    let y=ri(1,10); return {q:`${y} yard${y>1?'s':''} = ? feet`,a:y*3,t:"conv"};
  },
  roman: ()=>{
    let n=ri(1,3999);
    let r=toRoman(n);
    let sub=ri(0,1);
    if(sub===0) return {q:`${r} =`,a:n,t:"roman"};
    // Roman + or − Roman
    let n2=ri(1,Math.min(n-1,1000));
    if(ri(0,1)===0) return {q:`${r} + ${toRoman(n2)} =`,a:n+n2,t:"roman"};
    return {q:`${r} − ${toRoman(n2)} =`,a:n-n2,t:"roman"};
  },
  mean: ()=>{
    let ct=ri(2,5),nums=[];
    for(let i=0;i<ct;i++) nums.push(ri(10,120));
    // Force clean mean half the time
    let s=nums.reduce((a,b)=>a+b,0);
    if(s%ct!==0) nums[nums.length-1]+=(ct-(s%ct));
    s=nums.reduce((a,b)=>a+b,0);
    return {q:`The arithmetic mean of ${nums.join(", ")} =`,a:s/ct,t:"mean"};
  },
  ops: ()=>{
    let a=ri(2,25),b=ri(2,20),c=ri(1,60);
    let type=ri(0,2);
    if(type===0) return {q:`${a} × ${b} + ${c} =`,a:a*b+c,t:"ops"};
    if(type===1) return {q:`${a} × ${b} − ${c} =`,a:a*b-c,t:"ops"};
    let d=ri(1,15);
    return {q:`${a} × ${b} + ${c} − ${d} =`,a:a*b+c-d,t:"ops"};
  },
  mul11: ()=>{
    let a=ri(12,9876);
    return {q:`${a} × 11 =`,a:a*11,t:"mul11",hint:"× 11 trick: write first & last digits, add consecutive pairs inward (carry as needed)."};
  },
  mul25: ()=>{
    let type=ri(0,1);
    if(type===0){
      let a=pick([12,16,24,32,36,44,48,52,56,64,68,72,76,84,88,96,108,124,136,148,156,164,172,184,196,204,212,236,248,312,324,336,412,448,512,524,612,712,812,912]);
      return {q:`${a} × 25 =`,a:a*25,t:"mul25",hint:"× 25 trick: divide by 4, then × 100 (shift decimal 2 right)."};
    }
    let a=pick([12,16,24,32,36,44,48,52,56,64,68,72,76,84,88,96,108,124,136,148,156,164,172,184,196,204,212,236]);
    return {q:`${a} × 75 =`,a:a*75,t:"mul25",hint:"× 75 trick: divide by 4, × 3, then × 100."};
  },
  near100: ()=>{
    let type=ri(0,2);
    if(type===0){
      let a=ri(101,115),b=ri(101,115);
      return {q:`${a} × ${b} =`,a:a*b,t:"near100",hint:"Both above 100: last 2 digits = (a−100)×(b−100); rest = smaller + other's offset."};
    }
    if(type===1){
      let a=ri(85,99),b=ri(85,99);
      return {q:`${a} × ${b} =`,a:a*b,t:"near100",hint:"Both below 100: last 2 digits = (100−a)×(100−b); rest = smaller − other's offset."};
    }
    let a=ri(101,112),b=ri(88,99);
    return {q:`${a} × ${b} =`,a:a*b,t:"near100",hint:"Mixed (one above, one below): answer = 100×(a−(100−b)−1) + (100−(a−100)×(100−b))."};
  },
  sq5: ()=>{
    let bases=[15,25,35,45,55,65,75,85,95,105,115,125,135,145,155,165,175,185,195,205];
    let n=pick(bases);
    return {q:`${n}² =`,a:n*n,t:"sq5",hint:`Squares ending in 5: last two digits = 25; leading = (n÷10)×(n÷10+1). Here: ${Math.floor(n/10)}×${Math.floor(n/10)+1}=${Math.floor(n/10)*(Math.floor(n/10)+1)} → answer ends ...25.`};
  },
  equidist: ()=>{
    let centers=[20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];
    let c=pick(centers);
    let maxD=Math.min(c-1,15);
    let d=ri(1,maxD);
    let a=c-d,b=c+d;
    return {q:`${a} × ${b} =`,a:a*b,t:"equidist",hint:`Equidistant trick: both are ${d} from ${c}. Answer = ${c}² − ${d}² = ${c*c} − ${d*d} = ${c*c-d*d}.`};
  },
  special: ()=>{
    let type=ri(0,2);
    if(type===0){
      let a=ri(1,50);
      return {q:`${a} × 999 =`,a:a*999,t:"special",hint:`999 trick: n × 999 = n × 1000 − n = ${a*1000} − ${a} = ${a*999}.`};
    }
    if(type===1){
      let a=ri(1,99);
      return {q:`${a} × 1001 =`,a:a*1001,t:"special",hint:`1001 trick: 1001 = 7×11×13. n × 1001 repeats n. ${a} × 1001 = ${a*1001}.`};
    }
    let a=ri(1,99);
    return {q:`${a} × 10101 =`,a:a*10101,t:"special",hint:`10101 trick: 10101 = 3×7×13×37. Repeats n in 2-digit groups. ${a} × 10101 = ${a*10101}.`};
  },
  series: ()=>{
    let type=ri(0,9);

    // Type 0: Classic 1+2+3+…+n
    if(type===0){
      let n=ri(5,50);
      return {q:`1 + 2 + 3 + … + ${n} =`,a:n*(n+1)/2,t:"series",hint:`Sum 1→n = n(n+1)/2 = ${n}×${n+1}/2 = ${n*(n+1)/2}.`};
    }

    // Type 1: Arithmetic series with non-1 start and common difference
    if(type===1){
      let d=pick([2,3,4,5,6,7,8,10]);
      let a=ri(1,20);
      let count=ri(5,12);
      let last=a+d*(count-1);
      let sum=count*(a+last)/2;
      let t2=a+d, t3=a+2*d;
      return {q:`${a} + ${t2} + ${t3} + … + ${last} =`,a:sum,t:"series",hint:`Arithmetic series: ${count} terms, d=${d}. Sum = count×(first+last)/2 = ${count}×${a+last}/2 = ${sum}.`};
    }

    // Type 2: Consecutive odd numbers in series notation
    if(type===2){
      if(ri(0,1)===0){
        // Starting from 1
        let n=ri(4,15);
        let last=2*n-1;
        return {q:`1 + 3 + 5 + … + ${last} =`,a:n*n,t:"series",hint:`Sum of first ${n} odd numbers = n² = ${n}² = ${n*n}.`};
      }
      // Starting from a higher odd
      let startIdx=ri(2,6); // skip first few
      let endIdx=ri(startIdx+4,startIdx+10);
      let first=2*startIdx-1, last=2*endIdx-1;
      let count=endIdx-startIdx+1;
      let sum=count*(first+last)/2;
      return {q:`${first} + ${first+2} + ${first+4} + … + ${last} =`,a:sum,t:"series",hint:`Arithmetic series of odds: ${count} terms. Sum = ${count}×(${first}+${last})/2 = ${sum}.`};
    }

    // Type 3: Consecutive even numbers in series notation
    if(type===3){
      if(ri(0,1)===0){
        // Starting from 2
        let n=ri(4,15);
        let last=2*n;
        let sum=n*(n+1);
        return {q:`2 + 4 + 6 + … + ${last} =`,a:sum,t:"series",hint:`Sum of first ${n} even numbers = n(n+1) = ${n}×${n+1} = ${sum}.`};
      }
      // Starting from a higher even
      let startVal=pick([4,6,8,10,12]);
      let count=ri(5,10);
      let last=startVal+2*(count-1);
      let sum=count*(startVal+last)/2;
      return {q:`${startVal} + ${startVal+2} + ${startVal+4} + … + ${last} =`,a:sum,t:"series",hint:`Arithmetic series of evens: ${count} terms. Sum = ${count}×(${startVal}+${last})/2 = ${sum}.`};
    }

    // Type 4: Infinite geometric series (convergent)
    if(type===4){
      // Use pre-built combos that give clean answers
      let geoProblems=[
        {a:8,  r:'1/2', terms:[8,4,2,1],         ans:16},
        {a:12, r:'1/2', terms:[12,6,3,1.5],      ans:24},
        {a:16, r:'1/2', terms:[16,8,4,2],        ans:32},
        {a:24, r:'1/2', terms:[24,12,6,3],       ans:48},
        {a:36, r:'1/2', terms:[36,18,9,4.5],     ans:72},
        {a:18, r:'1/3', terms:[18,6,2],          ans:27},
        {a:12, r:'1/4', terms:[12,3,0.75],       ans:16},
        {a:9,  r:'3/4', terms:[9,6.75,5.0625],   ans:36},
        {a:8,  r:'3/4', terms:[8,6,4.5,3.375],   ans:32},
        {a:18, r:'2/3', terms:[18,12,8],          ans:54},
        {a:48, r:'1/2', terms:[48,24,12,6],      ans:96},
        {a:3,  r:'1/2', terms:[3,1.5,0.75,0.375],ans:6},
        {a:4,  r:'1/2', terms:[4,2,1,0.5],       ans:8},
        {a:20, r:'1/2', terms:[20,10,5,2.5],     ans:40},
        {a:32, r:'1/2', terms:[32,16,8,4],       ans:64},
        {a:6,  r:'1/2', terms:[6,3,1.5,0.75],    ans:12},
        {a:10, r:'1/2', terms:[10,5,2.5,1.25],   ans:20},
        {a:40, r:'1/2', terms:[40,20,10,5],      ans:80},
        {a:15, r:'2/3', terms:[15,10],            ans:45},
        {a:45, r:'1/3', terms:[45,15,5],          ans:67.5},
      ];
      let gp=pick(geoProblems);
      let termsStr=gp.terms.map(t=>Number.isInteger(t)?String(t):t.toFixed?t.toString():String(t)).join(' + ');
      // Clean answer display
      let ans=gp.ans;
      if(Number.isInteger(ans)) ans=ans;
      return {q:`${termsStr} + … =`,a:ans,t:"series",hint:`Infinite geometric series: a=${gp.a}, r=${gp.r}. Sum = a/(1−r) = ${ans}.`};
    }

    // Type 5: Sum of positive divisors
    if(type===5){
      let divisorSums=[
        [10,18],[12,28],[14,24],[15,24],[16,31],[18,39],[20,42],[24,60],
        [28,56],[30,72],[32,63],[36,91],[40,90],[42,96],[48,124],[50,93],
        [56,120],[60,168],[64,127],[72,195],[80,186],[84,224],[90,234],[96,252],[100,217]
      ];
      let[n,s]=pick(divisorSums);
      return {q:`The sum of the positive divisors of ${n} =`,a:s,t:"series",hint:`List all divisors of ${n} and add them up. Sum = ${s}.`};
    }

    // Type 6: Triangular number
    if(type===6){
      let n=ri(5,20);
      let ordinal=n===11?'11th':n===12?'12th':n===13?'13th':n%10===1?n+'st':n%10===2?n+'nd':n%10===3?n+'rd':n+'th';
      return {q:`The ${ordinal} triangular number =`,a:n*(n+1)/2,t:"series",hint:`T(n) = n(n+1)/2 = ${n}×${n+1}/2 = ${n*(n+1)/2}.`};
    }

    // Type 7: Sum of squares 1² + 2² + … + n²
    if(type===7){
      let n=ri(3,10);
      let sum=n*(n+1)*(2*n+1)/6;
      return {q:`1² + 2² + 3² + … + ${n}² =`,a:sum,t:"series",hint:`Sum of squares: n(n+1)(2n+1)/6 = ${n}×${n+1}×${2*n+1}/6 = ${sum}.`};
    }

    // Type 8: Sum of cubes 1³ + 2³ + … + n³
    if(type===8){
      let n=ri(3,8);
      let tri=n*(n+1)/2;
      let sum=tri*tri;
      return {q:`1³ + 2³ + 3³ + … + ${n}³ =`,a:sum,t:"series",hint:`Sum of cubes = [n(n+1)/2]² = ${tri}² = ${sum}.`};
    }

    // Type 9: Arithmetic series squared
    let a0=ri(1,6), d0=1, count0=ri(4,8);
    let last0=a0+d0*(count0-1);
    let innerSum=count0*(a0+last0)/2;
    let ans=innerSum*innerSum;
    return {q:`(${a0} + ${a0+1} + ${a0+2} + … + ${last0})² =`,a:ans,t:"series",hint:`First find sum: ${count0}×(${a0}+${last0})/2 = ${innerSum}. Then square: ${innerSum}² = ${ans}.`};
  },
  fracdec: ()=>{
    let type=ri(0,2);
    if(type===0){
      let fracs=[[1,3,"0.333"],[2,3,"0.667"],[1,6,"0.167"],[5,6,"0.833"],[1,7,"0.143"],[2,7,"0.286"],[3,7,"0.429"],[4,7,"0.571"],[5,7,"0.714"],[6,7,"0.857"],
        [1,9,"0.111"],[2,9,"0.222"],[4,9,"0.444"],[7,9,"0.778"],[8,9,"0.889"],[1,11,"0.0909"],[2,11,"0.182"],[3,11,"0.273"],[5,11,"0.455"],
        [1,12,"0.0833"],[5,12,"0.417"],[7,12,"0.583"],[11,12,"0.917"]];
      let[n,d,dec]=pick(fracs);
      return {q:`${n}/${d} ≈ ? (3 dec.)`,a:parseFloat(dec),t:"fracdec",hint:`1/${d} ≈ ${(1/d).toFixed(4)}. Multiply by ${n}.`,starred:true};
    }
    if(type===1){
      let pcts=[[12.5,1,8],[25,1,4],[37.5,3,8],[62.5,5,8],[87.5,7,8],[16.667,1,6],[33.333,1,3],[66.667,2,3],[83.333,5,6]];
      let[p,n,d]=pick(pcts);
      return {q:`${p}% = ? (simplest fraction)`,a:`${n}/${d}`,t:"fracdec",hint:`Key: ${p}% = ${n}/${d}.`};
    }
    let decs=[[0.125,12.5],[0.375,37.5],[0.625,62.5],[0.875,87.5],[0.1667,16.67],[0.3333,33.33],[0.6667,66.67],[0.8333,83.33]];
    let[dec,pct]=pick(decs);
    return {q:`${dec} = ?%`,a:pct,t:"fracdec",hint:`Memorize: 0.125=1/8=12.5%, 0.375=3/8, etc.`,starred:true};
  },
  powers: ()=>{
    let type=ri(0,2);
    if(type===0){
      let exp=ri(2,10);
      return {q:`2^${exp} =`,a:Math.pow(2,exp),t:"powers",hint:"Powers of 2: 4,8,16,32,64,128,256,512,1024."};
    }
    if(type===1){
      let exp=ri(2,7);
      return {q:`3^${exp} =`,a:Math.pow(3,exp),t:"powers",hint:"Powers of 3: 9,27,81,243,729,2187."};
    }
    let exp=ri(2,5);
    return {q:`5^${exp} =`,a:Math.pow(5,exp),t:"powers",hint:"Powers of 5: 25,125,625,3125."};
  },
  fib: ()=>{
    let fibs=[1,1,2,3,5,8,13,21,34,55,89,144,233,377];
    let type=ri(0,2);
    if(type===0){
      let n=ri(3,14);
      return {q:`F(${n}) = ?`,a:fibs[n-1],t:"fib",hint:"Fibonacci: 1,1,2,3,5,8,13,21,34,55,89,144,233,377"};
    }
    if(type===1){
      let n=ri(4,10);
      let s=fibs.slice(0,n).reduce((a,b)=>a+b,0);
      return {q:`Sum of first ${n} Fibonacci =`,a:s,t:"fib",hint:"Sum of first n Fib = F(n+2) − 1."};
    }
    let idx=ri(4,12);
    return {q:`${fibs[idx-1]} is which Fibonacci number?`,a:idx,t:"fib",hint:"F1=1,F2=1,F3=2,F4=3,F5=5,F6=8,F7=13,F8=21,F9=34,F10=55,F11=89,F12=144."};
  },
  polygon: ()=>{
    let type=ri(0,2);
    if(type===0){
      let n=ri(3,12);
      let s=180*(n-2);
      let names=["","","","triangle","quadrilateral","pentagon","hexagon","heptagon","octagon","nonagon","decagon","hendecagon","dodecagon"];
      return {q:`Sum of interior angles of a ${names[n]} =`,a:s,t:"polygon",hint:"Interior angle sum = 180 × (n − 2)."};
    }
    if(type===1){
      let n=ri(4,12);
      return {q:`Diagonals in a ${n}-gon =`,a:n*(n-3)/2,t:"polygon",hint:"Diagonals = n(n−3)/2."};
    }
    let n=pick([3,4,5,6,8,9,10,12]);
    return {q:`Each interior angle of regular ${n}-gon =`,a:180*(n-2)/n,t:"polygon",hint:"Each interior angle = 180(n−2)/n."};
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TOPIC METADATA – maps topic key → display info + which generators to use
// ═══════════════════════════════════════════════════════════════════════════
const TOPICS = {
  add:      {name:"Addition",       icon:"➕", gens:["add"]},
  sub:      {name:"Subtraction",    icon:"➖", gens:["sub"]},
  mul:      {name:"Multiplication", icon:"✖️",  gens:["mul"]},
  div:      {name:"Division",       icon:"➗", gens:["div"]},
  sq:       {name:"Squares",        icon:"²",  gens:["sq"]},
  cube:     {name:"Cubes",          icon:"³",  gens:["cube"]},
  rem:      {name:"Remainders",     icon:"🔁", gens:["rem"]},
  lcm:      {name:"LCM & GCD",     icon:"🔢", gens:["lcm","gcd"]},
  pct:      {name:"Percentages",    icon:"%",  gens:["pct"]},
  conv:     {name:"Conversions",    icon:"🔄", gens:["conv"]},
  roman:    {name:"Roman Numerals", icon:"Ⅹ",  gens:["roman"]},
  mean:     {name:"Mean & Ops",     icon:"📊", gens:["mean","ops"]},
  mul11:    {name:"× 11 Trick",     icon:"⛓", gens:["mul11"]},
  mul25:    {name:"× 25 / × 75",   icon:"¼",  gens:["mul25"]},
  near100:  {name:"Near 100",       icon:"💯", gens:["near100"]},
  sq5:      {name:"Squares (÷5)",   icon:"⁵²", gens:["sq5","equidist"]},
  special:  {name:"Special Ints",   icon:"🎯", gens:["special"]},
  series:   {name:"Series Sums",    icon:"∑",  gens:["series"]},
  fracdec:  {name:"Frac↔Dec",       icon:"⅛",  gens:["fracdec"]},
  powers:   {name:"Powers 2/3/5",   icon:"2ⁿ", gens:["powers"]},
  fib:      {name:"Fibonacci",      icon:"🌀", gens:["fib"]},
  polygon:  {name:"Polygons",       icon:"⬡",  gens:["polygon"]},
};
const ALL_GEN_KEYS = Object.keys(GEN);
const CORE_GEN_KEYS = ['add','sub','mul','div','sq','cube','rem','lcm','gcd','pct','conv','roman','mean','ops'];
const TRICK_GEN_KEYS = ['mul11','mul25','near100','sq5','equidist','special','series','fracdec','powers','fib','polygon'];

function pickGen(){
  // 70% core, 30% trick drill
  if(ri(0,9)<7) return pick(CORE_GEN_KEYS);
  return pick(TRICK_GEN_KEYS);
}

// ═══════════════════════════════════════════════════════════════════════════
// POOL BUILDER
// ═══════════════════════════════════════════════════════════════════════════
function buildBasicPool(count, topicKey) {
  let pool = [];
  if(topicKey){
    // Filter real problems to matching type(s)
    let matchTypes = topicKey==="lcm" ? ["lcm","gcd"] : [topicKey];
    pool = REAL_BASIC.filter(p=>matchTypes.includes(p.t));
    let gens = TOPICS[topicKey].gens;
    while(pool.length < count*4) pool.push(GEN[pick(gens)]());
  } else {
    pool = [...REAL_BASIC];
    while(pool.length < count*4) pool.push(GEN[pickGen()]());
  }
  
  let problems = shuffle(pool).slice(0,count);
  
  // Insert starred problems at positions 10, 20, 30, etc. in drill mode (not topic drills)
  if(!topicKey && count >= 10){
    for(let pos=10; pos<=count; pos+=10){
      if(pos===10){
        problems[9] = {...APPROX.tier1(),num:10};
      } else if(pos===20){
        problems[19] = {...APPROX.tier1hard(),num:20};
      } else {
        // For positions 30+, use advanced starred problems
        problems[pos-1] = {...APPROX.advanced(),num:pos};
      }
    }
  }
  
  return problems;
}

// ═══════════════════════════════════════════════════════════════════════════
// APPROXIMATION (*) GENERATORS — For problems #10, 20, 30, 40, 50, 60, 70, 80
// These are starred (*) problems but have EXACT answers - just large/tricky numbers
// The ±5% tolerance is a safety net, not an invitation to estimate
// ═══════════════════════════════════════════════════════════════════════════
const APPROX = {
  // Problem 10: Four-term arithmetic chain (AUTHENTIC UIL PATTERN)
  // Real UIL examples:
  //   520 − 2011 + 1302 − 25 =
  //   425 − 2025 + 5202 − 624 =
  //   1967 + 7196 − 6719 − 9671 =
  //   5220 − 522 − 2052 − 2205 =
  tier1: ()=>{
    let pattern=ri(0,4);
    
    // Pattern 1: small − large + large − medium
    if(pattern===0){
      let a=ri(300,900);
      let b=ri(1500,2500);
      let c=ri(3000,6000);
      let d=ri(100,800);
      let ans=a-b+c-d;
      return {q:`${a} − ${b} + ${c} − ${d} =`,a:ans,t:"ops",starred:true,hint:"Work left to right: "+a+"−"+b+" = "+(a-b)+", +"+c+" = "+(a-b+c)+", −"+d+" = "+ans};
    }
    
    // Pattern 2: large + large − large − large
    if(pattern===1){
      let a=ri(1000,3000);
      let b=ri(5000,8000);
      let c=ri(4000,7000);
      let d=ri(3000,10000);
      let ans=a+b-c-d;
      return {q:`${a} + ${b} − ${c} − ${d} =`,a:ans,t:"ops",starred:true,hint:"Add: "+a+"+"+b+" = "+(a+b)+", subtract: −"+c+"−"+d};
    }
    
    // Pattern 3: large − small − large − large
    if(pattern===2){
      let a=ri(4000,7000);
      let b=ri(400,900);
      let c=ri(1500,2500);
      let d=ri(1500,3000);
      let ans=a-b-c-d;
      return {q:`${a} − ${b} − ${c} − ${d} =`,a:ans,t:"ops",starred:true,hint:"Subtract sequentially: "+a+"−"+b+" = "+(a-b)+", −"+c+" = "+(a-b-c)+", −"+d};
    }
    
    // Pattern 4: small + large − large + medium
    if(pattern===3){
      let a=ri(200,600);
      let b=ri(2000,4000);
      let c=ri(1500,3000);
      let d=ri(500,1500);
      let ans=a+b-c+d;
      return {q:`${a} + ${b} − ${c} + ${d} =`,a:ans,t:"ops",starred:true,hint:"Group: ("+a+"+"+b+"+"+d+") − "+c};
    }
    
    // Pattern 5: small − large + large − small (balanced)
    let a=ri(400,800);
    let b=ri(1800,2500);
    let c=ri(3000,4500);
    let d=ri(300,700);
    let ans=a-b+c-d;
    return {q:`${a} − ${b} + ${c} − ${d} =`,a:ans,t:"ops",starred:true,hint:"Left to right: "+a+"−"+b+" = "+(a-b)+", then +"+c+"−"+d};
  },
  
  // Problem 20: Division by 25 OR large operations (AUTHENTIC UIL PATTERN)
  // Real UIL examples:
  //   1103 ÷ 25 =
  //   √518 × √7491 = (which is √(518×7491))
  //   172023 ÷ 218 =
  //   396 × 501 − 2020 =
  tier1hard: ()=>{
    let type=ri(0,5);
    
    // Type 1: Division by 25 (MOST COMMON)
    if(type===0){
      let quotient=ri(40,150);
      let dividend=quotient*25;
      return {q:`${dividend} ÷ 25 =`,a:quotient,t:"div",starred:true,hint:"÷25 trick: "+dividend+" × 4 = "+(dividend*4)+", ÷100 = "+quotient};
    }
    
    // Type 2: Large 3-digit × 3-digit multiplication
    if(type===1){
      let a=ri(250,500);
      let b=ri(250,600);
      let ans=a*b;
      return {q:`${a} × ${b} =`,a:ans,t:"mul",starred:true,hint:"Distributive: "+a+"×"+b+" = "+a+"×"+Math.floor(b/100)*100+" + "+a+"×"+(b%100)};
    }
    
    // Type 3: √a + √b where a, b are perfect squares
    if(type===2){
      let a=ri(18,26);
      let b=ri(18,28);
      let ans=a+b;
      return {q:`√${a*a} + √${b*b} =`,a:ans,t:"sq",starred:true,hint:"√"+(a*a)+" = "+a+", √"+(b*b)+" = "+b+", sum = "+ans};
    }
    
    // Type 4: Large product minus constant
    if(type===3){
      let a=ri(300,500);
      let b=ri(400,600);
      let c=ri(1500,3000);
      let ans=a*b-c;
      return {q:`${a} × ${b} − ${c} =`,a:ans,t:"ops",starred:true,hint:"Multiply first: "+a+"×"+b+" = "+(a*b)+", −"+c+" = "+ans};
    }
    
    // Type 5: Large division with clean answer
    if(type===4){
      let divisor=ri(150,400);
      let quotient=ri(200,900);
      let dividend=divisor*quotient;
      return {q:`${dividend} ÷ ${divisor} =`,a:quotient,t:"div",starred:true,hint:"Factor: "+dividend+" = "+divisor+" × "+quotient};
    }
    
    // Type 6: Product of large-ish numbers (near 100)
    let a=ri(90,150);
    let b=ri(90,150);
    return {q:`${a} × ${b} =`,a:a*b,t:"mul",starred:true,hint:"Use (100±a)(100±b) pattern or distributive"};
  },
  
  // Problem 30: Tier 2 starred
  tier2: ()=>{
    let type=ri(0,2);
    if(type===0){
      // Product of square roots
      let a=ri(10,20),b=ri(10,20);
      return {q:`√${a*a} × √${b*b} =`,a:a*b,t:"sq",starred:true,hint:"√"+(a*a)+"="+a+", √"+(b*b)+"="+b+", product = "+(a*b)};
    }
    if(type===1){
      // Cube root of perfect cube
      let n=ri(10,15);
      return {q:`³√${n*n*n} =`,a:n,t:"cube",starred:true,hint:"Memorize cubes: 10³=1000, 11³=1331, 12³=1728, 13³=2197, 14³=2744, 15³=3375"};
    }
    // Large mixed operations
    let a=ri(100,500),b=ri(100,500),c=ri(2,9);
    let ans=(a+b)*c;
    return {q:`(${a} + ${b}) × ${c} =`,a:ans,t:"ops",starred:true,hint:"Add first: "+a+"+"+b+"="+(a+b)+", then ×"+c};
  },
  
  // Problem 40-80: Higher tier starred
  advanced: ()=>{
    let type=ri(0,4);
    if(type===0){
      // Fourth root of perfect fourth power
      let n=ri(5,10);
      return {q:`⁴√${Math.pow(n,4)} =`,a:n,t:"powers",starred:true,hint:"4th roots: 5⁴=625, 6⁴=1296, 7⁴=2401, 8⁴=4096, 9⁴=6561, 10⁴=10000"};
    }
    if(type===1){
      // Product of three square roots
      let a=ri(8,15),b=ri(8,15),c=ri(8,15);
      return {q:`√${a*a} × √${b*b} × √${c*c} =`,a:a*b*c,t:"sq",starred:true,hint:"√"+(a*a)+"×√"+(b*b)+"×√"+(c*c)+" = "+a+"×"+b+"×"+c};
    }
    if(type===2){
      // Complex arithmetic chain
      let a=ri(50,100),b=ri(50,100),c=ri(30,70);
      let ans=a*a-b*b+c;
      return {q:`${a}² − ${b}² + ${c} =`,a:ans,t:"ops",starred:true,hint:"Use difference of squares: "+a+"²−"+b+"² = ("+a+"+"+b+")("+a+"−"+b+")"};
    }
    if(type===3){
      // Large factorial divided by factorial
      let n=ri(8,12),k=ri(5,n-2);
      let ans=1; for(let i=k+1;i<=n;i++) ans*=i;
      return {q:`${n}! ÷ ${k}! =`,a:ans,t:"factperm",starred:true,hint:n+"! ÷ "+k+"! = "+n+"×"+(n-1)+"×...×"+(k+1)};
    }
    // Sum/product of large square roots
    let a=ri(12,20),b=ri(12,20);
    if(ri(0,1)===0){
      return {q:`√${a*a} + √${b*b} + √${(a+b)*(a+b)} =`,a:a+b+(a+b),t:"sq",starred:true,hint:"Simplify each root, then add"};
    }
    return {q:`(√${a*a} + √${b*b}) × ${ri(2,5)} =`,a:(a+b)*ri(2,5),t:"ops",starred:true,hint:"Roots first, then multiply"};
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TIER 2 GENERATORS — Problems 21-40
// Powers, Substitution, Abs Value, Ratio, Roots, Sets,
// Base Conversion, Equations, Repeating Decimals, Area/Perimeter, Sequences
// ═══════════════════════════════════════════════════════════════════════════
const GEN2 = {
  powers: ()=>{
    let type=ri(0,3);
    if(type===0){ let b=ri(2,9),e=ri(3,5); return {q:`${b}^${e} =`,a:Math.pow(b,e),t:"powers"}; }
    if(type===1){ let b=ri(2,5),e=ri(4,6); return {q:`${b}^${e} =`,a:Math.pow(b,e),t:"powers"}; }
    if(type===2){
      // product of powers: a^m × a^n = a^(m+n)
      let b=pick([2,3,5]),m=ri(1,4),n=ri(1,3);
      return {q:`${b}^${m} × ${b}^${n} = ${b}^?`,a:m+n,t:"powers"};
    }
    let a=ri(2,4),m=ri(2,3),n=ri(2,3);
    return {q:`(${a}^${m})^${n} =`,a:Math.pow(a,m*n),t:"powers"};
  },
  subst: ()=>{
    let x=ri(2,12);
    let type=ri(0,3);
    if(type===0){ let a=ri(2,8),b=ri(1,20); return {q:`If x = ${x}, then ${a}x + ${b} =`,a:a*x+b,t:"subst"}; }
    if(type===1){ let a=ri(1,6),b=ri(1,6); return {q:`If x = ${x}, then x² + ${a}x − ${b} =`,a:x*x+a*x-b,t:"subst"}; }
    if(type===2){ let a=ri(2,5); return {q:`If x = ${x}, then ${a}x² =`,a:a*x*x,t:"subst"}; }
    let a=ri(1,5),b=ri(1,5),c=ri(1,30);
    return {q:`If x = ${x}, then ${a}x² − ${b}x + ${c} =`,a:a*x*x-b*x+c,t:"subst"};
  },
  absval: ()=>{
    let type=ri(0,2);
    if(type===0){ let a=ri(-50,-1); return {q:`|${a}| =`,a:Math.abs(a),t:"absval"}; }
    if(type===1){ let a=ri(-30,30),b=ri(-30,30); return {q:`|${a}| + |${b}| =`,a:Math.abs(a)+Math.abs(b),t:"absval"}; }
    let a=ri(-20,20),b=ri(-20,20);
    let bStr = b<0 ? `(${b})` : `${b}`;
    return {q:`|${a} − ${bStr}| =`,a:Math.abs(a-b),t:"absval"};
  },
  ratio: ()=>{
    let type=ri(0,2);
    if(type===0){
      let a=ri(2,12),b=ri(2,12),c=a*ri(2,6);
      return {q:`${a} : ${b} = ${c} : ?`,a:b*(c/a),t:"ratio"};
    }
    if(type===1){
      let a=ri(2,10),b=ri(2,10),k=ri(2,5);
      return {q:`${a}/${b} = ${a*k}/x. Find x.`,a:b*k,t:"ratio"};
    }
    let a=ri(1,5),b=ri(1,5),total=(a+b)*ri(2,8);
    let partA=total*a/(a+b);
    return {q:`Split ${total} in ratio ${a}:${b}. Smaller part =`,a:Math.min(partA,total-partA),t:"ratio"};
  },
  sqrtcube: ()=>{
    let type=ri(0,2);
    if(type===0){ let n=ri(2,30); return {q:`√${n*n} =`,a:n,t:"sqrtcube"}; }
    if(type===1){ let n=ri(2,15); return {q:`∛${n*n*n} =`,a:n,t:"sqrtcube"}; }
    let a=ri(2,20),b=ri(2,20);
    return {q:`√${a*a} + √${b*b} =`,a:a+b,t:"sqrtcube"};
  },
  sets: ()=>{
    let shared=ri(1,3), onlyA=ri(1,3), onlyB=ri(1,3);
    let nums=shuffle([1,2,3,4,5,6,7,8,9,10,11,12]);
    let A=[...nums.slice(0,onlyA),...nums.slice(6,6+shared)].sort((a,b)=>a-b);
    let B=[...nums.slice(onlyA,onlyA+onlyB),...nums.slice(6,6+shared)].sort((a,b)=>a-b);
    let type=ri(0,2);
    if(type===0){
      let inter=nums.slice(6,6+shared);
      return {q:`A={${A.join(',')}} B={${B.join(',')}} |A∩B| =`,a:inter.length,t:"sets"};
    }
    if(type===1){
      let union=[...new Set([...A,...B])];
      return {q:`A={${A.join(',')}} B={${B.join(',')}} |A∪B| =`,a:union.length,t:"sets"};
    }
    let n=ri(3,5);
    return {q:`How many subsets does a ${n}-element set have?`,a:Math.pow(2,n),t:"sets"};
  },
  base: ()=>{
    let type=ri(0,2);
    if(type===0){
      let val=ri(1,255);
      return {q:`${val.toString(2)}₂ = ? (base 10)`,a:val,t:"base"};
    }
    if(type===1){
      let val=ri(1,31);
      return {q:`${val} in base 2 =`,a:parseInt(val.toString(2)),t:"base"};
    }
    let val=ri(8,511);
    if(ri(0,1)===0) return {q:`${val.toString(8)}₈ = ? (base 10)`,a:val,t:"base"};
    let val2=ri(1,63);
    return {q:`${val2} in base 8 =`,a:parseInt(val2.toString(8)),t:"base"};
  },
  equations: ()=>{
    let type=ri(0,2);
    if(type===0){
      let x=ri(-10,20), a=ri(1,8), b=ri(-20,20);
      let bStr = b>=0 ? `+ ${b}` : `− ${Math.abs(b)}`;
      let aStr = a===1?'x':`${a}x`;
      return {q:`${aStr} ${bStr} = ${a*x+b}. x =`,a:x,t:"equations"};
    }
    if(type===1){
      let x=ri(1,15), a=ri(2,6), b=ri(1,30);
      let aStr = a===1?'x':`${a}x`;
      return {q:`${aStr} − ${b} = ${a*x-b}. x =`,a:x,t:"equations"};
    }
    let b=ri(2,6), c=ri(2,10), a=ri(1,15);
    return {q:`(x + ${a}) ÷ ${b} = ${c}. x =`,a:b*c-a,t:"equations"};
  },
  repdec: ()=>{
    let type=ri(0,2);
    if(type===0){
      let a=ri(1,8);
      return {q:`0.${a}${a}${a}… = ? (fraction)`,a:`${a}/9`,t:"repdec"};
    }
    if(type===1){
      let a=ri(1,9),b=ri(0,9);
      let num=a*10+b, g=gcd(num,99);
      return {q:`0.${a}${b}${a}${b}… = ? (fraction)`,a:`${num/g}/${99/g}`,t:"repdec"};
    }
    let known=[[1,3,"0.333…"],[2,3,"0.667…"],[1,6,"0.167…"],[5,6,"0.833…"],[1,7,"0.143…"],[1,9,"0.111…"],[2,9,"0.222…"],[1,11,"0.0909…"]];
    let[n,d,dec]=pick(known);
    return {q:`${dec} = ? (fraction)`,a:`${n}/${d}`,t:"repdec"};
  },
  areaperi: ()=>{
    let type=ri(0,3);
    if(type===0){ let l=ri(3,25),w=ri(2,15); return {q:`Area of rectangle ${l} × ${w} =`,a:l*w,t:"areaperi"}; }
    if(type===1){ let r=ri(1,10); return {q:`Area of circle r=${r} = ?π`,a:r*r,t:"areaperi"}; }
    if(type===2){
      let b=ri(4,24),h=ri(2,20);
      if((b*h)%2!==0) h+=1;
      return {q:`Area of triangle, base=${b}, height=${h} =`,a:b*h/2,t:"areaperi"};
    }
    let d=ri(2,20);
    return {q:`Circumference of circle, diameter=${d} = ?π`,a:d,t:"areaperi"};
  },
  sequences: ()=>{
    let type=ri(0,2);
    if(type===0){
      let a=ri(1,20),d=ri(1,10);
      let terms=[a,a+d,a+2*d,a+3*d];
      return {q:`${terms.join(', ')}, … next term =`,a:a+4*d,t:"sequences"};
    }
    if(type===1){
      let a=ri(1,5),r=ri(2,4);
      let terms=[a,a*r,a*r*r,a*r*r*r];
      return {q:`${terms.join(', ')}, … next term =`,a:a*Math.pow(r,4),t:"sequences"};
    }
    // nth term of arithmetic sequence
    let a=ri(1,10),d=ri(1,8),n=ri(5,15);
    return {q:`a₁=${a}, d=${d}. Find a${n}.`,a:a+(n-1)*d,t:"sequences"};
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TIER 3 GENERATORS — Problems 41-60
// Exponents, Right Triangles, Coord Geo, Variation, Complex, Logs,
// Factorials/Perms/Combs, Probability, Binomial
// ═══════════════════════════════════════════════════════════════════════════
const GEN3 = {
  exponents: ()=>{
    let type=ri(0,3);
    if(type===0){ let a=ri(2,5),m=ri(1,4),n=ri(1,4); return {q:`${a}^${m} × ${a}^${n} = ${a}^?`,a:m+n,t:"exponents"}; }
    if(type===1){ let a=ri(2,5),m=ri(4,8),n=ri(1,3); return {q:`${a}^${m} ÷ ${a}^${n} = ${a}^?`,a:m-n,t:"exponents"}; }
    if(type===2){ let a=ri(2,4),m=ri(2,3),n=ri(2,3); return {q:`(${a}^${m})^${n} = ${a}^?`,a:m*n,t:"exponents"}; }
    let a=ri(2,4),e=ri(2,5);
    return {q:`${a}^${e} =`,a:Math.pow(a,e),t:"exponents"};
  },
  triangle: ()=>{
    let triples=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[12,16,20],[9,40,41],[20,21,29],[11,60,61],[15,20,25]];
    let[a,b,c]=pick(triples);
    let k=pick([1,2,3]);
    let type=ri(0,2);
    if(type===0) return {q:`Right △: legs ${a*k}, ${b*k}. Hypotenuse =`,a:c*k,t:"triangle"};
    if(type===1) return {q:`Right △: leg ${a*k}, hyp ${c*k}. Other leg =`,a:b*k,t:"triangle"};
    return {q:`Right △: leg ${b*k}, hyp ${c*k}. Other leg =`,a:a*k,t:"triangle"};
  },
  coordgeo: ()=>{
    let type=ri(0,2);
    if(type===0){
      let triples=[[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15]];
      let[dx,dy,d]=pick(triples);
      let x1=ri(-5,5),y1=ri(-5,5);
      return {q:`Distance: (${x1},${y1}) to (${x1+dx},${y1+dy}) =`,a:d,t:"coordgeo"};
    }
    if(type===1){
      let x1=ri(-10,10),y1=ri(-10,10),x2=ri(-10,10),y2=ri(-10,10);
      if((x1+x2)%2!==0) x2+=1;
      if((y1+y2)%2!==0) y2+=1;
      return {q:`Midpoint of (${x1},${y1}) & (${x2},${y2}): x =`,a:(x1+x2)/2,t:"coordgeo"};
    }
    let x1=ri(-5,5),y1=ri(-5,10),x2,y2;
    do{ x2=ri(-5,5); }while(x2===x1);
    y2=ri(-5,10);
    let num=y2-y1, den=x2-x1, g=gcd(Math.abs(num),Math.abs(den));
    let sn=num/g,sd=den/g;
    if(sd<0){sn=-sn;sd=-sd;}
    let slopeAns = sd===1 ? sn : `${sn}/${sd}`;
    return {q:`Slope: (${x1},${y1}) to (${x2},${y2}) =`,a:slopeAns,t:"coordgeo"};
  },
  variation: ()=>{
    if(ri(0,1)===0){
      let k=ri(2,10),x1=ri(1,8),x2=ri(1,8);
      return {q:`y varies directly as x. y=${k*x1} when x=${x1}. y when x=${x2} =`,a:k*x2,t:"variation"};
    }
    let x1=ri(1,8),x2=ri(1,8);
    let k=x1*ri(2,10);
    let y2=k/x2;
    if(y2!==Math.floor(y2)){x2=pick([1,2,4,5,8,10].filter(v=>k%v===0));y2=k/x2;}
    return {q:`y varies inversely as x. y=${k/x1} when x=${x1}. y when x=${x2} =`,a:y2,t:"variation"};
  },
  complex: ()=>{
    let type=ri(0,2);
    if(type===0){
      let a=ri(-5,5),b=ri(-5,5),c=ri(-5,5),d=ri(-5,5);
      let rr=a+c,im=b+d;
      // Build clean answer string
      let ans;
      if(im===0) ans=`${rr}`;
      else if(rr===0) ans = im===1?'i':im===-1?'−i':`${im<0?'−':''}${Math.abs(im)}i`;
      else {
        let imPart = im===1?'+i':im===-1?'−i':(im>0?`+${im}i`:`${im}i`);
        ans = `${rr}${imPart}`;
      }
      // Build clean question strings
      let bPart = b===0?'':(b>0?`+${b===1?'i':`${b}i`}`:(b===-1?'−i':`${b}i`));
      let dPart = d===0?'':(d>0?`+${d===1?'i':`${d}i`}`:(d===-1?'−i':`${d}i`));
      return {q:`(${a}${bPart}) + (${c}${dPart}) =`,a:ans,t:"complex"};
    }
    if(type===1){
      let n=ri(1,20);
      let cycle=['i','−1','−i','1'];
      return {q:`i^${n} =`,a:cycle[(n-1)%4],t:"complex"};
    }
    let triples=[[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15]];
    let[a,b,c]=pick(triples);
    if(ri(0,1)) return {q:`|${a} + ${b}i| =`,a:c,t:"complex"};
    return {q:`|${b} + ${a}i| =`,a:c,t:"complex"};
  },
  logs: ()=>{
    let type=ri(0,2);
    if(type===0){
      let b=pick([2,3,5,10]),n=ri(1,6);
      return {q:`log${b}(${Math.pow(b,n)}) =`,a:n,t:"logs"};
    }
    if(type===1){
      let a=ri(2,9),b=ri(2,9);
      return {q:`log(${a}) + log(${b}) = log(?)`,a:a*b,t:"logs"};
    }
    let n=ri(1,8);
    return {q:`log(${Math.pow(10,n)}) =`,a:n,t:"logs"};
  },
  factperm: ()=>{
    let type=ri(0,2);
    if(type===0){
      let n=ri(1,8), f=1; for(let i=2;i<=n;i++) f*=i;
      return {q:`${n}! =`,a:f,t:"factperm"};
    }
    if(type===1){
      let n=ri(4,8),r=ri(2,Math.min(n,4));
      let p=1; for(let i=n;i>n-r;i--) p*=i;
      return {q:`P(${n},${r}) =`,a:p,t:"factperm"};
    }
    let n=ri(4,8),r=ri(1,Math.min(n,4));
    let num=1,den=1;
    for(let i=0;i<r;i++){num*=(n-i);den*=(i+1);}
    return {q:`C(${n},${r}) =`,a:num/den,t:"factperm"};
  },
  probability: ()=>{
    let type=ri(0,2);
    if(type===0){
      let targets={2:1,3:2,4:3,5:4,6:5,7:6,8:5,9:4,10:3,11:2,12:1};
      let t=pick([2,3,4,5,6,7,8,9,10,11,12]);
      let num=targets[t],den=36,g=gcd(num,den);
      return {q:`P(sum=${t} on 2 dice) =`,a:`${num/g}/${den/g}`,t:"probability"};
    }
    if(type===1){
      let suits=['heart','diamond','club','spade'];
      return {q:`P(drawing a ${pick(suits)} from a deck) =`,a:`1/4`,t:"probability"};
    }
    let n=ri(2,5);
    return {q:`P(${n} heads in ${n} flips) =`,a:`1/${Math.pow(2,n)}`,t:"probability"};
  },
  binomial: ()=>{
    if(ri(0,1)===0){
      let n=ri(4,10),k=ri(1,Math.min(n,5));
      let num=1,den=1;
      for(let i=0;i<k;i++){num*=(n-i);den*=(i+1);}
      return {q:`Coefficient of x^${k} in (1+x)^${n} =`,a:num/den,t:"binomial"};
    }
    let n=ri(3,10);
    return {q:`Sum of row ${n} of Pascal's triangle =`,a:Math.pow(2,n),t:"binomial"};
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TIER 4 GENERATORS — Problems 61-70
// Volume/Surface Area, Trig, Composite Functions
// ═══════════════════════════════════════════════════════════════════════════
const GEN4 = {
  volume: ()=>{
    let type=ri(0,3);
    if(type===0){ let s=ri(2,10); return {q:`Volume of cube, side=${s} =`,a:s*s*s,t:"volume"}; }
    if(type===1){ let l=ri(2,8),w=ri(2,6),h=ri(2,5); return {q:`Volume of box ${l}×${w}×${h} =`,a:l*w*h,t:"volume"}; }
    if(type===2){
      let r=ri(1,5), num=4*r*r*r;
      if(num%3===0) return {q:`Volume of sphere r=${r} = ?π`,a:num/3,t:"volume"};
      return {q:`Surface area of sphere r=${r} = ?π`,a:4*r*r,t:"volume"};
    }
    let r=ri(1,6),h=ri(2,8);
    return {q:`Volume of cylinder r=${r}, h=${h} = ?π`,a:r*r*h,t:"volume"};
  },
  trig: ()=>{
    // Use right triangles with known sides to get clean numeric trig answers
    // Format: "In right △ with sides a, b, hyp c — find sin/cos/tan of the angle opposite side X"
    let triangles = [
      {a:3,b:4,c:5}, {a:5,b:12,c:13}, {a:8,b:15,c:17},
      {a:7,b:24,c:25}, {a:6,b:8,c:10}, {a:9,b:12,c:15},
      {a:9,b:40,c:41}, {a:20,b:21,c:29}
    ];
    let tri = pick(triangles);
    let type = ri(0,2);
    // Pick which angle (opposite 'a' or opposite 'b')
    let opp = ri(0,1)===0 ? tri.a : tri.b;
    let adj = opp===tri.a ? tri.b : tri.a;
    if(type===0){
      // sin = opp/hyp
      let g=gcd(opp,tri.c), ans = opp/g===1&&tri.c/g===1 ? `${opp}` : `${opp/g}/${tri.c/g}`;
      return {q:`Right △ sides ${tri.a}, ${tri.b}, ${tri.c}. sin(angle opp ${opp}) =`,a:`${opp/g}/${tri.c/g}`,t:"trig"};
    }
    if(type===1){
      // cos = adj/hyp
      let g=gcd(adj,tri.c);
      return {q:`Right △ sides ${tri.a}, ${tri.b}, ${tri.c}. cos(angle opp ${opp}) =`,a:`${adj/g}/${tri.c/g}`,t:"trig"};
    }
    // tan = opp/adj
    let g=gcd(opp,adj);
    if(opp/g===1 && adj/g===1) return {q:`Right △ sides ${tri.a}, ${tri.b}, ${tri.c}. tan(angle opp ${opp}) =`,a:`${opp/g}/${adj/g}`,t:"trig"};
    return {q:`Right △ sides ${tri.a}, ${tri.b}, ${tri.c}. tan(angle opp ${opp}) =`,a:`${opp/g}/${adj/g}`,t:"trig"};
  },
  compfunc: ()=>{
    let a=ri(1,4),b=ri(-5,5),c=ri(1,3),d=ri(-4,4),n=ri(1,6);
    let gn=c*n+d, fgn=a*gn+b;
    let fStr = (a===1?'x':`${a}x`) + (b>=0?` + ${b}`:` − ${Math.abs(b)}`);
    let gStr = (c===1?'x':`${c}x`) + (d>=0?` + ${d}`:` − ${Math.abs(d)}`);
    return {q:`f(x) = ${fStr}, g(x) = ${gStr}. f(g(${n})) =`,a:fgn,t:"compfunc"};
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TIER 5 GENERATORS — Problems 71-80
// Calculus (limits, derivatives, integrals), Max/Min, Asymptotes
// ═══════════════════════════════════════════════════════════════════════════
const GEN5 = {
  calculus: ()=>{
    let type=ri(0,3);
    if(type===0){
      let n=ri(2,6),x=ri(1,4);
      return {q:`d/dx(x^${n}) at x = ${x} =`,a:n*Math.pow(x,n-1),t:"calculus"};
    }
    if(type===1){
      let a=ri(1,5),n=ri(2,5);
      return {q:`d/dx(${a}x^${n}) = ${a*n}x^?`,a:n-1,t:"calculus"};
    }
    if(type===2){
      let a=ri(1,5),c=ri(1,8),d=ri(-10,10);
      let cStr = c===1?'x':`${c}x`;
      let dStr = d>=0 ? ` + ${d}` : ` − ${Math.abs(d)}`;
      return {q:`lim x→${a} of (${cStr}${dStr}) =`,a:c*a+d,t:"calculus"};
    }
    let n=ri(1,3),a=ri(1,4);
    let val=Math.pow(a,n+1)/(n+1);
    if(val===Math.floor(val)) return {q:`∫₀^${a} x^${n} dx =`,a:val,t:"calculus"};
    let nn=ri(2,5),xx=ri(1,3);
    return {q:`d/dx(x^${nn}) at x = ${xx} =`,a:nn*Math.pow(xx,nn-1),t:"calculus"};
  },
  maxmin: ()=>{
    let a=pick([-3,-2,-1,1,2,3]);
    let vx=ri(-4,4), b=-2*a*vx, vy=ri(-10,10), c=vy-a*vx*vx;
    let word=a>0?'minimum':'maximum';
    // Build pretty quadratic string
    let aStr = a===1?'x²':a===-1?'−x²':`${a}x²`;
    let bStr = b===0?'':b>0?` + ${b===1?'x':`${b}x`}`:` − ${Math.abs(b)===1?'x':`${Math.abs(b)}x`}`;
    let cStr = c===0?'':c>0?` + ${c}`:` − ${Math.abs(c)}`;
    return {q:`y = ${aStr}${bStr}${cStr}. ${word} value of y =`,a:vy,t:"maxmin"};
  },
  asymptote: ()=>{
    if(ri(0,1)===0){
      let a=ri(1,8),b=ri(1,8),g=gcd(a,b);
      let ans=a/b===Math.floor(a/b)?`${a/b}`:`${a/g}/${b/g}`;
      return {q:`Horiz. asymptote of y = (${a}x² + 3x) / (${b}x² + 1) =`,a:ans,t:"asymptote"};
    }
    let a=ri(-5,5);
    let xStr = a>=0 ? `x − ${a}` : `x + ${Math.abs(a)}`;
    return {q:`Vert. asymptote of y = 1/(${xStr}) is x =`,a:a,t:"asymptote"};
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UIL SEQUENCING CHART — ordered topic slots per band
// Each sub-array lists generator keys valid for that problem position.
// Within each band, topics appear in the order UIL prescribes.
// ═══════════════════════════════════════════════════════════════════════════

// Problems 1-20
const SEQ_1_20 = [
  ['add'],                          // 1  — addition
  ['sub'],                          // 2  — subtraction
  ['add','sub'],                    // 3  — add or sub
  ['mul'],                          // 4  — multiplication
  ['mul','ops'],                    // 5  — mult / order-of-ops
  ['ops'],                          // 6  — order of operations
  ['mul','mul11','mul25','near100','equidist','sq5','special'], // 7  — mult shortcuts
  ['mul11','mul25','near100','equidist'], // 8  — mult shortcuts
  ['sq'],                           // 9  — squaring
  ['sq','sq5'],                     // 10 — squaring (incl ending-in-5)
  ['div'],                          // 11 — division
  ['fracdec','pct'],                // 12 — fraction/decimal compare & conversion
  ['conv','roman'],                 // 13 — conversions (roman, units)
  ['conv','roman'],                 // 14 — conversions
  ['lcm','gcd'],                    // 15 — GCD / LCM
  ['pct'],                          // 16 — percent problems
  ['mean'],                         // 17 — mean / median
  ['series'],                       // 18 — sums of integers
  ['rem'],                          // 19 — remainder problems
  ['rem','powers','fib','polygon','special'], // 20 — number theory
];

// Problems 21-40
const SEQ_21_40 = [
  ['powers'],                       // 21 — powers of numbers
  ['powers'],                       // 22
  ['subst'],                        // 23 — substitution
  ['subst'],                        // 24
  ['absval'],                       // 25 — absolute value
  ['ratio'],                        // 26 — ratio / proportion
  ['ratio'],                        // 27
  ['sqrtcube'],                     // 28 — square roots / cube roots
  ['sqrtcube'],                     // 29
  ['sets'],                         // 30 — sets
  ['base'],                         // 31 — base conversion
  ['base'],                         // 32
  ['equations'],                    // 33 — solving equations
  ['equations'],                    // 34
  ['repdec'],                       // 35 — repeating decimals → fractions
  ['repdec'],                       // 36
  ['areaperi'],                     // 37 — perimeter & area
  ['areaperi'],                     // 38
  ['sequences'],                    // 39 — sequences
  ['sequences'],                    // 40
];

// Problems 41-60
const SEQ_41_60 = [
  ['exponents'],                    // 41 — laws of exponents
  ['exponents'],                    // 42
  ['triangle'],                     // 43 — right triangle problems
  ['triangle'],                     // 44
  ['coordgeo'],                     // 45 — coordinate geometry
  ['coordgeo'],                     // 46
  ['variation'],                    // 47 — direct / inverse variation
  ['variation'],                    // 48
  ['binomial'],                     // 49 — sequences & series (finite/infinite)
  ['complex'],                      // 50 — complex numbers
  ['complex'],                      // 51
  ['logs'],                         // 52 — logarithms
  ['logs'],                         // 53
  ['factperm'],                     // 54 — factorials / perms / combs
  ['factperm'],                     // 55
  ['probability'],                  // 56 — probability / odds
  ['probability'],                  // 57
  ['binomial'],                     // 58 — binomial theorem
  ['binomial'],                     // 59
  ['exponents','logs','factperm'],  // 60 — roots of equations / mixed
];

// Problems 61-70
const SEQ_61_70 = [
  ['volume'],                       // 61 — volume & surface area
  ['volume'],                       // 62
  ['trig'],                         // 63 — trigonometry
  ['trig'],                         // 64
  ['compfunc'],                     // 65 — composite functions
  ['compfunc'],                     // 66
  ['volume','trig'],                // 67 — mixed tier 4
  ['trig','compfunc'],              // 68
  ['volume','compfunc'],            // 69
  ['trig','volume','compfunc'],     // 70
];

// Problems 71-80
const SEQ_71_80 = [
  ['calculus'],                     // 71 — limits
  ['calculus'],                     // 72 — derivatives
  ['calculus'],                     // 73
  ['asymptote'],                    // 74 — asymptotes
  ['asymptote'],                    // 75
  ['maxmin'],                       // 76 — max / min problems
  ['maxmin'],                       // 77
  ['calculus'],                     // 78 — definite integration
  ['calculus','maxmin'],            // 79 — mixed calculus
  ['calculus','asymptote','maxmin'], // 80
];

// ─── Sequenced test builder ────────────────────────────────────────────────
function buildSequencedTest(){
  // Try to use real UIL problems from BUILTIN_PROBLEMS first
  const builtin = (typeof BUILTIN_PROBLEMS !== 'undefined') ? BUILTIN_PROBLEMS : [];
  const edits = getProblemEdits();

  if(builtin.length > 0){
    // Group problems by year+test combo
    const combos = {};
    builtin.forEach(p => {
      if(p.num >= 1 && p.num <= 80){
        const key = p.year + '-' + p.test;
        if(!combos[key]) combos[key] = {};
        combos[key][p.num] = p;
      }
    });

    const comboKeys = Object.keys(combos);
    const shuffled = shuffle([...comboKeys]);

    // Pick the combo with the most problems
    let bestKey = shuffled[0];
    let bestCount = Object.keys(combos[bestKey]||{}).length;
    for(const k of shuffled){
      const c = Object.keys(combos[k]).length;
      if(c > bestCount){ bestKey = k; bestCount = c; }
      if(c >= 80) break;
    }

    const chosenCombo = combos[bestKey] || {};
    const [year, test] = bestKey.split('-');
    const source = year + ' Test ' + test;
    const problems = [];

    // Generators for fallback by tier
    const seqs = [
      {seq:SEQ_1_20, gen:GEN, start:1},
      {seq:SEQ_21_40, gen:GEN2, start:21},
      {seq:SEQ_41_60, gen:GEN3, start:41},
      {seq:SEQ_61_70, gen:GEN4, start:61},
      {seq:SEQ_71_80, gen:GEN5, start:71}
    ];

    for(let num = 1; num <= 80; num++){
      let prob = chosenCombo[num];
      // Fill gap from another random combo
      if(!prob){
        for(const k of shuffled){
          if(k !== bestKey && combos[k][num]){
            prob = combos[k][num];
            break;
          }
        }
      }

      if(prob){
        let p = {...prob, num: num};
        const editKey = p.num+'-'+p.year+'-'+p.test;
        if(edits[editKey]){ p.q = edits[editKey].q; p.a = edits[editKey].a; }
        problems.push(p);
      } else {
        // Fallback to generator for this position
        let generated = null;
        for(const tier of seqs){
          const idx = num - tier.start;
          if(idx >= 0 && idx < tier.seq.length){
            const slot = tier.seq[idx];
            generated = {...tier.gen[pick(slot)](), num: num};
            break;
          }
        }
        problems.push(generated || {q: num + ' = ?', a: '0', t: 'add', num: num});
      }
    }

    return {problems: problems, source: source};
  }

  // Fallback: use REAL_BASIC + generators (original behavior)
  let probs=[];
  let realByType={};
  REAL_BASIC.forEach(p=>{ if(!realByType[p.t]) realByType[p.t]=[]; realByType[p.t].push(p); });
  Object.keys(realByType).forEach(t=>{ realByType[t]=shuffle(realByType[t]); });
  let usedReal={};

  SEQ_1_20.forEach((slot,i)=>{
    if(i===9){ probs.push({...APPROX.tier1(),num:10}); return; }
    if(i===19){ probs.push({...APPROX.tier1hard(),num:20}); return; }
    let realP=null;
    for(let key of shuffle([...slot])){
      let pool=realByType[key]||[], idx=usedReal[key]||0;
      if(idx<pool.length){ realP=pool[idx]; usedReal[key]=idx+1; break; }
    }
    probs.push(realP ? {...realP,num:i+1} : {...GEN[pick(slot)](),num:i+1});
  });
  SEQ_21_40.forEach((slot,i)=>{
    if(i===9) probs.push({...APPROX.tier2(),num:30});
    else if(i===19) probs.push({...APPROX.advanced(),num:40});
    else probs.push({...GEN2[pick(slot)](),num:i+21});
  });
  SEQ_41_60.forEach((slot,i)=>{
    if(i===9||i===19) probs.push({...APPROX.advanced(),num:i+41});
    else probs.push({...GEN3[pick(slot)](),num:i+41});
  });
  SEQ_61_70.forEach((slot,i)=>{
    if(i===9) probs.push({...APPROX.advanced(),num:70});
    else probs.push({...GEN4[pick(slot)](),num:i+61});
  });
  SEQ_71_80.forEach((slot,i)=>{
    if(i===9) probs.push({...APPROX.advanced(),num:80});
    else probs.push({...GEN5[pick(slot)](),num:i+71});
  });

  return {problems: probs, source: ''};
}

// ─── Timed round builder (20 problems, sequenced like the real 1-20) ───────
function buildTimedRound(count){
  // Try to use real UIL problems from BUILTIN_PROBLEMS first
  const builtin = (typeof BUILTIN_PROBLEMS !== 'undefined') ? BUILTIN_PROBLEMS : [];

  // Apply user edits if any
  const edits = getProblemEdits();

  if(builtin.length > 0){
    // Group problems by year+test combo
    const combos = {};
    builtin.forEach(p => {
      if(p.num >= 1 && p.num <= count){
        const key = p.year + '-' + p.test;
        if(!combos[key]) combos[key] = {};
        combos[key][p.num] = p;
      }
    });

    // Find combos that have all (or most) problems 1-count
    const comboKeys = Object.keys(combos);
    const shuffled = shuffle([...comboKeys]);

    // Pick the best combo (most complete)
    let bestKey = shuffled[0];
    let bestCount = Object.keys(combos[bestKey]||{}).length;
    for(const k of shuffled){
      const c = Object.keys(combos[k]).length;
      if(c > bestCount){ bestKey = k; bestCount = c; }
      if(c >= count) break; // Found a complete test
    }

    // Build problems from the chosen combo, fill gaps from other combos
    const problems = [];
    const chosenCombo = combos[bestKey] || {};
    const [year, test] = bestKey.split('-');
    const source = year + ' Test ' + test;

    for(let i = 1; i <= count; i++){
      let prob = chosenCombo[i];

      // Fill gap from another random combo
      if(!prob){
        for(const k of shuffled){
          if(k !== bestKey && combos[k][i]){
            prob = combos[k][i];
            break;
          }
        }
      }

      if(prob){
        let p = {...prob, num: i};
        // Apply user edits
        const editKey = p.num+'-'+p.year+'-'+p.test;
        if(edits[editKey]){ p.q = edits[editKey].q; p.a = edits[editKey].a; }
        problems.push(p);
      } else {
        // Fallback to generator for this position
        const slot = SEQ_1_20[i-1] || ['add'];
        problems.push({...GEN[pick(slot)](), num: i});
      }
    }

    return {problems: problems, source: source};
  }

  // Fallback: use REAL_BASIC + generators (original behavior)
  let realByType={};
  REAL_BASIC.forEach(p=>{ if(!realByType[p.t]) realByType[p.t]=[]; realByType[p.t].push(p); });
  Object.keys(realByType).forEach(t=>{ realByType[t]=shuffle(realByType[t]); });
  let usedReal={};

  const fallbackProbs = SEQ_1_20.slice(0,count).map((slot,i)=>{
    if(i===9 && count>=10) return {...APPROX.tier1(),num:10};
    if(i===19 && count>=20) return {...APPROX.tier1hard(),num:20};
    let realP=null;
    for(let key of shuffle([...slot])){
      let pool=realByType[key]||[], idx=usedReal[key]||0;
      if(idx<pool.length){ realP=pool[idx]; usedReal[key]=idx+1; break; }
    }
    return realP ? {...realP,num:i+1} : {...GEN[pick(slot)](),num:i+1};
  });
  return {problems: fallbackProbs, source: ''};
}

// ═══════════════════════════════════════════════════════════════════════════
// APP STATE
// ═══════════════════════════════════════════════════════════════════════════
let state = {
  screen:'menu',        // menu | test | results | stats
  problems:[],
  idx:0,
  answer:'',
  score:0,
  timeLeft:0,
  timed:true,           // false = drill (no timer)
  answered:[],
  mode:'',              // timed20 | drill | topic | full
  topicKey:null,
  timer:null,
  feedback:'',          // '' | 'correct' | 'wrong'
  feedbackText:'',
  startTime:0,          // Track when test started for speed stats
  streak:0,
  drillCount:0,
  importedProblems:[],  // Real UIL problems imported from JSON
  solutionHTML:'',      // Current solution walkthrough HTML
  solutionVisible:false,// Whether solution is auto-expanded
  nextDelayed:false,    // Delay before next problem (so student reads solution)
  skippedPositions:[],  // Indices of skipped problems (for go-back feature)
  uilScore:0,           // UIL-style score (+5/-4/-4) for timed/full modes
  correctCount:0,       // Number of correct answers (for UIL score breakdown)
  wrongCount:0,         // Number of wrong answers (for UIL score breakdown)
  testSource:''         // Which test the problems came from (e.g., "2024 Test A")
};
function setState(p){Object.assign(state,p);render();}

// ═══════════════════════════════════════════════════════════════════════════
// TIMER
// ═══════════════════════════════════════════════════════════════════════════
function startTimer(){
  if(state.timer) clearInterval(state.timer);
  state.timer=setInterval(()=>{
    state.timeLeft--;
    let el=document.querySelector('.t-timer');
    if(el){
      el.textContent='⏱ '+fmtT(state.timeLeft);
      el.className='t-timer '+(state.timeLeft<30?'urgent':state.timeLeft<60?'warn':'ok');
    }
    if(state.timeLeft<=0){clearInterval(state.timer);state.timer=null;endTest();}
  },1000);
}
function stopTimer(){if(state.timer){clearInterval(state.timer);state.timer=null;}}
function fmtT(s){return Math.floor(s/60)+':'+(s%60).toString().padStart(2,'0');}

// ═══════════════════════════════════════════════════════════════════════════
// START MODES
// ═══════════════════════════════════════════════════════════════════════════
function startTimed(secs){
  stopTimer();
  let result=buildTimedRound(20);
  let probs=result.problems||result;
  let src=result.source||'';
  setState({screen:'test',problems:probs,idx:0,answer:'',score:0,timeLeft:secs,timed:true,answered:[],mode:'timed20',timedSecs:secs,feedback:'',feedbackText:'',streak:0,drillCount:0,startTime:Date.now(),skippedPositions:[],uilScore:0,correctCount:0,wrongCount:0,testSource:src});
  setTimeout(()=>{startTimer();focusInput();},50);
}
function startDrill(){
  stopTimer();
  let probs=buildBasicPool(40,null).map((p,i)=>({...p,num:i+1}));
  setState({screen:'test',problems:probs,idx:0,answer:'',score:0,timeLeft:0,timed:false,answered:[],mode:'drill',feedback:'',feedbackText:'',streak:0,drillCount:0,startTime:Date.now()});
  setTimeout(focusInput,50);
}
function startTopicDrill(key){
  stopTimer();
  let probs=buildBasicPool(40,key).map((p,i)=>({...p,num:i+1}));
  setState({screen:'test',problems:probs,idx:0,answer:'',score:0,timeLeft:0,timed:false,answered:[],mode:'topic',topicKey:key,feedback:'',feedbackText:'',streak:0,drillCount:0,startTime:Date.now()});
  setTimeout(focusInput,50);
}
function startFullTest(){
  stopTimer();
  let result=buildSequencedTest();
  let probs=result.problems||result;
  let src=result.source||'';
  setState({screen:'test',problems:probs,idx:0,answer:'',score:0,timeLeft:600,timed:true,answered:[],mode:'full',feedback:'',feedbackText:'',streak:0,drillCount:0,startTime:Date.now(),skippedPositions:[],uilScore:0,correctCount:0,wrongCount:0,testSource:src});
  setTimeout(()=>{startTimer();focusInput();},50);
}
function focusInput(){let e=document.getElementById('ans-input');if(e)e.focus();}

// ═══════════════════════════════════════════════════════════════════════════
// SUBMIT / SKIP
// ═══════════════════════════════════════════════════════════════════════════
function normAns(s){
  // Normalize user or expected answer string for comparison
  s = String(s).trim().replace(/\s/g,'').toLowerCase();
  s = s.replace(/[−–]/g,'-'); // unify minus signs
  return s;
}
function answerMatchesSingle(userRaw, expected, starred){
  let u = normAns(userRaw);
  let e = normAns(expected);

  // Exact string match (handles fractions, trig, complex)
  if(u === e) return true;

  // If expected is a string fraction like "3/4", try parsing both as floats
  if(typeof expected === 'string' && expected.includes('/')){
    let parts = e.split('/');
    if(parts.length===2){
      let eVal = parseFloat(parts[0])/parseFloat(parts[1]);
      let uVal = parseFloat(u);
      if(!isNaN(eVal) && !isNaN(uVal) && Math.abs(uVal-eVal)<0.001) return true;
    }
  }

  // Numeric comparison
  let uNum = parseFloat(u);
  let eNum = typeof expected==='number' ? expected : parseFloat(e);
  if(!isNaN(uNum) && !isNaN(eNum)){
    if(starred && eNum!==0){
      return Math.abs(uNum-eNum) <= Math.abs(eNum)*0.05;
    }
    return Math.abs(uNum-eNum) < 0.0001;
  }

  return false;
}

function answerMatches(userRaw, expected, starred){
  // Support multiple accepted answers separated by |
  if(typeof expected === 'string' && expected.includes('|')){
    return expected.split('|').some(alt => answerMatchesSingle(userRaw, alt.trim(), starred));
  }
  return answerMatchesSingle(userRaw, expected, starred);
}

function submitAnswer(){
  let val=state.answer.trim();
  if(val==='') return;
  let cur=state.problems[state.idx];

  let correct = answerMatches(val, cur.a, cur.starred);
  let userAns = val;

  let isUIL = (state.mode==='timed20'||state.mode==='full');
  let rec={q:cur.q,a:cur.a,userAns,correct,num:cur.num,hint:cur.hint||null,t:cur.t||null};
  let newAnswered=[...state.answered,rec];
  let newScore=state.score+(isUIL ? (correct?5:-4) : (correct?1:0));
  let newCorrectCount=state.correctCount+(correct?1:0);
  let newWrongCount=state.wrongCount+(correct?0:1);
  let newStreak=correct?(state.streak+1):0;
  let newDrill=state.drillCount+1;
  // For timed/full: remove from skippedPositions if answering a previously skipped problem
  let newSkipped=[...state.skippedPositions].filter(si=>si!==state.idx);
  let newIdx=state.idx+1;

  // DRILL / TOPIC: instant feedback, refill if running low
  if(state.mode==='drill'||state.mode==='topic'){
    let newProbs=[...state.problems];
    if(newIdx>newProbs.length-8){
      let key=state.mode==='topic'?state.topicKey:null;
      newProbs.push(...buildBasicPool(30,key).map((p,i)=>({...p,num:newProbs.length+i+1})));
    }
    let fbText=correct?'✓ Correct!':'✗ Wrong — answer: '+displayAnswer(cur.a);
    if(!correct && cur.hint) fbText+=' | 💡 '+cur.hint;
    // Generate solution walkthrough
    let solHTML = renderSolution(cur.q, displayAnswer(cur.a), cur.t || null);
    let showSol = !correct; // Auto-show on wrong, hidden on correct
    setState({
      problems:newProbs, idx:newIdx, answer:'', answered:newAnswered,
      score:newScore, streak:newStreak, drillCount:newDrill,
      feedback:correct?'correct':'wrong',
      feedbackText:fbText,
      solutionHTML:solHTML,
      solutionVisible:showSol,
      nextDelayed:!correct
    });
    // If wrong, delay focus so student reads the solution
    if(!correct){
      setTimeout(function(){ state.nextDelayed=false; render(); },2000);
      setTimeout(focusInput,2100);
    } else {
      setTimeout(focusInput,60);
    }
    return;
  }

  // TIMED / FULL: advance or end
  // Find next unanswered problem (skip over already-answered positions when going back)
  let nextIdx = newIdx;
  if(nextIdx < state.problems.length){
    // If we answered a skipped problem (not at the end), jump to next skipped or end
    if(state.idx < state.problems.length - 1 && newSkipped.length > 0 && nextIdx >= state.problems.length){
      nextIdx = newSkipped[0]; // Go to first remaining skip
    }
  }

  if(nextIdx>=state.problems.length && newSkipped.length===0){
    state.answered=newAnswered; state.score=newScore;
    state.correctCount=newCorrectCount; state.wrongCount=newWrongCount;
    state.skippedPositions=newSkipped;
    endTest();
  } else {
    // If past end but skips remain, go to first skip
    if(nextIdx>=state.problems.length && newSkipped.length>0){
      nextIdx=newSkipped[0];
      newSkipped=newSkipped.filter(si=>si!==nextIdx);
    }
    setState({idx:nextIdx,answer:'',answered:newAnswered,score:newScore,
      correctCount:newCorrectCount,wrongCount:newWrongCount,
      skippedPositions:newSkipped,streak:newStreak,feedback:'',feedbackText:''});
    setTimeout(focusInput,30);
  }
}

function skipProblem(){
  let cur=state.problems[state.idx];
  let newIdx=state.idx+1;
  let newDrill=state.drillCount+1;

  // DRILL / TOPIC: record skip immediately with feedback
  if(state.mode==='drill'||state.mode==='topic'){
    let rec={q:cur.q,a:cur.a,userAns:null,correct:false,num:cur.num,hint:cur.hint||null,t:cur.t||null};
    let newAnswered=[...state.answered,rec];
    let newProbs=[...state.problems];
    if(newIdx>newProbs.length-8){
      let key=state.mode==='topic'?state.topicKey:null;
      newProbs.push(...buildBasicPool(30,key).map((p,i)=>({...p,num:newProbs.length+i+1})));
    }
    let skipSolHTML = renderSolution(cur.q, displayAnswer(cur.a), cur.t || null);
    setState({
      problems:newProbs, idx:newIdx, answer:'', answered:newAnswered,
      streak:0, drillCount:newDrill,
      feedback:'wrong', feedbackText:'⏭ Skipped — answer: '+displayAnswer(cur.a),
      solutionHTML:skipSolHTML,
      solutionVisible:true,
      nextDelayed:true
    });
    setTimeout(function(){ state.nextDelayed=false; render(); },2000);
    setTimeout(focusInput,2100);
    return;
  }

  // TIMED / FULL: don't record answer yet — add to skippedPositions for go-back
  let newSkipped=[...state.skippedPositions];
  if(!newSkipped.includes(state.idx)) newSkipped.push(state.idx);

  if(newIdx>=state.problems.length && newSkipped.length > 0){
    // Past last problem but have skips — go to first skipped
    let backIdx = newSkipped[0];
    setState({idx:backIdx,answer:'',skippedPositions:newSkipped,streak:0,feedback:'',feedbackText:''});
    setTimeout(focusInput,30);
  } else if(newIdx>=state.problems.length){
    // Past last problem, no skips — end test
    endTest();
  } else {
    setState({idx:newIdx,answer:'',skippedPositions:newSkipped,streak:0,feedback:'',feedbackText:''});
    setTimeout(focusInput,30);
  }
}

function goBackToSkipped(){
  if(state.skippedPositions.length === 0) return;
  let backIdx = state.skippedPositions[0];
  // Remove from skipped list (will re-add if they skip again)
  let newSkipped = state.skippedPositions.filter(si=>si!==backIdx);
  setState({idx:backIdx,answer:'',skippedPositions:newSkipped,feedback:'',feedbackText:''});
  setTimeout(focusInput,30);
}

function endTest(){
  stopTimer();
  let isUIL = (state.mode==='timed20'||state.mode==='full');

  // For UIL modes: record remaining skipped problems as -4 each
  if(isUIL && state.skippedPositions.length > 0){
    let newAnswered = [...state.answered];
    let skipCount = 0;
    state.skippedPositions.forEach(si => {
      let cur = state.problems[si];
      // Only add if not already in answered
      let already = newAnswered.some(a => a.num === cur.num);
      if(!already){
        newAnswered.push({q:cur.q,a:cur.a,userAns:null,correct:false,num:cur.num,hint:cur.hint||null,t:cur.t||null,skipped:true});
        skipCount++;
      }
    });
    state.answered = newAnswered;
    state.score = state.score - (skipCount * 4);
    state.wrongCount = state.wrongCount; // wrong stays same
    state.skippedPositions = [];
  }

  // Calculate UIL score breakdown
  if(isUIL){
    let correct = state.answered.filter(a=>a.correct).length;
    let wrong = state.answered.filter(a=>!a.correct && a.userAns!==null && !a.skipped).length;
    let skipped = state.answered.filter(a=>a.userAns===null || a.skipped).length;
    let unanswered = state.problems.length - state.answered.length;
    state.uilScore = (correct * 5) - (wrong * 4) - (skipped * 4) - (unanswered * 4);
    state.correctCount = correct;
    state.wrongCount = wrong;
  }

  // Record session stats
  let timeUsed = state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : 0;
  let topicBreakdown = getTopicBreakdown(state.answered);

  recordSession({
    mode: state.mode,
    score: isUIL ? state.uilScore : state.score,
    total: state.answered.length,
    timeUsed: timeUsed,
    topicBreakdown: topicBreakdown
  });

  setState({screen:'results'});
}
function goMenu(){stopTimer();setState({screen:'menu',problems:[],idx:0,answer:'',score:0,timeLeft:0,answered:[],feedback:'',feedbackText:'',streak:0,drillCount:0,solutionHTML:'',solutionVisible:false,nextDelayed:false,skippedPositions:[],uilScore:0,correctCount:0,wrongCount:0,testSource:''});}

// ═══════════════════════════════════════════════════════════════════════════
// SOLUTION HINTS (detailed walkthroughs for learning)
// ═══════════════════════════════════════════════════════════════════════════
function getSolutionHint(q,ans,topic){
  // Provide step-by-step explanation based on problem type and question
  if(!topic) return "Review the problem and try breaking it into smaller steps.";
  
  // ENHANCED ARITHMETIC STRATEGIES - parse the actual numbers from the question
  if(topic==='add' || topic==='sub' || topic==='mul' || topic==='div' || topic==='ops'){
    return getArithmeticStrategy(q, ans, topic);
  }
  
  // Multiplication tricks
  if(topic==='mul11') return "To multiply by 11: add the digits and insert between them. If sum ≥10, carry the 1.";
  if(topic==='mul25') return "To multiply by 25: divide by 4, then multiply by 100. (Since 25 = 100/4)";
  if(topic==='near100') return "Use (100-a)(100-b) = 10000 - 100a - 100b + ab. Example: 97×98 = 10000-300-200+6 = 9506.";
  
  // Squaring tricks
  if(topic==='sq5' || topic==='sq'){
    return getSquaringStrategy(q, ans);
  }
  
  // Cubing tricks
  if(topic==='cube'){
    let nums = q.match(/\d+/g);
    if(nums && nums.length > 0){
      let n = parseInt(nums[0]);
      if(n <= 10){
        return `<strong>Memorize small cubes:</strong> 1³=1, 2³=8, 3³=27, 4³=64, 5³=125, 6³=216, 7³=343, 8³=512, 9³=729, 10³=1000.`;
      }
      if(n >= 10 && n <= 20){
        let tens = Math.floor(n/10) * 10;
        let ones = n % 10;
        return `<strong>Expand (a+b)³:</strong> ${n}³ = (${tens}+${ones})³ = ${tens}³ + 3(${tens}²×${ones}) + 3(${tens}×${ones}²) + ${ones}³. Calculate each term and add.`;
      }
    }
    return "Memorize cubes 1³ through 10³. For larger numbers, use (a+b)³ = a³ + 3a²b + 3ab² + b³.";
  }
  
  // Series and sequences
  if(topic==='series'){
    if(q.includes('1 + 2 + 3')) return "Triangular numbers: sum 1→n = n(n+1)/2. Example: 1+2+...+10 = 10×11/2 = 55.";
    if(q.includes('… =') && q.includes('+') && !q.includes('²') && !q.includes('³')) return "Arithmetic series: Sum = count × (first + last) / 2. First find number of terms: count = (last−first)/d + 1.";
    if(q.includes('+ … =') && !q.includes('(')) return "Infinite geometric series: Sum = a/(1−r). Find the ratio r by dividing consecutive terms.";
    if(q.includes('divisor')) return "List all positive divisors of n and add them. For prime powers: σ(p^k) = (p^(k+1)−1)/(p−1).";
    if(q.includes('triangular')) return "T(n) = n(n+1)/2. Triangular numbers: 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, ...";
    if(q.includes('1²') || q.includes('² +')) return "Sum of squares: 1²+2²+...+n² = n(n+1)(2n+1)/6.";
    if(q.includes('1³') || q.includes('³ +')) return "Sum of cubes: 1³+2³+...+n³ = [n(n+1)/2]² = (triangular number)².";
    if(q.startsWith('(') && q.includes(')²')) return "Arithmetic series squared: first find the sum inside, then square the result.";
    return "Look for patterns: arithmetic (constant difference) or geometric (constant ratio). Sum = count×(first+last)/2 for arithmetic.";
  }
  
  // Fractions and decimals
  if(topic==='fracdec'){
    if(q.includes('%')) return "Convert percent to fraction: divide by 100 and simplify. Example: 25% = 25/100 = 1/4.";
    return "To convert fraction to decimal: divide numerator by denominator.";
  }
  
  // Powers
  if(topic==='powers') return "Memorize common powers: 2¹⁰=1024, 3⁵=243, 5⁴=625. Use exponent laws: aᵐ×aⁿ = aᵐ⁺ⁿ, (aᵐ)ⁿ = aᵐⁿ.";
  
  // Remainders
  if(topic==='rem') return "To find remainder of a÷b: compute a mod b, or subtract multiples of b from a until result <b.";
  
  // LCM/GCD
  if(topic==='lcm'||topic==='gcd'){
    if(topic==='lcm') return "LCM = (a×b)/GCD(a,b). Or list multiples until you find the first common one.";
    return "GCD: use Euclidean algorithm or factor both numbers and take common factors.";
  }
  
  // Percentages
  if(topic==='pct') return "For percent problems: 'is/of = %/100'. Cross-multiply to solve.";
  
  // Mean/median/mode
  if(topic==='mean') return "Mean = sum÷count. Median = middle value (sort first). Mode = most frequent value.";
  
  // Geometry
  if(topic==='areaperi') return "Rectangle: A=lw, P=2(l+w). Triangle: A=½bh. Circle: A=πr², C=2πr.";
  if(topic==='coordgeo'){
    if(q.includes('Distance')) return "Distance = √[(x₂-x₁)²+(y₂-y₁)²]. Memorize Pythagorean triples: 3-4-5, 5-12-13, 8-15-17.";
    if(q.includes('Slope')) return "Slope = (y₂-y₁)/(x₂-x₁). Rise over run.";
    if(q.includes('Midpoint')) return "Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2). Average the coordinates.";
  }
  if(topic==='triangle') return "Pythagorean theorem: a²+b²=c². Memorize common triples.";
  if(topic==='volume') return "Cube: V=s³. Box: V=lwh. Sphere: V=4πr³/3. Cylinder: V=πr²h.";
  
  // Algebra
  if(topic==='equations') return "Isolate the variable: use inverse operations. Example: 2x+5=13 → 2x=8 → x=4.";
  if(topic==='absval') return "Absolute value |x| is distance from zero. Always non-negative. |a-b| = distance between a and b.";
  
  // Advanced
  if(topic==='complex') return "i²=-1, i³=-i, i⁴=1 (cycle repeats). |a+bi| = √(a²+b²).";
  if(topic==='logs') return "logₐ(x) asks: 'a to what power = x?'. log(xy) = log(x)+log(y).";
  if(topic==='trig') return "Right triangle: sin=opp/hyp, cos=adj/hyp, tan=opp/adj. Memorize for 30-60-90 and 45-45-90 triangles.";
  if(topic==='probability') return "P(event) = favorable/total. For dice: 36 total outcomes. For cards: 52 total.";
  
  // Calculus
  if(topic==='calculus') return "Derivative: power rule d/dx(xⁿ) = nxⁿ⁻¹. Limit: substitute x value if no division by zero.";
  
  return "Break the problem into steps. Check your arithmetic carefully.";
}

// New helper function for detailed arithmetic strategies
function getArithmeticStrategy(q, ans, topic){
  // Extract numbers from the question
  let nums = q.match(/-?\d+/g);
  if(!nums || nums.length < 2) return "Work through the calculation step by step.";
  
  let a = parseInt(nums[0]);
  let b = parseInt(nums[1]);
  
  // ADDITION strategies
  if(topic === 'add'){
    if(b >= 90 && b <= 99){
      return `Add to nearest 100, then adjust: ${a} + ${b} = ${a} + 100 − ${100-b} = ${a+100} − ${100-b} = ${ans}.`;
    }
    if(a % 10 + b % 10 === 10){
      return `Friendly numbers (add to 10): ${a} + ${b} = ${Math.floor(a/10)*10} + ${Math.floor(b/10)*10} + 10 = ${ans}.`;
    }
    if(b <= 10){
      return `Count up: ${a} + ${b} = ${a} → ${a+1} → ... → ${ans}.`;
    }
    return `Break into parts: ${a} + ${b} = ${a} + ${Math.floor(b/10)*10} + ${b%10} = ${a+Math.floor(b/10)*10} + ${b%10} = ${ans}.`;
  }
  
  // SUBTRACTION strategies
  if(topic === 'sub'){
    if(b >= 90 && b <= 99){
      return `Subtract 100, then add back: ${a} − ${b} = ${a} − 100 + ${100-b} = ${a-100} + ${100-b} = ${ans}.`;
    }
    if(a % 10 < b % 10){
      return `Borrow from tens: ${a} = ${Math.floor(a/10)*10} + ${a%10} → ${Math.floor(a/10)*10-10} + ${10+a%10}. Now ${10+a%10} − ${b%10} = ${10+a%10-b%10}, plus ${Math.floor(a/10)*10-10-Math.floor(b/10)*10} = ${ans}.`;
    }
    return `Count down or use place value: ${a} − ${b} = ${a} − ${Math.floor(b/10)*10} − ${b%10} = ${a-Math.floor(b/10)*10} − ${b%10} = ${ans}.`;
  }
  
  // MULTIPLICATION strategies
  if(topic === 'mul'){
    // Check for special patterns
    if(b === 11){
      return `×11 trick: ${a} × 11 → add digits ${Math.floor(a/10)} + ${a%10} = ${Math.floor(a/10)+a%10}, insert between → ${ans}. (If sum ≥10, carry the 1)`;
    }
    if(b === 25){
      return `×25 shortcut: ${a} × 25 = ${a} ÷ 4 × 100 = ${a/4} × 100 = ${ans}.`;
    }
    if(a >= 90 || b >= 90){
      let nearA = a >= 90 ? 100 - a : 0;
      let nearB = b >= 90 ? 100 - b : 0;
      if(nearA && nearB){
        return `Near 100: (100−${nearA})(100−${nearB}) = 10000 − ${nearA}00 − ${nearB}00 + ${nearA*nearB} = ${ans}.`;
      }
    }
    if(b <= 12){
      return `Break into parts: ${a} × ${b} = ${a} × ${Math.floor(b/2)*2} + ${a} × ${b%2} = ${a*Math.floor(b/2)*2} + ${a*(b%2)} = ${ans}.`;
    }
    // Distributive property
    let tens = Math.floor(b/10) * 10;
    let ones = b % 10;
    return `Use distributive: ${a} × ${b} = ${a} × (${tens} + ${ones}) = ${a*tens} + ${a*ones} = ${ans}.`;
  }
  
  // DIVISION strategies
  if(topic === 'div'){
    if(a % b === 0){
      // Check for patterns
      if(b <= 12){
        return `Know your division facts: ${a} ÷ ${b} = ${ans}. Practice multiples of ${b}: ${b}, ${b*2}, ${b*3}...`;
      }
      return `Factor and simplify: ${a} ÷ ${b} = ${ans}. Check: ${ans} × ${b} = ${a}.`;
    }
    return `Long division or factor: Work step-by-step to get ${ans}. Verify: ${ans} × ${b} ≈ ${a}.`;
  }
  
  // ORDER OF OPERATIONS (mixed)
  if(topic === 'ops'){
    return `Follow PEMDAS: <strong>1)</strong> Parentheses, <strong>2)</strong> Exponents, <strong>3)</strong> Multiply/Divide (left→right), <strong>4)</strong> Add/Subtract (left→right). Work through each step carefully.`;
  }
  
  return "Work through the problem step-by-step using mental math strategies.";
}

// Helper function for squaring strategies
function getSquaringStrategy(q, ans){
  let nums = q.match(/\d+/g);
  if(!nums || nums.length < 1) return "Memorize perfect squares or use (a+b)(a-b) patterns.";
  
  let n = parseInt(nums[0]);
  
  // Numbers ending in 5 - special trick
  if(n % 10 === 5){
    let tens = Math.floor(n/10);
    return `<strong>×5 ending trick:</strong> ${n}² → ${tens} × ${tens+1} = ${tens*(tens+1)}, then append 25 → <strong>${tens*(tens+1)}25</strong> = ${ans}.`;
  }
  
  // Numbers near a multiple of 10
  if(n % 10 === 1 || n % 10 === 9){
    let base = Math.round(n/10) * 10;
    let diff = n - base;
    if(diff > 0){
      return `<strong>Near ${base}:</strong> ${n}² = (${base}+${diff})² = ${base}² + 2(${base}×${diff}) + ${diff}² = ${base*base} + ${2*base*diff} + ${diff*diff} = ${ans}.`;
    } else {
      let posDiff = Math.abs(diff);
      return `<strong>Near ${base}:</strong> ${n}² = (${base}−${posDiff})² = ${base}² − 2(${base}×${posDiff}) + ${posDiff}² = ${base*base} − ${2*base*posDiff} + ${posDiff*posDiff} = ${ans}.`;
    }
  }
  
  // Numbers near 50
  if(n >= 45 && n <= 55 && n % 10 !== 5){
    let diff = n - 50;
    if(diff > 0){
      return `<strong>Near 50:</strong> ${n}² = (50+${diff})² = 2500 + 2(50×${diff}) + ${diff}² = 2500 + ${100*diff} + ${diff*diff} = ${ans}.`;
    } else {
      let posDiff = Math.abs(diff);
      return `<strong>Near 50:</strong> ${n}² = (50−${posDiff})² = 2500 − ${100*posDiff} + ${posDiff*posDiff} = ${ans}.`;
    }
  }
  
  // Difference of squares pattern for numbers near each other
  // Example: 63² = (60+3)(60+3) or use 63² = 60² + 2(60×3) + 3²
  if(n >= 20 && n <= 99){
    let tens = Math.floor(n/10) * 10;
    let ones = n % 10;
    return `<strong>Expand (a+b)²:</strong> ${n}² = (${tens}+${ones})² = ${tens}² + 2(${tens}×${ones}) + ${ones}² = ${tens*tens} + ${2*tens*ones} + ${ones*ones} = ${ans}.<br>Or memorize: common squares like 60²=3600, then adjust.`;
  }
  
  // Small numbers - just memorize
  if(n <= 20){
    return `<strong>Memorize small squares:</strong> 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, 7²=49, 8²=64, 9²=81, 10²=100, 11²=121, 12²=144, 15²=225, 20²=400. Know them cold!`;
  }
  
  return `Use (a+b)² = a² + 2ab + b² pattern, or break into ${Math.floor(n/10)*10} + ${n%10}.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURED SOLUTION WALKTHROUGH
// ═══════════════════════════════════════════════════════════════════════════
function getStructuredSolution(q, ans, topic){
  var steps = [];
  var trickName = '';
  var ansStr = String(ans);

  if(!topic){
    return {trickName:'General Approach', steps:[{label:'Solve', text:'Break the problem into smaller steps and work through carefully.'}], answer:ansStr};
  }

  // ARITHMETIC
  if(topic==='add'||topic==='sub'||topic==='mul'||topic==='div'||topic==='ops'){
    var nums = q.match(/-?[\d.]+/g);
    var a = nums && nums.length >= 1 ? parseFloat(nums[0]) : 0;
    var b = nums && nums.length >= 2 ? parseFloat(nums[1]) : 0;

    if(topic==='add'){
      trickName = 'Addition Strategy';
      steps.push({label:'Identify', text:'Addition problem: <strong>'+a+'</strong> + <strong>'+b+'</strong>'});
      if(b >= 90 && b <= 99){
        steps.push({label:'Trick', text:'Add to nearest 100, then subtract: '+a+' + 100 = <span class="solution-highlight">'+(a+100)+'</span>, then subtract '+(100-b)});
        steps.push({label:'Calculate', text:(a+100)+' \u2212 '+(100-b)+' = <span class="solution-highlight">'+ansStr+'</span>'});
      } else {
        var tens = Math.floor(b/10)*10;
        var ones = b%10;
        if(tens > 0 && ones > 0){
          steps.push({label:'Break apart', text:'Split: '+a+' + '+tens+' + '+ones});
          steps.push({label:'Calculate', text:a+' + '+tens+' = <span class="solution-highlight">'+(a+tens)+'</span>, then + '+ones+' = <span class="solution-highlight">'+ansStr+'</span>'});
        } else {
          steps.push({label:'Calculate', text:'Add directly: '+a+' + '+b+' = <span class="solution-highlight">'+ansStr+'</span>'});
        }
      }
    } else if(topic==='sub'){
      trickName = 'Subtraction Strategy';
      steps.push({label:'Identify', text:'Subtraction: <strong>'+a+'</strong> \u2212 <strong>'+b+'</strong>'});
      if(b >= 90 && b <= 99){
        steps.push({label:'Trick', text:'Subtract 100, add back: '+a+' \u2212 100 + '+(100-b)});
        steps.push({label:'Calculate', text:(a-100)+' + '+(100-b)+' = <span class="solution-highlight">'+ansStr+'</span>'});
      } else {
        steps.push({label:'Calculate', text:'Subtract step by step: '+a+' \u2212 '+b+' = <span class="solution-highlight">'+ansStr+'</span>'});
      }
    } else if(topic==='mul'){
      trickName = 'Multiplication Strategy';
      steps.push({label:'Identify', text:'Multiply: <strong>'+a+'</strong> \u00d7 <strong>'+b+'</strong>'});
      if(b === 11 || a === 11){
        var other = b === 11 ? a : b;
        trickName = '\u00d711 Trick';
        steps.push({label:'Trick', text:'For \u00d711: add the digits of '+other+' and insert between them'});
        steps.push({label:'Calculate', text:'Result = <span class="solution-highlight">'+ansStr+'</span> (carry if digit sum \u2265 10)'});
      } else if(b === 25 || a === 25){
        var other2 = b === 25 ? a : b;
        trickName = '\u00d725 Shortcut';
        steps.push({label:'Trick', text:'\u00d725 = \u00f74 \u00d7 100. So '+other2+' \u00f7 4 = '+(other2/4)});
        steps.push({label:'Calculate', text:(other2/4)+' \u00d7 100 = <span class="solution-highlight">'+ansStr+'</span>'});
      } else if(a >= 90 && b >= 90 && a <= 110 && b <= 110){
        trickName = 'Near 100 Method';
        var da = 100 - a;
        var db = 100 - b;
        steps.push({label:'Trick', text:'Both near 100: deficits are '+ Math.abs(da) +' and '+ Math.abs(db)});
        steps.push({label:'Calculate', text:'First digits: '+a+' \u2212 '+Math.abs(db)+' = '+(a - Math.abs(db))+', last two: '+Math.abs(da)+'\u00d7'+Math.abs(db)+'='+(Math.abs(da)*Math.abs(db))});
        steps.push({label:'Result', text:'<span class="solution-highlight">'+ansStr+'</span>'});
      } else {
        var tens2 = Math.floor(b/10)*10;
        var ones2 = b%10;
        if(tens2 > 0 && ones2 > 0){
          trickName = 'Distributive Property';
          steps.push({label:'Split', text:a+' \u00d7 ('+tens2+' + '+ones2+')'});
          steps.push({label:'Calculate', text:a+'\u00d7'+tens2+' = '+(a*tens2)+', '+a+'\u00d7'+ones2+' = '+(a*ones2)});
          steps.push({label:'Add', text:(a*tens2)+' + '+(a*ones2)+' = <span class="solution-highlight">'+ansStr+'</span>'});
        } else {
          steps.push({label:'Calculate', text:a+' \u00d7 '+b+' = <span class="solution-highlight">'+ansStr+'</span>'});
        }
      }
    } else if(topic==='div'){
      trickName = 'Division Strategy';
      steps.push({label:'Identify', text:'Divide: <strong>'+a+'</strong> \u00f7 <strong>'+b+'</strong>'});
      steps.push({label:'Calculate', text:a+' \u00f7 '+b+' = <span class="solution-highlight">'+ansStr+'</span>'});
      steps.push({label:'Verify', text:'Check: '+ansStr+' \u00d7 '+b+' = '+a});
    } else if(topic==='ops'){
      trickName = 'Order of Operations (PEMDAS)';
      steps.push({label:'Identify', text:'Multi-step: follow <strong>PEMDAS</strong>'});
      steps.push({label:'Order', text:'1) Parentheses  2) Exponents  3) Multiply/Divide  4) Add/Subtract'});
      steps.push({label:'Calculate', text:'Work left to right within each level \u2192 <span class="solution-highlight">'+ansStr+'</span>'});
    }
  }

  // SQUARES
  else if(topic==='sq'||topic==='sq5'||topic==='equidist'){
    var sqNums = q.match(/\d+/g);
    var n = sqNums ? parseInt(sqNums[0]) : 0;
    if(n % 10 === 5){
      trickName = 'Ending-in-5 Squaring Trick';
      var t5 = Math.floor(n/10);
      steps.push({label:'Identify', text:n+'\u00b2 \u2014 ends in 5!'});
      steps.push({label:'Trick', text:'Tens digit ('+t5+') \u00d7 next integer ('+t5+' \u00d7 '+(t5+1)+' = <span class="solution-highlight">'+(t5*(t5+1))+'</span>)'});
      steps.push({label:'Finish', text:'Append 25 \u2192 <span class="solution-highlight">'+ansStr+'</span>'});
    } else if(n >= 45 && n <= 55){
      trickName = 'Near-50 Method';
      var d50 = n - 50;
      steps.push({label:'Identify', text:n+'\u00b2 \u2014 close to 50'});
      steps.push({label:'Formula', text:'(50 + d)\u00b2 = 2500 + 100d + d\u00b2, where d = '+ d50});
      steps.push({label:'Calculate', text:'2500 + '+(100*d50)+' + '+(d50*d50)+' = <span class="solution-highlight">'+ansStr+'</span>'});
    } else if(n >= 11 && n <= 99){
      trickName = 'Expand (a+b)\u00b2 Method';
      var tn = Math.floor(n/10)*10;
      var on = n % 10;
      steps.push({label:'Identify', text:n+'\u00b2 = ('+tn+'+'+on+')\u00b2'});
      steps.push({label:'Expand', text:tn+'\u00b2 + 2('+tn+'\u00d7'+on+') + '+on+'\u00b2'});
      steps.push({label:'Calculate', text:(tn*tn)+' + '+(2*tn*on)+' + '+(on*on)+' = <span class="solution-highlight">'+ansStr+'</span>'});
    } else {
      trickName = 'Perfect Squares';
      steps.push({label:'Memorize', text:'Know your squares: '+n+'\u00b2 = <span class="solution-highlight">'+ansStr+'</span>'});
    }
  }

  // CUBES
  else if(topic==='cube'){
    trickName = 'Cubing';
    var cNums = q.match(/\d+/g);
    var cn = cNums ? parseInt(cNums[0]) : 0;
    steps.push({label:'Identify', text:cn+'\u00b3 (cube of '+cn+')'});
    if(cn <= 10){
      steps.push({label:'Memorize', text:'Small cubes: 1\u00b3=1, 2\u00b3=8, 3\u00b3=27, 4\u00b3=64, 5\u00b3=125, 6\u00b3=216, 7\u00b3=343, 8\u00b3=512, 9\u00b3=729, 10\u00b3=1000'});
    } else {
      var ct = Math.floor(cn/10)*10;
      var co = cn%10;
      steps.push({label:'Expand', text:'('+ct+'+'+co+')\u00b3 = '+ct+'\u00b3 + 3('+ct+'\u00b2)('+co+') + 3('+ct+')('+co+'\u00b2) + '+co+'\u00b3'});
    }
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // PERCENTAGES
  else if(topic==='pct'){
    trickName = 'Percentage Method';
    steps.push({label:'Identify', text:'Percentage problem'});
    steps.push({label:'Formula', text:'Use <strong>is/of = %/100</strong> and cross-multiply'});
    steps.push({label:'Calculate', text:'Solve for the unknown \u2192 <span class="solution-highlight">'+ansStr+'</span>'});
  }

  // FRACTIONS / DECIMALS
  else if(topic==='fracdec'){
    trickName = 'Fraction \u2194 Decimal Conversion';
    steps.push({label:'Identify', text:'Convert between fraction and decimal'});
    if(ansStr.includes('/')){
      steps.push({label:'Method', text:'Simplify the fraction: find GCD and divide both numerator and denominator'});
    } else {
      steps.push({label:'Method', text:'Divide numerator by denominator to get decimal'});
    }
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // REMAINDERS
  else if(topic==='rem'){
    trickName = 'Remainder Method';
    var rNums = q.match(/\d+/g);
    if(rNums && rNums.length >= 2){
      steps.push({label:'Identify', text:'Find remainder of '+rNums[0]+' \u00f7 '+rNums[1]});
      steps.push({label:'Divide', text:rNums[0]+' \u00f7 '+rNums[1]+' = quotient with remainder'});
      steps.push({label:'Extract', text:'Subtract (quotient \u00d7 '+rNums[1]+') from '+rNums[0]+' \u2192 <span class="solution-highlight">'+ansStr+'</span>'});
    } else {
      steps.push({label:'Method', text:'Divide and find the remainder \u2192 <span class="solution-highlight">'+ansStr+'</span>'});
    }
  }

  // LCM / GCD
  else if(topic==='lcm'||topic==='gcd'){
    trickName = topic==='lcm' ? 'Least Common Multiple' : 'Greatest Common Divisor';
    steps.push({label:'Identify', text:trickName+' problem'});
    if(topic==='lcm'){
      steps.push({label:'Method', text:'LCM(a,b) = (a \u00d7 b) / GCD(a,b), or list multiples'});
    } else {
      steps.push({label:'Method', text:'Use Euclidean algorithm or factor both numbers'});
    }
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // MULTIPLICATION TRICKS
  else if(topic==='mul11'){
    trickName = '\u00d711 Trick';
    steps.push({label:'Identify', text:'Multiplying by 11'});
    steps.push({label:'Trick', text:'Add adjacent digits, insert between them'});
    steps.push({label:'Note', text:'If digit sum \u2265 10, carry the 1 to the left'});
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }
  else if(topic==='mul25'){
    trickName = '\u00d725 Shortcut';
    steps.push({label:'Identify', text:'Multiplying by 25'});
    steps.push({label:'Trick', text:'\u00f7 4, then \u00d7 100 (since 25 = 100/4)'});
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }
  else if(topic==='near100'){
    trickName = 'Near 100 Multiplication';
    steps.push({label:'Identify', text:'Both numbers near 100'});
    steps.push({label:'Trick', text:'(100\u2212a)(100\u2212b): first two digits = 100\u2212a\u2212b, last two = a\u00d7b'});
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // SERIES
  else if(topic==='series'){
    trickName = 'Series Sum';
    if(q.includes('1 + 2 + 3')){
      steps.push({label:'Identify', text:'Sum of 1+2+3+…+n (triangular number)'});
      steps.push({label:'Formula', text:'Sum = n(n+1)/2'});
    } else if(q.includes('1²') || q.includes('² +')){
      steps.push({label:'Identify', text:'Sum of squares'});
      steps.push({label:'Formula', text:'1²+2²+…+n² = n(n+1)(2n+1)/6'});
    } else if(q.includes('1³') || q.includes('³ +')){
      steps.push({label:'Identify', text:'Sum of cubes'});
      steps.push({label:'Formula', text:'1³+2³+…+n³ = [n(n+1)/2]²'});
    } else if(q.includes('divisor')){
      steps.push({label:'Identify', text:'Sum of divisors'});
      steps.push({label:'Method', text:'List all positive divisors of n and add them'});
    } else if(q.includes('triangular')){
      steps.push({label:'Identify', text:'Triangular number T(n)'});
      steps.push({label:'Formula', text:'T(n) = n(n+1)/2'});
    } else if(q.includes('+ …') && !q.includes('(')){
      if(q.includes('…') && !q.includes('+ … +')){
        steps.push({label:'Identify', text:'Infinite geometric series'});
        steps.push({label:'Formula', text:'Sum = a/(1−r), where r = second term ÷ first term'});
      } else {
        steps.push({label:'Identify', text:'Arithmetic series'});
        steps.push({label:'Formula', text:'Sum = count × (first + last) / 2. Count = (last−first)/d + 1'});
      }
    } else if(q.startsWith('(') && q.includes(')²')){
      steps.push({label:'Identify', text:'Arithmetic series squared'});
      steps.push({label:'Method', text:'1) Find the sum of the series inside. 2) Square the result.'});
    } else {
      steps.push({label:'Identify', text:'Series/sum problem'});
      steps.push({label:'Method', text:'Arithmetic: Sum = count×(first+last)/2. Geometric: Sum = a/(1−r)'});
    }
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // MEAN
  else if(topic==='mean'){
    trickName = 'Mean / Average';
    steps.push({label:'Identify', text:'Find the average (mean)'});
    steps.push({label:'Formula', text:'Mean = sum of all values \u00f7 count of values'});
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // POWERS
  else if(topic==='powers'){
    trickName = 'Powers & Exponents';
    steps.push({label:'Method', text:'Use exponent rules: a\u1d50\u00d7a\u207f = a\u1d50\u207a\u207f'});
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // ROMAN NUMERALS
  else if(topic==='roman'){
    trickName = 'Roman Numerals';
    steps.push({label:'Convert', text:'I=1, V=5, X=10, L=50, C=100, D=500, M=1000'});
    steps.push({label:'Rule', text:'Subtract when smaller precedes larger (IV=4, IX=9)'});
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // CONVERSIONS
  else if(topic==='conv'){
    trickName = 'Unit Conversion';
    steps.push({label:'Identify', text:'Convert between units'});
    steps.push({label:'Method', text:'Multiply or divide by the conversion factor'});
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // GEOMETRY
  else if(topic==='areaperi'||topic==='coordgeo'||topic==='triangle'||topic==='volume'){
    trickName = 'Geometry';
    steps.push({label:'Identify', text:'Geometry problem'});
    steps.push({label:'Formula', text:'Apply the relevant formula for the shape'});
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  // CATCHALL
  else {
    trickName = 'Solution';
    steps.push({label:'Approach', text:'Break the problem into manageable steps'});
    steps.push({label:'Answer', text:'<span class="solution-highlight">'+ansStr+'</span>'});
  }

  return {trickName: trickName, steps: steps, answer: ansStr};
}

function renderSolution(q, ans, topic){
  var sol = getStructuredSolution(q, ans, topic);
  var stepsHTML = sol.steps.map(function(step, i){
    return '<div class="solution-step"><div class="step-num">'+(i+1)+'</div><div class="step-text"><strong>'+step.label+':</strong> '+step.text+'</div></div>';
  }).join('');
  return '<div class="solution-box-inline">' +
    '<div class="solution-trick-name">'+sol.trickName+'</div>' +
    stepsHTML +
    '<div class="solution-answer"><div class="answer-label">Answer</div><div class="answer-val">'+sol.answer+'</div></div>' +
    '</div>';
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════════════════
function render(){
  document.getElementById('app').innerHTML =
    state.screen==='menu'  ? renderMenu() :
    state.screen==='test'  ? renderTest() :
    state.screen==='stats' ? renderStats() :
    renderResults();
  attachListeners();
}
function renderMenu(){
  const CORE_KEYS=['add','sub','mul','div','sq','cube','rem','lcm','pct','conv','roman','mean'];
  const TRICK_KEYS=['mul11','mul25','near100','sq5','special','series','fracdec','powers','fib','polygon'];
  
  // Get quick stats preview + progress insights
  let stats = getStats();
  let insights = getProgressInsights();
  let statsPreview = stats.totalSessions > 0 ? 
    `<div class="stats-preview">
      <div class="sp-item">📊 ${stats.totalSessions} session${stats.totalSessions>1?'s':''}</div>
      <div class="sp-item">🎯 ${stats.overallAccuracy}% accuracy</div>
      ${stats.streak > 0 ? `<div class="sp-item">🔥 ${stats.streak} day streak!</div>` : ''}
      ${stats.bestScore.score > 0 ? `<div class="sp-item">🏆 Best: ${stats.bestScore.score} pts</div>` : ''}
    </div>` : '';
  
  // Build insight banner (top 2)
  let insightBanner = '';
  if(insights.length > 0){
    let cards = insights.slice(0, 2).map(ins => {
      let cls = ins.type === 'improvement' ? 'insight-positive' : ins.type === 'milestone' ? 'insight-milestone' : 'insight-tip';
      return `<div class="insight-card ${cls}">
        <div class="insight-icon">${ins.icon}</div>
        <div class="insight-body">
          <div class="insight-msg">${ins.message}</div>
          <div class="insight-detail">${ins.detail}</div>
        </div>
      </div>`;
    }).join('');
    insightBanner = `<div class="insight-section" style="max-width:920px;margin:16px auto 0;padding:0 20px;">${cards}</div>`;
  } else if(stats.totalSessions === 0){
    insightBanner = `<div class="insight-section" style="max-width:920px;margin:16px auto 0;padding:0 20px;">
      <div class="insight-card insight-tip">
        <div class="insight-icon">🚀</div>
        <div class="insight-body">
          <div class="insight-msg">Start your first session!</div>
          <div class="insight-detail">Pick a mode below to begin building your UIL skills.</div>
        </div>
      </div>
    </div>`;
  }

  function topicBtns(keys){
    return keys.map(k=>{
      let t=TOPICS[k];
      let realCt=REAL_BASIC.filter(p=>p.t===k||(k==='lcm'&&p.t==='gcd')).length;
      return `<button class="topic-btn" data-topic="${k}">
        <div class="tb-icon">${t.icon}</div>
        <div class="tb-name">${t.name}</div>
        <div class="tb-sub">${realCt>0?realCt+' real probs':'Generator'}</div>
      </button>`;
    }).join('');
  }

  return `
  <div class="header">
    <h1>UIL Number Sense Trainer</h1>
    <p>Master mental math for UIL competition</p>
    ${statsPreview}
    <button class="stats-btn" id="btn-stats">📈 View Progress & Stats</button>
  </div>
  ${insightBanner}
  <div class="menu-body">

    <div class="section-tag">⭐ Problems 1–20 Focus</div>
    <div class="focus-card">
      <div class="fc-head">
        <div class="fc-icon">🎯</div>
        <div>
          <h2>Problems 1–20 Training</h2>
          <p>On a real UIL test these 20 problems should take about 2.5 minutes if you're sharp — that's your foundation score. Practice here until you can crush them consistently.</p>
        </div>
      </div>
      <div class="mode-row">
        <button class="mode-btn" id="btn-timed-open">
          <div class="mb-title">⏱️ Timed Round</div>
          <div class="mb-desc">Pick your time — 2:30 up to 10:00</div>
        </button>
        <button class="mode-btn" id="btn-drill">
          <div class="mb-title">🔥 Drill Mode</div>
          <div class="mb-desc">Infinite problems, no timer. Instant feedback — build your speed.</div>
        </button>
      </div>
    </div>

    <div class="section-tag">📊 Core Skills</div>
    <div class="topic-grid">${topicBtns(CORE_KEYS)}</div>

    <div class="section-tag">🧠 Trick Drills — Shortcuts from the Heath Manual</div>
    <div class="topic-grid">${topicBtns(TRICK_KEYS)}</div>

    <div class="section-tag">🏆 Full Test</div>
    <div class="sec-row">
      <button class="sec-btn" id="btn-full">
        <div class="sb-title">🏆 Full 80-Problem Simulation</div>
        <div class="sb-desc">All difficulty levels, 10 minutes — complete UIL format</div>
      </button>
    </div>

    <div class="section-tag">📥 Import Real UIL Problems</div>
    <div class="sec-row">
      <button class="sec-btn" id="btn-import-json">
        <div class="sb-title">📂 Load Cleaned Problems</div>
        <div class="sb-desc">Import JSON from cleanup tool — add real UIL problems you've cleaned</div>
      </button>
      ${state.importedProblems.length > 0 ? `
      <button class="sec-btn" id="btn-view-imported">
        <div class="sb-title">📋 View Imported (${state.importedProblems.length})</div>
        <div class="sb-desc">Browse and practice your imported real problems</div>
      </button>
      ` : ''}
      <button class="sec-btn" id="btn-problem-editor">
        <div class="sb-title">✏️ Problem Editor (${Object.keys(getProblemEdits()).length} edits)</div>
        <div class="sb-desc">Browse all problems by test — fix garbled OCR text</div>
      </button>
    </div>
  </div>

  <!-- TIME PICKER MODAL (hidden until btn-timed-open clicked) -->
  <div class="modal-overlay" id="time-modal" style="display:none;">
    <div class="modal-box">
      <h2>⏱️ Pick Your Time</h2>
      <p class="modal-sub">All rounds use the same Problems 1–20 pool. Choose how long you want to work through them.</p>
      <button class="time-btn" data-secs="150">
        <div class="tb-row"><span class="tb-time">2 : 30</span><span class="tb-note">Real UIL pacing for 1–20</span></div>
      </button>
      <button class="time-btn" data-secs="300">
        <div class="tb-row"><span class="tb-time">5 : 00</span><span class="tb-note">Comfortable warm-up pace</span></div>
      </button>
      <button class="time-btn" data-secs="450">
        <div class="tb-row"><span class="tb-time">7 : 30</span><span class="tb-note">Relaxed practice</span></div>
      </button>
      <button class="time-btn" data-secs="600">
        <div class="tb-row"><span class="tb-time">10 : 00</span><span class="tb-note">Full UIL test length</span></div>
      </button>
      <button class="modal-close" id="btn-time-close">✕ Close</button>
    </div>
  </div>

  <!-- QUICK REFERENCE FAB + MODAL -->
  <button class="ref-fab" id="btn-ref-open" title="Quick Reference">📖</button>
  <div class="ref-modal" id="ref-modal">
    <div class="ref-content">
      <h2>📚 Quick Reference Guide</h2>
      
      <h3>🚀 Mental Math Shortcuts</h3>
      <div class="ref-grid">
        <div class="ref-card">
          <h4>Squaring (÷5)</h4>
          <p>45² → 4×5=20, then 2025<br>65² → 6×7=42, then 4225<br>Pattern: n(n+1) then 25</p>
        </div>
        <div class="ref-card">
          <h4>×11 Trick</h4>
          <p>34×11: Add 3+4=7, insert<br>→ 3<strong>7</strong>4 = 374<br>67×11: 6+7=13, carry<br>→ 737</p>
        </div>
        <div class="ref-card">
          <h4>×25 Shortcut</h4>
          <p>n×25 = n÷4 ×100<br>48×25: 48÷4=12 →1200<br>17×25: 17÷4=4.25 →425</p>
        </div>
        <div class="ref-card">
          <h4>Near 100</h4>
          <p>97×98: (100−3)(100−2)<br>= 10000 − 200 − 300 + 6<br>= 9506</p>
        </div>
      </div>

      <h3>📐 Essential Formulas</h3>
      <div class="ref-grid">
        <div class="ref-card">
          <h4>Triangular Numbers</h4>
          <p><code>n(n+1)/2</code><br>1+2+3+...+10 = 10×11/2 = 55</p>
        </div>
        <div class="ref-card">
          <h4>Consecutive Integers</h4>
          <p>Sum = (first+last) × count / 2<br>Example: 5+6+...+12<br>= (5+12)×8/2 = 68</p>
        </div>
        <div class="ref-card">
          <h4>Distance Formula</h4>
          <p><code>√[(x₂−x₁)² + (y₂−y₁)²]</code><br>Memorize 3-4-5, 5-12-13, 8-15-17</p>
        </div>
        <div class="ref-card">
          <h4>Quadratic Formula</h4>
          <p><code>x = [−b ± √(b²−4ac)] / 2a</code></p>
        </div>
      </div>

      <h3>🔢 Powers & Roots to Memorize</h3>
      <p style="color:#a0aec0; line-height:1.8; margin-top:10px;">
        <strong>Squares:</strong> 1²=1, 2²=4, ... 20²=400, 25²=625, 50²=2500<br>
        <strong>Cubes:</strong> 1³=1, 2³=8, 3³=27, 4³=64, 5³=125, 10³=1000<br>
        <strong>Powers of 2:</strong> 2¹⁰=1024, 2¹⁵=32768, 2²⁰=1048576<br>
        <strong>Powers of 3:</strong> 3⁵=243, 3⁷=2187, 3¹⁰=59049
      </p>

      <h3>📏 Geometry Quick Facts</h3>
      <p style="color:#a0aec0; line-height:1.8; margin-top:10px;">
        Circle: A=πr², C=2πr<br>
        Triangle: A=½bh<br>
        Sphere: V=4πr³/3, SA=4πr²<br>
        Cylinder: V=πr²h<br>
        Right triangle: a²+b²=c²
      </p>

      <h3>💡 Test-Taking Tips</h3>
      <ul style="margin-top:10px;">
        <li>Problems 1-20 target: ~2:30 minutes (7.5 sec each)</li>
        <li>Skip if stuck — come back with remaining time</li>
        <li>Starred (*) problems accept ±5% tolerance</li>
        <li>Use scratch paper for long calculations</li>
        <li>Trust your mental math — second-guessing wastes time</li>
      </ul>

      <button class="ref-close" id="btn-ref-close">Close</button>
    </div>
  </div>`;
}

function renderTest(){
  let cur=state.problems[state.idx];
  let isDrill=(state.mode==='drill'||state.mode==='topic'||state.mode==='imported');
  let total=state.mode==='full'?80:state.mode==='timed20'?20:'∞';

  // Mode label
  let label=
    state.mode==='timed20' ? '⏱ Timed Round' :
    state.mode==='drill'   ? '🔥 Drill Mode' :
    state.mode==='imported' ? '📥 Imported Problems' :
    state.mode==='topic'   ? `📊 ${TOPICS[state.topicKey].name}` :
    '🏆 Full Test';

  // Timer display
  let timerHTML=state.timed
    ? `<span class="t-timer ok">⏱ ${fmtT(state.timeLeft)}</span>`
    : `<span class="t-timer none">No timer</span>`;

  // Score / streak — hide score during timed UIL tests (only scored from last answer)
  let isUIL = (state.mode==='timed20'||state.mode==='full');
  let scoreHTML=isDrill
    ? `<span class="t-score">✓ ${state.score}/${state.drillCount}${state.streak>=3?' <span class="streak">🔥 '+state.streak+'</span>':''}</span>`
    : '';

  // Progress bar
  let prog=isDrill ? 50 : (state.idx/state.problems.length*100);

  // Feedback (drill only) with solution walkthrough
  let fbHTML='';
  if(isDrill){
    let fbTxt=state.feedbackText||'&nbsp;';
    // Wrap the hint portion
    if(fbTxt.includes('| 💡')){
      let parts=fbTxt.split('| 💡');
      fbTxt=parts[0]+'<span class="hint-tag">💡 '+parts[1]+'</span>';
    }
    let solSection = '';
    if(state.solutionHTML){
      if(state.solutionVisible){
        solSection = state.solutionHTML;
      } else if(state.feedback === 'correct'){
        solSection = '<button class="show-solution-btn" id="btn-show-sol">Show trick \u2192</button><div id="sol-content" class="solution-collapsed">'+state.solutionHTML+'</div>';
      }
    }
    let hasSol = solSection ? 'has-solution' : 'no-solution';
    fbHTML=`<div class="feedback-area ${hasSol}"><div class="feedback-bar ${state.feedback||'empty'}">${fbTxt}</div>${solSection}</div>`;
  }

  // Skip button (timed & full only) — shows penalty reminder
  let skipHTML='';
  if(!isDrill){
    skipHTML = `<button class="btn btn-orange" id="btn-skip">Skip (-4)</button>`;
    // Add "Back to skipped" button if there are skipped problems
    if(state.skippedPositions.length > 0){
      let firstSkipNum = state.problems[state.skippedPositions[0]].num;
      let skipCount = state.skippedPositions.length;
      skipHTML += ` <button class="btn btn-subtle" id="btn-back-skip" style="font-size:0.8rem;padding:8px 12px;">← #${firstSkipNum} (${skipCount} skipped)</button>`;
    }
  }

  // Show source info for imported problems or UIL test source
  let sourceTag = '';
  if(state.mode === 'imported' && cur.year && cur.test){
    sourceTag = `<div class="problem-tag" style="color:#667eea;">📋 ${cur.year} Test ${cur.test} · Problem #${cur.num}</div>`;
  } else if(isUIL && state.testSource){
    sourceTag = `<div class="problem-tag" style="color:#667eea;">📋 ${state.testSource}</div>`;
  }

  return `
  <div class="test-header">
    <div class="test-top">
      <span class="t-label">${label} · #${cur.num} of ${total}</span>
      ${timerHTML}
      ${scoreHTML}
    </div>
    <div class="prog-bar"><div class="prog-fill" style="width:${prog}%"></div></div>
  </div>
  <div class="test-body">
    ${fbHTML}
    <div class="problem-box">
      <div class="problem-text">${cur.q}</div>
    ${cur.starred?'<div class="problem-tag" style="color:#f6ad55;">★ Approximation (±5% accepted)</div>':''}
    ${sourceTag}
    ${typeof cur.a==='string'&&displayAnswer(cur.a).includes('/')?'<div class="problem-tag" style="color:#667eea;">Type as a fraction, e.g. 3/4</div>':''}</div>
    <input type="text" class="ans-box" id="ans-input" inputmode="${typeof cur.a==='string'&&displayAnswer(cur.a).includes('/')?'text':'decimal'}" value="${state.answer}" placeholder="${typeof cur.a==='string'&&displayAnswer(cur.a).includes('/')?'e.g. 3/4':'Your answer'}" autocomplete="off">
    ${typeof cur.a==='string'&&displayAnswer(cur.a).includes('/')?`<div class="frac-helper"><button class="frac-btn" id="btn-slash">⁄ slash</button></div>`:''}
    <div class="btn-row${state.nextDelayed?' next-delay-overlay':''}">
      <button class="btn btn-green" id="btn-submit">Submit</button>
      ${skipHTML}
    </div>
    <button class="btn btn-subtle" id="btn-end">${isDrill?'End Session':'End Test Early'}</button>
  </div>`;
}

function renderResults(){
  let total=state.answered.length;
  let isDrill=(state.mode==='drill'||state.mode==='topic');
  let isUIL=(state.mode==='timed20'||state.mode==='full');

  // UIL scoring breakdown
  let correctCount = state.answered.filter(a=>a.correct).length;
  let wrongCount = state.answered.filter(a=>!a.correct && a.userAns!==null && !a.skipped).length;
  let skippedCount = state.answered.filter(a=>a.userAns===null || a.skipped).length;
  let unanswered = state.problems.length - total;
  let uilScore = isUIL ? ((correctCount * 5) - (wrongCount * 4) - (skippedCount * 4) - (unanswered * 4)) : 0;
  let maxScore = isUIL ? state.problems.length * 5 : 0;

  // Simple scoring for drill modes
  let drillCorrect = state.answered.filter(a=>a.correct).length;
  let drillWrong = total - drillCorrect - state.answered.filter(a=>a.userAns===null).length;
  let drillSkipped = state.answered.filter(a=>a.userAns===null).length;
  let pct=total>0?(drillCorrect/total*100).toFixed(1):0;

  // Sort review by problem number for UIL modes
  let reviewList = isUIL
    ? [...state.answered].sort((a,b)=>a.num-b.num)
    : state.answered.slice(-40);

  // Show review items
  let reviewItems=reviewList.map((item,i)=>{
    let cls=item.correct?'correct':'wrong';
    let isSkip = (item.userAns===null || item.skipped);
    let ans=isSkip ? 'Skipped' : item.userAns;
    let extra=!item.correct?` (Ans: ${displayAnswer(item.a)})`:'';
    // UIL point annotation
    let pointTag = '';
    if(isUIL){
      if(item.correct) pointTag = '<span style="color:#48bb78;font-weight:600;"> (+5)</span>';
      else if(isSkip) pointTag = '<span style="color:#ed8936;font-weight:600;"> (-4)</span>';
      else pointTag = '<span style="color:#fc8181;font-weight:600;"> (-4)</span>';
    }
    let hintHTML=(!item.correct && item.hint)?`<div style="font-size:0.72rem;color:#f6ad55;margin-top:2px;width:100%;">💡 ${item.hint}</div>`:'';

    // Add "Show Solution" button for wrong answers using structured walkthrough
    let solBtn='';
    if(!item.correct){
      let solId='sol-'+i;
      let solContent = renderSolution(item.q, displayAnswer(item.a), item.t);
      solBtn='<button class="sol-toggle" data-target="'+solId+'" style="font-size:0.7rem;padding:4px 8px;background:#2d3748;border:1px solid #4a5568;border-radius:6px;color:#667eea;cursor:pointer;margin-top:4px;">How?</button>' +
        '<div id="'+solId+'" style="display:none;margin-top:6px;">'+solContent+'</div>';
    }

    return `<div class="rev-item ${cls}">
      <span class="ri-num">#${item.num}</span>
      <span class="ri-q">${item.q}</span>
      <span class="ri-a">${item.correct?'✓':'✗'} ${ans}${pointTag}${extra}</span>
      ${hintHTML}
      ${solBtn}
    </div>`;
  }).join('');

  let title=isDrill?'Session Over!':'Test Complete!';

  // Calculate time-based stats for timed modes
  let timeUsed = state.timedSecs ? state.timedSecs - state.timeLeft : 0;
  let secPerProb = total>0 && timeUsed>0 ? (timeUsed/total).toFixed(1) : null;

  // Find weakest topic from wrong answers
  let wrongByTopic={};
  let totalByTopic={};
  state.answered.forEach(item=>{
    let t=item.t||'other';
    totalByTopic[t]=(totalByTopic[t]||0)+1;
    if(!item.correct) wrongByTopic[t]=(wrongByTopic[t]||0)+1;
  });
  let weakest=null;
  Object.keys(wrongByTopic).forEach(t=>{
    if(!weakest || wrongByTopic[t]>wrongByTopic[weakest]) weakest=t;
  });

  let extraStats='';
  if(secPerProb) extraStats+=`<div class="stat-card"><div class="stat-val">${secPerProb}s</div><div class="stat-label">Sec / Problem</div></div>`;
  if(weakest && wrongByTopic[weakest]>=2){
    let topicName=TOPICS[weakest]?TOPICS[weakest].name:weakest;
    extraStats+=`<div class="stat-card" style="border-color:#ed8936;"><div class="stat-val" style="color:#ed8936;font-size:1.1rem;padding-top:6px;">${topicName}</div><div class="stat-label">Needs Work (${wrongByTopic[weakest]} wrong)</div></div>`;
  }
  let retryText=
    state.mode==='timed20' ? `🔁 ${fmtT(state.timedSecs||150)} Again` :
    state.mode==='drill'   ? '🔥 Keep Drilling' :
    state.mode==='topic'   ? `📊 ${TOPICS[state.topicKey].name} Again` :
    '🔁 Full Test Again';

  // Build stats grid — different for UIL vs drill modes
  let statsHTML='';
  if(isUIL){
    let scoreColor = uilScore >= 0 ? '#48bb78' : '#fc8181';
    let sourceNote = state.testSource ? `<div style="text-align:center;color:#a0aec0;font-size:0.85rem;margin-bottom:12px;">Source: ${state.testSource}</div>` : '';
    statsHTML = `
    ${sourceNote}
    <div class="stats-grid">
      <div class="stat-card" style="border-color:${scoreColor};grid-column:span 2;">
        <div class="stat-val" style="font-size:2.2rem;color:${scoreColor};">${uilScore}</div>
        <div class="stat-label">UIL Score (of ${maxScore})</div>
      </div>
      <div class="stat-card"><div class="stat-val" style="color:#48bb78;">${correctCount}</div><div class="stat-label">Correct (+${correctCount*5})</div></div>
      <div class="stat-card"><div class="stat-val" style="color:#fc8181;">${wrongCount}</div><div class="stat-label">Wrong (-${wrongCount*4})</div></div>
      <div class="stat-card"><div class="stat-val" style="color:#ed8936;">${skippedCount + unanswered}</div><div class="stat-label">Skipped (-${(skippedCount+unanswered)*4})</div></div>
      <div class="stat-card"><div class="stat-val">${correctCount + wrongCount}</div><div class="stat-label">Attempted of ${state.problems.length}</div></div>
      ${extraStats}
    </div>`;
  } else {
    statsHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-val">${drillCorrect}</div><div class="stat-label">Correct</div></div>
      <div class="stat-card"><div class="stat-val">${drillWrong}</div><div class="stat-label">Wrong</div></div>
      <div class="stat-card"><div class="stat-val">${drillSkipped}</div><div class="stat-label">Skipped</div></div>
      <div class="stat-card"><div class="stat-val">${pct}%</div><div class="stat-label">Accuracy</div></div>
      ${extraStats}
    </div>`;
  }

  return `
  <div class="header"><h1 style="font-size:1.9rem;">${title}</h1></div>
  <div class="results-wrap">
    ${statsHTML}
    <div class="review-title">📋 Answer Review${reviewList.length>40?' (last 40)':''}</div>
    <div class="review-box">${reviewItems}</div>
    <div class="res-btns">
      <button class="btn btn-primary" id="btn-menu">← Menu</button>
      <button class="btn btn-dark" id="btn-retry">${retryText}</button>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function renderInsightsHTML(insights){
  if(insights.length === 0) return '';
  let cards = insights.map(function(ins){
    let cls = ins.type === 'improvement' ? 'insight-positive' : ins.type === 'milestone' ? 'insight-milestone' : 'insight-tip';
    return '<div class="insight-card '+cls+'"><div class="insight-icon">'+ins.icon+'</div><div class="insight-body"><div class="insight-msg">'+ins.message+'</div><div class="insight-detail">'+ins.detail+'</div></div></div>';
  }).join('');
  return '<div class="insight-section"><h2 style="margin:0 0 1rem;">✨ Progress Insights</h2>'+cards+'</div>';
}

function renderWeeklyTrend(){
  var allSess = loadStats().sessions;
  if(allSess.length < 3) return '';
  var now = Date.now();
  var WEEK = 7 * 86400000;
  var weeks = [];
  for(var w = 0; w < 8; w++){
    var start = now - (w+1) * WEEK;
    var end = now - w * WEEK;
    var wSess = allSess.filter(function(s){ var t = new Date(s.date).getTime(); return t >= start && t < end; });
    if(wSess.length > 0){
      var totalInWeek = wSess.reduce(function(s,x){return s+x.total;},0);
      if(totalInWeek === 0) continue;
      var acc = Math.round(wSess.reduce(function(s,x){return s+x.score;},0) / totalInWeek * 100);
      var label = w === 0 ? 'This wk' : w === 1 ? 'Last wk' : w + 'wk ago';
      weeks.push({acc:acc, label:label, count:wSess.length});
    }
  }
  weeks.reverse();
  if(weeks.length < 2) return '';
  var bars = weeks.map(function(w){
    var color = w.acc >= 80 ? '#48bb78' : w.acc >= 60 ? '#ed8936' : '#f56565';
    return '<div class="wt-bar"><div class="wt-pct">'+w.acc+'%</div><div class="wt-fill" style="height:'+w.acc+'%;background:'+color+';"></div><div class="wt-label">'+w.label+'</div></div>';
  }).join('');
  return '<div class="weekly-trend"><h3>📅 Weekly Accuracy Trend</h3><div class="wt-bars">'+bars+'</div></div>';
}

function renderStats(){
  let stats = getStats();
  let insights = getProgressInsights();
  
  if(stats.totalSessions === 0){
    return `
    <div class="stats-screen">
      <div class="header">
        <h1>📈 Your Progress</h1>
        <button class="back-btn" id="btn-menu">← Back</button>
      </div>
      <div class="empty-stats">
        <div class="es-icon">📊</div>
        <h2>No Stats Yet!</h2>
        <p>Complete a practice session to start tracking your progress.</p>
        <button class="btn btn-primary" id="btn-menu">Start Practicing</button>
      </div>
    </div>`;
  }
  
  // Overview cards
  let daysSince = Math.floor((Date.now() - new Date(stats.firstUse).getTime()) / 86400000);
  let improvement = stats.recentAccuracy - (stats.overallAccuracy);
  let improvementHTML = improvement > 0 ? 
    `<div class="stat-badge positive">+${improvement}% recent</div>` :
    improvement < -5 ? `<div class="stat-badge negative">${improvement}% recent</div>` : '';
  
  // Topic breakdown - find strongest and weakest
  let topicList = Object.entries(stats.topicStats)
    .map(([topic, data]) => ({
      topic,
      name: TOPICS[topic]?.name || topic,
      accuracy: data.total > 0 ? Math.round(data.correct / data.total * 100) : 0,
      correct: data.correct,
      total: data.total
    }))
    .filter(t => t.total >= 3) // Only show topics with at least 3 attempts
    .sort((a,b) => b.accuracy - a.accuracy);
  
  // Compute topic trend from recent sessions
  let topicTrends = {};
  let recentSess = stats.recentSessions.slice(0, 10);
  recentSess.forEach(s => {
    if(s.topics){
      Object.entries(s.topics).forEach(([t, d]) => {
        if(!topicTrends[t]) topicTrends[t] = {recentCorrect:0, recentTotal:0};
        topicTrends[t].recentCorrect += d.correct || 0;
        topicTrends[t].recentTotal += d.total || 0;
      });
    }
  });

  let topicHTML = topicList.length > 0 ? topicList.map(t => {
    let barWidth = t.accuracy;
    let barColor = t.accuracy >= 80 ? '#48bb78' : t.accuracy >= 60 ? '#ed8936' : '#f56565';
    let trendHTML = '';
    let tr = topicTrends[t.topic];
    if(tr && tr.recentTotal >= 5){
      let recentAcc = Math.round(tr.recentCorrect / tr.recentTotal * 100);
      let diff = recentAcc - t.accuracy;
      if(diff > 5) trendHTML = '<span class="trend-arrow up">↑</span>';
      else if(diff < -5) trendHTML = '<span class="trend-arrow down">↓</span>';
    }
    return `
    <div class="topic-stat">
      <div class="ts-name">${t.name}${trendHTML}</div>
      <div class="ts-bar-container">
        <div class="ts-bar" style="width:${barWidth}%;background:${barColor};"></div>
      </div>
      <div class="ts-score">${t.correct}/${t.total} (${t.accuracy}%)</div>
    </div>`;
  }).join('') : '<p style="color:#718096;">Complete topic drills to see breakdown.</p>';
  
  // Recent sessions graph (last 10)
  let graphData = stats.recentSessions.slice(0,10).reverse();
  let graphHTML = graphData.map((s,i) => {
    let height = (s.score / s.total * 100);
    let date = new Date(s.date);
    let label = date.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    let modeLabel = s.mode==='timed20' ? 'T20' : s.mode==='full' ? 'F80' : 'Drill';
    return `
    <div class="graph-bar">
      <div class="gb-bar-container">
        <div class="gb-bar" style="height:${height}%;" title="${s.score}/${s.total}"></div>
      </div>
      <div class="gb-label">${label}</div>
      <div class="gb-mode">${modeLabel}</div>
    </div>`;
  }).join('');
  
  // Session history table
  let historyHTML = stats.recentSessions.slice(0,15).map(s => {
    let date = new Date(s.date);
    let timeStr = date.toLocaleString('en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
    let modeStr = s.mode==='timed20' ? 'Timed 20' : s.mode==='full' ? 'Full Test' : s.mode==='drill' ? 'Drill' : 'Topic';
    let pct = Math.round(s.score/s.total*100);
    let pctColor = pct >= 80 ? '#48bb78' : pct >= 60 ? '#ed8936' : '#f56565';
    let speedStr = s.secondsPerProblem ? `${s.secondsPerProblem}s/prob` : '—';
    return `
    <tr>
      <td>${timeStr}</td>
      <td>${modeStr}</td>
      <td>${s.score}/${s.total}</td>
      <td style="color:${pctColor};font-weight:600;">${pct}%</td>
      <td>${speedStr}</td>
    </tr>`;
  }).join('');
  
  return `
  <div class="stats-screen">
    <div class="header">
      <h1>📈 Your Progress</h1>
      <button class="back-btn" id="btn-menu">← Back</button>
    </div>
    
    <div class="stats-body">
      ${renderInsightsHTML(insights)}
      ${renderWeeklyTrend()}
      
      <!-- Overview Cards -->
      <div class="stats-grid">
        <div class="stat-card big">
          <div class="stat-val">${stats.totalSessions}</div>
          <div class="stat-label">Practice Sessions</div>
          <div class="stat-sub">${daysSince} days active</div>
        </div>
        <div class="stat-card big">
          <div class="stat-val">${stats.overallAccuracy}%</div>
          <div class="stat-label">Overall Accuracy</div>
          <div class="stat-sub">${stats.totalCorrect}/${stats.totalProblems} correct</div>
          ${improvementHTML}
        </div>
        ${stats.streak > 0 ? `
        <div class="stat-card big" style="border-color:#ed8936;">
          <div class="stat-val" style="color:#ed8936;">🔥 ${stats.streak}</div>
          <div class="stat-label">Day Streak</div>
          <div class="stat-sub">Keep it going!</div>
        </div>` : ''}
        ${stats.speedImprovement && stats.speedImprovement > 0 ? `
        <div class="stat-card big" style="border-color:#48bb78;">
          <div class="stat-val" style="color:#48bb78;">-${stats.speedImprovement}s</div>
          <div class="stat-label">Speed Improvement</div>
          <div class="stat-sub">Per problem (first 10 vs last 10)</div>
        </div>` : ''}
      </div>
      
      <!-- Personal Bests -->
      <h2 style="margin:2rem 0 1rem;">🏆 Personal Bests</h2>
      <div class="stats-grid">
        ${stats.bestScore.score > 0 ? `
        <div class="stat-card">
          <div class="stat-val">${stats.bestScore.score} pts</div>
          <div class="stat-label">Best Timed Round</div>
          <div class="stat-sub">${new Date(stats.bestScore.date).toLocaleDateString()}</div>
        </div>` : ''}
        ${stats.bestFullTest.score > 0 ? `
        <div class="stat-card">
          <div class="stat-val">${stats.bestFullTest.score}/80</div>
          <div class="stat-label">Best Full Test</div>
          <div class="stat-sub">${new Date(stats.bestFullTest.date).toLocaleDateString()}</div>
        </div>` : ''}
      </div>
      
      <!-- Performance Graph -->
      <h2 style="margin:2rem 0 1rem;">📊 Recent Performance</h2>
      <div class="graph-container">
        ${graphHTML}
      </div>
      
      <!-- Topic Breakdown -->
      <h2 style="margin:2rem 0 1rem;">📚 Topic Breakdown</h2>
      <div class="topic-stats">
        ${topicHTML}
      </div>
      
      <!-- Session History -->
      <h2 style="margin:2rem 0 1rem;">📝 Session History</h2>
      <div class="history-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Mode</th>
              <th>Score</th>
              <th>Accuracy</th>
              <th>Speed</th>
            </tr>
          </thead>
          <tbody>
            ${historyHTML}
          </tbody>
        </table>
      </div>
      
      <div style="margin-top:2rem;text-align:center;">
        <button class="btn btn-dark" id="btn-clear-stats">🗑️ Clear All Stats</button>
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// LISTENERS
// ═══════════════════════════════════════════════════════════════════════════
function attachListeners(){
  let el;
  // Modal open / close
  if(el=document.getElementById('btn-timed-open')) el.onclick=()=>{ document.getElementById('time-modal').style.display='flex'; };
  if(el=document.getElementById('btn-time-close')) el.onclick=()=>{ document.getElementById('time-modal').style.display='none'; };
  if(el=document.getElementById('time-modal')) el.onclick=(e)=>{ if(e.target===el) el.style.display='none'; };
  
  // Reference modal
  if(el=document.getElementById('btn-ref-open')) el.onclick=()=>{ document.getElementById('ref-modal').classList.add('show'); };
  if(el=document.getElementById('btn-ref-close')) el.onclick=()=>{ document.getElementById('ref-modal').classList.remove('show'); };
  if(el=document.getElementById('ref-modal')) el.onclick=(e)=>{ if(e.target===el) el.classList.remove('show'); };
  // Time picker buttons
  document.querySelectorAll('.time-btn').forEach(b=>{
    b.onclick=()=>{ document.getElementById('time-modal').style.display='none'; startTimed(parseInt(b.dataset.secs)); };
  });

  if(el=document.getElementById('btn-drill'))   el.onclick=startDrill;
  if(el=document.getElementById('btn-full'))    el.onclick=startFullTest;

  document.querySelectorAll('.topic-btn').forEach(b=>{
    b.onclick=()=>startTopicDrill(b.dataset.topic);
  });

  if(el=document.getElementById('ans-input')){
    el.oninput=(e)=>{state.answer=e.target.value;};
    el.onkeydown=(e)=>{if(e.key==='Enter') submitAnswer();};
  }
  if(el=document.getElementById('btn-slash')){
    el.onclick=()=>{
      let inp=document.getElementById('ans-input');
      if(!inp) return;
      let start=inp.selectionStart, end=inp.selectionEnd;
      let val=inp.value;
      let newVal=val.slice(0,start)+'/'+val.slice(end);
      inp.value=newVal;
      state.answer=newVal;
      inp.focus();
      inp.setSelectionRange(start+1,start+1);
    };
  }
  if(el=document.getElementById('btn-submit')) el.onclick=submitAnswer;
  if(el=document.getElementById('btn-skip'))   el.onclick=skipProblem;
  if(el=document.getElementById('btn-back-skip')) el.onclick=goBackToSkipped;
  if(el=document.getElementById('btn-end'))    el.onclick=endTest;
  if(el=document.getElementById('btn-menu'))   el.onclick=goMenu;
  if(el=document.getElementById('btn-retry'))  el.onclick=()=>{
    if(state.mode==='timed20') startTimed(state.timedSecs||150);
    else if(state.mode==='drill') startDrill();
    else if(state.mode==='topic') startTopicDrill(state.topicKey);
    else if(state.mode==='imported') practiceImported('all'); // Restart with all imported
    else startFullTest();
  };
  
  // Stats screen
  if(el=document.getElementById('btn-stats')) el.onclick=()=>{ setState({screen:'stats'}); };
  if(el=document.getElementById('btn-clear-stats')) el.onclick=()=>{
    if(confirm('Are you sure you want to delete all your progress data? This cannot be undone!')){
      localStorage.removeItem('uilNsStats');
      setState({screen:'menu'});
      alert('All stats cleared!');
    }
  };
  
  // Import buttons
  if(el=document.getElementById('btn-import-json')) el.onclick=showImportModal;
  if(el=document.getElementById('btn-view-imported')) el.onclick=showImportedProblemsViewer;
  if(el=document.getElementById('btn-problem-editor')) el.onclick=showProblemEditor;
  
  // Show solution toggle in drill mode
  if(el=document.getElementById('btn-show-sol')) el.onclick=function(){
    var solDiv = document.getElementById('sol-content');
    if(solDiv){
      var isHidden = solDiv.classList.contains('solution-collapsed');
      solDiv.className = isHidden ? 'solution-expanded' : 'solution-collapsed';
      el.textContent = isHidden ? 'Hide trick' : 'Show trick \u2192';
    }
  };

  // Solution toggles in results
  document.querySelectorAll('.sol-toggle').forEach(btn=>{
    btn.onclick=()=>{
      let target=document.getElementById(btn.dataset.target);
      if(target){
        let isHidden=target.style.display==='none';
        target.style.display=isHidden?'block':'none';
        btn.textContent=isHidden?'Hide':'How?';
      }
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT REAL UIL PROBLEMS
// ═══════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════
// PROBLEM EDITOR HELPERS
// ═══════════════════════════════════════════════════════════════════

function escapeHTML(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


function displayAnswer(a){
  if(typeof a !== 'string') return String(a);
  return a.includes('|') ? a.split('|')[0].trim() : a;
}

function getProblemEdits(){
  try { return JSON.parse(localStorage.getItem('uilProblemEdits')||'{}'); }
  catch(e){ return {}; }
}

function saveProblemEdit(key, q, a){
  const edits = getProblemEdits();
  edits[key] = {q:q, a:a};
  localStorage.setItem('uilProblemEdits', JSON.stringify(edits));
  // Update runtime state
  const p = state.importedProblems.find(p => p.num+'-'+p.year+'-'+p.test === key);
  if(p){ p.q = q; p.a = a; }
}

function removeProblemEdit(key){
  const edits = getProblemEdits();
  delete edits[key];
  localStorage.setItem('uilProblemEdits', JSON.stringify(edits));
}

// Load built-in + user-imported problems on startup
function loadImportedProblems(){
  try {
    // Start with built-in problems (2,969 real UIL problems from 2019-2026)
    const builtin = (typeof BUILTIN_PROBLEMS !== 'undefined') ? BUILTIN_PROBLEMS : [];

    // Load any additional user-imported problems from localStorage
    const saved = localStorage.getItem('uilImportedProblems');
    const userImported = saved ? JSON.parse(saved) : [];

    // Merge: built-in + user-imported, avoiding duplicates
    const seen = new Set(builtin.map(p => `${p.num}-${p.year}-${p.test}`));
    const extras = userImported.filter(p => !seen.has(`${p.num}-${p.year}-${p.test}`));

    state.importedProblems = [...builtin, ...extras];
    // Apply any user edits from Problem Editor
    const edits = getProblemEdits();
    const editKeys = Object.keys(edits);
    if(editKeys.length > 0){
      state.importedProblems.forEach(p => {
        const k = p.num+'-'+p.year+'-'+p.test;
        if(edits[k]){
          p.q = edits[k].q;
          p.a = edits[k].a;
        }
      });
      console.log(`  ↳ Applied ${editKeys.length} user edit(s) from Problem Editor`);
    }
    console.log(`✓ Loaded ${builtin.length} built-in + ${extras.length} user-imported = ${state.importedProblems.length} total problems`);
  } catch(e){
    console.error('Error loading imported problems:', e);
  }
}

// Save imported problems to localStorage
function saveImportedProblems(){
  try {
    localStorage.setItem('uilImportedProblems', JSON.stringify(state.importedProblems));
    console.log(`✓ Saved ${state.importedProblems.length} imported problems to localStorage`);
  } catch(e){
    console.error('Error saving imported problems:', e);
  }
}

// Handle JSON file import
function handleImportJSON(file){
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const problems = data.problems || data;
      
      if(!Array.isArray(problems) || problems.length === 0){
        alert('⚠️ Invalid JSON format. Expected an array of problems.');
        return;
      }
      
      // Convert to internal format
      const converted = problems.map(p => ({
        q: p.q || p.cleanedQuestion || '',
        a: p.a || p.answer || '',
        t: p.t || 'advanced',
        num: p.num || p.n || 0,
        year: p.year || p.yr || '',
        test: p.test || '',
        starred: p.starred || p.star || false,
        source: p.source || 'imported'
      })).filter(p => p.q && p.a); // Only keep problems with both question and answer
      
      if(converted.length === 0){
        alert('⚠️ No valid problems found. Make sure problems have both question (q) and answer (a) fields.');
        return;
      }
      
      // Merge with existing (avoid duplicates based on question text)
      const existing = new Set(state.importedProblems.map(p => p.q));
      const newProblems = converted.filter(p => !existing.has(p.q));
      
      state.importedProblems.push(...newProblems);
      saveImportedProblems();
      
      alert(`✅ Successfully imported ${newProblems.length} new problems!\n\nTotal imported: ${state.importedProblems.length}\nDuplicates skipped: ${converted.length - newProblems.length}`);
      
      render(); // Refresh menu to show new button
      
    } catch(err){
      alert('⚠️ Error reading JSON file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// Create import modal
function showImportModal(){
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.cssText = 'display:flex; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:1000; align-items:center; justify-content:center;';
  
  modal.innerHTML = `
    <div class="modal-box" style="max-width:500px; background:#1a1f2e; border:2px solid #667eea; border-radius:16px; padding:30px; position:relative;">
      <h2 style="color:#667eea; margin-bottom:15px; font-size:1.5rem;">📂 Import Real UIL Problems</h2>
      <p style="color:#a0aec0; margin-bottom:20px; line-height:1.6;">
        Upload the JSON file you downloaded from the <strong>UIL Problem Cleanup Tool</strong>. 
        This will add your cleaned real UIL problems to the trainer.
      </p>
      
      <div style="background:#2d3748; border:2px dashed #4a5568; border-radius:12px; padding:40px 20px; text-align:center; margin-bottom:20px; cursor:pointer;" id="drop-zone">
        <div style="font-size:3rem; margin-bottom:10px;">📥</div>
        <div style="color:#667eea; font-weight:600; margin-bottom:5px;">Click to select JSON file</div>
        <div style="color:#718096; font-size:0.85rem;">or drag and drop here</div>
      </div>
      
      <input type="file" id="json-file-input" accept=".json" style="display:none;">
      
      <div style="background:#2d3748; border-left:4px solid #667eea; padding:12px; border-radius:6px; margin-bottom:20px;">
        <div style="font-size:0.85rem; color:#a0aec0; line-height:1.5;">
          <strong style="color:#667eea;">💡 Tip:</strong> Export your cleaned problems from the cleanup tool, 
          then import them here. Problems are saved to your browser and persist across sessions.
        </div>
      </div>
      
      ${state.importedProblems.length > 0 ? `
        <div style="background:#2d3748; padding:12px; border-radius:6px; margin-bottom:15px; text-align:center;">
          <div style="color:#48bb78; font-weight:600; font-size:0.9rem;">
            ✓ Currently loaded: ${state.importedProblems.length} imported problems
          </div>
        </div>
        <button class="btn btn-subtle" style="margin-bottom:10px;" id="btn-clear-imported">🗑️ Clear All Imported Problems</button>
      ` : ''}
      
      <button class="btn btn-subtle" id="btn-close-import">✕ Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const dropZone = modal.querySelector('#drop-zone');
  const fileInput = modal.querySelector('#json-file-input');
  
  // Click to select file
  dropZone.onclick = () => fileInput.click();
  
  // File selected
  fileInput.onchange = e => {
    if(e.target.files[0]){
      handleImportJSON(e.target.files[0]);
      modal.remove();
    }
  };
  
  // Drag and drop
  dropZone.ondragover = e => {
    e.preventDefault();
    dropZone.style.borderColor = '#667eea';
    dropZone.style.background = '#363e52';
  };
  
  dropZone.ondragleave = e => {
    e.preventDefault();
    dropZone.style.borderColor = '#4a5568';
    dropZone.style.background = '#2d3748';
  };
  
  dropZone.ondrop = e => {
    e.preventDefault();
    dropZone.style.borderColor = '#4a5568';
    dropZone.style.background = '#2d3748';
    
    if(e.dataTransfer.files[0]){
      handleImportJSON(e.dataTransfer.files[0]);
      modal.remove();
    }
  };
  
  // Clear imported problems
  const clearBtn = modal.querySelector('#btn-clear-imported');
  if(clearBtn){
    clearBtn.onclick = () => {
      if(confirm(`⚠️ Are you sure you want to delete all ${state.importedProblems.length} imported problems? This cannot be undone.`)){
        state.importedProblems = [];
        saveImportedProblems();
        alert('✓ All imported problems have been cleared.');
        modal.remove();
        render();
      }
    };
  }
  
  // Close
  modal.querySelector('#btn-close-import').onclick = () => modal.remove();
  modal.onclick = e => { if(e.target === modal) modal.remove(); };
}


// ═══════════════════════════════════════════════════════════════════
// PROBLEM EDITOR
// ═══════════════════════════════════════════════════════════════════

// State for editor
let _peGroup = null; // currently selected group key
let _peSearch = '';

function showProblemEditor(){
  const problems = state.importedProblems;
  if(problems.length === 0){
    alert('No problems loaded.');
    return;
  }

  // Group by year+test
  const groups = {};
  problems.forEach(p => {
    const k = p.year + ' ' + p.test;
    if(!groups[k]) groups[k] = [];
    groups[k].push(p);
  });
  const sortedKeys = Object.keys(groups).sort().reverse();
  _peGroup = _peGroup && groups[_peGroup] ? _peGroup : sortedKeys[0];
  _peSearch = '';

  const overlay = document.createElement('div');
  overlay.className = 'pe-overlay';
  overlay.id = 'pe-overlay';

  // Build sidebar
  const edits = getProblemEdits();
  let sidebarHTML = '';
  sortedKeys.forEach(k => {
    const active = k === _peGroup ? ' active' : '';
    const editCount = groups[k].filter(p => edits[p.num+'-'+p.year+'-'+p.test]).length;
    const dot = editCount > 0 ? '<span class="pe-edit-dot" title="'+editCount+' edited"></span>' : '';
    sidebarHTML += '<div class="pe-sidebar-item'+active+'" data-group="'+escapeHTML(k)+'">'+escapeHTML(k)+dot+'</div>';
  });

  overlay.innerHTML = '<div class="pe-header">'
    + '<h2>\u270F\uFE0F Problem Editor</h2>'
    + '<button id="pe-import">Import Edits</button>'
    + '<button id="pe-export">Export Edits</button>'
    + '<button id="pe-close">\u2715 Close</button>'
    + '<input type="file" id="pe-import-file" accept=".json" style="display:none" />'
    + '</div>'
    + '<div class="pe-search"><input id="pe-search-input" type="text" placeholder="Search problems (e.g. fraction, 2026, #15)..." /></div>'
    + '<div class="pe-body">'
    + '<div class="pe-sidebar" id="pe-sidebar">' + sidebarHTML + '</div>'
    + '<div class="pe-content" id="pe-content"></div>'
    + '</div>';

  document.body.appendChild(overlay);

  // Wire events
  document.getElementById('pe-close').onclick = function(){ overlay.remove(); };
  document.getElementById('pe-export').onclick = exportProblemEdits;
  document.getElementById('pe-import').onclick = function(){ document.getElementById('pe-import-file').click(); };
  document.getElementById('pe-import-file').onchange = importProblemEdits;
  document.getElementById('pe-search-input').oninput = function(e){
    _peSearch = e.target.value.trim().toLowerCase();
    renderEditorProblems();
  };

  // Sidebar clicks
  document.getElementById('pe-sidebar').onclick = function(e){
    const item = e.target.closest('.pe-sidebar-item');
    if(!item) return;
    selectEditorGroup(item.dataset.group);
  };

  renderEditorProblems();
}

function selectEditorGroup(groupKey){
  _peGroup = groupKey;
  // Update sidebar active state
  document.querySelectorAll('.pe-sidebar-item').forEach(el => {
    el.classList.toggle('active', el.dataset.group === groupKey);
  });
  renderEditorProblems();
}

function renderEditorProblems(){
  const container = document.getElementById('pe-content');
  if(!container) return;

  const edits = getProblemEdits();
  let problems = state.importedProblems;

  // Filter by search or by group
  if(_peSearch){
    const q = _peSearch;
    problems = problems.filter(p => {
      const key = p.num+'-'+p.year+'-'+p.test;
      return p.q.toLowerCase().includes(q)
        || p.a.toLowerCase().includes(q)
        || ('#'+p.num).includes(q)
        || (p.year+' '+p.test).toLowerCase().includes(q)
        || p.t.toLowerCase().includes(q);
    });
  } else {
    problems = problems.filter(p => (p.year + ' ' + p.test) === _peGroup);
  }

  // Sort by problem number
  problems = [...problems].sort((a,b) => a.num - b.num);

  if(problems.length === 0){
    container.innerHTML = '<div class="pe-empty">No problems match your search.</div>';
    return;
  }

  let html = '';
  problems.forEach(p => {
    const key = p.num+'-'+p.year+'-'+p.test;
    const isEdited = !!edits[key];
    const editedClass = isEdited ? ' edited' : '';
    const badges = (isEdited ? '<span class="pe-badge-edited">EDITED</span>' : '')
      + '<span class="pe-badge-topic">' + escapeHTML(p.t) + '</span>';
    const resetBtn = isEdited
      ? '<button class="pe-reset" data-key="'+escapeHTML(key)+'" data-action="reset">Reset</button>'
      : '';

    html += '<div class="pe-card'+editedClass+'" id="pe-card-'+escapeHTML(key)+'">'
      + '<div class="pe-card-head">'
      + '<span class="pe-card-num">#' + p.num + ' &mdash; ' + escapeHTML(p.year) + ' ' + escapeHTML(p.test) + '</span>'
      + '<span class="pe-card-badges">' + badges + '</span>'
      + '</div>'
      + '<div class="pe-card-q">' + escapeHTML(p.q) + '</div>'
      + '<div class="pe-card-a">Answer: ' + escapeHTML(p.a).replace(/\|/g, ' <span style="color:#718096;">or</span> ') + '</div>'
      + '<div class="pe-card-actions">'
      + '<button data-key="'+escapeHTML(key)+'" data-action="edit">Edit</button>'
      + resetBtn
      + '</div>'
      + '</div>';
  });

  container.innerHTML = html;

  // Delegate action clicks
  container.onclick = function(e){
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const key = btn.dataset.key;
    const action = btn.dataset.action;
    if(action === 'edit') editProblem(key);
    else if(action === 'reset') resetProblemEdit(key);
  };
}

function editProblem(key){
  const p = state.importedProblems.find(p => p.num+'-'+p.year+'-'+p.test === key);
  if(!p) return;

  const card = document.getElementById('pe-card-'+key);
  if(!card) return;

  // Replace card content with edit form
  card.innerHTML = '<div class="pe-card-head">'
    + '<span class="pe-card-num">#' + p.num + ' \u2014 ' + escapeHTML(p.year) + ' ' + escapeHTML(p.test) + '</span>'
    + '</div>'
    + '<div class="pe-edit-form">'
    + '<label>Question</label>'
    + '<textarea id="pe-edit-q-'+key+'">' + escapeHTML(p.q) + '</textarea>'
    + '<label style="margin-top:8px;">Answer <span style="font-weight:400;color:#718096;font-size:0.75rem;">(use | for multiple accepted formats, e.g. 3/2|1.5|1 1/2)</span></label>'
    + '<input type="text" id="pe-edit-a-'+key+'" value="' + escapeHTML(p.a) + '" />'
    + '<div class="pe-edit-btns">'
    + '<button class="pe-save" data-key="'+escapeHTML(key)+'" data-action="save">Save</button>'
    + '<button class="pe-cancel" data-key="'+escapeHTML(key)+'" data-action="cancel">Cancel</button>'
    + '</div>'
    + '</div>';

  // Wire save/cancel on this card
  card.onclick = function(e){
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    e.stopPropagation();
    if(btn.dataset.action === 'save'){
      const qVal = document.getElementById('pe-edit-q-'+key).value.trim();
      const aVal = document.getElementById('pe-edit-a-'+key).value.trim();
      if(!qVal || !aVal){ alert('Question and answer cannot be empty.'); return; }
      saveProblemEdit(key, qVal, aVal);
      renderEditorProblems();
      refreshEditorSidebar();
    } else if(btn.dataset.action === 'cancel'){
      renderEditorProblems();
    }
  };

  // Focus textarea
  const ta = document.getElementById('pe-edit-q-'+key);
  if(ta) ta.focus();
}

function resetProblemEdit(key){
  if(!confirm('Reset this problem to original text?')) return;
  // Find the original from BUILTIN_PROBLEMS
  const parts = key.split('-');
  const num = parseInt(parts[0]);
  const year = parts[1];
  const test = parts[2];
  const orig = (typeof BUILTIN_PROBLEMS !== 'undefined')
    ? BUILTIN_PROBLEMS.find(p => p.num === num && p.year === year && p.test === test)
    : null;
  if(orig){
    // Restore in runtime state
    const p = state.importedProblems.find(p => p.num+'-'+p.year+'-'+p.test === key);
    if(p){ p.q = orig.q; p.a = orig.a; }
  }
  removeProblemEdit(key);
  renderEditorProblems();
  refreshEditorSidebar();
}

function refreshEditorSidebar(){
  const sidebar = document.getElementById('pe-sidebar');
  if(!sidebar) return;
  const edits = getProblemEdits();
  sidebar.querySelectorAll('.pe-sidebar-item').forEach(el => {
    const gk = el.dataset.group;
    const groupProbs = state.importedProblems.filter(p => (p.year+' '+p.test) === gk);
    const editCount = groupProbs.filter(p => edits[p.num+'-'+p.year+'-'+p.test]).length;
    // Remove old dot
    const oldDot = el.querySelector('.pe-edit-dot');
    if(oldDot) oldDot.remove();
    if(editCount > 0){
      const dot = document.createElement('span');
      dot.className = 'pe-edit-dot';
      dot.title = editCount + ' edited';
      el.appendChild(dot);
    }
  });
  // Also update the menu button count if visible
  const menuBtn = document.getElementById('btn-problem-editor');
  if(menuBtn){
    const total = Object.keys(edits).length;
    menuBtn.querySelector('.sb-title').textContent = '\u270F\uFE0F Problem Editor (' + total + ' edits)';
  }
}

function exportProblemEdits(){
  const edits = getProblemEdits();
  const keys = Object.keys(edits);
  if(keys.length === 0){
    alert('No edits to export.');
    return;
  }
  const blob = new Blob([JSON.stringify(edits, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'problem-edits-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}


function importProblemEdits(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try {
      const data = JSON.parse(ev.target.result);
      if(typeof data !== 'object' || Array.isArray(data)){
        alert('Invalid format. Expected a Problem Editor edits JSON file.');
        return;
      }
      // Merge into existing edits
      const existing = getProblemEdits();
      let count = 0;
      for(const key in data){
        if(data[key] && data[key].q && data[key].a){
          existing[key] = {q: data[key].q, a: data[key].a};
          // Update runtime state
          const p = state.importedProblems.find(p => p.num+'-'+p.year+'-'+p.test === key);
          if(p){ p.q = data[key].q; p.a = data[key].a; }
          count++;
        }
      }
      localStorage.setItem('uilProblemEdits', JSON.stringify(existing));
      alert('Imported ' + count + ' edit(s) successfully!');
      renderEditorProblems();
      refreshEditorSidebar();
    } catch(err){
      alert('Error reading file: ' + err.message);
    }
  };
  reader.readAsText(file);
  // Reset so same file can be re-imported
  e.target.value = '';
}

// View/browse imported problems
function showImportedProblemsViewer(){
  const problems = state.importedProblems;
  
  if(problems.length === 0){
    alert('No imported problems yet. Import some first!');
    return;
  }
  
  // Group by year and test
  const byYear = {};
  problems.forEach(p => {
    const key = `${p.year} Test ${p.test}`;
    if(!byYear[key]) byYear[key] = [];
    byYear[key].push(p);
  });
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.cssText = 'display:flex; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:1000; align-items:center; justify-content:center; padding:20px;';
  
  const groupsHTML = Object.keys(byYear).sort().reverse().map(key => {
    const probs = byYear[key];
    const starred = probs.filter(p => p.starred).length;
    return `
      <div style="background:#2d3748; border-radius:8px; padding:15px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div>
            <strong style="color:#667eea; font-size:1.1rem;">${key}</strong>
            <span style="color:#718096; font-size:0.85rem; margin-left:10px;">${probs.length} problems ${starred > 0 ? `(${starred} ⭐)` : ''}</span>
          </div>
          <button class="btn btn-primary" style="padding:8px 16px; font-size:0.85rem;" onclick="practiceImported('${key}')">Practice These</button>
        </div>
        <div style="color:#a0aec0; font-size:0.85rem;">
          Problems: ${probs.map(p => `#${p.num}${p.starred?'⭐':''}`).slice(0, 15).join(', ')}${probs.length > 15 ? '...' : ''}
        </div>
      </div>
    `;
  }).join('');
  
  modal.innerHTML = `
    <div class="modal-box" style="max-width:700px; max-height:80vh; overflow-y:auto; background:#1a1f2e; border:2px solid #667eea; border-radius:16px; padding:30px; position:relative;">
      <h2 style="color:#667eea; margin-bottom:15px; font-size:1.5rem;">📋 Imported Real UIL Problems</h2>
      <p style="color:#a0aec0; margin-bottom:20px;">
        You have <strong>${problems.length} imported problems</strong> from ${Object.keys(byYear).length} test(s).
      </p>
      
      <div style="margin-bottom:20px;">
        <button class="btn btn-green" onclick="practiceImported('all')" style="margin-bottom:10px;">🎯 Practice All Imported Problems</button>
        <button class="btn btn-orange" onclick="practiceImported('starred')" style="margin-bottom:10px;">⭐ Practice Starred Only (${problems.filter(p=>p.starred).length})</button>
      </div>
      
      <h3 style="color:#667eea; margin:20px 0 15px; font-size:1.1rem;">By Test:</h3>
      ${groupsHTML}
      
      <button class="btn btn-subtle" id="btn-close-viewer" style="margin-top:15px;">✕ Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('#btn-close-viewer').onclick = () => modal.remove();
  modal.onclick = e => { if(e.target === modal) modal.remove(); };
}

// Start practice with imported problems
window.practiceImported = function(filter){
  let problems = state.importedProblems;
  
  if(filter === 'starred'){
    problems = problems.filter(p => p.starred);
  } else if(filter !== 'all'){
    // Filter by year/test key
    problems = problems.filter(p => `${p.year} Test ${p.test}` === filter);
  }
  
  if(problems.length === 0){
    alert('No problems match this filter.');
    return;
  }
  
  // Close any open modals
  document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
  
  // Start drill mode with these problems
  setState({
    screen: 'test',
    mode: 'imported',
    timed: false,
    problems: (filter !== 'all' && filter !== 'starred') ? [...problems].sort((a,b) => a.num - b.num) : shuffle(problems),
    idx: 0,
    answer: '',
    score: 0,
    answered: [],
    feedback: '',
    feedbackText: '',
    startTime: Date.now(),
    drillCount: 0
  });
};

// Load imported problems on startup
loadImportedProblems();

render();
