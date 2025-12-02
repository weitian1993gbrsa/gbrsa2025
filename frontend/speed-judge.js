(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);

  /* ============================================================
     RETURN URL (with key included for secure access)
  ============================================================ */
  const returnURL =
    `station.html?station=${params.get("station")}&key=${params.get("key")}`;

  /* ============================================================
     LOAD PARTICIPANT VALUES INTO FORM
  ============================================================ */
  const set = (id, val) => { 
    const el = $(id); 
    if (el) el.value = val || ""; 
  };

  set("#fID", params.get("id"));
  set("#fNAME1", params.get("name1"));
  set("#fNAME2", params.get("name2"));
  set("#fNAME3", params.get("name3"));
  set("#fNAME4", params.get("name4"));
  set("#fTEAM", params.get("team"));
  set("#fSTATE", params.get("state"));
  set("#fHEAT", params.get("heat"));
  set("#fSTATION", params.get("station"));
  set("#fEVENT", params.get("event"));
  set("#fDIVISION", params.get("division"));

  const scoreForm = $("#scoreForm");
  const overlay = $("#submitOverlay");
  const overlayText = $("#overlayText");

  /* ============================================================
     FORM SUBMISSION HANDLER (OPTIMIZED)
  ============================================================ */
  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Show overlay immediately
    overlay.classList.remove("hide");
    overlayText.textContent = "Submitting…";

    const fd = new FormData(scoreForm);
    const payload = Object.fromEntries(fd.entries());

    // Checkbox fix
    payload["FALSE START"] = fd.get("FALSE START") ? "YES" : "";
    payload._form = "speed";

    try {
      const out = await apiPost(payload);

      // Success message
      overlayText.textContent = "Saved ✔";

      // SUPER FAST REDIRECT (150ms)
      setTimeout(() => {
        location.href = returnURL;
      }, 150);

    } catch (err) {
      console.error(err);
      overlayText.textContent = "Submit failed";
      setTimeout(() => overlay.classList.add("hide"), 800);
    }
  });

})();
