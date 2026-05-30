/* ============================================================
   UJYALO — scripts/see-paper-client.js
   Fetches paper data from /api/see-paper, renders all screens.
   No template literals with dynamic data. No escaping hell.
   ============================================================ */

// ─── STATE ────────────────────────────────────────────────────────────────

let DATA        = null;   // full API response
let LANG        = 'en';   // 'en' | 'np'
let MODE        = null;   // null | 'read' | 'check' | 'step'
let activeId    = null;   // currently selected question id
let currentStep = 0;      // step index in answer panel
let stepIdx     = 0;      // current question index in step mode
let doneSet     = new Set();
let PAPER_KEY   = '';
let PRINT_BASE  = '';

const isMobile  = () => window.innerWidth < 768;

// ─── INIT ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const year     = params.get('year');
  const province = params.get('province');
  const subject  = params.get('subject');

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
  // Hide loading, show content
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('app-body').style.display = 'flex';
  document.getElementById('hdr').style.display = 'block';

  // Apply accent colour
  document.documentElement.style.setProperty('--accent', DATA.subject.accent);

  // Populate header
  var hdrIcon = document.getElementById('hdr-icon');
  hdrIcon.textContent = DATA.subject.icon;
  hdrIcon.style.background = DATA.subject.light;
  hdrIcon.style.color = DATA.subject.accent;
  document.getElementById('hdr-title').textContent = DATA.subject.name + ' · SEE ' + DATA.paper.year;
  document.getElementById('hdr-sub').textContent = DATA.paper.province + ' Province · ' + DATA.paper.marks + ' marks · ' + DATA.paper.duration;

  // English subjects: hide language toggle
  if (DATA.meta.isEnglish) {
    document.getElementById('lang-tog').style.display = 'none';
  }

  // Set page title and canonical
  document.title = 'SEE ' + DATA.paper.year + ' ' + DATA.paper.province + ' ' + DATA.subject.name + ' Past Paper | ujyalo';

  // Build overview
  buildOverview();

  // Build paper screens (but keep hidden)
  buildSidebar();
  buildInfoStrip();
  buildQuestions();
  buildStepDots();

  // Load saved progress
  loadProgress();
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────

