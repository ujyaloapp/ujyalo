// ============================================================
// UJYALO — SEE PAPER PAGE (SSR)
// Route: /api/see-paper?year=&province=&subject=
// Design: ujyalo-complete-spec.pdf
// Modes: Overview → Read / Check / Step
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

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

// Subject config — colours, icons, Nepali names
const SUBJECT_CONFIG = {
  maths:   { accent:'#1a6fff', light:'#e8f0ff', icon:'∫',  np:'गणित' },
  science: { accent:'#38c9b0', light:'#e0f7f2', icon:'⚗',  np:'विज्ञान' },
  english: { accent:'#f59c1a', light:'#fff4e0', icon:'Aa', np:'अंग्रेजी' },
  nepali:  { accent:'#e84393', light:'#ffeaf5', icon:'क',  np:'नेपाली' },
  social:  { accent:'#7c3aed', light:'#f0ebff', icon:'◉',  np:'सामाजिक' },
  hpe:     { accent:'#ef4444', light:'#fff0f0', icon:'♡',  np:'स्वास्थ्य' },
};

// Province Nepali names
const PROV_CONFIG = {
  Koshi:         { np:'कोशी',         num:1, col:'#1a6fff' },
  Madhesh:       { np:'मधेश',          num:2, col:'#38c9b0' },
  Bagmati:       { np:'बागमती',        num:3, col:'#f59c1a' },
  Gandaki:       { np:'गण्डकी',        num:4, col:'#e84393' },
  Lumbini:       { np:'लुम्बिनी',      num:5, col:'#7c3aed' },
  Karnali:       { np:'कर्णाली',       num:6, col:'#ef4444' },
  Sudurpashchim: { np:'सुदूरपश्चिम',   num:7, col:'#22c55e' },
};
const PROV_NP = Object.fromEntries(Object.entries(PROV_CONFIG).map(([k,v])=>[k,v.np]));

function buildHTML({ paper, subject, questions }) {
  const cfg = SUBJECT_CONFIG[subject.code] || SUBJECT_CONFIG.maths;
  const isEnglish = subject.code === 'english';
  const yearAD = parseInt(paper.year) - 56;
  const provNp = PROV_NP[paper.province] || paper.province;

  const title = `SEE ${paper.year} ${paper.province} — ${subject.name} Past Paper | ujyalo`;
  const description = `Free SEE ${paper.year} ${paper.province} ${subject.name} past paper with model answers. All 7 provinces. Download PDF free — ujyalo.app`;
  const canonicalUrl = `https://ujyalo.app/see/past-papers/${paper.year}/${paper.province}/${subject.code}`;

  // ── Group questions by number ──────────────────────────
  const groups = {};
  questions.forEach(q => {
    const n = q.question_number;
    if (!groups[n]) groups[n] = { parent: null, subs: [] };
    if (!q.sub_part) groups[n].parent = q;
    else groups[n].subs.push(q);
  });

  const groupEntries = Object.entries(groups)
    .sort((a,b) => parseInt(a[0]) - parseInt(b[0]));

  const totalQuestions = groupEntries.length;
  const totalMarks = paper.total_marks || 75;

  // ── Overview stats from questions data ─────────────────
  const provCfg = PROV_CONFIG[paper.province] || { np: paper.province, num: 1, col: cfg.accent };
  const uniqueTopics = [...new Set(questions.map(q=>q.topic).filter(Boolean))].slice(0,4);
  const diffCounts = { Easy:0, Medium:0, Hard:0 };
  questions.forEach(q => { if(q.difficulty && diffCounts[q.difficulty]!==undefined) diffCounts[q.difficulty]++; });
  const hasDifficulty = diffCounts.Easy+diffCounts.Medium+diffCounts.Hard > 0;
  const totalSubs = questions.filter(q=>q.sub_part).length;

  // ── Schema.org ─────────────────────────────────────────
  const faqItems = questions
    .filter(q => q.sub_part && q.answer_text && q.question_text_english)
    .slice(0, 10)
    .map(q => ({
      "@type":"Question",
      "name": `SEE ${paper.year} Q${q.question_number}(${q.sub_part}): ${q.question_text_english.substring(0,100)}`,
      "acceptedAnswer":{"@type":"Answer","text":q.answer_text.substring(0,300)}
    }));
  const schema = JSON.stringify({
    "@context":"https://schema.org",
    "@graph":[
      {"@type":"Course","name":`SEE ${paper.year} ${paper.province} ${subject.name}`,"description":description,"provider":{"@type":"Organization","name":"ujyalo","url":"https://ujyalo.app"},"url":canonicalUrl},
      {"@type":"FAQPage","mainEntity":faqItems}
    ]
  });

  // ── Build question cards for main area ─────────────────
  let allSubsData = [];
  let qCardsHTML = '';

  groupEntries.forEach(([num, g], idx) => {
    const parent = g.parent;
    const subs = g.subs;
    if (!parent && !subs.length) return;

    const qText = isEnglish
      ? (parent?.question_text_english || '')
      : (parent?.question_text_nepali || parent?.question_text_english || '');
    const diagram = parent?.diagram_svg || null;
    const marks = subs.length
      ? subs.reduce((a,s)=>a+(s.marks||0),0)
      : (parent?.marks||0);
    const topic = parent?.topic || '';
    const difficulty = parent?.difficulty || '';
    const frequency = parent?.frequency || '';

    // Sub parts
    let subsHTML = '';
    subs.forEach(s => {
      const sText = isEnglish
        ? (s.question_text_english||'')
        : (s.question_text_nepali||s.question_text_english||'');
      const sid = `q-${num}-${s.sub_part}`;
      allSubsData.push({
        id: sid,
        qNum: parseInt(num),
        sub: s.sub_part,
        en: s.question_text_english||'',
        np: s.question_text_nepali||'',
        answer: s.answer_text||'',
        steps: s.steps_en||null,
        marks: s.marks||0,
        topic: s.topic||topic||'',
        difficulty: s.difficulty||difficulty||'',
        frequency: s.frequency||frequency||'',
        opts: s.opts_en||null,
        correct: s.correct_opt??null,
        color: cfg.accent,
      });

      // MCQ vs written
      let optionsHTML = '';
      if (s.opts_en) {
        const opts = Array.isArray(s.opts_en) ? s.opts_en : JSON.parse(s.opts_en);
        optionsHTML = '<div class="mcq-grid">' + opts.map(function(o,oi){
          return '<button class="mcq-opt" onclick="pickOpt(this,'+(s.correct_opt??-1)+','+oi+')">'+esc(o)+'</button>';
        }).join('') + '</div>';
      }

      subsHTML += `
      <div class="sub-item" id="${sid}">
        <div class="sub-hd">
          <span class="sub-ltr" style="background:${cfg.accent}18;color:${cfg.accent};">${esc(s.sub_part)}</span>
          <span class="sub-marks">${s.marks||0}m</span>
          <button class="bk-btn" onclick="toggleBookmark(this,'${sid}')" title="Bookmark">🔖</button>
        </div>
        <div class="sub-text">${esc(sText)}</div>
        ${optionsHTML}
        <button class="ans-btn" onclick="openAnswer('${sid}')">
          <span>💡</span> See answer &amp; explanation
        </button>
      </div>`;
    });

    // If no subs, treat parent itself as answerable
    if (!subs.length && parent) {
      const pid = `q-${num}-main`;
      allSubsData.push({
        id: pid,
        qNum: parseInt(num),
        sub: null,
        en: parent.question_text_english||'',
        np: parent.question_text_nepali||'',
        answer: parent.answer_text||'',
        steps: parent.steps_en||null,
        marks: parent.marks||0,
        topic: parent.topic||'',
        difficulty: parent.difficulty||'',
        frequency: parent.frequency||'',
        opts: parent.opts_en||null,
        correct: parent.correct_opt??null,
        color: cfg.accent,
      });

      let optionsHTML = '';
      if (parent.opts_en) {
        const opts = Array.isArray(parent.opts_en) ? parent.opts_en : JSON.parse(parent.opts_en);
        optionsHTML = '<div class="mcq-grid">' + opts.map(function(o,oi){
          return '<button class="mcq-opt" onclick="pickOpt(this,'+(parent.correct_opt??-1)+','+oi+')">'+esc(o)+'</button>';
        }).join('') + '</div>';
      }

      subsHTML = `
      <div class="sub-item" id="${pid}">
        ${optionsHTML}
        <button class="ans-btn" onclick="openAnswer('${pid}')">
          <span>💡</span> See answer &amp; explanation
        </button>
      </div>`;
    }

    qCardsHTML += `
    <div class="qcard" id="qcard-${num}" onclick="qCardClick(${num})">
      <div class="qcard-strip" id="strip-${num}"></div>
      <div class="qcard-head">
        <div class="qch-l">
          <div class="qnum" id="qnum-${num}" style="background:${cfg.accent};">${num}</div>
          ${topic ? `<span class="qtag" style="background:${cfg.accent}18;color:${cfg.accent};">${esc(topic)}</span>` : ''}
          ${(function(){
            if(!difficulty) return '';
            const bg = difficulty==='Hard'?'rgba(239,68,68,.1)':difficulty==='Medium'?'rgba(245,156,26,.1)':'rgba(34,197,94,.1)';
            const col2 = difficulty==='Hard'?'#ef4444':difficulty==='Medium'?'#f59c1a':'#22c55e';
            return '<span class="qtag" style="background:'+bg+';color:'+col2+';">'+esc(difficulty)+'</span>';
          })()}
          ${frequency ? `<span class="qtag" style="background:var(--bg);color:var(--muted);">${esc(frequency)}</span>` : ''}
        </div>
        <div class="qch-r">
          <span class="qmarks">${marks}m</span>
          <button class="done-btn undone" id="done-${num}" onclick="event.stopPropagation();markDone(${num})">Mark done</button>
        </div>
      </div>
      <div class="qcard-body">
        ${qText ? `<div class="q-text">${esc(qText)}</div>` : ''}
        ${diagram ? `<div class="q-diagram">${diagram}</div>` : ''}
        ${subsHTML}
      </div>
    </div>`;
  });

  // ── Sidebar question rows ──────────────────────────────
  let sidebarHTML = groupEntries.map(([num, g]) => {
    const parent = g.parent;
    const topic = parent?.topic || '';
    const marks = g.subs.length
      ? g.subs.reduce((a,s)=>a+(s.marks||0),0)
      : (parent?.marks||0);
    return `
    <div class="sb-row" id="sb-${num}" onclick="scrollToQ(${num})">
      <div class="sb-num" id="sb-num-${num}" style="background:${cfg.accent}18;color:${cfg.accent};">${num}</div>
      <div class="sb-info">
        <div class="sb-topic">${esc(topic)||'Question '+num}</div>
        <div class="sb-meta">${marks}m</div>
      </div>
      <div class="sb-dot" id="sb-dot-${num}" style="background:${cfg.accent};"></div>
    </div>`;
  }).join('');

  // ── Overview mode cards ────────────────────────────────
  const overviewCards = [
    { mode:'read',    icon:'📖', title:'Read full paper',        desc:'Browse all questions — answers hidden', col:'#1a6fff' },
    { mode:'check',   icon:'✅', title:'Check my answers',       desc:"I've already attempted it — show answers", col:'#38c9b0' },
    { mode:'step',    icon:'⚡', title:'Question by question',    desc:'One question at a time — reveal and move on', col:'#f59c1a' },
    { mode:'download',icon:'📥', title:'Download PDF',           desc:'Nepali, English, or both languages', col:'#7c3aed' },
  ].map(function(c){
    return '<button class="ov-card" data-mode="'+c.mode+'" onclick="enterMode(this.dataset.mode)" style="--mc:'+c.col+';">'
      + '<div class="ov-icon" style="background:'+c.col+'18;color:'+c.col+';">'+c.icon+'</div>'
      + '<div class="ov-info">'
      + '<div class="ov-title">'+c.title+'</div>'
      + '<div class="ov-desc">'+c.desc+'</div>'
      + '</div>'
      + '<div class="ov-arr" style="color:'+c.col+';">&#8250;</div>'
      + '</button>';
  }).join('');

  // ── Step mode question dots ────────────────────────────
  const stepDots = groupEntries.map(function([num],i){
    return '<div class="step-dot" id="sdot-'+num+'" onclick="goStep('+parseInt(num)+')" title="Q'+num+'"></div>';
  }).join('');

  // ── Serialise data for client ──────────────────────────
  const ANSWERS_JSON = JSON.stringify(allSubsData);
  const GROUPS_JSON = JSON.stringify(groupEntries.map(([n,g])=>({
    num: parseInt(n),
    topic: g.parent?.topic||'',
    marks: g.subs.length ? g.subs.reduce((a,s)=>a+(s.marks||0),0) : (g.parent?.marks||0),
  })));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<link rel="canonical" href="${esc(canonicalUrl)}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${esc(canonicalUrl)}"/>
<script type="application/ld+json">${schema}<\/script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4CPQWFLERD"><\/script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-4CPQWFLERD');<\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --navy:#0d1b3e;--navy2:#162550;--blue:#1a6fff;--teal:#38c9b0;--orange:#f59c1a;
  --green:#22c55e;--red:#ef4444;--purple:#7c3aed;
  --ink:#0f1923;--muted:#5c6a80;--faint:#94a3b8;--line:#e8edf5;--bg:#f3f5fb;--card:#fff;
  --accent:${cfg.accent};
}
*{font-family:'DM Sans',sans-serif;}
body{background:var(--bg);color:var(--ink);height:100vh;display:flex;flex-direction:column;overflow:hidden;}

