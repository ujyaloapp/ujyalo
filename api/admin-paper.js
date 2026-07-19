// ============================================================
// UJYALO — api/admin-paper.js
// Secure editor/verification API (papers only).
// Every action requires a valid Supabase login token whose email
// is on the EDITOR allowlist. Writes use the service key server-side.
// Actions (?action=): whoami | list | load | update-field | set-status
// ============================================================

const EDITABLE = ['question_text_english','question_text_nepali','answer_text','marks','topic','difficulty'];
// Editing any of these un-verifies just that part (it needs a fresh check).
// topic/difficulty are metadata and do not trigger a re-check.
const RECHECK_ON_EDIT = ['question_text_english','question_text_nepali','answer_text','marks'];

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

// Resolve just the caller's role — used to gate publish/unpublish to admins only.
async function getRole(req) {
  const hdr = req.headers.authorization || '';
  const token = hdr.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const r = await fetch(`${SB()}/auth/v1/user`, {
    headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const u = await r.json();
  if (!u || !u.id) return null;
  const rows = await sbGet(`/users?id=eq.${u.id}&select=role`);
  return (rows && rows[0] && rows[0].role) || null;
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

    // ── verification overview: per-paper verified/total/flagged + attribution + team tally ──
    if (action === 'overview') {
      const papers = await sbGet('/past_papers?select=id,year,province,subject_id,status&order=year.desc,province.asc');
      const subs   = await sbGet('/exam_subjects?select=id,code,name');
      const byId = {}; subs.forEach(s => { byId[s.id] = s; });
      // current team (admin/editor) — drives who appears; removed accounts never show
      const teamRows = await sbGet('/users?select=email,full_name,role&role=in.(admin,editor)');
      const team = {}; // lcEmail -> { email, name, role, questions, papers }
      (teamRows || []).forEach(u => {
        const e = (u.email || '').toLowerCase();
        if (e) team[e] = { email: u.email, name: u.full_name || '', role: u.role || '', questions: 0, papers: 0 };
      });
      const out = await Promise.all(papers.map(async p => {
        const rows = await sbGet(`/past_paper_questions?paper_id=eq.${p.id}&select=question_number,verified,flagged,verified_by,verified_at`);
        const q = {};
        const by = {}; let lastAt = null;
        rows.forEach(r => {
          const x = q[r.question_number] || (q[r.question_number] = { v: false, f: false });
          if (r.verified) {
            x.v = true;
            const e = (r.verified_by || '').toLowerCase();
            if (e) { by[e] = (by[e] || 0) + 1; if (team[e]) team[e].questions++; }
            if (r.verified_at && (!lastAt || r.verified_at > lastAt)) lastAt = r.verified_at;
          }
          if (r.flagged) x.f = true;
        });
        const nums = Object.keys(q);
        const verified = nums.filter(n => q[n].v).length;
        const flagged = nums.filter(n => q[n].f).length;
        const fully = nums.length > 0 && verified === nums.length;
        let topBy = '', topN = -1;
        for (const e in by) { if (by[e] > topN) { topN = by[e]; topBy = e; } }
        if (fully && topBy && team[topBy]) { team[topBy].papers++; }
        // Pipeline stage — the one place the ladder is defined; both the verify
        // desk and admin read this instead of each deriving their own. A flagged
        // paper is "In review" (being fixed) even if still live, so it never sits
        // in Published — that keeps the four stages summing to the total.
        const stage = flagged > 0                   ? 'review'
                    : (p.status || '') === 'live'   ? 'published'
                    : fully                         ? 'verified'
                    : verified > 0                  ? 'review'
                    :                                 'pending';
        return {
          id: p.id, year: p.year, province: p.province, status: p.status || '',
          subject: (byId[p.subject_id] || {}).code || '',
          subjectName: (byId[p.subject_id] || {}).name || '',
          total: nums.length,
          verified,
          flagged,
          fully, stage, verifiedBy: topBy, verifiedAt: lastAt,
        };
      }));
      const teamArr = Object.values(team)
        .map(t => ({ email: t.email, name: t.name, role: t.role, questions: t.questions, papers: t.papers }))
        .sort((a, b) => b.questions - a.questions);
      return res.status(200).json({ papers: out, team: teamArr });
    }

    // ── load one paper, fully, for editing ──
    if (action === 'load') {
      const pid = req.query.paper_id;
      if (!pid) return res.status(400).json({ error: 'Missing paper_id' });
      const paper = (await sbGet(`/past_papers?id=eq.${encodeURIComponent(pid)}&select=*`))[0];
      if (!paper) return res.status(404).json({ error: 'Paper not found' });
      const subj = (await sbGet(`/exam_subjects?id=eq.${paper.subject_id}&select=id,code,name`))[0] || {};
      const rows = await sbGet(
        `/past_paper_questions?paper_id=eq.${paper.id}` +
        `&order=question_number.asc,sub_part.asc` +
        `&select=id,question_number,sub_part,question_text_english,question_text_nepali,answer_text,marks,topic,difficulty,verified,flagged,flag_note,verified_by,diagram_svg`
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

    // ── Daily Question curation (editor) ──
    if (action === 'daily-papers') {
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
    if (action === 'daily-candidates') {
      const pid = req.query.paper_id;
      if (!pid) return res.status(400).json({ error: 'Missing paper_id' });
      const paper = await paperMeta(pid);
      if (!paper) return res.status(404).json({ error: 'Paper not found' });
      const qs = await sbGet(
        `/past_paper_questions?paper_id=eq.${pid}&order=question_number.asc,sub_part.asc` +
        `&select=question_number,sub_part,question_text_english,marks,verified,diagram_svg`
      );
      const byNum = {};
      qs.forEach(q => {
        const n = q.question_number;
        const g = byNum[n] || (byNum[n] = { question_number: n, parts: 0, verified: 0, marks: 0, preview: '', diagrams: [] });
        g.parts++;
        if (q.verified) g.verified++;
        g.marks += (q.marks || 0);
        if (!g.preview && q.question_text_english) g.preview = String(q.question_text_english).replace(/\s+/g, ' ').slice(0, 130);
        // Every figure attached to this question, so the editor can check it belongs
        // to the question and doesn't give the answer away before adding it.
        if (q.diagram_svg) g.diagrams.push({ sub: q.sub_part || null, svg: q.diagram_svg });
      });
      const inPool = await sbGet(`/daily_questions?paper_id=eq.${pid}&select=question_number`);
      const poolSet = {}; inPool.forEach(r => (poolSet[r.question_number] = true));
      const questions = Object.values(byNum).map(g => ({
        question_number: g.question_number, parts: g.parts,
        all_verified: g.verified === g.parts && g.parts > 0, marks: g.marks,
        preview: g.preview, in_pool: !!poolSet[g.question_number], diagrams: g.diagrams,
      }));
      return res.status(200).json({
        paper: { id: paper.id, year: paper.year, province: paper.province, subject_code: paper.subject_code, subject_name: paper.subject_name },
        questions,
      });
    }
    if (action === 'daily-pool') {
      const rows = await sbGet('/daily_questions?order=added_at.desc&select=*');
      return res.status(200).json({ pool: rows });
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
      // Drift guard (soft): editing a verified question's content un-verifies just
      // that part so it gets a fresh check. The paper stays live if it was live —
      // only flagging pulls a live paper down.
      const rechecked = RECHECK_ON_EDIT.includes(field);
      if (rechecked) { patch.verified = false; patch.verified_by = null; patch.verified_at = null; }
      const row = await sbPatch(`/past_paper_questions?id=eq.${encodeURIComponent(id)}`, patch, true);
      return res.status(200).json({ ok: true, row: (row && row[0]) || null, rechecked });
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
      await sbPatch(`/past_paper_questions?paper_id=eq.${encodeURIComponent(paper_id)}&question_number=eq.${encodeURIComponent(question_number)}`, patch, false);
      // Drift guard (hard): flagging a question on a LIVE paper means a known
      // problem is in front of students — pull the whole paper back to draft until
      // it's fixed and re-verified.
      if (body.flagged) {
        const pp = await sbGet(`/past_papers?id=eq.${encodeURIComponent(paper_id)}&select=status`);
        if (pp && pp[0] && pp[0].status === 'live') {
          await sbPatch(`/past_papers?id=eq.${encodeURIComponent(paper_id)}`, { status: 'draft' }, false);
          return res.status(200).json({ ok: true, pulled: true });
        }
      }
      return res.status(200).json({ ok: true });
    }

    // Publish / unpublish a paper — ADMIN ONLY, and publishing is refused unless
    // every question is verified and none flagged. This is the server-side wall:
    // the "only verified goes live" rule lives here, not in a hidden button.
    if (action === 'publish' || action === 'unpublish') {
      const callerRole = await getRole(req);
      if (callerRole !== 'admin') return res.status(403).json({ error: 'Only an admin can publish or unpublish papers.' });
      const paper_id = body.paper_id;
      if (!paper_id) return res.status(400).json({ error: 'Missing paper_id' });
      if (action === 'publish') {
        const qs = await sbGet(`/past_paper_questions?paper_id=eq.${encodeURIComponent(paper_id)}&select=verified,flagged`);
        if (!qs.length) return res.status(400).json({ error: 'This paper has no questions yet.' });
        if (qs.some(q => q.flagged)) return res.status(400).json({ error: 'Resolve the flagged questions before publishing.' });
        if (!qs.every(q => q.verified)) return res.status(400).json({ error: 'Every question must be verified before publishing.' });
        await sbPatch(`/past_papers?id=eq.${encodeURIComponent(paper_id)}`, { status: 'live' }, false);
        return res.status(200).json({ ok: true, status: 'live' });
      }
      await sbPatch(`/past_papers?id=eq.${encodeURIComponent(paper_id)}`, { status: 'draft' }, false);
      return res.status(200).json({ ok: true, status: 'draft' });
    }

    if (action === 'add-sub') {
      const { paper_id, question_number } = body;
      if (!paper_id || question_number == null) return res.status(400).json({ error: 'Missing paper/question' });
      const ex = await sbGet(`/past_paper_questions?paper_id=eq.${encodeURIComponent(paper_id)}&question_number=eq.${encodeURIComponent(question_number)}&select=sub_part`);
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
      await sbDelete(`/past_paper_questions?id=eq.${encodeURIComponent(id)}`);
      return res.status(200).json({ ok: true });
    }

    if (action === 'reorder-subs') {
      const { order } = body; // array of row ids in the new order
      if (!Array.isArray(order) || !order.length) return res.status(400).json({ error: 'Missing order' });
      const rows = await sbGet(`/past_paper_questions?id=in.(${order.map(encodeURIComponent).join(',')})&select=id,sub_part`);
      const labels = rows.map(r => r.sub_part).filter(x => x != null).sort();
      for (let i = 0; i < order.length; i++) {
        const lbl = (labels[i] != null) ? labels[i] : String.fromCharCode(97 + i);
        await sbPatch(`/past_paper_questions?id=eq.${encodeURIComponent(order[i])}`, { sub_part: lbl }, false);
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'daily-add') {
      const paper_id = body.paper_id;
      const question_number = body.question_number;
      if (!paper_id || question_number == null) return res.status(400).json({ error: 'Missing paper/question' });
      const paper = await paperMeta(paper_id);
      if (!paper) return res.status(404).json({ error: 'Paper not found' });
      const parts = await sbGet(`/past_paper_questions?paper_id=eq.${paper_id}&question_number=eq.${question_number}&select=verified`);
      if (!parts.length) return res.status(404).json({ error: 'Question not found' });
      if (!parts.every(p => p.verified)) return res.status(400).json({ error: 'All parts must be verified before adding to Daily.' });
      const exists = await sbGet(`/daily_questions?paper_id=eq.${paper_id}&question_number=eq.${question_number}&select=id`);
      if (exists.length) return res.status(200).json({ ok: true, row: exists[0], already: true });
      const rows = await sbPost('/daily_questions', {
        paper_id, question_number, subject_code: paper.subject_code,
        source_label: labelFor(paper, question_number), status: 'approved', added_by: editor,
      });
      return res.status(200).json({ ok: true, row: rows[0] || null });
    }
    if (action === 'daily-remove') {
      const id = body.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sbDelete(`/daily_questions?id=eq.${id}`);
      return res.status(200).json({ ok: true });
    }

    // Staff "not for daily → swap": retire today's daily question so it's never
    // auto-picked again, and clear today's slot so the next load re-rolls a fresh one.
    if (action === 'daily-swap') {
      const dqid = body.daily_question_id;
      if (!dqid) return res.status(400).json({ error: 'Missing daily_question_id' });
      // today in Nepal time (UTC+5:45), matching the picker in api/practice.js
      const nepal = new Date(Date.now() + (5 * 60 + 45) * 60000).toISOString().slice(0, 10);
      await sbPatch(`/daily_questions?id=eq.${encodeURIComponent(dqid)}`, { status: 'retired' }, false);
      await sbDelete(`/daily_schedule?date=eq.${nepal}`);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error('admin-paper error:', e);
    return res.status(500).json({ error: e.message });
  }
}
