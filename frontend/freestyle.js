(function(){
  const $ = (q, el=document) => el.querySelector(q);

  /** -------------------- DOM refs -------------------- **/
  const submitOverlay = document.getElementById('submitOverlay');
  const overlayText   = document.getElementById('overlayText');

  const entryInput = $('#entryIdInput');

  const participantCard = $('#participantCard');
  const badgeHeat = $('#badgeHeat');
  const badgeStation = $('#badgeStation');
  const badgeEvent = $('#badgeEvent');
  const badgeDivision = $('#badgeDivision');
  const pId = $('#pId');
  const pNames = $('#pNames');
  const pRep = $('#pRep');
  const pState = $('#pState');

  // hidden fields written after lookup
  const fId = $('#fId');
  const fNAME1 = $('#fNAME1');
  const fNAME2 = $('#fNAME2');
  const fNAME3 = $('#fNAME3');
  const fNAME4 = $('#fNAME4');
  const fREP = $('#fREP');
  const fSTATE = $('#fSTATE');
  const fHEAT = $('#fHEAT');
  const fSTATION = $('#fSTATION');
  const fEVENT = $('#fEVENT');
  const fDIVISION = $('#fDIVISION');

  const btnConfirm = $('#btnConfirm');
  const scoreFormWrap = $('#scoreFormWrap');
  const scoreForm = $('#scoreForm');

  const loadingDots = '<span class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';

  /** -------------------- helpers -------------------- **/
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function to2(v){
    if (v == null || v === '') return '0.00';   // used only when we submit
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  }
  function toIntStr(v){
    if (v == null || v === '') return '';       // keep empty in UI
    const n = Math.max(0, parseInt(String(v), 10) || 0);
    return String(n);
  }
  function hideStep2(){ scoreFormWrap.classList.add('hide'); btnConfirm.disabled = true; }
  function showParticipant(){ participantCard.classList.remove('hide'); }
  function hideParticipant(){ participantCard.classList.add('hide'); }
  function clearHidden(){ [fId,fNAME1,fNAME2,fNAME3,fNAME4,fREP,fSTATE,fHEAT,fSTATION,fEVENT,fDIVISION].forEach(el => { if (el) el.value = ''; }); }

  function resetUI(){
    if (scoreForm) scoreForm.reset();        // restores HTML defaults (all placeholders)
    clearHidden();
    hideParticipant();
    hideStep2();
    if (pId) pId.textContent = '—';
    if (pNames) pNames.innerHTML = '—';
    if (pRep) pRep.textContent = '—';
    if (pState) pState.textContent = '—';
    if (badgeHeat) badgeHeat.textContent = 'HEAT —';
    if (badgeStation) badgeStation.textContent = 'STATION —';
    if (badgeEvent) badgeEvent.textContent = 'EVENT —';
    if (badgeDivision) badgeDivision.textContent = 'DIVISION —';
    if (entryInput) entryInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const isTouch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || (navigator.maxTouchPoints>0);
    if (!isTouch){ setTimeout(()=> entryInput && entryInput.focus && entryInput.focus(), 150); }
  }

  // uppercase ID typing for convenience
  if (entryInput){
    entryInput.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      e.target.value = (e.target.value || '').toUpperCase();
      try { e.target.setSelectionRange(pos, pos); } catch(_){}
    });
    entryInput.addEventListener('keyup', e => { if (e.key === 'Enter') lookupById(entryInput.value); });
  }

  /** -------------------- participant lookup -------------------- **/
  async function lookupById(raw){
    const id = String(raw||'').trim().toUpperCase();
    if (!id){ hideParticipant(); hideStep2(); clearHidden(); return; }

    hideStep2();
    clearHidden();

    showParticipant();
    btnConfirm && (btnConfirm.disabled = true);
    if (pId) pId.textContent = 'Loading…';
    if (pNames) pNames.innerHTML = loadingDots;
    if (pRep) pRep.textContent = '';
    if (pState) pState.textContent = '';
    if (badgeHeat) badgeHeat.textContent = 'HEAT —';
    if (badgeStation) badgeStation.textContent = 'STATION —';
    if (badgeEvent) badgeEvent.textContent = 'EVENT —';
    if (badgeDivision) badgeDivision.textContent = 'DIVISION —';

    try {
      const data = await apiGet({ cmd:'participant', entryId: id }); // provided by app.js
      if (!data || !data.participant){
        hideParticipant(); hideStep2(); clearHidden();
        if (window.toast) toast('ID not found.');
        return;
      }
      const p = data.participant || {};

      // ✅ ONLY allow these freestyle events
      const allowedEvents = ['SRIF_LEVEL 1', 'SRIF_LEVEL 2', 'SRIF'];
      // normalize: underscores/spaces & case-insensitive
      const norm = (s)=> String(s||'').toUpperCase().replace(/[_\s]+/g,' ').trim();
      const eventNorm = norm(p['EVENT']);
      const isFreestyleEvent = allowedEvents.map(norm).includes(eventNorm);

      if (!isFreestyleEvent) {
        hideParticipant(); hideStep2(); clearHidden();
        if (window.toast) toast(`This ID is not valid for Freestyle (event: ${p['EVENT']||'Unknown'}).`);
        else alert(`This ID is not valid for Freestyle (event: ${p['EVENT']||'Unknown'}).`);
        return;
      }

      const names = [p['NAME1'], p['NAME2'], p['NAME3'], p['NAME4']]
        .filter(Boolean).map(escapeHtml).join('<br>');
      const rep = p['REPRESENTATIVE'] || '';
      const state = p['STATE'] || '';
      const heat = p['HEAT'] || '';
      const event = p['EVENT'] || '';
      const division = p['DIVISION'] || '';
      const station = p['STATION'] || '';

      // Fill visible
      if (pId) pId.textContent = id;
      if (pNames) pNames.innerHTML = names || '—';
      if (pRep) pRep.textContent = rep || '—';
      if (pState) pState.textContent = state || '—';
      if (badgeHeat) badgeHeat.textContent = `HEAT ${heat||'—'}`;
      if (badgeStation) badgeStation.textContent = `STATION ${station||'—'}`;
      if (badgeEvent) badgeEvent.textContent = `EVENT ${event||'—'}`;
      if (badgeDivision) badgeDivision.textContent = `DIVISION ${division||'—'}`;

      // Fill hidden context
      if (fId) fId.value = id;
      if (fNAME1) fNAME1.value = p['NAME1'] || '';
      if (fNAME2) fNAME2.value = p['NAME2'] || '';
      if (fNAME3) fNAME3.value = p['NAME3'] || '';
      if (fNAME4) fNAME4.value = p['NAME4'] || '';
      if (fREP) fREP.value = rep;
      if (fSTATE) fSTATE.value = state;
      if (fHEAT) fHEAT.value = heat;
      if (fSTATION) fSTATION.value = station;
      if (fEVENT) fEVENT.value = event;
      if (fDIVISION) fDIVISION.value = division;

      btnConfirm && (btnConfirm.disabled = false);
    } catch (err){
      console.error(err);
      hideParticipant(); hideStep2(); clearHidden();
      if (window.toast) toast('Lookup failed.');
    }
  }

  /** -------------------- show form -------------------- **/
  if (btnConfirm){
    btnConfirm.addEventListener('click', ()=> {
      scoreFormWrap.classList.remove('hide');
      if (window.toast) toast('Ready to enter score.');
      scoreFormWrap.scrollIntoView({behavior:'smooth', block:'start'});
    });
  }

  /** -------------------- make fields easy to edit -------------------- **/
  // DIFF fields: select on focus, pretty-print 2dp on blur (only if not empty)
  ['DIFF J1','DIFF J2'].forEach(name=>{
    const el = document.querySelector(`input[name="${name}"]`);
    if (!el) return;
    el.addEventListener('focus', ()=> el.select());
    el.addEventListener('blur',  ()=> { if (el.value !== '') el.value = to2(el.value); });
  });

  // MISSES/BREAKS/Missed RE: select on focus, clean to non-negative integer on blur
  ['MISSES','BREAKS','Missed RE'].forEach(name=>{
    const el = document.querySelector(`input[name="${name}"]`);
    if (!el) return;
    el.addEventListener('focus', ()=> el.select());
    el.addEventListener('blur',  ()=> { if (el.value !== '') el.value = toIntStr(el.value); });
  });

  /** -------------------- submit (FREESTYLE) -------------------- **/
  function alias(obj, from, to){
    if (obj[from] != null && obj[to] == null) obj[to] = obj[from];
  }

  if (scoreForm){
    scoreForm.addEventListener('submit', async (e)=> {
      e.preventDefault();

      if (submitOverlay){ overlayText && (overlayText.textContent = 'Sending…'); submitOverlay.classList.remove('hide'); }

      const fd = new FormData(scoreForm);
      let payload = Object.fromEntries(fd.entries());
      payload._form = 'freestyle';          // backend routes to RESULT_F

      // alias support if your input names ever use underscores
      alias(payload, 'MISSED_RE', 'Missed RE');
      alias(payload, 'DIFF_J1', 'DIFF J1');
      alias(payload, 'DIFF_J2', 'DIFF J2');

      // defaults/formatting: treat blanks as zero
      payload.MISSES = String(payload.MISSES ?? '').trim() === '' ? '0' : toIntStr(payload.MISSES);
      payload.BREAKS = String(payload.BREAKS ?? '').trim() === '' ? '0' : toIntStr(payload.BREAKS);
      payload['Missed RE'] = String(payload['Missed RE'] ?? '').trim() === '' ? '0' : toIntStr(payload['Missed RE']);
      payload['DIFF J1'] = to2(payload['DIFF J1'] ?? '');
      payload['DIFF J2'] = to2(payload['DIFF J2'] ?? '');

      // ensure participant context is present
      if (!payload.ID && fId) payload.ID = fId.value || '';
      if (!payload.NAME1 && fNAME1) payload.NAME1 = fNAME1.value || '';
      if (!payload.REPRESENTATIVE && fREP) payload.REPRESENTATIVE = fREP.value || '';
      if (!payload.STATE && fSTATE) payload.STATE = fSTATE.value || '';
      if (!payload.HEAT && fHEAT) payload.HEAT = fHEAT.value || '';
      if (!payload.STATION && fSTATION) payload.STATION = fSTATION.value || '';
      if (!payload.EVENT && fEVENT) payload.EVENT = fEVENT.value || '';
      if (!payload.DIVISION && fDIVISION) payload.DIVISION = fDIVISION.value || '';

      try {
        const out = await apiPost(payload); // provided by app.js
        if (out && out.ok) {
          if (window.toast) toast('Submitted ✅');
          if (submitOverlay){ overlayText && (overlayText.textContent = 'Saved!'); await new Promise(r=>setTimeout(r, 550)); submitOverlay.classList.add('hide'); }
          resetUI();
        } else {
          throw new Error(out && out.error ? out.error : 'Server rejected');
        }
      } catch (err) {
        console.error(err);
        if (submitOverlay){ submitOverlay.classList.add('hide'); }
        if (window.toast) toast('Submit failed — '+(err && err.message ? err.message : 'check connection/app script'));
      }
    });
  }

  /** -------------------- initial -------------------- **/
  hideParticipant();
  hideStep2();
})();
