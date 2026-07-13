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
