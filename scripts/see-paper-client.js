/* ============================================================
   UJYALO — scripts/see-paper-client.js
   ============================================================ */

// ── STATE ──
var DATA       = null;
var LANG       = 'en';
// A part's text may carry this marker on its own line. Where it appears, the
// part's figure renders in place of it (instead of after the whole text), so a
// table/diagram can sit mid-question. No marker → figure renders after the text.
var FIG_MARK   = '[[diagram]]';
var PAPER_KEY  = '';
var confMap    = {};
var openSubId  = null;

// ── INIT ──
// Reads paper params from the clean URL path first:
//   /see/past-papers/<year>/<province>/<subject>
// then falls back to the legacy query string:
//   /see-paper.html?year=&province=&subject=
function readPaperParams() {
  var year, province, subject;
  // Try clean path: /see/past-papers/:year/:province/:subject
  var parts = window.location.pathname.split('/').filter(Boolean); // drop empty segments
  var idx = parts.indexOf('past-papers');
  if (idx >= 0 && parts.length >= idx + 4) {
    year     = decodeURIComponent(parts[idx + 1]);
    province = decodeURIComponent(parts[idx + 2]);
    subject  = decodeURIComponent(parts[idx + 3]);
  }
  // Fallback: query string
  if (!year || !province || !subject) {
    var p = new URLSearchParams(window.location.search);
    year     = year     || p.get('year');
    province = province || p.get('province');
    subject  = subject  || p.get('subject');
  }
  return { year: year, province: province, subject: subject };
}

document.addEventListener('DOMContentLoaded', function() {
  var params   = readPaperParams();
  var year     = params.year;
  var province = params.province;
  var subject  = params.subject;

  if (!year || !province || !subject) {
    showError('Missing paper parameters. Please go back and select a paper.');
    return;
  }

  // Send the login token (if any) so the API can unlock the full paper.
  // Signed-out visitors get a short preview + a signup gate.
  var _tok = '';
  try { _tok = localStorage.getItem('ujyalo_token') || ''; } catch (e) {}
  fetch('/api/see-paper?year=' + encodeURIComponent(year) + '&province=' + encodeURIComponent(province) + '&subject=' + encodeURIComponent(subject),
        _tok ? { headers: { 'Authorization': 'Bearer ' + _tok } } : undefined)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) { showError(data.error); return; }
      DATA = data;
      PAPER_KEY  = data.meta.paperKey;
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

  // ── Per-paper SEO: each paper page describes itself so Google can index
  //    them distinctly (canonical + description + social title/description). ──
  (function seo() {
    var year = DATA.paper.year, prov = DATA.paper.province, subj = DATA.subject.name;
    var title = 'SEE ' + year + ' ' + prov + ' ' + subj + ' — Past Paper with Model Answers | Ujyalo';
    var desc  = 'SEE ' + year + ' ' + prov + ' Province ' + subj +
                ' past paper with step-by-step model answers in Nepali and English. Free to read and download.';
    function setMeta(key, keyAttr, value) {
      var el = document.head.querySelector('meta[' + keyAttr + '="' + key + '"]');
      if (!el) { el = document.createElement('meta'); el.setAttribute(keyAttr, key); document.head.appendChild(el); }
      el.setAttribute('content', value);
    }
    setMeta('description', 'name', desc);
    setMeta('og:title', 'property', title);
    setMeta('og:description', 'property', desc);
    if (DATA.meta && DATA.meta.canonicalUrl) {
      var link = document.head.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
      link.href = DATA.meta.canonicalUrl;
    }
  })();

  // Hide lang toggle for English papers
  if (DATA.meta.isEnglish) {
    var lt = document.getElementById('lang-tog');
    if (lt) lt.style.display = 'none';
  }

  // Add a "Start fresh" control to the top action bar
  var heroActions = document.querySelector('.hero-actions');
  if (heroActions && !document.getElementById('start-fresh-btn')) {
    var sf = document.createElement('button');
    sf.id = 'start-fresh-btn';
    sf.className = 'hero-btn';
    sf.textContent = '↺ Start fresh';
    sf.onclick = startFresh;
    heroActions.insertBefore(sf, heroActions.firstChild);
  }

  loadConf();
  computeChapters();
  // Data-driven: use topic navigation only if the paper actually has topics.
  // Topicless papers (English, Nepali, or any future format) get the plain list.
  if (paperUsesTopics()) {
    buildChapterBar();
    buildSidebar();
  } else {
    var strip = document.getElementById('prog-strip');
    if (strip) strip.style.display = 'none';
    var stripWrap = document.getElementById('chapter-bar');
    if (stripWrap) stripWrap.style.display = 'none';
    // No chapter bar on this paper — only the hero is pinned, so shrink the
    // offset the sticky sidebar drops by (otherwise it leaves a gap under the hero).
    document.documentElement.style.setProperty('--pin-h', '52px');
    buildSidebarPlain();
  }
  buildQuestions();
  buildScrollSpy();
}

