/* ============================================================
   UJYALO — components.js
   Global nav + footer injected on every page.
   Design system: Fraunces + Outfit, Editorial Scholar palette
   (forest --navy #11302a, brass --orange #c0913f)
   ============================================================ */

// ── SEE EXAM COUNTDOWN ──
// SEE happens around March–April; NEB announces the exact date a few months before.
// When the date is announced, set it here in AD format (YYYY-MM-DD) and the countdown
// turns on site-wide automatically. Leave blank to keep it off. It also hides itself
// once the date has passed, so a stale countdown can never show.
const SEE_EXAM_DATE = ''; // e.g. '2027-03-20' once NEB announces it

function seeDaysLeft() {
  if (!SEE_EXAM_DATE) return null;
  const d = new Date(SEE_EXAM_DATE + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  const days = Math.ceil((d - new Date()) / 86400000);
  return days > 0 ? days : null;
}

function buildAnnounce() {
  const days = seeDaysLeft();
  const cd = days ? ` · <b>${days} day${days !== 1 ? 's' : ''}</b> to the SEE exam` : '';
  return `
<div class="ujyalo-announce">
  🇳🇵 Free SEE practice for every Nepali student${cd}.
  <a href="/see.html">Start now →</a>
</div>`;
}

function buildCountdownStrip() {
  const days = seeDaysLeft();
  if (!days) return '';
  return `<div class="ujyalo-announce">⏳ <b>${days} day${days !== 1 ? 's' : ''}</b> to the SEE exam — keep practising.</div>`;
}

/* ── Text logo — sharp, scalable, consistent ── */
const LOGO_HTML = `<a href="/index.html" class="ujyalo-logo"><img src="/mark-dark.png" class="ujyalo-logo-mark" alt=""/><span class="ujyalo-logo-text">ujy<span class="ujyalo-logo-a">a</span>lo</span></a>`;

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

/* ── Staff nav (editor / admin — logged in) ── */
function buildStaffNav(role, initials, fullName, email) {
  const workspace = (role === 'admin') ? '/admin.html' : '/verify.html';
  const label     = (role === 'admin') ? 'Admin'       : 'Verify papers';
  const badge     = (role === 'admin') ? 'Admin'       : 'Editor';
  const badgeCss  = 'font-size:11px;font-weight:700;letter-spacing:.3px;color:#11302a;background:rgba(192,145,63,.16);border:1px solid rgba(192,145,63,.45);padding:4px 10px;border-radius:99px;';
  return `
<nav class="ujyalo-nav">
  <div class="ujyalo-nav-inner">
    ${LOGO_HTML}
    <div class="ujyalo-nav-links" id="nav-links">
      <a href="${workspace}">${label}</a>
    </div>
    <div class="ujyalo-nav-actions" id="nav-actions">
      <span class="ujyalo-staff-badge" style="${badgeCss}">${badge}</span>
      <div class="ujyalo-avwrap">
        <button class="ujyalo-avatar" id="ujyalo-avatar-btn" onclick="ujyaloToggleMenu(event)" aria-label="Account menu">${initials}</button>
        <div class="ujyalo-avmenu" id="ujyalo-avmenu">
          <div class="ujyalo-avmenu-head">
            <div class="ujyalo-avmenu-name">${fullName}</div>
            <div class="ujyalo-avmenu-email">${email}</div>
          </div>
          <a href="${workspace}" class="ujyalo-avmenu-item">⚙&nbsp; ${label}</a>
          <button onclick="ujyaloLogout()" class="ujyalo-avmenu-item danger">⇥&nbsp; Log out</button>
        </div>
      </div>
    </div>
    <button class="ujyalo-hamburger" id="nav-hamburger" aria-label="Open menu" onclick="toggleMobileNav()">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="ujyalo-mobile-menu" id="nav-mobile-menu">
    <a href="${workspace}">${label}</a>
    <div class="ujyalo-mobile-divider"></div>
    <button onclick="ujyaloLogout()" class="ujyalo-mobile-signup" style="border:none;cursor:pointer;font-family:inherit;">Log out</button>
  </div>
</nav>`;
}

/* ── App nav (logged in) ── */
function buildAppNav(firstName, initials, fullName, email) {
  const _u = JSON.parse(localStorage.getItem('ujyalo_user')||'null');
  const _role = _u && _u.role;
  // Staff get their own nav — never the student chrome (no streak, no student Dashboard/SEE).
  if (_role === 'admin' || _role === 'editor') return buildStaffNav(_role, initials, fullName, email);
  const _home = '/dashboard.html';
  return `
<nav class="ujyalo-nav">
  <div class="ujyalo-nav-inner">
    ${LOGO_HTML}
    <div class="ujyalo-nav-links" id="nav-links">
      <a href="${_home}">Dashboard</a>
      <a href="/see.html">SEE</a>
    </div>
    <div class="ujyalo-nav-actions" id="nav-actions">
      <span class="ujyalo-streak">🔥 <span id="nav-streak">0</span></span>
      <div class="ujyalo-avwrap">
        <button class="ujyalo-avatar" id="ujyalo-avatar-btn" onclick="ujyaloToggleMenu(event)" aria-label="Account menu">${initials}</button>
        <div class="ujyalo-avmenu" id="ujyalo-avmenu">
          <div class="ujyalo-avmenu-head">
            <div class="ujyalo-avmenu-name">${fullName}</div>
            <div class="ujyalo-avmenu-email">${email}</div>
          </div>
          <a href="/profile.html" class="ujyalo-avmenu-item">✎&nbsp; Edit profile</a>
          <button onclick="ujyaloLogout()" class="ujyalo-avmenu-item danger">⇥&nbsp; Log out</button>
        </div>
      </div>
    </div>
    <button class="ujyalo-hamburger" id="nav-hamburger" aria-label="Open menu" onclick="toggleMobileNav()">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="ujyalo-mobile-menu" id="nav-mobile-menu">
    <a href="${_home}">Dashboard</a>
    <a href="/see.html">SEE</a>
    <div class="ujyalo-mobile-divider"></div>
    <a href="/profile.html">Edit profile</a>
    <button onclick="ujyaloLogout()" class="ujyalo-mobile-signup" style="border:none;cursor:pointer;font-family:inherit;">Log out</button>
  </div>
</nav>`;
}

/* ── Footer ── */
const FOOTER = `
<footer class="ujyalo-footer">
  <div class="ujyalo-footer-inner">
    <div class="ujyalo-footer-brand">
      <a href="/index.html" class="ujyalo-logo ujyalo-logo-white"><img src="/mark.png" class="ujyalo-logo-mark" alt=""/><span class="ujyalo-logo-text">ujy<span class="ujyalo-logo-a">a</span>lo</span></a>
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
        <li><a href="/blog">Blog</a></li>
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
  --navy:  #11302A;   /* forest green (was #0d1b3e) */
  --navy2: #1C4A40;   /* lighter forest */
  --blue:  #1A6FC4;   /* subject-blue, kept for Maths accent */
  --teal:  #3F7D6E;   /* moss */
  --orange:#C0913F;   /* brass */
  --green: #15803D;
  --ink:   #1A2420;
  --muted: #5F6B64;
  --faint: #9AA49D;
  --line:  #E0D9C8;
  --bg:    #F4F0E6;   /* parchment */
  --card:  #FBF9F3;   /* warm card */
  /* Legacy aliases so existing index/main.css still works */
  --brand: #11302A;
  --brand-light: #DCE6E1;
  --ink-900: #1A2420;
  --ink-700: #2B3A33;
  --ink-500: #5F6B64;
  --ink-400: #9AA49D;
  --ink-100: #ECE6D6;
  --ink-50:  #F4F0E6;
  /* extra brand tokens */
  --brass: #C0913F;
  --brass-soft: #E7C986;
  --forest: #11302A;
}

/* Outfit applied to ujyalo nav/footer components */

/* ── ANNOUNCEMENT BAR ── */
.ujyalo-announce {
  background: var(--orange);
  padding: 8px 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #2A2110;
  letter-spacing: .15px;
}
.ujyalo-announce a {
  color: #2A2110;
  text-decoration: underline;
  margin-left: 4px;
}

/* ── LOGO ── */
.ujyalo-logo {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: var(--navy);
  text-decoration: none;
  letter-spacing: -.5px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ujyalo-logo-mark { height: 34px; width: auto; display: block; }
.ujyalo-logo-a { color: var(--orange); }
.ujyalo-logo-white { color: #fff; }
.ujyalo-logo-white .ujyalo-logo-a { color: var(--brass-soft); }

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
  color: var(--navy);
  font-weight: 700;
  border-bottom: 2px solid var(--orange);
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
  color: #7A5A1A;
  background: rgba(192,145,63,.12);
  padding: 5px 10px;
  border-radius: 99px;
}
.ujyalo-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--navy);
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
.ujyalo-avatar { cursor: pointer; border: 1px solid transparent; }
.ujyalo-avatar:hover { border-color: var(--brass-soft); }
.ujyalo-avwrap { position: relative; }
.ujyalo-avmenu { position:absolute; top:42px; right:0; background:var(--card); border:1px solid var(--line); border-radius:14px; box-shadow:0 10px 30px rgba(26,36,32,.16); padding:7px; min-width:212px; display:none; z-index:120; }
.ujyalo-avmenu.open { display:block; }
.ujyalo-avmenu-head { padding:10px 12px 11px; border-bottom:1px solid var(--line); margin-bottom:5px; }
.ujyalo-avmenu-name { font-weight:700; font-size:14px; color:var(--ink); }
.ujyalo-avmenu-email { font-size:12px; color:var(--muted); margin-top:1px; word-break:break-all; }
.ujyalo-avmenu-item { display:flex; align-items:center; gap:8px; padding:11px 12px; border-radius:10px; font-size:14px; font-weight:500; color:var(--ink); cursor:pointer; width:100%; text-align:left; background:none; border:none; font-family:inherit; text-decoration:none; }
.ujyalo-avmenu-item:hover { background:var(--bg); }
.ujyalo-avmenu-item.danger { color:#B5532E; }

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
  box-shadow: 0 8px 24px rgba(17,48,42,.08);
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
.ujyalo-mobile-menu a:hover { background: var(--bg); color: var(--navy); }
.ujyalo-mobile-menu a.active { color: var(--navy); font-weight: 700; }
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
.ujyalo-mobile-signup:hover { background: var(--navy2) !important; }

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
  color: var(--brass-soft);
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
  box-shadow: 0 4px 16px rgba(17,48,42,.3);
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
  const avm = document.getElementById('ujyalo-avmenu');
  const avb = document.getElementById('ujyalo-avatar-btn');
  if (avm && avm.classList.contains('open') && !avm.contains(e.target) && (!avb || !avb.contains(e.target))) avm.classList.remove('open');
  const menu = document.getElementById('nav-mobile-menu');
  const btn  = document.getElementById('nav-hamburger');
  if (!menu || !btn) return;
  if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
    btn.classList.remove('open');
  }
});

function ujyaloToggleMenu(e){
  if(e) e.stopPropagation();
  const m = document.getElementById('ujyalo-avmenu');
  if(m) m.classList.toggle('open');
}

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

  // Role guard: staff (admin/editor) belong in their workspace, not the student pages.
  // One login, role decides the door — keep them out of the student dashboard AND the student SEE hub.
  var _gu = JSON.parse(localStorage.getItem('ujyalo_user')||'null');
  var _gt = localStorage.getItem('ujyalo_token');
  var _gp = window.location.pathname.replace(/\/$/,'');
  var _staffHome = (_gu && _gu.role==='admin') ? '/admin.html'
                 : (_gu && _gu.role==='editor') ? '/verify.html' : null;
  if (_gu && _gt && _staffHome) {
    var _studentPage = _gp.endsWith('/dashboard.html') || _gp.endsWith('/dashboard')
                    || _gp.endsWith('/see.html')       || _gp.endsWith('/see');
    if (_studentPage) { window.location.replace(_staffHome); return; }
  }

  // Inject global styles + fonts
  document.head.insertAdjacentHTML('beforeend', GLOBAL_STYLES);

  // Fonts: ALWAYS load the canonical Fraunces (+Outfit/DM Sans) so the wordmark and
  // headings render identically on every page. Pages ship their own *partial* Fraunces
  // links (different weights — some miss 900), so we load the full set here to override
  // them, rather than skipping when any Fraunces link exists.
  if (!document.getElementById('ujyalo-fonts')) {
    const font = document.createElement('link');
    font.id = 'ujyalo-fonts';
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,600;1,9..144,700&family=Outfit:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(font);
  }

  // Favicon + app icons (full set). The .ico is also auto-fetched from the site root
  // by every browser, so the tab icon shows even before this script runs.
  if (!document.querySelector('link[rel="icon"]')) {
    document.head.insertAdjacentHTML('beforeend',
      '<link rel="icon" href="/favicon.ico" sizes="any">' +
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg">' +
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png">' +
      '<link rel="manifest" href="/site.webmanifest">');
  }

  // Nav
  const navEl = document.getElementById('site-nav');
  if (navEl) {
    const user  = JSON.parse(localStorage.getItem('ujyalo_user') || 'null');
    const token = localStorage.getItem('ujyalo_token');
    if (user && token) {
      const firstName = user.full_name ? user.full_name.split(' ')[0] : user.email.split('@')[0];
      const initials  = firstName.charAt(0).toUpperCase();
      navEl.innerHTML = buildCountdownStrip() + buildAppNav(firstName, initials, user.full_name || firstName, user.email || '');
    } else {
      navEl.innerHTML = buildAnnounce() + NAV_PUBLIC;
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
