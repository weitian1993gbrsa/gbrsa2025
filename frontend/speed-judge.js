(function(){
  const params = new URLSearchParams(location.search);

  const id = params.get("id");
  const heat = params.get("heat");
  const station = params.get("station");
  const eventName = params.get("event") || "";
  const division = params.get("division") || "";

  // Return to station page after submit
  const returnURL = `station.html?station=${station}`;

  // Hidden fields
  document.getElementById("fID").value = id;
  document.getElementById("fHEAT").value = heat;
  document.getElementById("fSTATION").value = station;
  document.getElementById("fEVENT").value = eventName;
  document.getElementById("fDIVISION").value = division;

  const scoreForm = document.getElementById("scoreForm");
  const submitOverlay = document.getElementById("submitOverlay");
  const overlayText = document.getElementById("overlayText");

  scoreForm.addEventListener("submit", async (e)=>{
    e.preventDefault();

    submitOverlay.classList.remove("hide");
    overlayText.textContent = "Sending…";

    const fd = new FormData(scoreForm);
    const payload = Object.fromEntries(fd.entries());

    payload["FALSE START"] = fd.get("FALSE START") ? "YES" : "";
    payload._form = "speed";

    try{
      const out = await apiPost(payload);

      overlayText.textContent = "Saved!";
      if (window.toast) toast("Submitted ✔");

      setTimeout(()=>{
        location.href = returnURL;
      }, 600);

    } catch(err){
      console.error(err);
      toast("Submit failed");
      submitOverlay.classList.add("hide");
    }
  });

})();
