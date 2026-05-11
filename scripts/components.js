/* ============================================================
   UJYALO — components.js
   This file controls the nav and footer on EVERY page.
   Want to change the nav? Change it here. Done.
   Want to change the footer? Change it here. Done.
   ============================================================ */

const ANNOUNCEMENT = `
<div class="announcement-bar">
  🎉 Ujyalo is completely free during beta — all past papers, all subjects, AI feedback. <a href="/signup.html">Join free →</a>
</div>`;

const NAV = `
<nav class="nav-public">
  <div class="container nav-inner">
    <a href="/index.html" class="logo">
      <img src="/ujyalo-logo-transparent.png" style="height: 38px; width: auto;" alt="Ujyalo">
    </a>
    <div class="nav-links">
      <a href="/practice.html">Practice</a>
      <a href="/features.html">Features</a>
      <a href="/pricing.html">Pricing</a>
      <a href="/about.html">About</a>
    </div>
    <div class="nav-actions" id="nav-actions">
      <a href="/login.html" class="btn btn-ghost">Log in</a>
      <a href="/signup.html" class="btn btn-primary">Sign up free →</a>
    </div>
  </div>
</nav>`;

const FOOTER = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/index.html">
          <img src="/ujyalo-logo-transparent.png" style="height: 36px; width: auto; filter: brightness(0) invert(1);" alt="Ujyalo">
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
          <li><a href="/how-it-works.html">How it works</a></li>
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

// Global logout function — available on every page
function ujyaloLogout() {
  localStorage.removeItem('ujyalo_token');
  localStorage.removeItem('ujyalo_user');
  window.location.href = '/index.html';
}

// Google Analytics — tracks every page automatically
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

// Microsoft Clarity — session recordings and heatmaps
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "wpmkas1s1o");

document.addEventListener('DOMContentLoaded', function () {

  // Favicon
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.href = '/favicon.ico';
  document.head.appendChild(favicon);

  // Nav
  const navEl = document.getElementById('site-nav');
  if (navEl) navEl.innerHTML = ANNOUNCEMENT + NAV;

  // Footer
  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.innerHTML = FOOTER;

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href').split('/').pop() === currentPage) {
      link.classList.add('active');
    }
  });

  // Check if logged in — update nav buttons
  const user = JSON.parse(localStorage.getItem('ujyalo_user') || 'null');
  const token = localStorage.getItem('ujyalo_token');
  const navActions = document.getElementById('nav-actions');

  if (user && token && navActions) {
    const firstName = user.full_name
      ? user.full_name.split(' ')[0]
      : user.email.split('@')[0];
    const initials = firstName.charAt(0).toUpperCase();

    navActions.innerHTML = `
      <a href="/dashboard.html" class="btn btn-ghost">Dashboard</a>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--brand);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">${initials}</div>
        <button onclick="ujyaloLogout()" style="font-size:13px;color:var(--ink-500);background:none;border:none;cursor:pointer;font-family:inherit;font-weight:500;">Log out</button>
      </div>`;
  }

});
