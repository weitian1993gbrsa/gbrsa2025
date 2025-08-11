(function () {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => [...el.querySelectorAll(q)];
  window.toast = (msg, timeout=2500) => { const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(()=>{ el.remove(); }, timeout); };
  // GET helper
  window.apiGet = async (params) => { const url = new URL(window.CONFIG.APPS_SCRIPT_URL); Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v)); const res = await fetch(url.toString()); if(!res.ok) throw new Error('GET failed'); return await res.json(); };
  // POST helper (no Content-Type header -> avoid CORS preflight; body is text/plain JSON)
  window.apiPost = async (payload) => {
    const res = await fetch(window.CONFIG.APPS_SCRIPT_URL, { method:'POST', body: JSON.stringify(payload) });
    // Can't assume JSON always; try parse then fallback
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw:text, ok: res.ok }; }
    if (!res.ok) throw new Error('POST failed');
    return data;
  };
  window.$=$; window.$$=$$;
})();