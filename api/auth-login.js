// ═══════════════════════════════════════════════════════════
// UJYALO — AUTH LOGIN API
// Logs a student in via Supabase
// File: api/auth-login.js
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Validation
  if (!email)    return res.status(400).json({ error: 'Please enter your email.' });
  if (!password) return res.status(400).json({ error: 'Please enter your password.' });

  try {
    // Login via Supabase Auth
    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        })
      }
    );

    const data = await response.json();

    // Wrong email or password
    if (data.error || !data.access_token) {
      return res.status(401).json({ error: 'Incorrect email or password. Please try again.' });
    }

    // Success — return the session token
    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || ''
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
