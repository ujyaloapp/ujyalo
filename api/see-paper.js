// ============================================================
// UJYALO — SEE PAPER API (Server-Side Rendered)
// Route: /see/past-papers/:year/:province/:subject
// CTO decisions:
//   - SSR for SEO — Google indexes everything
//   - Desktop: two-column (questions left, answers right)
//   - Mobile: accordion (answer below question)
//   - PDF: questions only, no answers, branding footer
//   - Both languages PDF: Nepali then English below
//   - GA tracking on download
//   - Share button in topbar
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

  const subjectNepaliMap = {
    'maths': 'गणित', 'science': 'विज्ञान', 'english': 'अंग्रेजी',
    'nepali': 'नेपाली', 'social': 'सामाजिक अध्ययन', 'hpe': 'स्वास्थ्य'
  };
  const subjectNameNp = subjectNepaliMap[subject.code] || subject.name;
  const yearAD = parseInt(paper.year) - 56;
  const title = `SEE ${paper.year} ${paper.province} — ${subject.name} Past Paper | Ujyalo`;
  const description = `Free SEE ${paper.year} ${paper.province} Province ${subject.name} past paper. Bilingual Nepali and English, clean diagrams, model answers. Download PDF free.`;
  const canonicalUrl = `https://ujyalo.app/see/past-papers/${paper.year}/${paper.province}/${subject.code}`;
  const shareUrl = canonicalUrl;

  // Group questions
  const groups = {};
  questions.forEach(q => {
    const num = q.question_number;
    if (!groups[num]) groups[num] = { parent: null, subs: [] };
    if (!q.sub_part) groups[num].parent = q;
    else groups[num].subs.push(q);
  });

  // Schema.org structured data
  const faqItems = questions
    .filter(q => q.sub_part && q.answer_text && q.question_text_english)
    .slice(0, 10)
    .map(q => ({
      "@type": "Question",
      "name": `SEE ${paper.year} Q${q.question_number}(${q.sub_part}): ${q.question_text_english.substring(0, 100)}`,
      "acceptedAnswer": { "@type": "Answer", "text": q.answer_text.substring(0, 300) }
    }));

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
      { "@type": "FAQPage", "mainEntity": faqItems }
    ]
  });

  // Build left panel questions (visible to Google + desktop left column)
  let questionsHTML = '';
  const allSubs = [];

  Object.entries(groups)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([num, g]) => {
      const parent = g.parent;
      const diagram = subject.code === 'maths' ? DIAGRAMS[parseInt(num)] : null;

      questionsHTML += `<div class="q-block" id="qb-${num}">
        <div class="q-parent-row">
          <span class="q-num">${num}.</span>
          <span class="q-parent-text">
            ${parent?.question_text_nepali ? `<span class="lang-np" style="display:none">${escape(parent.question_text_nepali)}</span>` : ''}
            ${parent?.question_text_english ? `<span class="lang-en">${escape(parent.question_text_english)}</span>` : ''}
          </span>
        </div>
        ${diagram ? `<div class="q-diagram">${diagram}</div>` : ''}
        <div class="q-subs">`;

      g.subs.forEach(sub => {
        allSubs.push(sub.id);
        questionsHTML += `
          <div class="q-sub" id="qs-${sub.id}" onclick="selectQ('${sub.id}')">
            <div class="q-sub-header">
              <span class="q-sub-letter">${sub.sub_part}</span>
              <span class="q-sub-content">
                ${sub.question_text_nepali ? `<span class="lang-np" style="display:none">${escape(sub.question_text_nepali)}</span>` : ''}
                ${sub.question_text_english ? `<span class="lang-en">${escape(sub.question_text_english)}</span>` : ''}
              </span>
              <span class="q-sub-marks">${sub.marks}m</span>
              <span class="q-sub-chevron">▾</span>
            </div>
            <!-- Mobile accordion answer -->
            <div class="q-mobile-answer" id="mob-${sub.id}">
              <div class="ans-label">✓ Model Answer</div>
              <div class="ans-body">${escape(sub.answer_text || 'Model answer coming soon.')}</div>
              <div class="ans-share">
                <button onclick="shareQ('${sub.id}', event)" class="share-btn">↗ Share this question</button>
              </div>
            </div>
          </div>`;
      });

      questionsHTML += `</div></div>`;
    });

  // Build answers data for right panel (desktop)
  const answersData = {};
  questions.filter(q => q.sub_part).forEach(q => {
    const parent = groups[q.question_number]?.parent;
    answersData[q.id] = {
      qNum: q.question_number,
      subPart: q.sub_part,
      marks: q.marks,
      textEn: q.question_text_english || '',
      textNp: q.question_text_nepali || '',
      ctxEn: parent?.question_text_english || '',
      ctxNp: parent?.question_text_nepali || '',
      answer: q.answer_text || 'Model answer coming soon.',
      hasDiagram: !!DIAGRAMS[q.question_number]
    };
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}"/>
  <meta name="keywords" content="SEE ${paper.year} ${paper.province} ${subject.name} past paper, SEE ${paper.year} ${subject.name} Nepal, SEE past paper ${paper.province}, SEE ${paper.year} ganit"/>
  <meta name="robots" content="index, follow"/>
  <link rel="canonical" href="${canonicalUrl}"/>
  <meta property="og:title" content="${escape(title)}"/>
  <meta property="og:description" content="${escape(description)}"/>
  <meta property="og:url" content="${canonicalUrl}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="Ujyalo"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <script type="application/ld+json">${structuredData}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,700;9..144,1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/styles/main.css"/>
  <!-- Google Analytics event tracking -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --brand:#2563EB;--green:#1D9E75;--dark:#0a0f1e;
      --ink:#0f172a;--mid:#475569;--light:#94a3b8;
      --border:#e2e8f0;--bg:#f8fafc;
    }
    html,body{height:100%;overflow:hidden;}
    body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);display:flex;flex-direction:column;}
    /* Hide footer only — nav stays visible */
    #site-footer{display:none!important;}

    /* ── TOPBAR ── */
    .topbar{
      background:var(--dark);display:flex;align-items:center;
      gap:10px;padding:0 16px;height:56px;flex-shrink:0;z-index:100;
    }
    .tb-back{
      display:flex;align-items:center;gap:5px;color:rgba(255,255,255,.6);
      font-size:13px;font-weight:600;background:rgba(255,255,255,.08);
      border:none;border-radius:8px;padding:6px 12px;cursor:pointer;
      font-family:inherit;transition:all .2s;text-decoration:none;white-space:nowrap;flex-shrink:0;
    }
    .tb-back:hover{background:rgba(255,255,255,.14);color:white;}
    .tb-divider{width:1px;height:24px;background:rgba(255,255,255,.1);flex-shrink:0;}
    .tb-info{flex:1;min-width:0;}
    .tb-title{font-size:14px;font-weight:700;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .tb-sub{font-size:11px;color:rgba(255,255,255,.4);margin-top:1px;}
    .tb-actions{display:flex;align-items:center;gap:8px;flex-shrink:0;}
    .tb-lang{display:flex;background:rgba(255,255,255,.08);border-radius:8px;padding:3px;gap:2px;}
    .tb-lang-btn{
      padding:5px 10px;border-radius:6px;font-size:12px;font-weight:700;
      border:none;cursor:pointer;font-family:inherit;transition:all .2s;
      color:rgba(255,255,255,.5);background:transparent;white-space:nowrap;
    }
    .tb-lang-btn.active{background:white;color:var(--ink);}
    /* Share button */
    .tb-share{
      display:flex;align-items:center;gap:5px;
      background:rgba(255,255,255,.08);border:none;border-radius:8px;
      padding:6px 12px;color:rgba(255,255,255,.7);font-size:12px;font-weight:700;
      cursor:pointer;font-family:inherit;transition:all .2s;white-space:nowrap;
    }
    .tb-share:hover{background:rgba(255,255,255,.14);color:white;}
    .tb-share.copied{background:#1D9E75;color:white;}
    /* Download */
    .tb-dl-wrap{position:relative;}
    .tb-dl{
      display:flex;align-items:center;gap:6px;
      background:#f59e0b;color:#0a0f1e;border:none;border-radius:8px;
      padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;
      font-family:inherit;transition:all .2s;white-space:nowrap;
    }
    .tb-dl:hover{background:#d97706;}
    .dl-dd{
      position:absolute;top:calc(100% + 8px);right:0;
      background:white;border:1px solid var(--border);
      border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15);
      min-width:210px;overflow:hidden;z-index:999;display:none;
    }
    .dl-dd.open{display:block;}
    .dl-opt{
      display:flex;align-items:center;gap:12px;
      padding:12px 16px;cursor:pointer;transition:background .15s;
      border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:600;color:var(--ink);
    }
    .dl-opt:last-child{border-bottom:none;}
    .dl-opt:hover{background:#f8fafc;}
    .dl-opt-icon{font-size:18px;flex-shrink:0;}
    .dl-opt-sub{font-size:11px;color:var(--light);margin-top:1px;font-weight:400;}

    /* ── TWO COLUMN LAYOUT ── */
    .paper-layout{
      display:flex;flex:1;overflow:hidden;
      /* Height is set by JS to account for dynamic nav height */
    }

    /* Left — question list */
    .q-panel{
      width:55%;flex-shrink:0;
      background:white;border-right:1px solid var(--border);
      overflow-y:auto;display:flex;flex-direction:column;
    }

    /* Paper header in left panel */
    .paper-header{
      border-bottom:2px solid var(--ink);padding:16px 16px 12px;
      text-align:center;flex-shrink:0;background:white;
    }
    .ph-exam{font-family:'Fraunces',serif;font-size:12px;font-weight:700;color:var(--ink);}
    .ph-subject{font-family:'Fraunces',serif;font-size:16px;font-weight:700;color:var(--ink);margin:2px 0;}
    .ph-subject-np{font-family:'Noto Sans Devanagari',sans-serif;font-size:12px;color:var(--mid);margin-bottom:6px;}
    .ph-badge{display:inline-flex;align-items:center;gap:4px;background:var(--dark);color:white;font-size:9px;font-weight:700;padding:3px 9px;border-radius:999px;margin-bottom:8px;}
    .ph-meta{display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:var(--ink);border-top:1px solid var(--border);padding-top:8px;}
    .ph-instr{background:#EFF6FF;border-left:3px solid var(--brand);padding:8px 12px;margin:12px 16px 0;border-radius:0 6px 6px 0;font-size:11px;color:var(--mid);line-height:1.6;text-align:left;}
    .ph-instr-np{font-family:'Noto Sans Devanagari',sans-serif;font-size:11px;margin-bottom:3px;font-style:italic;}
    .ph-all{font-weight:700;color:var(--ink);font-size:11px;margin-top:4px;}

    /* Questions */
    .q-list-wrap{padding:8px 0 32px;}
    .q-block{border-top:1px solid #f1f5f9;margin-top:4px;}
    .q-block:first-child{border-top:none;margin-top:0;}
    .q-parent-row{padding:14px 16px 6px;display:flex;gap:8px;align-items:baseline;}
    .q-num{font-size:15px;font-weight:800;color:var(--ink);flex-shrink:0;}
    .q-parent-text{font-size:14px;color:var(--mid);line-height:1.7;flex:1;}
    .q-diagram{padding:0 16px 8px;}
    .q-subs{}
    .q-sub{border-bottom:1px solid #f8fafc;cursor:pointer;}
    .q-sub:last-child{border-bottom:none;}
    .q-sub-header{
      display:flex;align-items:flex-start;gap:10px;
      padding:10px 16px;transition:background .15s;
    }
    .q-sub-header:hover{background:#f8fafc;}
    .q-sub.active .q-sub-header{background:#EFF6FF;border-left:3px solid var(--brand);}
    .q-sub-letter{
      width:24px;height:24px;border-radius:50%;
      background:#f1f5f9;color:var(--mid);
      font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;
      flex-shrink:0;transition:all .2s;
    }
    .q-sub.active .q-sub-letter{background:var(--brand);color:white;}
    .q-sub-content{flex:1;font-size:14px;color:var(--mid);line-height:1.65;}
    .q-sub.active .q-sub-content{color:var(--ink);font-weight:600;}
    .q-sub-marks{font-size:10px;font-weight:700;color:white;background:var(--light);border-radius:999px;padding:2px 7px;flex-shrink:0;margin-top:3px;white-space:nowrap;}
    .q-sub.active .q-sub-marks{background:var(--brand);}
    .q-sub-chevron{font-size:12px;color:var(--light);flex-shrink:0;margin-top:3px;transition:transform .2s;display:none;}

    /* Mobile accordion answer — hidden on desktop */
    .q-mobile-answer{display:none;}

    /* Right — answer panel */
    .ans-panel{
      flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg);
    }
    .ans-empty{
      flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:40px;text-align:center;
    }
    .ans-empty-icon{font-size:56px;margin-bottom:16px;opacity:.3;}
    .ans-empty-title{font-family:'Fraunces',serif;font-size:1.5rem;font-weight:700;color:var(--ink);opacity:.3;margin-bottom:8px;}
    .ans-empty-sub{font-size:14px;color:var(--light);}
    .ans-content{flex:1;overflow-y:auto;padding:24px 28px;display:none;}
    .ans-content.show{display:block;}
    .ans-q-badge{
      display:inline-flex;align-items:center;gap:6px;
      font-size:11px;font-weight:700;color:var(--brand);
      background:#EFF6FF;padding:4px 12px;border-radius:999px;
      text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;
    }
    .ans-question{
      background:white;border:1px solid var(--border);
      border-radius:14px;padding:18px 20px;margin-bottom:16px;
    }
    .ans-ctx-label{font-size:10px;font-weight:700;color:var(--light);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;}
    .ans-ctx{font-size:13px;color:var(--mid);line-height:1.7;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid var(--border);}
    .ans-ctx-np{font-family:'Noto Sans Devanagari',sans-serif;font-size:13px;color:var(--ink);line-height:1.8;}
    .ans-q-text{font-size:14px;color:var(--ink);line-height:1.75;font-weight:600;}
    .ans-q-text-np{font-family:'Noto Sans Devanagari',sans-serif;font-size:14px;color:var(--ink);line-height:1.85;font-weight:600;}
    .ans-marks{display:inline-flex;align-items:center;gap:4px;background:#EFF6FF;color:var(--brand);font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;margin-top:10px;}
    .ans-box{background:white;border:1.5px solid #bbf7d0;border-radius:14px;overflow:hidden;}
    .ans-box-header{background:var(--green);padding:10px 18px;display:flex;align-items:center;justify-content:space-between;}
    .ans-box-label{font-size:11px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:.08em;}
    .ans-body{padding:18px 20px;font-size:13px;color:#065f46;line-height:1.9;white-space:pre-wrap;background:#f0fdf4;}
    .ans-share-wrap{padding:12px 20px 16px;background:#f0fdf4;border-top:1px solid #bbf7d0;text-align:right;}

    /* Share button in answer */
    .share-btn{
      display:inline-flex;align-items:center;gap:5px;
      background:white;border:1px solid var(--border);
      border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;
      color:var(--brand);cursor:pointer;font-family:inherit;transition:all .2s;
    }
    .share-btn:hover{background:#EFF6FF;border-color:var(--brand);}

    /* Nav bottom */
    .ans-nav{
      display:flex;align-items:center;justify-content:space-between;
      padding:12px 20px;border-top:1px solid var(--border);
      background:white;flex-shrink:0;
    }
    .ans-nav-info{font-size:12px;color:var(--light);font-weight:600;}
    .ans-nav-btns{display:flex;gap:8px;}
    .ans-nav-btn{
      padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;
      border:none;cursor:pointer;font-family:inherit;transition:all .2s;
    }
    .ans-prev{background:#f1f5f9;color:var(--mid);}
    .ans-prev:hover:not(:disabled){background:var(--border);}
    .ans-next{background:var(--brand);color:white;}
    .ans-next:hover:not(:disabled){background:#1d4ed8;}
    .ans-nav-btn:disabled{opacity:.35;cursor:not-allowed;}

    /* ── PRINT / PDF ── */
    @media print {
      /* Reset everything for clean multi-page print */
      html,body{
        height:auto!important;overflow:visible!important;
        width:100%!important;
      }
      /* Fix Nepali font in PDF - use system fonts */
      * { font-family: 'Noto Sans Devanagari', Arial, sans-serif !important; }
      .ph-exam, .ph-subject, .ph-all,
      .q-num, .q-parent-text, .q-sub-content,
      .ph-meta span { font-family: Arial, sans-serif !important; }
      .ph-subject-np, .ph-instr-np,
      .lang-np { font-family: 'Noto Sans Devanagari', Arial Unicode MS, sans-serif !important; }
      /* Hide everything except question panel */
      .topbar,#site-nav,#site-footer,.ans-panel,
      .q-sub-chevron,.q-mobile-answer,.print-footer-screen,
      .ans-share-wrap,.share-btn{
        display:none!important;
      }
      /* Hide chevron arrows - critical */
      [class*="chevron"], [class*="toggle"], .q-sub-chevron{
        display:none!important;
        visibility:hidden!important;
      }
      /* Full width question panel, no height limit */
      .paper-layout{
        display:block!important;height:auto!important;
        overflow:visible!important;width:100%!important;
      }
      .q-panel{
        width:100%!important;height:auto!important;
        max-height:none!important;overflow:visible!important;
        border:none!important;
      }
      .q-list-wrap{
        height:auto!important;overflow:visible!important;
      }
      /* Clean up active states */
      .q-sub.active .q-sub-header{
        background:white!important;border-left:none!important;
      }
      /* Clean question styling for print */
      .q-block{
        border:none!important;border-radius:0!important;
        border-bottom:1px solid #e2e8f0!important;
        margin-bottom:6px!important;
        page-break-inside:avoid;
      }
      .q-sub-header{padding:6px 8px!important;}
      .q-sub-letter{
        background:#f1f5f9!important;color:#475569!important;
        -webkit-print-color-adjust:exact;print-color-adjust:exact;
      }
      .q-sub-marks{
        background:#94a3b8!important;color:white!important;
        -webkit-print-color-adjust:exact;print-color-adjust:exact;
      }
      .paper-header{border-radius:0!important;}
      /* Show print footer at bottom */
      .print-footer{
        display:block!important;
        position:fixed;
        bottom:0;left:0;right:0;
        text-align:center;
        font-size:9pt;
        color:#94a3b8;
        padding:8px;
        border-top:1px solid #e2e8f0;
      }

      /* PDF footer with branding on every page */
      @page {
        margin: 15mm 15mm 20mm 15mm;
        @bottom-center {
          content: "ujyalo.app | Free SEE Exam Prep for Nepal 🇳🇵 | Free forever";
          font-size: 9pt;
          color: #94a3b8;
        }
      }
      /* Fallback footer for browsers that don't support @page @bottom */
      .print-footer{
        display:block!important;
        text-align:center;font-size:10px;color:#94a3b8;
        padding-top:16px;margin-top:24px;
        border-top:1px solid #e2e8f0;
      }
    }
    .print-footer{display:none;}

    /* Both languages print mode */
    body.print-both .lang-np{display:inline!important;}
    body.print-both .lang-en{display:inline!important;}
    body.print-both .ph-instr-np{display:block!important;}
    body.print-both .lang-np-block{display:block!important;}
    /* In both mode, show Nepali then English on separate lines */
    body.print-both .q-parent-text,
    body.print-both .q-sub-content{display:flex;flex-direction:column;gap:4px;}
    body.print-both .lang-np{display:block!important;font-family:'Noto Sans Devanagari',sans-serif;}
    body.print-both .lang-en{display:block!important;color:var(--mid);font-size:.95em;}

    /* ── MOBILE ── */
    @media (max-width:768px){
      html,body{height:auto;overflow:auto;}
      .paper-layout{flex-direction:column;height:auto;overflow:visible;}
      .q-panel{width:100%;border-right:none;overflow:visible;height:auto;}
      .ans-panel{display:none!important;}
      .q-sub-chevron{display:block!important;}
      /* Mobile accordion */
      .q-mobile-answer{
        display:none;border-top:1px solid #bbf7d0;
        background:#f0fdf4;
      }
      .q-sub.open .q-mobile-answer{display:block;}
      .q-sub.open .q-sub-chevron{transform:rotate(180deg);color:var(--brand);}
      .q-sub.open .q-sub-header{background:#EFF6FF;border-left:3px solid var(--brand);}
      .q-sub.open .q-sub-letter{background:var(--brand);color:white;}
      .q-sub.open .q-sub-content{color:var(--ink);font-weight:600;}
      .ans-label{background:var(--green);color:white;padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;}
      .ans-body{padding:14px 16px;font-size:13px;color:#065f46;line-height:1.9;white-space:pre-wrap;}
      .ans-share{padding:8px 16px 12px;text-align:right;}
      .tb-dl span:first-of-type{display:none;}
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
  <div class="tb-actions">
    <div class="tb-lang" id="lang-toggle" style="${subject.code === 'english' ? 'display:none' : ''}">
      <button class="tb-lang-btn active" id="btn-en" onclick="setLang('en')">🇬🇧 English</button>
      <button class="tb-lang-btn" id="btn-np" onclick="setLang('np')">🇳🇵 नेपाली</button>
    </div>
    <button class="tb-share" id="share-btn" onclick="shareLink()">↗ Share</button>
    <div class="tb-dl-wrap">
      ${subject.code === 'english' ? `
      <button class="tb-dl" onclick="downloadPDF('en')">⬇ <span>Download PDF</span></button>
      ` : `
      <button class="tb-dl" onclick="toggleDl()">⬇ <span>Download PDF</span> ▾</button>
      <div class="dl-dd" id="dl-dd">
        <div class="dl-opt" onclick="downloadPDF('en')">
          <div class="dl-opt-icon">🇬🇧</div>
          <div><div>English PDF</div><div class="dl-opt-sub">Questions in English only</div></div>
        </div>
        <div class="dl-opt" onclick="downloadPDF('np')">
          <div class="dl-opt-icon">🇳🇵</div>
          <div><div>Nepali PDF</div><div class="dl-opt-sub">नेपाली भाषामा मात्र</div></div>
        </div>
        <div class="dl-opt" onclick="downloadPDF('both')">
          <div class="dl-opt-icon">📄</div>
          <div><div>Both languages</div><div class="dl-opt-sub">Nepali then English</div></div>
        </div>
      </div>
      `}
    </div>
  </div>
</div>

<div class="paper-layout">
  <!-- LEFT: Question list -->
  <div class="q-panel" id="q-panel">
    <!-- Paper header -->
    <div class="paper-header">
      <div class="ph-exam">SEE ${paper.year} (${yearAD} AD)</div>
      <div class="ph-subject">Compulsory ${escape(subject.name)}</div>
      <div class="ph-subject-np">अनिवार्य ${escape(subjectNameNp)}</div>
      <div><span class="ph-badge">🏔 ${escape(paper.province)} Province</span></div>
      <div class="ph-meta">
        <span>Time: ${paper.time_minutes / 60} Hours</span>
        <span>Full Marks: ${paper.total_marks}</span>
      </div>
      ${paper.instructions_english ? `
      <div class="ph-instr">
        <div class="ph-instr-np lang-np" style="display:none">${escape(paper.instructions_nepali || '')}</div>
        <div class="lang-en" style="font-style:italic;font-size:11px;">${escape(paper.instructions_english)}</div>
        <div class="ph-all">सबै प्रश्नहरू अनिवार्य छन् · All questions are compulsory.</div>
      </div>` : ''}
    </div>
    <!-- Questions -->
    <div class="q-list-wrap">${questionsHTML}</div>
    <!-- Print footer -->
    <div class="print-footer">
      ujyalo.app &nbsp;|&nbsp; Free SEE Exam Prep for Nepal 🇳🇵 &nbsp;|&nbsp; Free forever
    </div>
  </div>

  <!-- RIGHT: Answer panel (desktop only) -->
  <div class="ans-panel" id="ans-panel">
    <div class="ans-empty" id="ans-empty">
      <div class="ans-empty-icon">👈</div>
      <div class="ans-empty-title">Select a question</div>
      <div class="ans-empty-sub">Click any question on the left to see the model answer</div>
    </div>
    <div class="ans-content" id="ans-content"></div>
    <div class="ans-nav" id="ans-nav" style="display:none;">
      <div class="ans-nav-info" id="ans-nav-info"></div>
      <div class="ans-nav-btns">
        <button class="ans-nav-btn ans-prev" id="btn-prev" onclick="navQ(-1)">← Prev</button>
        <button class="ans-nav-btn ans-next" id="btn-next" onclick="navQ(1)">Next →</button>
      </div>
    </div>
  </div>
</div>

<div id="site-footer"></div>
<script src="/scripts/components.js"></script>
<script>
const ANSWERS = ${JSON.stringify(answersData)};
const ALL_SUBS = ${JSON.stringify(allSubs)};
const DIAGRAMS_JS = ${JSON.stringify(Object.fromEntries(Object.entries(DIAGRAMS)))};
const SHARE_URL = '${shareUrl}';
const IS_ENGLISH_SUBJECT = ${subject.code === 'english' ? 'true' : 'false'};
const PAPER_KEY = 'SEE-${paper.year}-${paper.province}-${subject.code}';
const PRINT_BASE = '/api/see-paper-print?year=${paper.year}&province=${paper.province}&subject=${subject.code}';

let LANG = 'en';
let ACTIVE_ID = null;
let OPEN_MOB_ID = null;
const isMobile = () => window.innerWidth <= 768;

// ── SELECT QUESTION (desktop) ──────────────────────────
function selectQ(id) {
  if (isMobile()) {
    // Mobile: accordion
    const sub = document.getElementById('qs-' + id);
    const isOpen = sub.classList.contains('open');
    // Close previous
    if (OPEN_MOB_ID && OPEN_MOB_ID !== id) {
      const prev = document.getElementById('qs-' + OPEN_MOB_ID);
      if (prev) prev.classList.remove('open');
    }
    sub.classList.toggle('open', !isOpen);
    OPEN_MOB_ID = isOpen ? null : id;
    return;
  }

  // Desktop: show in right panel
  ACTIVE_ID = id;
  const d = ANSWERS[id];
  if (!d) return;

  // Update active state
  document.querySelectorAll('.q-sub').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('qs-' + id);
  if (el) { el.classList.add('active'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }

  document.getElementById('ans-empty').style.display = 'none';
  document.getElementById('ans-nav').style.display = 'flex';
  const content = document.getElementById('ans-content');
  content.classList.add('show');

  const showNp = LANG === 'np';
  const ctx = showNp ? (d.ctxNp || d.ctxEn) : (d.ctxEn || '');
  const qText = showNp ? (d.textNp || d.textEn) : (d.textEn || '');
  const diagram = IS_ENGLISH_SUBJECT ? '' : (DIAGRAMS_JS[d.qNum] || '');
  const isNpClass = showNp ? 'ans-ctx-np' : 'ans-ctx';
  const qClass = showNp ? 'ans-q-text-np' : 'ans-q-text';

  content.innerHTML = \`
    <div class="ans-q-badge">Q\${d.qNum}(\${d.subPart}) · \${d.marks} mark\${d.marks!==1?'s':''}</div>
    <div class="ans-question">
      \${ctx ? \`<div class="ans-ctx-label">Context</div><div class="\${isNpClass}">\${ctx}</div>\` : ''}
      \${diagram ? \`<div style="margin:10px 0;">\${diagram}</div>\` : ''}
      <div class="\${qClass}">\${qText}</div>
      <div class="ans-marks">📋 \${d.marks} mark\${d.marks!==1?'s':''}</div>
    </div>
    <div class="ans-box">
      <div class="ans-box-header">
        <span class="ans-box-label">✓ Model Answer</span>
      </div>
      <div class="ans-body">\${d.answer}</div>
      <div class="ans-share-wrap">
        <button class="share-btn" onclick="shareQ('\${id}', event)">↗ Share this Q&A</button>
      </div>
    </div>
  \`;

  const idx = ALL_SUBS.indexOf(id);
  document.getElementById('ans-nav-info').textContent = \`\${idx+1} of \${ALL_SUBS.length}\`;
  document.getElementById('btn-prev').disabled = idx === 0;
  document.getElementById('btn-next').disabled = idx === ALL_SUBS.length - 1;
  content.scrollTop = 0;
}

function navQ(dir) {
  const idx = ALL_SUBS.indexOf(ACTIVE_ID);
  if (idx >= 0) selectQ(ALL_SUBS[idx + dir]);
}

// ── LANGUAGE ──────────────────────────────────────────
function setLang(lang) {
  LANG = lang;
  document.getElementById('btn-en').classList.toggle('active', lang==='en');
  document.getElementById('btn-np').classList.toggle('active', lang==='np');
  const np = lang === 'np';
  document.querySelectorAll('.lang-np').forEach(el => el.style.display = np ? 'inline' : 'none');
  document.querySelectorAll('.lang-en').forEach(el => el.style.display = np ? 'none' : 'inline');
  document.querySelectorAll('.ph-instr-np').forEach(el => el.style.display = np ? 'block' : 'none');
  if (ACTIVE_ID) selectQ(ACTIVE_ID);
}

// ── SHARE ─────────────────────────────────────────────
function shareLink() {
  navigator.clipboard.writeText(SHARE_URL).then(() => {
    const btn = document.getElementById('share-btn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '↗ Share'; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {
    prompt('Copy this link:', SHARE_URL);
  });
  // GA tracking
  if (typeof gtag !== 'undefined') gtag('event', 'share', { paper: PAPER_KEY });
}

function shareQ(id, e) {
  e.stopPropagation();
  const d = ANSWERS[id];
  const url = SHARE_URL;
  navigator.clipboard.writeText(url).then(() => {
    const btn = e.target;
    btn.textContent = '✓ Link copied!';
    setTimeout(() => { btn.textContent = '↗ Share this Q&A'; }, 2000);
  }).catch(() => { prompt('Copy this link:', url); });
}

// ── DOWNLOAD PDF ──────────────────────────────────────
function toggleDl() {
  const dd = document.getElementById('dl-dd');
  if (dd) dd.classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.tb-dl-wrap')) document.getElementById('dl-dd').classList.remove('open');
});

function downloadPDF(lang) {
  document.getElementById('dl-dd').classList.remove('open');
  // GA tracking
  if (typeof gtag !== 'undefined') gtag('event', 'pdf_download', { paper: PAPER_KEY, language: lang });
  // Open dedicated print page in new tab — fonts load correctly, clean output
  window.open(PRINT_BASE + '&lang=' + lang, '_blank');
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set layout height accounting for nav + topbar
  function setLayoutHeight() {
    const nav = document.getElementById('site-nav');
    const topbar = document.querySelector('.topbar');
    const navH = nav ? nav.offsetHeight : 0;
    const topbarH = topbar ? topbar.offsetHeight : 56;
    const layout = document.querySelector('.paper-layout');
    const qPanel = document.getElementById('q-panel');
    const ansPanel = document.getElementById('ans-panel');
    if (layout) {
      const h = window.innerHeight - navH - topbarH;
      layout.style.height = h + 'px';
      if (qPanel) qPanel.style.maxHeight = h + 'px';
      if (ansPanel) ansPanel.style.height = h + 'px';
    }
  }
  // Run after nav loads (components.js injects it)
  setTimeout(setLayoutHeight, 300);
  window.addEventListener('resize', setLayoutHeight);

  // Auto-select first question on desktop
  if (!isMobile() && ALL_SUBS.length > 0) {
    selectQ(ALL_SUBS[0]);
  }
});
</script>
</body>
</html>`;
}

export default async function handler(req, res) {
  try {
    let { year, province, subject } = req.query;

    if (!year || !province || !subject) {
      const match = (req.url||'').match(/\/see\/past-papers\/(\d+)\/([^\/\?]+)\/([^\/\?]+)/);
      if (match) { year=year||match[1]; province=province||match[2]; subject=subject||match[3]; }
    }

    if (!year || !province || !subject) {
      return res.status(400).send(`Missing: year=${year} province=${province} subject=${subject}`);
    }

    const subjects = await fetchFromSupabase(`/exam_subjects?code=eq.${subject.toLowerCase()}&select=id,name,code`);
    if (!subjects[0]) return res.status(404).send(`Subject not found: ${subject}`);
    const subjectData = subjects[0];

    const provinceName = province.charAt(0).toUpperCase() + province.slice(1).toLowerCase();
    const papers = await fetchFromSupabase(`/past_papers?subject_id=eq.${subjectData.id}&year=eq.${year}&province=eq.${provinceName}&select=*`);
    if (!papers[0]) return res.status(404).send(`Paper not found: ${year}/${provinceName}/${subject}`);
    const paper = papers[0];

    const questions = await fetchFromSupabase(`/past_paper_questions?paper_id=eq.${paper.id}&order=question_number.asc,sub_part.asc&select=*`);

    const html = buildHTML({ paper, subject: subjectData, questions });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(html);

  } catch (err) {
    console.error('Paper error:', err);
    return res.status(500).send(`<html><body><h1>Error</h1><p>${err.message}</p><a href="/see.html">Back</a></body></html>`);
  }
}
