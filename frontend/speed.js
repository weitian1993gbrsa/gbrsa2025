(function(){
  const $ = (q, el=document) => el.querySelector(q);

  // Elements
  // Region-of-interest: percentage of the shorter video side to scan
  const ROI_RATIO = 0.30; // 50% of min(videoWidth, videoHeight)
  let offCanvas, offCtx;
  function getIdRegex(){ try{ const r = window.CONFIG && window.CONFIG.ID_REGEX; if (r) return new RegExp(r); }catch(_){ } return /^[A-Z0-9-]{4,20}$/; }
  const INNER_LOCK_RATIO = 0.50; // inner box (50% of ROI) to confirm
  const EDGE_LEEWAY = 0.02;    // 2% tolerance to avoid jitter at edges
  const MIN_AREA_RATIO = 0.06; // QR bbox must cover >=6% of ROI area
  const STABLE_FRAMES = 8;     // frames the same code stays centered before accepting
  const HOLD_MS = 1000;         // must hold centered for this long before accept
  let _stableValue = '', _stableCount = 0, _lastAccept = 0, _lockStart = 0;
  const entryInput = $('#entryIdInput');
  // Force uppercase typing for ID field
  if (entryInput){
    entryInput.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      e.target.value = (e.target.value || '').toUpperCase();
      // restore caret position when possible
      try { e.target.setSelectionRange(pos, pos); } catch(_){}
    });
    entryInput.addEventListener('blur', (e) => { e.target.value = (e.target.value || '').toUpperCase(); });
  }

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

  // Camera bits (kept for QR scanning)
  const cam = $('#cam');
  const cameraWrap = $('#cameraWrap');
  const btnOpenCamera = $('#btnOpenCamera');
  const btnCloseCamera = $('#btnCloseCamera');
  let stream = null;
  let detector = null;
  let scanning = false;

  const loadingDots = '<span class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function hideStep2(){ scoreFormWrap.classList.add('hide'); btnConfirm.disabled = true; }
  function showParticipant(){ participantCard.classList.remove('hide'); }
  function hideParticipant(){ participantCard.classList.add('hide'); }

  function clearHidden(){
    [fId,fNAME1,fNAME2,fNAME3,fNAME4,fREP,fSTATE,fHEAT,fCOURT].forEach(el => el.value = '');
  }

  function resetUI(){
    scoreForm.reset();
    clearHidden();
    hideParticipant();
    hideStep2();
    pId.textContent = '—'; pNames.innerHTML = '—'; pRep.textContent = '—'; pState.textContent = '—';
    badgeHeat.textContent = 'HEAT —'; badgeCourt.textContent = 'COURT —';
    entryInput.value = '';
    stopScan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(()=> entryInput && entryInput.focus && entryInput.focus(), 150);
  }

  async function lookupById(raw){
    const id = String(raw||'').trim().toUpperCase();
    if (!id){ hideParticipant(); hideStep2(); clearHidden(); return; }

    // show loading
    showParticipant();
    btnConfirm.disabled = true;
    pId.textContent = 'Loading…';
    pNames.innerHTML = loadingDots;
    pRep.textContent = ''; pState.textContent = ''; badgeHeat.textContent = 'HEAT —'; badgeCourt.textContent = 'COURT —';

    try {
      const data = await apiGet({ cmd:'participant', entryId: id }); // provided by app.js
      if (!data || !data.found){
        hideParticipant(); hideStep2(); clearHidden();
        if (window.toast) toast('ID not found.');
        return;
      }
      const p = data.participant || {};
      if (entryInput) entryInput.value = id;

      const names = [p['NAME1'], p['NAME2'], p['NAME3'], p['NAME4']]
        .filter(Boolean).map(escapeHtml).join('<br>');
      const rep = p['REPRESENTATIVE'] || '';
      const state = p['STATE'] || '';
      const heat = p['HEAT'] || '';
      const court = p['COURT'] || '';

      // Fill visible
      pId.textContent = id;
      pNames.innerHTML = names || '—';
      pRep.textContent = rep || '—';
      pState.textContent = state || '—';
      badgeHeat.textContent = `HEAT ${heat||'—'}`;
      badgeCourt.textContent = `COURT ${court||'—'}`;

      // Fill hidden fields
      fId.value = id;
      fNAME1.value = p['NAME1'] || '';
      fNAME2.value = p['NAME2'] || '';
      fNAME3.value = p['NAME3'] || '';
      fNAME4.value = p['NAME4'] || '';
      fREP.value = rep; fSTATE.value = state; fHEAT.value = heat; fCOURT.value = court;

      btnConfirm.disabled = false;
    } catch (err){
      console.error(err);
      hideParticipant(); hideStep2(); clearHidden();
      if (window.toast) toast('Lookup failed.');
    }
  }

  // Manual input triggers (simple & reliable)
  if (entryInput){
    entryInput.addEventListener('change', e => lookupById(e.target.value));
    entryInput.addEventListener('keyup', e => { if (e.key === 'Enter') lookupById(entryInput.value); });
    entryInput.addEventListener('input', e => { if (e.target.value.trim() === ''){ hideParticipant(); hideStep2(); clearHidden(); } });
  }

  // Camera scan support
  async function startScan(){
    if (!('BarcodeDetector' in window)) { if (window.toast) toast('QR not supported. Type ID.'); return; }
    try { detector = new BarcodeDetector({ formats: ['qr_code'] }); } catch(e){ if (window.toast) toast('QR not available.'); return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width:{ideal:1280}, height:{ideal:720} }, audio:false });
      entryInput && (entryInput.value = ''); hideParticipant(); hideStep2(); clearHidden();
      cam.srcObject = stream; await cam.play(); cameraWrap.classList.remove('hide');
      // Sync scan box size to ROI based on rendered video size
      const scanBoxEl = document.getElementById('scanBox');
      const _syncScanBox = ()=>{
        if (!scanBoxEl) return;
        const rect = cam.getBoundingClientRect();
        const sidePx = Math.floor(Math.min(rect.width, rect.height) * ROI_RATIO);
        scanBoxEl.style.width = sidePx + 'px';
        scanBoxEl.style.height = sidePx + 'px';
      };
      _syncScanBox();
      window.addEventListener('resize', _syncScanBox);
      window.addEventListener('orientationchange', _syncScanBox);
      // keep handlers to remove later
      window._scanBoxSync = _syncScanBox;
      scanning = true; scanLoop();
      // Allow Android/iOS back button to close camera instead of leaving page
      try{ history.pushState({camera:true}, ''); }catch(_){}
      const _onPop = (ev)=>{ if (scanning) { try{ ev.preventDefault(); }catch(_){ } stopScan(); } };
      window.addEventListener('popstate', _onPop, { once:true });
      // Allow Esc to close camera
      const _onEsc = (ev)=>{ if (ev.key==='Escape' && scanning) stopScan(); };
      document.addEventListener('keydown', _onEsc, { once:true });
      // Store to remove if stopScan called manually
      window._camHandlers = { _onPop, _onEsc };
        
    } catch (e) { console.error(e); if (window.toast) toast('Cannot open camera.'); }
  }
  async function scanLoop(){
    if (!scanning) return;
    try {
      const codes = await detector.detect(cam);
      if (codes && codes.length) {
        const rawValue = (codes[0].rawValue || '').trim();
        const id = rawValue;
        
        await stopScan();
        await lookupById(id);
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

  // Confirm reveals Step 2
  if (btnConfirm){
    btnConfirm.addEventListener('click', ()=> {
      scoreFormWrap.classList.remove('hide');
      if (window.toast) toast('Ready to enter score.');
      scoreFormWrap.scrollIntoView({behavior:'smooth', block:'start'});
    });
  }

  // Submit
  if (scoreForm){
    scoreForm.addEventListener('submit', async (e)=> {
      e.preventDefault();
      const fd = new FormData(scoreForm);
      const payload = Object.fromEntries(fd.entries());
      // FALSE START: 'YES' when checked, blank when unchecked
      payload['FALSE START'] = fd.get('FALSE START') ? 'YES' : '';
      try {
        const out = await apiPost(payload); // provided by app.js
        if (out && (out.ok || out.raw)) {
          if (window.toast) toast('Submitted ✅');
          resetUI();
        } else {
          throw new Error('Server rejected');
        }
      } catch (err) {
        console.error(err);
        if (window.toast) toast('Submit failed — check internet/app script.');
      }
    });
  }

  // Initial state
  hideParticipant();
  hideStep2();
})();