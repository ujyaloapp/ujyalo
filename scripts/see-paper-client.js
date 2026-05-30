/* ============================================================
   UJYALO — scripts/see-paper-client.js
   Fetches paper data from /api/see-paper, renders all screens.
   ============================================================ */

// ─── STATE ────────────────────────────────────────────────────────────────

let DATA        = null;
let LANG        = 'en';
let MODE        = null;
let activeId    = null;
let currentStep = 0;
let stepIdx     = 0;
let doneSet     = new Set();
let confMap     = {};      // { qNum: 'got'|'almost'|'missed' }
let noteMap     = {};      // { subId: string }
let PAPER_KEY   = '';
let PRINT_BASE  = '';

// UI state
let darkMode    = false;
let fontSize    = 16;
let timerRunning = false;
let timerSecs   = 0;
let timerInterval = null;
let formulaOpen = false;

const isMobile = () => window.innerWidth < 768;

// ─── INIT ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  var params   = new URLSearchParams(window.location.search);
  var year     = params.get('year');
  var province = params.get('province');
  var subject  = params.get('subject');

  if (!year || !province || !subject) {
    showError('Missing paper parameters. Please go back and select a paper.');
    return;
  }

  fetch('/api/see-paper?year=' + year + '&province=' + province + '&subject=' + subject)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) { showError(data.error); return; }
      DATA = data;
      PAPER_KEY  = data.meta.paperKey;
      PRINT_BASE = data.meta.printBase;
      init();
    })
    .catch(function(err) {
      showError('Network error. Please check your connection.');
      console.error(err);
    });
});

