(function () {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => [...el.querySelectorAll(q)];

  // Tiny toast
  window.toast = (msg, timeout=2500) => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(()=>{ el.remove(); }, timeout);
  };

  // Debug helper
  window.debugLog = (obj) => {
    try {
      const el = document.querySelector('#debugText');
      if (el) el.textContent = (el.textContent + '\n' + JSON.stringify(obj, null, 2)).slice(-4000);
    } catch {}
  };

  // Simple GET JSON
  window.apiGet = async (params) => {
    if (!window.CONFIG || !window.CONFIG.APPS_SCRIPT_URL) {
      throw new Error('Missing config.js. Copy config.example.js to config.js and fill values.');
    }
    const url = new URL(window.CONFIG.APPS_SCRIPT_URL);
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
    const href = url.toString();
    let res, json;
    try {
      res = await fetch(href, { method: 'GET' });
      const text = await res.text();
      try { json = JSON.parse(text); } catch { json = { raw:text }; }
      debugLog({ GET: href, status: res.status, data: json });
      if (!res.ok) throw new Error(`GET ${res.status}`);
      return json;
    } catch (e) {
      debugLog({ GET: href, error: String(e) });
      throw e;
    }
  };

  // Simple POST JSON
  window.apiPost = async (payload) => {
    if (!window.CONFIG || !window.CONFIG.APPS_SCRIPT_URL) {
      throw new Error('Missing config.js. Copy config.example.js to config.js and fill values.');
    }
    const href = window.CONFIG.APPS_SCRIPT_URL;
    let res, json;
    try {
      res = await fetch(href, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
      const text = await res.text();
      try { json = JSON.parse(text); } catch { json = { raw:text }; }
      debugLog({ POST: href, status: res.status, send: payload, data: json });
      if (!res.ok) throw new Error(`POST ${res.status}`);
      return json;
    } catch (e) {
      debugLog({ POST: href, error: String(e), send: payload });
      throw e;
    }
  };

  // Offline queue
  const KEY = 'gbrsa.pending';
  window.queue = {
    all(){ try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } },
    add(item){ const arr = queue.all(); arr.push(item); localStorage.setItem(KEY, JSON.stringify(arr)); },
    clear(){ localStorage.removeItem(KEY); },
    set(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); },
  };

  window.$ = $; window.$$ = $$;
})();