// ============================================================
// UJYALO — api/see-paper.js
// Returns JSON data only. No HTML generation.
// HTML shell: see-paper.html
// Client JS:  scripts/see-paper-client.js
// ============================================================

async function fetchFromSupabase(path) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    }
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${path}`);
  return res.json();
}

// Resolve the signed-in Supabase user from the request's Bearer token, or null
// if the caller isn't logged in (or the token is invalid/expired). Used to gate
// the paper: anonymous visitors get a short preview, signed-in users get it all.
async function getUser(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
    });
    if (!r.ok) return null;
    const u = await r.json();
    return (u && u.id) ? u : null;
  } catch (e) { return null; }
}

// How many questions an anonymous visitor may preview before the signup gate.
const PREVIEW_COUNT = 3;

const SUBJECT_CONFIG = {
  maths:   { accent:'#1a6fff', light:'#e8f0ff', icon:'∫',  np:'गणित' },
  science: { accent:'#38c9b0', light:'#e0f7f2', icon:'⚗',  np:'विज्ञान' },
  english: { accent:'#f59c1a', light:'#fff4e0', icon:'Aa', np:'अंग्रेजी' },
  nepali:  { accent:'#e84393', light:'#ffeaf5', icon:'क',  np:'नेपाली' },
  social:  { accent:'#7c3aed', light:'#f0ebff', icon:'◉',  np:'सामाजिक' },
  hpe:     { accent:'#ef4444', light:'#fff0f0', icon:'♡',  np:'स्वास्थ्य' },
};

const PROV_CONFIG = {
  Koshi:         { np:'कोशी',        num:1 },
  Madhesh:       { np:'मधेश',         num:2 },
  Bagmati:       { np:'बागमती',       num:3 },
  Gandaki:       { np:'गण्डकी',       num:4 },
  Lumbini:       { np:'लुम्बिनी',     num:5 },
  Karnali:       { np:'कर्णाली',      num:6 },
  Sudurpashchim: { np:'सुदूरपश्चिम',  num:7 },
};

// Minimal HTML-escape for server-rendered text.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Server-rendered paper page ───────────────────────────────────────────────
// Clean paper URLs (/see/past-papers/:year/:province/:subject) are routed here by
// vercel.json (with view=page). This returns a REAL page — correct <title>,
// description, canonical, and the actual question text — so Google can index each
// paper distinctly, instead of the blank JS shell that left ~48 paper pages
// "discovered, currently not indexed". The browser then loads
// scripts/see-paper-client.js, which fetches the JSON (below) and takes over the
// interactive experience, removing the #ssr-paper block.
//
// This MIRRORS the interactive shell in see-paper.html so the client script finds
// the elements it expects. If you change that shell, mirror the change here.
function renderPaperPage({ year, provNorm, subjectCode, subjectName, paper, groups }) {
  const subjName = subjectName || 'SEE';
  const title = `SEE ${year} ${provNorm} ${subjName} — Past Paper with Model Answers | Ujyalo`;
  const desc  = `SEE ${year} ${provNorm} Province ${subjName} past paper with step-by-step model answers in Nepali and English. Free to read and practise on Ujyalo.`;
  const canonical = `https://ujyalo.app/see/past-papers/${year}/${provNorm.toLowerCase()}/${subjectCode}`;

  // Question text only — model answers stay behind the free signup gate.
  const qHtml = groups.map(g => {
    let rows = '';
    if (g.parent && g.parent.en) rows += `<p class="ssrq-parent">${esc(g.parent.en)}</p>`;
    if (g.subs && g.subs.length) {
      rows += '<ul class="ssrq-subs">' + g.subs.map(s =>
        s.en ? `<li><b>(${esc(s.sub)})</b> ${esc(s.en)}</li>` : ''
      ).join('') + '</ul>';
    }
    return `<li class="ssrq"><span class="ssrq-n">Q${g.num}.</span>${rows}</li>`;
  }).join('');

  const totalMarks = paper.total_marks || 75;
  const duration = paper.duration || (paper.time_minutes ? Math.round(paper.time_minutes / 60) + ' hours' : '3 hours');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${canonical}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,600;1,9..144,700&family=DM+Sans:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/styles/see-paper.css"/>