function init() {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('app-body').style.display      = 'flex';
  document.getElementById('hdr').style.display           = 'block';

  document.documentElement.style.setProperty('--accent', DATA.subject.accent);

  // Header
  var hdrIcon = document.getElementById('hdr-icon');
  hdrIcon.textContent        = DATA.subject.icon;
  hdrIcon.style.background   = DATA.subject.light;
  hdrIcon.style.color        = DATA.subject.accent;
  document.getElementById('hdr-title').textContent = DATA.subject.name + ' · SEE ' + DATA.paper.year;
  document.getElementById('hdr-sub').textContent   = DATA.paper.province + ' Province · ' + DATA.paper.marks + ' marks · ' + DATA.paper.duration;

  if (DATA.meta.isEnglish) {
    document.getElementById('lang-tog').style.display = 'none';
  }

  document.title = 'SEE ' + DATA.paper.year + ' ' + DATA.paper.province + ' ' + DATA.subject.name + ' Past Paper | ujyalo';

  buildOverview();
  buildSidebar();
  buildInfoStrip();
  buildQuestions();
  buildStepDots();
  buildFormulaPanel();
  loadProgress();
  loadConf();
  loadNotes();
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────

function buildOverview() {
  var accent = DATA.subject.accent;
  var prov   = DATA.province;

  var ico = document.getElementById('ov-icon');
  ico.textContent      = DATA.subject.icon;
  ico.style.background = DATA.subject.light;
  ico.style.color      = accent;

  var nm = document.getElementById('ov-subj-name');
  nm.innerHTML = '';
  var strong = document.createElement('span');
  strong.textContent = DATA.subject.name + ' ';
  var em = document.createElement('em');
  em.textContent  = '/ ' + DATA.subject.np;
  em.style.color  = accent;
  nm.appendChild(strong);
  nm.appendChild(em);

  document.getElementById('ov-subj-yr').textContent = 'SEE ' + DATA.paper.year + ' · ' + DATA.meta.yearAD + ' AD';

  var trail = document.getElementById('ov-trail');
  trail.innerHTML = '';
  var steps = [
    { key: 'Subject',  val: DATA.subject.name,   col: '#22c55e', done: true },
    { key: 'Year',     val: DATA.paper.year,      col: '#22c55e', done: true },
    { key: 'Province', val: DATA.paper.province,  col: accent,    done: false },
  ];
  steps.forEach(function(s, i) {
    if (i > 0) { var line = document.createElement('div'); line.className = 'trail-line'; trail.appendChild(line); }
    var row = document.createElement('div'); row.className = 'trail-row';
    var dot = document.createElement('div'); dot.className = 'trail-dot ' + (s.done ? 'done' : 'cur');
    var key = document.createElement('span'); key.className = 'trail-key ' + (s.done ? 'done' : 'cur'); key.textContent = s.key;
    var val = document.createElement('span'); val.className = 'trail-val'; val.style.color = s.col; val.textContent = s.val + (s.done ? ' ✓' : ' ●');
    row.appendChild(dot); row.appendChild(key); row.appendChild(val);
    trail.appendChild(row);
  });

  var pill = document.getElementById('ov-prov-pill');
  pill.style.background = accent + '18';
  pill.style.border = '1px solid ' + accent + '33';
  pill.innerHTML = '<div class="prov-num" style="background:' + accent + ';">P' + (prov && prov.num ? prov.num : '') + '</div>'
    + '<div><div class="prov-nm">' + DATA.paper.province + ' Province</div>'
    + '<div class="prov-np">' + (prov && prov.np ? prov.np : '') + ' प्रदेश</div></div>';

  var stats = document.getElementById('ov-stats');
  stats.innerHTML = [
    { n: DATA.meta.totalQuestions,                               l: 'Questions' },
    { n: DATA.paper.marks,                                       l: 'Marks' },
    { n: DATA.paper.duration,                                    l: 'Duration' },
    { n: DATA.meta.totalSubs || DATA.meta.totalQuestions,        l: 'Sub-parts' },
  ].map(function(s) {
    return '<div class="ov-stat"><div class="ov-stat-n">' + s.n + '</div><div class="ov-stat-l">' + s.l + '</div></div>';
  }).join('');

  var allTopics = [];
  DATA.groups.forEach(function(g) {
    if (g.parent && g.parent.topic) allTopics.push(g.parent.topic);
    g.subs.forEach(function(s) { if (s.topic) allTopics.push(s.topic); });
  });
  var uniqueTopics = allTopics.filter(function(t, i, a) { return a.indexOf(t) === i; }).slice(0, 4);
  if (uniqueTopics.length) {
    document.getElementById('ov-topics-section').style.display = 'block';
    document.getElementById('ov-topics').innerHTML = uniqueTopics.map(function(t) {
      return '<span class="topic-pill">' + t + '</span>';
    }).join('');
  }
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────

function buildSidebar() {
  var accent     = DATA.subject.accent;
  var frag       = document.createDocumentFragment();
  var lastSection = null;

  var secColors = { A: '#1a6fff', B: '#38c9b0', C: '#f59c1a', D: '#7c3aed' };
  var secLabels = { A: 'Group A — Objective', B: 'Group B — Short answer', C: 'Group C — Long answer' };

  DATA.groups.forEach(function(g) {
    // Section divider — insert when section changes
    var thisSec = getGroupSection(g);
    if (thisSec !== lastSection) {
      lastSection = thisSec;
      var secHdr = document.createElement('div');
      secHdr.className = 'sb-sec-hdr';
      var secBadge = document.createElement('div');
      secBadge.className = 'sb-sec-badge';
      secBadge.style.background = secColors[thisSec] || accent;
      secBadge.textContent = thisSec;
      var secLbl = document.createElement('span');
      secLbl.className = 'sb-sec-lbl';
      secLbl.textContent = secLabels[thisSec] || ('Group ' + thisSec);
      secHdr.appendChild(secBadge);
      secHdr.appendChild(secLbl);
      frag.appendChild(secHdr);
    }

    var row = document.createElement('div');
    row.className = 'sb-row';
    row.id = 'sb-' + g.num;
    row.setAttribute('data-num', g.num);

    // Click: scroll to question AND open answer if in check/step mode
    row.onclick = (function(grp) {
      return function() {
        scrollToQ(grp.num);
        if (MODE === 'check' || MODE === 'step') {
          var src   = grp.subs.length > 0 ? grp.subs[0] : grp.parent;
          var subId = grp.subs.length > 0
            ? ('q-' + grp.num + '-' + grp.subs[0].sub)
            : ('q-' + grp.num + '-main');
          if (src) openAnswer(subId, src, grp.num);
        }
      };
    })(g);

    var numEl = document.createElement('div');
    numEl.className        = 'sb-num';
    numEl.id               = 'sb-num-' + g.num;
    numEl.textContent      = g.num;
    numEl.style.background = accent + '18';
    numEl.style.color      = accent;

    var info   = document.createElement('div'); info.className = 'sb-info';
    var topic  = document.createElement('div'); topic.className = 'sb-topic';
    // Prefer Nepali topic if language is NP, else English
    var topicT = (g.parent && g.parent.topic) ? g.parent.topic
      : (g.parent && (g.parent.en || g.parent.np)
        ? (LANG === 'np' && g.parent.np ? g.parent.np : g.parent.en || '').split(' ').slice(0, 5).join(' ') + '...'
        : 'Question ' + g.num);
    topic.textContent = topicT;
    var marks = g.subs.length
      ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0)
      : (g.parent ? g.parent.marks || 0 : 0);
    var meta  = document.createElement('div'); meta.className = 'sb-meta'; meta.textContent = marks + 'm';
    info.appendChild(topic); info.appendChild(meta);
    row.appendChild(numEl); row.appendChild(info);
    frag.appendChild(row);
  });

  document.getElementById('sb-scroll').appendChild(frag);
  document.getElementById('sb-count').textContent = '0 / ' + DATA.meta.totalQuestions + ' reviewed';
}

// ─── INFO STRIP ───────────────────────────────────────────────────────────

function buildInfoStrip() {
  var strip = document.getElementById('info-strip');
  strip.innerHTML = [
    { k: 'Marks',     v: DATA.paper.marks },
    { k: 'Time',      v: DATA.paper.duration },
    { k: 'Questions', v: DATA.meta.totalQuestions },
    { k: 'Language',  v: DATA.meta.isEnglish ? 'English only' : 'Nepali / English' },
  ].map(function(item, i) {
    return (i > 0 ? '<span class="info-sep">|</span>' : '')
      + '<div class="info-item"><span class="info-k">' + item.k + '</span>'
      + '<span class="info-v">' + item.v + '</span></div>';
  }).join('');
}

// ─── QUESTION CARDS ───────────────────────────────────────────────────────

function buildQuestions() {
  var accent = DATA.subject.accent;
  var area   = document.getElementById('questions-area');
  area.innerHTML = '';

  DATA.groups.forEach(function(g) {
    var card = document.createElement('div');
    card.className = 'qcard';
    card.id = 'qcard-' + g.num;

    var strip = document.createElement('div');
    strip.className = 'qcard-strip';
    strip.id = 'qstrip-' + g.num;
    card.appendChild(strip);

    // Head
    var head  = document.createElement('div'); head.className = 'qcard-head';
    var headL = document.createElement('div'); headL.className = 'qcard-head-l';

    var numEl = document.createElement('div');
    numEl.className = 'qnum'; numEl.style.background = accent; numEl.textContent = g.num;
    headL.appendChild(numEl);

    if (g.parent && g.parent.topic) {
      var tag = document.createElement('span');
      tag.className = 'qtag'; tag.style.background = accent + '18'; tag.style.color = accent;
      tag.textContent = g.parent.topic; headL.appendChild(tag);
    }
    if (g.parent && g.parent.difficulty) {
      var diff = g.parent.difficulty;
      var dtag = document.createElement('span'); dtag.className = 'qtag';
      dtag.style.background = diff === 'Hard' ? 'rgba(239,68,68,.1)' : diff === 'Medium' ? 'rgba(245,156,26,.1)' : 'rgba(34,197,94,.1)';
      dtag.style.color = diff === 'Hard' ? '#ef4444' : diff === 'Medium' ? '#f59c1a' : '#22c55e';
      dtag.textContent = diff; headL.appendChild(dtag);
    }
    // Frequency tag
    if (g.parent && g.parent.frequency) {
      var ftag = document.createElement('span'); ftag.className = 'qtag';
      ftag.style.background = 'rgba(239,68,68,.1)'; ftag.style.color = '#ef4444';
      ftag.textContent = '🔥 ' + g.parent.frequency; headL.appendChild(ftag);
    }
    head.appendChild(headL);

    var headR = document.createElement('div'); headR.className = 'qcard-head-r';
    var marks = g.subs.length ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0) : (g.parent ? g.parent.marks || 0 : 0);
    var marksEl = document.createElement('span'); marksEl.className = 'qmarks'; marksEl.textContent = marks + 'm';
    headR.appendChild(marksEl);

    // Note button
    var noteBtn = document.createElement('button');
    noteBtn.className = 'note-btn'; noteBtn.id = 'note-btn-' + g.num;
    noteBtn.textContent = '📝 Note';
    noteBtn.onclick = (function(num) { return function(e) { e.stopPropagation(); toggleNote(num); }; })(g.num);
    headR.appendChild(noteBtn);

    var doneBtn = document.createElement('button');
    doneBtn.className = 'done-btn undone'; doneBtn.id = 'done-btn-' + g.num;
    doneBtn.textContent = 'Mark done';
    doneBtn.onclick = function(e) { e.stopPropagation(); markDone(g.num); };
    headR.appendChild(doneBtn);

    head.appendChild(headR);
    card.appendChild(head);

    // Body
    var body = document.createElement('div'); body.className = 'qcard-body';

    if (g.parent && (g.parent.en || g.parent.np)) {
      var qtext = document.createElement('div'); qtext.className = 'q-text';
      qtext.dataset.en = g.parent.en || ''; qtext.dataset.np = g.parent.np || g.parent.en || '';
      qtext.textContent = LANG === 'np' && g.parent.np ? g.parent.np : g.parent.en;
      body.appendChild(qtext);
    }
    if (g.parent && g.parent.diagram) {
      var diag = document.createElement('div'); diag.className = 'q-diagram'; diag.innerHTML = g.parent.diagram;
      body.appendChild(diag);
    }

    // Student count badge
    if (g.parent && g.parent.student_count) {
      var sc = document.createElement('div'); sc.className = 'student-count';
      var hard = g.parent.error_rate && parseInt(g.parent.error_rate) >= 50;
      sc.innerHTML = '<span class="sc-text">👥 ' + g.parent.student_count + ' students'
        + (g.parent.error_rate ? ' · <span class="' + (hard ? 'sc-hard' : '') + '">' + g.parent.error_rate + '% got it wrong</span>' : '') + '</span>';
      body.appendChild(sc);
    }

    if (g.subs.length > 0) {
      g.subs.forEach(function(s) { body.appendChild(buildSubItem(s, g.num, accent)); });
    } else if (g.parent) {
      body.appendChild(buildSubItem(g.parent, g.num, accent, true));
    }

    card.appendChild(body);

    // Note area
    var noteArea = document.createElement('div');
    noteArea.className = 'note-area'; noteArea.id = 'note-area-' + g.num;
    var noteTA = document.createElement('textarea');
    noteTA.placeholder = 'Add a note for yourself on this question...';
    noteTA.addEventListener('input', (function(num, ta) {
      return function() { noteMap[num] = ta.value; saveNotes(); };
    })(g.num, noteTA));
    noteArea.appendChild(noteTA);
    card.appendChild(noteArea);

    area.appendChild(card);
  });
}