// ── CHAPTER GROUPING ──
// Builds CHAPTERS: ordered list of { topic, label, groups:[...] }
// and stamps each group with g._chapterLabel (e.g. "Sets", "Sets 2").
var CHAPTERS = [];
function computeChapters() {
  CHAPTERS = [];
  var byTopic = {};      // topic -> chapter object
  var topicCount = {};   // topic -> running count for numbering

  DATA.groups.forEach(function(g) {
    var topic = groupTopic(g) || 'Other';
    if (!byTopic[topic]) {
      var chap = { topic: topic, groups: [] };
      byTopic[topic] = chap;
      CHAPTERS.push(chap);
    }
    byTopic[topic].groups.push(g);

    // Per-question label: "Sets", then "Sets 2", "Sets 3"...
    topicCount[topic] = (topicCount[topic] || 0) + 1;
    g._chapterLabel = topicCount[topic] === 1 ? topic : (topic + ' ' + topicCount[topic]);
    g._chapterTopic = topic;
  });

  // Always show the "Other" (no-topic) group LAST. Both the top chapter bar and
  // the sidebar read this same CHAPTERS order, so this one move fixes both.
  // All real topics keep their existing paper order; only "Other" is pushed down.
  var otherIdx = -1;
  for (var k = 0; k < CHAPTERS.length; k++) {
    if (CHAPTERS[k].topic === 'Other') { otherIdx = k; break; }
  }
  if (otherIdx > -1) {
    CHAPTERS.push(CHAPTERS.splice(otherIdx, 1)[0]);
  }
}

// Reads the topic of a question group (parent first, then first sub-part)
function groupTopic(g) {
  if (!g) return '';
  if (g.parent && safeStr(g.parent.topic)) return safeStr(g.parent.topic);
  if (g.subs && g.subs.length && safeStr(g.subs[0].topic)) return safeStr(g.subs[0].topic);
  return '';
}

// ── FUTURE-PROOF HELPERS ─────────────────────────────────────────────────────
// These make rendering depend on what the DATA actually contains, not on the
// subject name — so any future exam/subject/format renders correctly.

// Safe string: never returns null/undefined/"null"/"undefined".
function safeStr(v) {
  if (v === null || v === undefined) return '';
  var s = String(v).trim();
  if (s === 'null' || s === 'undefined' || s === 'NaN') return '';
  return s;
}
// Safe number for marks etc.
function safeNum(v) {
  var n = Number(v);
  return isFinite(n) && n > 0 ? n : 0;
}
// Question text for a row, honouring language with graceful fallback.
function rowText(s) {
  if (!s) return '';
  var en = safeStr(s.en), np = safeStr(s.np);
  if (LANG === 'np') return np || en;
  return en || np;
}

// Split a part's text around an inline figure marker. Returns [before, after]
// with the surrounding blank line trimmed, or null when there's no marker.
function splitFigureMarker(text) {
  var t = safeStr(text);
  var i = t.indexOf(FIG_MARK);
  if (i < 0) return null;
  return [t.slice(0, i).replace(/\s+$/, ''), t.slice(i + FIG_MARK.length).replace(/^\s+/, '')];
}

// English papers: render the first line (the task instruction) as a bold heading,
// with the passage/poem below. Other subjects: plain text. CSS (.q-text pre-wrap)
// keeps every line break that's already saved in the data.
function parentHTML(text) {
  text = safeStr(text);
  var eng = !!(DATA && DATA.meta && DATA.meta.isEnglish);
  if (!eng) return escapeHTML(text);
  var nl = text.indexOf('\n');
  if (nl < 0) return escapeHTML(text);
  return '<span class="q-instr">' + escapeHTML(text.slice(0, nl).trim()) + '</span>'
       + escapeHTML(text.slice(nl + 1));
}

// Split an English question into its main instruction (first line) and passage (rest).
function splitParent(text){
  text = safeStr(text);
  var nl = text.indexOf('\n');
  if (nl < 0) return { instr: text.trim(), passage: '' };
  return { instr: text.slice(0, nl).trim(), passage: text.slice(nl + 1) };
}
function isPoemInstr(instr){ return /\b(poem|verse|stanza)\b/i.test(safeStr(instr)); }
// Render a passage as tidy paragraphs (prose) or preserved lines (poem) — no giant gaps.
function passageHTML(passage, poem){
  passage = safeStr(passage);
  if (!passage.trim()) return '';
  if (poem){
    return '<div class="passage-poem">' +
      escapeHTML(passage.replace(/\n{2,}/g, '\n')).replace(/\n/g, '<br>') + '</div>';
  }
  var paras = passage.split(/\n{2,}/)
    .map(function(p){ return p.replace(/\n+/g, ' ').trim(); })
    .filter(Boolean);
  return paras.map(function(p){ return '<p class="passage-p">' + escapeHTML(p) + '</p>'; }).join('');
}

// ── English reading-task helpers (gated by DATA.meta.isEnglish) ──
// Every helper falls back to the raw text, so content is never lost.
function _txt(s){ return safeStr(s && (s.en || s.np)); }

function commonTaskPrefix(items){
  if (!items || !items.length) return '';
  if (items.length === 1){
    var t = _txt(items[0]);
    var m = t.match(/^(\[[^\]]+\]|[^:\n]{4,48}:)\s/);
    return m ? (m[1] + ' ') : '';
  }
  var pfx = _txt(items[0]);
  for (var i=1;i<items.length;i++){
    var b=_txt(items[i]); var j=0;
    while (j<pfx.length && j<b.length && pfx[j]===b[j]) j++;
    pfx = pfx.slice(0,j);
    if (!pfx) break;
  }
  pfx = pfx.replace(/\s+$/,'');
  var cut = Math.max(pfx.lastIndexOf(']'), pfx.lastIndexOf(':'));
  if (cut < 4) return '';
  return pfx.slice(0, cut+1) + ' ';
}

