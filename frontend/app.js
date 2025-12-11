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
   ⭐ PAGE TYPE DETECTION (STATION vs JUDGE)
   This allows different scroll behavior per page.
   =========================================================== */

(function detectPageType() {
    const url = window.location.pathname;

    if (
        url.includes("speed-station") ||
        url.includes("freestyle-station")
    ) {
        document.body.classList.add("station-page");
    } else {
        document.body.classList.add("judge-page");
    }
})();

/* ===========================================================
   ⭐ UNIVERSAL iOS FIX — AUTO WRAP CONTENT BELOW HEADER
   Applies to ALL pages (zero HTML modification needed)
   =========================================================== */

(function() {
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!isiOS) return;

    document.addEventListener("DOMContentLoaded", () => {

        console.log("iOS detected — applying scroll wrapper fix");

        // Find first header
        const header = document.querySelector("header");

        // Collect all elements below header
        let contentElements = [];

        if (header) {
            let el = header.nextElementSibling;
            while (el) {
                contentElements.push(el);
                el = el.nextElementSibling;
            }
        } else {
            // If no header, wrap entire body
            contentElements = Array.from(document.body.children);
        }

        if (contentElements.length === 0) {
            console.warn("iOS FIX WARNING: No content found after <header>");
            return;
        }

        // Create the scroll wrapper
        const wrap = document.createElement("div");

        // Station pages use full screen height
        if (document.body.classList.contains("station-page")) {
            wrap.className = "ios-scroll-wrapper station-height";
        } else {
            wrap.className = "ios-scroll-wrapper judge-height";
        }

        // Move content elements inside the wrapper
        contentElements.forEach(el => wrap.appendChild(el));

        // Append wrapper to document
        document.body.appendChild(wrap);
    });
})();

/* ===========================================================
   ⭐ REQUIRED CSS (place in styles.css or each HTML <style>)
   ----------------------------------------------------------
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
       -webkit-overflow-scrolling: touch;
       position: relative;
       width: 100%;
   }

   .judge-height {
       height: calc(100vh - 80px);  // judge pages
   }

   .station-height {
       height: calc(100vh - 60px);  // station pages (more space)
   }
   =========================================================== */