function buildSubItem(s, qNum, accent, isParent) {
  var subId = isParent ? ('q-' + qNum + '-main') : ('q-' + qNum + '-' + s.sub);
  var item  = document.createElement('div'); item.className = 'sub-item'; item.id = subId;

  if (!isParent) {
    var subHead = document.createElement('div'); subHead.className = 'sub-head';
    var ltr = document.createElement('span'); ltr.className = 'sub-ltr';
    ltr.style.background = accent + '18'; ltr.style.color = accent; ltr.textContent = s.sub;
    subHead.appendChild(ltr);
    var marksEl = document.createElement('span'); marksEl.className = 'sub-marks'; marksEl.textContent = (s.marks || 0) + 'm';
    subHead.appendChild(marksEl);
    var bkBtn = document.createElement('button'); bkBtn.className = 'bk-btn'; bkBtn.title = 'Bookmark'; bkBtn.textContent = '🔖';
    bkBtn.onclick = function() { toggleBookmark(bkBtn, subId, s, qNum); };
    subHead.appendChild(bkBtn);
    item.appendChild(subHead);
  }

  if (s.en || s.np) {
    var stxt = document.createElement('div'); stxt.className = 'sub-text';
    stxt.dataset.en = s.en || ''; stxt.dataset.np = s.np || s.en || '';
    stxt.textContent = LANG === 'np' && s.np ? s.np : s.en;
    item.appendChild(stxt);
  }

  if (s.opts) {
    var opts = Array.isArray(s.opts) ? s.opts : JSON.parse(s.opts);
    var grid = document.createElement('div'); grid.className = 'mcq-grid';
    opts.forEach(function(o, oi) {
      var btn = document.createElement('button'); btn.className = 'mcq-opt'; btn.textContent = o;
      btn.onclick = function() { pickOpt(btn, grid, s.correct, oi); };
      grid.appendChild(btn);
    });
    item.appendChild(grid);
  }

  var ansBtn = document.createElement('button'); ansBtn.className = 'ans-btn';
  ansBtn.style.borderColor = accent + '80'; ansBtn.style.color = accent;
  ansBtn.style.borderStyle = 'dashed'; ansBtn.style.borderWidth = '1.5px';
  if (MODE === 'read') ansBtn.style.display = 'none';
  ansBtn.innerHTML = '<span>👁</span> See answer &amp; explanation';
  ansBtn.onclick = function() { openAnswer(subId, s, qNum); };
  item.appendChild(ansBtn);

  return item;
}

// ─── SECTION HELPERS ──────────────────────────────────────────────────────

// Detect which section (A/B/C) a group belongs to.
// Priority: explicit section field on DB row -> marks-based for SEE papers
// SEE standard: Group A = 1 mark each, Group B = 2-5 marks, Group C = 6+ marks
function getGroupSection(g) {
  if (g.section) return g.section.toUpperCase();
  if (g.parent && g.parent.section) return g.parent.section.toUpperCase();
  var marks = g.subs.length
    ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0)
    : (g.parent ? g.parent.marks || 0 : 0);
  if (marks <= 1) return 'A';
  if (marks <= 5) return 'B';
  return 'C';
}

// ─── SECTION JUMP BAR ─────────────────────────────────────────────────────

