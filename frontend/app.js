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