function buildOverview() {
  var accent = DATA.subject.accent;
  var prov   = DATA.province;

  // Subject icon
  var ico = document.getElementById('ov-icon');
  ico.textContent = DATA.subject.icon;
  ico.style.background = DATA.subject.light;
  ico.style.color = accent;

  // Subject name
  var nm = document.getElementById('ov-subj-name');
  nm.innerHTML = '';
  var strong = document.createElement('span');
  strong.textContent = DATA.subject.name + ' ';
  var em = document.createElement('em');
  em.textContent = '/ ' + DATA.subject.np;
  em.style.color = accent;
  nm.appendChild(strong);
  nm.appendChild(em);

  document.getElementById('ov-subj-yr').textContent = 'SEE ' + DATA.paper.year + ' · ' + DATA.meta.yearAD + ' AD';

  // Journey trail
  var trail = document.getElementById('ov-trail');
  trail.innerHTML = '';
  var steps = [
    { key: 'Subject', val: DATA.subject.name, col: '#22c55e', done: true },
    { key: 'Year',    val: DATA.paper.year,   col: '#22c55e', done: true },
    { key: 'Province', val: DATA.paper.province, col: accent, done: false },
  ];
  steps.forEach(function(s, i) {
    if (i > 0) {
      var line = document.createElement('div');
      line.className = 'trail-line';
      trail.appendChild(line);
    }
    var row = document.createElement('div');
    row.className = 'trail-row';

    var dot = document.createElement('div');
    dot.className = 'trail-dot ' + (s.done ? 'done' : 'cur');
    var key = document.createElement('span');
    key.className = 'trail-key ' + (s.done ? 'done' : 'cur');
    key.textContent = s.key;
    var val = document.createElement('span');
    val.className = 'trail-val';
    val.style.color = s.col;
    val.textContent = s.val + (s.done ? ' ✓' : ' ●');

    row.appendChild(dot);
    row.appendChild(key);
    row.appendChild(val);
    trail.appendChild(row);
  });

  // Province pill
  var pill = document.getElementById('ov-prov-pill');
  pill.style.background = accent + '18';
  pill.style.border = '1px solid ' + accent + '33';
  pill.innerHTML = '<div class="prov-num" style="background:' + accent + ';">P' + prov.num + '</div>'
    + '<div><div class="prov-nm">' + DATA.paper.province + ' Province</div>'
    + '<div class="prov-np">' + prov.np + ' प्रदेश</div></div>';

  // Stats
  var stats = document.getElementById('ov-stats');
  var statItems = [
    { n: DATA.meta.totalQuestions, l: 'Questions' },
    { n: DATA.paper.marks,         l: 'Marks' },
    { n: DATA.paper.duration,      l: 'Duration' },
    { n: DATA.meta.totalSubs || DATA.meta.totalQuestions, l: 'Sub-parts' },
  ];
  stats.innerHTML = statItems.map(function(s) {
    return '<div class="ov-stat"><div class="ov-stat-n">' + s.n + '</div><div class="ov-stat-l">' + s.l + '</div></div>';
  }).join('');

  // Topics (if available)
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
  var accent = DATA.subject.accent;
  var frag = document.createDocumentFragment();
  DATA.groups.forEach(function(g) {
    var row = document.createElement('div');
    row.className = 'sb-row';
    row.id = 'sb-' + g.num;
    row.setAttribute('data-num', g.num);
    row.onclick = function() { scrollToQ(g.num); };

    var numEl = document.createElement('div');
    numEl.className = 'sb-num';
    numEl.id = 'sb-num-' + g.num;
    numEl.textContent = g.num;
    numEl.style.background = accent + '18';
    numEl.style.color = accent;

    var info = document.createElement('div');
    info.className = 'sb-info';

    var topic = document.createElement('div');
    topic.className = 'sb-topic';
    // Show topic if available, else first 5 words of question
    var topicText = (g.parent && g.parent.topic) ? g.parent.topic
      : (g.parent && g.parent.en ? g.parent.en.split(' ').slice(0, 5).join(' ') + (g.parent.en.split(' ').length > 5 ? '...' : '')
      : 'Question ' + g.num);
    topic.textContent = topicText;

    var marks = g.subs.length
      ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0)
      : (g.parent ? g.parent.marks || 0 : 0);

    var meta = document.createElement('div');
    meta.className = 'sb-meta';
    meta.textContent = marks + 'm';

    info.appendChild(topic);
    info.appendChild(meta);
    row.appendChild(numEl);
    row.appendChild(info);
    frag.appendChild(row);
  });
  document.getElementById('sb-scroll').appendChild(frag);
  document.getElementById('sb-count').textContent = '0 / ' + DATA.meta.totalQuestions + ' reviewed';
}

// ─── INFO STRIP ───────────────────────────────────────────────────────────

function buildInfoStrip() {
  var strip = document.getElementById('info-strip');
  var items = [
    { k: 'Marks',     v: DATA.paper.marks },
    { k: 'Time',      v: DATA.paper.duration },
    { k: 'Questions', v: DATA.meta.totalQuestions },
    { k: 'Language',  v: DATA.meta.isEnglish ? 'English only' : 'Nepali / English' },
  ];
  strip.innerHTML = items.map(function(item, i) {
    return (i > 0 ? '<span class="info-sep">|</span>' : '')
      + '<div class="info-item"><span class="info-k">' + item.k + '</span>'
      + '<span class="info-v">' + item.v + '</span></div>';
  }).join('');
}

// ─── QUESTION CARDS ───────────────────────────────────────────────────────

