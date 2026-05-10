// ═══════════════════════════════════════════════════════════
// UJYALO — USER PROFILE API
// GET  — load profile data
// POST — save profile data
// File: api/profile.js
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not logged in.' });

  // ── GET — load profile ──
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id.' });

    try {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${user_id}&select=*`,
        {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        // No profile yet — return empty
        return res.status(200).json({ success: true, profile: null });
      }

      return res.status(200).json({ success: true, profile: data[0] });
    } catch (error) {
      console.error('Profile GET error:', error);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  }

  // ── POST — save profile ──
  if (req.method === 'POST') {
    const { user_id, full_name, school, grade, city, parent_email } = req.body;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id.' });

    try {
      // Check if profile exists
      const checkRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${user_id}&select=id`,
        {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      const existing = await checkRes.json();

      if (existing && existing.length > 0) {
        // Update existing profile
        const updateRes = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${user_id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ full_name, school, grade, city, parent_email })
          }
        );
        if (!updateRes.ok) throw new Error('Update failed');
      } else {
        // Create new profile
        const insertRes = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/users`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ id: user_id, full_name, school, grade, city, parent_email })
          }
        );
        if (!insertRes.ok) throw new Error('Insert failed');
      }

      return res.status(200).json({ success: true, message: 'Profile saved!' });

    } catch (error) {
      console.error('Profile POST error:', error);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
