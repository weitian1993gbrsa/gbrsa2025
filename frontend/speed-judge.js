(function(){
  const $ = (q,el=document)=>el.querySelector(q);

  const params = new URLSearchParams(location.search);

  // Read all participant details from URL
  const id       = params.get("id");
  const name1    = params.get("name1");
  const name2    = params.get("name2");
  const name3    = params.get("name3");
  const name4    = params.get("name4");
  const team     = params.get("team");
  const state    = params.get("state");
  const heat     = params.get("heat");
  const station  = params.get("station");
  const event    = params.get("event");
  const division = params.get("division");

  // Fill hidden fields
  $('#fID').value      = id;
  $('#fNAME1').value   = name1;
  $('#fNAME2').value   = name2;
  $('#fNAME3').value   = name3;
  $('#fNAME4').value   = name4;
  $('#fTEAM').value    = team;
  $('#fSTATE').value   = state;
  $('#fHEAT').value    = heat;
  $('#fSTATION').value = station;
  $('#fEVENT').value   = event;
  $('#fDIVISION').value= division;

  const scoreForm = $('#scoreForm');
  const submitOverlay = $('#submitOverlay');
  const overlayText = $('#overlayText');

  const returnURL = `station.html?station=${station}`;

  /** On Submit */
  scoreForm.addEventListener("submit", async (e)=>{
    e.preventDefault();

    submitOverlay.classList.remove("hide");
    overlayText.textContent = "Sending…";

    const fd = new FormData(scoreForm);
    const payload = Object.fromEntries(fd.entries());

    payload["FALSE START"] = fd.get("FALSE START") ? "YES" : "";
    payload._form = "speed";

    try{
      await apiPost(payload);

      overlayText.textContent = "Saved!";
      if (window.toast) toast("Submitted ✔");

      setTimeout(()=>{ location.href = returnURL; }, 600);

    } catch(err){
      console.error(err);
      toast("Submit failed");
      submitOverlay.classList.add("hide");
    }
  });

})();
