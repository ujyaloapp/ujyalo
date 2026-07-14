// ============================================================
// UJYALO — PRACTICE API
// Handles: AI generate/evaluate, get questions, save progress, get progress
// Route via ?action= parameter
// ============================================================

// ── Abuse protection for the AI actions (generate/evaluate) ──
// These call Anthropic and cost real money, and the practice page is open to
// logged-out students on purpose (free practice for everyone). So instead of a
// login wall — which would break that promise — we (a) only serve requests that
// actually come from our own site, which blocks the trivial "script it in a
// loop from anywhere" abuse, and (b) apply a best-effort per-IP rate limit.
const AI_ALLOWED_ORIGINS = ['https://ujyalo.app', 'https://www.ujyalo.app', 'https://ujyalo.vercel.app'];
function fromOurSite(req) {
  const origin = req.headers.origin || '';
  if (origin) return AI_ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost');
  const ref = req.headers.referer || '';
  if (ref) return AI_ALLOWED_ORIGINS.some(o => ref.startsWith(o)) || ref.startsWith('http://localhost');
  return false; // no Origin and no Referer (e.g. a raw script / curl) → refuse
}
// Best-effort in-memory limiter. On serverless this lives per warm instance, so
// it's a speed bump against bursts, not a hard guarantee — good enough to stop
// casual abuse without adding extra infrastructure.
const _aiHits = new Map();
function aiRateLimited(ip, limit = 30, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hits = (_aiHits.get(ip) || []).filter(t => now - t < windowMs);
  hits.push(now);
  _aiHits.set(ip, hits);
  if (_aiHits.size > 5000) _aiHits.clear(); // crude cap so memory can't grow forever
  return hits.length > limit;
}
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || req.headers['x-real-ip'] || 'unknown';
}

