/* ============================================================
   UJYALO — scripts/see-paper-client.js
   ============================================================ */

// ── STATE ──
var DATA       = null;
var LANG       = 'en';
var PAPER_KEY  = '';
var PRINT_BASE = '';
var confMap    = {};
var openSubId  = null;

const isMobile = () => window.innerWidth < 768;

// ── INIT ──
document.addEventListener('DOMContentLoaded', function() {
  var p        = new URLSearchParams(window.location.search);
  var year     = p.get('year');
  var province = p.get('province');
  var subject  = p.get('subject');

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
  document.getElementById('app-body').style.display = 'flex';
  document.documentElement.style.setProperty('--accent', DATA.subject.accent || '#1a6fff');

  // Compact header bar
  document.getElementById('hero-badge').textContent    = DATA.subject.name + ' · SEE ' + DATA.paper.year;
  document.getElementById('hero-sub-text').textContent = DATA.paper.province + ' · ' + DATA.paper.marks + 'm · ' + DATA.paper.duration;
  document.title = 'SEE ' + DATA.paper.year + ' ' + DATA.paper.province + ' ' + DATA.subject.name + ' | ujyalo';

  // Hide lang toggle for English papers
  if (DATA.meta.isEnglish) {
    var lt = document.getElementById('lang-tog');
    if (lt) lt.style.display = 'none';
  }

  loadConf();
  buildProgressStrip();
  buildQuestions();
}

// ── PROGRESS STRIP ──
function buildProgressStrip() {
  var strip = document.getElementById('prog-strip');
  strip.innerHTML = '';
  DATA.groups.forEach(function(g) {
    var dot = document.createElement('div');
    dot.className = 'prog-dot';
    dot.id = 'pdot-' + g.num;
    dot.textContent = g.num;
    var conf = confMap[g.num];
    if (conf === 'got')    dot.classList.add('done');
    else if (conf === 'almost') dot.classList.add('almost');
    else if (conf === 'missed') dot.classList.add('missed');
    dot.onclick = (function(num) {
      return function() {
        var card = document.getElementById('qcard-' + num);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    })(g.num);
    strip.appendChild(dot);
  });

  var right = document.createElement('div');
  right.className = 'prog-right';
  right.innerHTML = '<span class="prog-count" id="prog-count">0 / ' + DATA.meta.totalQuestions + '</span>'
    + '<span class="prog-score" id="prog-score"></span>';
  strip.appendChild(right);
  updateProgress();
}

function updateProgress() {
  var done = Object.keys(confMap).length;
  var total = DATA.meta.totalQuestions;
  var countEl = document.getElementById('prog-count');
  if (countEl) countEl.textContent = done + ' / ' + total;

  // Show finish button once student has marked at least one
  var fb = document.getElementById('finish-btn');
  if (fb) fb.style.display = done > 0 ? '' : 'none';

  // Live score estimate
  var score = 0;
  DATA.groups.forEach(function(g) {
    var conf = confMap[g.num];
    var marks = g.subs.length
      ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0)
      : (g.parent ? g.parent.marks || 0 : 0);
    if (conf === 'got')    score += marks;
    else if (conf === 'almost') score += Math.round(marks * 0.5);
  });
  var scoreEl = document.getElementById('prog-score');
  if (scoreEl && done > 0) scoreEl.textContent = '~' + score + '/' + DATA.paper.marks;
}

// ── BUILD QUESTIONS ──
function buildQuestions() {
  var area  = document.getElementById('questions-area');
  area.innerHTML = '';
  var accent = DATA.subject.accent || '#1a6fff';

  // Paper cover card — like the real exam paper header
  var cover = document.createElement('div');
  cover.className = 'paper-cover-card';
  cover.innerHTML =
    '<div class="pc-exam">Secondary Education Examination ' + DATA.paper.year + '</div>' +
    '<div class="pc-title">SEE ' + DATA.paper.year + ' BS · ' + DATA.paper.province + ' Province</div>' +
    '<div class="pc-subject">' + escapeHTML(DATA.subject.name) +
      (DATA.subject.nameNepali ? ' / <span class="pc-subject-np">' + escapeHTML(DATA.subject.nameNepali) + '</span>' : '') +
    '</div>' +
    '<div class="pc-divider"></div>' +
    '<div class="pc-stats">' +
      '<div class="pc-stat"><div class="pc-stat-n">' + DATA.paper.marks + '</div><div class="pc-stat-l">Full Marks</div></div>' +
      '<div class="pc-stat"><div class="pc-stat-n">' + DATA.paper.duration + '</div><div class="pc-stat-l">Duration</div></div>' +
      '<div class="pc-stat"><div class="pc-stat-n">' + DATA.meta.totalQuestions + '</div><div class="pc-stat-l">Questions</div></div>' +
    '</div>' +
    '<div class="pc-inst">' + escapeHTML(DATA.paper.instruction || 'Answer all the questions in your own creative style.') + '</div>';
  area.appendChild(cover);

  DATA.groups.forEach(function(g) {
   try {
    var card = document.createElement('div');
    card.className = 'qcard';
    card.id = 'qcard-' + g.num;

    // Head
    var head = document.createElement('div');
    head.className = 'qcard-head';

    var numEl = document.createElement('div');
    numEl.className = 'qnum';
    numEl.style.background = accent;
    numEl.textContent = g.num;
    head.appendChild(numEl);

    // Topic: read from parent, or fall back to first sub-part (some Qs have no parent row)
    var qTopic = (g.parent && g.parent.topic) ? g.parent.topic
               : (g.subs.length && g.subs[0].topic) ? g.subs[0].topic : '';
    if (qTopic) {
      var t = document.createElement('span');
      t.className = 'qtag qtag-topic';
      t.textContent = qTopic;
      head.appendChild(t);
    }
    var qFreq = (g.parent && g.parent.frequency) ? g.parent.frequency
              : (g.subs.length && g.subs[0].frequency) ? g.subs[0].frequency : '';
    if (qFreq) {
      var ftag = document.createElement('span');
      ftag.className = 'qtag qtag-freq';
      ftag.textContent = '🔥 ' + qFreq;
      head.appendChild(ftag);
    }

    var totalMarks = g.subs.length
      ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0)
      : (g.parent ? g.parent.marks || 0 : 0);
    var marksEl = document.createElement('span');
    marksEl.className = 'qcard-marks';
    marksEl.textContent = totalMarks + ' marks';
    head.appendChild(marksEl);
    card.appendChild(head);

    // Body
    var body = document.createElement('div');
    body.className = 'qcard-body';

    if (g.parent && (g.parent.en || g.parent.np)) {
      var qtxt = document.createElement('div');
      qtxt.className = 'q-text';
      qtxt.dataset.en = g.parent.en || '';
      qtxt.dataset.np = g.parent.np || g.parent.en || '';
      qtxt.textContent = LANG === 'np' && g.parent.np ? g.parent.np : g.parent.en;
      body.appendChild(qtxt);
    }
    var diagramSVG = g.parent ? safeDiagram(g.parent.diagram) : '';
    if (diagramSVG) {
      var diag = document.createElement('div');
      diag.className = 'q-diagram';
      diag.innerHTML = diagramSVG;
      body.appendChild(diag);
    }
    if (g.parent && g.parent.student_count) {
      var sp = document.createElement('div');
      sp.className = 'social-proof';
      var spTxt = '👥 ' + g.parent.student_count.toLocaleString() + ' students';
      if (g.parent.error_rate) spTxt += ' · <span class="social-warn">' + g.parent.error_rate + '% got it wrong</span>';
      sp.innerHTML = spTxt;
      body.appendChild(sp);
    }

    // Sub items or parent as single item
    if (g.subs.length > 0) {
      g.subs.forEach(function(s) {
        body.appendChild(buildSubItem(s, g.num, accent, false));
      });
    } else if (g.parent) {
      body.appendChild(buildSubItem(g.parent, g.num, accent, true));
    }

    card.appendChild(body);
    area.appendChild(card);
   } catch (err) {
     console.error('Skipped rendering issue on Q' + (g && g.num), err);
   }
  });
}