<meta property="og:image" content="https://ujyalo.app/og-default.png"/>
<meta name="twitter:image" content="https://ujyalo.app/og-default.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="${canonical}"/>
<style>
  #ssr-paper{max-width:760px;margin:0 auto;padding:24px 20px 60px;font-family:'DM Sans',system-ui,sans-serif;color:#1f2933;}
  #ssr-paper h1{font-family:'Fraunces',Georgia,serif;font-size:26px;line-height:1.25;margin:10px 0 6px;}
  #ssr-paper .ssr-meta{color:#52606d;font-size:15px;margin:0 0 18px;}
  #ssr-paper ol{list-style:none;padding:0;margin:0;}
  #ssr-paper .ssrq{padding:14px 0;border-top:1px solid #e6eae8;}
  #ssr-paper .ssrq-n{font-weight:700;color:#0f766e;margin-right:6px;}
  #ssr-paper .ssrq-parent{margin:0 0 6px;}
  #ssr-paper .ssrq-subs{margin:6px 0 0;padding-left:18px;}
  #ssr-paper .ssrq-subs li{margin:3px 0;}
  #ssr-paper .ssr-note{margin-top:22px;color:#52606d;font-size:14px;}
  #ssr-paper a{color:#0f766e;font-weight:600;text-decoration:none;}
</style>
</head>
<body>

<div id="site-nav"></div>

<!-- Server-rendered content for search engines and first paint.
     see-paper-client.js removes this once the interactive app is ready. -->
<main id="ssr-paper">
  <a href="/see/past-papers">← All SEE past papers</a>
  <h1>SEE ${esc(String(year))} ${esc(provNorm)} Province — ${esc(subjName)} Past Paper</h1>
  <p class="ssr-meta">Full marks: ${esc(String(totalMarks))} · Time: ${esc(String(duration))} · With step-by-step model answers in Nepali &amp; English.</p>
  <ol>${qHtml}</ol>
  <p class="ssr-note">Open each question on Ujyalo to see the full model answer, marking scheme and step-by-step working — free with an account.</p>
</main>

<!-- LOADING (hidden — SSR content shows in its place) -->
<div id="loading-state" style="display:none;">
  <div class="load-spinner"></div>
  <div class="load-text">Loading paper...</div>
</div>

<!-- ERROR -->
<div id="error-state" style="display:none;">
  <div class="err-icon">⚠️</div>
  <div class="err-title">Could not load paper</div>
  <div class="err-msg" id="error-msg"></div>
  <a href="/see.html" class="err-back">← Back to papers</a>
</div>

<!-- APP BODY -->
<div id="app-body" style="display:none;">

  <div class="paper-hero" id="paper-hero">
    <div class="hero-bg-circle"></div>
    <div class="hero-inner">
      <div class="hero-bar-left">
        <button class="hero-back" onclick="history.back()">← Back</button>
        <div class="hero-badge" id="hero-badge"></div>
        <div class="hero-sub-text" id="hero-sub-text"></div>
      </div>
      <div class="hero-actions">
        <div class="lang-tog" id="lang-tog">
          <button class="lt-btn act" id="lt-en" onclick="setLang('en')">EN</button>
          <button class="lt-btn off" id="lt-np" onclick="setLang('np')">NP</button>
        </div>
        <button class="finish-btn" id="finish-btn" onclick="finishPaper()" style="display:none;">Finish →</button>
      </div>
    </div>
  </div>

  <div class="chap-bar" id="prog-strip"></div>

  <div class="paper-layout">
    <aside class="sidebar" id="sidebar">
      <div class="sb-head">
        <div class="sb-label">Questions</div>
        <div class="sb-progress"><div class="sb-progress-fill" id="sb-progress-fill"></div></div>
        <div class="sb-count" id="sb-count">0 / 0 answered</div>
      </div>
      <div class="sb-scroll" id="sb-scroll"></div>
    </aside>

    <div class="questions-wrap">
      <div class="questions-area" id="questions-area"></div>
    </div>
  </div>

  <div class="results-section" id="results-section" style="display:none;">
    <div class="results-hero">
      <div class="res-ring">
        <div class="res-score-num" id="res-score-num">0</div>
        <div class="res-score-of">/ <span id="res-score-of">75</span></div>
      </div>
      <div class="res-title" id="res-title">Paper complete!</div>
      <div class="res-sub" id="res-sub"></div>
    </div>
    <div class="results-body">
      <div class="res-stats-row" id="res-stats-row"></div>
      <div class="res-breakdown-label">Topic breakdown</div>
      <div class="res-breakdown" id="res-breakdown"></div>
      <button class="res-cta" id="res-cta" onclick="window.location.href='/see.html'">Try another paper →</button>
      <button class="res-sec" onclick="resetPaper()">Review this paper again</button>
    </div>
  </div>

