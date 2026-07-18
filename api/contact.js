// ═══════════════════════════════════════════════════════════
// UJYALO — CONTACT API
// Saves message to Supabase + sends confirmation email via Resend
// ═══════════════════════════════════════════════════════════

// Escape anything the visitor typed before it goes into an HTML email, so a
// name/message can't inject markup or links into the emails we send/receive.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
// Plain one-line version for the email Subject (no HTML entities there).
function oneLine(s) { return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim(); }

// Best-effort per-IP rate limit (per warm instance) to blunt form spam.
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: 'Too many messages. Please wait a few minutes and try again.' });
  }

  const { full_name, email, role, message } = req.body;

  if (!full_name) return res.status(400).json({ error: 'Please enter your name.' });
  if (!email)     return res.status(400).json({ error: 'Please enter your email.' });
  if (!role)      return res.status(400).json({ error: 'Please select who you are.' });
  if (!message)   return res.status(400).json({ error: 'Please enter a message.' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Escaped copies for use inside the HTML emails, plus plain copies for headers.
  const nameSafe  = esc(full_name.trim());
  const emailSafe = esc(email.trim());
  const roleSafe  = esc(role);
  const msgSafe   = esc(message.trim());
  const subjName  = oneLine(full_name.trim());
  const subjEmail = oneLine(email.trim());

  try {
    // 1. Save to Supabase
    const dbRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/contact_messages`, {
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
        role,
        message: message.trim()
      })
    });

    if (!dbRes.ok) {
      const err = await dbRes.text();
      throw new Error(err);
    }

    // 2. Send confirmation email to the person who contacted
    const confirmationEmail = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td style="background:#0A1628;padding:24px 32px;border-radius:10px 10px 0 0;">
        <span style="font-size:20px;font-weight:700;color:#0f766e;">✦ ujyalo</span>
      </td></tr>
      <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
        <p style="font-size:22px;font-weight:500;color:#0A1628;margin:0 0 12px;">We got your message.</p>
        <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 24px;">Thanks for reaching out, ${nameSafe}. We've received your message and will get back to you as soon as we can.</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
          <tr><td style="background:#EFF6FF;border-radius:8px;padding:16px 20px;">
            <p style="font-size:13px;font-weight:500;color:#185FA5;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.06em;">Your message</p>
            <p style="font-size:14px;color:#374151;line-height:1.6;margin:0;font-style:italic;">"${msgSafe}"</p>
          </td></tr>
        </table>
        <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 24px;">While you wait, you can start practising with our SEE chapter practice — it's completely free.</p>
        <a href="https://ujyalo.app/chapter-practice.html" style="display:inline-block;background:#185FA5;color:#ffffff;padding:13px 28px;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none;margin-bottom:28px;">Start practising →</a>
        <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 20px;">
        <p style="font-size:13px;color:#9CA3AF;line-height:1.6;margin:0;">To reach us directly, email <a href="mailto:hello@ujyalo.app" style="color:#9CA3AF;">hello@ujyalo.app</a>.</p>
      </td></tr>
      <tr><td style="background:#F9FAFB;border:1px solid #E5E7EB;border-top:none;padding:20px 32px;border-radius:0 0 10px 10px;text-align:center;">
        <p style="font-size:14px;font-weight:500;color:#6B7280;margin:0 0 8px;">ujyalo</p>
        <p style="margin:0 0 8px;">
          <a href="https://ujyalo.app/chapter-practice.html" style="font-size:12px;color:#9CA3AF;text-decoration:none;margin:0 8px;">Practice</a>
          <a href="https://ujyalo.app/contact.html" style="font-size:12px;color:#9CA3AF;text-decoration:none;margin:0 8px;">Contact</a>
          <a href="https://ujyalo.app/privacy.html" style="font-size:12px;color:#9CA3AF;text-decoration:none;margin:0 8px;">Privacy</a>
        </p>
        <p style="font-size:12px;color:#9CA3AF;margin:0;">© 2026 Ujyalo · Made in Nepal 🇳🇵</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

    // 3. Internal notification to hello@ujyalo.app
    const notificationEmail = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td style="background:#0A1628;padding:24px 32px;border-radius:10px 10px 0 0;">
        <span style="font-size:20px;font-weight:700;color:#0f766e;">✦ ujyalo</span>
        <span style="font-size:12px;color:#94A3B8;margin-left:12px;">New contact message</span>
      </td></tr>
      <tr><td style="background:#ffffff;padding:32px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 10px 10px;">
        <p style="font-size:18px;font-weight:500;color:#0A1628;margin:0 0 20px;">New message from ${nameSafe}</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6B7280;width:100px;">Name</td><td style="padding:6px 0;color:#111827;font-weight:500;">${nameSafe}</td></tr>
          <tr><td style="padding:6px 0;color:#6B7280;">Email</td><td style="padding:6px 0;color:#185FA5;"><a href="mailto:${emailSafe}" style="color:#185FA5;">${emailSafe}</a></td></tr>
          <tr><td style="padding:6px 0;color:#6B7280;">Role</td><td style="padding:6px 0;color:#111827;">${roleSafe}</td></tr>
        </table>
        <div style="background:#F9FAFB;border-radius:8px;padding:16px 20px;border-left:3px solid #185FA5;">
          <p style="font-size:13px;color:#6B7280;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
          <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;">${msgSafe}</p>
        </div>
        <p style="margin:20px 0 0;"><a href="mailto:${emailSafe}" style="display:inline-block;background:#185FA5;color:#ffffff;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;">Reply to ${nameSafe} →</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

    // Send both emails via Resend.
    // The message is already saved above, so even if email delivery fails the
    // contact is never lost — we just log the failure so it can be looked into.
    const [userEmailRes, adminEmailRes] = await Promise.all([
      // Confirmation to user
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Ujyalo <hello@ujyalo.app>',
          to: [email.trim().toLowerCase()],
          subject: 'We received your message',
          html: confirmationEmail,
        })
      }),
      // Notification to admin — reply_to set to the person who contacted
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Ujyalo Contact <hello@ujyalo.app>',
          to: ['hello@ujyalo.app'],
          reply_to: email.trim().toLowerCase(),
          subject: `New message from ${subjName} — ${subjEmail}`,
          html: notificationEmail,
        })
      })
    ]);

    if (!userEmailRes.ok) console.error('Contact: user confirmation email failed', await userEmailRes.text());
    if (!adminEmailRes.ok) console.error('Contact: admin notification email failed', await adminEmailRes.text());

    return res.status(200).json({ success: true, message: 'Message sent!' });

  } catch (error) {
    console.error('Contact error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
