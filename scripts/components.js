/* ============================================================
   UJYALO — components.js
   Controls nav and footer on EVERY page.
   ============================================================ */

const ANNOUNCEMENT = `
<div class="announcement-bar">
  🇳🇵 Ujyalo is here! Free SEE chapter practice for every Nepali student. No signup needed. <a href="/chapter-practice.html">Start now →</a>
</div>`;

/* ── Public nav — for logged out visitors ── */
const NAV_PUBLIC = `
<nav class="nav-public">
  <div class="container nav-inner">
    <a href="/index.html" class="logo">
      <img src="/ujyalo-logo-transparent.png" style="height:38px;width:auto;" alt="Ujyalo">
    </a>
    <div class="nav-links" id="nav-links">
      <a href="/practice.html">Practice</a>
      <a href="/features.html">Features</a>
      <a href="/pricing.html">Pricing</a>
      <a href="/about.html">About</a>
    </div>
    <div class="nav-actions" id="nav-actions">
      <a href="/login.html" class="btn btn-ghost">Log in</a>
      <a href="/signup.html" class="btn btn-primary">Sign up free →</a>
    </div>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" onclick="toggleMobileNav()">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="nav-mobile-menu" id="nav-mobile-menu" style="display:none;">
    <a href="/practice.html">Practice</a>
    <a href="/features.html">Features</a>
    <a href="/pricing.html">Pricing</a>
    <a href="/about.html">About</a>
    <div class="nav-mobile-divider"></div>
    <a href="/login.html" class="nav-mobile-login">Log in</a>
    <a href="/signup.html" class="nav-mobile-signup">Sign up free →</a>
  </div>
</nav>`;

/* ── App nav — for logged in students ── */
function buildAppNav(firstName, initials) {
  return `
<nav class="nav-app" style="background:white;border-bottom:1px solid var(--ink-100);padding:12px 0;position:sticky;top:0;z-index:50;">
  <div class="container nav-inner">
    <a href="/dashboard.html" class="logo">
      <img src="/ujyalo-logo-transparent.png" style="height:38px;width:auto;" alt="Ujyalo">
    </a>
    <div class="nav-links" id="nav-links" style="display:flex;gap:24px;font-size:14px;font-weight:500;">
      <a href="/dashboard.html">Dashboard</a>
      <a href="/practice.html">Practice</a>
      <a href="/progress.html">Progress</a>
      <a href="/profile.html">Profile</a>
    </div>
    <div class="nav-actions" style="display:flex;align-items:center;gap:10px;">
      <span class="streak-pill">🔥 <span id="nav-streak">0</span></span>
      <div style="width:32px;height:32px;border-radius:50%;background:var(--brand);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">${initials}</div>
      <button onclick="ujyaloLogout()" style="font-size:13px;color:var(--ink-500);background:none;border:none;cursor:pointer;font-family:inherit;font-weight:500;">Log out</button>
    </div>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" onclick="toggleMobileNav()">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="nav-mobile-menu" id="nav-mobile-menu" style="display:none;">
    <a href="/dashboard.html">Dashboard</a>
    <a href="/practice.html">Practice</a>
    <a href="/progress.html">Progress</a>
    <a href="/profile.html">Profile</a>
    <div class="nav-mobile-divider"></div>
    <button onclick="ujyaloLogout()" style="background:var(--ink-100);color:var(--ink-700);border:none;border-radius:999px;padding:12px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;width:100%;margin-top:4px;">Log out</button>
  </div>
</nav>`;
}

const NAV_STYLES = `
<style>
.nav-hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s;
}
.nav-hamburger:hover { background: var(--ink-100); }
.nav-hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--ink-900);
  border-radius: 2px;
  transition: all 0.3s;
}
.nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-hamburger.open span:nth-child(2) { opacity: 0; }
.nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.nav-mobile-menu {
  background: white;
  border-top: 1px solid var(--ink-100);
  padding: 12px 20px 20px;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 8px 24px rgba(10,22,40,0.1);
}
.nav-mobile-menu a {
  display: block;
  padding: 11px 12px;
  font-size: 15px;
  font-weight: 500;
  color: var(--ink-700);
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.15s;
}
.nav-mobile-menu a:hover { background: var(--ink-50); color: var(--brand); }
.nav-mobile-menu a.active { color: var(--brand); font-weight: 700; }
.nav-mobile-divider { height: 1px; background: var(--ink-100); margin: 8px 0; }
.nav-mobile-login { color: var(--ink-700) !important; }
.nav-mobile-signup {
  background: var(--ink-900) !important;
  color: white !important;
  text-align: center;
  border-radius: 999px !important;
  padding: 12px !important;
  font-weight: 700 !important;
  margin-top: 4px;
}
.nav-mobile-signup:hover { background: var(--brand) !important; }

@media (max-width: 768px) {
  .nav-hamburger { display: flex; }
  .nav-links { display: none !important; }
  .nav-actions { display: none !important; }
}
</style>`;

