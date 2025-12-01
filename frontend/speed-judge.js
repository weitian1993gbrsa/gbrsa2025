(function(){
  const $ = (q,el=document)=>el.querySelector(q);

  const params = new URLSearchParams(location.search);
  const entryId = params.get("id");
  const station = params.get("station") || "";
  const returnUrl = `station.html?station=${station}`;

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
  const fSTATION = $('#fSTATION');
  const fEVENT = $('#fEVENT');
  const fDIVISION = $('#fDIVISION');

  const badgeHeat = $('#badgeHeat');
  const badgeStation = $('#badgeStation');
  const badgeEvent = $('#badgeEvent');
  const badgeDivision = $('#badgeDivision');

  const scoreForm = $('#scoreForm');
  const submitOverlay = $('#submitOverlay');
  const overlayText = $('#overlayText');

  async function loadParticipant(){
    try{
      const data = await apiGet({cmd:'participant', entryId});
      if (!data || !data.participant){
        toast("Participant not found");
        return;
      }

      const p = data.participant;

      pId.textContent = p.ID;
      pNames.innerHTML = [p.NAME1,p.NAME2,p.NAME3,p.NAME4].filter(Boolean).join("<br>");
      pRep.textContent = p.TEAM;
      pState.textContent = p.STATE;

      badgeHeat.textContent = `HEAT ${p.HEAT}`;
      badgeStation.textContent = `STATION ${p.STATION}`;
      badgeEvent.textContent = `EVENT ${p.EVENT}`;
      badgeDivision.textContent = `DIVISION ${p.DIVISION}`;

      fId.value = p.ID;
      fNAME1.value = p.NAME1;
      fNAME2.value = p.NAME2;
      fNAME3.value = p.NAME3;
      fNAME4.value = p.NAME4;
      fREP.value = p.TEAM;
      fSTATE.value = p.STATE;
      fHEAT.value = p.HEAT;
      fSTATION.value = p.STATION;
      fEVENT.value = p.EVENT;
      fDIVISION.value = p.DIVISION;

    }catch(err){
      console.error(err);
      toast("Failed to load participant");
    }
  }

  if (scoreForm){
    scoreForm.addEventListener("submit", async (e)=>{
      e.preventDefault();

      if (submitOverlay){
        overlayText.textContent = "Sending…";
        submitOverlay.classList.remove("hide");
      }

      const fd = new FormData(scoreForm);
      const payload = Object.fromEntries(fd.entries());
      payload['FALSE START'] = fd.get("FALSE START") ? "YES" : "";
      payload._form = "speed";

      try{
        const out = await apiPost(payload);

        overlayText.textContent = "Saved!";
        if (window.toast) toast("Submitted ✔");

        setTimeout(()=>{
          location.href = returnUrl;
        }, 600);

      }catch(err){
        console.error(err);
        toast("Submit failed");
        submitOverlay.classList.add("hide");
      }
    });
  }

  loadParticipant();

})();
