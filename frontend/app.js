(function () {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => [...el.querySelectorAll(q)];
  window.toast = (msg, timeout=2500) => { const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(()=>{ el.remove(); }, timeout); };
  window.apiGet = async (params) => { if (!window.CONFIG || !window.CONFIG.APPS_SCRIPT_URL) throw new Error('Missing config.js.'); const url = new URL(window.CONFIG.APPS_SCRIPT_URL); Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v)); const res = await fetch(url.toString(), { method: 'GET' }); if (!res.ok) throw new Error(`GET ${res.status}`); return await res.json(); };
  window.apiPost = async (payload) => { if (!window.CONFIG || !window.CONFIG.APPS_SCRIPT_URL) throw new Error('Missing config.js.'); const res = await fetch(window.CONFIG.APPS_SCRIPT_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) }); if (!res.ok) throw new Error(`POST ${res.status}`); return await res.json(); };
  const KEY = 'gbrsa.pending';
  window.queue = { all(){ try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } }, add(item){ const arr = queue.all(); arr.push(item); localStorage.setItem(KEY, JSON.stringify(arr)); }, clear(){ localStorage.removeItem(KEY); }, set(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); } };
  window.$ = $; window.$$ = $$;
})();