function headingFromPrefix(pf){
  var h = pf.trim().replace(/:$/,'').replace(/^\[|\]$/g,'').trim();
  if (/^true\s*\/\s*false$/i.test(h)) return 'Write TRUE for true and FALSE for false statements.';
  if (!h) return '';
  return h.charAt(0).toUpperCase() + h.slice(1) + (/[.?!]$/.test(h) ? '' : '.');
}

function inferHeading(items){
  var joined = items.map(_txt).join(' ');
  if (/\(\s*i\s*\)[\s\S]*\(\s*ii\s*\)/.test(joined)) return 'Choose the best answer.';
  if (/(\u2026|\.{3,}|_{3,})/.test(joined)) return 'Fill in the gaps with information from the text.';
  return 'Answer the following questions.';
}

function splitOptions(text){
  text = safeStr(text);
  var m = text.match(/\(\s*i\s*\)/);
  if (!m) return null;
  var q = text.slice(0, m.index).trim();
  var rest = text.slice(m.index);
  var parts = rest.split(/\(\s*(?:i{1,3}|iv|v|[a-d])\s*\)/i)
                  .map(function(x){ return x.trim(); })
                  .filter(Boolean);
  if (parts.length < 2 || !q) return null;
  return { q: q, opts: parts };
}

function splitBracketNote(text){
  text = safeStr(text);
  var m = text.match(/\s*\(([^()]{3,})\)\s*$/);
  if (!m) return { body: text, note: '' };
  if (!/\b(change|add|use|rewrite|put|combine|correct form|question tag|passive|negative|active|indirect|reported|interrogative|affirmative|exclamatory|join)\b/i.test(m[1]))
    return { body: text, note: '' };
  return { body: text.slice(0, m.index).trim(), note: m[1].trim() };
}

function englishTasks(subs){
  function buildItem(s, label, pf){
    var copy = {}; for (var k in s) copy[k] = s[k];
    var body = _txt(s);
    if (pf){ var p = pf.trim(); if (body.indexOf(p) === 0) body = body.slice(p.length).replace(/^\s+/,''); }
    var mc = splitOptions(body); var optlist = null;
    if (mc){ body = mc.q; optlist = mc.opts; }
    var bn = splitBracketNote(body); body = bn.body;
    copy._label = label; copy._body = body; copy._note = bn.note; copy._opts = optlist;
    return copy;
  }
  var grouped = subs.some(function(s){ return /^[A-Za-z][-.\u2013]/.test(safeStr(s.sub)); });
  if (!grouped){
    var pf0 = commonTaskPrefix(subs);
    return [{ heading:null, letter:null, items: subs.map(function(s){ return buildItem(s, safeStr(s.sub), pf0); }) }];
  }
  var order=[], map={}, headRow={};
  subs.forEach(function(s){
    var lab = safeStr(s.sub);
    var m = lab.match(/^([A-Za-z])(?:[-.\u2013](.+))?$/);
    var L = m ? m[1].toUpperCase() : '?';
    var it = (m && m[2]) ? m[2] : null;
    if (!map[L]){ map[L]=[]; order.push(L); }
    if (it === null){ headRow[L] = s; return; }
    map[L].push({ s:s, it:it });
  });
  return order.map(function(L){
    var entries = map[L];
    var raw = entries.map(function(e){ return e.s; });
    var pf = commonTaskPrefix(raw);
    var heading;
    if (headRow[L]) heading = _txt(headRow[L]).replace(/\s*\(\s*\d+\s*[\u00d7x]\s*\d[^)]*\)\s*$/,'').trim();
    else if (pf) heading = headingFromPrefix(pf);
    else heading = inferHeading(raw);
    return { heading: heading, letter: L, headMarks: headRow[L] ? safeNum(headRow[L].marks) : 0, items: entries.map(function(e){ return buildItem(e.s, e.it, pf); }) };
  });
}

function taskMarksLabel(items){
  var marks = items.map(function(s){ return safeNum(s.marks); });
  var total = marks.reduce(function(a,b){ return a+b; }, 0);
  if (!total) return '';
  var first = marks[0];
  var uniform = first>0 && marks.every(function(m){ return m===first; });
  return uniform ? (items.length + '\u00d7' + first + '=' + total) : (total + ' marks');
}
// Does a row carry a usable answer?
function hasAnswer(s) {
  return !!(s && safeStr(s.answer));
}
// Total marks for a group, from subs or parent.
function groupMarks(g) {
  if (!g) return 0;
  if (g.subs && g.subs.length) {
    return g.subs.reduce(function(a, s) { return a + safeNum(s.marks); }, 0);
  }
  return g.parent ? safeNum(g.parent.marks) : 0;
}
// Data-driven: does THIS paper use topics at all? (Any group with a topic.)
// If no question has a topic (English, Nepali, or any future topicless paper),
// we use the plain question list instead of topic navigation — automatically.
function paperUsesTopics() {
  if (!DATA || !DATA.groups) return false;
  for (var i = 0; i < DATA.groups.length; i++) {
    if (groupTopic(DATA.groups[i])) return true;
  }
  return false;
}

