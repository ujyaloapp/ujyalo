// ═══════════════════════════════════════════════════════════
// UJYALO — AUTH CONFIG API
// Returns public Supabase config safely for frontend use
// File: api/auth-config.js
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // Only return the anon key — never the service role key
  return res.status(200).json({
    anon_key: process.env.SUPABASE_ANON_KEY,
    url:      process.env.SUPABASE_URL,
  });
}
