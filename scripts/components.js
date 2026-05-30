/* ============================================================
   UJYALO — components.js
   Global nav + footer injected on every page.
   Design system: Fraunces + DM Sans, --navy #0d1b3e, --blue #1a6fff
   ============================================================ */

const ANNOUNCEMENT = `
<div class="ujyalo-announce">
  🇳🇵 Free SEE practice for every Nepali student. No signup needed.
  <a href="/see.html">Start now →</a>
</div>`;

/* ── Text logo — sharp, scalable, consistent ── */
const LOGO_HTML = `<a href="/index.html" class="ujyalo-logo">ujy<span>a</span>lo</a>`;

/* ── Public nav ── */
const NAV_PUBLIC = `
<nav class="ujyalo-nav">
  <div class="ujyalo-nav-inner">
    ${LOGO_HTML}
    <div class="ujyalo-nav-links" id="nav-links">
      <a href="/see.html">SEE</a>
      <a href="/features.html">Features</a>
      <a href="/pricing.html">Pricing</a>
      <a href="/about.html">About</a>
    </div>
    <div class="ujyalo-nav-actions" id="nav-actions">
      <a href="/login.html" class="ujyalo-btn-ghost">Log in</a>
      <a href="/signup.html" class="ujyalo-btn-primary">Sign up free →</a>
    </div>
    <button class="ujyalo-hamburger" id="nav-hamburger" aria-label="Open menu" onclick="toggleMobileNav()">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="ujyalo-mobile-menu" id="nav-mobile-menu">
    <a href="/see.html">SEE</a>
    <a href="/features.html">Features</a>
    <a href="/pricing.html">Pricing</a>
    <a href="/about.html">About</a>
    <div class="ujyalo-mobile-divider"></div>
    <a href="/login.html" class="ujyalo-mobile-login">Log in</a>
    <a href="/signup.html" class="ujyalo-mobile-signup">Sign up free →</a>
  </div>
</nav>`;

/* ── App nav (logged in) ── */
function buildAppNav(firstName, initials) {
  return `
<nav class="ujyalo-nav">
  <div class="ujyalo-nav-inner">
    ${LOGO_HTML}
    <div class="ujyalo-nav-links" id="nav-links">
      <a href="/dashboard.html">Dashboard</a>
      <a href="/see.html">SEE</a>
      <a href="/progress.html">Progress</a>
    </div>
    <div class="ujyalo-nav-actions" id="nav-actions">
      <span class="ujyalo-streak">🔥 <span id="nav-streak">0</span></span>
      <div class="ujyalo-avatar">${initials}</div>
      <button onclick="ujyaloLogout()" class="ujyalo-logout-btn">Log out</button>
    </div>
    <button class="ujyalo-hamburger" id="nav-hamburger" aria-label="Open menu" onclick="toggleMobileNav()">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="ujyalo-mobile-menu" id="nav-mobile-menu">
    <a href="/dashboard.html">Dashboard</a>
    <a href="/see.html">SEE</a>
    <a href="/progress.html">Progress</a>
    <div class="ujyalo-mobile-divider"></div>
    <button onclick="ujyaloLogout()" class="ujyalo-mobile-signup" style="border:none;cursor:pointer;font-family:inherit;">Log out</button>
  </div>
</nav>`;
}

/* ── Footer ── */
const FOOTER = `
<footer class="ujyalo-footer">
  <div class="ujyalo-footer-inner">
    <div class="ujyalo-footer-brand">
      <a href="/index.html" class="ujyalo-logo ujyalo-logo-white">ujy<span>a</span>lo</a>
      <p>AI-powered exam preparation made with care, in Nepal. Helping students brighten their future, one question at a time.</p>
    </div>
    <div class="ujyalo-footer-col">
      <h4>Product</h4>
      <ul>
        <li><a href="/see.html">SEE Practice</a></li>
        <li><a href="/features.html">Features</a></li>
        <li><a href="/pricing.html">Pricing</a></li>
        <li><a href="/for-schools.html">For schools</a></li>
      </ul>
    </div>
    <div class="ujyalo-footer-col">
      <h4>Company</h4>
      <ul>
        <li><a href="/about.html">About us</a></li>
        <li><a href="/contact.html">Contact</a></li>
        <li><a href="/faq.html">FAQ</a></li>
      </ul>
    </div>
    <div class="ujyalo-footer-col">
      <h4>Legal</h4>
      <ul>
        <li><a href="/privacy.html">Privacy policy</a></li>
        <li><a href="/terms.html">Terms of service</a></li>
      </ul>
    </div>
  </div>
  <div class="ujyalo-footer-bottom">
    <span>© 2026 Ujyalo · Made in Nepal 🇳🇵</span>
    <span>Brighten your future.</span>
  </div>
</footer>
<a href="/contact.html" class="ujyalo-help-bubble">? Need help?</a>`;