function buildQuestions() {
  var accent = DATA.subject.accent;
  var area = document.getElementById('questions-area');
  area.innerHTML = '';

  DATA.groups.forEach(function(g) {
    var card = document.createElement('div');
    card.className = 'qcard';
    card.id = 'qcard-' + g.num;

    // Strip
    var strip = document.createElement('div');
    strip.className = 'qcard-strip';
    strip.id = 'qstrip-' + g.num;
    card.appendChild(strip);

    // Head
    var head = document.createElement('div');
    head.className = 'qcard-head';

    var headL = document.createElement('div');
    headL.className = 'qcard-head-l';

    var numEl = document.createElement('div');
    numEl.className = 'qnum';
    numEl.style.background = accent;
    numEl.textContent = g.num;
    headL.appendChild(numEl);

    // Topic tag
    var topic = g.parent && g.parent.topic;
    if (topic) {
      var tag = document.createElement('span');
      tag.className = 'qtag';
      tag.style.background = accent + '18';
      tag.style.color = accent;
      tag.textContent = topic;
      headL.appendChild(tag);
    }

    // Difficulty tag
    var diff = g.parent && g.parent.difficulty;
    if (diff) {
      var dtag = document.createElement('span');
      dtag.className = 'qtag';
      dtag.style.background = diff === 'Hard' ? 'rgba(239,68,68,.1)' : diff === 'Medium' ? 'rgba(245,156,26,.1)' : 'rgba(34,197,94,.1)';
      dtag.style.color = diff === 'Hard' ? '#ef4444' : diff === 'Medium' ? '#f59c1a' : '#22c55e';
      dtag.textContent = diff;
      headL.appendChild(dtag);
    }

    head.appendChild(headL);

    var headR = document.createElement('div');
    headR.className = 'qcard-head-r';

    var marks = g.subs.length
      ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0)
      : (g.parent ? g.parent.marks || 0 : 0);

    var marksEl = document.createElement('span');
    marksEl.className = 'qmarks';
    marksEl.textContent = marks + 'm';
    headR.appendChild(marksEl);

    var doneBtn = document.createElement('button');
    doneBtn.className = 'done-btn undone';
    doneBtn.id = 'done-btn-' + g.num;
    doneBtn.textContent = 'Mark done';
    doneBtn.onclick = function(e) { e.stopPropagation(); markDone(g.num); };
    headR.appendChild(doneBtn);

    head.appendChild(headR);
    card.appendChild(head);

    // Body
    var body = document.createElement('div');
    body.className = 'qcard-body';

    // Parent question text
    if (g.parent && (g.parent.en || g.parent.np)) {
      var qtext = document.createElement('div');
      qtext.className = 'q-text';
      qtext.dataset.en = g.parent.en || '';
      qtext.dataset.np = g.parent.np || g.parent.en || '';
      qtext.textContent = LANG === 'np' && g.parent.np ? g.parent.np : g.parent.en;
      body.appendChild(qtext);
    }

    // Diagram
    if (g.parent && g.parent.diagram) {
      var diag = document.createElement('div');
      diag.className = 'q-diagram';
      diag.innerHTML = g.parent.diagram;
      body.appendChild(diag);
    }

    // Sub parts
    if (g.subs.length > 0) {
      g.subs.forEach(function(s) {
        body.appendChild(buildSubItem(s, g.num, accent));
      });
    } else if (g.parent) {
      // No subs — parent itself is answerable
      body.appendChild(buildSubItem(g.parent, g.num, accent, true));
    }

    card.appendChild(body);
    area.appendChild(card);
  });
}

