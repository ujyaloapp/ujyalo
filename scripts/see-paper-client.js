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
let confMap     = {};
let noteMap     = {};
let PAPER_KEY   = '';
let PRINT_BASE  = '';

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

  var hdrIcon = document.getElementById('hdr-icon');
  hdrIcon.textContent        = DATA.subject.icon;
  hdrIcon.style.background   = DATA.subject.light;
  hdrIcon.style.color        = DATA.subject.accent;
  document.getElementById('hdr-title').textContent = DATA.subject.name + ' · SEE ' + DATA.paper.year;
  document.getElementById('hdr-sub').textContent   = DATA.paper.province + ' Province · ' + DATA.paper.marks + ' marks · ' + DATA.paper.duration;

  if (DATA.meta.isEnglish) {
    var lt = document.getElementById('lang-tog');
    if (lt) lt.style.display = 'none';
  }

  // Show formulas button for maths only
  if (DATA.subject.code === 'maths') {
    var fb = document.getElementById('formulas-btn');
    if (fb) fb.style.display = '';
  }

  document.title = 'SEE ' + DATA.paper.year + ' ' + DATA.paper.province + ' ' + DATA.subject.name + ' Past Paper | ujyalo';

  // Build all screens first
  buildSidebar();
  buildInfoStrip();
  buildQuestions();
  buildStepDots();
  buildFormulaPanel();
  loadProgress();
  loadConf();
  loadNotes();

  // Go DIRECTLY to read mode — no overview screen
  enterMode('read');
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────

function buildSidebar() {
  var accent      = DATA.subject.accent;
  var frag        = document.createDocumentFragment();
  var lastSection = null;
  var secColors   = { A: '#1a6fff', B: '#38c9b0', C: '#f59c1a', D: '#7c3aed' };
  var secLabels   = { A: 'Group A — Objective', B: 'Group B — Short answer', C: 'Group C — Long answer' };

  // Sort groups A->B->C by marks, then by question number
  var sorted = DATA.groups.slice().sort(function(a, b) {
    var secOrder = { A:0, B:1, C:2, D:3 };
    var sa = secOrder[getGroupSection(a)] || 0;
    var sb2 = secOrder[getGroupSection(b)] || 0;
    if (sa !== sb2) return sa - sb2;
    return a.num - b.num;
  });

  sorted.forEach(function(g) {
    var thisSec = getGroupSection(g);
    if (thisSec !== lastSection) {
      lastSection = thisSec;
      var secHdr   = document.createElement('div'); secHdr.className = 'sb-sec-hdr';
      var secBadge = document.createElement('div'); secBadge.className = 'sb-sec-badge';
      secBadge.style.background = secColors[thisSec] || accent;
      secBadge.textContent = thisSec;
      var secLbl = document.createElement('span'); secLbl.className = 'sb-sec-lbl';
      secLbl.textContent = secLabels[thisSec] || ('Group ' + thisSec);
      secHdr.appendChild(secBadge); secHdr.appendChild(secLbl);
      frag.appendChild(secHdr);
    }

    var row = document.createElement('div');
    row.className = 'sb-row'; row.id = 'sb-' + g.num;
    row.setAttribute('data-num', g.num);
    row.onclick = (function(grp) {
      return function() {
        scrollToQ(grp.num);
        if (MODE === 'check' || MODE === 'step') {
          var src   = grp.subs.length > 0 ? grp.subs[0] : grp.parent;
          var subId = grp.subs.length > 0 ? ('q-' + grp.num + '-' + grp.subs[0].sub) : ('q-' + grp.num + '-main');
          if (src) openAnswer(subId, src, grp.num);
        }
      };
    })(g);

    var numEl = document.createElement('div');
    numEl.className = 'sb-num'; numEl.id = 'sb-num-' + g.num;
    numEl.textContent = g.num;
    numEl.style.background = accent + '18'; numEl.style.color = accent;

    var info  = document.createElement('div'); info.className = 'sb-info';
    var topic = document.createElement('div'); topic.className = 'sb-topic';
    var topicT = (g.parent && g.parent.topic) ? g.parent.topic
      : (g.parent && (g.parent.en || g.parent.np)
        ? (LANG === 'np' && g.parent.np ? g.parent.np : g.parent.en || '').split(' ').slice(0, 5).join(' ') + '...'
        : 'Question ' + g.num);
    topic.textContent = topicT;
    var marks = g.subs.length ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0) : (g.parent ? g.parent.marks || 0 : 0);
    var meta  = document.createElement('div'); meta.className = 'sb-meta'; meta.textContent = marks + 'm';
    info.appendChild(topic); info.appendChild(meta);
    row.appendChild(numEl); row.appendChild(info);
    frag.appendChild(row);
  });

  document.getElementById('sb-scroll').appendChild(frag);
  document.getElementById('sb-count').textContent = '0 / ' + DATA.meta.totalQuestions + ' reviewed';
}

