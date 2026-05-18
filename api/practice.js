// ============================================================
// UJYALO — PRACTICE API
// Handles: AI generate/evaluate, get questions, save progress, get progress
// Route via ?action= parameter
// ============================================================

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

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
          score,
          total,
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

  // ── AI generate / evaluate (POST) ────────────────────────
  if (action === 'generate' || action === 'evaluate') {
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
