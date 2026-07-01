// ═══════════════════════════════════════════════════════════
// UJYALO — USER PROFILE API
// GET  — load profile data
// POST — save profile data
// File: api/profile.js
// ═══════════════════════════════════════════════════════════

// Resolve the user id that actually owns this token (or null if invalid/expired).
async function callerId(token) {
  if (!token) return null;
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { 'apikey': process.env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const u = await r.json();
  return (u && u.id) ? u.id : null;
}

export default async function handler(req, res) {

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not logged in.' });

  // Who owns this token? Everything below is locked to this id — a user can
  // only ever read or write their OWN profile, never one supplied by the client.
  const meId = await callerId(token);
  if (!meId) return res.status(401).json({ error: 'Session expired. Please log in again.' });

  // ── GET — load profile ──
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(meId)}&select=*`,
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
    const { full_name, school, grade, city, parent_email } = req.body;

    try {
      // Check if profile exists
      const checkRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(meId)}&select=id`,
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
          `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(meId)}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ full_name, school, grade, city, parent_email, email: req.body.email })
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
            body: JSON.stringify({ id: meId, full_name, school, grade, city, parent_email, email: req.body.email })
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
