// ============================================================
// UJYALO — SEE PAPER API (Server-Side Rendered)
// Route: /see/past-papers/:year/:province/:subject
// Returns fully rendered HTML — Google indexes everything
// CTO decision: SSR for SEO + dynamic UI for UX
// ============================================================

const DIAGRAMS = {
  6: `<svg width="120" height="155" viewBox="0 0 120 155" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="108" rx="40" ry="11" fill="none" stroke="#1a1208" stroke-width="1.5"/>
    <path d="M 20 108 A 40 40 0 0 0 100 108" fill="#f0f4ff" stroke="#1a1208" stroke-width="1.5"/>
    <line x1="20" y1="108" x2="60" y2="22" stroke="#1a1208" stroke-width="1.5"/>
    <line x1="100" y1="108" x2="60" y2="22" stroke="#1a1208" stroke-width="1.5"/>
    <line x1="108" y1="22" x2="108" y2="143" stroke="#888" stroke-width="0.75" stroke-dasharray="3,2"/>
    <text x="112" y="88" font-size="9" fill="#444" font-family="serif" font-style="italic">20cm</text>
    <line x1="20" y1="126" x2="100" y2="126" stroke="#888" stroke-width="0.75" stroke-dasharray="3,2"/>
    <text x="44" y="138" font-size="9" fill="#444" font-family="serif" font-style="italic">14cm</text>
  </svg>`,

  11: `<svg width="200" height="125" viewBox="0 0 200 125" xmlns="http://www.w3.org/2000/svg">
    <polygon points="38,108 97,108 66,18 8,18" fill="rgba(37,99,235,0.07)" stroke="#2563EB" stroke-width="1.5"/>
    <polygon points="38,108 97,108 188,18 130,18" fill="rgba(29,158,117,0.07)" stroke="#1D9E75" stroke-width="1.5"/>
    <line x1="38" y1="108" x2="130" y2="18" stroke="#999" stroke-width="1" stroke-dasharray="4,2"/>
    <line x1="66" y1="18" x2="97" y2="108" stroke="#999" stroke-width="1" stroke-dasharray="4,2"/>
    <circle cx="77" cy="65" r="2.5" fill="#888"/>
    <text x="80" y="62" font-size="9" font-family="serif" font-style="italic" fill="#888">A</text>
    <text x="2" y="16" font-size="11" font-family="serif" font-style="italic">S</text>
    <text x="61" y="14" font-size="11" font-family="serif" font-style="italic">Q</text>
    <text x="126" y="14" font-size="11" font-family="serif" font-style="italic">R</text>
    <text x="184" y="16" font-size="11" font-family="serif" font-style="italic">P</text>
    <text x="32" y="120" font-size="11" font-family="serif" font-style="italic">M</text>
    <text x="95" y="120" font-size="11" font-family="serif" font-style="italic">N</text>
  </svg>`,

  12: `<svg width="155" height="155" viewBox="0 0 155 155" xmlns="http://www.w3.org/2000/svg">
    <circle cx="77" cy="77" r="58" fill="rgba(37,99,235,0.04)" stroke="#1a1208" stroke-width="1.5"/>
    <circle cx="77" cy="77" r="2.5" fill="#1a1208"/>
    <text x="80" y="82" font-size="10" font-family="serif" font-style="italic">O</text>
    <circle cx="28" cy="116" r="2.5" fill="#1a1208"/>
    <circle cx="126" cy="116" r="2.5" fill="#1a1208"/>
    <circle cx="77" cy="19" r="2.5" fill="#1a1208"/>
    <circle cx="19" cy="58" r="2.5" fill="#1a1208"/>
    <line x1="77" y1="77" x2="28" y2="116" stroke="#2563EB" stroke-width="1.5"/>
    <line x1="77" y1="77" x2="126" y2="116" stroke="#2563EB" stroke-width="1.5"/>
    <line x1="77" y1="19" x2="28" y2="116" stroke="#1D9E75" stroke-width="1.2"/>
    <line x1="77" y1="19" x2="126" y2="116" stroke="#1D9E75" stroke-width="1.2"/>
    <line x1="19" y1="58" x2="28" y2="116" stroke="#f59e0b" stroke-width="1.2"/>
    <line x1="19" y1="58" x2="126" y2="116" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="21" y="128" font-size="10" font-family="serif" font-style="italic">S</text>
    <text x="127" y="128" font-size="10" font-family="serif" font-style="italic">P</text>
    <text x="74" y="13" font-size="10" font-family="serif" font-style="italic">R</text>
    <text x="6" y="58" font-size="10" font-family="serif" font-style="italic">T</text>
  </svg>`,

  14: `<svg width="220" height="135" viewBox="0 0 220 135" xmlns="http://www.w3.org/2000/svg">
    <line x1="8" y1="88" x2="212" y2="88" stroke="#2563EB" stroke-width="0.75" stroke-dasharray="4,3"/>
    <text x="10" y="84" font-size="8" fill="#2563EB" font-family="sans-serif">Water level</text>
    <line x1="8" y1="97" x2="75" y2="97" stroke="#1a1208" stroke-width="1.5"/>
    <line x1="138" y1="97" x2="212" y2="97" stroke="#1a1208" stroke-width="1.5"/>
    <path d="M 75 97 Q 107 104 138 97" fill="rgba(37,99,235,0.1)" stroke="#1a1208" stroke-width="1"/>
    <line x1="107" y1="19" x2="107" y2="97" stroke="#1a1208" stroke-width="2"/>
    <circle cx="28" cy="93" r="4" fill="none" stroke="#1a1208" stroke-width="1.5"/>
    <line x1="28" y1="97" x2="28" y2="112" stroke="#1a1208" stroke-width="1.5"/>
    <line x1="28" y1="97" x2="107" y2="19" stroke="#dc2626" stroke-width="1" stroke-dasharray="3,2"/>
    <path d="M 48 97 A 20 20 0 0 1 37 80" fill="none" stroke="#dc2626" stroke-width="1"/>
    <text x="50" y="93" font-size="10" font-family="serif" font-style="italic" fill="#dc2626">θ</text>
    <text x="52" y="131" font-size="8" fill="#444" font-family="sans-serif">50m</text>
    <text x="110" y="62" font-size="8" fill="#444" font-family="sans-serif">51.5m</text>
    <text x="78" y="96" font-size="8" fill="#2563EB" font-family="sans-serif">1.5m</text>
    <text x="110" y="16" font-size="10" font-family="serif" font-style="italic">T</text>
  </svg>`,

  16: `<svg width="255" height="175" viewBox="0 0 255 175" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="87" r="4" fill="#1a1208"/>
    <text x="6" y="84" font-size="8" fill="#444" font-family="sans-serif">Start</text>
    <line x1="32" y1="84" x2="98" y2="43" stroke="#1a1208" stroke-width="1.2"/>
    <text x="52" y="56" font-size="8" fill="#1D9E75" font-family="sans-serif">W (6/10)</text>
    <circle cx="102" cy="41" r="4" fill="#1D9E75"/>
    <line x1="32" y1="90" x2="98" y2="131" stroke="#1a1208" stroke-width="1.2"/>
    <text x="52" y="120" font-size="8" fill="#1a1208" font-family="sans-serif">B (4/10)</text>
    <circle cx="102" cy="133" r="4" fill="#1a1208"/>
    <line x1="106" y1="39" x2="172" y2="18" stroke="#1a1208" stroke-width="1"/>
    <text x="125" y="22" font-size="8" fill="#1D9E75" font-family="sans-serif">W (6/10)</text>
    <circle cx="176" cy="16" r="3" fill="#1D9E75"/>
    <text x="182" y="20" font-size="9" fill="#444" font-family="sans-serif">WW: 36/100</text>
    <line x1="106" y1="43" x2="172" y2="63" stroke="#1a1208" stroke-width="1"/>
    <text x="125" y="59" font-size="8" fill="#1a1208" font-family="sans-serif">B (4/10)</text>
    <circle cx="176" cy="65" r="3" fill="#1a1208"/>
    <text x="182" y="69" font-size="9" fill="#444" font-family="sans-serif">WB: 24/100</text>
    <line x1="106" y1="131" x2="172" y2="110" stroke="#1a1208" stroke-width="1"/>
    <text x="125" y="113" font-size="8" fill="#1D9E75" font-family="sans-serif">W (6/10)</text>
    <circle cx="176" cy="108" r="3" fill="#1D9E75"/>
    <text x="182" y="112" font-size="9" fill="#444" font-family="sans-serif">BW: 24/100</text>
    <line x1="106" y1="135" x2="172" y2="155" stroke="#1a1208" stroke-width="1"/>
    <text x="125" y="153" font-size="8" fill="#1a1208" font-family="sans-serif">B (4/10)</text>
    <circle cx="176" cy="157" r="3" fill="#1a1208"/>
    <text x="182" y="161" font-size="9" fill="#444" font-family="sans-serif">BB: 16/100</text>
  </svg>`
};

