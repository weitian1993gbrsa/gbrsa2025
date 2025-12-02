(function(){
  const $ = (q, el=document) => el.querySelector(q);

  /* DOM ELEMENTS */
  const entryInput = $('#entryIdInput');
  const participantCard = $('#participantCard');

  const pcID = $('#pcID');
  const pcName = $('#pcName');
  const pcHeat = $('#pcHeat');
  const pcTeam = $('#pcTeam');
  const pcStation = $('#pcStation');
  const pcState = $('#pcState');
  const pcEvent = $('#pcEvent');
  const pcDivision = $('#pcDivision');
  const pcStatus = $('#pcStatus');

  const scoreFormWrap = $('#scoreFormWrap');
  const scoreForm = $('#scoreForm');

  const submitOverlay = document.getElementById('submitOverlay');
  const overlayText   = document.getElementById('overlayText');

  /* Hidden fields */
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

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, m => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[m]));
  }

  function hideStep2(){
    scoreFormWrap.classList.add('hide');
  }

  function showStep2(){
    scoreFormWrap.classList.remove('hide');
  }

  function showParticipant(){ participantCard.classList.remove('hide'); }
  function hideParticipant(){ participantCard.classList.add('hide'); }

  function clearHidden(){
    [fId,fNAME1,fNAME2,fNAME3,fNAME4,fREP,fSTATE,fHEAT,fSTATION,fEVENT,fDIVISION]
      .forEach(el => el.value = '');
  }

  function resetUI(){
    scoreForm.reset();
    clearHidden();
    hideParticipant();
    hideStep2();

    pcID.textContent = 'ID —';
    pcName.textContent = 'NAME';
    pcHeat.textContent = 'Heat —';
    pcTeam.textContent = 'Team —';
    pcStation.textContent = 'Station —';
    pcState.textContent = 'State —';
    pcEvent.textContent = 'Event —';
    pcDivision.textContent = 'Division —';

    pcStatus.textContent = "● Pending";
    pcStatus.className = "pc-status pc-pending";

    if (entryInput) entryInput.value = '';
  }

  async function checkStatus(id, station) {
    try {
      const res = await apiGet({ cmd:"stationlist", station });
      if (!res || !res.entries) return "pending";

      const found = res.entries.find(e => e.entryId === id);
      return found ? found.status : "pending";

    } catch(e){
      return "pending";
    }
  }

  /* LOOKUP PART */
  async function lookupById(raw){
    const id = String(raw||'').trim().toUpperCase();
    if (!id){
      hideParticipant();
      hideStep2();
      clearHidden();
      return;
    }

    hideStep2();
    clearHidden();
    showParticipant();

    pcID.textContent = "Loading…";

    try {
      const data = await apiGet({ cmd:'participant', entryId:id });
      if (!data || !data.participant){
        hideParticipant();
        hideStep2();
        clearHidden();
        if (window.toast) toast("ID not found.");
        return;
      }

      const p = data.participant;

      const names = [p.NAME1,p.NAME2,p.NAME3,p.NAME4]
        .filter(Boolean)
        .map(escapeHtml)
        .join(', ');

      pcID.textContent = id;
      pcName.textContent = names || '—';
      pcHeat.textContent = "Heat " + (p.HEAT || "—");
      pcTeam.textContent = "Team " + (p.TEAM || "—");
      pcStation.textContent = "Station " + (p.STATION || "—");
      pcState.textContent = "State " + (p.STATE || "—");
      pcEvent.textContent = "Event " + (p.EVENT || "—");
      pcDivision.textContent = "Division " + (p.DIVISION || "—");

      fId.value = id;
      fNAME1.value = p.NAME1 || '';
      fNAME2.value = p.NAME2 || '';
      fNAME3.value = p.NAME3 || '';
      fNAME4.value = p.NAME4 || '';
      fREP.value = p.TEAM || '';
      fSTATE.value = p.STATE || '';
      fHEAT.value = p.HEAT || '';
      fSTATION.value = p.STATION || '';
      fEVENT.value = p.EVENT || '';
      fDIVISION.value = p.DIVISION || '';

      const judgedStatus = await checkStatus(id, p.STATION);

      if (judgedStatus === "done") {
        pcStatus.textContent = "● Done";
        pcStatus.className = "pc-status pc-done";
      } else {
        pcStatus.textContent = "● Pending";
        pcStatus.className = "pc-status pc-pending";
      }

      /* ⭐ NO CONFIRM BUTTON → Show Step 2 Automatically */
      showStep2();

    } catch(e){
      console.error(e);
      hideParticipant();
      hideStep2();
      clearHidden();
      if (window.toast) toast("Lookup failed.");
    }
  }

  /* INPUT EVENTS */
  if (entryInput){
    entryInput.addEventListener('input', e=>{
      e.target.value = e.target.value.toUpperCase();
      if (!e.target.value.trim()){
        hideParticipant();
        hideStep2();
      }
    });

    entryInput.addEventListener('keyup', e=>{
      if (e.key === "Enter") lookupById(entryInput.value);
    });

    entryInput.addEventListener('change', e=>{
      lookupById(e.target.value);
    });
  }

  /* SUBMIT */
  if (scoreForm){
    scoreForm.addEventListener('submit', async e=>{
      e.preventDefault();

      if (submitOverlay){
        overlayText.textContent = "Sending…";
        submitOverlay.classList.remove("hide");
      }

      const fd = new FormData(scoreForm);
      const payload = Object.fromEntries(fd.entries());
      payload["FALSE START"] = fd.get("FALSE START") ? "YES" : "";
      payload._form = "speed";

      try{
        const out = await apiPost(payload);
        if (!out || out.ok === false){
          throw new Error(out.error || "Server error");
        }

        if (window.toast) toast("Submitted ✅");

        overlayText.textContent = "Saved!";
        await new Promise(r=>setTimeout(r,500));
        submitOverlay.classList.add("hide");

        resetUI();

      } catch(err){
        console.error(err);
        if (submitOverlay) submitOverlay.classList.add("hide");
        if (window.toast) toast("Submit failed.");
      }
    });
  }

  window.speedLookupById = lookupById;

  hideParticipant();
  hideStep2();
})();