function buildSubItem(s, qNum, accent, isParent) {
  var subId = isParent ? ('q-' + qNum + '-main') : ('q-' + qNum + '-' + s.sub);
  var item = document.createElement('div');
  item.className = 'sub-item';
  item.id = subId;

  if (!isParent) {
    // Sub header
    var subHead = document.createElement('div');
    subHead.className = 'sub-head';

    var ltr = document.createElement('span');
    ltr.className = 'sub-ltr';
    ltr.style.background = accent + '18';
    ltr.style.color = accent;
    ltr.textContent = s.sub;
    subHead.appendChild(ltr);

    var marksEl = document.createElement('span');
    marksEl.className = 'sub-marks';
    marksEl.textContent = (s.marks || 0) + 'm';
    subHead.appendChild(marksEl);

    var bkBtn = document.createElement('button');
    bkBtn.className = 'bk-btn';
    bkBtn.title = 'Bookmark';
    bkBtn.textContent = '🔖';
    bkBtn.onclick = function() { toggleBookmark(bkBtn, subId, s, qNum); };
    subHead.appendChild(bkBtn);

    item.appendChild(subHead);
  }

  // Question text
  if (s.en || s.np) {
    var stxt = document.createElement('div');
    stxt.className = 'sub-text';
    stxt.dataset.en = s.en || '';
    stxt.dataset.np = s.np || s.en || '';
    stxt.textContent = LANG === 'np' && s.np ? s.np : s.en;
    item.appendChild(stxt);
  }

  // MCQ options
  if (s.opts) {
    var opts = Array.isArray(s.opts) ? s.opts : JSON.parse(s.opts);
    var grid = document.createElement('div');
    grid.className = 'mcq-grid';
    opts.forEach(function(o, oi) {
      var btn = document.createElement('button');
      btn.className = 'mcq-opt';
      btn.textContent = o;
      btn.onclick = function() { pickOpt(btn, grid, s.correct, oi); };
      grid.appendChild(btn);
    });
    item.appendChild(grid);
  }

  // Answer button (hidden in Read mode)
  var ansBtn = document.createElement('button');
  ansBtn.className = 'ans-btn';
  ansBtn.style.borderColor = accent + '80';
  ansBtn.style.color = accent;
  ansBtn.style.borderStyle = 'dashed';
  ansBtn.style.borderWidth = '1.5px';
  if (MODE === 'read') ansBtn.style.display = 'none';
  ansBtn.innerHTML = '<span>💡</span> See answer &amp; explanation';
  ansBtn.onclick = function() { openAnswer(subId, s, qNum); };
  item.appendChild(ansBtn);

  return item;
}

// ─── STEP DOTS ────────────────────────────────────────────────────────────

function buildStepDots() {
  var strip = document.getElementById('step-dots');
  strip.innerHTML = '';
  DATA.groups.forEach(function(g, i) {
    var dot = document.createElement('div');
    dot.className = 'step-dot';
    dot.id = 'sdot-' + g.num;
    dot.title = 'Q' + g.num;
    dot.onclick = (function(idx) { return function() { goStep(idx); }; })(i);
    strip.appendChild(dot);
  });
  var ctr = document.createElement('span');
  ctr.className = 'step-counter';
  ctr.id = 'step-counter';
  ctr.textContent = '1 / ' + DATA.groups.length;
  strip.appendChild(ctr);
}

// ─── MODE ENTRY ───────────────────────────────────────────────────────────

