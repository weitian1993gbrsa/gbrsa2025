(function () {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => [...el.querySelectorAll(q)];
  window.toast = (msg, timeout=2500) => { 
    const el = document.createElement('div'); 
    el.className = 'toast'; 
    el.textContent = msg; 
    document.body.appendChild(el); 
    setTimeout(()=>{ el.remove(); }, timeout); 
  };

  // Simple micro-cache for participant lookups in this session
  const cache = new Map();
  window.participantCache = cache;

  // GET helper
  window.apiGet = async (params) => {
    const key = JSON.stringify(params);
    if (cache.has(key)) return cache.get(key);
    const url = new URL(window.CONFIG.APPS_SCRIPT_URL);
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { cache:'no-store' });
    if(!res.ok) throw new Error('GET failed');
    const data = await res.json();
    cache.set(key, data);
    return data;
  };

  // POST helper (no Content-Type -> avoid preflight)
  window.apiPost = async (payload) => {
    const res = await fetch(window.CONFIG.APPS_SCRIPT_URL, { method:'POST', body: JSON.stringify(payload), keepalive:true });
    const txt = await res.text();
    let data; 
    try{ data=JSON.parse(txt);}catch{ data={ raw:txt, ok:res.ok }; }
    if(!res.ok) throw new Error('POST failed');
    return data;
  };

  // Debounce helper
  window.debounce = (fn, ms=300) => {
    let t, lastArg, lastRunId = 0;
    return (...args) => {
      lastArg = args;
      clearTimeout(t);
      const runId = ++lastRunId;
      t = setTimeout(() => { if (runId === lastRunId) fn(...lastArg); }, ms);
    };
  };

  // Tiny loading markup factory
  window.loadingDots = () => {
    const span = document.createElement('span');
    span.className = 'loading';
    span.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    return span;
  };

  window.$=$; window.$$=$$;

  // === 🔥 PRE-WARM BACKEND CACHE FOR FIRST FAST ID LOOKUP ===
  // This triggers your backend's ?cmd=warm endpoint to build the ID index
  (async ()=>{
    try {
      await apiGet({ cmd: 'warm' });
      console.log('GBRSA cache pre-warmed');
    } catch(e){
      console.warn('Warm-up failed (ignored):', e);
    }
  })();

})();

// === Update Check ===

let currentVersion = null;

async function checkForDataUpdates() {
  try {
    const response = await apiGet({ action: 'getVersion' }); // Must return { version: "..." }
    const newVersion = response.version;

    if (currentVersion && newVersion !== currentVersion) {
      showUpdateToast();
    }
    currentVersion = newVersion;
  } catch (e) {
    console.warn('Failed to check for updates', e);
  }
}

function showUpdateToast() {
  const toast = document.createElement('div');
  toast.textContent = 'New data available — click to refresh';
  toast.className = 'toast update-toast';
  toast.onclick = () => location.reload();
  document.body.appendChild(toast);
}

setInterval(checkForDataUpdates, 30000);
checkForDataUpdates();

function forceRepaint() {
  document.body.classList.add("hidden");
  void document.body.offsetHeight;
  document.body.classList.remove("hidden");
}