// Short one-word labels for the top chapter bar (full name stays in card + sidebar)
var SHORT_TOPIC = {
  'Compound Interest': 'Interest',
  'Population Growth': 'Population',
  'Foreign Exchange': 'Exchange',
  'Sequence & Series': 'Sequence',
  'Quadratic Equations': 'Quadratic'
};
function shortTopic(topic) {
  if (SHORT_TOPIC[topic]) return SHORT_TOPIC[topic];
  // Fallback: first word (drops "& Series", "Equations", etc.)
  return String(topic || '').split(/[\s&]/)[0] || topic;
}

// ── CHAPTER BAR (top pills) ──
function buildChapterBar() {
  var strip = document.getElementById('prog-strip');
  if (!strip) return;
  strip.innerHTML = '';

  CHAPTERS.forEach(function(chap, i) {
    var pill = document.createElement('button');
    pill.className = 'chap-pill' + (i === 0 ? ' active' : '');
    pill.id = 'chappill-' + i;
    pill.innerHTML = '<span class="chap-pill-name">' + escapeHTML(shortTopic(chap.topic)) + '</span>'
      + '<span class="chap-pill-count">' + chap.groups.length + '</span>';
    pill.onclick = (function(chap) {
      return function() {
        if (chap.groups.length) {
          var firstNum = chap.groups[0].num;
          var card = document.getElementById('qcard-' + firstNum);
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
    })(chap);
    strip.appendChild(pill);
  });
}

// ── SCROLL-SPY (highlight the topic pill for the question at the top) ──
// As you scroll, the pinned pill bar shows which topic you're currently in, and
// scrolls that pill into view. Rebuilt whenever the cards/pills are rebuilt.
var _spyCards = [];   // [{ el, idx }] in DOM order, idx = CHAPTERS index
var _spyPills = [];   // pill element per CHAPTERS index
var _spyCurrent = -1;
var _spyBound = false;

function pinnedHeight() {
  var h = document.getElementById('paper-hero');
  var c = document.getElementById('prog-strip');
  return (h ? h.offsetHeight : 0) + (c && c.style.display !== 'none' ? c.offsetHeight : 0);
}

function buildScrollSpy() {
  _spyCards = [];
  _spyPills = [];
  _spyCurrent = -1;
  if (!paperUsesTopics()) return;

  var topicIdx = {};
  CHAPTERS.forEach(function(c, i) {
    topicIdx[c.topic] = i;
    _spyPills[i] = document.getElementById('chappill-' + i);
  });
  DATA.groups.forEach(function(g) {
    var el = document.getElementById('qcard-' + g.num);
    if (el) _spyCards.push({ el: el, idx: topicIdx[g._chapterTopic] });
  });

  if (!_spyBound) {
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() { ticking = false; spyUpdate(); });
    }, { passive: true });
    _spyBound = true;
  }
  spyUpdate();
}

function spyUpdate() {
  if (!_spyCards.length) return;
  var line = pinnedHeight() + 8;   // a card counts as "current" once its top passes this
  var active = _spyCards[0].idx;
  for (var i = 0; i < _spyCards.length; i++) {
    if (_spyCards[i].el.getBoundingClientRect().top - line <= 0) active = _spyCards[i].idx;
    else break;
  }
  if (active === _spyCurrent) return;
  _spyCurrent = active;
  _spyPills.forEach(function(p, i) { if (p) p.classList.toggle('active', i === active); });

  var ap = _spyPills[active];
  var bar = document.getElementById('prog-strip');
  if (ap && bar) {
    bar.scrollLeft = ap.offsetLeft - (bar.clientWidth - ap.offsetWidth) / 2;
  }
}

function updateProgress() {
  var done = Object.keys(confMap).length;
  var total = DATA.meta.totalQuestions;

  // Sidebar progress count
  var sc = document.getElementById('sb-count');
  if (sc) sc.textContent = done + ' / ' + total + ' answered';
  var sf = document.getElementById('sb-progress-fill');
  if (sf) sf.style.width = total ? Math.round((done / total) * 100) + '%' : '0%';

  // Show finish button once student has marked at least one
  var fb = document.getElementById('finish-btn');
  if (fb) fb.style.display = done > 0 ? '' : 'none';
}

// ── SIDEBAR (chapter-grouped question list) ──
function buildSidebar() {
  var scroll = document.getElementById('sb-scroll');
  if (!scroll) return;
  scroll.innerHTML = '';
  var accent = DATA.subject.accent || '#1a6fff';

  CHAPTERS.forEach(function(chap) {
    var head = document.createElement('div');
    head.className = 'sb-chap-head';
    head.innerHTML = '<span class="sb-chap-name">' + escapeHTML(chap.topic) + '</span>'
      + '<span class="sb-chap-count">' + chap.groups.length + 'Q</span>';
    scroll.appendChild(head);

    chap.groups.forEach(function(g) {
      var firstTxt = '';
      if (g.parent && rowText(g.parent)) firstTxt = rowText(g.parent);
      else if (g.subs && g.subs.length) firstTxt = rowText(g.subs[0]);
      var marks = groupMarks(g);
      var diff = (g.parent && g.parent.difficulty) ? g.parent.difficulty
               : (g.subs && g.subs.length && g.subs[0].difficulty) ? g.subs[0].difficulty : '';

      var row = document.createElement('div');
      row.className = 'sb-q';
      row.id = 'sbq-' + g.num;
      var conf = confMap[g.num];
      if (conf) row.classList.add('sb-q-' + conf);

      row.innerHTML =
        '<div class="sb-q-num">' + g.num + '</div>' +
        '<div class="sb-q-info">' +
          '<div class="sb-q-text">' + escapeHTML(truncate(firstTxt, 38)) + '</div>' +
          '<div class="sb-q-meta">' + marks + 'm' + (diff ? ' · ' + escapeHTML(safeStr(diff)) : '') + '</div>' +
        '</div>' +
        '<div class="sb-q-status" id="sbstatus-' + g.num + '"></div>';

      row.onclick = (function(num) {
        return function() {
          var card = document.getElementById('qcard-' + num);
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
          closeSidebarMobile();
        };
      })(g.num);

      scroll.appendChild(row);
    });
  });
}

