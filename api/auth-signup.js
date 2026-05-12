// ═══════════════════════════════════════════════════════════
// UJYALO — AUTH SIGNUP API
// Creates a real user account in Supabase
// File: api/auth-signup.js
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { full_name, email, password } = req.body;

  // Validation
  if (!full_name) return res.status(400).json({ error: 'Please enter your full name.' });
  if (!email)     return res.status(400).json({ error: 'Please enter your email.' });
  if (!password)  return res.status(400).json({ error: 'Please enter a password.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  // Basic email check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    // Create account in Supabase Auth
    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
          data: { full_name: full_name.trim() }
        })
      }
    );

    const data = await response.json();

    // If email already exists
    if (data.error) {
      if (data.error.message?.includes('already registered')) {
        return res.status(400).json({ error: 'This email is already registered. Please log in instead.' });
      }
      return res.status(400).json({ error: data.error.message || 'Something went wrong.' });
    }

    // Success — account created, verification email sent
    // Also create a row in users table
await fetch(
  `${process.env.SUPABASE_URL}/rest/v1/users`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      id: data.user?.id,
      email: email.trim().toLowerCase(),
      full_name: full_name.trim()
    })
  }
);

return res.status(200).json({
  success: true,
  message: 'Account created! Please check your email to verify your account.'
});

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
