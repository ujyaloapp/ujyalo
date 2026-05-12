// /api/auth-change-password.js
// Changes password for a currently logged-in user

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // Get the user from the token first
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    // Update password using admin API (service key)
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: password
    });

    if (error) {
      console.error('Change password error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Change password handler error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