// ── Daily Question helpers (use the SERVICE key: the daily_* tables have RLS
//    enabled with no policies, so only the server may read/write them). ──
const _SB = () => process.env.SUPABASE_URL;
const _SVC = () => process.env.SUPABASE_SERVICE_KEY;
function _svcHeaders(extra) {
  return Object.assign({ apikey: _SVC(), Authorization: `Bearer ${_SVC()}`, 'Content-Type': 'application/json' }, extra || {});
}
async function _svcGet(path) {
  const r = await fetch(`${_SB()}/rest/v1${path}`, { headers: _svcHeaders() });
  if (!r.ok) throw new Error(`SB GET ${r.status} ${path}`);
  return r.json();
}
async function _svcPost(path, body, prefer) {
  const r = await fetch(`${_SB()}/rest/v1${path}`, { method: 'POST', headers: _svcHeaders(prefer ? { Prefer: prefer } : {}), body: JSON.stringify(body) });
  if (!r.ok && r.status !== 409) throw new Error(`SB POST ${r.status} ${await r.text()}`);
  const t = await r.text(); try { return t ? JSON.parse(t) : null; } catch { return null; }
}
async function _svcPatch(path, body) {
  const r = await fetch(`${_SB()}/rest/v1${path}`, { method: 'PATCH', headers: _svcHeaders(), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`SB PATCH ${r.status} ${await r.text()}`);
  return true;
}
// Today's date in Nepal (UTC+5:45); offsetDays shifts by whole days.
function _nepalDate(offsetDays) {
  const ms = Date.now() + (5 * 60 + 45) * 60000 + (offsetDays || 0) * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}
async function _userFromToken(token) {
  if (!token) return null;
  const r = await fetch(`${_SB()}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY } });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? u : null;
}
const _DAILY_ACCENT = { maths: '#2563eb', science: '#1aa890', english: '#e08a0a', nepali: '#e84393', social: '#7c3aed', hpe: '#b3433f' };
// Map raw past_paper_questions rows → the exact "group" shape the paper renderer expects.
function _mapRow(q) {
  return {
    id: q.id, sub: q.sub_part || undefined,
    en: q.question_text_english || '', np: q.question_text_nepali || '',
    answer: q.answer_text || '', marks: q.marks || 0,
    topic: q.topic || '', difficulty: q.difficulty || '', frequency: q.frequency || '', section: q.section || '',
    diagram: q.diagram_svg || null, steps: q.steps_en || null, opts: q.opts_en || null, correct: q.correct_opt ?? null,
    marking_scheme: q.marking_scheme || null,
    why_examiner: q.why_examiner || '', common_mistake: q.common_mistake || '',
    simpler_explanation: q.simpler_explanation || '', similar_topic: q.similar_topic || '',
    student_count: q.student_count || null, error_rate: q.error_rate || null,
  };
}
function _groupQuestion(num, rows) {
  let parent = null; const subs = [];
  rows.forEach(q => { if (!q.sub_part) parent = q; else subs.push(q); });
  return { num: parseInt(num), parent: parent ? (() => { const p = _mapRow(parent); delete p.sub; return p; })() : null, subs: subs.map(_mapRow) };
}
// Resolve (and if needed, fix for the whole world) today's daily question.
async function _ensureTodaysDaily() {
  const date = _nepalDate(0);
  let sched = await _svcGet(`/daily_schedule?date=eq.${date}&select=daily_question_id&limit=1`);
  if (sched.length) return { date, dqid: sched[0].daily_question_id };
  const approved = await _svcGet(`/daily_questions?status=eq.approved&order=added_at.asc&select=id,pinned_date`);
  if (!approved.length) return { date, dqid: null };
  let pick = approved.find(q => q.pinned_date === date);
  if (!pick) {
    const all = await _svcGet(`/daily_schedule?select=daily_question_id,date&order=date.asc`);
    const shown = new Set(all.map(s => s.daily_question_id));
    pick = approved.find(q => !shown.has(q.id));                    // never shown yet
    if (!pick) {                                                    // all shown → least-recently-shown
      const appIds = new Set(approved.map(q => q.id));
      const oldest = all.find(s => appIds.has(s.daily_question_id));
      pick = (oldest && approved.find(q => q.id === oldest.daily_question_id)) || approved[0];
    }
  }
  try { await _svcPost(`/daily_schedule`, { date, daily_question_id: pick.id }, 'resolution=ignore-duplicates'); } catch (e) {}
  sched = await _svcGet(`/daily_schedule?date=eq.${date}&select=daily_question_id&limit=1`);
  return { date, dqid: sched.length ? sched[0].daily_question_id : pick.id };
}

export default async function handler(req, res) {
  const action = req.query.action || req.body?.action;

  // ── Get ALL questions for a subject (GET) ────────────────
  if (req.method === 'GET' && action === 'get-all-questions') {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({ error: 'Missing subject.' });
    }

    try {
      const url = `${process.env.SUPABASE_URL}/rest/v1/chapter_questions?subject=eq.${encodeURIComponent(subject)}&status=eq.live&order=sort_order.asc`;

      const dbRes = await fetch(url, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        }
      });

      if (!dbRes.ok) throw new Error(await dbRes.text());

      const questions = await dbRes.json();
      return res.status(200).json(questions);

    } catch (error) {
      console.error('Get all questions error:', error);
      return res.status(500).json({ error: 'Failed to load questions.' });
    }
  }

  // ── Get chapter questions (GET) ───────────────────────────
  if (req.method === 'GET' && action === 'get-questions') {
    const { subject, chapter } = req.query;

    if (!subject || !chapter) {
      return res.status(400).json({ error: 'Missing subject or chapter.' });
    }

    try {
      const url = `${process.env.SUPABASE_URL}/rest/v1/chapter_questions?subject=eq.${encodeURIComponent(subject)}&chapter_name=eq.${encodeURIComponent(chapter)}&status=eq.live&order=sort_order.asc`;

      const dbRes = await fetch(url, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        }
      });

      if (!dbRes.ok) throw new Error(await dbRes.text());

      const questions = await dbRes.json();
      return res.status(200).json(questions);

    } catch (error) {
      console.error('Get questions error:', error);
      return res.status(500).json({ error: 'Failed to load questions.' });
    }
  }

  // ── Get chapter progress (GET) ────────────────────────────
  if (req.method === 'GET' && action === 'get-progress') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');

    try {
      const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': process.env.SUPABASE_ANON_KEY,
        }
      });

      if (!userRes.ok) return res.status(401).json({ error: 'Invalid token.' });

      const userData = await userRes.json();

      const dbRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/chapter_attempts?user_id=eq.${userData.id}&order=completed_at.desc`,
        {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (!dbRes.ok) throw new Error(await dbRes.text());

      const attempts = await dbRes.json();
      return res.status(200).json(attempts);

    } catch (error) {
      console.error('Get progress error:', error);
      return res.status(500).json({ error: 'Failed to load progress.' });
    }
  }

  // ── Get a user's attempt events for the dashboard (GET) ──
  if (req.method === 'GET' && action === 'get-events') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');

    try {
      const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': process.env.SUPABASE_ANON_KEY,
        }
      });

      if (!userRes.ok) return res.status(401).json({ error: 'Invalid token.' });

      const userData = await userRes.json();

      const dbRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/attempt_events?user_id=eq.${userData.id}&select=mode,subject,chapter_name,topic,question_id,paper_id,result,created_at&order=created_at.desc&limit=5000`,
        {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (!dbRes.ok) throw new Error(await dbRes.text());

      const events = await dbRes.json();
      return res.status(200).json(events);

    } catch (error) {
      console.error('Get events error:', error);
      return res.status(500).json({ error: 'Failed to load events.' });
    }
  }

  // ── Daily Question — today's question (GET) ───────────────
  if (req.method === 'GET' && action === 'daily-today') {
    try {
      const { date, dqid } = await _ensureTodaysDaily();
      if (!dqid) return res.status(200).json({ empty: true, date });
      const dq = (await _svcGet(`/daily_questions?id=eq.${dqid}&select=id,paper_id,question_number,subject_code,source_label`))[0];
      if (!dq) return res.status(200).json({ empty: true, date });
      const rows = await _svcGet(`/past_paper_questions?paper_id=eq.${dq.paper_id}&question_number=eq.${dq.question_number}&order=sub_part.asc&select=*`);
      if (!rows.length) return res.status(200).json({ empty: true, date });
      const group = _groupQuestion(dq.question_number, rows);
      const code = (dq.subject_code || '').toLowerCase();
      // optional: is the caller logged in + already done today? + their streak
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
      let done = null, streak = 0;
      if (token) {
        const u = await _userFromToken(token);
        if (u) {
          const att = await _svcGet(`/daily_attempts?user_id=eq.${u.id}&date=eq.${date}&select=self_assessment`);
          done = att.length ? att[0].self_assessment : null;
          const ur = await _svcGet(`/users?id=eq.${u.id}&select=streak`);
          streak = ur.length ? (ur[0].streak || 0) : 0;
        }
      }
      return res.status(200).json({
        date, daily_question_id: dqid, source_label: dq.source_label || '',
        subject: { code, accent: _DAILY_ACCENT[code] || '#0f766e', isEnglish: code === 'english' },
        group, done, streak,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Daily Question — record an attempt + streak (POST) ─────
  if (action === 'daily-submit') {
    try {
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
      const u = await _userFromToken(token);
      if (!u) return res.status(401).json({ error: 'Sign in to save your progress.' });
      const b = req.body || {};
      const sa = ({ got_it: 'got', got: 'got', almost: 'almost', missed: 'missed' })[b.self_assessment] || 'missed';
      const date = _nepalDate(0);
      await _svcPost('/daily_attempts',
        { user_id: u.id, date, daily_question_id: b.daily_question_id || null, self_assessment: sa, answer_text: b.answer_text || null },
        'resolution=merge-duplicates');
      // streak: +1 if yesterday was answered, unchanged if already answered today, else reset to 1
      const ur = await _svcGet(`/users?id=eq.${u.id}&select=streak,last_daily_date`);
      const prev = ur.length ? (ur[0].streak || 0) : 0;
      const last = ur.length ? ur[0].last_daily_date : null;
      let streak;
      if (last === date) streak = prev || 1;
      else if (last === _nepalDate(-1)) streak = prev + 1;
      else streak = 1;
      if (last !== date) await _svcPatch(`/users?id=eq.${u.id}`, { streak, last_daily_date: date });
      return res.status(200).json({ ok: true, streak });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── Save chapter progress (POST) ──────────────────────────
  if (action === 'save-progress') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');
    const { subject, group_name, chapter_name, score, total } = req.body;

    if (!subject || !chapter_name || score === undefined || !total) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Don't trust the browser's numbers blindly: score/total must be sane,
    // and the score can never exceed the total.
    const numScore = Number(score);
    const numTotal = Number(total);
    if (!Number.isFinite(numScore) || !Number.isFinite(numTotal) ||
        numTotal <= 0 || numScore < 0 || numScore > numTotal) {
      return res.status(400).json({ error: 'Invalid score.' });
    }

    const pct = Math.round((numScore / numTotal) * 100);

    try {
      const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': process.env.SUPABASE_ANON_KEY,
        }
      });

      if (!userRes.ok) return res.status(401).json({ error: 'Invalid token.' });

      const userData = await userRes.json();

      const dbRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/chapter_attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id:      userData.id,
          subject:      subject.trim(),
          group_name:   group_name ? group_name.trim() : '',
          chapter_name: chapter_name.trim(),
          score:        numScore,
          total:        numTotal,
          pct,
          completed_at: new Date().toISOString()
        })
      });

      if (!dbRes.ok) throw new Error(await dbRes.text());

      return res.status(200).json({ success: true, pct });

    } catch (error) {
      console.error('Save progress error:', error);
      return res.status(500).json({ error: 'Failed to save progress.' });
    }
  }

  // ── Log a single question attempt event (POST) ───────────
  if (action === 'log-event') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');
    const {
      mode = 'practice', question_id = null, paper_id = null,
      subject = null, chapter_name = null, topic = null,
      result, revealed_answer = false, time_spent_seconds = null
    } = req.body;

    if (!result) {
      return res.status(400).json({ error: 'Missing result.' });
    }

    try {
      const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': process.env.SUPABASE_ANON_KEY,
        }
      });

      if (!userRes.ok) return res.status(401).json({ error: 'Invalid token.' });

      const userData = await userRes.json();

      const dbRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/attempt_events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id:            userData.id,
          mode:               mode || 'practice',
          question_id:        question_id || null,
          paper_id:           paper_id || null,
          subject:            subject ? String(subject).trim() : null,
          chapter_name:       chapter_name ? String(chapter_name).trim() : null,
          topic:              topic ? String(topic).trim() : null,
          result:             result,
          revealed_answer:    !!revealed_answer,
          time_spent_seconds: time_spent_seconds
        })
      });

      if (!dbRes.ok) throw new Error(await dbRes.text());

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error('Log event error:', error);
      return res.status(500).json({ error: 'Failed to log event.' });
    }
  }

  // ── AI generate / evaluate (POST) ────────────────────────
  if (action === 'generate' || action === 'evaluate') {
    // These cost money — only serve them to our own site, and rate-limit.
    if (!fromOurSite(req)) {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    if (aiRateLimited(clientIp(req))) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }
    const { subject, question, studentAnswer } = req.body;

    let prompt = '';

    if (action === 'generate') {
      prompt = `You are creating a practice question for a Grade 10 student in Nepal preparing for the SEE exam.