function buildSubItem(s, qNum, accent, isParent) {
  var subId = isParent ? ('q-' + qNum + '-main') : ('q-' + qNum + '-' + s.sub);
  var item  = document.createElement('div');
  item.className = 'sub-item';
  item.id = subId;

  // Restore saved conf state
  var savedConf = s._conf;
  if (savedConf) item.classList.add('conf-' + savedConf);

  var subQ = document.createElement('div');
  subQ.className = 'sub-q';

  if (!isParent) {
    var ltr = document.createElement('span');
    ltr.className = 'sub-ltr';
    ltr.textContent = s.sub;
    subQ.appendChild(ltr);
  }

  var stxt = document.createElement('div');
  stxt.className = 'sub-text';
  stxt.dataset.en = s.en || '';
  stxt.dataset.np = s.np || s.en || '';
  stxt.textContent = LANG === 'np' && s.np ? s.np : s.en;
  subQ.appendChild(stxt);

  var sm = document.createElement('span');
  sm.className = 'sub-marks';
  sm.textContent = (s.marks || 0) + 'm';
  subQ.appendChild(sm);

  // MCQ has no chevron — answer shows after picking
  if (!s.opts) {
    var chev = document.createElement('span');
    chev.className = 'sub-chev';
    chev.innerHTML = '&#8964;';
    subQ.appendChild(chev);
  }

  item.appendChild(subQ);

  // MCQ options
  var opts = null;
  if (s.opts) {
    try {
      opts = Array.isArray(s.opts) ? s.opts : JSON.parse(s.opts);
      if (!Array.isArray(opts)) opts = null;
    } catch (e) { opts = null; }
  }
  if (opts && opts.length) {
    var grid = document.createElement('div');
    grid.className = 'mcq-grid';
    opts.forEach(function(o, oi) {
      var btn = document.createElement('button');
      btn.className = 'mcq-opt';
      btn.textContent = o;
      btn.onclick = function(e) {
        e.stopPropagation();
        pickMCQ(btn, grid, s.correct, oi, item, s, qNum);
      };
      grid.appendChild(btn);
    });
    item.appendChild(grid);
  }

  // Click to open answer (non-MCQ)
  if (!opts || !opts.length) {
    item.onclick = function() { toggleAnswer(subId, s, qNum, item); };
  }

  return item;
}