// ── SIDEBAR (plain question list — used for English, which has no topics) ──
function buildSidebarPlain() {
  var scroll = document.getElementById('sb-scroll');
  if (!scroll) return;
  scroll.innerHTML = '';

  var head = document.createElement('div');
  head.className = 'sb-chap-head';
  head.innerHTML = '<span class="sb-chap-name">Questions</span>'
    + '<span class="sb-chap-count">' + DATA.groups.length + 'Q</span>';
  scroll.appendChild(head);

  DATA.groups.forEach(function(g) {
    var firstTxt = '';
    if (g.parent && rowText(g.parent)) firstTxt = rowText(g.parent);
    else if (g.subs && g.subs.length) firstTxt = rowText(g.subs[0]);
    var marks = groupMarks(g);

    var row = document.createElement('div');
    row.className = 'sb-q';
    row.id = 'sbq-' + g.num;
    var conf = confMap[g.num];
    if (conf) row.classList.add('sb-q-' + conf);

    row.innerHTML =
      '<div class="sb-q-num">' + g.num + '</div>' +
      '<div class="sb-q-info">' +
        '<div class="sb-q-text">' + escapeHTML(truncate(firstTxt, 38)) + '</div>' +
        '<div class="sb-q-meta">' + marks + 'm</div>' +
      '</div>' +
      '<div class="sb-q-status" id="sbstatus-' + g.num + '"></div>';

    row.onclick = (function(num) {
      return function() {
        var card = document.getElementById('qcard-' + num);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeSidebarMobile();
      };
    })(g.num);

    scroll.appendChild(row);
  });
}

function truncate(s, n) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n).trim() + '…' : s;
}

function closeSidebarMobile() {
  // no-op on desktop; mobile uses the top bar instead of sidebar
}

// ── BUILD QUESTIONS ──
// English total marks without double-counting A/B heading rows.
function englishHeadMarks(g){
  var subs = g.subs || [], item = 0, head = 0;
  subs.forEach(function(s){
    if (/^[A-Za-z]$/.test(safeStr(s.sub))) head += safeNum(s.marks);
    else item += safeNum(s.marks);
  });
  var base = item > 0 ? item : head;
  return base + safeNum(g.parent && g.parent.marks);
}

