// /api/auth-forgot-password.js
// Sends a password reset email via Supabase Auth

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://ujyalo.app/reset-password.html',
    });

    // Always return success — don't reveal if email exists or not (security)
    if (error) {
      console.error('Reset password error:', error.message);
      // Still return success to the client for security
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Forgot password handler error:', err);
    return res.status(200).json({ success: true }); // Always success for security
  }
}
