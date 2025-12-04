/* ============================================================
   APP.JS — GLOBAL HELPERS + API WRAPPERS
   GBRSA SCORE 2025
============================================================ */

/* -------------------------------------------
   Short helper for selecting DOM elements
------------------------------------------- */
const $ = (q) => document.querySelector(q);


/* ============================================================
   GENERIC GET REQUEST
============================================================ */
async function apiGet(params = {}) {
  const url = new URL(window.CONFIG.APPS_SCRIPT_URL);

  Object.keys(params).forEach(k => {
    url.searchParams.append(k, params[k]);
  });

  const res = await fetch(url.toString());
  return res.json();
}


/* ============================================================
   🔥 FIXED POST REQUEST (Main Bug Fix)
   - Speed judge → FormData
   - Freestyle judge → JSON
============================================================ */

async function apiPost(data) {

  // If freestyle , send JSON
  if (typeof data === "object" && data._form === "freestyle") {

    const res = await fetch(window.CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    return res.json();
  }

  // Otherwise → SPEED scoring uses FormData
  const fd = new FormData();
  for (const k in data) {
    fd.append(k, data[k]);
  }

  const res = await fetch(window.CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    body: fd
  });

  return res.json();
}


/* ============================================================
   NAVIGATION HELPERS
============================================================ */

function goTo(url) {
  window.location.href = url;
}

function goHome() {
  window.location.href = "index.html";
}


/* ============================================================
   LOCAL STORAGE HELPERS (Cache for stations)
============================================================ */

function loadCache(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    return JSON.parse(v);
  } catch (err) {
    return fallback;
  }
}

function saveCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {}
}

function removeCache(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {}
}


/* ============================================================
   URL PARAM PARSER
============================================================ */

function getParams() {
  return new URLSearchParams(location.search);
}


/* ============================================================
   SHOW ALERT
============================================================ */

function showError(msg) {
  alert(msg || "Something went wrong.");
}


/* ============================================================
   EXPORT TO WINDOW (Optional)
============================================================ */

window.apiGet = apiGet;
window.apiPost = apiPost;
window.goTo = goTo;
window.goHome = goHome;
window.getParams = getParams;
window.loadCache = loadCache;
window.saveCache = saveCache;
window.removeCache = removeCache;