</div><!-- /app-body -->

<div id="drawer-overlay" class="drawer-overlay" onclick="closeDrawer()"></div>
<div id="drawer" class="drawer">
  <div class="drawer-handle"></div>
  <div class="drawer-head">
    <div>
      <div class="drawer-q" id="drawer-q"></div>
      <div class="drawer-marks" id="drawer-marks"></div>
    </div>
    <button class="drawer-close" onclick="closeDrawer()">✕ Close</button>
  </div>
  <div class="drawer-body" id="drawer-body"></div>
</div>

<div id="celeb-toast" class="celeb-toast"></div>

<script src="/scripts/components.js"></script>
<script src="/scripts/see-paper-client.js"></script>
</body>
</html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  // Response content depends on the caller's login state — never let a shared
  // cache serve a logged-in (full) response to an anonymous visitor or vice versa.
  res.setHeader('Vary', 'Authorization');

  try {
    let { year, province, subject } = req.query;
    if (!year || !province || !subject) {
      return res.status(400).json({ error: 'Missing params: year, province, subject' });
    }
    // Year is always a 4-digit Nepali (BS) year — reject anything else so it
    // can't be used to tamper with the database query below.
    if (!/^\d{4}$/.test(String(year))) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const subjectCode = subject.toLowerCase();
    const provNorm = province.charAt(0).toUpperCase() + province.slice(1).toLowerCase();
    const cfg = SUBJECT_CONFIG[subjectCode] || SUBJECT_CONFIG.maths;
    const provCfg = PROV_CONFIG[provNorm] || { np: provNorm, num: 1 };

    const subjects = await fetchFromSupabase(
      `/exam_subjects?code=eq.${encodeURIComponent(subjectCode)}&select=id,name,code`
    );
    if (!subjects[0]) return res.status(404).json({ error: 'Subject not found' });

    const papers = await fetchFromSupabase(
      `/past_papers?subject_id=eq.${subjects[0].id}&year=eq.${encodeURIComponent(year)}&province=eq.${encodeURIComponent(provNorm)}&select=*`
    );
    if (!papers[0]) return res.status(404).json({ error: 'Paper not found' });

    const questions = await fetchFromSupabase(
      `/past_paper_questions?paper_id=eq.${papers[0].id}&order=question_number.asc,sub_part.asc&select=*`
    );

    // Group by question number
    const groups = {};
    questions.forEach(q => {
      const n = q.question_number;
      if (!groups[n]) groups[n] = { parent: null, subs: [] };
      if (!q.sub_part) groups[n].parent = q;
      else groups[n].subs.push(q);
    });

    const groupEntries = Object.entries(groups)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([num, g]) => ({
        num: parseInt(num),
        parent: g.parent ? {
          id:                   g.parent.id,
          en:                   g.parent.question_text_english || '',
          np:                   g.parent.question_text_nepali  || '',
          answer:               g.parent.answer_text           || '',
          marks:                g.parent.marks                 || 0,
          topic:                g.parent.topic                 || '',
          difficulty:           g.parent.difficulty            || '',
          frequency:            g.parent.frequency             || '',
          section:              g.parent.section               || '',
          diagram:              g.parent.diagram_svg           || null,
          steps:                g.parent.steps_en              || null,
          opts:                 g.parent.opts_en               || null,
          correct:              g.parent.correct_opt           ?? null,
          marking_scheme:       g.parent.marking_scheme        || null,
          why_examiner:         g.parent.why_examiner          || '',
          common_mistake:       g.parent.common_mistake        || '',
          simpler_explanation:  g.parent.simpler_explanation   || '',
          similar_topic:        g.parent.similar_topic         || '',
          student_count:        g.parent.student_count         || null,
          error_rate:           g.parent.error_rate            || null,
        } : null,
        subs: g.subs.map(s => ({
          id:                   s.id,
          sub:                  s.sub_part,
          diagram:              s.diagram_svg           || null,
          en:                   s.question_text_english || '',
          np:                   s.question_text_nepali  || '',
          answer:               s.answer_text           || '',
          marks:                s.marks                 || 0,
          topic:                s.topic                 || '',
          difficulty:           s.difficulty            || '',
          frequency:            s.frequency             || '',
          section:              s.section               || '',
          steps:                s.steps_en              || null,
          opts:                 s.opts_en               || null,
          correct:              s.correct_opt           ?? null,
          marking_scheme:       s.marking_scheme        || null,
          why_examiner:         s.why_examiner          || '',
          common_mistake:       s.common_mistake        || '',
          simpler_explanation:  s.simpler_explanation   || '',
          similar_topic:        s.similar_topic         || '',
          student_count:        s.student_count         || null,
          error_rate:           s.error_rate            || null,
        })),
      }));

    // ── Server-rendered page request (view=page) ─────────────────────────
    // The clean paper URL is routed here by vercel.json. Return a real, indexable
    // HTML page (all question text, no answers) instead of the blank JS shell.
    // The interactive JSON path (used by see-paper-client.js) continues below.
    if (String(req.query.view || '') === 'page') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=86400');
      return res.status(200).send(renderPaperPage({
        year,
        provNorm,
        subjectCode,
        subjectName: subjects[0].name,
        paper: papers[0],
        groups: groupEntries,
      }));
    }

    // ── Free-account gate ────────────────────────────────────────────────
    // Anonymous visitors can preview the first PREVIEW_COUNT questions of any
    // paper; the rest needs a (free) login. Enforced here so locked questions
    // never reach the browser — a client-only hide would be trivially bypassed.
    const user = await getUser(req);
    const locked = !user;
    const fullTotal = groupEntries.length;
    const visibleGroups = locked ? groupEntries.slice(0, PREVIEW_COUNT) : groupEntries;
    const visibleSubs = visibleGroups.reduce((n, g) => n + (g.subs ? g.subs.length : 0), 0);

    return res.status(200).json({
      paper: {
        id:     papers[0].id,
        year:   papers[0].year,
        province: papers[0].province,
        marks:  papers[0].total_marks || 75,
        duration: papers[0].duration || (papers[0].time_minutes ? Math.round(papers[0].time_minutes/60) + ' hours' : '3 hours'),
        instruction:        papers[0].instructions_english || 'Answer all the questions.',
        instructionNepali:  papers[0].instructions_nepali  || '',
      },
      subject: {
        code:   subjects[0].code,
        name:   subjects[0].name,
        nameNepali: cfg.np,
        accent: cfg.accent,
        light:  cfg.light,
        icon:   cfg.icon,
        np:     cfg.np,
      },
      province: { np: provCfg.np, num: provCfg.num },
      groups:   visibleGroups,
      meta: {
        totalQuestions: visibleGroups.length,             // answerable now (progress counter)
        totalSubs:      visibleSubs,
        fullTotal:      fullTotal,                         // true length of the paper
        locked:         locked,                            // anonymous visitor?
        lockedCount:    locked ? Math.max(0, fullTotal - visibleGroups.length) : 0,
        previewCount:   PREVIEW_COUNT,
        yearAD:         parseInt(year) - 56,
        isEnglish:      subjectCode === 'english',
        // Province lowercased so the canonical matches the sitemap + the links the
        // library builds (see.html openPaper). A Title-case canonical here made
        // Google treat /bagmati/ and /Bagmati/ as two pages → "Duplicate" warnings.
        canonicalUrl:   `https://ujyalo.app/see/past-papers/${year}/${provNorm.toLowerCase()}/${subjectCode}`,
        paperKey:       `SEE-${year}-${provNorm}-${subjectCode}`,
      }
    });

  } catch (err) {
    console.error('see-paper error:', err);
    return res.status(500).json({ error: err.message });
  }
}
