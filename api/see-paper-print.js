// ============================================================
// UJYALO — SEE PAPER PRINT API
// Dedicated print page — clean, no UI chrome
// Called by downloadPDF() in see-paper.js
// Params: ?year=2082&province=Koshi&subject=maths&lang=en|np|both
// ============================================================

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

function buildPrintHTML({ paper, subject, questions, lang }) {
  const subjectNepaliMap = {
    'maths': 'गणित', 'science': 'विज्ञान', 'english': 'अंग्रेजी',
    'nepali': 'नेपाली', 'social': 'सामाजिक अध्ययन', 'hpe': 'स्वास्थ्य'
  };
  const subjectNameNp = subjectNepaliMap[subject.code] || subject.name;
  const yearAD = parseInt(paper.year) - 56;
  const showEn = lang === 'en' || lang === 'both';
  const showNp = lang === 'np' || lang === 'both';

  // Group questions
  const groups = {};
  questions.forEach(q => {
    const num = q.question_number;
    if (!groups[num]) groups[num] = { parent: null, subs: [] };
    if (!q.sub_part) groups[num].parent = q;
    else groups[num].subs.push(q);
  });

  // Build questions HTML
  let questionsHTML = '';
  Object.entries(groups)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([num, g]) => {
      const parent = g.parent;
      const diagram = DIAGRAMS[parseInt(num)];

      // Parent question text
      let parentText = '';
      if (lang === 'both') {
        if (parent?.question_text_nepali) parentText += `<div class="np">${escape(parent.question_text_nepali)}</div>`;
        if (parent?.question_text_english) parentText += `<div class="en">${escape(parent.question_text_english)}</div>`;
      } else if (showNp && parent?.question_text_nepali) {
        parentText = `<div class="np">${escape(parent.question_text_nepali)}</div>`;
      } else if (showEn && parent?.question_text_english) {
        parentText = `<div class="en">${escape(parent.question_text_english)}</div>`;
      }

      questionsHTML += `
      <div class="q-block">
        <div class="q-parent">
          <span class="q-num">${num}.</span>
          <span class="q-parent-text">${parentText}</span>
        </div>
        ${diagram ? `<div class="q-diagram">${diagram}</div>` : ''}
        <div class="q-subs">`;

      g.subs.forEach(sub => {
        let subText = '';
        if (lang === 'both') {
          if (sub.question_text_nepali) subText += `<div class="np">${escape(sub.question_text_nepali)}</div>`;
          if (sub.question_text_english) subText += `<div class="en">${escape(sub.question_text_english)}</div>`;
        } else if (showNp && sub.question_text_nepali) {
          subText = `<div class="np">${escape(sub.question_text_nepali)}</div>`;
        } else if (showEn && sub.question_text_english) {
          subText = `<div class="en">${escape(sub.question_text_english)}</div>`;
        }

        questionsHTML += `
          <div class="q-sub">
            <span class="q-letter">${sub.sub_part}</span>
            <span class="q-text">${subText}</span>
            <span class="q-marks">(${sub.marks})</span>
          </div>`;
      });

      questionsHTML += `</div></div>`;
    });

  // Instructions
  let instructions = '';
  if (lang === 'both') {
    if (paper.instructions_nepali) instructions += `<div class="np" style="font-style:italic;">${escape(paper.instructions_nepali)}</div>`;
    if (paper.instructions_english) instructions += `<div class="en" style="font-style:italic;">${escape(paper.instructions_english)}</div>`;
  } else if (showNp && paper.instructions_nepali) {
    instructions = `<div class="np" style="font-style:italic;">${escape(paper.instructions_nepali)}</div>`;
  } else if (showEn && paper.instructions_english) {
    instructions = `<div class="en" style="font-style:italic;">${escape(paper.instructions_english)}</div>`;
  }

  return `<!DOCTYPE html>
<html lang="${showNp ? 'ne' : 'en'}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SEE ${paper.year} ${paper.province} — ${subject.name} | Ujyalo</title>
  <!-- Load fonts with display=block to ensure they load before print -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600&family=Times+New+Roman&display=block" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 12pt;
      color: #000;
      background: white;
      padding: 20mm 20mm 25mm 20mm;
      max-width: 210mm;
      margin: 0 auto;
    }

    /* Nepali text */
    .np {
      font-family: 'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif;
      font-size: 11.5pt;
      line-height: 1.9;
      margin-bottom: 2pt;
    }

    /* English text */
    .en {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 11.5pt;
      line-height: 1.7;
      color: #111;
      margin-bottom: 2pt;
    }

    /* Paper header */
    .header {
      text-align: center;
      border-bottom: 2pt solid #000;
      padding-bottom: 10pt;
      margin-bottom: 14pt;
    }
    .header-exam { font-size: 12pt; font-weight: bold; margin-bottom: 3pt; }
    .header-subject { font-size: 16pt; font-weight: bold; margin-bottom: 2pt; }
    .header-subject-np {
      font-family: 'Noto Sans Devanagari', sans-serif;
      font-size: 12pt; color: #444; margin-bottom: 8pt;
    }
    .header-province {
      display: inline-block;
      background: #000; color: #fff;
      font-size: 9pt; font-weight: bold;
      padding: 2pt 10pt; border-radius: 20pt;
      margin-bottom: 10pt;
    }
    .header-meta {
      display: flex; justify-content: space-between;
      font-size: 11pt; font-weight: bold;
      border-top: 0.5pt solid #ccc; padding-top: 8pt; margin-top: 4pt;
    }

    /* Instructions */
    .instructions {
      background: #f0f4ff;
      border-left: 3pt solid #2563EB;
      padding: 8pt 10pt;
      margin-bottom: 14pt;
      font-size: 10.5pt;
      line-height: 1.6;
    }
    .instr-all { font-weight: bold; font-size: 11pt; margin-top: 5pt; }

    /* Questions */
    .q-block {
      margin-bottom: 14pt;
      page-break-inside: avoid;
    }
    .q-parent {
      display: flex;
      gap: 8pt;
      margin-bottom: 5pt;
      align-items: baseline;
    }
    .q-num {
      font-size: 12pt;
      font-weight: bold;
      flex-shrink: 0;
      min-width: 18pt;
    }
    .q-parent-text { flex: 1; }
    .q-diagram { margin: 6pt 0 6pt 26pt; }
    .q-subs { padding-left: 14pt; }
    .q-sub {
      display: flex;
      gap: 8pt;
      margin-bottom: 6pt;
      align-items: baseline;
      page-break-inside: avoid;
    }
    .q-letter {
      font-size: 11pt;
      color: #444;
      flex-shrink: 0;
      min-width: 14pt;
    }
    .q-letter::after { content: ')'; }
    .q-text { flex: 1; }
    .q-marks {
      font-size: 10pt;
      color: #444;
      flex-shrink: 0;
      white-space: nowrap;
    }

    /* Footer */
    .footer {
      text-align: center;
      font-size: 9pt;
      color: #888;
      margin-top: 24pt;
      padding-top: 8pt;
      border-top: 0.5pt solid #ddd;
    }

    /* Print-specific */
    @page {
      size: A4;
      margin: 15mm 15mm 25mm 15mm;
    }

    @media print {
      body { padding: 0; }
      /* Footer on every page using running element */
      .footer {
        display: block;
        margin-top: 20pt;
        padding-top: 8pt;
        border-top: 0.5pt solid #ddd;
        text-align: center;
        font-size: 9pt;
        color: #888;
      }
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-exam">SEE ${paper.year} (${yearAD} AD)</div>
    <div class="header-subject">Compulsory ${escape(subject.name)}</div>
    <div class="header-subject-np">अनिवार्य ${escape(subjectNameNp)}</div>
    <div><span class="header-province">🏔 ${escape(paper.province)} Province</span></div>
    <div class="header-meta">
      <span>Time: ${paper.time_minutes / 60} Hours &nbsp;|&nbsp; समय : ३ घण्टा</span>
      <span>Full Marks: ${paper.total_marks} &nbsp;|&nbsp; पूर्णाङ्क : ७५</span>
    </div>
  </div>

  ${instructions ? `<div class="instructions">${instructions}<div class="instr-all">सबै प्रश्नहरू अनिवार्य छन् · All questions are compulsory.</div></div>` : ''}

  ${questionsHTML}

  <div class="footer">
    ujyalo.app &nbsp;|&nbsp; Free SEE Exam Prep for Nepal 🇳🇵 &nbsp;|&nbsp; Free forever
  </div>

  <style>
    .print-tip {
      background: #FEF3C7; border: 1px solid #FCD34D;
      padding: 10px 16px; border-radius: 8px;
      font-size: 11pt; color: #92400e;
      margin-bottom: 16pt; font-family: Arial, sans-serif;
      text-align: center;
    }
    @media print { .print-tip { display: none !important; } }
  </style>
  <div class="print-tip">
    💡 For a cleaner PDF: In the print dialog, go to <strong>More settings</strong> → uncheck <strong>Headers and footers</strong>
  </div>
  <script>
    // Wait for fonts to load then print
    document.fonts.ready.then(function() {
      setTimeout(function() { window.print(); }, 800);
    });
    // Close tab when print dialog is closed (whether printed or cancelled)
    window.addEventListener('afterprint', function() {
      window.close();
    });
  </script>
</body>
</html>`;
}

export default async function handler(req, res) {
  try {
    let { year, province, subject, lang } = req.query;
    lang = lang || 'en';

    if (!year || !province || !subject) {
      return res.status(400).send('Missing parameters');
    }

    const subjects = await fetchFromSupabase(
      `/exam_subjects?code=eq.${subject.toLowerCase()}&select=id,name,code`
    );
    if (!subjects[0]) return res.status(404).send('Subject not found');
    const subjectData = subjects[0];

    const provinceName = province.charAt(0).toUpperCase() + province.slice(1).toLowerCase();
    const papers = await fetchFromSupabase(
      `/past_papers?subject_id=eq.${subjectData.id}&year=eq.${year}&province=eq.${provinceName}&select=*`
    );
    if (!papers[0]) return res.status(404).send('Paper not found');
    const paper = papers[0];

    const questions = await fetchFromSupabase(
      `/past_paper_questions?paper_id=eq.${paper.id}&order=question_number.asc,sub_part.asc&select=*`
    );

    const html = buildPrintHTML({ paper, subject: subjectData, questions, lang });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).send(html);

  } catch (err) {
    console.error('Print error:', err);
    return res.status(500).send(`<html><body><h1>Error</h1><p>${err.message}</p></body></html>`);
  }
}