function buildSectionJumpBar() {
  var bar = document.getElementById('sec-jump-bar');
  bar.innerHTML = '';

  // Build section map using marks-based detection (no DB column needed)
  var sections = {};
  DATA.groups.forEach(function(g) {
    var sec = getGroupSection(g);
    if (!sections[sec]) sections[sec] = { label: sec, groups: [] };
    sections[sec].groups.push(g.num);
  });

  // Colours per section
  var secColors = { A: '#1a6fff', B: '#38c9b0', C: '#f59c1a', D: '#7c3aed' };

  Object.keys(sections).forEach(function(sec) {
    var s   = sections[sec];
    var col = secColors[sec] || '#94a3b8';
    var btn = document.createElement('button');
    btn.className = 'sjb-btn'; btn.id = 'sjb-' + sec;
    btn.onclick = (function(secId) {
      return function() {
        scrollToSection(secId);
        document.querySelectorAll('.sjb-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      };
    })(sec);

    var badge = document.createElement('div'); badge.className = 'sjb-sec-badge';
    badge.style.background = col; badge.textContent = sec;
    btn.appendChild(badge);
    btn.appendChild(document.createTextNode('Group ' + sec));

    var dots = document.createElement('div'); dots.className = 'sjb-dots';
    s.groups.forEach(function(num) {
      var dot = document.createElement('div'); dot.className = 'sjb-dot'; dot.id = 'sjb-dot-' + num;
      dots.appendChild(dot);
    });
    btn.appendChild(dots);
    bar.appendChild(btn);
  });

  // Spacer + progress
  var spacer = document.createElement('div'); spacer.className = 'sjb-spacer';
  bar.appendChild(spacer);
  var prog = document.createElement('div'); prog.className = 'sjb-prog';
  prog.innerHTML = '<div class="sjb-prog-track"><div class="sjb-prog-fill" id="sjb-prog-fill"></div></div>'
    + '<span class="sjb-prog-count" id="sjb-prog-count">0/' + DATA.meta.totalQuestions + '</span>';
  bar.appendChild(prog);

  // Activate first
  var firstBtn = bar.querySelector('.sjb-btn');
  if (firstBtn) firstBtn.classList.add('active');

  bar.style.display = 'flex';
}

function scrollToSection(sec) {
  // Use same marks-based detection as jump bar
  var firstQ = null;
  DATA.groups.forEach(function(g) {
    if (!firstQ && getGroupSection(g) === sec) firstQ = g.num;
  });
  if (firstQ) scrollToQ(firstQ);
}

// ─── STEP DOTS ────────────────────────────────────────────────────────────

function buildStepDots() {
  var strip = document.getElementById('step-dots');
  strip.innerHTML = '';
  DATA.groups.forEach(function(g, i) {
    var dot = document.createElement('div'); dot.className = 'step-dot'; dot.id = 'sdot-' + g.num; dot.title = 'Q' + g.num;
    dot.onclick = (function(idx) { return function() { goStep(idx); }; })(i);
    strip.appendChild(dot);
  });
  var ctr = document.createElement('span'); ctr.className = 'step-counter'; ctr.id = 'step-counter'; ctr.textContent = '1 / ' + DATA.groups.length;
  strip.appendChild(ctr);
}

// ─── FORMULA PANEL ────────────────────────────────────────────────────────

function buildFormulaPanel() {
  var body = document.getElementById('fp-body');
  if (!body) return;

  var formulas = DATA.meta && DATA.meta.formulas ? DATA.meta.formulas : null;

  // Default formulas always shown
  var defaults = [
    { title: 'Algebra', items: [
      { name: 'Quadratic formula', f: 'x = (−b ± √(b²−4ac)) / 2a' },
      { name: 'Sum of interior angles', f: '(n − 2) × 180°' },
    ]},
    { title: 'Mensuration', items: [
      { name: 'Cone CSA', f: 'πrl' },
      { name: 'Cone Volume', f: '⅓πr²h' },
      { name: 'Cylinder Volume', f: 'πr²h' },
      { name: 'Sphere Surface', f: '4πr²' },
    ]},
    { title: 'Sets', items: [
      { name: 'Union', f: 'n(A∪B) = n(A) + n(B) − n(A∩B)' },
    ]},
    { title: 'Pythagoras', items: [
      { name: '', f: 'a² + b² = c²' },
    ]},
    { title: 'Distance', items: [
      { name: '', f: 'd = √((x₂−x₁)² + (y₂−y₁)²)' },
    ]},
  ];

  var data = formulas || defaults;
  body.innerHTML = '';
  data.forEach(function(sec) {
    var section = document.createElement('div'); section.className = 'fp-sec';
    var title = document.createElement('div'); title.className = 'fp-sec-title'; title.textContent = sec.title;
    section.appendChild(title);
    sec.items.forEach(function(item) {
      if (item.name) { var nm = document.createElement('div'); nm.className = 'fp-name'; nm.textContent = item.name; section.appendChild(nm); }
      var formula = document.createElement('div'); formula.className = 'fp-formula'; formula.textContent = item.f;
      section.appendChild(formula);
    });
    body.appendChild(section);
  });
}

function toggleFormula() {
  formulaOpen = !formulaOpen;
  var panel = document.getElementById('formula-panel');
  if (panel) panel.classList.toggle('open', formulaOpen);
  var btn = document.getElementById('formula-toggle-btn');
  if (btn) btn.classList.toggle('active', formulaOpen);
}

// ─── MODE ENTRY ───────────────────────────────────────────────────────────

function enterMode(mode) {
  MODE = mode;
  document.getElementById('screen-overview').style.display = 'none';
  document.getElementById('mode-tabs').style.display = 'flex';
  buildSectionJumpBar();

  if (mode === 'step') {
    document.getElementById('screen-paper').style.display = 'none';
    document.getElementById('screen-step').style.display = 'flex';
    document.getElementById('screen-step').style.flex = '1';
    document.getElementById('screen-step').style.overflow = 'hidden';
    stepIdx = 0; renderStep();
  } else {
    document.getElementById('screen-step').style.display = 'none';
    document.getElementById('screen-paper').style.display = 'flex';
    document.getElementById('screen-paper').style.flex = '1';
    document.getElementById('screen-paper').style.overflow = 'hidden';
  }

  var ansBtns = document.querySelectorAll('.ans-btn');
  ansBtns.forEach(function(btn) { btn.style.display = mode === 'read' ? 'none' : ''; });

  setActiveTab(mode);

  if (!isMobile() && mode === 'check' && DATA.groups.length > 0) {
    var g = DATA.groups[0];
    var firstId = g.subs.length > 0 ? ('q-' + g.num + '-' + g.subs[0].sub) : ('q-' + g.num + '-main');
    var firstQ  = g.subs.length > 0 ? g.subs[0] : g.parent;
    if (firstQ) openAnswer(firstId, firstQ, g.num);
  }

  loadProgress();
}

function setMode(mode) {
  MODE = mode;
  setActiveTab(mode);

  if (mode === 'step') {
    document.getElementById('screen-paper').style.display = 'none';
    document.getElementById('screen-step').style.display = 'flex';
    document.getElementById('screen-step').style.flex = '1';
    stepIdx = 0; renderStep();
  } else {
    document.getElementById('screen-step').style.display = 'none';
    document.getElementById('screen-paper').style.display = 'flex';
    document.getElementById('screen-paper').style.flex = '1';
  }

  var ansBtns = document.querySelectorAll('.ans-btn');
  ansBtns.forEach(function(btn) { btn.style.display = mode === 'read' ? 'none' : ''; });

  if (!isMobile() && mode === 'check' && DATA.groups.length > 0) {
    var g = DATA.groups[0];
    var firstId = g.subs.length > 0 ? ('q-' + g.num + '-' + g.subs[0].sub) : ('q-' + g.num + '-main');
    var firstQ  = g.subs.length > 0 ? g.subs[0] : g.parent;
    if (firstQ) openAnswer(firstId, firstQ, g.num);
  }
}

function setActiveTab(mode) {
  document.querySelectorAll('.mtab').forEach(function(t) { t.classList.remove('act'); });
  var map = { read: 'mtab-read', check: 'mtab-check', step: 'mtab-step' };
  var el  = document.getElementById(map[mode]);
  if (el) el.classList.add('act');
}

// ─── LANGUAGE ─────────────────────────────────────────────────────────────

function setLang(l) {
  LANG = l;
  document.getElementById('lt-en').className = 'lt-btn ' + (l === 'en' ? 'act' : 'off');
  document.getElementById('lt-np').className  = 'lt-btn ' + (l === 'np' ? 'act' : 'off');

  var attr = l === 'np' ? 'data-np' : 'data-en';
  document.querySelectorAll('.q-text, .sub-text').forEach(function(el) {
    var txt = el.getAttribute(attr);
    if (txt && txt.trim()) el.textContent = txt.trim();
  });

  if (activeId) { currentStep = 0; reopenAnswer(); }
  if (MODE === 'step') renderStep();
}

// ─── ANSWER OPEN ──────────────────────────────────────────────────────────

var _lastAnswerData = null;

function openAnswer(id, qData, qNum) {
  activeId = id;
  currentStep = 0;
  _lastAnswerData = { id: id, qData: qData, qNum: qNum };

  document.querySelectorAll('.sb-row').forEach(function(r) { r.classList.remove('active'); });
  var sbRow = document.getElementById('sb-' + qNum);
  if (sbRow) sbRow.classList.add('active');

  document.querySelectorAll('.qcard').forEach(function(c) { c.classList.remove('active'); });
  var qcard = document.getElementById('qcard-' + qNum);
  if (qcard) qcard.classList.add('active');

  var html = buildAnswerHTML(qData, qNum);

  if (isMobile()) {
    document.getElementById('drawer-q').textContent     = 'Q' + qNum + (qData.sub ? ' (' + qData.sub + ')' : '');
    document.getElementById('drawer-marks').textContent = (qData.marks || 0) + ' marks';
    document.getElementById('drawer-body').innerHTML    = html;
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('open');
    // Attach conf button handlers in drawer
    attachConfHandlers(document.getElementById('drawer-body'), qNum);
  } else {
    var lbl = 'Q' + qNum + (qData.sub ? ' (' + qData.sub + ')' : '') + ' — ' + (qData.marks || 0) + ' marks';
    document.getElementById('ap-q').textContent      = lbl;
    document.getElementById('ap-body').innerHTML     = html;
    attachConfHandlers(document.getElementById('ap-body'), qNum);
    if (MODE === 'step') {
      document.getElementById('step-ap-q').textContent    = lbl;
      document.getElementById('step-ap-body').innerHTML   = html;
      attachConfHandlers(document.getElementById('step-ap-body'), qNum);
    }
  }

  // Restore existing confidence selection
  restoreConf(qNum);
}

function reopenAnswer() {
  if (_lastAnswerData) openAnswer(_lastAnswerData.id, _lastAnswerData.qData, _lastAnswerData.qNum);
}

// ─── BUILD ANSWER HTML ────────────────────────────────────────────────────

function buildAnswerHTML(q, qNum) {
  var answer = q.answer || 'Model answer coming soon.';
  var accent = DATA.subject.accent;
  var steps  = q.steps ? (Array.isArray(q.steps) ? q.steps : JSON.parse(q.steps)) : null;

  var html = '';

  // Final answer box
  html += '<div class="ans-final" style="background:' + accent + '12;border:1.5px solid ' + accent + '30;">'
    + '<div class="ans-check"><div class="ans-check-circle">✓</div>'
    + '<span class="ans-final-label">Final answer</span></div>'
    + '<div class="ans-text">' + escapeHTML(answer) + '</div>'
    + '</div>';

  // Marking scheme (if data has it)
  if (q.marking_scheme && Array.isArray(q.marking_scheme) && q.marking_scheme.length) {
    html += '<div class="marking-scheme">'
      + '<div class="ms-label">Marking scheme</div>';
    q.marking_scheme.forEach(function(row) {
      html += '<div class="ms-row"><span class="ms-step">' + escapeHTML(row.step || row) + '</span>'
        + (row.mark ? '<span class="ms-mark">' + row.mark + ' mark' + (row.mark > 1 ? 's' : '') + '</span>' : '') + '</div>';
    });
    html += '</div>';
  }

  // Why the examiner tests this
  if (q.why_examiner) {
    html += '<div class="why-box">'
      + '<div class="why-label">Why the examiner tests this</div>'
      + '<div class="why-text">' + escapeHTML(q.why_examiner) + '</div>'
      + '</div>';
  }

  // Step-by-step
  if (steps && steps.length) {
    html += '<div class="steps-label" style="color:' + accent + ';">Step-by-step working</div>';
    steps.forEach(function(s, i) {
      var shown  = i <= currentStep ? ' shown' : '';
      var circBg = i < currentStep ? 'var(--green)' : i === currentStep ? accent : 'var(--line)';
      var circCl = i <= currentStep ? '#fff' : 'var(--faint)';
      var circTx = i < currentStep ? '✓' : String(i + 1);
      var lineBg = i < currentStep ? 'rgba(34,197,94,.4)' : 'var(--line)';
      var lineHtml = i < steps.length - 1 ? '<div class="step-line" style="background:' + lineBg + ';"></div>' : '';
      html += '<div class="step-item' + shown + '" style="transition-delay:' + (i * 0.06).toFixed(2) + 's;">'
        + '<div class="step-col">'
        + '<div class="step-circle" style="background:' + circBg + ';color:' + circCl + ';">' + circTx + '</div>'
        + lineHtml + '</div>'
        + '<div class="step-text">' + escapeHTML(String(s)) + '</div>'
        + '</div>';
    });
    if (currentStep < steps.length - 1) {
      html += '<button class="next-step-btn" style="background:' + accent + ';" onclick="nextStep()">'
        + 'Next step &#8594;</button>';
    } else {
      html += '<button class="replay-btn" onclick="replaySteps()">&#8635; Replay steps</button>';
    }
  }

  // Common mistake
  if (q.common_mistake) {
    html += '<div class="mistake-box">'
      + '<div class="mistake-label">⚠ Most common mistake</div>'
      + '<div class="mistake-text">' + escapeHTML(q.common_mistake) + '</div>'
      + '</div>';
  }

  // Re-explain
  html += '<button class="re-btn" onclick="toggleReExplain(this)">💡 Still stuck? Explain differently</button>'
    + '<div class="re-box" style="display:none;">'
    + '<div class="re-box-label">Simpler explanation</div>'
    + '<div class="re-box-text">' + escapeHTML(q.simpler_explanation || 'Break the problem into smaller parts. Try the first step only — the rest will follow.') + '</div>'
    + '</div>';

  // Confidence bar
  html += '<div class="conf-bar" id="conf-bar-' + qNum + '">'
    + '<div class="conf-label">How did you do?</div>'
    + '<div class="conf-btns">'
    + '<button class="conf-btn cb-got" data-conf="got" data-qnum="' + qNum + '"><span class="cb-ico">✓</span><span class="cb-lbl" style="color:var(--green);">Got it</span></button>'
    + '<button class="conf-btn cb-almost" data-conf="almost" data-qnum="' + qNum + '"><span class="cb-ico">〜</span><span class="cb-lbl" style="color:var(--orange);">Almost</span></button>'
    + '<button class="conf-btn cb-missed" data-conf="missed" data-qnum="' + qNum + '"><span class="cb-ico">✗</span><span class="cb-lbl" style="color:var(--red);">Missed it</span></button>'
    + '</div></div>';

  // Post-confidence area
  html += '<div class="post-conf" id="post-conf-' + qNum + '">'
    + buildPostConfHTML(qNum, q)
    + '</div>';

  return html;
}

function buildPostConfHTML(qNum, q) {
  var conf = confMap[qNum];
  if (!conf) return '';

  var msgs = {
    got:    'You\'re ahead — many students find this difficult. Keep this momentum.',
    almost: 'You\'re close. Review the step you missed and try once more.',
    missed: 'Don\'t worry — this is one of the harder questions. Read the working carefully, then try a similar one.',
  };

  var html = '<div class="post-conf-line">' + escapeHTML(msgs[conf] || '') + '</div>';

  if (q && q.similar_topic) {
    html += '<button class="similar-btn" onclick="openSimilar(\'' + escapeAttr(q.similar_topic) + '\')">'
      + '⚡ Try a similar question →</button>';
  }

  return html;
}

function attachConfHandlers(container, qNum) {
  if (!container) return;
  var btns = container.querySelectorAll('.conf-btn[data-qnum="' + qNum + '"]');
  btns.forEach(function(btn) {
    btn.onclick = function() {
      var conf = btn.getAttribute('data-conf');
      setConf(qNum, conf, container);
    };
  });
}

function setConf(qNum, conf, container) {
  confMap[qNum] = conf;
  saveConf();

  // Update buttons in container
  if (container) {
    container.querySelectorAll('.conf-btn[data-qnum="' + qNum + '"]').forEach(function(b) {
      b.classList.remove('selected');
    });
    var activeBtn = container.querySelector('.conf-btn[data-conf="' + conf + '"][data-qnum="' + qNum + '"]');
    if (activeBtn) activeBtn.classList.add('selected');

    // Show post-conf content
    var postConf = container.querySelector('#post-conf-' + qNum);
    if (postConf && _lastAnswerData) {
      postConf.innerHTML = buildPostConfHTML(qNum, _lastAnswerData.qData);
      postConf.classList.add('open');
    }
  }

  // Update question card border
  var card = document.getElementById('qcard-' + qNum);
  if (card) {
    card.classList.remove('conf-got', 'conf-almost', 'conf-missed');
    card.classList.add('conf-' + conf);
  }

  // Update sidebar dot
  var sbNum = document.getElementById('sb-num-' + qNum);
  if (sbNum && conf === 'got') {
    sbNum.style.background = 'rgba(34,197,94,.2)';
    sbNum.style.color = 'var(--green)';
  }

  // Update section jump dots
  var sjbDot = document.getElementById('sjb-dot-' + qNum);
  if (sjbDot) {
    sjbDot.className = 'sjb-dot d-' + conf;
  }

  // Celebrate if got it
  if (conf === 'got') celebrate();

  updateProgress();
}

function restoreConf(qNum) {
  var conf = confMap[qNum];
  if (!conf) return;

  // Find the active answer container
  var container = isMobile()
    ? document.getElementById('drawer-body')
    : (MODE === 'step' ? document.getElementById('step-ap-body') : document.getElementById('ap-body'));

  if (!container) return;

  container.querySelectorAll('.conf-btn[data-qnum="' + qNum + '"]').forEach(function(b) {
    b.classList.remove('selected');
    if (b.getAttribute('data-conf') === conf) b.classList.add('selected');
  });

  var postConf = container.querySelector('#post-conf-' + qNum);
  if (postConf && _lastAnswerData) {
    postConf.innerHTML = buildPostConfHTML(qNum, _lastAnswerData.qData);
    if (postConf.innerHTML.trim()) postConf.classList.add('open');
  }
}

function openSimilar(topic) {
  if (topic) {
    window.location.href = '/chapter-practice.html?topic=' + encodeURIComponent(topic);
  }
}

// ─── CELEBRATION ──────────────────────────────────────────────────────────

function celebrate() {
  var toast = document.getElementById('celeb-toast');
  if (!toast) return;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2200);
}

// ─── STEPS ────────────────────────────────────────────────────────────────

function nextStep() {
  if (!_lastAnswerData) return;
  var steps = _lastAnswerData.qData.steps;
  if (!steps) return;
  var arr = Array.isArray(steps) ? steps : JSON.parse(steps);
  if (currentStep < arr.length - 1) { currentStep++; reopenAnswer(); }
}

function replaySteps() { currentStep = 0; reopenAnswer(); }

function toggleReExplain(btn) {
  var box = btn.nextElementSibling;
  if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

// ─── STEP MODE ────────────────────────────────────────────────────────────

function renderStep() {
  var g      = DATA.groups[stepIdx];
  var accent = DATA.subject.accent;
  var total  = DATA.groups.length;
  if (!g) return;

  document.querySelectorAll('.step-dot').forEach(function(d, i) {
    d.className = 'step-dot';
    if (i === stepIdx) d.classList.add('active-dot');
    else if (doneSet.has(DATA.groups[i] && DATA.groups[i].num)) d.classList.add('done-dot');
  });
  document.getElementById('step-counter').textContent = (stepIdx + 1) + ' / ' + total;

  var qarea = document.getElementById('step-question');
  qarea.innerHTML = '';
  var card  = document.createElement('div'); card.className = 'step-q-card'; card.style.borderColor = accent + '44';
  var qnum  = document.createElement('div'); qnum.className = 'step-q-num'; qnum.style.color = accent; qnum.textContent = 'Q' + g.num;
  card.appendChild(qnum);

  var src = g.subs.length > 0 ? g.subs[0] : g.parent;
  if (src) {
    var qtxt = document.createElement('div'); qtxt.className = 'step-q-text';
    qtxt.dataset.en = src.en || ''; qtxt.dataset.np = src.np || src.en || '';
    qtxt.textContent = LANG === 'np' && src.np ? src.np : src.en;
    card.appendChild(qtxt);
  }
  if (g.parent && g.parent.topic) {
    var tpill = document.createElement('span'); tpill.className = 'qtag';
    tpill.style.background = accent + '18'; tpill.style.color = accent;
    tpill.style.marginTop = '10px'; tpill.style.display = 'inline-block';
    tpill.textContent = g.parent.topic; card.appendChild(tpill);
  }

  if (src) {
    var subId  = g.subs.length > 0 ? ('q-' + g.num + '-' + g.subs[0].sub) : ('q-' + g.num + '-main');
    var ansBtn = document.createElement('button'); ansBtn.className = 'ans-btn';
    ansBtn.style.borderColor = accent + '80'; ansBtn.style.color = accent;
    ansBtn.style.borderStyle = 'dashed'; ansBtn.style.borderWidth = '1.5px';
    ansBtn.style.marginTop = '12px';
    ansBtn.innerHTML = '👁 See answer &amp; explanation';
    ansBtn.onclick = (function(id, q, num) { return function() { openAnswer(id, q, num); }; })(subId, src, g.num);
    card.appendChild(ansBtn);
  }

  qarea.appendChild(card);
  document.getElementById('step-prev').disabled = stepIdx === 0;
  document.getElementById('step-next').disabled = stepIdx === total - 1;
  document.getElementById('step-next').style.background = stepIdx === total - 1 ? '' : accent;

  if (!isMobile()) {
    var src2   = g.subs.length > 0 ? g.subs[0] : g.parent;
    var subId2 = g.subs.length > 0 ? ('q-' + g.num + '-' + g.subs[0].sub) : ('q-' + g.num + '-main');
    document.getElementById('step-ap-q').textContent = 'Q' + g.num + ' — ' + (src2 ? src2.marks || 0 : 0) + ' marks';
    if (src2) {
      currentStep = 0;
      document.getElementById('step-ap-body').innerHTML = buildAnswerHTML(src2, g.num);
      attachConfHandlers(document.getElementById('step-ap-body'), g.num);
      restoreConf(g.num);
      _lastAnswerData = { id: subId2, qData: src2, qNum: g.num };
    }
  }
}

function stepPrev() { if (stepIdx > 0) { stepIdx--; currentStep = 0; renderStep(); } }
function stepNext() { if (stepIdx < DATA.groups.length - 1) { stepIdx++; currentStep = 0; renderStep(); } }
function goStep(idx) { stepIdx = idx; currentStep = 0; renderStep(); }

// ─── MCQ ──────────────────────────────────────────────────────────────────

function pickOpt(btn, grid, correct, chosen) {
  grid.querySelectorAll('.mcq-opt').forEach(function(b) { b.classList.remove('correct', 'wrong'); });
  btn.classList.add(chosen === correct ? 'correct' : 'wrong');
}

// ─── NOTES ────────────────────────────────────────────────────────────────

function toggleNote(num) {
  var area = document.getElementById('note-area-' + num);
  var btn  = document.getElementById('note-btn-' + num);
  if (!area) return;
  var isOpen = area.classList.toggle('open');
  if (btn) btn.classList.toggle('has-note', isOpen || !!noteMap[num]);
  // Restore saved note text
  if (isOpen) {
    var ta = area.querySelector('textarea');
    if (ta && noteMap[num]) ta.value = noteMap[num];
  }
}

function saveNotes() {
  try {
    var all = JSON.parse(localStorage.getItem('ujyalo_notes') || '{}');
    all[PAPER_KEY] = noteMap;
    localStorage.setItem('ujyalo_notes', JSON.stringify(all));
  } catch(e) {}
}

function loadNotes() {
  try {
    var all = JSON.parse(localStorage.getItem('ujyalo_notes') || '{}');
    noteMap = all[PAPER_KEY] || {};
    // Restore note button styles
    Object.keys(noteMap).forEach(function(num) {
      if (noteMap[num]) {
        var btn = document.getElementById('note-btn-' + num);
        if (btn) btn.classList.add('has-note');
      }
    });
  } catch(e) {}
}

// ─── MARK DONE / PROGRESS ─────────────────────────────────────────────────

function markDone(num) {
  var btn   = document.getElementById('done-btn-' + num);
  var card  = document.getElementById('qcard-' + num);
  var sbRow = document.getElementById('sb-' + num);
  var sbNum = document.getElementById('sb-num-' + num);
  var strip = document.getElementById('qstrip-' + num);
  var accent = DATA.subject.accent;

  if (doneSet.has(num)) {
    doneSet.delete(num);
    if (btn)   { btn.className = 'done-btn undone'; btn.textContent = 'Mark done'; }
    if (card)  { card.classList.remove('done-card'); }
    if (sbRow) { sbRow.classList.remove('done-row'); }
    if (sbNum) { sbNum.style.background = accent + '18'; sbNum.style.color = accent; sbNum.textContent = num; }
    if (strip) { strip.style.background = ''; strip.style.width = '0'; }
  } else {
    doneSet.add(num);
    if (btn)   { btn.className = 'done-btn done'; btn.textContent = '✓ Done'; }
    if (card)  { card.classList.add('done-card'); }
    if (sbRow) { sbRow.classList.add('done-row'); }
    if (sbNum) { sbNum.style.background = 'rgba(34,197,94,.18)'; sbNum.style.color = 'var(--green)'; sbNum.textContent = '✓'; }
    if (strip) { strip.style.background = 'var(--green)'; strip.style.width = '100%'; }
    // Update sjb dot
    var sjbDot = document.getElementById('sjb-dot-' + num);
    if (sjbDot && !sjbDot.className.includes('d-got') && !sjbDot.className.includes('d-almost') && !sjbDot.className.includes('d-missed')) {
      sjbDot.classList.add('d-done');
    }
  }
  updateProgress();
  saveProgress();
}

function updateProgress() {
  var total = DATA.meta.totalQuestions;
  var done  = doneSet.size;
  var pct   = Math.round((done / total) * 100);
  document.getElementById('prog-fill').style.width  = pct + '%';
  document.getElementById('prog-pct').textContent   = pct + '%';
  document.getElementById('sb-progress-fill').style.width = pct + '%';
  document.getElementById('sb-count').textContent   = done + ' / ' + total + ' reviewed';
  var sjbFill = document.getElementById('sjb-prog-fill');
  var sjbCount = document.getElementById('sjb-prog-count');
  if (sjbFill) sjbFill.style.width = pct + '%';
  if (sjbCount) sjbCount.textContent = done + '/' + total;
}

function saveProgress() {
  try {
    var all = JSON.parse(localStorage.getItem('ujyalo_progress') || '{}');
    all[PAPER_KEY] = { pct: Math.round((doneSet.size / DATA.meta.totalQuestions) * 100), done: Array.from(doneSet), started: true };
    localStorage.setItem('ujyalo_progress', JSON.stringify(all));
  } catch(e) {}
}

function loadProgress() {
  try {
    var saved = (JSON.parse(localStorage.getItem('ujyalo_progress') || '{}') || {})[PAPER_KEY];
    if (!saved || !saved.done) return;
    saved.done.forEach(function(num) {
      doneSet.add(num);
      var btn  = document.getElementById('done-btn-' + num);
      var card = document.getElementById('qcard-' + num);
      if (btn)  { btn.className = 'done-btn done'; btn.textContent = '✓ Done'; }
      if (card) { card.classList.add('done-card'); }
    });
    updateProgress();
    if (saved.pct > 0) {
      document.getElementById('ov-progress-section').style.display = 'block';
      document.getElementById('ov-progress-pct').textContent = saved.pct + '%';
      document.getElementById('ov-progress-lbl').textContent = saved.pct === 100 ? 'Completed ✓' : saved.done.length + ' of ' + DATA.meta.totalQuestions + ' reviewed';
      document.getElementById('ov-progress-fill').style.width = saved.pct + '%';
    }
  } catch(e) {}
}

function saveConf() {
  try {
    var all = JSON.parse(localStorage.getItem('ujyalo_conf') || '{}');
    all[PAPER_KEY] = confMap;
    localStorage.setItem('ujyalo_conf', JSON.stringify(all));
  } catch(e) {}
}

function loadConf() {
  try {
    var all = JSON.parse(localStorage.getItem('ujyalo_conf') || '{}');
    confMap = all[PAPER_KEY] || {};
    // Restore card borders
    Object.keys(confMap).forEach(function(num) {
      var conf = confMap[num];
      var card = document.getElementById('qcard-' + num);
      if (card) { card.classList.remove('conf-got', 'conf-almost', 'conf-missed'); card.classList.add('conf-' + conf); }
      var dot = document.getElementById('sjb-dot-' + num);
      if (dot) dot.className = 'sjb-dot d-' + conf;
    });
  } catch(e) {}
}

// ─── DARK MODE ────────────────────────────────────────────────────────────

function toggleDark() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark', darkMode);
  var btn = document.getElementById('dark-btn');
  if (btn) btn.textContent = darkMode ? '☀️' : '🌙';
  try { localStorage.setItem('ujyalo_dark', darkMode ? '1' : '0'); } catch(e) {}
}

// Restore dark preference
(function() {
  try { if (localStorage.getItem('ujyalo_dark') === '1') { darkMode = true; document.body.classList.add('dark'); } } catch(e) {}
})();

// ─── FONT SIZE ────────────────────────────────────────────────────────────

function changeSize(delta) {
  fontSize = Math.max(13, Math.min(20, fontSize + delta));
  document.documentElement.style.setProperty('--q-size', fontSize + 'px');
  try { localStorage.setItem('ujyalo_fontsize', fontSize); } catch(e) {}
}

// Restore font size
(function() {
  try {
    var saved = localStorage.getItem('ujyalo_fontsize');
    if (saved) { fontSize = parseInt(saved); document.documentElement.style.setProperty('--q-size', fontSize + 'px'); }
  } catch(e) {}
})();

// ─── TIMER ────────────────────────────────────────────────────────────────

function openTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('timer-pill').classList.remove('running');
    document.getElementById('timer-val').textContent = '3:00:00';
    document.getElementById('timer-pill').style.background = '';
    return;
  }
  document.getElementById('timer-modal').classList.add('open');
}

