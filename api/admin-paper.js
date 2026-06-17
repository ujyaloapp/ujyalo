// ============================================================
// UJYALO — api/admin-paper.js
// Secure editor/verification API (papers only).
// Every action requires a valid Supabase login token whose email
// is on the EDITOR allowlist. Writes use the service key server-side.
// Actions (?action=): whoami | list | load | update-field | set-status
// ============================================================

const EDITABLE = ['question_text_english','question_text_nepali','answer_text','marks','topic','difficulty'];

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
async function sbPatch(path, body, rep) {
  const r = await fetch(`${SB()}/rest/v1${path}`, {
    method: 'PATCH',
    headers: sbHeaders(rep ? { Prefer: 'return=representation' } : {}),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Supabase PATCH ${r.status}: ${await r.text()}`);
  return rep ? r.json() : null;
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

// Verify the caller is logged in AND has the editor (or admin) role. Returns email or null.
async function getEditor(req) {
  const hdr = req.headers.authorization || '';
  const token = hdr.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  // 1) who is this token?
  const r = await fetch(`${SB()}/auth/v1/user`, {
    headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const u = await r.json();
  if (!u || !u.id) return null;
  // 2) what role does the database give them? (same source your admin uses)
  const rows = await sbGet(`/users?id=eq.${u.id}&select=role,email`);
  const role = rows && rows[0] && rows[0].role;
  if (role === 'editor' || role === 'admin') return ((rows[0].email || u.email || '').toLowerCase());
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const action = req.query.action || (req.body && req.body.action);

  // ── gate: must be an authorised editor ──
  const editor = await getEditor(req);
  if (!editor) return res.status(403).json({ error: 'Not authorised. Sign in as an editor.' });

  try {
    if (action === 'whoami') {
      return res.status(200).json({ editor: true, email: editor });
    }

    // ── list every paper (for the switcher) ──
    if (action === 'list') {
      const papers = await sbGet('/past_papers?select=id,year,province,subject_id,total_marks&order=year.desc,province.asc');
      const subs   = await sbGet('/exam_subjects?select=id,code,name');
      const byId = {}; subs.forEach(s => { byId[s.id] = s; });
      const out = papers.map(p => ({
        id: p.id, year: p.year, province: p.province,
        subject: (byId[p.subject_id] || {}).code || '',
        subjectName: (byId[p.subject_id] || {}).name || '',
        total: p.total_marks || 75,
      }));
      return res.status(200).json({ papers: out });
    }

    // ── load one paper, fully, for editing ──
    if (action === 'load') {
      const pid = req.query.paper_id;
      if (!pid) return res.status(400).json({ error: 'Missing paper_id' });
      const paper = (await sbGet(`/past_papers?id=eq.${pid}&select=*`))[0];
      if (!paper) return res.status(404).json({ error: 'Paper not found' });
      const subj = (await sbGet(`/exam_subjects?id=eq.${paper.subject_id}&select=id,code,name`))[0] || {};
      const rows = await sbGet(
        `/past_paper_questions?paper_id=eq.${paper.id}` +
        `&order=question_number.asc,sub_part.asc` +
        `&select=id,question_number,sub_part,question_text_english,question_text_nepali,answer_text,marks,topic,difficulty,verified,flagged,flag_note,verified_by`
      );
      const groups = {};
      rows.forEach(q => {
        const n = q.question_number;
        if (!groups[n]) groups[n] = { num: n, parent: null, subs: [], verified: false, flagged: false, flag_note: '', verified_by: '' };
        if (!q.sub_part) groups[n].parent = q; else groups[n].subs.push(q);
        if (q.verified) groups[n].verified = true;
        if (q.flagged) { groups[n].flagged = true; if (q.flag_note) groups[n].flag_note = q.flag_note; }
        if (q.verified_by) groups[n].verified_by = q.verified_by;
      });
      const list = Object.values(groups).sort((a, b) => a.num - b.num);
      return res.status(200).json({
        paper: { id: paper.id, year: paper.year, province: paper.province, total_marks: paper.total_marks || 75 },
        subject: { code: subj.code || '', name: subj.name || '' },
        isEnglish: (subj.code === 'english'),
        groups: list,
        progress: { total: list.length, verified: list.filter(g => g.verified).length },
      });
    }

    // ── every flagged question, across all papers (the Flags inbox) ──
    if (action === 'flags') {
      const rows = await sbGet('/past_paper_questions?flagged=eq.true&select=paper_id,question_number,flag_note&order=paper_id.asc,question_number.asc');
      if (!rows.length) return res.status(200).json({ flags: [] });
      const pids = Array.from(new Set(rows.map(r => r.paper_id)));
      const papers = await sbGet(`/past_papers?id=in.(${pids.join(',')})&select=id,year,province,subject_id`);
      const subs = await sbGet('/exam_subjects?select=id,code,name');
      const pmap = {}; papers.forEach(p => { pmap[p.id] = p; });
      const smap = {}; subs.forEach(s => { smap[s.id] = s; });
      const seen = {}, out = [];
      rows.forEach(r => {
        const k = r.paper_id + '#' + r.question_number; if (seen[k]) return; seen[k] = 1;
        const pp = pmap[r.paper_id] || {}, ss = smap[pp.subject_id] || {};
        out.push({ paper_id: r.paper_id, question_number: r.question_number, note: r.flag_note || '',
          year: pp.year, province: pp.province, subject: ss.code || '', subjectName: ss.name || '' });
      });
      return res.status(200).json({ flags: out });
    }

    // ── writes (POST only) ──
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    const body = req.body || {};

    if (action === 'update-field') {
      const { id, field } = body;
      let value = body.value;
      if (!id || !EDITABLE.includes(field)) return res.status(400).json({ error: 'Field not editable' });
      if (field === 'marks') { value = parseInt(value, 10); if (isNaN(value)) value = 0; }
      const patch = {}; patch[field] = value;
      const row = await sbPatch(`/past_paper_questions?id=eq.${id}`, patch, true);
      return res.status(200).json({ ok: true, row: (row && row[0]) || null });
    }

    if (action === 'set-status') {
      const { paper_id, question_number } = body;
      if (!paper_id || question_number == null) return res.status(400).json({ error: 'Missing paper/question' });
      const patch = {};
      if ('verified' in body) {
        patch.verified = !!body.verified;
        patch.verified_by = body.verified ? editor : null;
        patch.verified_at = body.verified ? new Date().toISOString() : null;
        if (body.verified) { patch.flagged = false; patch.flag_note = null; }
      }
      if ('flagged' in body) {
        patch.flagged = !!body.flagged;
        patch.flag_note = body.flagged ? (body.flag_note || '') : null;
        if (body.flagged) patch.verified = false;
      }
      await sbPatch(`/past_paper_questions?paper_id=eq.${paper_id}&question_number=eq.${question_number}`, patch, false);
      return res.status(200).json({ ok: true });
    }

    if (action === 'add-sub') {
      const { paper_id, question_number } = body;
      if (!paper_id || question_number == null) return res.status(400).json({ error: 'Missing paper/question' });
      const ex = await sbGet(`/past_paper_questions?paper_id=eq.${paper_id}&question_number=eq.${question_number}&select=sub_part`);
      const used = ex.map(r => (r.sub_part || '')).filter(Boolean);
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      let next = 'a'; for (const ch of letters) { if (used.indexOf(ch) < 0) { next = ch; break; } }
      const row = await sbPost('/past_paper_questions', [{
        paper_id, question_number, sub_part: next, question_type: 'written',
        marks: 0, question_text: '', question_text_english: '', question_text_nepali: '',
        answer_text: '', group_name: 'general', question_no: 0, status: 'live',
      }]);
      return res.status(200).json({ ok: true, row: (row && row[0]) || null });
    }

    if (action === 'delete-sub') {
      const { id } = body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sbDelete(`/past_paper_questions?id=eq.${id}`);
      return res.status(200).json({ ok: true });
    }

    if (action === 'reorder-subs') {
      const { order } = body; // array of row ids in the new order
      if (!Array.isArray(order) || !order.length) return res.status(400).json({ error: 'Missing order' });
      const rows = await sbGet(`/past_paper_questions?id=in.(${order.join(',')})&select=id,sub_part`);
      const labels = rows.map(r => r.sub_part).filter(x => x != null).sort();
      for (let i = 0; i < order.length; i++) {
        const lbl = (labels[i] != null) ? labels[i] : String.fromCharCode(97 + i);
        await sbPatch(`/past_paper_questions?id=eq.${order[i]}`, { sub_part: lbl }, false);
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error('admin-paper error:', e);
    return res.status(500).json({ error: e.message });
  }
}
