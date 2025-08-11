(function () {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => [...el.querySelectorAll(q)];
  window.toast = (msg, timeout=2500) => { const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(()=>{ el.remove(); }, timeout); };
  // GET helper
  window.apiGet = async (params) => { const url = new URL(window.CONFIG.APPS_SCRIPT_URL); Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v)); const res = await fetch(url.toString()); if(!res.ok) throw new Error('GET failed'); return await res.json(); };
  // POST helper (no Content-Type -> avoid preflight)
  window.apiPost = async (payload) => { const res = await fetch(window.CONFIG.APPS_SCRIPT_URL, { method:'POST', body: JSON.stringify(payload) }); const txt = await res.text(); let data; try{ data=JSON.parse(txt);}catch{ data={ raw:txt, ok:res.ok }; } if(!res.ok) throw new Error('POST failed'); return data; };
  window.$=$; window.$$=$$;
})();