function closeTimer() {
  document.getElementById('timer-modal').classList.remove('open');
}

function startTimer(mins) {
  closeTimer();
  timerSecs    = mins * 60;
  timerRunning = true;
  document.getElementById('timer-pill').classList.add('running');
  tickTimer();
  timerInterval = setInterval(tickTimer, 1000);
}

function tickTimer() {
  if (timerSecs <= 0) {
    clearInterval(timerInterval); timerRunning = false;
    document.getElementById('timer-val').textContent = 'Time up!';
    return;
  }
  timerSecs--;
  var h = Math.floor(timerSecs / 3600);
  var m = Math.floor((timerSecs % 3600) / 60);
  var s = timerSecs % 60;
  document.getElementById('timer-val').textContent = h > 0
    ? h + ':' + pad2(m) + ':' + pad2(s)
    : m + ':' + pad2(s);
  if (timerSecs <= 1800) {
    document.getElementById('timer-pill').style.background = 'rgba(239,68,68,.3)';
  }
}

function pad2(n) { return n < 10 ? '0' + n : String(n); }

// ─── SCROLL TO Q ──────────────────────────────────────────────────────────

function scrollToQ(num) {
  var card = document.getElementById('qcard-' + num);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.sb-row').forEach(function(r) { r.classList.remove('active'); });
  var sb = document.getElementById('sb-' + num);
  if (sb) sb.classList.add('active');
  // Highlight the card
  document.querySelectorAll('.qcard').forEach(function(c) { c.classList.remove('active'); });
  if (card) card.classList.add('active');
}

