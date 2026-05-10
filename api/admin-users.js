// ═══════════════════════════════════════════════════════════
// UJYALO — ADMIN USERS API
// Fetches all users from Supabase Auth
// Only accessible with service role key
// File: api/admin-users.js
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check admin token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authorized.' });

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

    // Return simplified user list
    const users = (data.users || []).map(u => ({
      id:         u.id,
      email:      u.email,
      full_name:  u.user_metadata?.full_name || '—',
      created_at: u.created_at,
      confirmed:  !!u.email_confirmed_at,
      last_sign_in: u.last_sign_in_at,
    }));

    return res.status(200).json({ success: true, users });

  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
