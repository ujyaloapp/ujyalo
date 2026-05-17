// ============================================================
// UJYALO — Save Chapter Progress API
// api/save-chapter-progress.js
// ============================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { subject, group_name, chapter_name, score, total } = req.body;

  if (!subject || !chapter_name || score === undefined || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  try {
    // Verify token and get user
    const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.SUPABASE_ANON_KEY,
      }
    });

    if (!userRes.ok) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userData = await userRes.json();
    const userId   = userData.id;

    // Save chapter attempt
    const dbRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/chapter_attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id:      userId,
        subject:      subject.trim(),
        group_name:   group_name ? group_name.trim() : '',
        chapter_name: chapter_name.trim(),
        score:        score,
        total:        total,
        pct:          pct,
        completed_at: new Date().toISOString()
      })
    });

    if (!dbRes.ok) {
      const err = await dbRes.text();
      throw new Error(err);
    }

    return res.status(200).json({ success: true, pct });

  } catch (error) {
    console.error('Save chapter progress error:', error);
    return res.status(500).json({ error: 'Failed to save progress' });
  }
}
