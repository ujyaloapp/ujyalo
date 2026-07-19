// ═══════════════════════════════════════════════════════════
// UJYALO — ADMIN USERS API
// Fetches all users from Supabase Auth
// Caller must be a logged-in user whose role is 'admin' (verified server-side)
// File: api/admin-users.js
// ═══════════════════════════════════════════════════════════

// Verify the caller is a real, logged-in admin — not just "sent some token".
// 1) Ask Supabase whose token this is. 2) Look up that user's role in the DB.
// Returns { id } for a verified admin, or null.
async function getAdmin(token) {
  if (!token) return null;
  const who = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { 'apikey': process.env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
  });
  if (!who.ok) return null;
  const u = await who.json();
  if (!u || !u.id) return null;
  const roleRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(u.id)}&select=role`,
    { headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}` } }
  );
  if (!roleRes.ok) return null;
  const rows = await roleRes.json();
  return (rows && rows[0] && rows[0].role === 'admin') ? { id: u.id } : null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // Only a verified admin may touch this (the list contains everyone's email)
  const token = req.headers.authorization?.replace('Bearer ', '');
  const admin = await getAdmin(token);
  if (!admin) {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  // ── change a user's app role (also powers "remove from team" → student) ──
  if (req.method === 'POST') {
    const action = req.query.action || (req.body && req.body.action);
    if (action !== 'set-role') return res.status(400).json({ error: 'Unknown action' });
    const id = req.body && req.body.id;
    const role = req.body && req.body.role;
    const ALLOWED = ['admin', 'editor', 'student'];
    if (!id || !ALLOWED.includes(role)) return res.status(400).json({ error: 'Bad request' });
    if (id === admin.id && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot change your own admin role.' });
    }
    const pr = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ role }),
    });
    if (!pr.ok) return res.status(500).json({ error: 'Update failed' });
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── list contact-form messages for the admin Inbox ──
  // Read with the service key server-side so it works regardless of how
  // row-level-security is configured on contact_messages.
  if (req.query.action === 'messages') {
    try {
      const r = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/contact_messages?select=*&order=created_at.desc`,
        { headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}` } }
      );
      if (!r.ok) throw new Error(await r.text());
      const messages = await r.json();
      return res.status(200).json({ success: true, messages });
    } catch (e) {
      console.error('Admin messages error:', e);
      return res.status(500).json({ error: 'Failed to load messages.' });
    }
  }

  // ── accurate dashboard counts ──
  // The browser can only read a capped/RLS-filtered slice of these tables, so
  // counting client-side gives wrong numbers (e.g. "100% verified"). Here we
  // ask Postgres for the EXACT count with the service key (no cap, no RLS).
  if (req.query.action === 'stats') {
    async function count(filter) {
      const sep = filter.includes('?') ? '&' : '?';
      const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${filter}${sep}limit=1`, {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Prefer': 'count=exact',
        },
      });
      const cr = r.headers.get('content-range') || '';
      const n = parseInt((cr.split('/')[1] || ''), 10);
      return Number.isFinite(n) ? n : 0;
    }
    try {
      const [papersTotal, papersLive, qTotal, qVerified, qFlagged, messages,
             chapterTotal, chapterVerified, chapterLive, waitlist, students] = await Promise.all([
        count('past_papers?select=id'),
        count('past_papers?status=eq.live&select=id'),
        count('past_paper_questions?select=id'),
        count('past_paper_questions?verified=eq.true&select=id'),
        count('past_paper_questions?flagged=eq.true&select=id'),
        count('contact_messages?select=id'),
        count('chapter_questions?status=neq.rejected&select=id'),
        count('chapter_questions?verified=eq.true&select=id'),
        count('chapter_questions?status=eq.live&select=id'),
        count('waitlist?select=id'),
        count('users?role=eq.student&select=id'),
      ]);
      // Mock tests live/total (table may not exist yet → default to 0, never throw).
      const [mockTotal, mockLive] = await Promise.all([
        count('mock_tests?select=id').catch(() => 0),
        count('mock_tests?status=eq.published&select=id').catch(() => 0),
      ]);
      // Record today's snapshot (Nepal day) so trend lines have real history —
      // fire-and-forget, an upsert keyed on the day; a failure never blocks stats.
      const nepalDay = new Date(Date.now() + 5.75 * 3600 * 1000).toISOString().slice(0, 10);
      fetch(`${process.env.SUPABASE_URL}/rest/v1/stats_daily?on_conflict=day`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({ day: nepalDay, students, papers_live: papersLive, papers_total: papersTotal,
          q_verified: qVerified, q_total: qTotal, practice_live: chapterLive, practice_checked: chapterVerified,
          practice_total: chapterTotal, waitlist, messages, flagged: qFlagged, updated_at: new Date().toISOString() }),
      }).catch(() => {});
      return res.status(200).json({ success: true, papersTotal, papersLive, qTotal, qVerified, qFlagged, messages,
        chapterTotal, chapterVerified, chapterLive, waitlist, students, mockTotal, mockLive });
    } catch (e) {
      console.error('Admin stats error:', e);
      return res.status(500).json({ error: 'Failed to load stats.' });
    }
  }

  if (req.query.action === 'stats-history') {
    try {
      const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/stats_daily?select=*&order=day.asc&limit=120`, {
        headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}` },
      });
      const history = await r.json();
      return res.status(200).json({ success: true, history: Array.isArray(history) ? history : [] });
    } catch (e) {
      console.error('Admin stats-history error:', e);
      return res.status(200).json({ success: true, history: [] });
    }
  }

  try {
    // Fetch users from Supabase Auth admin endpoint
    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/admin/users`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }

    // System mailboxes to hide from People entirely (not real users)
    const HIDE_EMAILS = ['hello@ujyalo.app'];

    // Fetch app roles from the users table (keyed by auth id)
    let rolesById = {};
    try {
      const roleRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/users?select=id,role,full_name`,
        { headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}` } }
      );
      const roleRows = await roleRes.json();
      if (Array.isArray(roleRows)) roleRows.forEach(r => { rolesById[r.id] = r; });
    } catch (e) { /* if roles fail, everyone defaults to student */ }

    const users = (data.users || [])
      .filter(u => !HIDE_EMAILS.includes((u.email || '').toLowerCase()))
      .map(u => {
        const r = rolesById[u.id] || {};
        return {
          id:           u.id,
          email:        u.email,
          full_name:    r.full_name || u.user_metadata?.full_name || '—',
          role:         r.role || 'student',
          created_at:   u.created_at,
          confirmed:    !!u.email_confirmed_at,
          last_sign_in: u.last_sign_in_at,
        };
      });

    return res.status(200).json({ success: true, users });

  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