/* ── All styles ── */
const GLOBAL_STYLES = `
<style>
:root {
  --navy:  #0d1b3e;
  --navy2: #162550;
  --blue:  #1a6fff;
  --teal:  #38c9b0;
  --orange:#f59c1a;
  --green: #22c55e;
  --ink:   #0f1923;
  --muted: #5c6a80;
  --faint: #94a3b8;
  --line:  #e8edf5;
  --bg:    #f3f5fb;
  --card:  #ffffff;
  /* Legacy aliases so existing index/main.css still works */
  --brand: #1a6fff;
  --brand-light: #e8f0ff;
  --ink-900: #0f1923;
  --ink-700: #2d3a4a;
  --ink-500: #5c6a80;
  --ink-400: #94a3b8;
  --ink-100: #e8edf5;
  --ink-50:  #f3f5fb;
}

/* DM Sans applied only to ujyalo nav/footer components, not globally */

/* ── ANNOUNCEMENT BAR ── */
.ujyalo-announce {
  background: var(--orange);
  padding: 8px 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  letter-spacing: .15px;
}
.ujyalo-announce a {
  color: #fff;
  text-decoration: underline;
  margin-left: 4px;
}

/* ── LOGO ── */
.ujyalo-logo {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 900;
  color: var(--navy);
  text-decoration: none;
  letter-spacing: -.5px;
  flex-shrink: 0;
}
.ujyalo-logo span { color: var(--blue); }
.ujyalo-logo-white { color: #fff; }
.ujyalo-logo-white span { color: var(--teal); }

/* ── NAV ── */
.ujyalo-nav {
  background: var(--card);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 100;
}
.ujyalo-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.ujyalo-nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}
.ujyalo-nav-links a {
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: color .15s;
  padding-bottom: 2px;
}
.ujyalo-nav-links a:hover { color: var(--ink); }
.ujyalo-nav-links a.active {
  color: var(--blue);
  font-weight: 700;
  border-bottom: 2px solid var(--blue);
}
.ujyalo-nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.ujyalo-btn-ghost {
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 10px;
  transition: background .15s;
}
.ujyalo-btn-ghost:hover { background: var(--bg); color: var(--ink); }
.ujyalo-btn-primary {
  background: var(--navy);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  padding: 9px 18px;
  border-radius: 10px;
  transition: opacity .15s;
  white-space: nowrap;
}
.ujyalo-btn-primary:hover { opacity: .85; }
.ujyalo-streak {
  font-size: 13px;
  font-weight: 700;
  color: var(--orange);
  background: rgba(245,156,26,.1);
  padding: 5px 10px;
  border-radius: 99px;
}
.ujyalo-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--blue);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}
.ujyalo-logout-btn {
  font-size: 13px;
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

/* ── HAMBURGER ── */
.ujyalo-hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  margin-left: auto;
}
.ujyalo-hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--ink);
  border-radius: 2px;
  transition: all .25s;
}
.ujyalo-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.ujyalo-hamburger.open span:nth-child(2) { opacity: 0; }
.ujyalo-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── MOBILE MENU ── */
.ujyalo-mobile-menu {
  display: none;
  flex-direction: column;
  background: var(--card);
  border-top: 1px solid var(--line);
  padding: 10px 20px 18px;
  box-shadow: 0 8px 24px rgba(10,22,40,.08);
}
.ujyalo-mobile-menu.open { display: flex; }
.ujyalo-mobile-menu a {
  display: block;
  padding: 11px 12px;
  font-size: 15px;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  border-radius: 8px;
}
.ujyalo-mobile-menu a:hover { background: var(--bg); color: var(--blue); }
.ujyalo-mobile-menu a.active { color: var(--blue); font-weight: 700; }
.ujyalo-mobile-divider { height: 1px; background: var(--line); margin: 6px 0; }
.ujyalo-mobile-login { color: var(--muted) !important; }
.ujyalo-mobile-signup {
  background: var(--navy) !important;
  color: #fff !important;
  text-align: center !important;
  border-radius: 10px !important;
  padding: 12px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  margin-top: 4px;
  display: block;
  text-decoration: none;
}
.ujyalo-mobile-signup:hover { background: var(--blue) !important; }

@media (max-width: 768px) {
  .ujyalo-hamburger { display: flex; }
  .ujyalo-nav-links { display: none !important; }
  .ujyalo-nav-actions { display: none !important; }
  .ujyalo-nav-inner { padding: 0 16px; gap: 12px; }
}

/* ── FOOTER ── */
.ujyalo-footer {
  background: var(--navy);
  color: rgba(255,255,255,.7);
  padding: 48px 0 0;
  margin-top: 0;
}
.ujyalo-footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 28px 40px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
}
.ujyalo-footer-brand p {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255,255,255,.45);
  margin-top: 12px;
  max-width: 260px;
}
.ujyalo-footer-col h4 {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,.35);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
}
.ujyalo-footer-col ul { list-style: none; padding: 0; margin: 0; }
.ujyalo-footer-col li { margin-bottom: 10px; }
.ujyalo-footer-col a {
  font-size: 14px;
  color: rgba(255,255,255,.6);
  text-decoration: none;
  transition: color .15s;
}
.ujyalo-footer-col a:hover { color: #fff; }
.ujyalo-footer-bottom {
  border-top: 1px solid rgba(255,255,255,.08);
  padding: 16px 28px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255,255,255,.3);
}
@media (max-width: 768px) {
  .ujyalo-footer-inner { grid-template-columns: 1fr 1fr; gap: 28px; padding: 0 16px 32px; }
  .ujyalo-footer-brand { grid-column: 1/-1; }
  .ujyalo-footer-bottom { padding: 14px 16px; flex-direction: column; gap: 4px; text-align: center; }
}

/* ── HELP BUBBLE ── */
.ujyalo-help-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--navy);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 99px;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(13,27,62,.3);
  z-index: 200;
  transition: opacity .15s;
}
.ujyalo-help-bubble:hover { opacity: .85; }


</style>`;

