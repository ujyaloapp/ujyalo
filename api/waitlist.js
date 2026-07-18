// ═══════════════════════════════════════════════════════════
// UJYALO — WAITLIST API
// Saves waitlist signups to Supabase database
// File: api/waitlist.js
// ═══════════════════════════════════════════════════════════

// Best-effort per-IP rate limit (per warm instance) to blunt spam signups.
const _hits = new Map();
function rateLimited(ip, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (_hits.get(ip) || []).filter(t => now - t < windowMs);
  arr.push(now);
  _hits.set(ip, arr);
  if (_hits.size > 5000) _hits.clear();
  return arr.length > limit;
}
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || req.headers['x-real-ip'] || 'unknown';
}

export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: 'Too many requests. Please wait a few minutes and try again.' });
  }

  // Get the data from the form
  const { full_name, email, role } = req.body;

  // Basic validation — make sure nothing is empty
  if (!full_name || !email || !role) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  try {
    // Save to Supabase
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/waitlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          full_name: full_name.trim(),
          email: email.trim().toLowerCase(),
          role: role
        })
      }
    );

    // Check if it saved successfully
    if (!response.ok) {
      const error = await response.text();

      // If email already exists — still show success (don't tell them)
      if (error.includes('duplicate') || error.includes('unique')) {
        return res.status(200).json({
          success: true,
          message: 'You are on the waitlist!'
        });
      }

      throw new Error(error);
    }

    // Success
    return res.status(200).json({
      success: true,
      message: 'You are on the waitlist!'
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    return res.status(500).json({
      error: 'Something went wrong. Please try again.'
    });
  }
}
