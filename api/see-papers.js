// ============================================================
// UJYALO — SEE Papers Data API
// Route: /api/see-papers
// Returns all live papers grouped by subject/year/province
// Used by see.html library page (client-side fetch)
// Keys stay server-side — never exposed to client
// ============================================================

async function fetchFromSupabase(path) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    }
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  try {
    const [papers, subjects] = await Promise.all([
      fetchFromSupabase('/past_papers?status=eq.live&select=id,year,province,subject_id,total_marks,duration&order=year.desc'),
      fetchFromSupabase('/exam_subjects?select=id,name,code&order=name.asc')
    ]);

    // Build subject map
    const subjectMap = {};
    subjects.forEach(s => { subjectMap[s.id] = s; });

    // Group papers: { subjectCode: { year: [provinces] } }
    const grouped = {};
    papers.forEach(p => {
      const subj = subjectMap[p.subject_id];
      if (!subj) return;
      if (!grouped[subj.code]) grouped[subj.code] = {};
      if (!grouped[subj.code][p.year]) grouped[subj.code][p.year] = [];
      grouped[subj.code][p.year].push({
        province: p.province,
        id: p.id,
        marks: p.total_marks,
        duration: p.duration
      });
    });

    res.status(200).json({ grouped, subjects });
  } catch (err) {
    console.error('see-papers error:', err);
    res.status(500).json({ error: 'Failed to load papers' });
  }
};