// ── TOGGLE ANSWER (inline expand) ──
function toggleAnswer(subId, s, qNum, itemEl) {
  // If already open — close it
  if (openSubId === subId) {
    var existing = itemEl.querySelector('.ans-section');
    if (existing) existing.remove();
    itemEl.classList.remove('open');
    openSubId = null;
    return;
  }

  // Close previously open one
  if (openSubId) {
    var prevEl = document.getElementById(openSubId);
    if (prevEl) {
      var prevAns = prevEl.querySelector('.ans-section');
      if (prevAns) prevAns.remove();
      prevEl.classList.remove('open');
    }
  }

  openSubId = subId;
  itemEl.classList.add('open');

  var ansSection = buildAnswerSection(s, qNum);
  itemEl.appendChild(ansSection);
}

function buildAnswerSection(s, qNum) {
  var accent = DATA.subject.accent || '#1a6fff';
  var sec = document.createElement('div');
  sec.className = 'ans-section';

  // Final answer
  var answer = s.answer || 'Model answer coming soon.';
  var finalRow = document.createElement('div');
  finalRow.className = 'ans-final-row';
  finalRow.innerHTML = '<div class="ans-check-circle">✓</div>'
    + '<div class="ans-final-text">' + escapeHTML(answer) + '</div>';
  sec.appendChild(finalRow);

  // Marking scheme
  if (s.marking_scheme && Array.isArray(s.marking_scheme) && s.marking_scheme.length) {
    var msLbl = document.createElement('div');
    msLbl.className = 'ans-section-label';
    msLbl.textContent = 'Marking scheme — ' + (s.marks || 0) + ' mark' + (s.marks !== 1 ? 's' : '');
    sec.appendChild(msLbl);
    s.marking_scheme.forEach(function(row) {
      var step  = typeof row === 'object' ? (row.step || '') : String(row);
      var mark  = typeof row === 'object' && row.mark ? row.mark + ' mark' : '';
      var msRow = document.createElement('div');
      msRow.className = 'ms-row';
      msRow.innerHTML = '<span>' + escapeHTML(step) + '</span>' + (mark ? '<span class="ms-mark">' + mark + '</span>' : '');
      sec.appendChild(msRow);
    });
  }

  // Steps
  var steps = s.steps ? (Array.isArray(s.steps) ? s.steps : JSON.parse(s.steps)) : null;
  if (steps && steps.length) {
    var stLbl = document.createElement('div');
    stLbl.className = 'ans-section-label';
    stLbl.textContent = 'Step-by-step working';
    sec.appendChild(stLbl);
    steps.forEach(function(st, i) {
      var row = document.createElement('div');
      row.className = 'step-row';
      row.innerHTML = '<div class="step-circle" style="background:' + accent + ';">' + (i + 1) + '</div>'
        + '<div class="step-text">' + escapeHTML(String(st)) + '</div>';
      sec.appendChild(row);
    });
  }

  // Confidence
  var confWrap = document.createElement('div');
  confWrap.className = 'conf-section';
  var confLbl = document.createElement('div');
  confLbl.className = 'conf-label';
  confLbl.textContent = 'How did you do?';
  confWrap.appendChild(confLbl);
  var btns = document.createElement('div');
  btns.className = 'conf-btns';
  [
    { cls: 'cb-got',    ico: '✓', lbl: 'Got it',   val: 'got' },
    { cls: 'cb-almost', ico: '~', lbl: 'Almost',   val: 'almost' },
    { cls: 'cb-missed', ico: '✗', lbl: 'Missed it', val: 'missed' }
  ].forEach(function(c) {
    var btn = document.createElement('button');
    btn.className = 'conf-btn ' + c.cls;
    btn.innerHTML = '<div class="cb-ico">' + c.ico + '</div><div class="cb-lbl">' + c.lbl + '</div>';
    var saved = confMap[qNum];
    if (saved === c.val) btn.classList.add('selected');
    btn.onclick = function(e) {
      e.stopPropagation();
      setConf(qNum, c.val, btns);
    };
    btns.appendChild(btn);
  });
  confWrap.appendChild(btns);
  sec.appendChild(confWrap);

  return sec;
}

