// ============================================================
// UJYALO — api/team.js
// Team board: tasks & goals shown on the verification desk.
// Same trust model as admin-paper.js — every action requires a valid
// Supabase login token whose user has the editor or admin role.
// Writes use the service key server-side.
// Actions (?action=): list | add | update | toggle | achieve | delete | clear-done
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
async function sbPatch(path, body) {
  const r = await fetch(`${SB()}/rest/v1${path}`, {
    method: 'PATCH', headers: sbHeaders({ Prefer: 'return=representation' }), body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Supabase PATCH ${r.status}: ${await r.text()}`);
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

const AREAS = ['content', 'social', 'code', 'outreach'];
const HORIZONS = ['term', 'future'];
const UUID = /^[0-9a-fA-F-]{36}$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const action = req.query.action || (req.body && req.body.action);

  const editor = await getEditor(req);
  if (!editor) return res.status(403).json({ error: 'Not authorised. Sign in as an editor.' });

  try {
    // ── read everything for the board ──
    if (action === 'list') {
      const items = await sbGet('/team_items?select=*&order=sort.asc,created_at.asc');
      const teamRows = await sbGet('/users?select=email,full_name&role=in.(admin,editor)');
      const team = (teamRows || [])
        .map(u => ({ email: (u.email || '').toLowerCase(), name: u.full_name || '' }))
        .filter(t => t.email);
      return res.status(200).json({ items: items || [], team, me: editor });
    }

    // ── writes (POST only) ──
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    const body = req.body || {};

    if (action === 'add') {
      const kind = body.kind === 'goal' ? 'goal' : 'task';
      const title = (body.title || '').trim();
      if (!title) return res.status(400).json({ error: 'Title required' });
      const row = { kind, title: title.slice(0, 200), status: 'open', created_by: editor };
      if (kind === 'task') {
        row.area = AREAS.includes(body.area) ? body.area : 'content';
        row.assignee = body.assignee ? String(body.assignee).toLowerCase().slice(0, 120) : null;
      } else {
        row.horizon = HORIZONS.includes(body.horizon) ? body.horizon : 'term';
      }
      const out = await sbPost('/team_items', row);
      return res.status(200).json({ ok: true, item: (out && out[0]) || null });
    }

    if (action === 'update') {
      const id = body.id;
      if (!UUID.test(id || '')) return res.status(400).json({ error: 'Bad id' });
      const patch = {};
      if (typeof body.title === 'string') { const t = body.title.trim(); if (t) patch.title = t.slice(0, 200); }
      if (AREAS.includes(body.area)) patch.area = body.area;
      if (HORIZONS.includes(body.horizon)) patch.horizon = body.horizon;
      if ('assignee' in body) patch.assignee = body.assignee ? String(body.assignee).toLowerCase().slice(0, 120) : null;
      if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nothing to update' });
      const out = await sbPatch(`/team_items?id=eq.${id}`, patch);
      return res.status(200).json({ ok: true, item: (out && out[0]) || null });
    }

    if (action === 'toggle') {
      const id = body.id;
      if (!UUID.test(id || '')) return res.status(400).json({ error: 'Bad id' });
      const done = !!body.done;
      const out = await sbPatch(`/team_items?id=eq.${id}`, { status: done ? 'done' : 'open', done_at: done ? new Date().toISOString() : null });
      return res.status(200).json({ ok: true, item: (out && out[0]) || null });
    }

    if (action === 'achieve') {
      const id = body.id;
      if (!UUID.test(id || '')) return res.status(400).json({ error: 'Bad id' });
      const a = !!body.achieved;
      const out = await sbPatch(`/team_items?id=eq.${id}`, { status: a ? 'achieved' : 'open', done_at: a ? new Date().toISOString() : null });
      return res.status(200).json({ ok: true, item: (out && out[0]) || null });
    }

    if (action === 'delete') {
      const id = body.id;
      if (!UUID.test(id || '')) return res.status(400).json({ error: 'Bad id' });
      await sbDelete(`/team_items?id=eq.${id}`);
      return res.status(200).json({ ok: true });
    }

    if (action === 'clear-done') {
      await sbDelete('/team_items?kind=eq.task&status=eq.done');
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
