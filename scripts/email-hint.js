/* Catch email typos before they cost us the person.
 *
 * "rajan@gmial.com" passes every format check we have — it looks perfect. But the
 * signup confirmation never arrives (dead account), or our reply to their message
 * bounces (they think we ignored them). Either way we lose them silently.
 *
 * So: if the domain is a near-miss of a common provider, offer the fix. This only
 * ever SUGGESTS — never blocks — because plenty of real addresses are unusual and
 * we must never stand between a student and an account.
 *
 * Usage:
 *   ujyaloEmailHint('a@gmial.com')            -> 'a@gmail.com'  (or null)
 *   ujyaloEmailHintAttach(inputEl, boxEl)     -> wires the suggestion UI up
 */
(function (global) {
  'use strict';

  // Real providers. A domain IN this list is never "corrected" — which is exactly
  // why lookalikes that are genuinely real (ymail.com, mail.com) must be listed,
  // or we would helpfully "fix" them into gmail.com.
  var KNOWN = [
    'gmail.com', 'googlemail.com',
    'yahoo.com', 'ymail.com', 'rocketmail.com', 'yahoo.co.uk', 'yahoo.co.in',
    'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'msn.com',
    'icloud.com', 'me.com', 'mac.com',
    'aol.com', 'protonmail.com', 'proton.me', 'zoho.com',
    'gmx.com', 'mail.com', 'email.com', 'mail.ru', 'yandex.com',
    'rediffmail.com'
  ];

  // Levenshtein: how many single-character edits turn a into b.
  function dist(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length, prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1)
        );
      }
      prev = cur.slice();
    }
    return prev[n];
  }

  function hint(email) {
    var s = String(email || '').trim().toLowerCase();
    var at = s.lastIndexOf('@');
    if (at < 1 || at === s.length - 1) return null;
    var user = s.slice(0, at), dom = s.slice(at + 1);
    if (!dom || dom.indexOf('.') < 0) return null;
    if (KNOWN.indexOf(dom) >= 0) return null;          // already a real provider

    var best = null, bestD = 99;
    for (var i = 0; i < KNOWN.length; i++) {
      var d = dist(dom, KNOWN[i]);
      if (d < bestD) { bestD = d; best = KNOWN[i]; }
    }
    if (!best) return null;

    // One edit away is a typo with near-certainty. Two edits only for longer
    // domains — on a short one, two edits is a big change and we would start
    // "correcting" real addresses we simply have not heard of (mail.ru).
    if (bestD === 1 || (bestD === 2 && dom.length >= 9)) return user + '@' + best;
    return null;
  }

  // Build the suggestion with DOM nodes, never innerHTML: the text contains
  // whatever the visitor typed, so string-building it would be an injection.
  function attach(input, box) {
    if (!input || !box) return;
    function paint() {
      var s = hint(input.value);
      box.textContent = '';
      if (!s) { box.style.display = 'none'; return; }
      box.style.display = 'block';
      box.style.fontSize = '12.5px';
      box.style.marginTop = '6px';
      box.style.color = '#52606d';
      box.appendChild(document.createTextNode('Did you mean '));
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = s;
      b.style.cssText = 'background:none;border:none;padding:0;font:inherit;font-weight:700;color:#0f766e;text-decoration:underline;cursor:pointer;';
      b.addEventListener('click', function () {
        input.value = s;
        box.textContent = '';
        box.style.display = 'none';
        input.focus();
      });
      box.appendChild(b);
      box.appendChild(document.createTextNode('?'));
    }
    input.addEventListener('blur', paint);
    // Once shown, keep it honest as they correct themselves — but don't nag mid-typing.
    input.addEventListener('input', function () { if (box.style.display === 'block') paint(); });
  }

  global.ujyaloEmailHint = hint;
  global.ujyaloEmailHintAttach = attach;
})(window);
