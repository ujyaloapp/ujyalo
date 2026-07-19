// Public site settings — the safe, read-only copy the browser applies
// (countdown date, announcement band, feature visibility). No auth: everything
// here is meant to be public. Reads server-side with the service key; always
// returns sensible defaults so the site never breaks if the row/table is absent.

const DEFAULTS = {
  see_exam_date: null,
  announce_on: true,
  announce_text: null,
  feature_formulas: true,
  feature_mocks: false,
  feature_plus: false,
};

export default async function handler(req, res) {
  // Short cache — admin edits show up within ~30s; keeps this cheap under load.
  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
  try {
    const r = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=see_exam_date,announce_on,announce_text,feature_formulas,feature_mocks,feature_plus`,
      { headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}` } }
    );
    const rows = await r.json();
    const s = (Array.isArray(rows) && rows[0]) ? rows[0] : {};
    return res.status(200).json({
      see_exam_date: s.see_exam_date || null,
      announce_on: s.announce_on !== false,
      announce_text: s.announce_text || null,
      feature_formulas: s.feature_formulas !== false,
      feature_mocks: !!s.feature_mocks,
      feature_plus: !!s.feature_plus,
    });
  } catch (e) {
    return res.status(200).json(DEFAULTS);
  }
}