const FOOTER = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/index.html">
          <img src="/ujyalo-logo-transparent.png" style="height:36px;width:auto;filter:brightness(0) invert(1);" alt="Ujyalo">
        </a>
        <p>AI-powered exam preparation made with care, in Nepal.
        Helping students brighten their future, one question at a time.</p>
        <div class="footer-social mt-4">
          <a href="#" title="Facebook">f</a>
          <a href="#" title="Instagram">in</a>
          <a href="#" title="TikTok">tt</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Product</h4>
        <ul>
          <li><a href="/practice.html">Practice</a></li>
          <li><a href="/features.html">Features</a></li>
          <li><a href="/pricing.html">Pricing</a></li>
          <li><a href="/for-schools.html">For schools</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="/about.html">About us</a></li>
          <li><a href="/contact.html">Contact</a></li>
          <li><a href="/faq.html">FAQ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="/privacy.html">Privacy policy</a></li>
          <li><a href="/terms.html">Terms of service</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-bottom-left">© 2026 Ujyalo · Made in Nepal 🇳🇵</div>
      <div class="footer-social">
        <a href="#" title="Facebook">f</a>
        <a href="#" title="Instagram">in</a>
        <a href="#" title="TikTok">tt</a>
      </div>
      <div class="footer-bottom-right">Brighten your future.</div>
    </div>
  </div>
</footer>

<a href="/contact.html" class="help-bubble">
  <span class="help-bubble-icon">?</span>
  Need help?
</a>`;

// Toggle mobile nav
function toggleMobileNav() {
  const menu = document.getElementById('nav-mobile-menu');
  const btn  = document.getElementById('nav-hamburger');
  if (!menu || !btn) return;
  const isOpen = menu.style.display === 'flex';
  menu.style.display = isOpen ? 'none' : 'flex';
  btn.classList.toggle('open', !isOpen);
}

// Close mobile nav when clicking outside
document.addEventListener('click', function(e) {
  const menu = document.getElementById('nav-mobile-menu');
  const btn  = document.getElementById('nav-hamburger');
  if (!menu || !btn) return;
  if (menu.style.display === 'flex' && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.style.display = 'none';
    btn.classList.remove('open');
  }
});

// Global logout
function ujyaloLogout() {
  localStorage.removeItem('ujyalo_token');
  localStorage.removeItem('ujyalo_user');
  window.location.href = '/index.html';
}

// Google Analytics
(function() {
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-4CPQWFLERD';
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-4CPQWFLERD');
  window.gtag = gtag;
})();

// Microsoft Clarity
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "wpmkas1s1o");

document.addEventListener('DOMContentLoaded', function () {

  // Inject nav styles
  document.head.insertAdjacentHTML('beforeend', NAV_STYLES);

  // Favicon
  const favicon = document.createElement('link');
  favicon.rel   = 'icon';
  favicon.type  = 'image/svg+xml';
  favicon.href  = '/favicon.svg';
  document.head.appendChild(favicon);

  const faviconFallback = document.createElement('link');
  faviconFallback.rel  = 'icon';
  faviconFallback.href = '/favicon.ico';
  document.head.appendChild(faviconFallback);

  // Check if logged in
  const user  = JSON.parse(localStorage.getItem('ujyalo_user') || 'null');
  const token = localStorage.getItem('ujyalo_token');

  const navEl = document.getElementById('site-nav');

  if (user && token) {
    // ── LOGGED IN — show app nav, no announcement bar ──
    const firstName = user.full_name
      ? user.full_name.split(' ')[0]
      : user.email.split('@')[0];
    const initials = firstName.charAt(0).toUpperCase();

    if (navEl) navEl.innerHTML = buildAppNav(firstName, initials);

  } else {
    // ── LOGGED OUT — show public nav + announcement bar ──
    if (navEl) navEl.innerHTML = ANNOUNCEMENT + NAV_PUBLIC;
  }

  // Footer
  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.innerHTML = FOOTER;

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile-menu a').forEach(link => {
    const linkPage = link.getAttribute('href') && link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) link.classList.add('active');
  });

});