function buildQuestions() {
  var area  = document.getElementById('questions-area');
  area.innerHTML = '';
  var accent = DATA.subject.accent || '#1a6fff';

  // Paper cover card — like the real exam paper header
  var cover = document.createElement('div');
  cover.className = 'paper-cover-card';
  var pYear = safeStr(DATA.paper.year) || '';
  var pProv = safeStr(DATA.paper.province) || '';
  var pMarks = safeStr(DATA.paper.marks) || '—';
  var pDur = safeStr(DATA.paper.duration) || '—';
  // Show the paper's true length here, even when only a preview is unlocked.
  var pQ = safeStr(DATA.meta && (DATA.meta.fullTotal || DATA.meta.totalQuestions)) || String(DATA.groups.length);
  cover.innerHTML =
    '<div class="pc-exam">Secondary Education Examination ' + escapeHTML(pYear) + '</div>' +
    '<div class="pc-title">SEE ' + escapeHTML(pYear) + ' BS' + (pProv ? ' · ' + escapeHTML(pProv) + ' Province' : '') + '</div>' +
    '<div class="pc-subject">' + escapeHTML(safeStr(DATA.subject.name)) +
      (safeStr(DATA.subject.nameNepali) ? ' / <span class="pc-subject-np">' + escapeHTML(DATA.subject.nameNepali) + '</span>' : '') +
    '</div>' +
    '<div class="pc-divider"></div>' +
    '<div class="pc-stats">' +
      '<div class="pc-stat"><div class="pc-stat-n">' + escapeHTML(pMarks) + '</div><div class="pc-stat-l">Full Marks</div></div>' +
      '<div class="pc-stat"><div class="pc-stat-n">' + escapeHTML(pDur) + '</div><div class="pc-stat-l">Duration</div></div>' +
      '<div class="pc-stat"><div class="pc-stat-n">' + escapeHTML(pQ) + '</div><div class="pc-stat-l">Questions</div></div>' +
    '</div>' +
    '<div class="pc-inst">' + escapeHTML(safeStr(DATA.paper.instruction) || 'Answer all the questions in your own creative style.') + '</div>';
  area.appendChild(cover);

  // Questions render in their real paper number order (not grouped).
  // Each card shows its own topic inside the header.
  DATA.groups.forEach(function(g) {
   try {
    var card = document.createElement('div');
    card.className = 'qcard';
    card.id = 'qcard-' + g.num;
    var hasConf = (g.subs && g.subs.length > 0) || (g.parent && hasAnswer(g.parent));

    var isEng = !!(DATA.meta && DATA.meta.isEnglish);
    var pSplit = (isEng && g.parent) ? splitParent(safeStr(g.parent.en)) : null;

    // Head
    var head = document.createElement('div');
    head.className = 'qcard-head' + (isEng ? ' qcard-head-eng' : '');

    var numEl = document.createElement('div');
    numEl.className = 'qnum';
    numEl.style.background = accent;
    numEl.textContent = g.num;
    head.appendChild(numEl);

    if (isEng) {
      // English: the leading instruction sits in the header ONLY when it
      // introduces sub-parts (e.g. "Read the passage and answer the questions").
      // A standalone question (no sub-parts) shows its full text in the body.
      if (pSplit && pSplit.instr && g.subs && g.subs.length > 0) {
        var ins = document.createElement('div');
        ins.className = 'qcard-instr';
        ins.textContent = pSplit.instr;
        head.appendChild(ins);
      }
    } else {
      // Topic label inside card header (after the number)
      var qTopic = groupTopic(g) || '';
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
    }

    var totalMarks = isEng ? englishHeadMarks(g) : groupMarks(g);
    var marksEl = document.createElement('span');
    marksEl.className = 'qcard-marks';
    if (totalMarks > 0) {
      marksEl.textContent = totalMarks + (totalMarks === 1 ? ' mark' : ' marks');
      head.appendChild(marksEl);
    }

    card.appendChild(head);

    // Body
    var body = document.createElement('div');
    body.className = 'qcard-body';

    if (isEng) {
      // A standalone question (no sub-parts) is itself the question — show its
      // full text down in the body, not as a header instruction.
      if (pSplit && pSplit.instr && (!g.subs || g.subs.length === 0)) {
        var qtxtS = document.createElement('div');
        qtxtS.className = 'q-text';
        qtxtS.dataset.en = pSplit.instr;
        qtxtS.dataset.np = pSplit.instr;
        qtxtS.innerHTML = parentHTML(pSplit.instr);
        body.appendChild(qtxtS);
      }
      // The reading passage (comprehension questions) goes in the body.
      if (pSplit && pSplit.passage && pSplit.passage.trim()) {
        var qtxt = document.createElement('div');
        qtxt.className = 'q-text';
        qtxt.dataset.en = pSplit.passage;
        qtxt.dataset.np = pSplit.passage;
        qtxt.setAttribute('data-poem', isPoemInstr(pSplit.instr) ? '1' : '');
        qtxt.innerHTML = passageHTML(pSplit.passage, isPoemInstr(pSplit.instr));
        body.appendChild(qtxt);
      }
    } else {
      var parentTxt = g.parent ? rowText(g.parent) : '';
      if (parentTxt) {
        var qtxt2 = document.createElement('div');
        qtxt2.className = 'q-text';
        qtxt2.dataset.en = safeStr(g.parent.en);
        qtxt2.dataset.np = safeStr(g.parent.np) || safeStr(g.parent.en);
        qtxt2.innerHTML = parentHTML(parentTxt);
        body.appendChild(qtxt2);
      }
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
      var spTxt = '👥 ' + Number(g.parent.student_count).toLocaleString() + ' students';
      if (g.parent.error_rate) spTxt += ' · <span class="social-warn">' + escapeHTML(safeStr(g.parent.error_rate)) + '% got it wrong</span>';
      sp.innerHTML = spTxt;
      body.appendChild(sp);
    }

    // Sub items, or the parent as a single revealable item (no text repeat).
    if (g.subs && g.subs.length > 0) {
      if (DATA.meta && DATA.meta.isEnglish) {
        englishTasks(g.subs).forEach(function(task){
          if (task.heading) {
            var th = document.createElement('div');
            th.className = 'task-head';
            var tm = taskMarksLabel(task.items) || (task.headMarks ? (task.headMarks + ' marks') : '');
            th.innerHTML =
              (task.letter ? '<span class="task-letter">' + escapeHTML(task.letter) + '</span>' : '') +
              '<span class="task-instr">' + escapeHTML(task.heading) + '</span>' +
              (tm ? '<span class="task-marks">' + escapeHTML(tm) + '</span>' : '');
            body.appendChild(th);
          }
          task.items.forEach(function(s){
            body.appendChild(buildSubItem(s, g.num, accent, false, {
              label: s._label, bodyText: s._body, note: s._note, opts: s._opts
            }));
          });
        });
      } else {
        g.subs.forEach(function(s) {
          body.appendChild(buildSubItem(s, g.num, accent, false));
        });
      }
    } else if (g.parent) {
      // Only show the single Answer reveal if there's actually an answer.
      if (hasAnswer(g.parent)) {
        body.appendChild(buildSubItem(g.parent, g.num, accent, true));
      }
    }

    // One self-assessment per question (Option A), shown once at the bottom.
    if (hasConf) {
      body.appendChild(buildConfBlock(g.num));
    }

    card.appendChild(body);

    // Restore the saved result border so it persists across reloads.
    if (confMap[g.num]) card.style.borderColor = confColor(confMap[g.num]);

    area.appendChild(card);
   } catch (err) {
     console.error('Skipped rendering issue on Q' + (g && g.num), err);
   }
  });

  // Free-account gate: after the preview questions, invite signed-out visitors
  // to create a free account to open the rest of the paper.
  if (DATA.meta && DATA.meta.locked) {
    var moreN = safeNum(DATA.meta.lockedCount);
    var back  = encodeURIComponent(location.pathname + location.search);
    var gate = document.createElement('div');
    gate.className = 'paper-gate';
    gate.innerHTML =
      '<div class="pg-lock" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
      '</div>' +
      '<div class="pg-title">' + moreN + ' more question' + (moreN === 1 ? '' : 's') + ' — free with an account</div>' +
      '<div class="pg-sub">Create a free ujyalo account to open the full paper. No payment — just sign up and keep practising on any phone.</div>' +
      '<div class="pg-actions">' +
        '<a class="pg-btn" href="/signup.html?next=' + back + '">Sign up free →</a>' +
        '<a class="pg-login" href="/login.html?next=' + back + '">Already have an account? Log in</a>' +
      '</div>';
    area.appendChild(gate);
  }
}

