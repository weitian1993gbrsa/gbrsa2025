(async function(){
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

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function extractIdFromRaw(raw){
    let id = (raw||'').trim();
    try { const u = new URL(id); id = u.searchParams.get('id') || u.searchParams.get('ID') || u.searchParams.get('entryId') || id; } catch {}
    return id;
  }

  async function lookupById(id){
    if (!id) return;
    // set loading UI
    btnConfirm.disabled = true;
    pId.textContent = 'Loading…';
    pNames.innerHTML = '<span class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
    try {
      const data = await apiGet({ cmd:'participant', entryId: id });
      if (!data || !data.found) { participantCard.classList.add('hide'); toast('ID not found.'); return; }
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

      // Fill hidden fields
      const [name1,name2,name3,name4] = [p['NAME1']||'',p['NAME2']||'',p['NAME3']||'',p['NAME4']||''];
      fId.value = id; fNAME1.value = name1; fNAME2.value = name2; fNAME3.value = name3; fNAME4.value = name4;
      fREP.value = rep; fSTATE.value = state; fHEAT.value = heat; fCOURT.value = court;

      participantCard.classList.remove('hide');
      btnConfirm.disabled = false;
    } catch (err) { console.error(err); toast('Lookup failed.'); }
  }

  const debouncedLookup = debounce((v)=> lookupById(v), 300);

  entryInput.addEventListener('input', (e)=> {
    const v = e.target.value.trim();
    if (v.length) { debouncedLookup(v); }
  });
  entryInput.addEventListener('change', (e)=> { const v = e.target.value.trim(); if (v.length) lookupById(v); });
  entryInput.addEventListener('keyup', (e)=> { if (e.key === 'Enter') lookupById(entryInput.value.trim()); });

  async function startScan(){
    if (!('BarcodeDetector' in window)) { toast('QR not supported. Type ID.'); return; }
    try { detector = new BarcodeDetector({ formats: ['qr_code'] }); } catch(e){ toast('QR not available.'); return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width:{ideal:1280}, height:{ideal:720} }, audio:false });
      cam.srcObject = stream; await cam.play(); cameraWrap.classList.remove('hide'); scanning = true; scanLoop();
    } catch (e) { console.error(e); toast('Cannot open camera.'); }
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

  btnOpenCamera.addEventListener('click', startScan);
  btnCloseCamera.addEventListener('click', stopScan);

  btnConfirm.addEventListener('click', ()=> {
    scoreFormWrap.classList.remove('hide');
    toast('Ready to enter score.');
    scoreFormWrap.scrollIntoView({behavior:'smooth', block:'start'});
  });

  scoreForm.addEventListener('submit', async (e)=> {
    e.preventDefault();
    const fd = new FormData(scoreForm);
    const payload = Object.fromEntries(fd.entries());
    payload['FALSE START'] = fd.get('FALSE START') ? 'YES' : '';
    try {
      const out = await apiPost(payload);
      if (out && (out.ok || out.raw)) { toast('Submitted ✅'); scoreForm.reset(); }
      else { throw new Error('Server rejected'); }
    } catch (err) {
      console.error(err); toast('Submit failed — check internet/app script.');
    }
  });
})();