// ─── SECTION HELPERS ──────────────────────────────────────────────────────

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
  if (!bar) return;
  bar.innerHTML = '';

  var sections  = {};
  var secColors = { A: '#1a6fff', B: '#38c9b0', C: '#f59c1a', D: '#7c3aed' };

  DATA.groups.forEach(function(g) {
    var sec = getGroupSection(g);
    if (!sections[sec]) sections[sec] = { groups: [] };
    sections[sec].groups.push(g.num);
  });

  // Always render A -> B -> C -> D in order
  ['A','B','C','D'].filter(function(k) { return !!sections[k]; }).forEach(function(sec) {
    var s   = sections[sec];
    var col = secColors[sec] || '#94a3b8';
    var btn = document.createElement('button');
    btn.className = 'sjb-btn'; btn.id = 'sjb-' + sec;
    btn.onclick = (function(secId, b) {
      return function() {
        scrollToSection(secId);
        document.querySelectorAll('.sjb-btn').forEach(function(x) { x.classList.remove('active'); });
        b.classList.add('active');
      };
    })(sec, btn);

    var badge = document.createElement('div'); badge.className = 'sjb-sec-badge';
    badge.style.background = col; badge.textContent = sec;
    btn.appendChild(badge);
    btn.appendChild(document.createTextNode(' Group ' + sec));

    var dots = document.createElement('div'); dots.className = 'sjb-dots';
    s.groups.forEach(function(num) {
      var dot = document.createElement('div'); dot.className = 'sjb-dot'; dot.id = 'sjb-dot-' + num;
      dots.appendChild(dot);
    });
    btn.appendChild(dots);
    bar.appendChild(btn);
  });

  var spacer = document.createElement('div'); spacer.style.flex = '1';
  bar.appendChild(spacer);
  var prog = document.createElement('div'); prog.className = 'sjb-prog';
  prog.innerHTML = '<div class="sjb-prog-track"><div class="sjb-prog-fill" id="sjb-prog-fill"></div></div>'
    + '<span class="sjb-prog-count" id="sjb-prog-count">0/' + DATA.meta.totalQuestions + '</span>';
  bar.appendChild(prog);

  var firstBtn = bar.querySelector('.sjb-btn');
  if (firstBtn) firstBtn.classList.add('active');
  bar.style.display = 'flex';
}

function scrollToSection(sec) {
  var firstQ = null;
  DATA.groups.forEach(function(g) { if (!firstQ && getGroupSection(g) === sec) firstQ = g.num; });
  if (firstQ) scrollToQ(firstQ);
}

// ─── INFO STRIP ───────────────────────────────────────────────────────────

function buildInfoStrip() {
  var strip = document.getElementById('info-strip');
  if (!strip) return;
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
    var card  = document.createElement('div'); card.className = 'qcard'; card.id = 'qcard-' + g.num;
    var strip = document.createElement('div'); strip.className = 'qcard-strip'; strip.id = 'qstrip-' + g.num;
    card.appendChild(strip);

    // Head
    var head  = document.createElement('div'); head.className = 'qcard-head';
    var headL = document.createElement('div'); headL.className = 'qcard-head-l';

    var numEl = document.createElement('div');
    numEl.className = 'qnum'; numEl.style.background = accent; numEl.textContent = g.num;
    headL.appendChild(numEl);

    if (g.parent && g.parent.topic) {
      var tag = document.createElement('span'); tag.className = 'qtag';
      tag.style.background = accent + '18'; tag.style.color = accent;
      tag.textContent = g.parent.topic; headL.appendChild(tag);
    }
    if (g.parent && g.parent.difficulty) {
      var diff = g.parent.difficulty;
      var dtag = document.createElement('span'); dtag.className = 'qtag';
      dtag.style.background = diff === 'Hard' ? 'rgba(239,68,68,.1)' : diff === 'Medium' ? 'rgba(245,156,26,.1)' : 'rgba(34,197,94,.1)';
      dtag.style.color = diff === 'Hard' ? '#ef4444' : diff === 'Medium' ? '#f59c1a' : '#22c55e';
      dtag.textContent = diff; headL.appendChild(dtag);
    }
    if (g.parent && g.parent.frequency) {
      var ftag = document.createElement('span'); ftag.className = 'qtag';
      ftag.style.background = 'rgba(239,68,68,.1)'; ftag.style.color = '#ef4444';
      ftag.textContent = '\uD83D\uDD25 ' + g.parent.frequency; headL.appendChild(ftag);
    }
    head.appendChild(headL);

    var headR   = document.createElement('div'); headR.className = 'qcard-head-r';
    var marks   = g.subs.length ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0) : (g.parent ? g.parent.marks || 0 : 0);
    var marksEl = document.createElement('span'); marksEl.className = 'qmarks'; marksEl.textContent = marks + 'm';
    headR.appendChild(marksEl);

    var noteBtn = document.createElement('button'); noteBtn.className = 'note-btn'; noteBtn.id = 'note-btn-' + g.num;
    noteBtn.textContent = '\uD83D\uDCDD Note';
    noteBtn.onclick = (function(num) { return function(e) { e.stopPropagation(); toggleNote(num); }; })(g.num);
    headR.appendChild(noteBtn);

    var doneBtn = document.createElement('button'); doneBtn.className = 'done-btn undone'; doneBtn.id = 'done-btn-' + g.num;
    doneBtn.textContent = 'Mark done';
    doneBtn.onclick = function(e) { e.stopPropagation(); markDone(g.num); };
    headR.appendChild(doneBtn);

    head.appendChild(headR);
    card.appendChild(head);

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

    if (g.subs.length > 0) {
      g.subs.forEach(function(s) { body.appendChild(buildSubItem(s, g.num, accent)); });
    } else if (g.parent) {
      body.appendChild(buildSubItem(g.parent, g.num, accent, true));
    }

    card.appendChild(body);

    // Note area
    var noteArea = document.createElement('div'); noteArea.className = 'note-area'; noteArea.id = 'note-area-' + g.num;
    var noteTA   = document.createElement('textarea'); noteTA.placeholder = 'Add a note for yourself...';
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
    var bkBtn = document.createElement('button'); bkBtn.className = 'bk-btn'; bkBtn.title = 'Bookmark'; bkBtn.textContent = '\uD83D\uDD16';
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
  ansBtn.innerHTML = '<span>\uD83D\uDC41</span> See answer &amp; explanation';
  ansBtn.onclick = function() { openAnswer(subId, s, qNum); };
  item.appendChild(ansBtn);

  return item;
}

