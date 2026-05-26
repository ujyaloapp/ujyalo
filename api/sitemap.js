// ============================================================
// UJYALO — DYNAMIC SITEMAP GENERATOR
// Route: /sitemap.xml (via vercel.json rewrite)
// Generates sitemap automatically — no manual updates needed
// Add new pages to the PAGES array below
// ============================================================

const BASE_URL = 'https://ujyalo.app';

// ── Static public pages ──────────────────────────────────────
// Add any new public page here and it appears in sitemap automatically
const PAGES = [
  { path: '/',                    priority: '1.0', changefreq: 'weekly'  },
  { path: '/chapter-practice.html', priority: '0.9', changefreq: 'weekly'  },
  { path: '/see-practice.html',   priority: '0.8', changefreq: 'weekly'  },
  { path: '/signup.html',         priority: '0.8', changefreq: 'monthly' },
  { path: '/features.html',       priority: '0.7', changefreq: 'monthly' },
  { path: '/for-schools.html',    priority: '0.7', changefreq: 'monthly' },
  { path: '/pricing.html',        priority: '0.7', changefreq: 'monthly' },
  { path: '/how-it-works.html',   priority: '0.6', changefreq: 'monthly' },
  { path: '/about.html',          priority: '0.6', changefreq: 'monthly' },
  { path: '/faq.html',            priority: '0.6', changefreq: 'monthly' },
  { path: '/contact.html',        priority: '0.5', changefreq: 'monthly' },
  { path: '/login.html',          priority: '0.4', changefreq: 'monthly' },
  { path: '/terms.html',          priority: '0.3', changefreq: 'yearly'  },
  { path: '/privacy.html',        priority: '0.3', changefreq: 'yearly'  },
];

// ── Chapter pages (add when you build them) ──────────────────
// These will be chapter-specific SEO pages e.g. /see/maths/compound-interest
// Uncomment and populate when ready:
// const CHAPTER_PAGES = [
//   { path: '/see/maths/compound-interest', priority: '0.8', changefreq: 'monthly' },
//   { path: '/see/maths/circle-theorems',   priority: '0.8', changefreq: 'monthly' },
//   { path: '/see/maths/trigonometry',      priority: '0.8', changefreq: 'monthly' },
// ];

function buildSitemap(urls) {
  const today = new Date().toISOString().split('T')[0];

  const urlEntries = urls.map(({ path, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

export default async function handler(req, res) {
  try {
    // Future: fetch dynamic pages from Supabase here
    // e.g. past paper pages, chapter pages
    // const { data } = await fetch(supabase chapters endpoint)
    // const chapterUrls = data.map(ch => ({ path: `/see/${ch.subject}/${ch.slug}`, ... }))

    const allUrls = [
      ...PAGES,
      // ...chapterUrls  // add when chapter pages are built
    ];

    const sitemap = buildSitemap(allUrls);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.status(200).send(sitemap);

  } catch (err) {
    console.error('Sitemap error:', err);
    return res.status(500).send('Error generating sitemap');
  }
}
