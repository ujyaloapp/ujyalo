// ============================================================
// UJYALO — api/daily.js
// Daily Question feature.
//   Editor curation (Phase 1): pick VERIFIED past-paper questions into a
//   daily pool. Editor-gated (same allowlist as admin-paper.js).
//   Actions (?action=): papers | candidates | pool | add | remove
//   (public today | submit come in Phase 2)
// Writes use the service key server-side; the browser never touches the tables.
// ============================================================

const SB  = () => process.env.SUPABASE_URL;
const KEY = () => process.env.SUPABASE_SERVICE_KEY;

function sbHeaders(extra) {
  return Object.assign(
    { apikey: KEY(), Authorization: `Bearer ${KEY()}`, 'Content-Type': 'application/json' },
    extra || {}
  );
}
async function sbGet(path) {
  const r = await fetch(`${SB()}/rest/v1${path}`, { headers: sbHeaders() });
  if (!r.ok) throw new Error(`Supabase GET ${r.status}: ${path}`);
  return r.json();
}
async function sbPost(path, body) {
  const r = await fetch(`${SB()}/rest/v1${path}`, {
    method: 'POST', headers: sbHeaders({ Prefer: 'return=representation' }), body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Supabase POST ${r.status}: ${await r.text()}`);
  return r.json();
}
async function sbDelete(path) {
  const r = await fetch(`${SB()}/rest/v1${path}`, { method: 'DELETE', headers: sbHeaders() });
  if (!r.ok) throw new Error(`Supabase DELETE ${r.status}: ${await r.text()}`);
  return true;
}

// Verify the caller is a logged-in editor/admin. Returns email or null.
async function getEditor(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const r = await fetch(`${SB()}/auth/v1/user`, {
    headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const u = await r.json();
  if (!u || !u.id) return null;
  const rows = await sbGet(`/users?id=eq.${u.id}&select=role,email`);
  const role = rows && rows[0] && rows[0].role;
  if (role === 'editor' || role === 'admin') return ((rows[0].email || u.email || '').toLowerCase());
  return null;
}

// Build a human label for a paper + question, e.g. "SEE 2082 · Koshi · Q7".
function labelFor(paper, questionNumber) {
  const prov = paper.province ? String(paper.province).charAt(0).toUpperCase() + String(paper.province).slice(1) : '';
  return `SEE ${paper.year}${prov ? ' · ' + prov : ''} · Q${questionNumber}`;
}

async function paperMeta(paperId) {
  const papers = await sbGet(`/past_papers?id=eq.${paperId}&select=id,year,province,subject_id`);
  const paper = papers[0];
  if (!paper) return null;
  const subs = await sbGet(`/exam_subjects?id=eq.${paper.subject_id}&select=code,name`);
  paper.subject_code = (subs[0] && subs[0].code) || '';
  paper.subject_name = (subs[0] && subs[0].name) || '';
  return paper;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const action = req.query.action || (req.body && req.body.action);

  try {
    // ── editor gate ──
    const editor = await getEditor(req);
    if (!editor) return res.status(403).json({ error: 'Not authorised. Sign in as an editor.' });

    // List papers (for the "add from a paper" picker), newest first, with subject.
    if (action === 'papers') {
      const papers = await sbGet('/past_papers?select=id,year,province,subject_id&order=year.desc,province.asc');
      const subs = await sbGet('/exam_subjects?select=id,code,name');
      const subMap = {}; subs.forEach(s => (subMap[s.id] = s));
      const out = papers.map(p => ({
        id: p.id, year: p.year, province: p.province,
        subject_code: (subMap[p.subject_id] && subMap[p.subject_id].code) || '',
        label: `${(subMap[p.subject_id] && subMap[p.subject_id].name) || 'Subject'} · SEE ${p.year} · ${p.province || ''}`.trim(),
      }));
      return res.status(200).json({ papers: out });
    }

    // Verified questions of one paper, grouped by question_number, with in-pool flag.
    if (action === 'candidates') {
      const pid = req.query.paper_id;
      if (!pid) return res.status(400).json({ error: 'Missing paper_id' });
      const paper = await paperMeta(pid);
      if (!paper) return res.status(404).json({ error: 'Paper not found' });

      const qs = await sbGet(
        `/past_paper_questions?paper_id=eq.${pid}&order=question_number.asc,sub_part.asc` +
        `&select=question_number,sub_part,question_text_english,marks,verified`
      );
      const byNum = {};
      qs.forEach(q => {
        const n = q.question_number;
        const g = byNum[n] || (byNum[n] = { question_number: n, parts: 0, verified: 0, marks: 0, preview: '' });
        g.parts++;
        if (q.verified) g.verified++;
        g.marks += (q.marks || 0);
        if (!g.preview && q.question_text_english) g.preview = String(q.question_text_english).replace(/\s+/g, ' ').slice(0, 130);
      });
      const inPool = await sbGet(`/daily_questions?paper_id=eq.${pid}&select=question_number`);
      const poolSet = {}; inPool.forEach(r => (poolSet[r.question_number] = true));

      const questions = Object.values(byNum).map(g => ({
        question_number: g.question_number,
        parts: g.parts,
        all_verified: g.verified === g.parts && g.parts > 0,
        marks: g.marks,
        preview: g.preview,
        in_pool: !!poolSet[g.question_number],
      }));
      return res.status(200).json({
        paper: { id: paper.id, year: paper.year, province: paper.province, subject_code: paper.subject_code, subject_name: paper.subject_name },
        questions,
      });
    }

    // The current daily pool.
    if (action === 'pool') {
      const rows = await sbGet('/daily_questions?order=added_at.desc&select=*');
      return res.status(200).json({ pool: rows });
    }

    // ── writes ──
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

    // Add a whole (verified) question to the pool.
    if (action === 'add') {
      const paper_id = req.body.paper_id;
      const question_number = req.body.question_number;
      if (!paper_id || question_number == null) return res.status(400).json({ error: 'Missing paper/question' });

      const paper = await paperMeta(paper_id);
      if (!paper) return res.status(404).json({ error: 'Paper not found' });

      // Guard: only fully-verified questions may enter the pool.
      const parts = await sbGet(`/past_paper_questions?paper_id=eq.${paper_id}&question_number=eq.${question_number}&select=verified`);
      if (!parts.length) return res.status(404).json({ error: 'Question not found' });
      if (!parts.every(p => p.verified)) return res.status(400).json({ error: 'All parts must be verified before adding to Daily.' });

      // Already in pool? (unique constraint would 409 anyway.)
      const exists = await sbGet(`/daily_questions?paper_id=eq.${paper_id}&question_number=eq.${question_number}&select=id`);
      if (exists.length) return res.status(200).json({ ok: true, row: exists[0], already: true });

      const rows = await sbPost('/daily_questions', {
        paper_id, question_number,
        subject_code: paper.subject_code,
        source_label: labelFor(paper, question_number),
        status: 'approved',
        added_by: editor,
      });
      return res.status(200).json({ ok: true, row: rows[0] || null });
    }

    // Remove from the pool.
    if (action === 'remove') {
      const id = req.body.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sbDelete(`/daily_questions?id=eq.${id}`);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