/* ── JS functions ── */
function toggleMobileNav() {
  const menu = document.getElementById('nav-mobile-menu');
  const btn  = document.getElementById('nav-hamburger');
  if (!menu || !btn) return;
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
}

document.addEventListener('click', function(e) {
  const menu = document.getElementById('nav-mobile-menu');
  const btn  = document.getElementById('nav-hamburger');
  if (!menu || !btn) return;
  if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
    btn.classList.remove('open');
  }
});

function ujyaloLogout() {
  localStorage.removeItem('ujyalo_token');
  localStorage.removeItem('ujyalo_user');
  window.location.href = '/index.html';
}

/* ── Google Analytics (real tag) ── */
(function() {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-4CPQWFLERD';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-4CPQWFLERD');
  window.gtag = gtag;
})();

/* ── Microsoft Clarity ── */
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "wpmkas1s1o");

/* ── DOMContentLoaded — inject everything ── */
document.addEventListener('DOMContentLoaded', function() {

  // Inject global styles + fonts
  document.head.insertAdjacentHTML('beforeend', GLOBAL_STYLES);

  // Favicon
  if (!document.querySelector('link[rel="icon"]')) {
    const fav = document.createElement('link');
    fav.rel = 'icon'; fav.type = 'image/svg+xml'; fav.href = '/favicon.svg';
    document.head.appendChild(fav);
  }

  // Nav
  const navEl = document.getElementById('site-nav');
  if (navEl) {
    const user  = JSON.parse(localStorage.getItem('ujyalo_user') || 'null');
    const token = localStorage.getItem('ujyalo_token');
    if (user && token) {
      const firstName = user.full_name ? user.full_name.split(' ')[0] : user.email.split('@')[0];
      const initials  = firstName.charAt(0).toUpperCase();
      navEl.innerHTML = buildAppNav(firstName, initials);
    } else {
      navEl.innerHTML = ANNOUNCEMENT + NAV_PUBLIC;
    }
  }

  // Footer
  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.innerHTML = FOOTER;

  // Active nav link
  const currentPage = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.ujyalo-nav-links a, .ujyalo-mobile-menu a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && currentPage.endsWith(href.replace('.html', ''))) {
      link.classList.add('active');
    }
  });

});
