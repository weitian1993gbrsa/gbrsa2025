/* ===========================================================
   ORIGINAL APP.JS CORE (UNCHANGED)
   =========================================================== */

(function () {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => [...el.querySelectorAll(q)];

  // Toast helper
  window.toast = (msg, timeout=2500) => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), timeout);
  };

  // Micro-cache
  const cache = new Map();
  window.participantCache = cache;

  // GET helper
  window.apiGet = async (params) => {
    const key = JSON.stringify(params);
    if (cache.has(key)) return cache.get(key);

    const url = new URL(window.CONFIG.APPS_SCRIPT_URL);
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), { cache:'no-store' });
    if (!res.ok) throw new Error('GET failed');

    const data = await res.json();
    cache.set(key, data);
    return data;
  };

  // POST helper
  window.apiPost = async (payload) => {
    const res = await fetch(window.CONFIG.APPS_SCRIPT_URL, {
      method:'POST',
      body: JSON.stringify(payload),
      keepalive:true
    });

    const txt = await res.text();
    let data;
    try { data = JSON.parse(txt); }
    catch { data = { raw:txt, ok:res.ok }; }

    if (!res.ok) throw new Error('POST failed');
    return data;
  };

  // Debounce helper
  window.debounce = (fn, ms=300) => {
    let t, lastArg, lastRun = 0;
    return (...args) => {
      lastArg = args;
      clearTimeout(t);
      const run = ++lastRun;
      t = setTimeout(() => { if (run===lastRun) fn(...lastArg); }, ms);
    };
  };

  // Loading dots helper
  window.loadingDots = () => {
    const span = document.createElement('span');
    span.className = 'loading';
    span.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    return span;
  };

  window.$=$;
  window.$$=$$;

})();

/* ===========================================================
   ⭐ UNIVERSAL iOS FIX — AUTO WRAP ALL MAIN CONTENT
   Works for ALL judge pages, ALL station pages, NO HTML editing
   =========================================================== */

(function() {
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!isiOS) return; // Only apply fix on iOS

    document.addEventListener("DOMContentLoaded", () => {

        console.log("iOS detected — applying scroll wrapper fix");

        // Find the FIRST <header>
        const header = document.querySelector("header");

        // Find all content below header
        let contentElements = [];

        if (header) {
            let el = header.nextElementSibling;

            while (el) {
                contentElements.push(el);
                el = el.nextElementSibling;
            }
        } else {
            // If no header exists, wrap entire body content
            contentElements = Array.from(document.body.children);
        }

        // If nothing to wrap, exit
        if (contentElements.length === 0) {
            console.warn("iOS FIX WARNING: No content found after <header>");
            return;
        }

        // Create the scroll wrapper
        const wrap = document.createElement("div");
        wrap.className = "ios-scroll-wrapper";

        // Move each element into the wrapper
        contentElements.forEach(el => wrap.appendChild(el));

        // Insert wrapper back to the BODY
        document.body.appendChild(wrap);

    });
})();

/* ===========================================================
   ⭐ REMINDER: ADD THIS CSS IN styles.css (GLOBAL)
   -----------------------------------------------------------
   html, body {
       overflow: hidden !important;
       position: fixed !important;
       height: 100%;
       width: 100%;
       margin: 0;
       padding: 0;
   }

   .ios-scroll-wrapper {
       overflow-y: auto;
       height: calc(100vh - 80px);   // adjust if header is taller
       -webkit-overflow-scrolling: touch;
       position: relative;
   }
   =========================================================== */