function enterMode(mode) {
  MODE = mode;

  // Hide overview screen
  document.getElementById('screen-overview').style.display = 'none';

  // Show mode tabs
  document.getElementById('mode-tabs').style.display = 'flex';

  // Update header accent
  document.getElementById('hdr').style.display = 'block';

  if (mode === 'step') {
    document.getElementById('screen-paper').style.display = 'none';
    document.getElementById('screen-step').style.display = 'flex';
    document.getElementById('screen-step').style.flex = '1';
    document.getElementById('screen-step').style.overflow = 'hidden';
    stepIdx = 0;
    renderStep();
  } else {
    document.getElementById('screen-step').style.display = 'none';
    document.getElementById('screen-paper').style.display = 'flex';
    document.getElementById('screen-paper').style.flex = '1';
    document.getElementById('screen-paper').style.overflow = 'hidden';
  }

  // Show/hide answer buttons based on mode
  var ansBtns = document.querySelectorAll('.ans-btn');
  ansBtns.forEach(function(btn) {
    btn.style.display = mode === 'read' ? 'none' : '';
  });

  // Set active tab
  setActiveTab(mode);

  // Auto-open first answer on desktop in check mode
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
    stepIdx = 0;
    renderStep();
  } else {
    document.getElementById('screen-step').style.display = 'none';
    document.getElementById('screen-paper').style.display = 'flex';
    document.getElementById('screen-paper').style.flex = '1';
  }

  var ansBtns = document.querySelectorAll('.ans-btn');
  ansBtns.forEach(function(btn) {
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
  var el = document.getElementById(map[mode]);
  if (el) el.classList.add('act');
}

// ─── LANGUAGE SWITCH ──────────────────────────────────────────────────────

function setLang(l) {
  LANG = l;
  document.getElementById('lt-en').className = 'lt-btn ' + (l === 'en' ? 'act' : 'off');
  document.getElementById('lt-np').className  = 'lt-btn ' + (l === 'np' ? 'act' : 'off');

  // Update all question/sub text in the DOM
  var attr = l === 'np' ? 'data-np' : 'data-en';
  document.querySelectorAll('.q-text, .sub-text').forEach(function(el) {
    var txt = el.getAttribute(attr);
    if (txt && txt.trim()) el.textContent = txt.trim();
  });

  // Re-render active answer
  if (activeId) { currentStep = 0; reopenAnswer(); }
  // Re-render step
  if (MODE === 'step') renderStep();
}

// ─── ANSWER OPEN ──────────────────────────────────────────────────────────

// Store last opened question data for re-render on lang switch
var _lastAnswerData = null;

function openAnswer(id, qData, qNum) {
  activeId = id;
  currentStep = 0;
  _lastAnswerData = { id: id, qData: qData, qNum: qNum };

  // Highlight sidebar
  document.querySelectorAll('.sb-row').forEach(function(r) { r.classList.remove('active'); });
  var sbRow = document.getElementById('sb-' + qNum);
  if (sbRow) sbRow.classList.add('active');

  // Highlight question card
  document.querySelectorAll('.qcard').forEach(function(c) { c.classList.remove('active'); });
  var qcard = document.getElementById('qcard-' + qNum);
  if (qcard) qcard.classList.add('active');

  var html = buildAnswerHTML(qData, qNum);

  if (isMobile()) {
    document.getElementById('drawer-q').textContent = 'Q' + qNum + (qData.sub ? ' (' + qData.sub + ')' : '');
    document.getElementById('drawer-marks').textContent = (qData.marks || 0) + ' marks';
    document.getElementById('drawer-body').innerHTML = html;
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('open');
  } else {
    var lbl = 'Q' + qNum + (qData.sub ? ' (' + qData.sub + ')' : '') + ' — ' + (qData.marks || 0) + ' marks';
    document.getElementById('ap-q').textContent = lbl;
    document.getElementById('ap-body').innerHTML = html;
    // Also update step panel if in step mode
    if (MODE === 'step') {
      document.getElementById('step-ap-q').textContent = lbl;
      document.getElementById('step-ap-body').innerHTML = html;
    }
  }
}

function reopenAnswer() {
  if (_lastAnswerData) {
    openAnswer(_lastAnswerData.id, _lastAnswerData.qData, _lastAnswerData.qNum);
  }
}

function buildAnswerHTML(q, qNum) {
  var answer = q.answer || 'Model answer coming soon.';
  var accent = DATA.subject.accent;
  var steps  = q.steps ? (Array.isArray(q.steps) ? q.steps : JSON.parse(q.steps)) : null;

  var html = '<div class="ans-final" style="background:' + accent + '12;border:1.5px solid ' + accent + '30;">'
    + '<div class="ans-check"><div class="ans-check-circle">✓</div>'
    + '<span class="ans-final-label">Final answer</span></div>'
    + '<div class="ans-text">' + escapeHTML(answer) + '</div>'
    + '</div>';

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
      html += '<button class="next-step-btn" style="background:' + accent + ';" '
        + 'onclick="nextStep(\'' + escapeAttr(q.answer||'') + '\')" '
        + 'data-qnum="' + qNum + '">Next step &#8594;</button>';
    } else {
      html += '<button class="replay-btn" onclick="replaySteps(' + qNum + ')">&#8635; Replay steps</button>';
    }
  }

  html += '<button class="re-btn" onclick="toggleReExplain(this)">💡 Still stuck? Explain differently</button>'
    + '<div class="re-box" style="display:none;">'
    + '<div class="re-box-label">Simpler explanation</div>'
    + '<div class="re-box-text">A simpler explanation will be available soon. Try breaking the problem into smaller parts.</div>'
    + '</div>';

  return html;
}