// ── MCQ PICK ──
function pickMCQ(btn, grid, correct, chosen, itemEl, s, qNum) {
  grid.querySelectorAll('.mcq-opt').forEach(function(b) { b.classList.remove('correct', 'wrong'); });
  var isCorrect = chosen === correct;
  btn.classList.add(isCorrect ? 'correct' : 'wrong');

  // Auto show answer inline after picking
  var existing = itemEl.querySelector('.ans-section');
  if (!existing) {
    var ansSection = buildAnswerSection(s, qNum);
    itemEl.appendChild(ansSection);
    itemEl.classList.add('open');
    openSubId = itemEl.id;
  }
}

// ── CONFIDENCE ──
function setConf(qNum, val, btnsEl) {
  confMap[qNum] = val;
  saveConf();

  // Update buttons
  if (btnsEl) {
    btnsEl.querySelectorAll('.conf-btn').forEach(function(b) { b.classList.remove('selected'); });
    var active = btnsEl.querySelector('.cb-' + val);
    if (active) active.classList.add('selected');
  }

  // Update progress dot
  var dot = document.getElementById('pdot-' + qNum);
  if (dot) {
    dot.classList.remove('done', 'almost', 'missed');
    if (val === 'got') dot.classList.add('done');
    else if (val === 'almost') dot.classList.add('almost');
    else if (val === 'missed') dot.classList.add('missed');
  }

  // Update sub-item border
  var subItem = document.getElementById('q-' + qNum + '-main');
  if (!subItem) {
    // Find first sub
    var g = DATA.groups.find(function(x) { return x.num === qNum; });
    if (g && g.subs.length > 0) subItem = document.getElementById('q-' + qNum + '-' + g.subs[0].sub);
  }
  if (subItem) {
    subItem.classList.remove('conf-got', 'conf-almost', 'conf-missed');
    subItem.classList.add('conf-' + val);
  }

  updateProgress();
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
  } catch(e) {}
}