async function fetchFromSupabase(path) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    }
  });
  return res.json();
}

function escape(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHTML({ paper, subject, questions }) {

  // Nepali names for subjects — no DB column needed
  const subjectNepaliMap = {
    'maths': 'गणित',
    'science': 'विज्ञान',
    'english': 'अंग्रेजी',
    'nepali': 'नेपाली',
    'social': 'सामाजिक अध्ययन',
    'hpe': 'स्वास्थ्य'
  };
  const subjectNameNp = subjectNepaliMap[subject.code] || subject.name;

  const yearAD = parseInt(paper.year) - 56;
  const title = `SEE ${paper.year} ${paper.province} — ${subject.name} Past Paper | Ujyalo`;
  const description = `Free SEE ${paper.year} ${paper.province} Province ${subject.name} past paper. Full bilingual Nepali and English with complete model answers. Download PDF free.`;
  const canonicalUrl = `https://ujyalo.app/see/past-papers/${paper.year}/${paper.province.toLowerCase()}/${subject.code}`;

  // Group questions
  const groups = {};
  questions.forEach(q => {
    const num = q.question_number;
    if (!groups[num]) groups[num] = { parent: null, subs: [] };
    if (!q.sub_part) groups[num].parent = q;
    else groups[num].subs.push(q);
  });

  // Build structured data for Google
  const faqItems = [];
  questions.filter(q => q.sub_part && q.answer_text && q.question_text_english).forEach(q => {
    faqItems.push({
      "@type": "Question",
      "name": `SEE ${paper.year} Q${q.question_number}(${q.sub_part}): ${q.question_text_english.substring(0, 100)}`,
      "acceptedAnswer": { "@type": "Answer", "text": q.answer_text.substring(0, 300) }
    });
  });

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "name": `SEE ${paper.year} ${paper.province} ${subject.name}`,
        "description": description,
        "provider": { "@type": "Organization", "name": "Ujyalo", "url": "https://ujyalo.app" },
        "url": canonicalUrl
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqItems.slice(0, 10)
      }
    ]
  });

  // Build question list HTML (visible to Google)
  let questionsHTML = '';
  Object.entries(groups)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([num, g]) => {
      const parent = g.parent;
      const diagram = DIAGRAMS[parseInt(num)];

      questionsHTML += `
      <div class="q-block" id="qb-${num}">
        <div class="q-parent-row">
          <span class="q-num">${num}.</span>
          ${parent?.question_text_nepali ? `<span class="lang-np q-parent-text" style="display:none">${escape(parent.question_text_nepali)}</span>` : ''}
          ${parent?.question_text_english ? `<span class="lang-en q-parent-text">${escape(parent.question_text_english)}</span>` : ''}
        </div>
        ${diagram ? `<div class="q-diagram">${diagram}</div>` : ''}
        <div class="q-subs">`;

      g.subs.forEach((sub, i) => {
        questionsHTML += `
          <div class="q-sub" id="qs-${sub.id}" onclick="toggleAnswer('${sub.id}')">
            <div class="q-sub-header">
              <span class="q-sub-letter">${sub.sub_part}</span>
              <span class="q-sub-content">
                ${sub.question_text_nepali ? `<span class="lang-np" style="display:none">${escape(sub.question_text_nepali)}</span>` : ''}
                ${sub.question_text_english ? `<span class="lang-en">${escape(sub.question_text_english)}</span>` : ''}
              </span>
              <span class="q-sub-marks">${sub.marks}m</span>
              <span class="q-sub-toggle" id="toggle-${sub.id}">▾</span>
            </div>
            <div class="q-answer" id="ans-${sub.id}" style="display:none">
              <div class="q-answer-label">✓ Model Answer</div>
              <div class="q-answer-body">${escape(sub.answer_text || 'Model answer coming soon.')}</div>
            </div>
          </div>`;
      });

      questionsHTML += `</div></div>`;
    });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}" />
  <meta name="keywords" content="SEE ${paper.year} ${paper.province} ${subject.name} past paper, SEE ${paper.year} ${subject.name} Nepal, SEE past paper ${paper.province} province, SEE ${paper.year} ganit paper" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonicalUrl}" />

  <meta property="og:title" content="${escape(title)}" />
  <meta property="og:description" content="${escape(description)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Ujyalo" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escape(title)}" />
  <meta name="twitter:description" content="${escape(description)}" />

  <script type="application/ld+json">${structuredData}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,700;9..144,1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles/main.css" />

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --brand: #2563EB; --green: #1D9E75; --dark: #0a0f1e;
      --ink: #0f172a; --mid: #475569; --light: #94a3b8;
      --border: #e2e8f0; --bg: #f8fafc;
    }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); }

    /* ── TOP BAR ── */
    .topbar {
      background: var(--dark); display: flex; align-items: center;
      gap: 12px; padding: 0 20px; height: 58px;
      position: sticky; top: 0; z-index: 100;
    }
    .tb-back {
      display: flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,.65); font-size: 13px; font-weight: 600;
      background: rgba(255,255,255,.08); border: none; border-radius: 8px;
      padding: 7px 14px; cursor: pointer; font-family: inherit;
      transition: all .2s; text-decoration: none; white-space: nowrap;
    }
    .tb-back:hover { background: rgba(255,255,255,.15); color: white; }
    .tb-divider { width: 1px; height: 26px; background: rgba(255,255,255,.1); flex-shrink: 0; }
    .tb-info { flex: 1; min-width: 0; }
    .tb-title { font-size: 15px; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tb-sub { font-size: 11px; color: rgba(255,255,255,.4); margin-top: 1px; }
    .tb-lang { display: flex; background: rgba(255,255,255,.08); border-radius: 8px; padding: 3px; gap: 2px; flex-shrink: 0; }
    .tb-lang-btn {
      padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700;
      border: none; cursor: pointer; font-family: inherit; transition: all .2s;
      color: rgba(255,255,255,.5); background: transparent; white-space: nowrap;
    }
    .tb-lang-btn.active { background: white; color: var(--ink); }
    .tb-dl-wrap { position: relative; flex-shrink: 0; }
    .tb-dl {
      display: flex; align-items: center; gap: 7px;
      background: #f59e0b; color: #0a0f1e; border: none; border-radius: 8px;
      padding: 8px 16px; font-size: 13px; font-weight: 800; cursor: pointer;
      font-family: inherit; transition: all .2s; white-space: nowrap;
    }
    .tb-dl:hover { background: #d97706; }
    .dl-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: white; border: 1px solid var(--border);
      border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,.15);
      min-width: 210px; overflow: hidden; z-index: 999; display: none;
    }
    .dl-dropdown.open { display: block; }
    .dl-option {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 16px; cursor: pointer; transition: background .15s;
      border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: var(--ink);
    }
    .dl-option:last-child { border-bottom: none; }
    .dl-option:hover { background: #f8fafc; }
    .dl-option-icon { font-size: 20px; flex-shrink: 0; }
    .dl-sub { font-size: 11px; color: var(--light); margin-top: 1px; font-weight: 400; }

    /* ── PAPER ── */
    .paper-wrap { max-width: 860px; margin: 0 auto; padding: 28px 20px 80px; }

    /* Paper header */
    .paper-header {
      background: white; border: 1px solid var(--border);
      border-radius: 16px; padding: 28px; text-align: center;
      margin-bottom: 24px;
    }
    .ph-exam { font-family: 'Fraunces', serif; font-size: 15px; font-weight: 700; color: var(--ink); }
    .ph-subject { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700; color: var(--ink); margin: 4px 0; }
    .ph-subject-np { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 15px; color: var(--mid); margin-bottom: 12px; }
    .ph-badge { display: inline-flex; align-items: center; gap: 5px; background: var(--dark); color: white; font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 14px; }
    .ph-meta { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: var(--ink); border-top: 1px solid var(--border); padding-top: 14px; }
    .ph-instructions { background: #EFF6FF; border-left: 3px solid var(--brand); padding: 10px 14px; margin-top: 14px; border-radius: 0 8px 8px 0; font-size: 12px; color: var(--mid); line-height: 1.65; text-align: left; }
    .ph-instr-np { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 12px; margin-bottom: 4px; font-style: italic; }
    .ph-all { font-weight: 700; color: var(--ink); font-size: 13px; margin-top: 5px; }

    /* Questions */
    .q-block { background: white; border: 1px solid var(--border); border-radius: 14px; margin-bottom: 16px; overflow: hidden; }
    .q-parent-row { padding: 18px 20px 8px; display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
    .q-num { font-size: 16px; font-weight: 800; color: var(--ink); flex-shrink: 0; }
    .q-parent-text { font-size: 15px; color: var(--mid); line-height: 1.75; flex: 1; }
    .q-diagram { padding: 0 20px 12px; }
    .q-subs { border-top: 1px solid #f1f5f9; }

    .q-sub { border-bottom: 1px solid #f1f5f9; }
    .q-sub:last-child { border-bottom: none; }
    .q-sub-header {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 20px; cursor: pointer; transition: background .15s;
    }
    .q-sub-header:hover { background: #f8fafc; }
    .q-sub.open .q-sub-header { background: #EFF6FF; }
    .q-sub-letter {
      width: 28px; height: 28px; border-radius: 50%;
      background: #f1f5f9; color: var(--mid);
      font-size: 12px; font-weight: 700; display: flex;
      align-items: center; justify-content: center;
      flex-shrink: 0; transition: all .2s;
    }
    .q-sub.open .q-sub-letter { background: var(--brand); color: white; }
    .q-sub-content { flex: 1; font-size: 15px; color: var(--mid); line-height: 1.7; }
    .q-sub.open .q-sub-content { color: var(--ink); font-weight: 600; }
    .q-sub-marks { font-size: 11px; font-weight: 700; color: white; background: var(--light); border-radius: 999px; padding: 3px 9px; flex-shrink: 0; margin-top: 4px; white-space: nowrap; }
    .q-sub.open .q-sub-marks { background: var(--brand); }
    .q-sub-toggle { font-size: 14px; color: var(--light); flex-shrink: 0; margin-top: 4px; transition: transform .2s; }
    .q-sub.open .q-sub-toggle { transform: rotate(180deg); color: var(--brand); }

    /* Answer */
    .q-answer { border-top: 1px solid #bbf7d0; display: none; }
    .q-sub.open .q-answer { display: block; }
    .q-answer-label { background: var(--green); color: white; padding: 10px 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    .q-answer-body { padding: 18px 20px; font-size: 14px; color: #065f46; line-height: 1.9; white-space: pre-wrap; background: #f0fdf4; }

    /* Print */
    @media print {
      .topbar, #site-nav, #site-footer { display: none !important; }
      .q-answer { display: block !important; }
      .q-sub-toggle { display: none; }
      .paper-wrap { padding: 0; }
    }

    @media (max-width: 640px) {
      .tb-dl span:first-of-type { display: none; }
      .paper-wrap { padding: 16px 12px 60px; }
      .ph-subject { font-size: 18px; }
    }
  </style>
</head>
<body>
<div id="site-nav"></div>

<div class="topbar">
  <a href="/see.html?mode=past-papers" class="tb-back">← Back</a>
  <div class="tb-divider"></div>
  <div class="tb-info">
    <div class="tb-title">${escape(subject.name)} · SEE ${paper.year}</div>
    <div class="tb-sub">${escape(paper.province)} Province · Full marks: ${paper.total_marks}</div>
  </div>
  <div class="tb-lang">
    <button class="tb-lang-btn active" id="btn-en" onclick="setLang('en')">🇬🇧 English</button>
    <button class="tb-lang-btn" id="btn-np" onclick="setLang('np')">🇳🇵 नेपाली</button>
  </div>
  <div class="tb-dl-wrap">
    <button class="tb-dl" onclick="toggleDl()">⬇ <span>Download PDF</span> ▾</button>
    <div class="dl-dropdown" id="dl-dd">
      <div class="dl-option" onclick="downloadPDF('en')">
        <div class="dl-option-icon">🇬🇧</div>
        <div><div>English PDF</div><div class="dl-sub">Questions in English only</div></div>
      </div>
      <div class="dl-option" onclick="downloadPDF('np')">
        <div class="dl-option-icon">🇳🇵</div>
        <div><div>Nepali PDF</div><div class="dl-sub">नेपाली भाषामा मात्र</div></div>
      </div>
      <div class="dl-option" onclick="downloadPDF('both')">
        <div class="dl-option-icon">📄</div>
        <div><div>Both languages</div><div class="dl-sub">Nepali + English combined</div></div>
      </div>
    </div>
  </div>
</div>

<div class="paper-wrap">
  <h1 class="paper-header">
    <div class="ph-exam">SEE ${paper.year} (${yearAD} AD)</div>
    <div class="ph-subject">Compulsory ${escape(subject.name)}</div>
    <div class="ph-subject-np">अनिवार्य ${escape(subjectNameNp)}</div>
    <div><span class="ph-badge">🏔 ${escape(paper.province)} Province</span></div>
    <div class="ph-meta">
      <span>Time: ${paper.time_minutes / 60} Hours</span>
      <span>Full Marks: ${paper.total_marks}</span>
    </div>
    ${paper.instructions_english ? `
    <div class="ph-instructions">
      <div class="ph-instr-np lang-np" style="display:none">${escape(paper.instructions_nepali || '')}</div>
      <div class="lang-en" style="font-style:italic">${escape(paper.instructions_english)}</div>
      <div class="ph-all">सबै प्रश्नहरू अनिवार्य छन् · All questions are compulsory.</div>
    </div>` : ''}
  </h1>

  ${questionsHTML}
</div>

<div id="site-footer"></div>
<script src="/scripts/components.js"></script>
<script>
let LANG = 'en';
let OPEN_ID = null;

function toggleAnswer(id) {
  const sub = document.getElementById('qs-' + id);
  const ans = document.getElementById('ans-' + id);
  const isOpen = sub.classList.contains('open');

  // Close previously open
  if (OPEN_ID && OPEN_ID !== id) {
    const prev = document.getElementById('qs-' + OPEN_ID);
    const prevAns = document.getElementById('ans-' + OPEN_ID);
    if (prev) prev.classList.remove('open');
    if (prevAns) prevAns.style.display = 'none';
  }

  if (isOpen) {
    sub.classList.remove('open');
    ans.style.display = 'none';
    OPEN_ID = null;
  } else {
    sub.classList.add('open');
    ans.style.display = 'block';
    OPEN_ID = id;
  }
}

function setLang(lang) {
  LANG = lang;
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-np').classList.toggle('active', lang === 'np');
  const showNp = lang === 'np';
  document.querySelectorAll('.lang-np').forEach(el => el.style.display = showNp ? 'inline' : 'none');
  document.querySelectorAll('.lang-en').forEach(el => el.style.display = showNp ? 'none' : 'inline');
  // Block elements
  document.querySelectorAll('.ph-instr-np').forEach(el => el.style.display = showNp ? 'block' : 'none');
}

function toggleDl() { document.getElementById('dl-dd').classList.toggle('open'); }
document.addEventListener('click', e => { if (!e.target.closest('.tb-dl-wrap')) document.getElementById('dl-dd').classList.remove('open'); });

function downloadPDF(lang) {
  document.getElementById('dl-dd').classList.remove('open');
  const prev = LANG;
  if (lang === 'both') {
    document.querySelectorAll('.lang-np, .lang-en').forEach(el => el.style.display = 'inline');
    document.querySelectorAll('.ph-instr-np').forEach(el => el.style.display = 'block');
    // Open all answers for print
    document.querySelectorAll('.q-answer').forEach(el => el.style.display = 'block');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setLang(prev);
        document.querySelectorAll('.q-answer').forEach((el, i) => {
          el.style.display = 'none';
        });
        if (OPEN_ID) document.getElementById('ans-' + OPEN_ID).style.display = 'block';
      }, 500);
    }, 300);
  } else {
    setLang(lang);
    document.querySelectorAll('.q-answer').forEach(el => el.style.display = 'block');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setLang(prev);
        document.querySelectorAll('.q-answer').forEach(el => el.style.display = 'none');
        if (OPEN_ID) document.getElementById('ans-' + OPEN_ID).style.display = 'block';
      }, 500);
    }, 300);
  }
}
</script>
</body>
</html>`;
}

export default async function handler(req, res) {
  try {
    // Vercel rewrites pass path segments as query params
    // BUT also need to handle parsing from URL path directly
    let { year, province, subject } = req.query;

    // If not in query params, parse from URL path
    // URL: /see/past-papers/2082/Koshi/maths
    if (!year || !province || !subject) {
      const urlPath = req.url || '';
      const match = urlPath.match(/\/see\/past-papers\/(\d+)\/([^\/\?]+)\/([^\/\?]+)/);
      if (match) {
        year = year || match[1];
        province = province || match[2];
        subject = subject || match[3];
      }
    }

    console.log('Params:', { year, province, subject, url: req.url, query: req.query });
    if (!year || !province || !subject) {
      return res.status(400).send(`Missing parameters. URL: ${req.url}, Query: ${JSON.stringify(req.query)}`);
    }

    // Fetch subject — filter by code only (code is unique across SEE subjects)
    const subjects = await fetchFromSupabase(
      `/exam_subjects?code=eq.${subject.toLowerCase()}&select=id,name,code`
    );
    console.log('Subject query result:', JSON.stringify(subjects));
    if (!subjects[0]) return res.status(404).send(`Subject not found: ${subject}. Query returned: ${JSON.stringify(subjects)}`);
    const subjectData = subjects[0];

    // Fetch paper — province stored with capital first letter e.g. "Koshi"
    const provinceName = province.charAt(0).toUpperCase() + province.slice(1).toLowerCase();
    const papers = await fetchFromSupabase(
      `/past_papers?subject_id=eq.${subjectData.id}&year=eq.${year}&province=eq.${provinceName}&select=*`
    );
    console.log('Paper query result:', JSON.stringify(papers));
    if (!papers[0]) return res.status(404).send(`Paper not found. year=${year} province=${provinceName} subject_id=${subjectData.id}. Result: ${JSON.stringify(papers)}`);
    const paper = papers[0];

    // Fetch questions
    const questions = await fetchFromSupabase(
      `/past_paper_questions?paper_id=eq.${paper.id}&order=question_number.asc,sub_part.asc&select=*`
    );

    const html = buildHTML({ paper, subject: subjectData, questions });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);

  } catch (err) {
    console.error('Paper error:', err);
    return res.status(500).send(`<html><body><h1>Error loading paper</h1><p>${err.message}</p><a href="/see.html">Back</a></body></html>`);
  }
}