// ─── STEP DOTS ────────────────────────────────────────────────────────────

function buildStepDots() {
  var strip = document.getElementById('step-dots');
  if (!strip) return;
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
  var defaults = [
    { title: 'Algebra', items: [{ name: 'Quadratic', f: 'x = (-b \u00b1 \u221a(b\u00b2-4ac)) / 2a' }, { name: 'Interior angles', f: '(n-2) \u00d7 180\u00b0' }]},
    { title: 'Mensuration', items: [{ name: 'Cone CSA', f: '\u03c0rl' }, { name: 'Cone Vol', f: '\u2153\u03c0r\u00b2h' }, { name: 'Cylinder Vol', f: '\u03c0r\u00b2h' }, { name: 'Sphere', f: '4\u03c0r\u00b2' }]},
    { title: 'Sets', items: [{ name: '', f: 'n(A\u222aB) = n(A) + n(B) - n(A\u2229B)' }]},
    { title: 'Pythagoras', items: [{ name: '', f: 'a\u00b2 + b\u00b2 = c\u00b2' }]},
    { title: 'Distance', items: [{ name: '', f: 'd = \u221a((x\u2082-x\u2081)\u00b2 + (y\u2082-y\u2081)\u00b2)' }]},
  ];
  body.innerHTML = '';
  defaults.forEach(function(sec) {
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
  var panel   = document.getElementById('formula-panel');
  var overlay = document.getElementById('formula-overlay');
  if (panel)   panel.classList.toggle('open', formulaOpen);
  if (overlay) overlay.style.display = formulaOpen ? 'block' : 'none';
  var btn = document.getElementById('formulas-btn');
  if (btn) btn.classList.toggle('active', formulaOpen);
}

// ─── MODE ENTRY ───────────────────────────────────────────────────────────

function enterMode(mode) {
  MODE = mode;

  // Hide overview if visible
  var ov = document.getElementById('screen-overview');
  if (ov) ov.style.display = 'none';

  // Show mode tabs
  var mt = document.getElementById('mode-tabs');
  if (mt) mt.style.display = 'flex';

  // Build section jump bar
  buildSectionJumpBar();

  if (mode === 'step') {
    var sp = document.getElementById('screen-paper');
    var ss = document.getElementById('screen-step');
    if (sp) sp.style.display = 'none';
    if (ss) { ss.style.display = 'flex'; ss.style.flex = '1'; ss.style.overflow = 'hidden'; ss.style.flexDirection = 'column'; }
    stepIdx = 0; renderStep();
  } else {
    var ss2 = document.getElementById('screen-step');
    var sp2 = document.getElementById('screen-paper');
    if (ss2) ss2.style.display = 'none';
    if (sp2) { sp2.style.display = 'flex'; sp2.style.flex = '1'; sp2.style.overflow = 'hidden'; }
  }

  document.querySelectorAll('.ans-btn').forEach(function(btn) {
    btn.style.display = mode === 'read' ? 'none' : '';
  });

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
    var sp = document.getElementById('screen-paper');
    var ss = document.getElementById('screen-step');
    if (sp) sp.style.display = 'none';
    if (ss) { ss.style.display = 'flex'; ss.style.flex = '1'; ss.style.flexDirection = 'column'; }
    stepIdx = 0; renderStep();
  } else {
    var ss2 = document.getElementById('screen-step');
    var sp2 = document.getElementById('screen-paper');
    if (ss2) ss2.style.display = 'none';
    if (sp2) { sp2.style.display = 'flex'; sp2.style.flex = '1'; }
  }

  document.querySelectorAll('.ans-btn').forEach(function(btn) {
    btn.style.display = mode === 'read' ? 'none' : '';
  });

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
  var enBtn = document.getElementById('lt-en');
  var npBtn = document.getElementById('lt-np');
  if (enBtn) enBtn.className = 'lt-btn ' + (l === 'en' ? 'act' : 'off');
  if (npBtn) npBtn.className = 'lt-btn ' + (l === 'np' ? 'act' : 'off');

  var attr = l === 'np' ? 'data-np' : 'data-en';
  document.querySelectorAll('.q-text, .sub-text').forEach(function(el) {
    var txt = el.getAttribute(attr);
    if (txt && txt.trim()) el.textContent = txt.trim();
  });

  if (activeId) { currentStep = 0; reopenAnswer(); }
  if (MODE === 'step') renderStep();
}

// ─── ANSWER ───────────────────────────────────────────────────────────────

var _lastAnswerData = null;

function openAnswer(id, qData, qNum) {
  activeId = id; currentStep = 0;
  _lastAnswerData = { id: id, qData: qData, qNum: qNum };

  document.querySelectorAll('.sb-row').forEach(function(r) { r.classList.remove('active'); });
  var sbRow = document.getElementById('sb-' + qNum); if (sbRow) sbRow.classList.add('active');
  document.querySelectorAll('.qcard').forEach(function(c) { c.classList.remove('active'); });
  var qcard = document.getElementById('qcard-' + qNum); if (qcard) qcard.classList.add('active');

  var html = buildAnswerHTML(qData, qNum);

  if (isMobile()) {
    document.getElementById('drawer-q').textContent     = 'Q' + qNum + (qData.sub ? ' (' + qData.sub + ')' : '');
    document.getElementById('drawer-marks').textContent = (qData.marks || 0) + ' marks';
    document.getElementById('drawer-body').innerHTML    = html;
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('open');
    attachConfHandlers(document.getElementById('drawer-body'), qNum);
  } else {
    var lbl = 'Q' + qNum + (qData.sub ? ' (' + qData.sub + ')' : '') + ' — ' + (qData.marks || 0) + ' marks';
    document.getElementById('ap-q').textContent  = lbl;
    document.getElementById('ap-body').innerHTML = html;
    attachConfHandlers(document.getElementById('ap-body'), qNum);
    if (MODE === 'step') {
      document.getElementById('step-ap-q').textContent    = lbl;
      document.getElementById('step-ap-body').innerHTML   = html;
      attachConfHandlers(document.getElementById('step-ap-body'), qNum);
    }
  }
  restoreConf(qNum);
}

function reopenAnswer() { if (_lastAnswerData) openAnswer(_lastAnswerData.id, _lastAnswerData.qData, _lastAnswerData.qNum); }

function buildAnswerHTML(q, qNum) {
  var answer = q.answer || 'Model answer coming soon.';
  var accent = DATA.subject.accent;
  var steps  = q.steps ? (Array.isArray(q.steps) ? q.steps : JSON.parse(q.steps)) : null;
  var html   = '';

  html += '<div class="ans-final" style="background:' + accent + '12;border:1.5px solid ' + accent + '30;">'
    + '<div class="ans-check"><div class="ans-check-circle">\u2713</div>'
    + '<span class="ans-final-label">Final answer</span></div>'
    + '<div class="ans-text">' + escapeHTML(answer) + '</div></div>';

  if (steps && steps.length) {
    html += '<div class="steps-label" style="color:' + accent + ';">Step-by-step working</div>';
    steps.forEach(function(s, i) {
      var shown  = i <= currentStep ? ' shown' : '';
      var circBg = i < currentStep ? 'var(--green)' : i === currentStep ? accent : 'var(--line)';
      var circCl = i <= currentStep ? '#fff' : 'var(--faint)';
      var circTx = i < currentStep ? '\u2713' : String(i + 1);
      var lineBg = i < currentStep ? 'rgba(34,197,94,.4)' : 'var(--line)';
      var lineHtml = i < steps.length - 1 ? '<div class="step-line" style="background:' + lineBg + ';"></div>' : '';
      html += '<div class="step-item' + shown + '" style="transition-delay:' + (i * 0.06).toFixed(2) + 's;">'
        + '<div class="step-col"><div class="step-circle" style="background:' + circBg + ';color:' + circCl + ';">' + circTx + '</div>' + lineHtml + '</div>'
        + '<div class="step-text">' + escapeHTML(String(s)) + '</div></div>';
    });
    if (currentStep < steps.length - 1) {
      html += '<button class="next-step-btn" style="background:' + accent + ';" onclick="nextStep()">Next step \u2192</button>';
    } else {
      html += '<button class="replay-btn" onclick="replaySteps()">\u21BA Replay steps</button>';
    }
  }

  html += '<button class="re-btn" onclick="toggleReExplain(this)">\uD83D\uDCA1 Still stuck? Explain differently</button>'
    + '<div class="re-box" style="display:none;"><div class="re-box-label">Simpler explanation</div>'
    + '<div class="re-box-text">' + escapeHTML(q.simpler_explanation || 'Break the problem into smaller parts and try the first step only.') + '</div></div>';

  html += '<div class="conf-bar" id="conf-bar-' + qNum + '">'
    + '<div class="conf-label">How did you do?</div>'
    + '<div class="conf-btns">'
    + '<button class="conf-btn cb-got" data-conf="got" data-qnum="' + qNum + '"><span class="cb-ico">\u2713</span><span class="cb-lbl" style="color:var(--green);">Got it</span></button>'
    + '<button class="conf-btn cb-almost" data-conf="almost" data-qnum="' + qNum + '"><span class="cb-ico">\u223c</span><span class="cb-lbl" style="color:var(--orange);">Almost</span></button>'
    + '<button class="conf-btn cb-missed" data-conf="missed" data-qnum="' + qNum + '"><span class="cb-ico">\u2717</span><span class="cb-lbl" style="color:var(--red);">Missed it</span></button>'
    + '</div></div>';

  html += '<div class="post-conf" id="post-conf-' + qNum + '">' + buildPostConfHTML(qNum, q) + '</div>';
  return html;
}

function buildPostConfHTML(qNum, q) {
  var conf = confMap[qNum]; if (!conf) return '';
  var msgs = {
    got:    'You are ahead. Many students find this difficult. Keep this momentum.',
    almost: 'You are close. Review the step you missed and try once more.',
    missed: 'This is one of the harder questions. Read the working carefully, then try a similar one.',
  };
  var html = '<div class="post-conf-line">' + escapeHTML(msgs[conf] || '') + '</div>';
  if (q && q.similar_topic) {
    html += '<button class="similar-btn" onclick="openSimilar(\'' + escapeAttr(q.similar_topic) + '\')">\u26a1 Try a similar question \u2192</button>';
  }
  return html;
}

function attachConfHandlers(container, qNum) {
  if (!container) return;
  container.querySelectorAll('.conf-btn[data-qnum="' + qNum + '"]').forEach(function(btn) {
    btn.onclick = function() { setConf(qNum, btn.getAttribute('data-conf'), container); };
  });
}

function setConf(qNum, conf, container) {
  confMap[qNum] = conf; saveConf();
  if (container) {
    container.querySelectorAll('.conf-btn[data-qnum="' + qNum + '"]').forEach(function(b) { b.classList.remove('selected'); });
    var ab = container.querySelector('.conf-btn[data-conf="' + conf + '"][data-qnum="' + qNum + '"]');
    if (ab) ab.classList.add('selected');
    var pc = container.querySelector('#post-conf-' + qNum);
    if (pc && _lastAnswerData) { pc.innerHTML = buildPostConfHTML(qNum, _lastAnswerData.qData); pc.classList.add('open'); }
  }
  var card = document.getElementById('qcard-' + qNum);
  if (card) { card.classList.remove('conf-got','conf-almost','conf-missed'); card.classList.add('conf-' + conf); }
  var sbNum = document.getElementById('sb-num-' + qNum);
  if (sbNum && conf === 'got') { sbNum.style.background = 'rgba(34,197,94,.2)'; sbNum.style.color = 'var(--green)'; }
  var dot = document.getElementById('sjb-dot-' + qNum); if (dot) dot.className = 'sjb-dot d-' + conf;
  if (conf === 'got') celebrate();
  updateProgress();
}

function restoreConf(qNum) {
  var conf = confMap[qNum]; if (!conf) return;
  var container = isMobile() ? document.getElementById('drawer-body')
    : (MODE === 'step' ? document.getElementById('step-ap-body') : document.getElementById('ap-body'));
  if (!container) return;
  container.querySelectorAll('.conf-btn[data-qnum="' + qNum + '"]').forEach(function(b) {
    b.classList.remove('selected'); if (b.getAttribute('data-conf') === conf) b.classList.add('selected');
  });
  var pc = container.querySelector('#post-conf-' + qNum);
  if (pc && _lastAnswerData) { pc.innerHTML = buildPostConfHTML(qNum, _lastAnswerData.qData); if (pc.innerHTML.trim()) pc.classList.add('open'); }
}

function openSimilar(topic) { if (topic) window.location.href = '/chapter-practice.html?topic=' + encodeURIComponent(topic); }

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
  var g = DATA.groups[stepIdx]; if (!g) return;
  var accent = DATA.subject.accent; var total = DATA.groups.length;

  document.querySelectorAll('.step-dot').forEach(function(d, i) {
    d.className = 'step-dot';
    if (i === stepIdx) d.classList.add('active-dot');
    else if (doneSet.has(DATA.groups[i] && DATA.groups[i].num)) d.classList.add('done-dot');
  });
  var ctr = document.getElementById('step-counter'); if (ctr) ctr.textContent = (stepIdx + 1) + ' / ' + total;

  var qarea = document.getElementById('step-question'); qarea.innerHTML = '';
  var card = document.createElement('div'); card.className = 'step-q-card'; card.style.borderColor = accent + '44';
  var qnum = document.createElement('div'); qnum.className = 'step-q-num'; qnum.style.color = accent; qnum.textContent = 'Q' + g.num;
  card.appendChild(qnum);

  var src = g.subs.length > 0 ? g.subs[0] : g.parent;
  if (src) {
    var qtxt = document.createElement('div'); qtxt.className = 'step-q-text';
    qtxt.dataset.en = src.en || ''; qtxt.dataset.np = src.np || src.en || '';
    qtxt.textContent = LANG === 'np' && src.np ? src.np : src.en;
    card.appendChild(qtxt);
  }

  if (src) {
    var subId  = g.subs.length > 0 ? ('q-' + g.num + '-' + g.subs[0].sub) : ('q-' + g.num + '-main');
    var ansBtn = document.createElement('button'); ansBtn.className = 'ans-btn';
    ansBtn.style.borderColor = accent + '80'; ansBtn.style.color = accent;
    ansBtn.style.borderStyle = 'dashed'; ansBtn.style.borderWidth = '1.5px'; ansBtn.style.marginTop = '12px';
    ansBtn.innerHTML = '\uD83D\uDC41 See answer &amp; explanation';
    ansBtn.onclick = (function(id, q, num) { return function() { openAnswer(id, q, num); }; })(subId, src, g.num);
    card.appendChild(ansBtn);
  }
  qarea.appendChild(card);

  var prevBtn = document.getElementById('step-prev'); if (prevBtn) prevBtn.disabled = stepIdx === 0;
  var nextBtn = document.getElementById('step-next');
  if (nextBtn) { nextBtn.disabled = stepIdx === total - 1; nextBtn.style.background = stepIdx === total - 1 ? '' : accent; }

  if (!isMobile() && src) {
    var subId2 = g.subs.length > 0 ? ('q-' + g.num + '-' + g.subs[0].sub) : ('q-' + g.num + '-main');
    var aq = document.getElementById('step-ap-q'); if (aq) aq.textContent = 'Q' + g.num + ' \u2014 ' + (src.marks || 0) + ' marks';
    var ab = document.getElementById('step-ap-body');
    if (ab) { currentStep = 0; ab.innerHTML = buildAnswerHTML(src, g.num); attachConfHandlers(ab, g.num); restoreConf(g.num); }
    _lastAnswerData = { id: subId2, qData: src, qNum: g.num };
  }
}

