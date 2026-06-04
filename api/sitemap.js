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
  { path: '/see-past-papers.html', priority: '0.9', changefreq: 'weekly'  },
  { path: '/see/past-papers',      priority: '0.9', changefreq: 'weekly'  },
  { path: '/blog',                 priority: '0.8', changefreq: 'weekly'  },
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

// ── Blog posts — static HTML files in /blog/ ─────────────────
// Add one line here each time you publish a new post.
const BLOG_POSTS = [
  { path: '/blog/how-to-use-see-past-papers.html', priority: '0.7', changefreq: 'monthly' },
];

// ── Past paper pages — fetched dynamically from Supabase ──────
// Auto-generates URLs for all live past papers
// Add new paper to Supabase → appears in sitemap automatically

async function getPastPaperUrls() {
  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/past_papers?status=eq.live&select=year,province,subject_id,exam_subjects(code)`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );
    const papers = await res.json();
    if (!Array.isArray(papers)) return [];
    return papers.map(p => ({
      path: `/see/past-papers/${p.year}/${p.province?.toLowerCase()}/${p.exam_subjects?.code?.toLowerCase() || 'maths'}`,
      priority: '0.9',
      changefreq: 'monthly'
    }));
  } catch(e) {
    return [];
  }
}

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

    const pastPaperUrls = await getPastPaperUrls();
    const allUrls = [
      ...PAGES,
      ...BLOG_POSTS,
      ...pastPaperUrls,
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