/* ── HEADER ── */
.hdr{background:var(--navy);flex-shrink:0;z-index:20;position:sticky;top:0;}
.hdr-main{padding:10px 22px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(255,255,255,.08);}
.hdr-l{display:flex;align-items:center;gap:12px;}
.back-btn{background:rgba(255,255,255,.08);border:none;border-radius:9px;padding:7px 13px;color:rgba(255,255,255,.85);font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;transition:background .15s;}
.back-btn:hover{background:rgba(255,255,255,.14);}
.paper-id{display:flex;align-items:center;gap:10px;}
.subj-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:17px;background:${cfg.light};color:${cfg.accent};}
.paper-nm{font-family:'Fraunces',serif;font-size:16px;font-weight:900;color:#fff;}
.paper-mt{font-size:11px;color:#8898b8;margin-top:1px;}
.hdr-r{display:flex;align-items:center;gap:8px;}
.prog-pill{background:rgba(255,255,255,.08);border-radius:99px;padding:5px 11px;display:flex;align-items:center;gap:7px;}
.prog-track{width:34px;height:3px;background:rgba(255,255,255,.15);border-radius:99px;overflow:hidden;}
.prog-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--blue),var(--teal));transition:width .4s;}
.prog-pct{font-size:11px;font-weight:700;color:rgba(255,255,255,.7);}
.lang-tog{display:flex;background:rgba(255,255,255,.1);border-radius:10px;padding:3px;gap:2px;${isEnglish?'display:none!important;':''}}
.lt-btn{padding:5px 12px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;}
.lt-btn.act{background:#fff;color:var(--navy);}
.lt-btn.off{background:transparent;color:rgba(255,255,255,.5);}
.share-btn{background:rgba(255,255,255,.08);border:none;border-radius:9px;padding:7px 12px;color:rgba(255,255,255,.8);font-size:13px;cursor:pointer;transition:background .15s;}
.share-btn:hover{background:rgba(255,255,255,.14);}
.dl-btn{background:var(--orange);border:none;border-radius:10px;padding:7px 15px;font-size:13px;font-weight:700;color:#fff;cursor:pointer;display:flex;align-items:center;gap:5px;transition:opacity .15s;}
.dl-btn:hover{opacity:.88;}

/* MODE TABS */
.mode-tabs{display:flex;padding:0 22px;border-bottom:1px solid rgba(255,255,255,.06);}
.mtab{padding:9px 16px;border:none;background:transparent;border-bottom:2.5px solid transparent;font-size:13px;font-weight:400;color:rgba(255,255,255,.45);cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:5px;white-space:nowrap;}
.mtab:hover{color:rgba(255,255,255,.75);}
.mtab.act{color:#fff;font-weight:700;border-bottom-color:#fff;}

/* ── BODY ── */
.body{display:flex;flex:1;overflow:hidden;}

/* SIDEBAR */
.sb{width:230px;flex-shrink:0;background:var(--card);border-right:1px solid var(--line);display:flex;flex-direction:column;overflow:hidden;}
.sb-hd{padding:12px 14px;border-bottom:1px solid var(--line);flex-shrink:0;}
.sb-lbl{font-size:11px;font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;}
.sb-pt{height:3px;background:var(--line);border-radius:99px;overflow:hidden;margin-bottom:4px;}
.sb-pf{height:100%;background:linear-gradient(90deg,var(--accent),var(--teal));border-radius:99px;transition:width .4s;}
.sb-cnt{font-size:11px;color:var(--faint);}
.sb-scroll{flex:1;overflow-y:auto;}
.sb-scroll::-webkit-scrollbar{width:2px;}
.sb-scroll::-webkit-scrollbar-thumb{background:var(--line);}
.sb-row{padding:10px 14px;cursor:pointer;border-left:3px solid transparent;border-bottom:1px solid var(--line);transition:all .12s;display:flex;align-items:center;gap:8px;}
.sb-row:hover{background:var(--bg);}
.sb-row.act{background:${cfg.accent}10;border-left-color:${cfg.accent};}
.sb-row.done{background:rgba(34,197,94,.04);}
.sb-num{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:900;font-size:11px;flex-shrink:0;transition:all .15s;}
.sb-info{flex:1;min-width:0;}
.sb-topic{font-size:12px;font-weight:500;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sb-row.act .sb-topic{font-weight:700;}
.sb-meta{font-size:10px;color:var(--faint);margin-top:1px;}
.sb-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;opacity:0;}
.sb-row.act .sb-dot{opacity:1;}

/* MAIN AREA */
.main-area{flex:1;display:flex;overflow:hidden;}
.paper-scroll{flex:1;overflow-y:auto;background:var(--bg);}
.paper-scroll::-webkit-scrollbar{width:3px;}
.paper-scroll::-webkit-scrollbar-thumb{background:#dde3f0;border-radius:99px;}

/* INFO STRIP */
.info-strip{background:var(--card);border-bottom:1px solid var(--line);padding:9px 22px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.info-item{display:flex;gap:4px;align-items:center;}
.info-k{font-size:12px;color:var(--faint);}
.info-v{font-size:12px;font-weight:700;color:var(--ink);}
.info-sep{color:var(--line);font-size:16px;}

/* QUESTION CARD */
.qcard{background:var(--card);border:1.5px solid var(--line);border-radius:16px;margin-bottom:10px;overflow:hidden;transition:border-color .15s;cursor:pointer;}
.qcard:hover{border-color:${cfg.accent}44;}
.qcard.act{border-color:${cfg.accent}88;}
.qcard.done-card{border-color:rgba(34,197,94,.4);}
.qcard-strip{height:3px;width:0;transition:width .4s;}
.qcard-head{padding:10px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;border-bottom:1px solid var(--line);}
.qch-l{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.qnum{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:900;font-size:13px;color:#fff;flex-shrink:0;}
.qtag{font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;}
.qch-r{display:flex;align-items:center;gap:8px;}
.qmarks{font-size:12px;font-weight:700;color:var(--muted);}
.done-btn{border-radius:8px;padding:5px 11px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid;transition:all .15s;}
.done-btn.undone{background:transparent;border-color:var(--line);color:var(--faint);}
.done-btn.done{background:rgba(34,197,94,.15);border-color:var(--green);color:var(--green);}
.qcard-body{padding:14px 16px;}
.q-text{font-size:15px;color:var(--ink);line-height:1.75;margin-bottom:12px;}
.q-diagram{margin:10px 0;overflow-x:auto;}

/* SUB PARTS */
.sub-item{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-bottom:8px;}
.sub-item:last-child{margin-bottom:0;}
.sub-hd{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.sub-ltr{font-size:11px;font-weight:700;padding:3px 9px;border-radius:6px;}
.sub-marks{font-size:11px;color:var(--faint);margin-left:auto;}
.bk-btn{background:none;border:none;cursor:pointer;font-size:14px;opacity:.3;transition:opacity .15s;padding:2px;}
.bk-btn:hover,.bk-btn.saved{opacity:1;}
.sub-text{font-size:14px;color:var(--ink);line-height:1.7;margin-bottom:10px;}

/* MCQ */
.mcq-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
.mcq-opt{border:1.5px solid var(--line);border-radius:10px;padding:10px 13px;font-size:14px;color:var(--ink);background:var(--bg);cursor:pointer;text-align:left;transition:all .14s;display:flex;justify-content:space-between;}
.mcq-opt:hover{border-color:${cfg.accent};background:${cfg.accent}08;}
.mcq-opt.correct{background:rgba(34,197,94,.12);border-color:var(--green);color:var(--green);font-weight:700;}
.mcq-opt.wrong{background:rgba(239,68,68,.1);border-color:var(--red);color:var(--red);}

/* ANSWER BUTTON */
.ans-btn{width:100%;background:transparent;border:1.5px dashed ${cfg.accent}80;border-radius:12px;padding:11px 16px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:14px;font-weight:700;color:${cfg.accent};cursor:pointer;margin-top:8px;transition:all .15s;}
.ans-btn:hover{background:${cfg.accent}08;border-style:solid;}

/* RIGHT PANEL */
.rp{width:380px;flex-shrink:0;border-left:1px solid var(--line);background:var(--bg);display:flex;flex-direction:column;overflow:hidden;}
.rp-hd{padding:13px 18px;background:var(--card);border-bottom:1px solid var(--line);flex-shrink:0;position:sticky;top:0;z-index:2;}
.rp-lbl{font-size:11px;font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:.8px;}
.rp-q{font-size:13px;font-weight:700;margin-top:3px;color:var(--ink);}
.rp-scroll{flex:1;overflow-y:auto;padding:18px;}
.rp-scroll::-webkit-scrollbar{width:3px;}
.rp-scroll::-webkit-scrollbar-thumb{background:#dde3f0;border-radius:99px;}
.rp-empty{text-align:center;padding:40px 20px;color:var(--muted);}
.rp-empty-ico{font-size:32px;margin-bottom:10px;}

/* ANSWER PANEL */
.ans-final{border-radius:14px;padding:15px 17px;margin-bottom:16px;}
.ans-check{display:flex;align-items:center;gap:7px;margin-bottom:6px;}
.ans-check-circle{width:20px;height:20px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;}
.ans-lbl{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.8px;}
.ans-text{font-size:15px;font-weight:700;color:var(--ink);line-height:1.6;}
.steps-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;}
.step-item{display:flex;gap:12px;padding-bottom:14px;opacity:.18;transition:opacity .3s;}
.step-item.shown{opacity:1;}
.step-col{display:flex;flex-direction:column;align-items:center;}
.step-circle{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;transition:background .25s;}
.step-line{width:1.5px;flex:1;min-height:12px;margin-top:4px;transition:background .25s;}
.step-text{font-size:14px;color:var(--ink);line-height:1.65;padding-top:2px;flex:1;}
.next-btn{width:100%;border:none;border-radius:12px;padding:13px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;margin-bottom:10px;transition:opacity .15s;}
.next-btn:hover{opacity:.88;}
.replay-btn{width:100%;background:transparent;border:1.5px solid var(--line);border-radius:12px;padding:11px;font-size:13px;font-weight:700;color:var(--faint);cursor:pointer;margin-bottom:10px;}
.re-btn{width:100%;background:transparent;border:1.5px dashed rgba(124,58,237,.45);border-radius:12px;padding:11px;font-size:13px;font-weight:700;color:var(--purple);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;}
.re-btn:hover{background:rgba(124,58,237,.06);border-style:solid;}
.re-box{border-radius:10px;padding:12px 14px;background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.18);margin-top:8px;display:none;}
.re-box-lbl{font-size:10px;font-weight:700;color:var(--purple);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
.re-box-text{font-size:13px;color:var(--ink);line-height:1.65;}

/* ── OVERVIEW SCREEN ── */
.ov-wrap{flex:1;display:flex;overflow:hidden;}
.ov-left{width:260px;flex-shrink:0;background:var(--navy);display:flex;flex-direction:column;overflow-y:auto;border-right:1px solid rgba(255,255,255,.06);}
.ov-left::-webkit-scrollbar{width:0;}
.ov-subj-row{padding:20px 18px 16px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:12px;}
.ov-subj-ico{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:21px;flex-shrink:0;background:${cfg.light};color:${cfg.accent};}
.ov-subj-nm{font-family:'Fraunces',serif;font-size:18px;font-weight:900;color:#fff;}
.ov-subj-nm em{font-style:italic;color:${cfg.accent};}
.ov-subj-yr{font-size:11px;color:#8898b8;margin-top:2px;}
.ov-section{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.07);}
.ov-sec-lbl{font-size:10px;font-weight:700;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;}
.trail{display:flex;flex-direction:column;}
.trail-row{display:flex;align-items:center;gap:9px;padding:5px 0;}
.trail-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.trail-dot.done{background:#22c55e;}
.trail-dot.cur{background:${cfg.accent};box-shadow:0 0 0 3px ${cfg.accent}30;}
.trail-line{width:1px;height:10px;background:rgba(255,255,255,.1);margin:0 0 0 3.5px;}
.trail-key{font-size:12px;color:rgba(255,255,255,.5);}
.trail-key.done{color:rgba(255,255,255,.7);}
.trail-key.cur{color:#fff;font-weight:700;}
.trail-val{font-size:11px;font-weight:700;margin-left:auto;}
.prov-pill{background:${cfg.accent}18;border:1px solid ${cfg.accent}33;border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:10px;margin-top:2px;}
.prov-num{width:30px;height:30px;border-radius:8px;background:${cfg.accent};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
.prov-nm{font-size:13px;font-weight:700;color:#fff;}
.prov-np{font-size:10px;color:#8898b8;margin-top:1px;}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.ov-stat{background:rgba(255,255,255,.06);border-radius:8px;padding:8px 10px;}
.ov-stat-n{font-family:'Fraunces',serif;font-size:16px;font-weight:900;color:#fff;}
.ov-stat-l{font-size:9px;color:#8898b8;text-transform:uppercase;letter-spacing:.5px;margin-top:1px;}
.topic-pills{display:flex;flex-wrap:wrap;gap:5px;}
.topic-pill{font-size:10px;font-weight:700;padding:3px 8px;border-radius:99px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);}
.diff-bars{display:flex;flex-direction:column;gap:5px;}
.diff-row{display:flex;align-items:center;gap:7px;}
.diff-lbl{font-size:10px;font-weight:700;width:40px;color:rgba(255,255,255,.5);}
.diff-track{flex:1;height:5px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;}
.diff-fill{height:100%;border-radius:99px;}
.diff-cnt{font-size:10px;font-weight:700;color:rgba(255,255,255,.4);width:20px;text-align:right;}
.ov-right{flex:1;background:var(--bg);overflow-y:auto;padding:24px 22px;}
.ov-how-lbl{font-size:11px;font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px;}
.ov-cards{display:flex;flex-direction:column;gap:8px;}
.ov-card{background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:15px 17px;display:flex;align-items:center;gap:13px;cursor:pointer;text-align:left;width:100%;transition:all .18s cubic-bezier(.22,.68,0,1.2);}
.ov-card:hover{border-color:var(--mc);transform:translateY(-2px);}
.ov-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.ov-info{flex:1;}
.ov-title{font-size:14px;font-weight:700;color:var(--ink);}
.ov-desc{font-size:12px;color:var(--muted);margin-top:2px;}
.ov-arr{font-size:18px;font-weight:700;}
.ov-tip{margin-top:16px;background:var(--card);border-radius:12px;padding:12px 14px;border:1px solid var(--line);font-size:12px;color:var(--muted);line-height:1.6;}
.ov-tip strong{color:var(--ink);}

/* ── STEP MODE ── */
.step-strip{background:var(--card);border-bottom:1px solid var(--line);padding:10px 22px;display:flex;align-items:center;gap:8px;flex-shrink:0;}
.step-dot{flex:1;height:5px;border-radius:99px;background:var(--line);cursor:pointer;transition:background .2s;}
.step-dot.act{background:${cfg.accent};}
.step-dot.done{background:rgba(34,197,94,.75);}
.step-counter{font-size:12px;font-weight:700;color:var(--muted);flex-shrink:0;margin-left:6px;}
.step-main{flex:1;overflow-y:auto;background:var(--bg);padding:22px;}
.step-qcard{background:var(--card);border:1.5px solid ${cfg.accent}44;border-radius:18px;padding:22px 24px;max-width:640px;margin:0 auto 20px;}
.step-qnum{font-family:'Fraunces',serif;font-size:36px;font-weight:900;color:${cfg.accent};margin-bottom:8px;}
.step-qtext{font-size:16px;color:var(--ink);line-height:1.8;}
.step-nav{background:var(--card);border-top:1px solid var(--line);padding:12px 22px;display:flex;align-items:center;gap:12px;flex-shrink:0;}
.step-prev{flex:1;background:var(--card);border:1.5px solid var(--line);border-radius:10px;padding:12px;font-size:13px;font-weight:600;color:var(--ink);cursor:pointer;transition:all .15s;}
.step-prev:disabled{background:var(--bg);color:var(--faint);cursor:default;}
.step-ctr{font-size:12px;color:var(--faint);font-weight:700;flex-shrink:0;}
.step-next{flex:1;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;color:#fff;background:${cfg.accent};cursor:pointer;transition:opacity .15s;}
.step-next:disabled{background:var(--bg);color:var(--faint);cursor:default;}

/* ── DOWNLOAD MODAL ── */
.dl-overlay{position:fixed;inset:0;background:rgba(13,27,62,.6);backdrop-filter:blur(4px);z-index:400;display:none;align-items:center;justify-content:center;}
.dl-overlay.open{display:flex;}
.dl-modal{background:var(--card);border-radius:20px;padding:24px;max-width:420px;width:calc(100% - 32px);animation:fadeDown .22s ease;}
@keyframes fadeDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.dl-modal-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:18px;}
.dl-modal-title{font-family:'Fraunces',serif;font-size:18px;font-weight:900;color:var(--ink);}
.dl-modal-sub{font-size:12px;color:var(--faint);margin-top:3px;}
.dl-x{background:var(--bg);border:none;border-radius:8px;width:32px;height:32px;font-size:16px;cursor:pointer;flex-shrink:0;}
.dl-opts{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}
.dl-opt{background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:16px 18px;display:flex;align-items:center;gap:14px;cursor:pointer;width:100%;text-align:left;transition:all .15s;}
.dl-opt:hover{background:var(--card);border-color:${cfg.accent}44;}
.dl-opt.selected{background:rgba(34,197,94,.1);border-color:var(--green);}
.dl-flag{font-size:24px;flex-shrink:0;}
.dl-opt-nm{font-size:14px;font-weight:700;color:var(--ink);}
.dl-opt-sub{font-size:12px;color:var(--muted);margin-top:1px;}
.dl-note{background:var(--bg);border-radius:10px;padding:10px 12px;font-size:11px;color:var(--muted);}

/* ── MOBILE DRAWER ── */
.drawer-overlay{position:fixed;inset:0;background:rgba(13,27,62,.55);backdrop-filter:blur(4px);z-index:300;display:none;}
.drawer-overlay.open{display:block;}
.drawer{position:fixed;bottom:0;left:0;right:0;background:var(--card);border-radius:22px 22px 0 0;max-height:82vh;overflow-y:auto;z-index:301;transform:translateY(100%);transition:transform .28s cubic-bezier(.22,.68,0,1.2);}
.drawer.open{transform:translateY(0);}
.drawer-handle{width:36px;height:4px;background:var(--line);border-radius:99px;margin:12px auto 0;}
.drawer-hd{padding:14px 18px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;}
.drawer-q{font-size:13px;font-weight:700;color:var(--ink);}
.drawer-marks{font-size:12px;color:var(--faint);}
.drawer-x{background:var(--bg);border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;color:var(--muted);cursor:pointer;}
.drawer-body{padding:18px;}

/* HIDDEN */
.hidden{display:none!important;}

/* ── MOBILE ── */
@media(max-width:767px){
  .sb{display:none;}
  .rp{display:none;}
  .ov-left{display:none;}
  .hdr-main{padding:8px 14px;}
  .paper-nm{font-size:14px;}
  .paper-mt{display:none;}
  .ov-right{padding:16px;}
  .step-main{padding:14px;}
  .info-strip{padding:8px 14px;}
  .qcard-body{padding:12px 14px;}
  .cpad{padding:12px 14px;}
  .mcq-grid{grid-template-columns:1fr;}
}
</style>
</head>
<body>
<div id="site-nav"></div>

<!-- HEADER -->
<div class="hdr">
  <div class="hdr-main">
    <div class="hdr-l">
      <button class="back-btn" onclick="history.back()">← Back</button>
      <div class="paper-id">
        <div class="subj-ico">${cfg.icon}</div>
        <div>
          <div class="paper-nm">${esc(subject.name)} · SEE ${paper.year}</div>
          <div class="paper-mt">${esc(paper.province)} Province · ${totalMarks} marks · ${paper.duration||'3 hours'}</div>
        </div>
      </div>
    </div>
    <div class="hdr-r">
      <div class="prog-pill">
        <div class="prog-track"><div class="prog-fill" id="prog-fill" style="width:0%"></div></div>
        <span class="prog-pct" id="prog-pct">0%</span>
      </div>
      <div class="lang-tog">
        <button class="lt-btn act" id="lt-en" onclick="setLang('en')">🇬🇧 EN</button>
        <button class="lt-btn off" id="lt-np" onclick="setLang('np')">🇳🇵 NP</button>
      </div>
      <button class="share-btn" onclick="shareUrl()" title="Share">🔗</button>
      <button class="dl-btn" onclick="openDownload()">⬇ PDF</button>
    </div>
  </div>
  <!-- MODE TABS — hidden on overview screen -->
  <div class="mode-tabs hidden" id="mode-tabs">
    <button class="mtab act" onclick="setMode('read',this)">📖 Read</button>
    <button class="mtab" onclick="setMode('check',this)">✅ Check</button>
    <button class="mtab" onclick="setMode('step',this)">⚡ Step</button>
  </div>
</div>

<!-- BODY -->
<div class="body" id="body">

  <!-- OVERVIEW SCREEN -->
  <div class="ov-wrap" id="ov-wrap">

    <!-- LEFT PANEL — journey + paper info -->
    <div class="ov-left">

      <!-- Subject + year -->
      <div class="ov-subj-row">
        <div class="ov-subj-ico">${cfg.icon}</div>
        <div>
          <div class="ov-subj-nm">${esc(subject.name)} <em>/ ${esc(cfg.np||subject.name)}</em></div>
          <div class="ov-subj-yr">SEE ${paper.year} · ${yearAD} AD</div>
        </div>
      </div>

      <!-- Journey trail -->
      <div class="ov-section">
        <div class="ov-sec-lbl">Your selection</div>
        <div class="trail">
          <div class="trail-row">
            <div class="trail-dot done"></div>
            <span class="trail-key done">Subject</span>
            <span class="trail-val" style="color:#22c55e;">${esc(subject.name)} ✓</span>
          </div>
          <div class="trail-line"></div>
          <div class="trail-row">
            <div class="trail-dot done"></div>
            <span class="trail-key done">Year</span>
            <span class="trail-val" style="color:#22c55e;">${paper.year} ✓</span>
          </div>
          <div class="trail-line"></div>
          <div class="trail-row">
            <div class="trail-dot cur"></div>
            <span class="trail-key cur">Province</span>
            <span class="trail-val" style="color:${cfg.accent};">${esc(paper.province)} ●</span>
          </div>
        </div>
        <div class="prov-pill" style="margin-top:12px;">
          <div class="prov-num">P${provCfg.num}</div>
          <div>
            <div class="prov-nm">${esc(paper.province)} Province</div>
            <div class="prov-np">${esc(provNp)} प्रदेश</div>
          </div>
        </div>
      </div>

      <!-- Paper stats -->
      <div class="ov-section">
        <div class="ov-sec-lbl">Paper info</div>
        <div class="stats-grid">
          <div class="ov-stat"><div class="ov-stat-n">${totalQuestions}</div><div class="ov-stat-l">Questions</div></div>
          <div class="ov-stat"><div class="ov-stat-n">${totalMarks}</div><div class="ov-stat-l">Marks</div></div>
          <div class="ov-stat"><div class="ov-stat-n">${paper.duration||'3 hrs'}</div><div class="ov-stat-l">Duration</div></div>
          <div class="ov-stat"><div class="ov-stat-n">${totalSubs||totalQuestions}</div><div class="ov-stat-l">Sub-parts</div></div>
        </div>
      </div>

      <!-- Topics covered -->
      ${uniqueTopics.length ? '<div class="ov-section"><div class="ov-sec-lbl">Topics covered</div><div class="topic-pills">'+uniqueTopics.map(function(t){return '<span class="topic-pill">'+esc(t)+'</span>';}).join('')+'</div></div>' : ''}

      <!-- Difficulty breakdown -->
      ${hasDifficulty ? '<div class="ov-section"><div class="ov-sec-lbl">Difficulty</div><div class="diff-bars"><div class="diff-row"><span class="diff-lbl" style="color:#22c55e;">Easy</span><div class="diff-track"><div class="diff-fill" style="width:'+Math.round((diffCounts.Easy/Math.max(totalSubs,1))*100)+'%;background:#22c55e;"></div></div><span class="diff-cnt">'+diffCounts.Easy+'</span></div><div class="diff-row"><span class="diff-lbl" style="color:#f59c1a;">Medium</span><div class="diff-track"><div class="diff-fill" style="width:'+Math.round((diffCounts.Medium/Math.max(totalSubs,1))*100)+'%;background:#f59c1a;"></div></div><span class="diff-cnt">'+diffCounts.Medium+'</span></div><div class="diff-row"><span class="diff-lbl" style="color:#ef4444;">Hard</span><div class="diff-track"><div class="diff-fill" style="width:'+Math.round((diffCounts.Hard/Math.max(totalSubs,1))*100)+'%;background:#ef4444;"></div></div><span class="diff-cnt">'+diffCounts.Hard+'</span></div></div></div>' : ''}

      <!-- Progress from localStorage -->
      <div class="ov-section" id="ov-prog-section" style="display:none;">
        <div class="ov-sec-lbl">Your progress</div>
        <div style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.25);border-radius:8px;padding:8px 10px;">
          <div style="font-family:'Fraunces',serif;font-size:20px;font-weight:900;color:#22c55e;" id="ov-prog-pct">0%</div>
          <div style="font-size:10px;color:#8898b8;margin-top:1px;" id="ov-prog-lbl">Not started yet</div>
          <div style="margin-top:6px;height:4px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;">
            <div style="height:100%;border-radius:99px;background:#22c55e;transition:width .4s;" id="ov-prog-bar" style="width:0%"></div>
          </div>
        </div>
      </div>

    </div><!-- /ov-left -->

    <!-- RIGHT PANEL — mode selection -->
    <div class="ov-right">
      <div class="ov-how-lbl">How do you want to use this paper?</div>
      <div class="ov-cards">${overviewCards}</div>
      <div class="ov-tip">
        <strong>Tip:</strong> Start with <strong>Read</strong> to get familiar with the paper. Use <strong>Check</strong> after you've attempted it yourself. Use <strong>Step</strong> for guided question-by-question practice.
      </div>
    </div><!-- /ov-right -->

  </div><!-- /ov-wrap -->

  <!-- PAPER INSIDE (hidden until mode selected) -->
  <div style="flex:1;display:flex;overflow:hidden;" id="paper-wrap" class="hidden">

    <!-- SIDEBAR -->
    <div class="sb">
      <div class="sb-hd">
        <div class="sb-lbl">All Questions</div>
        <div class="sb-pt"><div class="sb-pf" id="sb-fill" style="width:0%"></div></div>
        <div class="sb-cnt" id="sb-cnt">0 / ${totalQuestions} reviewed</div>
      </div>
      <div class="sb-scroll">${sidebarHTML}</div>
    </div>

    <!-- MAIN -->
    <div class="main-area">

      <!-- READ / CHECK modes -->
      <div class="paper-scroll" id="read-check-scroll">
        <!-- Info strip -->
        <div class="info-strip">
          <div class="info-item"><span class="info-k">Marks</span><span class="info-v">${totalMarks}</span></div>
          <span class="info-sep">|</span>
          <div class="info-item"><span class="info-k">Time</span><span class="info-v">${paper.duration||'3 hours'}</span></div>
          <span class="info-sep">|</span>
          <div class="info-item"><span class="info-k">Questions</span><span class="info-v">${totalQuestions}</span></div>
          <span class="info-sep">|</span>
          <div class="info-item"><span class="info-k">Language</span><span class="info-v" id="lang-indicator">${isEnglish?'English':'Nepali / English'}</span></div>
        </div>
        <!-- Question cards -->
        <div style="padding:14px 16px;" id="qcards">${qCardsHTML}</div>
      </div>

      <!-- STEP mode -->
      <div class="hidden" id="step-wrap" style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
        <div class="step-strip">
          ${stepDots}
          <span class="step-counter" id="step-ctr">1 / ${totalQuestions}</span>
        </div>
        <div class="step-main" id="step-main">
          <!-- Filled by JS -->
        </div>
        <div class="step-nav">
          <button class="step-prev" id="sp-prev" onclick="stepPrev()" disabled>← Previous</button>
          <span class="step-ctr" id="step-mid">Q1 of ${totalQuestions}</span>
          <button class="step-next" id="sp-next" onclick="stepNext()" style="background:${cfg.accent};">Next →</button>
        </div>
      </div>

    </div><!-- /main-area -->

    <!-- RIGHT PANEL -->
    <div class="rp" id="right-panel">
      <div class="rp-hd">
        <div class="rp-lbl">Answer &amp; Explanation</div>
        <div class="rp-q" id="rp-q">Select a question to see the answer</div>
      </div>
      <div class="rp-scroll" id="rp-scroll">
        <div class="rp-empty">
          <div class="rp-empty-ico">👆</div>
          <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">Click any question</div>
          <div style="font-size:13px;">The answer and step-by-step explanation will appear here.</div>
        </div>
      </div>
    </div>

  </div><!-- /paper-wrap -->

</div><!-- /body -->

<!-- DOWNLOAD MODAL -->
<div class="dl-overlay" id="dl-overlay" onclick="if(event.target===this)closeDownload()">
  <div class="dl-modal">
    <div class="dl-modal-hd">
      <div>
        <div class="dl-modal-title">Download PDF</div>
        <div class="dl-modal-sub">SEE ${paper.year} · ${esc(paper.province)} · ${esc(subject.name)}</div>
      </div>
      <button class="dl-x" onclick="closeDownload()">✕</button>
    </div>
    <div class="dl-opts">
      ${isEnglish ? `
      <button class="dl-opt" onclick="downloadPDF('en',this)" data-flag="🇬🇧">
        <span class="dl-flag">🇬🇧</span>
        <div><div class="dl-opt-nm">English PDF</div><div class="dl-opt-sub">Questions in English only</div></div>
      </button>` : `
      <button class="dl-opt" onclick="downloadPDF('np',this)" data-flag="🇳🇵">
        <span class="dl-flag">🇳🇵</span>
        <div><div class="dl-opt-nm">Nepali PDF</div><div class="dl-opt-sub">Original script — नेपाली भाषामा मात्र</div></div>
      </button>
      <button class="dl-opt" onclick="downloadPDF('en',this)" data-flag="🇬🇧">
        <span class="dl-flag">🇬🇧</span>
        <div><div class="dl-opt-nm">English PDF</div><div class="dl-opt-sub">Translated version</div></div>
      </button>
      <button class="dl-opt" onclick="downloadPDF('both',this)" data-flag="📄">
        <span class="dl-flag">📄</span>
        <div><div class="dl-opt-nm">Both languages</div><div class="dl-opt-sub">Nepali then English in one PDF</div></div>
      </button>`}
    </div>
    <div class="dl-note">🔒 Invisible watermark included for copyright protection.</div>
  </div>
</div>

<!-- MOBILE DRAWER -->
<div class="drawer-overlay" id="drawer-overlay" onclick="closeDrawer()"></div>
<div class="drawer" id="drawer">
  <div class="drawer-handle"></div>
  <div class="drawer-hd">
    <div>
      <div class="drawer-q" id="drawer-q">Answer</div>
      <div class="drawer-marks" id="drawer-marks"></div>
    </div>
    <button class="drawer-x" onclick="closeDrawer()">✕ Close</button>
  </div>
  <div class="drawer-body" id="drawer-body"></div>
</div>

<script>
// ─── CONSTANTS ─────────────────────────────────────────────────────────────

const IS_ENGLISH = ${isEnglish ? 'true' : 'false'};
const PAPER_KEY = 'SEE-${paper.year}-${paper.province}-${subject.code}';
const PRINT_BASE = '/api/see-paper-print?year=${paper.year}&province=${paper.province}&subject=${subject.code}';
const SHARE_URL = '${esc(canonicalUrl)}';
const ACCENT = '${cfg.accent}';
const TOTAL = ${totalQuestions};
const ANSWERS = ${ANSWERS_JSON};
const GROUPS = ${GROUPS_JSON};

// ─── STATE ─────────────────────────────────────────────────────────────────

let LANG = 'en';
let MODE = null; // null=overview, 'read','check','step'
let activeId = null;
let currentStep = 0;
let stepQIdx = 0;
let doneSet = new Set();
const isMobile = () => window.innerWidth < 768;

// Show progress on overview immediately on load
(function initOvProgress(){
  try {
    const saved = (JSON.parse(localStorage.getItem('ujyalo_progress')||'{}')||{})[PAPER_KEY];
    if (saved && saved.pct > 0) {
      const sec = document.getElementById('ov-prog-section');
      const pct = document.getElementById('ov-prog-pct');
      const lbl = document.getElementById('ov-prog-lbl');
      const bar = document.getElementById('ov-prog-bar');
      if (sec) sec.style.display = 'block';
      if (pct) pct.textContent = saved.pct + '%';
      if (lbl) lbl.textContent = saved.pct === 100 ? 'Completed ✓' : ((saved.done||[]).length + ' of ' + TOTAL + ' reviewed');
      if (bar) bar.style.width = saved.pct + '%';
    }
  } catch(e) {}
})();

// ─── OVERVIEW → MODE ───────────────────────────────────────────────────────

function enterMode(mode) {
  if (mode === 'download') { openDownload(); return; }
  MODE = mode;
  document.getElementById('ov-wrap').classList.add('hidden');
  document.getElementById('paper-wrap').classList.remove('hidden');
  document.getElementById('mode-tabs').classList.remove('hidden');

  // Update mode tab
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('act'));
  const modeMap = {read:0, check:1, step:2};
  document.querySelectorAll('.mtab')[modeMap[mode]]?.classList.add('act');

  if (mode === 'step') {
    document.getElementById('read-check-scroll').classList.add('hidden');
    document.getElementById('step-wrap').classList.remove('hidden');
    document.getElementById('step-wrap').style.display = 'flex';
    stepQIdx = 0;
    renderStepQ();
  } else {
    document.getElementById('step-wrap').classList.add('hidden');
    document.getElementById('step-wrap').style.display = 'none';
    document.getElementById('read-check-scroll').classList.remove('hidden');
  }

  // Check mode: show answer buttons prominently; Read mode: hide them
  document.querySelectorAll('.ans-btn').forEach(btn => {
    btn.style.display = mode === 'read' ? 'none' : '';
  });

  // Auto-select first question on desktop
  if (!isMobile() && mode !== 'step' && ANSWERS.length > 0) {
    openAnswer(ANSWERS[0].id);
  }

  // Restore progress
  loadProgress();
}

function setMode(mode, btn) {
  MODE = mode;
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('act'));
  btn.classList.add('act');

  if (mode === 'step') {
    document.getElementById('read-check-scroll').classList.add('hidden');
    document.getElementById('step-wrap').classList.remove('hidden');
    document.getElementById('step-wrap').style.display = 'flex';
    stepQIdx = 0;
    renderStepQ();
  } else {
    document.getElementById('step-wrap').classList.add('hidden');
    document.getElementById('step-wrap').style.display = 'none';
    document.getElementById('read-check-scroll').classList.remove('hidden');
  }

  document.querySelectorAll('.ans-btn').forEach(btn => {
    btn.style.display = mode === 'read' ? 'none' : '';
  });
}

// ─── ANSWER OPEN ───────────────────────────────────────────────────────────

function openAnswer(id) {
  const q = ANSWERS.find(a => a.id === id);
  if (!q) return;
  activeId = id;
  currentStep = 0;

  // Highlight sidebar row
  const qNum = q.qNum;
  document.querySelectorAll('.sb-row').forEach(r => r.classList.remove('act'));
  document.getElementById('sb-' + qNum)?.classList.add('act');

  // Highlight question card
  document.querySelectorAll('.qcard').forEach(c => c.classList.remove('act'));
  document.getElementById('qcard-' + qNum)?.classList.add('act');

  const html = buildAnswerPanel(q);

  if (isMobile()) {
    document.getElementById('drawer-q').textContent = 'Q' + qNum + (q.sub ? ' (' + q.sub + ')' : '');
    document.getElementById('drawer-marks').textContent = q.marks + ' marks';
    document.getElementById('drawer-body').innerHTML = html;
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('open');
  } else {
    document.getElementById('rp-q').textContent = 'Q' + qNum + (q.sub ? ' (' + q.sub + ')' : '') + ' — ' + q.marks + ' marks';
    document.getElementById('rp-scroll').innerHTML = html;
  }
}

// ─── BUILD ANSWER PANEL ────────────────────────────────────────────────────

function buildAnswerPanel(q) {
  const answer = q.answer || 'Model answer coming soon.';
  const steps = q.steps && Array.isArray(q.steps) ? q.steps : (q.steps ? JSON.parse(q.steps) : null);
  const col = q.color || ACCENT;
  let stepsHTML = '';
  if (steps && steps.length) {
    let stepItems = '';
    steps.forEach(function(s,i) {
      const shown = i <= currentStep ? ' shown' : '';
      const circBg = i < currentStep ? 'var(--green)' : i === currentStep ? col : 'var(--line)';
      const circCol = i <= currentStep ? '#fff' : 'var(--faint)';
      const circTxt = i < currentStep ? '&#10003;' : String(i+1);
      const delay = (i * 0.06).toFixed(2);
      const lineHtml = i < steps.length-1
        ? '<div class="step-line" style="background:' + (i < currentStep ? 'rgba(34,197,94,.4)' : 'var(--line)') + ';"></div>'
        : '';
      stepItems += '<div class="step-item' + shown + '" id="sp-' + q.id + '-' + i + '" style="transition-delay:' + delay + 's;">'
        + '<div class="step-col">'
        + '<div class="step-circle" style="background:' + circBg + ';color:' + circCol + ';">' + circTxt + '</div>'
        + lineHtml
        + '</div>'
        + '<div class="step-text">' + esc(String(s)) + '</div>'
        + '</div>';
    });
    const showNext = currentStep < steps.length - 1;
    const nextHtml = showNext
      ? '<button class="next-btn" data-id="' + q.id + '" onclick="nextStep(this.dataset.id)" style="background:' + col + ';">Next step &#8594;</button>'
      : '';
    const replayStyle = showNext ? 'display:none' : '';
    stepsHTML = '<div class="steps-lbl" style="color:' + col + ';">Step-by-step working</div>'
      + '<div id="step-list-' + q.id + '">' + stepItems + '</div>'
      + nextHtml
      + '<button class="replay-btn" data-id="' + q.id + '" onclick="replaySteps(this.dataset.id)" style="' + replayStyle + '">&#8635; Replay steps</button>';
  }
  return '<div class="ans-final" style="background:' + col + '12;border:1.5px solid ' + col + '30;">'
    + '<div class="ans-check"><div class="ans-check-circle">&#10003;</div><span class="ans-lbl">Final answer</span></div>'
    + '<div class="ans-text">' + esc(answer) + '</div>'
    + '</div>'
    + stepsHTML
    + '<button class="re-btn" onclick="toggleReExplain(this)">&#128161; Still don't understand?</button>'
    + '<div class="re-box" id="re-box-' + q.id + '">'
    + '<div class="re-box-lbl">Simpler explanation</div>'
    + '<div class="re-box-text">A simpler explanation will be available soon.</div>'
    + '</div>';
}

// ─── STEPS ─────────────────────────────────────────────────────────────────

function nextStep(id) {
  const q = ANSWERS.find(a => a.id === id);
  if (!q) return;
  const steps = Array.isArray(q.steps) ? q.steps : JSON.parse(q.steps||'[]');
  if (currentStep < steps.length - 1) {
    currentStep++;
    openAnswer(id); // re-render with updated step
  }
}

function replaySteps(id) {
  currentStep = 0;
  openAnswer(id);
}

function toggleReExplain(btn) {
  const box = btn.nextElementSibling;
  if (box) { box.style.display = box.style.display === 'none' ? 'block' : 'none'; }
}

// ─── STEP MODE ─────────────────────────────────────────────────────────────

function renderStepQ() {
  const g = GROUPS[stepQIdx];
  if (!g) return;
  const num = g.num;
  // Find first sub for this question
  const subs = ANSWERS.filter(a => a.qNum === num);
  const first = subs[0];

  const text = LANG === 'np' && first?.np ? first.np : first?.en || '';

  const topicHtml = g.topic
    ? '<div style="margin-top:12px;"><span class="qtag" style="background:' + ACCENT + '18;color:' + ACCENT + ';">' + esc(g.topic) + '</span></div>'
    : '';
  const ansHtml = MODE === 'check' && first
    ? '<div style="max-width:640px;margin:0 auto;">' + buildAnswerPanel(first) + '</div>'
    : '';
  document.getElementById('step-main').innerHTML =
    '<div class="step-qcard">'
    + '<div class="step-qnum">Q' + num + '</div>'
    + '<div class="step-qtext">' + esc(text) + '</div>'
    + topicHtml
    + '</div>'
    + ansHtml;

  // Update dots
  document.querySelectorAll('.step-dot').forEach((d,i) => {
    d.classList.remove('act','done');
    if (i === stepQIdx) d.classList.add('act');
    else if (doneSet.has(GROUPS[i]?.num)) d.classList.add('done');
  });

  document.getElementById('step-ctr').textContent = (stepQIdx+1) + ' / ' + TOTAL;
  document.getElementById('step-mid').textContent = 'Q'+(stepQIdx+1)+' of '+TOTAL;
  document.getElementById('sp-prev').disabled = stepQIdx === 0;
  document.getElementById('sp-next').disabled = stepQIdx === GROUPS.length - 1;

  // Right panel on desktop
  if (!isMobile() && first) openAnswer(first.id);

  currentStep = 0;
}

function stepPrev() { if (stepQIdx > 0) { stepQIdx--; renderStepQ(); } }
function stepNext() { if (stepQIdx < GROUPS.length-1) { stepQIdx++; renderStepQ(); } }
function goStep(num) { stepQIdx = GROUPS.findIndex(g => g.num === num); renderStepQ(); }

// ─── QUESTION CARD CLICK ───────────────────────────────────────────────────

function qCardClick(num) {
  if (MODE !== 'check' && MODE !== 'step') return;
  const subs = ANSWERS.filter(a => a.qNum === num);
  if (subs.length) openAnswer(subs[0].id);
}

function scrollToQ(num) {
  const card = document.getElementById('qcard-' + num);
  if (card) card.scrollIntoView({ behavior:'smooth', block:'start' });
  document.querySelectorAll('.sb-row').forEach(r => r.classList.remove('act'));
  document.getElementById('sb-' + num)?.classList.add('act');
}

// ─── MCQ ───────────────────────────────────────────────────────────────────

function pickOpt(btn, correct, chosen) {
  const grid = btn.closest('.mcq-grid');
  grid.querySelectorAll('.mcq-opt').forEach(b => b.classList.remove('correct','wrong'));
  btn.classList.add(chosen === correct ? 'correct' : 'wrong');
  btn.innerHTML += chosen === correct ? ' <span>✓</span>' : ' <span>✗</span>';
}

// ─── MARK DONE ─────────────────────────────────────────────────────────────

function markDone(num) {
  const btn = document.getElementById('done-' + num);
  const card = document.getElementById('qcard-' + num);
  const sbRow = document.getElementById('sb-' + num);
  const sbNum = document.getElementById('sb-num-' + num);
  const strip = document.getElementById('strip-' + num);

  if (doneSet.has(num)) {
    doneSet.delete(num);
    btn.className = 'done-btn undone'; btn.textContent = 'Mark done';
    card?.classList.remove('done-card');
    if (strip) { strip.style.background=''; strip.style.width='0'; }
    sbRow?.classList.remove('done');
    if (sbNum) { sbNum.style.background = ACCENT+'18'; sbNum.style.color = ACCENT; sbNum.textContent = num; }
  } else {
    doneSet.add(num);
    btn.className = 'done-btn done'; btn.textContent = '✓ Done';
    card?.classList.add('done-card');
    if (strip) { strip.style.background = 'var(--green)'; strip.style.width = '100%'; }
    sbRow?.classList.add('done');
    if (sbNum) { sbNum.style.background = 'rgba(34,197,94,.18)'; sbNum.style.color = 'var(--green)'; sbNum.textContent = '✓'; }
  }
  updateProgress();
  saveProgress();
}

// ─── PROGRESS ──────────────────────────────────────────────────────────────

function updateProgress() {
  const done = doneSet.size;
  const pct = Math.round((done / TOTAL) * 100);
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-pct').textContent = pct + '%';
  document.getElementById('sb-fill').style.width = pct + '%';
  document.getElementById('sb-cnt').textContent = done + ' / ' + TOTAL + ' reviewed';
  // Dots in step mode
  document.querySelectorAll('.step-dot').forEach((d,i) => {
    if (doneSet.has(GROUPS[i]?.num)) d.classList.add('done');
    else d.classList.remove('done');
  });
}

function saveProgress() {
  try {
    const all = JSON.parse(localStorage.getItem('ujyalo_progress') || '{}');
    all[PAPER_KEY] = { pct: Math.round((doneSet.size/TOTAL)*100), done: [...doneSet], started: true };
    localStorage.setItem('ujyalo_progress', JSON.stringify(all));
  } catch(e) {}
}

function loadProgress() {
  try {
    const all = JSON.parse(localStorage.getItem('ujyalo_progress') || '{}');
    const saved = all[PAPER_KEY];
    if (saved?.done) {
      saved.done.forEach(n => {
        doneSet.add(n);
        const btn = document.getElementById('done-' + n);
        const card = document.getElementById('qcard-' + n);
        if (btn) { btn.className = 'done-btn done'; btn.textContent = '✓ Done'; }
        card?.classList.add('done-card');
      });
      updateProgress();
    }
    // Show progress on overview panel if started
    if (saved?.pct > 0) {
      const sec = document.getElementById('ov-prog-section');
      const pct = document.getElementById('ov-prog-pct');
      const lbl = document.getElementById('ov-prog-lbl');
      const bar = document.getElementById('ov-prog-bar');
      if (sec) sec.style.display = 'block';
      if (pct) pct.textContent = saved.pct + '%';
      if (lbl) lbl.textContent = saved.pct === 100 ? 'Completed!' : (saved.done.length + ' of ' + TOTAL + ' reviewed');
      if (bar) bar.style.width = saved.pct + '%';
    }
  } catch(e) {}
}

// ─── BOOKMARKS ─────────────────────────────────────────────────────────────

function toggleBookmark(btn, id) {
  btn.classList.toggle('saved');
  const q = ANSWERS.find(a => a.id === id);
  if (!q) return;
  try {
    const bks = JSON.parse(localStorage.getItem('ujyalo_bookmarks') || '[]');
    const idx = bks.findIndex(b => b.id === id);
    if (idx > -1) bks.splice(idx, 1);
    else bks.push({
      id, qNum: q.qNum, sub: q.sub, marks: q.marks,
      topic: q.topic, subjectCode: '${subject.code}',
      year: '${paper.year}', province: '${paper.province}',
      paper: 'SEE ${paper.year} ${subject.name}',
      questionText: (LANG === 'np' ? q.np : q.en).substring(0, 200),
    });
    localStorage.setItem('ujyalo_bookmarks', JSON.stringify(bks));
  } catch(e) {}
}

// ─── LANGUAGE ──────────────────────────────────────────────────────────────

function setLang(l) {
  LANG = l;
  document.getElementById('lt-en').className = 'lt-btn ' + (l==='en'?'act':'off');
  document.getElementById('lt-np').className = 'lt-btn ' + (l==='np'?'act':'off');
  document.getElementById('lang-indicator').textContent = l==='en' ? 'English' : 'नेपाली';
  // Re-open active answer in new language
  if (activeId) { currentStep = 0; openAnswer(activeId); }
  if (MODE === 'step') renderStepQ();
}

// ─── DOWNLOAD ──────────────────────────────────────────────────────────────

function openDownload() { document.getElementById('dl-overlay').classList.add('open'); }
function closeDownload() { document.getElementById('dl-overlay').classList.remove('open'); }

function downloadPDF(lang, btn) {
  document.querySelectorAll('.dl-opt').forEach(o => o.classList.remove('selected'));
  btn.classList.add('selected');
  const flag = btn.querySelector('.dl-flag');
  const origFlag = flag.textContent;
  flag.textContent = '✓';
  if (typeof gtag !== 'undefined') gtag('event', 'pdf_download', { paper: PAPER_KEY, language: lang });
  setTimeout(() => {
    window.open(PRINT_BASE + '&lang=' + lang, '_blank');
    flag.textContent = origFlag;
    btn.classList.remove('selected');
    closeDownload();
  }, 800);
}

// ─── SHARE ────────────────────────────────────────────────────────────────

function shareUrl() {
  if (navigator.share) {
    navigator.share({ title: document.title, url: SHARE_URL }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(SHARE_URL).then(() => {
      const btn = document.querySelector('.share-btn');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  }
  if (typeof gtag !== 'undefined') gtag('event', 'share', { paper: PAPER_KEY });
}

// ─── MOBILE DRAWER ────────────────────────────────────────────────────────

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

</script>
<div id="site-footer"></div>
<script src="/scripts/components.js"><\/script>
</body>
</html>`;
}

// ── HANDLER ───────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  try {
    let { year, province, subject } = req.query;

    // Support clean URL: /see/past-papers/2082/Koshi/maths
    if (!year || !province || !subject) {
      const match = (req.url||'').match(/\/see\/past-papers\/(\d+)\/([^\/\?]+)\/([^\/\?]+)/);
      if (match) {
        year = year || match[1];
        province = province || match[2];
        subject = subject || match[3];
      }
    }

    if (!year || !province || !subject) {
      return res.status(400).send('Missing params: year, province, subject');
    }

    const subjectCode = subject.toLowerCase();
    const subjects = await fetchFromSupabase(`/exam_subjects?code=eq.${subjectCode}&select=id,name,code`);
    if (!subjects[0]) return res.status(404).send(`Subject not found: ${subject}`);

    // Normalise province: capitalise first letter only (koshi→Koshi, sudurpashchim→Sudurpashchim)
    const provNorm = province.charAt(0).toUpperCase() + province.slice(1).toLowerCase();

    const papers = await fetchFromSupabase(
      `/past_papers?subject_id=eq.${subjects[0].id}&year=eq.${year}&province=eq.${provNorm}&select=*`
    );
    if (!papers[0]) return res.status(404).send(`Paper not found: ${year}/${provNorm}/${subject}`);

    const questions = await fetchFromSupabase(
      `/past_paper_questions?paper_id=eq.${papers[0].id}&order=question_number.asc,sub_part.asc&select=*`
    );

    const html = buildHTML({ paper: papers[0], subject: subjects[0], questions });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(html);

  } catch(err) {
    console.error('Paper error:', err);
    return res.status(500).send(`<html><body style="font-family:sans-serif;padding:40px"><h2>Error loading paper</h2><p>${err.message}</p><a href="/see">← Back to papers</a></body></html>`);
  }
}