function stepPrev() { if (stepIdx > 0) { stepIdx--; currentStep = 0; renderStep(); } }
function stepNext() { if (stepIdx < DATA.groups.length - 1) { stepIdx++; currentStep = 0; renderStep(); } }
function goStep(idx) { stepIdx = idx; currentStep = 0; renderStep(); }

// ─── MCQ ──────────────────────────────────────────────────────────────────

function pickOpt(btn, grid, correct, chosen) {
  grid.querySelectorAll('.mcq-opt').forEach(function(b) { b.classList.remove('correct','wrong'); });
  btn.classList.add(chosen === correct ? 'correct' : 'wrong');
}

// ─── NOTES ────────────────────────────────────────────────────────────────

function toggleNote(num) {
  var area = document.getElementById('note-area-' + num);
  var btn  = document.getElementById('note-btn-' + num);
  if (!area) return;
  var isOpen = area.classList.toggle('open');
  if (btn) btn.classList.toggle('has-note', isOpen || !!noteMap[num]);
  if (isOpen) { var ta = area.querySelector('textarea'); if (ta && noteMap[num]) ta.value = noteMap[num]; }
}
function saveNotes() {
  try { var all = JSON.parse(localStorage.getItem('ujyalo_notes')||'{}'); all[PAPER_KEY] = noteMap; localStorage.setItem('ujyalo_notes', JSON.stringify(all)); } catch(e) {}
}
function loadNotes() {
  try {
    var all = JSON.parse(localStorage.getItem('ujyalo_notes')||'{}'); noteMap = all[PAPER_KEY] || {};
    Object.keys(noteMap).forEach(function(num) { if (noteMap[num]) { var btn = document.getElementById('note-btn-' + num); if (btn) btn.classList.add('has-note'); }});
  } catch(e) {}
}