function buildSubItem(s, qNum, accent, isParent, view) {
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
    ltr.textContent = (view && view.label) ? view.label : safeStr(s.sub);
    subQ.appendChild(ltr);
  }

  var stxt = document.createElement('div');
  stxt.className = 'sub-text';
  var afterFig = null;   // {en, np}: text that renders AFTER an inline figure
  if (isParent) {
    // No-sub-part question: the question text is already shown above.
    // Don't repeat it — just label the revealable answer.
    stxt.classList.add('sub-text-answer-label');
    stxt.textContent = 'Answer';
  } else {
    var _b = (view && typeof view.bodyText === 'string') ? view.bodyText : safeStr(s.en);
    var _bnp = safeStr(s.np) || _b;
    var enSplit = s.diagram ? splitFigureMarker(_b) : null;
    if (enSplit) {
      // Figure sits mid-text: show the part before it here, stash the rest.
      var npSplit = splitFigureMarker(_bnp) || [_bnp, ''];
      stxt.dataset.en = enSplit[0];
      stxt.dataset.np = npSplit[0];
      stxt.textContent = (LANG === 'np' ? (npSplit[0] || enSplit[0]) : enSplit[0]);
      afterFig = { en: enSplit[1], np: npSplit[1] };
    } else {
      stxt.dataset.en = _b;
      stxt.dataset.np = _bnp;
      stxt.textContent = (view && typeof view.bodyText === 'string') ? _b : rowText(s);
    }
  }
  subQ.appendChild(stxt);

  var smVal = safeNum(s.marks);
  if (smVal > 0) {
    var sm = document.createElement('span');
    sm.className = 'sub-marks';
    sm.textContent = smVal + 'm';
    subQ.appendChild(sm);
  }

  // MCQ has no chevron — answer shows after picking
  if (!s.opts) {
    var chev = document.createElement('span');
    chev.className = 'sub-chev';
    chev.innerHTML = '&#8964;';
    subQ.appendChild(chev);
  }

  item.appendChild(subQ);

  // A diagram attached to this specific sub-part (e.g. Q1 part g).
  // Skip for the parent — its diagram already shows in the question body,
  // so rendering it here too would duplicate it inside the answer block.
  if (!isParent && s.diagram) {
    var subDiag = safeDiagram(s.diagram);
    if (subDiag) {
      var sd = document.createElement('div');
      sd.className = 'q-diagram';
      sd.innerHTML = subDiag;
      item.appendChild(sd);
      // If a marker split the text, the remainder belongs AFTER the figure.
      if (afterFig && (afterFig.en || afterFig.np)) {
        var aft = document.createElement('div');
        aft.className = 'sub-text sub-text-after';
        aft.dataset.en = afterFig.en;
        aft.dataset.np = afterFig.np;
        aft.textContent = (LANG === 'np' ? (afterFig.np || afterFig.en) : afterFig.en);
        item.appendChild(aft);
      }
    }
  }

  // English: grammar bracket note + stacked (display) options
  if (view && view.note) {
    var _nt = document.createElement('div');
    _nt.className = 'sub-note';
    _nt.textContent = view.note;
    item.appendChild(_nt);
  }
  if (view && view.opts && view.opts.length) {
    var _st = document.createElement('div');
    _st.className = 'mcq-stack';
    view.opts.forEach(function(o){
      var _op = document.createElement('div');
      _op.className = 'mcq-stack-opt';
      _op.textContent = o;
      _st.appendChild(_op);
    });
    item.appendChild(_st);
  }

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
    item.onclick = function(e) { e.stopPropagation(); toggleAnswer(subId, s, qNum, item); };
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

  // Show only this question's rating buttons (hide any other question's)
  showConf(qNum);
}

function buildAnswerSection(s, qNum) {
  var accent = DATA.subject.accent || '#1a6fff';
  var sec = document.createElement('div');
  sec.className = 'ans-section';

  // Final answer — text, an SVG diagram, or text with a diagram embedded.
  var answer = safeStr(s.answer) || 'Model answer coming soon.';
  var finalRow = document.createElement('div');
  finalRow.className = 'ans-final-row';
  var body = '';
  var lo = answer.toLowerCase();
  var si = lo.indexOf('<svg'), se = lo.indexOf('</svg>');
  if (si !== -1 && se > si) {
    var svgSafe = safeDiagram(answer.slice(si, se + 6));
    if (svgSafe) {
      var before = answer.slice(0, si).trim(), after = answer.slice(se + 6).trim();
      if (before) body += escapeHTML(before);
      body += '<div class="q-diagram">' + svgSafe + '</div>';
      if (after) body += '<div style="margin-top:8px">' + escapeHTML(after) + '</div>';
    }
  }
  if (!body) body = escapeHTML(answer);
  finalRow.innerHTML = '<div class="ans-check-circle">✓</div><div class="ans-final-text">' + body + '</div>';
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

  return sec;
}

