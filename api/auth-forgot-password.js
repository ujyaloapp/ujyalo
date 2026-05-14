// /api/auth-forgot-password.js
// Sends a password reset email via Supabase Auth

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        gotrue_meta_security: {},
        redirectTo: 'https://ujyalo.app/reset-password.html',
      }),
    });

    // Always return success for security
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(200).json({ success: true });
  }
}
