// ============================================================
// UJYALO — Mock Tests API
// Route: /api/mock?action=<list|load>
// Standalone mock tests (mock_tests + mock_questions tables).
// - list : card metadata for every published mock (public — the cards show to anyone)
// - load : the full questions for one mock, but ONLY to a logged-in user
//          (this is what enforces "log in to see the content")
// Service key stays server-side. Never exposed to the client.
// ============================================================

async function sb(path) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    }
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

// Resolve the signed-in user from the Bearer token, or null if not logged in.
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

// The safe, content-free "card" fields — all a locked/anonymous caller ever gets.
function cardOf(m) {
  return {
    slug: m.slug,
    title: m.title,
    set_label: m.set_label,
    subject: m.subject,
    total_marks: m.total_marks,
    duration_minutes: m.duration_minutes,
    is_free: m.is_free,
    sort_order: m.sort_order
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const action = req.query.action || 'list';

  try {
    // ---- list: the card box (public; no questions) --------------------
    if (action === 'list') {
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
      const mocks = await sb(
        '/mock_tests?status=eq.published' +
        '&select=slug,title,set_label,subject,total_marks,duration_minutes,is_free,sort_order' +
        '&order=sort_order.asc'
      );
      return res.status(200).json({ mocks: mocks.map(cardOf) });
    }

    // ---- load: one mock's questions (logged-in + free only) -----------
    if (action === 'load') {
      const slug = String(req.query.slug || '');
      if (!slug) return res.status(400).json({ error: 'Missing slug' });

      const mock = (await sb(
        `/mock_tests?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*`
      ))[0];
      if (!mock) return res.status(404).json({ error: 'Mock not found' });

      // Must be logged in to see any content.
      const user = await getUser(req);
      if (!user) {
        return res.status(200).json({ locked: true, reason: 'login', mock: cardOf(mock) });
      }
      // Locked sets (2–5) need Plus — not available yet.
      if (!mock.is_free) {
        return res.status(200).json({ locked: true, reason: 'plus', mock: cardOf(mock) });
      }

      const rows = await sb(
        `/mock_questions?mock_id=eq.${mock.id}` +
        '&order=question_number.asc,sort_order.asc' +
        '&select=question_number,sub_part,question_text_en,marks,diagram_svg'
      );

      // Assemble flat rows into questions: { number, stem, diagram_svg, parts:[{sub,text,marks}] }
      const byNum = {};
      const order = [];
      for (const r of rows) {
        const n = r.question_number;
        if (!byNum[n]) { byNum[n] = { number: n, stem: '', diagram_svg: null, parts: [] }; order.push(n); }
        if (!r.sub_part) {
          byNum[n].stem = r.question_text_en || '';
          byNum[n].diagram_svg = r.diagram_svg || null;
        } else {
          byNum[n].parts.push({ sub: r.sub_part, text: r.question_text_en || '', marks: r.marks });
        }
      }
      const questions = order.map(n => byNum[n]);

      return res.status(200).json({ locked: false, mock: cardOf(mock), questions });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('mock api error:', err);
    return res.status(500).json({ error: 'Failed to load mock tests' });
  }
}
