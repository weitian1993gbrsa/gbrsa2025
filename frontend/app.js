(function () {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => [...el.querySelectorAll(q)];
  window.toast = (msg, timeout=2500) => { const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(()=>{ el.remove(); }, timeout); };
  // Simple GET/POST helpers
  window.apiGet = async (params) => { const url = new URL(window.CONFIG.APPS_SCRIPT_URL); Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v)); const res = await fetch(url.toString()); const json = await res.json().catch(()=>({})); if(!res.ok) throw new Error('GET failed'); return json; };
  window.apiPost = async (payload) => { const res = await fetch(window.CONFIG.APPS_SCRIPT_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)}); const json = await res.json().catch(()=>({})); if(!res.ok) throw new Error('POST failed'); return json; };
  // Offline queue
  const KEY='gbrsa.pending'; window.queue={ all(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch{return []} }, add(x){ const a=queue.all(); a.push(x); localStorage.setItem(KEY, JSON.stringify(a)); }, clear(){ localStorage.removeItem(KEY); }, set(a){ localStorage.setItem(KEY, JSON.stringify(a)); } };
  window.$=$; window.$$=$$;
})();