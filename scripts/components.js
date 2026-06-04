/* ============================================================
   UJYALO — components.js
   Global nav + footer injected on every page.
   Design system: Fraunces + Outfit, Editorial Scholar palette
   (forest --navy #11302a, brass --orange #c0913f)
   ============================================================ */

const ANNOUNCEMENT = `
<div class="ujyalo-announce">
  🇳🇵 Free SEE practice for every Nepali student. No signup needed.
  <a href="/see.html">Start now →</a>
</div>`;

/* ── Text logo — sharp, scalable, consistent ── */
const LOGO_HTML = `<a href="/index.html" class="ujyalo-logo"><img src="/mark-dark.png" class="ujyalo-logo-mark" alt=""/><svg class="ujyalo-logo-word" viewBox="0 0 6238.146728515625 1978.1474609375" xmlns="http://www.w3.org/2000/svg" aria-label="ujyalo" role="img"><g transform="translate(-32.92626953125,1510) scale(1,-1)"><path d="M780 189V214L766 214V688Q766 718 758 731Q750 743 734 748L710 754Q690 761 681 773Q673 785 673 803Q673 826 685 839Q697 851 730 864L966 952Q1013 970 1043 979Q1072 987 1099 987Q1141 987 1163 963Q1185 940 1185 904V197Q1185 159 1190 143Q1196 127 1211 121L1235 111Q1256 102 1266 88Q1275 74 1275 55Q1275 29 1258 15Q1242 0 1205 0H946Q880 0 830 56Q780 112 780 189ZM126 285V688Q126 718 118 731Q110 743 94 748L70 754Q51 761 42 773Q33 785 33 803Q33 826 45 839Q57 851 90 864L326 952Q377 971 405 979Q434 987 456 987Q501 987 523 963Q545 940 545 904V343Q545 280 574 248Q603 216 655 216Q688 216 724 229Q759 242 787 267L822 298L878 238L847 210Q709 78 605 25Q502 -27 416 -27Q287 -27 207 59Q126 145 126 285Z" transform="translate(0,0)" fill="#11302A"/><path d="M564 270Q564 210 582 156Q600 102 623 51Q646 -1 664 -53Q682 -105 682 -161Q682 -301 579 -383Q476 -466 298 -466Q167 -466 80 -430Q-6 -394 -50 -334Q-93 -275 -93 -205Q-93 -114 -43 -69Q6 -24 90 -24Q170 -24 219 -77Q267 -129 267 -214V-295Q267 -333 286 -350Q306 -368 340 -368Q379 -368 400 -346Q421 -323 421 -277Q421 -227 393 -180Q365 -133 324 -86Q283 -40 242 6Q202 51 174 99Q146 146 146 196V689Q146 718 137 731Q129 744 113 748L90 755Q70 761 61 773Q52 785 52 804Q52 826 64 839Q76 852 109 865L345 952Q397 972 425 980Q454 987 477 987Q521 987 542 964Q564 940 564 904ZM334 1073Q224 1073 160 1125Q96 1178 96 1267Q96 1356 160 1407Q224 1459 334 1459Q445 1459 509 1407Q573 1356 573 1267Q573 1178 509 1125Q445 1073 334 1073Z" transform="translate(1330,0)" fill="#11302A"/><path d="M796 207 569 -176 118 762Q100 801 81 818Q63 835 36 848Q16 857 8 870Q-1 882 -1 903Q-1 929 17 943Q35 958 67 958H606Q636 958 654 943Q672 929 672 903Q672 882 662 870Q651 857 627 850L598 842Q559 830 552 804Q545 777 573 714ZM575 -88 605 -17 656 79 901 695Q926 757 918 790Q911 822 870 835L836 846Q813 854 801 868Q789 882 789 903Q789 929 807 943Q825 958 856 958H1134Q1165 958 1183 943Q1201 929 1201 903Q1201 886 1191 873Q1181 859 1159 847Q1120 829 1094 800Q1068 771 1042 707L735 -45Q666 -213 611 -305Q556 -397 491 -432Q427 -468 328 -468Q187 -468 104 -392Q20 -316 20 -201Q20 -118 62 -70Q105 -23 175 -23Q244 -23 280 -62Q317 -101 345 -167L366 -215Q380 -249 398 -269Q417 -289 437 -289Q456 -289 473 -275Q490 -261 513 -218Q537 -175 575 -88Z" transform="translate(2020,0)" fill="#11302A"/><path d="M655 133V155L624 155V808Q624 846 604 869Q584 892 549 892Q523 892 503 878Q484 865 484 843V734Q484 652 427 605Q370 559 265 559Q177 559 134 597Q90 634 90 703Q90 768 149 833Q208 898 326 942Q444 985 624 985Q834 985 936 908Q1038 831 1038 696V217Q1038 197 1048 185Q1058 172 1077 172Q1094 172 1105 182Q1116 191 1124 202Q1131 209 1138 213Q1145 218 1154 218Q1170 218 1177 207Q1184 195 1184 177Q1184 135 1152 88Q1121 40 1058 6Q996 -27 902 -27Q791 -27 723 19Q655 64 655 133ZM52 212Q52 347 174 426Q296 504 521 504Q579 504 621 496Q663 488 691 473L659 393Q638 405 619 410Q600 415 578 415Q529 415 501 382Q473 348 473 284Q473 217 501 183Q529 149 574 149Q603 149 628 163Q653 177 666 195L690 122Q642 51 552 12Q462 -27 359 -27Q221 -27 137 41Q52 109 52 212Z" transform="translate(3214,0)" fill="#C0913F"/><path d="M565 1427V197Q565 159 571 143Q577 127 592 121L615 111Q637 102 646 88Q655 74 655 55Q655 29 639 15Q622 0 585 0H126Q89 0 73 15Q56 29 56 55Q56 74 65 88Q75 102 96 111L120 121Q135 127 141 143Q146 159 146 197V1211Q146 1241 138 1254Q130 1266 114 1271L90 1277Q71 1284 62 1296Q53 1308 53 1326Q53 1349 65 1361Q77 1374 110 1387L346 1475Q397 1494 425 1502Q454 1510 476 1510Q521 1510 543 1486Q565 1463 565 1427Z" transform="translate(4399,0)" fill="#11302A"/><path d="M622 987Q790 987 915 923Q1041 859 1110 744Q1180 629 1180 476Q1180 334 1107 220Q1034 106 905 40Q776 -27 606 -27Q439 -27 313 38Q188 103 118 218Q48 332 48 483Q48 627 121 741Q195 855 324 921Q453 987 622 987ZM694 107Q732 115 751 160Q771 204 769 290Q767 375 740 507Q714 633 682 713Q650 793 613 828Q575 863 535 853Q497 844 477 800Q458 755 460 670Q462 585 489 453Q515 327 547 247Q579 167 616 132Q653 98 694 107Z" transform="translate(5091,0)" fill="#11302A"/></g></svg></a>`;

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
      <a href="/index.html" class="ujyalo-logo ujyalo-logo-white"><img src="/mark.png" class="ujyalo-logo-mark" alt=""/><svg class="ujyalo-logo-word" viewBox="0 0 6238.146728515625 1978.1474609375" xmlns="http://www.w3.org/2000/svg" aria-label="ujyalo" role="img"><g transform="translate(-32.92626953125,1510) scale(1,-1)"><path d="M780 189V214L766 214V688Q766 718 758 731Q750 743 734 748L710 754Q690 761 681 773Q673 785 673 803Q673 826 685 839Q697 851 730 864L966 952Q1013 970 1043 979Q1072 987 1099 987Q1141 987 1163 963Q1185 940 1185 904V197Q1185 159 1190 143Q1196 127 1211 121L1235 111Q1256 102 1266 88Q1275 74 1275 55Q1275 29 1258 15Q1242 0 1205 0H946Q880 0 830 56Q780 112 780 189ZM126 285V688Q126 718 118 731Q110 743 94 748L70 754Q51 761 42 773Q33 785 33 803Q33 826 45 839Q57 851 90 864L326 952Q377 971 405 979Q434 987 456 987Q501 987 523 963Q545 940 545 904V343Q545 280 574 248Q603 216 655 216Q688 216 724 229Q759 242 787 267L822 298L878 238L847 210Q709 78 605 25Q502 -27 416 -27Q287 -27 207 59Q126 145 126 285Z" transform="translate(0,0)" fill="#ffffff"/><path d="M564 270Q564 210 582 156Q600 102 623 51Q646 -1 664 -53Q682 -105 682 -161Q682 -301 579 -383Q476 -466 298 -466Q167 -466 80 -430Q-6 -394 -50 -334Q-93 -275 -93 -205Q-93 -114 -43 -69Q6 -24 90 -24Q170 -24 219 -77Q267 -129 267 -214V-295Q267 -333 286 -350Q306 -368 340 -368Q379 -368 400 -346Q421 -323 421 -277Q421 -227 393 -180Q365 -133 324 -86Q283 -40 242 6Q202 51 174 99Q146 146 146 196V689Q146 718 137 731Q129 744 113 748L90 755Q70 761 61 773Q52 785 52 804Q52 826 64 839Q76 852 109 865L345 952Q397 972 425 980Q454 987 477 987Q521 987 542 964Q564 940 564 904ZM334 1073Q224 1073 160 1125Q96 1178 96 1267Q96 1356 160 1407Q224 1459 334 1459Q445 1459 509 1407Q573 1356 573 1267Q573 1178 509 1125Q445 1073 334 1073Z" transform="translate(1330,0)" fill="#ffffff"/><path d="M796 207 569 -176 118 762Q100 801 81 818Q63 835 36 848Q16 857 8 870Q-1 882 -1 903Q-1 929 17 943Q35 958 67 958H606Q636 958 654 943Q672 929 672 903Q672 882 662 870Q651 857 627 850L598 842Q559 830 552 804Q545 777 573 714ZM575 -88 605 -17 656 79 901 695Q926 757 918 790Q911 822 870 835L836 846Q813 854 801 868Q789 882 789 903Q789 929 807 943Q825 958 856 958H1134Q1165 958 1183 943Q1201 929 1201 903Q1201 886 1191 873Q1181 859 1159 847Q1120 829 1094 800Q1068 771 1042 707L735 -45Q666 -213 611 -305Q556 -397 491 -432Q427 -468 328 -468Q187 -468 104 -392Q20 -316 20 -201Q20 -118 62 -70Q105 -23 175 -23Q244 -23 280 -62Q317 -101 345 -167L366 -215Q380 -249 398 -269Q417 -289 437 -289Q456 -289 473 -275Q490 -261 513 -218Q537 -175 575 -88Z" transform="translate(2020,0)" fill="#ffffff"/><path d="M655 133V155L624 155V808Q624 846 604 869Q584 892 549 892Q523 892 503 878Q484 865 484 843V734Q484 652 427 605Q370 559 265 559Q177 559 134 597Q90 634 90 703Q90 768 149 833Q208 898 326 942Q444 985 624 985Q834 985 936 908Q1038 831 1038 696V217Q1038 197 1048 185Q1058 172 1077 172Q1094 172 1105 182Q1116 191 1124 202Q1131 209 1138 213Q1145 218 1154 218Q1170 218 1177 207Q1184 195 1184 177Q1184 135 1152 88Q1121 40 1058 6Q996 -27 902 -27Q791 -27 723 19Q655 64 655 133ZM52 212Q52 347 174 426Q296 504 521 504Q579 504 621 496Q663 488 691 473L659 393Q638 405 619 410Q600 415 578 415Q529 415 501 382Q473 348 473 284Q473 217 501 183Q529 149 574 149Q603 149 628 163Q653 177 666 195L690 122Q642 51 552 12Q462 -27 359 -27Q221 -27 137 41Q52 109 52 212Z" transform="translate(3214,0)" fill="#E7C986"/><path d="M565 1427V197Q565 159 571 143Q577 127 592 121L615 111Q637 102 646 88Q655 74 655 55Q655 29 639 15Q622 0 585 0H126Q89 0 73 15Q56 29 56 55Q56 74 65 88Q75 102 96 111L120 121Q135 127 141 143Q146 159 146 197V1211Q146 1241 138 1254Q130 1266 114 1271L90 1277Q71 1284 62 1296Q53 1308 53 1326Q53 1349 65 1361Q77 1374 110 1387L346 1475Q397 1494 425 1502Q454 1510 476 1510Q521 1510 543 1486Q565 1463 565 1427Z" transform="translate(4399,0)" fill="#ffffff"/><path d="M622 987Q790 987 915 923Q1041 859 1110 744Q1180 629 1180 476Q1180 334 1107 220Q1034 106 905 40Q776 -27 606 -27Q439 -27 313 38Q188 103 118 218Q48 332 48 483Q48 627 121 741Q195 855 324 921Q453 987 622 987ZM694 107Q732 115 751 160Q771 204 769 290Q767 375 740 507Q714 633 682 713Q650 793 613 828Q575 863 535 853Q497 844 477 800Q458 755 460 670Q462 585 489 453Q515 327 547 247Q579 167 616 132Q653 98 694 107Z" transform="translate(5091,0)" fill="#ffffff"/></g></svg></a>
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
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 900;
  color: var(--navy);
  text-decoration: none;
  letter-spacing: -.5px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ujyalo-logo-mark { height: 34px; width: auto; display: block; }
.ujyalo-logo-word { height: 23px; width: auto; display: block; }
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
