/* ============================================================
   UJYALO — components.js
   This file controls the nav and footer on EVERY page.
   Want to change the nav? Change it here. Done.
   Want to change the footer? Change it here. Done.
   ============================================================ */

// ── The Sun logo SVG (used in nav and footer) ──
const LOGO_SVG = `<svg width="22" height="22" viewBox="0 0 32 32" fill="none">
  <circle cx="16" cy="16" r="6" fill="#F59E0B"/>
  <g stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round">
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="16" y1="26" x2="16" y2="30"/>
    <line x1="2" y1="16" x2="6" y2="16"/>
    <line x1="26" y1="16" x2="30" y2="16"/>
    <line x1="6" y1="6" x2="9" y2="9"/>
    <line x1="23" y1="23" x2="26" y2="26"/>
    <line x1="26" y1="6" x2="23" y2="9"/>
    <line x1="9" y1="23" x2="6" y2="26"/>
  </g>
</svg>`;

// ── The announcement bar ──
// Want to change this message? Edit the text below. One place. All pages update.
const ANNOUNCEMENT = `
<div class="announcement-bar">
  🎉 Ujyalo is now live! Join the waitlist for full access —
  <a href="/signup.html">sign up free →</a>
</div>`;

// ── The nav ──
// Want to add a new link? Add it here. All pages update.
const NAV = `
<nav class="nav-public">
  <div class="container nav-inner">
    <a href="/index.html" class="logo">${LOGO_SVG} ujyalo</a>
    <div class="nav-links">
      <a href="/practice.html">Practice</a>
      <a href="/features.html">Features</a>
      <a href="/pricing.html">Pricing</a>
      <a href="/about.html">About</a>
    </div>
    <div class="nav-actions">
      <a href="/login.html" class="btn btn-ghost">Log in</a>
      <a href="/signup.html" class="btn btn-primary">Sign up free →</a>
    </div>
  </div>
</nav>`;

// ── The footer ──
// Want to add a new footer link? Add it here. All pages update.
const FOOTER = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/index.html" class="logo">${LOGO_SVG} ujyalo</a>
        <p>AI-powered SEE preparation made with care, in Nepal.
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

// ── This runs automatically when the page loads ──
// It finds the placeholders and fills them in.
document.addEventListener('DOMContentLoaded', function () {

  // Fill the nav placeholder
  const navEl = document.getElementById('site-nav');
  if (navEl) {
    navEl.innerHTML = ANNOUNCEMENT + NAV;
  }

  // Fill the footer placeholder
  const footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.innerHTML = FOOTER;
  }

  // Highlight the active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });

});

