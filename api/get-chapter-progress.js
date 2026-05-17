// ============================================================
// UJYALO — Get Chapter Progress API
// api/get-chapter-progress.js
// ============================================================

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify token and get user
    const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.SUPABASE_ANON_KEY,
      }
    });

    if (!userRes.ok) return res.status(401).json({ error: 'Invalid token' });

    const userData = await userRes.json();
    const userId   = userData.id;

    // Fetch all chapter attempts for this user
    const dbRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/chapter_attempts?user_id=eq.${userId}&order=completed_at.desc`,
      {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!dbRes.ok) {
      const err = await dbRes.text();
      throw new Error(err);
    }

    const attempts = await dbRes.json();
    return res.status(200).json(attempts);

  } catch (error) {
    console.error('Get chapter progress error:', error);
    return res.status(500).json({ error: 'Failed to load progress' });
  }
}
