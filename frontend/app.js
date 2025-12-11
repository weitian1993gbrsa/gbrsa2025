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
   ⭐ iOS FIX PACK (Global Patch for ALL Pages)
   Prevents scroll jumping, bounce, and body scroll on iPhones
   =========================================================== */

// Detect iOS device
const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Apply global iOS rules
if (iOS) {

  // ⭐ Prevent double-tap zoom (important for judges tapping fast)
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // ⭐ Prevent body scrolling — only allow scrollable containers to scroll
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.documentElement.style.position = 'fixed';

  // ⭐ Allow natural scrolling INSIDE any element marked .scroll-area
  document.addEventListener('touchmove', function (e) {

    const scrollable = e.target.closest('.scroll-area');

    if (!scrollable) {
      // block page scrolling completely
      e.preventDefault();
      return;
    }

    // allow scroll inside
    const atTop = scrollable.scrollTop <= 0;
    const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight;

    if ((atTop && e.touches[0].clientY > 0) ||
        (atBottom && e.touches[0].clientY < 0)) {

      // prevent rubber band overscroll
      e.preventDefault();
    }

  }, { passive:false });
}

/* ===========================================================
   HOW TO USE:
   Add class="scroll-area" to any scrollable div:
   Example:
   <div id="reContainer" class="scroll-area">
   =========================================================== */