// ─── MARK DONE / PROGRESS ─────────────────────────────────────────────────

function markDone(num) {
  var btn = document.getElementById('done-btn-' + num);
  var card = document.getElementById('qcard-' + num);
  var sbRow = document.getElementById('sb-' + num);
  var sbNum = document.getElementById('sb-num-' + num);
  var strip = document.getElementById('qstrip-' + num);
  var accent = DATA.subject.accent;
  if (doneSet.has(num)) {
    doneSet.delete(num);
    if (btn) { btn.className = 'done-btn undone'; btn.textContent = 'Mark done'; }
    if (card) card.classList.remove('done-card');
    if (sbRow) sbRow.classList.remove('done-row');
    if (sbNum) { sbNum.style.background = accent + '18'; sbNum.style.color = accent; sbNum.textContent = num; }
    if (strip) { strip.style.background = ''; strip.style.width = '0'; }
  } else {
    doneSet.add(num);
    if (btn) { btn.className = 'done-btn done'; btn.textContent = '\u2713 Done'; }
    if (card) card.classList.add('done-card');
    if (sbRow) sbRow.classList.add('done-row');
    if (sbNum) { sbNum.style.background = 'rgba(34,197,94,.18)'; sbNum.style.color = 'var(--green)'; sbNum.textContent = '\u2713'; }
    if (strip) { strip.style.background = 'var(--green)'; strip.style.width = '100%'; }
  }
  updateProgress(); saveProgress();
}

