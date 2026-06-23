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

// A part's text may carry this marker; the figure renders in its place.
const PRINT_FIG_MARK = '[[diagram]]';
function splitPrintMarker(text) {
  const t = text || '';
  const i = t.indexOf(PRINT_FIG_MARK);
  if (i < 0) return null;
  return [t.slice(0, i).replace(/\s+$/, ''), t.slice(i + PRINT_FIG_MARK.length).replace(/^\s+/, '')];
}
function stripMarker(text) { return (text || '').split(PRINT_FIG_MARK).join('').trim(); }
function printDiagram(svg) {
  const s = (svg || '').trim();
  return (s.slice(0, 4).toLowerCase() === '<svg' && s.toLowerCase().indexOf('</svg>') >= 0) ? s : null;
}

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
      const diagram = parent?.diagram_svg || null;

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
        const np = sub.question_text_nepali || '';
        const en = sub.question_text_english || '';
        const subDiag = printDiagram(sub.diagram_svg);
        // Build the np/en text divs for whichever language(s) are shown.
        const mkBlocks = (n, e) => {
          let h = '';
          if (lang === 'both') {
            if (n) h += `<div class="np">${escape(n)}</div>`;
            if (e) h += `<div class="en">${escape(e)}</div>`;
          } else if (showNp && n) { h = `<div class="np">${escape(n)}</div>`; }
          else if (showEn && e) { h = `<div class="en">${escape(e)}</div>`; }
          return h;
        };

        let subText = '';
        if (subDiag) {
          // Figure attached to this part: place it at the marker, or after the text.
          const eS = splitPrintMarker(en), nS = splitPrintMarker(np);
          if (eS || nS) {
            const eB = eS ? eS[0] : en, eA = eS ? eS[1] : '';
            const nB = nS ? nS[0] : np, nA = nS ? nS[1] : '';
            subText = mkBlocks(nB, eB) + `<div class="q-diagram">${subDiag}</div>` + mkBlocks(nA, eA);
          } else {
            subText = mkBlocks(np, en) + `<div class="q-diagram">${subDiag}</div>`;
          }
        } else {
          // No figure: drop any stray marker so it never prints literally.
          subText = mkBlocks(stripMarker(np), stripMarker(en));
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
