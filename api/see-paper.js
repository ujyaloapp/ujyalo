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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    let { year, province, subject } = req.query;
    if (!year || !province || !subject) {
      return res.status(400).json({ error: 'Missing params: year, province, subject' });
    }

    const subjectCode = subject.toLowerCase();
    const provNorm = province.charAt(0).toUpperCase() + province.slice(1).toLowerCase();
    const cfg = SUBJECT_CONFIG[subjectCode] || SUBJECT_CONFIG.maths;
    const provCfg = PROV_CONFIG[provNorm] || { np: provNorm, num: 1 };

    const subjects = await fetchFromSupabase(
      `/exam_subjects?code=eq.${subjectCode}&select=id,name,code`
    );
    if (!subjects[0]) return res.status(404).json({ error: 'Subject not found' });

    const papers = await fetchFromSupabase(
      `/past_papers?subject_id=eq.${subjects[0].id}&year=eq.${year}&province=eq.${provNorm}&select=*`
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
      groups:   groupEntries,
      meta: {
        totalQuestions: groupEntries.length,
        totalSubs:      questions.filter(q => q.sub_part).length,
        yearAD:         parseInt(year) - 56,
        isEnglish:      subjectCode === 'english',
        canonicalUrl:   `https://ujyalo.app/see/past-papers/${year}/${provNorm}/${subjectCode}`,
        paperKey:       `SEE-${year}-${provNorm}-${subjectCode}`,
        printBase:      `/api/see-paper-print?year=${year}&province=${provNorm}&subject=${subjectCode}`,
      }
    });

  } catch (err) {
    console.error('see-paper error:', err);
    return res.status(500).json({ error: err.message });
  }
}