function updateProgress() {
  var total = DATA.meta.totalQuestions; var done = doneSet.size; var pct = Math.round((done/total)*100);
  var pf = document.getElementById('prog-fill'); if (pf) pf.style.width = pct + '%';
  var pp = document.getElementById('prog-pct'); if (pp) pp.textContent = pct + '%';
  var spf = document.getElementById('sb-progress-fill'); if (spf) spf.style.width = pct + '%';
  var sc = document.getElementById('sb-count'); if (sc) sc.textContent = done + ' / ' + total + ' reviewed';
  var jf = document.getElementById('sjb-prog-fill'); if (jf) jf.style.width = pct + '%';
  var jc = document.getElementById('sjb-prog-count'); if (jc) jc.textContent = done + '/' + total;
}

function saveProgress() {
  try { var all = JSON.parse(localStorage.getItem('ujyalo_progress')||'{}'); all[PAPER_KEY] = { pct: Math.round((doneSet.size/DATA.meta.totalQuestions)*100), done: Array.from(doneSet), started: true }; localStorage.setItem('ujyalo_progress', JSON.stringify(all)); } catch(e) {}
}

function loadProgress() {
  try {
    var saved = (JSON.parse(localStorage.getItem('ujyalo_progress')||'{}')||{})[PAPER_KEY];
    if (!saved || !saved.done) return;
    saved.done.forEach(function(num) {
      doneSet.add(num);
      var btn = document.getElementById('done-btn-' + num); if (btn) { btn.className = 'done-btn done'; btn.textContent = '\u2713 Done'; }
      var card = document.getElementById('qcard-' + num); if (card) card.classList.add('done-card');
    });
    updateProgress();
  } catch(e) {}
}

