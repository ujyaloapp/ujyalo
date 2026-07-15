// ============================================================
// UJYALO — AUTH API
// Handles: login, signup, forgot-password, change-password, config
// Route via ?action= parameter
// Role-based routing — reads from users table, no hardcoded emails
// ============================================================

export default async function handler(req, res) {
  const action = req.query.action || req.body?.action;

  // ── Config (GET) ──────────────────────────────────────────
  if (req.method === 'GET' && action === 'config') {
    return res.status(200).json({
      anon_key: process.env.SUPABASE_ANON_KEY,
      url:      process.env.SUPABASE_URL,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Login ─────────────────────────────────────────────────
  if (action === 'login') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      // Step 1: Authenticate with Supabase
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

      if (!data.user?.email_confirmed_at) {
        return res.status(401).json({
          error: 'Please verify your email first — check your inbox and your spam/junk folder for the confirmation link.',
          needsVerification: true,
          email: data.user.email || email,
        });
      }

      // Step 2: Get role from users table
      // Uses service role key — server side only, never exposed to browser
      const userRow = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${data.user.id}&select=role,full_name,streak,questions_count`,
        {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          }
        }
      );
      const userData = await userRow.json();
      const role = userData?.[0]?.role || 'student';

      // Step 3: Redirect based on role
      let redirectTo = '/dashboard.html';
      if (role === 'admin')   redirectTo = '/admin.html';
      if (role === 'editor')  redirectTo = '/verify.html';

      return res.status(200).json({
        success: true,
        access_token: data.access_token,
        redirectTo,
        user: {
          id:              data.user.id,
          email:           data.user.email,
          full_name:       userData?.[0]?.full_name || data.user.user_metadata?.full_name || '',
          role,
          streak:          userData?.[0]?.streak || 0,
          questions_count: userData?.[0]?.questions_count || 0,
          created_at:      data.user.created_at,
        }
      });

    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }

  // ── Signup ────────────────────────────────────────────────
  if (action === 'signup') {
    const { full_name, email, password } = req.body;

    if (!full_name) return res.status(400).json({ error: 'Please enter your full name.' });
    if (!email)     return res.status(400).json({ error: 'Please enter your email.' });
    if (!password)  return res.status(400).json({ error: 'Please enter a password.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          data: { full_name: full_name.trim() }
        })
      });

      const data = await response.json();

      if (data.error) {
        if (data.error.message?.includes('already registered')) {
          return res.status(400).json({ error: 'This email is already registered. Please log in instead.' });
        }
        return res.status(400).json({ error: data.error.message || 'Something went wrong.' });
      }

      // Note: users table row is now created automatically via DB trigger
      // trigger: on_auth_user_created → handle_new_user()

      return res.status(200).json({
        success: true,
        message: 'Account created! Check your email — including your spam or junk folder — for the confirmation link.'
      });

    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }

  // ── Resend the signup confirmation email ──────────────────
  if (action === 'resend-confirmation') {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Please enter your email.' });
    try {
      const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': process.env.SUPABASE_ANON_KEY },
        body: JSON.stringify({ type: 'signup', email: email.trim().toLowerCase() }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        const msg = (d.msg || d.error_description || d.error?.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('confirmed')) {
          return res.status(200).json({ success: true, message: 'This email is already verified — you can log in.' });
        }
        // Don't reveal whether the account exists — always look successful.
        return res.status(200).json({ success: true, message: 'If that account needs confirming, we just sent a fresh link. Check your inbox and spam folder.' });
      }
      return res.status(200).json({ success: true, message: 'Confirmation email sent! Check your inbox and your spam/junk folder.' });
    } catch (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Could not resend right now. Please try again.' });
    }
  }

  // ── Forgot password ───────────────────────────────────────
  if (action === 'forgot-password') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    try {
      await fetch(`${process.env.SUPABASE_URL}/auth/v1/recover`, {
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

      return res.status(200).json({ success: true });

    } catch (err) {
      console.error('Forgot password error:', err);
      return res.status(200).json({ success: true });
    }
  }

  // ── Change password ───────────────────────────────────────
  if (action === 'change-password') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const { password } = req.body;

    if (!password) return res.status(400).json({ error: 'Password is required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(400).json({ error: data.message || 'Failed to update password.' });
      }

      return res.status(200).json({ success: true });

    } catch (err) {
      console.error('Change password error:', err);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }

  // ── Get role (GET) — used by confirm.html after email verification ──
  if (req.method === 'GET' && action === 'get-role') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    try {
      // Verify the token belongs to this user
      const verify = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      const authUser = await verify.json();
      if (authUser.id !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Get role using service key — secure, server side only
      const userRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${id}&select=role,full_name`,
        {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
          }
        }
      );
      const userData = await userRes.json();
      return res.status(200).json({
        role:      userData?.[0]?.role || 'student',
        full_name: userData?.[0]?.full_name || ''
      });
    } catch(err) {
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  }

  return res.status(400).json({ error: 'Invalid action.' });
}