// ─── BOOKMARKS ────────────────────────────────────────────────────────────

function toggleBookmark(btn, id, q, qNum) {
  btn.classList.toggle('saved');
  try {
    var bks = JSON.parse(localStorage.getItem('ujyalo_bookmarks') || '[]');
    var idx = bks.findIndex(function(b) { return b.id === id; });
    if (idx > -1) {
      bks.splice(idx, 1);
    } else {
      bks.push({
        id: id, qNum: qNum, sub: q.sub || null, marks: q.marks || 0,
        topic: q.topic || '', subjectCode: DATA.subject.code,
        year: DATA.paper.year, province: DATA.paper.province,
        paper: 'SEE ' + DATA.paper.year + ' ' + DATA.subject.name,
        questionText: (LANG === 'np' && q.np ? q.np : q.en || '').substring(0, 200),
      });
    }
    localStorage.setItem('ujyalo_bookmarks', JSON.stringify(bks));
  } catch(e) {}
}

// ─── DOWNLOAD ─────────────────────────────────────────────────────────────

function openDownload() {
  var overlay = document.getElementById('dl-overlay');
  document.getElementById('dl-modal-sub').textContent = 'SEE ' + DATA.paper.year + ' · ' + DATA.paper.province + ' · ' + DATA.subject.name;

  var opts    = document.getElementById('dl-opts');
  opts.innerHTML = '';
  var options = DATA.meta.isEnglish
    ? [{ lang: 'en', flag: '🇬🇧', name: 'English PDF', sub: 'Questions in English only' }]
    : [
        { lang: 'np',   flag: '🇳🇵', name: 'Nepali PDF',     sub: 'Original script' },
        { lang: 'en',   flag: '🇬🇧', name: 'English PDF',    sub: 'Translated version' },
        { lang: 'both', flag: '📄',  name: 'Both languages', sub: 'Nepali then English' },
      ];

  options.forEach(function(o) {
    var btn = document.createElement('button'); btn.className = 'dl-opt';
    btn.innerHTML = '<span class="dl-flag">' + o.flag + '</span>'
      + '<div><div class="dl-opt-name">' + o.name + '</div><div class="dl-opt-sub">' + o.sub + '</div></div>';
    btn.onclick = function() { downloadPDF(o.lang, btn); };
    opts.appendChild(btn);
  });

  overlay.classList.add('open');
}

