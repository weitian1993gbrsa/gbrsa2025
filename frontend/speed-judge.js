(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);

  /* ============================================================
     RETURN URL (secure)
     Preload station page so redirect feels instant
  ============================================================ */
  const returnURL =
    `station.html?station=${params.get("station")}&key=${params.get("key")}`;

  // Preload next station page for instant return
  fetch(returnURL).catch(()=>{});

  /* ============================================================
     PRE-WARM BACKEND (eliminate first cold delay)
  ============================================================ */
  fetch(window.CONFIG.APPS_SCRIPT_URL + "?warmup=1").catch(()=>{});

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
     FORM SUBMISSION HANDLER (TURBO OPTIMIZED)
  ============================================================ */
  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ⚡ Overlay immediate + smooth
    overlay.style.opacity = "1";
    overlay.classList.remove("hide");
    overlayText.textContent = "Submitting…";

    const fd = new FormData(scoreForm);
    const payload = Object.fromEntries(fd.entries());

    // Checkbox fix
    payload["FALSE START"] = fd.get("FALSE START") ? "YES" : "";
    payload._form = "speed";

    // ⚡ Non-blocking API + ultra-fast UI
    apiPost(payload).then(() => {

      overlayText.textContent = "Saved ✔";

      // ⚡ SUPER FAST REDIRECT (120ms)
      setTimeout(() => {
        location.href = returnURL;
      }, 120);

    }).catch(err => {
      console.error(err);
      overlayText.textContent = "Submit failed";
      setTimeout(() => overlay.classList.add("hide"), 800);
    });
  });

})();
