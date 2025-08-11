(function(){
  const $ = (q, el=document) => el.querySelector(q);
  // simple debounce for input
  function debounce(fn, ms=300){
    let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), ms); };
  }


  // Elements
  const entryInput = $('#entryIdInput');
  const participantCard = $('#participantCard');
  const badgeHeat = $('#badgeHeat');
  const badgeCourt = $('#badgeCourt');
  const pId = $('#pId');
  const pNames = $('#pNames');
  const pRep = $('#pRep');
  const pState = $('#pState');
  // Loading overlay helpers
  const loadingOverlay = document.getElementById('loadingOverlay');
  function showLoading(msg = 'Submitting…'){
    if (!loadingOverlay) return;
    const m = loadingOverlay.querySelector('.msg');
    if (m) m.textContent = msg;
    loadingOverlay.classList.remove('hide');
  }
  function hideLoading(){
    if (loadingOverlay) loadingOverlay.classList.add('hide');
  }


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

  async function lookupById(raw){ const id = String(raw||'').trim().toUpperCase();
    if (!id){ hideParticipant(); hideStep2(); clearHidden(); return; }

    // show loading
    showParticipant();
    if (typeof btnConfirm!=='undefined' && btnConfirm) btnConfirm.disabled = true;
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
    } \1
      try { hideLoading(); } catch(_) {}
    }
  }

  // Manual input triggers (simple & reliable)
  if (entryInput){
  const fire = () => lookupById(entryInput.value);
  const fireIfEnter = (e) => { if (e.key === 'Enter') fire(); };
  entryInput.addEventListener('change', e => fire());
  entryInput.addEventListener('keyup', fireIfEnter);
  entryInput.addEventListener('blur', e => fire());
  entryInput.addEventListener('input', debounce(fire, 300));
})();