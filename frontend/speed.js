(function(){
  const $ = (q, el=document) => el.querySelector(q);

  // Elements
  const ROI_RATIO = 0.20; // 20% center ROI
  let offCanvas, offCtx;
  const STABLE_FRAMES_MIN = 6, STABLE_FRAMES_MAX = 8;
  const HOLD_MS_MIN = 700, HOLD_MS_MAX = 1000;
  const STABLE_FRAMES = STABLE_FRAMES_MAX;
  const HOLD_MS = HOLD_MS_MAX;
  let _stableValue = '', _stableCount = 0, _lastAccept = 0, _lockStart = 0;
  const submitOverlay = document.getElementById('submitOverlay');
  const overlayText   = document.getElementById('overlayText');
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

  function hideStep2(){ if (document.activeElement && document.activeElement.blur){ try{ document.activeElement.blur(); }catch(_){ } }
    scoreFormWrap.classList.add('hide'); btnConfirm.disabled = true; }
  function showParticipant(){ participantCard.classList.remove('hide'); }
  function hideParticipant(){ participantCard.classList.add('hide'); }

  function clearHidden(){
    [fId,fNAME1,fNAME2,fNAME3,fNAME4,fREP,fSTATE,fHEAT,fCOURT].forEach(el => el.value = '');
  }

  function resetUI(){
    if (document.activeElement && document.activeElement.blur){ try{ document.activeElement.blur(); }catch(_){ } }
    scoreForm.reset();
    clearHidden();
    hideParticipant();
    hideStep2();
    pId.textContent = '—'; pNames.innerHTML = '—'; pRep.textContent = '—'; pState.textContent = '—';
    badgeHeat.textContent = 'HEAT —'; badgeCourt.textContent = 'COURT —';
    entryInput.value = '';
    stopScan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const isTouch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || (navigator.maxTouchPoints>0);
    if (!isTouch){ setTimeout(()=> entryInput && entryInput.focus && entryInput.focus(), 150); }
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
        if (submitOverlay){ submitOverlay.classList.add('hide'); }
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
      cam.srcObject = stream;
      try{ cam.setAttribute('playsinline',''); cam.muted = true; }catch(_){}
      await cam.play(); cameraWrap.classList.remove('hide');
      const _roiSync = ()=>{ try{ const rect = cam.getBoundingClientRect(); const sidePx = Math.floor(Math.min(rect.width, rect.height) * ROI_RATIO); cameraWrap.style.setProperty('--roi-side', sidePx + 'px'); }catch(_){ } };
      _roiSync(); window.addEventListener('resize', _roiSync); window.addEventListener('orientationchange', _roiSync); window._roiSync = _roiSync;
      scanning = true; scanLoop();
    } catch (e) { console.error(e); if (window.toast) toast('Cannot open camera.'); }
  }
  async function scanLoop()
{
    if (!scanning) return;
    try {
      const vw = cam.videoWidth, vh = cam.videoHeight;
      if (!vw || !vh){ return requestAnimationFrame(scanLoop); }
      // Center square ROI (20% of min side)
      const side = Math.floor(Math.min(vw, vh) * ROI_RATIO);
      const sx = Math.floor((vw - side) / 2);
      const sy = Math.floor((vh - side) / 2);
      if (!offCanvas){ offCanvas = document.createElement('canvas'); offCtx = offCanvas.getContext('2d', { willReadFrequently:true }); }
      if (offCanvas.width !== side || offCanvas.height !== side){ offCanvas.width = side; offCanvas.height = side; }
      offCtx.drawImage(cam, sx, sy, side, side, 0, 0, side, side);
      let codes = await detector.detect(offCanvas);
      if (!codes || !codes.length){
        try { codes = await detector.detect(cam); } catch(_){}
      }
      if (codes && codes.length) {
        const c = codes[0];
        const rawValue = (c.rawValue || '').trim();
        const bb = c.boundingBox || c.bounds;
        let fullyInside = true;
        if (bb){
          const EDGE = Math.floor(0.02 * side); // 2% tolerance
          fullyInside = (bb.x >= EDGE && bb.y >= EDGE && (bb.x+bb.width) <= (side-EDGE) && (bb.y+bb.height) <= (side-EDGE));
        }
        fullyInside = true;
        if (fullyInside){
          const now = Date.now();
          if (_stableValue === rawValue){
            _stableCount++;
          } else {
            _stableValue = rawValue;
            _stableCount = 1;
            _lockStart = now;
          }
          if (_stableCount >= STABLE_FRAMES && (now - _lockStart) >= HOLD_MS && (now - _lastAccept) > 600){
            _lastAccept = now;
            const id = rawValue;
            await stopScan();
            await lookupById(id);
            return;
          }
        } else {
          _stableCount = 0;
        }
      }
    } catch(e){}
    requestAnimationFrame(scanLoop);
}

  async function stopScan(){
    scanning = false;
    if (cam) cam.pause();
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    cameraWrap.classList.add('hide');
    try{ if (window._roiSync){ window.removeEventListener('resize', _roiSync); window.removeEventListener('orientationchange', _roiSync); window._roiSync = null; } }catch(_){}
        
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
      if (document.activeElement && document.activeElement.blur){ try{ document.activeElement.blur(); }catch(_){ } }
      if (submitOverlay){ overlayText && (overlayText.textContent = 'Sending…'); submitOverlay.classList.remove('hide'); }
      const fd = new FormData(scoreForm);
      const payload = Object.fromEntries(fd.entries());
      // FALSE START: 'YES' when checked, blank when unchecked
      payload['FALSE START'] = fd.get('FALSE START') ? 'YES' : '';
      try {
        const out = await apiPost(payload); // provided by app.js
        if (out && (out.ok || out.raw)) {
          if (window.toast) toast('Submitted ✅');
                    if (submitOverlay){ overlayText && (overlayText.textContent = 'Saved!'); await new Promise(r=>setTimeout(r, 550)); submitOverlay.classList.add('hide'); }
          resetUI();
        } else {
          throw new Error('Server rejected');
        }
      } catch (err) {
        console.error(err);
        if (submitOverlay){ submitOverlay.classList.add('hide'); }
        if (window.toast) toast('Submit failed — check internet/app script.');
      }
    });
  }

  // Initial state
  hideParticipant();
  hideStep2();
})();