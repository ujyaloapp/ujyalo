// /api/auth-login.js
// Handles login — redirects admins to admin.html, students to dashboard.html

// ============================================================
// ADMIN EMAILS — add emails here to grant admin access
// ============================================================
const ADMIN_EMAILS = [
  'hello@ujyalo.app',
  // 'friend1@ujyalo.app', // uncomment to add Friend 1
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({
        error: data.error_description || data.msg || 'Invalid email or password.'
      });
    }

    if (!data.access_token) {
      return res.status(401).json({ error: 'Login failed. Please try again.' });
    }

    // Check if email is verified
    if (!data.user?.email_confirmed_at) {
      return res.status(401).json({
        error: 'Please verify your email first. Check your inbox for a confirmation link.'
      });
    }

    // Determine redirect based on role
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const redirectTo = isAdmin ? '/admin.html' : '/dashboard.html';

    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      redirectTo,
      user: {
        id:         data.user.id,
        email:      data.user.email,
        full_name:  data.user.user_metadata?.full_name || '',
        created_at: data.user.created_at,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