function closeDownload() { document.getElementById('dl-overlay').classList.remove('open'); }

function downloadPDF(lang, btn) {
  document.querySelectorAll('.dl-opt').forEach(function(o) { o.classList.remove('selected'); });
  btn.classList.add('selected');
  if (typeof gtag !== 'undefined') gtag('event', 'pdf_download', { paper: PAPER_KEY, language: lang });
  setTimeout(function() {
    window.open(PRINT_BASE + '&lang=' + lang, '_blank');
    closeDownload();
    btn.classList.remove('selected');
  }, 600);
}

// ─── SHARE ────────────────────────────────────────────────────────────────

function shareUrl() {
  var url = DATA.meta.canonicalUrl;
  if (navigator.share) {
    navigator.share({ title: document.title, url: url }).catch(function(){});
  } else {
    navigator.clipboard.writeText(url).then(function() {
      var btn = document.querySelector('.share-btn');
      var orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(function() { btn.textContent = orig; }, 2000);
    });
  }
  if (typeof gtag !== 'undefined') gtag('event', 'share', { paper: PAPER_KEY });
}

// ─── DRAWER ───────────────────────────────────────────────────────────────

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

// ─── LOADING / ERROR ──────────────────────────────────────────────────────

function showError(msg) {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display  = 'flex';
  document.getElementById('error-msg').textContent       = msg;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────

function escapeHTML(str) {
  var d = document.createElement('div');
  d.textContent = String(str || '');
  return d.innerHTML;
}

function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