Subject: ${subject}

Create ONE practice question following SEE exam format. Important rules:
- The question must be in clear, simple English only
- Match the SEE Grade 10 syllabus for ${subject}
- Use Nepali context where natural — Nepali names like Rajan, Sita, Anish; NPR currency; Nepali geography
- Be appropriate difficulty for Grade 10

Respond ONLY with a JSON object:
{"question": "the question text here", "expectedAnswer": "the correct answer here"}

Only the JSON. No markdown, no code blocks.`;

    } else {
      prompt = `You are a friendly teacher evaluating a Grade 10 SEE student's answer in Nepal.

Subject: ${subject}
Question: ${question}
Student's Answer: ${studentAnswer}

Evaluate warmly and helpfully. Rules:
- Simple English only
- Be encouraging
- Maximum 4 short sentences

Respond ONLY with a JSON object:
{"verdict": "correct", "feedback": "your feedback here"}

Verdict must be: "correct", "partial", or "incorrect". Only the JSON. No markdown.`;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(500).json({ error: data.error?.message || 'API request failed.' });
      }

      const text = data.content?.[0]?.text?.trim();
      const jsonMatch = text?.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return res.status(500).json({ error: 'Could not parse AI response.' });
      }

      const result = JSON.parse(jsonMatch[0]);
      return res.status(200).json(result);

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action.' });
}