// ── FINISH PAPER ──
function finishPaper() {
  var results = document.getElementById('results-section');
  if (!results) return;

  // Calculate score
  var totalScore = 0;
  var got = 0; var almost = 0; var missed = 0;
  DATA.groups.forEach(function(g) {
    var conf  = confMap[g.num];
    var marks = g.subs.length
      ? g.subs.reduce(function(a, s) { return a + (s.marks || 0); }, 0)
      : (g.parent ? g.parent.marks || 0 : 0);
    if (conf === 'got')    { totalScore += marks; got++; }
    else if (conf === 'almost') { totalScore += Math.round(marks * 0.5); almost++; }
    else if (conf === 'missed') { missed++; }
  });

  document.getElementById('res-score-num').textContent = totalScore;
  document.getElementById('res-score-of').textContent  = DATA.paper.marks;

  var pct = Math.round((totalScore / DATA.paper.marks) * 100);
  var title = pct >= 75 ? 'Excellent work!' : pct >= 50 ? 'Good attempt!' : 'Keep practising!';
  document.getElementById('res-title').textContent = title;
  document.getElementById('res-sub').textContent   = 'SEE ' + DATA.paper.year + ' · ' + DATA.paper.province + ' · ' + DATA.subject.name;

  // Stats row
  var statsRow = document.getElementById('res-stats-row');
  statsRow.innerHTML =
    '<div class="rstat"><div class="rstat-n" style="color:#15803d;">' + got + '</div><div class="rstat-l">Got it</div></div>' +
    '<div class="rstat"><div class="rstat-n" style="color:#92400e;">' + almost + '</div><div class="rstat-l">Almost</div></div>' +
    '<div class="rstat"><div class="rstat-n" style="color:#dc2626;">' + missed + '</div><div class="rstat-l">Missed</div></div>' +
    '<div class="rstat"><div class="rstat-n" style="color:var(--blue);">' + pct + '%</div><div class="rstat-l">Score</div></div>';

  // Topic breakdown
  var topicMap = {};
  DATA.groups.forEach(function(g) {
    var topic = (g.parent && g.parent.topic) ? g.parent.topic
              : (g.subs.length && g.subs[0].topic) ? g.subs[0].topic : 'General';
    var conf  = confMap[g.num];
    if (!topicMap[topic]) topicMap[topic] = { got: 0, almost: 0, missed: 0, total: 0 };
    topicMap[topic].total++;
    if (conf === 'got') topicMap[topic].got++;
    else if (conf === 'almost') topicMap[topic].almost++;
    else if (conf === 'missed') topicMap[topic].missed++;
  });

  var breakdown = document.getElementById('res-breakdown');
  breakdown.innerHTML = '';
  Object.keys(topicMap).forEach(function(topic) {
    var t    = topicMap[topic];
    var pct2 = Math.round(((t.got + t.almost * 0.5) / t.total) * 100);
    var cls  = pct2 >= 70 ? 'topic-strong' : pct2 >= 40 ? 'topic-almost' : 'topic-weak';
    var lbl  = pct2 >= 70 ? 'Strong' : pct2 >= 40 ? 'Almost' : 'Weak';
    var col  = pct2 >= 70 ? '#22c55e' : pct2 >= 40 ? '#f59c1a' : '#ef4444';
    var row  = document.createElement('div');
    row.className = 'topic-row';
    row.innerHTML = '<div class="topic-name">' + escapeHTML(topic) + '</div>'
      + '<div class="topic-bar-wrap"><div class="topic-bar-fill" style="width:' + pct2 + '%;background:' + col + ';"></div></div>'
      + '<span class="topic-badge ' + cls + '">' + lbl + '</span>';
    breakdown.appendChild(row);
  });

  results.style.display = 'block';
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetPaper() {
  confMap = {};
  saveConf();
  var results = document.getElementById('results-section');
  if (results) results.style.display = 'none';
  buildProgressStrip();
  buildQuestions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── LANGUAGE ──
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
}

// ── DOWNLOAD ──
function openDownload() {
  var overlay = document.getElementById('dl-overlay');
  var sub = document.getElementById('dl-modal-sub');
  if (sub) sub.textContent = 'SEE ' + DATA.paper.year + ' · ' + DATA.paper.province + ' · ' + DATA.subject.name;
  var opts = document.getElementById('dl-opts');
  if (!opts) return;
  opts.innerHTML = '';
  var options = DATA.meta.isEnglish
    ? [{ lang: 'en', flag: '🇬🇧', name: 'English PDF', sub: 'Questions in English only' }]
    : [
        { lang: 'np',   flag: '🇳🇵', name: 'Nepali PDF',    sub: 'Original script' },
        { lang: 'en',   flag: '🇬🇧', name: 'English PDF',   sub: 'Translated version' },
        { lang: 'both', flag: '📄',  name: 'Both languages', sub: 'Nepali then English' }
      ];
  options.forEach(function(o) {
    var btn = document.createElement('button');
    btn.className = 'dl-opt';
    btn.innerHTML = '<span class="dl-flag">' + o.flag + '</span>'
      + '<div><div class="dl-opt-name">' + o.name + '</div><div class="dl-opt-sub">' + o.sub + '</div></div>';
    btn.onclick = function() { downloadPDF(o.lang, btn); };
    opts.appendChild(btn);
  });
  overlay.style.display = 'flex';
}
function closeDownload() {
  var o = document.getElementById('dl-overlay');
  if (o) o.style.display = 'none';
}
function downloadPDF(lang, btn) {
  setTimeout(function() {
    window.open(PRINT_BASE + '&lang=' + lang, '_blank');
    closeDownload();
  }, 300);
}

function closeDrawer() {
  var d = document.getElementById('drawer');
  if (d) d.classList.remove('open');
  var o = document.getElementById('drawer-overlay');
  if (o) o.classList.remove('open');
}

function showError(msg) {
  var ls = document.getElementById('loading-state'); if (ls) ls.style.display = 'none';
  var es = document.getElementById('error-state');   if (es) es.style.display = 'flex';
  var em = document.getElementById('error-msg');     if (em) em.textContent = msg;
}

function escapeHTML(str) {
  var d = document.createElement('div');
  d.textContent = String(str || '');
  return d.innerHTML;
}

// Returns clean SVG markup only if the value is genuinely an <svg> element.
// Anything else (null, plain text, broken markup) returns empty so it's skipped.
function safeDiagram(val) {
  if (!val || typeof val !== 'string') return '';
  var s = val.trim();
  if (s.slice(0, 4).toLowerCase() !== '<svg') return '';
  if (s.toLowerCase().indexOf('</svg>') === -1) return '';
  // Parse to confirm it's well-formed; reject if the parser reports an error.
  try {
    var doc = new DOMParser().parseFromString(s, 'image/svg+xml');
    if (doc.getElementsByTagName('parsererror').length) return '';
    return s;
  } catch (e) {
    return '';
  }
}

