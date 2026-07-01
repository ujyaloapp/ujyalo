/* ============================================================
   UJYALO — ujyalo-auth.js
   Tiny, side-effect-free helpers for reading the signed-in
   user/token from localStorage. Safe to load on ANY page:
   it defines only these functions — no styles, no nav, no
   network, nothing global beyond the helpers below.
   ============================================================ */

// The signed-in user object, or null (never throws on bad JSON).
function ujyaloGetUser() {
  try { return JSON.parse(localStorage.getItem('ujyalo_user') || 'null'); }
  catch (e) { return null; }
}

// The signed-in user's access token, or '' if not logged in.
function ujyaloGetToken() {
  return localStorage.getItem('ujyalo_token') || '';
}