// One self-assessment block per question (shown once at the bottom of the card).
function buildConfBlock(qNum) {
  var confWrap = document.createElement('div');
  confWrap.className = 'conf-section';
  confWrap.id = 'conf-' + qNum;
  confWrap.style.display = 'none';   // hidden until a sub-question in this question is opened

  var btns = document.createElement('div');
  btns.className = 'conf-btns';
  [
    { cls: 'cb-got',    ico: '✓', lbl: 'Got it',   val: 'got' },
    { cls: 'cb-almost', ico: '~', lbl: 'Almost',   val: 'almost' },
    { cls: 'cb-missed', ico: '✗', lbl: 'Missed it', val: 'missed' }
  ].forEach(function(c) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'conf-btn ' + c.cls;
    btn.innerHTML = '<div class="cb-ico">' + c.ico + '</div><div class="cb-lbl">' + c.lbl + '</div>';
    if (confMap[qNum] === c.val) btn.classList.add('selected');
    btn.onclick = function(e) {
      e.stopPropagation();
      setConf(qNum, c.val, btns);
    };
    btns.appendChild(btn);
  });
  confWrap.appendChild(btns);
  return confWrap;
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

  // Show only this question's rating buttons (hide any other question's)
  showConf(qNum);
}

// ── CONFIDENCE ──
function confColor(v) {
  return (v === 'got') ? '#16a34a' : (v === 'almost') ? '#f59e0b' : '#e11d48';
}

// Show only this question's rating buttons; hide any other question's.
function showConf(qNum) {
  document.querySelectorAll('.conf-section').forEach(function(s) { s.style.display = 'none'; });
  var cb = document.getElementById('conf-' + qNum);
  if (cb) cb.style.display = '';
}

function startFresh() {
  if (!confirm('Start this paper fresh? This clears your ratings on this paper in this browser so you can try it again. Your account history is not affected.')) return;
  resetPaper();
}

function setConf(qNum, val, btnsEl) {
  confMap[qNum] = val;
  saveConf();

  // Update buttons
  if (btnsEl) {
    btnsEl.querySelectorAll('.conf-btn').forEach(function(b) { b.classList.remove('selected'); });
    var active = btnsEl.querySelector('.cb-' + val);
    if (active) active.classList.add('selected');
  }

  // Update sidebar row status
  var sbRow = document.getElementById('sbq-' + qNum);
  if (sbRow) {
    sbRow.classList.remove('sb-q-got', 'sb-q-almost', 'sb-q-missed');
    sbRow.classList.add('sb-q-' + val);
  }

  // Reflect the rating on the whole question card (not an individual sub-part)
  var card = document.getElementById('qcard-' + qNum);
  if (card) {
    card.style.borderColor = confColor(val);
  }

  celebrate(val);
  updateProgress();
  logPaperAttempt(qNum, val);
}

// ── LOG PAPER ATTEMPT (logged-in only; writes to the shared attempt_events log) ──
function logPaperAttempt(qNum, val) {
  var token = localStorage.getItem('ujyalo_token');
  if (!token || !DATA) return;
  var g = DATA.groups.find(function(x) { return x.num === qNum; });
  if (!g) return;
  var qid = (g.parent && g.parent.id) ? g.parent.id : (g.subs && g.subs[0] ? g.subs[0].id : null);
  var resultMap = { got: 'got_it', almost: 'almost', missed: 'missed' };
  fetch('/api/practice?action=log-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({
      mode:            'past_paper',
      question_id:     qid || null,
      paper_id:        (DATA.paper && DATA.paper.id) ? DATA.paper.id : null,
      subject:         DATA.subject ? DATA.subject.code : null,
      topic:           groupTopic(g) || null,
      result:          resultMap[val] || val,
      revealed_answer: true
    })
  }).catch(function(e) { console.error('paper event log failed', e); });
}

// ── CELEBRATION TOAST ──
var celebTimer = null;
function celebrate(val) {
  var toast = document.getElementById('celeb-toast');
  if (!toast) return;
  var msg = {
    got:    ['🎉', "Nice! You got it!"],
    almost: ['💪', "Almost there — review the steps"],
    missed: ['🌱', "No worries — that's how you learn"]
  }[val];
  if (!msg) return;
  toast.className = 'celeb-toast show celeb-' + val;
  toast.innerHTML = '<span class="celeb-emoji">' + msg[0] + '</span><span class="celeb-msg">' + msg[1] + '</span>';
  if (celebTimer) clearTimeout(celebTimer);
  celebTimer = setTimeout(function() { toast.className = 'celeb-toast'; }, 2200);
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
  computeChapters();
  if (paperUsesTopics()) {
    buildChapterBar();
    buildSidebar();
  } else {
    buildSidebarPlain();
  }
  buildQuestions();
  buildScrollSpy();
  updateProgress();
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
    if (!txt || !txt.trim()) return;
    if (el.classList.contains('q-text')) {
      el.innerHTML = (DATA.meta && DATA.meta.isEnglish)
        ? passageHTML(txt, el.getAttribute('data-poem') === '1')
        : parentHTML(txt);
    } else {
      el.textContent = txt.trim();
    }
  });
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

