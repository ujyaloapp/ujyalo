// ============================================================
// UJYALO — Get Chapter Questions API
// api/get-chapter-questions.js
// Fetches questions for a specific chapter from database
// ============================================================

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, chapter } = req.query;

  if (!subject || !chapter) {
    return res.status(400).json({ error: 'Missing subject or chapter' });
  }

  try {
    const url = `${process.env.SUPABASE_URL}/rest/v1/chapter_questions?subject=eq.${encodeURIComponent(subject)}&chapter_name=eq.${encodeURIComponent(chapter)}&status=eq.live&order=sort_order.asc`;

    const dbRes = await fetch(url, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      }
    });

    if (!dbRes.ok) {
      const err = await dbRes.text();
      throw new Error(err);
    }

    const questions = await dbRes.json();
    return res.status(200).json(questions);

  } catch (error) {
    console.error('Get chapter questions error:', error);
    return res.status(500).json({ error: 'Failed to load questions' });
  }
}