function saveConf() {
  try { var all = JSON.parse(localStorage.getItem('ujyalo_conf')||'{}'); all[PAPER_KEY] = confMap; localStorage.setItem('ujyalo_conf', JSON.stringify(all)); } catch(e) {}
}
function loadConf() {
  try {
    var all = JSON.parse(localStorage.getItem('ujyalo_conf')||'{}'); confMap = all[PAPER_KEY] || {};
    Object.keys(confMap).forEach(function(num) {
      var conf = confMap[num]; var card = document.getElementById('qcard-' + num);
      if (card) { card.classList.remove('conf-got','conf-almost','conf-missed'); card.classList.add('conf-' + conf); }
      var dot = document.getElementById('sjb-dot-' + num); if (dot) dot.className = 'sjb-dot d-' + conf;
    });
  } catch(e) {}
}

// ─── DARK MODE ────────────────────────────────────────────────────────────

function toggleDark() {
  darkMode = !darkMode;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  var btn = document.getElementById('dark-btn'); if (btn) btn.textContent = darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19';
  try { localStorage.setItem('ujyalo_dark', darkMode ? '1' : '0'); } catch(e) {}
}
(function() {
  try { if (localStorage.getItem('ujyalo_dark') === '1') { darkMode = true; document.documentElement.setAttribute('data-theme','dark'); } } catch(e) {}
})();

// ─── FONT SIZE ────────────────────────────────────────────────────────────

function changeSize(delta) {
  fontSize = Math.max(13, Math.min(22, fontSize + delta));
  document.documentElement.style.setProperty('--qfont', fontSize + 'px');
  try { localStorage.setItem('ujyalo_fontsize', fontSize); } catch(e) {}
}
(function() {
  try { var s = localStorage.getItem('ujyalo_fontsize'); if (s) { fontSize = parseInt(s); document.documentElement.style.setProperty('--qfont', fontSize + 'px'); } } catch(e) {}
})();

// ─── TIMER ────────────────────────────────────────────────────────────────

function openTimer() {
  if (timerRunning) {
    clearInterval(timerInterval); timerRunning = false;
    var tv = document.getElementById('timer-val'); if (tv) tv.textContent = '3:00:00';
    var tp = document.getElementById('timer-pill'); if (tp) tp.style.background = '';
    return;
  }
  var modal = document.getElementById('timer-modal');
  if (modal) modal.style.display = 'flex';
}
function closeTimer() {
  var modal = document.getElementById('timer-modal'); if (modal) modal.style.display = 'none';
}
function startTimer(mins) {
  closeTimer(); timerSecs = mins * 60; timerRunning = true;
  tickTimer(); timerInterval = setInterval(tickTimer, 1000);
}
function tickTimer() {
  if (timerSecs <= 0) {
    clearInterval(timerInterval); timerRunning = false;
    var tv = document.getElementById('timer-val'); if (tv) tv.textContent = 'Time up!'; return;
  }
  timerSecs--;
  var h = Math.floor(timerSecs/3600); var m = Math.floor((timerSecs%3600)/60); var s = timerSecs%60;
  var tv = document.getElementById('timer-val');
  if (tv) tv.textContent = h > 0 ? h+':'+pad2(m)+':'+pad2(s) : m+':'+pad2(s);
  if (timerSecs <= 1800) { var tp = document.getElementById('timer-pill'); if (tp) tp.style.background = 'rgba(239,68,68,.3)'; }
}
function pad2(n) { return n < 10 ? '0' + n : String(n); }