// ─── STEPS ────────────────────────────────────────────────────────────────

function nextStep() {
  if (!_lastAnswerData) return;
  var q = _lastAnswerData.qData;
  var steps = q.steps ? (Array.isArray(q.steps) ? q.steps : JSON.parse(q.steps)) : null;
  if (steps && currentStep < steps.length - 1) {
    currentStep++;
    reopenAnswer();
  }
}

function replaySteps() {
  currentStep = 0;
  reopenAnswer();
}

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

  // Dots
  document.querySelectorAll('.step-dot').forEach(function(d, i) {
    d.className = 'step-dot';
    if (i === stepIdx) d.classList.add('active-dot');
    else if (doneSet.has(DATA.groups[i] && DATA.groups[i].num)) d.classList.add('done-dot');
  });
  document.getElementById('step-counter').textContent = (stepIdx + 1) + ' / ' + total;

  // Question
  var qarea = document.getElementById('step-question');
  qarea.innerHTML = '';

  var card = document.createElement('div');
  card.className = 'step-q-card';
  card.style.borderColor = accent + '44';

  var qnum = document.createElement('div');
  qnum.className = 'step-q-num';
  qnum.style.color = accent;
  qnum.textContent = 'Q' + g.num;
  card.appendChild(qnum);

  // Get question text
  var src = g.subs.length > 0 ? g.subs[0] : g.parent;
  if (src) {
    var qtxt = document.createElement('div');
    qtxt.className = 'step-q-text';
    qtxt.dataset.en = src.en || '';
    qtxt.dataset.np = src.np || src.en || '';
    qtxt.textContent = LANG === 'np' && src.np ? src.np : src.en;
    card.appendChild(qtxt);
  }

  if (g.parent && g.parent.topic) {
    var tpill = document.createElement('span');
    tpill.className = 'qtag';
    tpill.style.background = accent + '18';
    tpill.style.color = accent;
    tpill.style.marginTop = '10px';
    tpill.style.display = 'inline-block';
    tpill.textContent = g.parent.topic;
    card.appendChild(tpill);
  }

  // Show answer button in check mode
  if (MODE === 'check' && src) {
    var subId = g.subs.length > 0 ? ('q-' + g.num + '-' + g.subs[0].sub) : ('q-' + g.num + '-main');
    var ansBtn = document.createElement('button');
    ansBtn.className = 'ans-btn';
    ansBtn.style.borderColor = accent + '80';
    ansBtn.style.color = accent;
    ansBtn.style.borderStyle = 'dashed';
    ansBtn.style.borderWidth = '1.5px';
    ansBtn.style.marginTop = '12px';
    ansBtn.innerHTML = '💡 See answer &amp; explanation';
    ansBtn.onclick = (function(id, q, num) { return function() { openAnswer(id, q, num); }; })(subId, src, g.num);
    card.appendChild(ansBtn);
  }

  qarea.appendChild(card);

  // Nav buttons
  document.getElementById('step-prev').disabled = stepIdx === 0;
  document.getElementById('step-next').disabled = stepIdx === total - 1;
  document.getElementById('step-next').style.background = stepIdx === total - 1 ? '' : accent;

  // Right answer panel
  if (!isMobile()) {
    var subId2 = g.subs.length > 0 ? ('q-' + g.num + '-' + g.subs[0].sub) : ('q-' + g.num + '-main');
    var src2 = g.subs.length > 0 ? g.subs[0] : g.parent;
    document.getElementById('step-ap-q').textContent = 'Q' + g.num + ' — ' + (src2 ? src2.marks || 0 : 0) + ' marks';
    if (src2) {
      currentStep = 0;
      document.getElementById('step-ap-body').innerHTML = buildAnswerHTML(src2, g.num);
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
}

function saveProgress() {
  try {
    var all = JSON.parse(localStorage.getItem('ujyalo_progress') || '{}');
    all[PAPER_KEY] = {
      pct: Math.round((doneSet.size / DATA.meta.totalQuestions) * 100),
      done: Array.from(doneSet),
      started: true,
    };
    localStorage.setItem('ujyalo_progress', JSON.stringify(all));
  } catch(e) {}
}

function loadProgress() {
  try {
    var saved = (JSON.parse(localStorage.getItem('ujyalo_progress') || '{}')||{})[PAPER_KEY];
    if (!saved || !saved.done) return;
    var accent = DATA.subject.accent;
    saved.done.forEach(function(num) {
      doneSet.add(num);
      var btn  = document.getElementById('done-btn-' + num);
      var card = document.getElementById('qcard-' + num);
      if (btn)  { btn.className = 'done-btn done'; btn.textContent = '✓ Done'; }
      if (card) { card.classList.add('done-card'); }
    });
    updateProgress();
    // Show progress on overview
    if (saved.pct > 0) {
      document.getElementById('ov-progress-section').style.display = 'block';
      document.getElementById('ov-progress-pct').textContent = saved.pct + '%';
      document.getElementById('ov-progress-lbl').textContent = saved.pct === 100
        ? 'Completed ✓'
        : saved.done.length + ' of ' + DATA.meta.totalQuestions + ' reviewed';
      document.getElementById('ov-progress-fill').style.width = saved.pct + '%';
    }
  } catch(e) {}
}

// ─── SCROLL TO Q ──────────────────────────────────────────────────────────

function scrollToQ(num) {
  var card = document.getElementById('qcard-' + num);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.sb-row').forEach(function(r) { r.classList.remove('active'); });
  var sb = document.getElementById('sb-' + num);
  if (sb) sb.classList.add('active');
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
        id: id,
        qNum: qNum,
        sub: q.sub || null,
        marks: q.marks || 0,
        topic: q.topic || '',
        subjectCode: DATA.subject.code,
        year: DATA.paper.year,
        province: DATA.paper.province,
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
  document.getElementById('dl-modal-sub').textContent =
    'SEE ' + DATA.paper.year + ' · ' + DATA.paper.province + ' · ' + DATA.subject.name;

  var opts = document.getElementById('dl-opts');
  opts.innerHTML = '';

  var options = DATA.meta.isEnglish
    ? [{ lang: 'en', flag: '🇬🇧', name: 'English PDF', sub: 'Questions in English only' }]
    : [
        { lang: 'np',   flag: '🇳🇵', name: 'Nepali PDF',      sub: 'Original script' },
        { lang: 'en',   flag: '🇬🇧', name: 'English PDF',     sub: 'Translated version' },
        { lang: 'both', flag: '📄',   name: 'Both languages',  sub: 'Nepali then English' },
      ];

  options.forEach(function(o) {
    var btn = document.createElement('button');
    btn.className = 'dl-opt';
    btn.innerHTML = '<span class="dl-flag">' + o.flag + '</span>'
      + '<div><div class="dl-opt-name">' + o.name + '</div>'
      + '<div class="dl-opt-sub">' + o.sub + '</div></div>';
    btn.onclick = function() { downloadPDF(o.lang, btn); };
    opts.appendChild(btn);
  });

  overlay.classList.add('open');
}

function closeDownload() {
  document.getElementById('dl-overlay').classList.remove('open');
}

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

// ─── DRAWER (mobile) ──────────────────────────────────────────────────────

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

// ─── LOADING / ERROR ──────────────────────────────────────────────────────

function showError(msg) {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display = 'flex';
  document.getElementById('error-msg').textContent = msg;
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
