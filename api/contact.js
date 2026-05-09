// ═══════════════════════════════════════════════════════════
// UJYALO — CONTACT API
// Saves contact form messages to Supabase database
// File: api/contact.js
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the data from the form
  const { full_name, email, role, message } = req.body;

  // Validation — all fields are mandatory
  if (!full_name) return res.status(400).json({ error: 'Please enter your name.' });
  if (!email)     return res.status(400).json({ error: 'Please enter your email.' });
  if (!role)      return res.status(400).json({ error: 'Please select who you are.' });
  if (!message)   return res.status(400).json({ error: 'Please enter a message.' });

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    // Save to Supabase
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/contact_messages`,
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
          role: role,
          message: message.trim()
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return res.status(200).json({
      success: true,
      message: 'Message sent!'
    });

  } catch (error) {
    console.error('Contact error:', error);
    return res.status(500).json({
      error: 'Something went wrong. Please try again.'
    });
  }
}
