(function(){
  const $ = (q, el=document) => el.querySelector(q);

  // Fallback debounce in case app.js isn't loaded yet
  const debounce = window.debounce || (fn => {
    let t, last=0, a;
    return (...args) => { a=args; clearTimeout(t); const id=++last; t=setTimeout(()=>{ if(id===last) fn(...a); },300); };
  });

  const entryInput = $('#entryIdInput');
  const participantCard = $('#participantCard');
  const badgeHeat = $('#badgeHeat');
  const badgeCourt = $('#badgeCourt');
  const pId = $('#pId');
  const pNames = $('#pNames');
  const pRep = $('#pRep');
  const pState = $('#pState');

  const fId = $('#fId');
  const fNAME1 = $('#fNAME1');
  const fNAME2 = $('#fNAME2');
  const fNAME3 = $('#fNAME3');
  const fNAME4 = $('#fNAME4');
  const fREP = $('#fREP');
  const fSTATE = $('#fSTATE');
  const fHEAT = $('#fHEAT');
  const fCOURT = $('#fCOURT');

  const btnConfirm = $('#btnConfirm');
  const scoreFormWrap = $('#scoreFormWrap');
  const scoreForm = $('#scoreForm');

  const cam = $('#cam');
  const cameraWrap = $('#cameraWrap');
  const btnOpenCamera = $('#btnOpenCamera');
  const btnCloseCamera = $('#btnCloseCamera');
  let stream = null;
  let detector = null;
  let scanning = false;

  const loadingMarkup = '<span class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',\"'\":'&#39;'}[m])); }

  function extractIdFromRaw(raw){
    let id = (raw||'').trim();
    try { const u = new URL(id); id = u.searchParams.get('id') || u.searchParams.get('ID') || u.searchParams.get('entryId') || id; } catch {}
    return id;
  }

  function hideStep2(){ scoreFormWrap.classList.add('hide'); btnConfirm.disabled = true; }

  function clearHidden(){
    [fId,fNAME1,fNAME2,fNAME3,fNAME4,fREP,fSTATE,fHEAT,fCOURT].forEach(el => el.value = '');
  }

  function resetUI(){
    scoreForm.reset();
    clearHidden();
    participantCard.classList.add('hide');
    hideStep2();
    pId.textContent = '—'; pNames.innerHTML = '—'; pRep.textContent = '—'; pState.textContent = '—';
    badgeHeat.textContent = 'HEAT —'; badgeCourt.textContent = 'COURT —';
    entryInput.value = '';
    stopScan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(()=> entryInput && entryInput.focus && entryInput.focus(), 250);
  }

  async function lookupById(idRaw){
    const id = String(idRaw||'').trim();
    if (!id){ participantCard.classList.add('hide'); hideStep2(); clearHidden(); return; }
    // loading state
    btnConfirm.disabled = true;
    pId.textContent = 'Loading…';
    pNames.innerHTML = loadingMarkup;

    try {
      const data = await apiGet({ cmd:'participant', entryId: id });
      if (!data || !data.found){
        participantCard.classList.add('hide');
        hideStep2();           // <- ensure Step 2 stays hidden
        clearHidden();
        toast && toast('ID not found.');
        return;
      }
      const p = data.participant || {};

      const names = [p['NAME1'], p['NAME2'], p['NAME3'], p['NAME4']].filter(Boolean).map(escapeHtml).join('<br>');
      const rep = p['REPRESENTATIVE'] || '';
      const state = p['STATE'] || '';
      const heat = p['HEAT'] || '';
      const court = p['COURT'] || '';

      pId.textContent = id;
      pNames.innerHTML = names || '—';
      pRep.textContent = rep || '—';
      pState.textContent = state || '—';
      badgeHeat.textContent = `HEAT ${heat||'—'}`;
      badgeCourt.textContent = `COURT ${court||'—'}`;

      fId.value = id;
      fNAME1.value = p['NAME1'] || ''; fNAME2.value = p['NAME2'] || '';
      fNAME3.value = p['NAME3'] || ''; fNAME4.value = p['NAME4'] || '';
      fREP.value = rep; fSTATE.value = state; fHEAT.value = heat; fCOURT.value = court;

      participantCard.classList.remove('hide');
      btnConfirm.disabled = false;
    } catch (e){
      console.error(e);
      participantCard.classList.add('hide');
      hideStep2();
      clearHidden();
      toast && toast('Lookup failed.');
    }
  }

  const debouncedLookup = debounce((v)=> lookupById(v), 300);

  // Manual typing handlers
  entryInput.addEventListener('input', (e)=> {
    const v = e.target.value.toUpperCase();
    e.target.value = v; // auto-uppercase
    if (v.trim().length === 0){ participantCard.classList.add('hide'); hideStep2(); clearHidden(); return; }
    debouncedLookup(v);
  });
  entryInput.addEventListener('change', (e)=> { const v = e.target.value.trim(); if (v) lookupById(v); });
  entryInput.addEventListener('keyup', (e)=> { if (e.key === 'Enter') lookupById(entryInput.value.trim()); });

  // Camera scan
  async function startScan(){
    if (!('BarcodeDetector' in window)) { toast && toast('QR not supported. Type ID.'); return; }
    try { detector = new BarcodeDetector({ formats: ['qr_code'] }); } catch(e){ toast && toast('QR not available.'); return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width:{ideal:1280}, height:{ideal:720} }, audio:false });
      cam.srcObject = stream; await cam.play(); cameraWrap.classList.remove('hide'); scanning = true; scanLoop();
    } catch (e) { console.error(e); toast && toast('Cannot open camera.'); }
  }

  async function scanLoop(){
    if (!scanning) return;
    try {
      const codes = await detector.detect(cam);
      if (codes && codes.length) {
        const rawValue = (codes[0].rawValue || '').trim();
        const id = extractIdFromRaw(rawValue);
        entryInput.value = id; await stopScan(); await lookupById(id);
      }
    } catch(e){}
    requestAnimationFrame(scanLoop);
  }

  async function stopScan(){
    scanning = false;
    if (cam) cam.pause();
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    cameraWrap.classList.add('hide');
  }

  if (btnOpenCamera) btnOpenCamera.addEventListener('click', startScan);
  if (btnCloseCamera) btnCloseCamera.addEventListener('click', stopScan);

  btnConfirm.addEventListener('click', ()=> {
    scoreFormWrap.classList.remove('hide');
    toast && toast('Ready to enter score.');
    scoreFormWrap.scrollIntoView({behavior:'smooth', block:'start'});
  });

  // Submit
  scoreForm.addEventListener('submit', async (e)=> {
    e.preventDefault();
    const fd = new FormData(scoreForm);
    const payload = Object.fromEntries(fd.entries());
    payload['FALSE START'] = fd.get('FALSE START') ? 'YES' : '';
    try {
      const out = await apiPost(payload);
      if (out && (out.ok || out.raw)) { toast && toast('Submitted ✅'); resetUI(); }
      else { throw new Error('Server rejected'); }
    } catch (err) {
      console.error(err); toast && toast('Submit failed — check internet/app script.');
    }
  });

  // ESC to reset quickly
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') resetUI(); });

  // Start hidden on load
  participantCard.classList.add('hide');
  hideStep2();
})();