// ─── SCROLL / BOOKMARKS / SHARE / DRAWER / DOWNLOAD ──────────────────────

function scrollToQ(num) {
  var card = document.getElementById('qcard-' + num); if (card) card.scrollIntoView({ behavior:'smooth', block:'start' });
  document.querySelectorAll('.sb-row').forEach(function(r) { r.classList.remove('active'); });
  var sb = document.getElementById('sb-' + num); if (sb) sb.classList.add('active');
  document.querySelectorAll('.qcard').forEach(function(c) { c.classList.remove('active'); });
  if (card) card.classList.add('active');
}

function toggleBookmark(btn, id, q, qNum) {
  btn.classList.toggle('saved');
  try {
    var bks = JSON.parse(localStorage.getItem('ujyalo_bookmarks')||'[]');
    var idx = bks.findIndex(function(b) { return b.id === id; });
    if (idx > -1) { bks.splice(idx,1); } else {
      bks.push({ id:id, qNum:qNum, sub:q.sub||null, marks:q.marks||0, topic:q.topic||'', subjectCode:DATA.subject.code, year:DATA.paper.year, province:DATA.paper.province, paper:'SEE '+DATA.paper.year+' '+DATA.subject.name, questionText:(LANG==='np'&&q.np?q.np:q.en||'').substring(0,200) });
    }
    localStorage.setItem('ujyalo_bookmarks', JSON.stringify(bks));
  } catch(e) {}
}

function openDownload() {
  var overlay = document.getElementById('dl-overlay');
  var sub = document.getElementById('dl-modal-sub'); if (sub) sub.textContent = 'SEE '+DATA.paper.year+' · '+DATA.paper.province+' · '+DATA.subject.name;
  var opts = document.getElementById('dl-opts'); if (!opts) return;
  opts.innerHTML = '';
  var options = DATA.meta.isEnglish ? [{lang:'en',flag:'\uD83C\uDDEC\uD83C\uDDE7',name:'English PDF',sub:'Questions in English only'}]
    : [{lang:'np',flag:'\uD83C\uDDF3\uD83C\uDDF5',name:'Nepali PDF',sub:'Original script'},{lang:'en',flag:'\uD83C\uDDEC\uD83C\uDDE7',name:'English PDF',sub:'Translated version'},{lang:'both',flag:'\uD83D\uDCC4',name:'Both languages',sub:'Nepali then English'}];
  options.forEach(function(o) {
    var btn = document.createElement('button'); btn.className = 'dl-opt';
    btn.innerHTML = '<span class="dl-flag">'+o.flag+'</span><div><div class="dl-opt-name">'+o.name+'</div><div class="dl-opt-sub">'+o.sub+'</div></div>';
    btn.onclick = function() { downloadPDF(o.lang, btn); };
    opts.appendChild(btn);
  });
  if (overlay) overlay.classList.add('open');
}
function closeDownload() { var o = document.getElementById('dl-overlay'); if (o) o.classList.remove('open'); }
function downloadPDF(lang, btn) {
  document.querySelectorAll('.dl-opt').forEach(function(o) { o.classList.remove('selected'); }); btn.classList.add('selected');
  if (typeof gtag !== 'undefined') gtag('event','pdf_download',{paper:PAPER_KEY,language:lang});
  setTimeout(function() { window.open(PRINT_BASE+'&lang='+lang,'_blank'); closeDownload(); btn.classList.remove('selected'); }, 600);
}

function shareUrl() {
  var url = DATA.meta.canonicalUrl;
  if (navigator.share) { navigator.share({title:document.title,url:url}).catch(function(){}); }
  else { navigator.clipboard.writeText(url).then(function() { var btn = document.querySelector('.share-btn'); if (btn) { var orig=btn.textContent; btn.textContent='\u2713 Copied!'; setTimeout(function(){btn.textContent=orig;},2000); } }); }
  if (typeof gtag !== 'undefined') gtag('event','share',{paper:PAPER_KEY});
}

function closeDrawer() {
  var d = document.getElementById('drawer'); if (d) d.classList.remove('open');
  var o = document.getElementById('drawer-overlay'); if (o) o.classList.remove('open');
}

function showError(msg) {
  var ls = document.getElementById('loading-state'); if (ls) ls.style.display = 'none';
  var es = document.getElementById('error-state');   if (es) es.style.display = 'flex';
  var em = document.getElementById('error-msg');     if (em) em.textContent = msg;
}

function escapeHTML(str) { var d = document.createElement('div'); d.textContent = String(str||''); return d.innerHTML; }
function escapeAttr(str) { return String(str||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
