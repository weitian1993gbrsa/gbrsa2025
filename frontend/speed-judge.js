(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);

  /* ============================================================
     RETURN URL (secure) + PRELOAD
  ============================================================ */
  const returnURL =
    `speed-station.html?station=${params.get("station")}&key=${params.get("key")}`;

  fetch(returnURL).catch(()=>{});


  /* ============================================================
     PRE-WARM BACKEND
  ============================================================ */
  fetch(window.CONFIG.APPS_SCRIPT_URL + "?warmup=1").catch(()=>{});


  /* ============================================================
     FILL HIDDEN FIELDS
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



  /* ============================================================
     FALSE START TOGGLE
  ============================================================ */
  const fsBtn = $("#falseStartBtn");
  const fsVal = $("#falseStartVal");

  if (fsBtn && fsVal) {
    fsVal.value = ""; // default

    fsBtn.addEventListener("click", () => {

      const isYes = fsBtn.classList.contains("fs-yes");

      if (isYes) {
        fsBtn.classList.remove("fs-yes");
        fsBtn.classList.add("fs-no");
        fsBtn.textContent = "False Start: No";
        fsVal.value = "";
      } else {
        fsBtn.classList.remove("fs-no");
        fsBtn.classList.add("fs-yes");
        fsBtn.textContent = "False Start: Yes";
        fsVal.value = "YES";
      }
    });
  }



  /* ============================================================
     NUMBER PAD
  ============================================================ */
  const scoreScreen = $("#scoreScreen");
  const hiddenScore = $("#hiddenScore");

  const numButtons = document.querySelectorAll(".numpad-grid button");

  numButtons.forEach(btn => {
    btn.addEventListener("click", () => {

      const key = btn.dataset.key;

      if (key === "clear") {
        scoreScreen.textContent = "0";
        hiddenScore.value = "";
        return;
      }

      if (key === "enter") {
        $("#scoreForm").dispatchEvent(new Event("submit"));
        return;
      }

      if (/^[0-9]$/.test(key)) {

        let current = scoreScreen.textContent.trim();

        if (current.length >= 3) return;

        if (current === "0") {
          scoreScreen.textContent = key;
        } else {
          scoreScreen.textContent = current + key;
        }

        hiddenScore.value = scoreScreen.textContent;
      }

    });
  });



  /* ============================================================
     FORM SUBMIT
  ============================================================ */
  const scoreForm = $("#scoreForm");
  const overlay = $("#submitOverlay");
  const overlayText = $("#overlayText");

  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const scoreVal = scoreScreen.textContent.trim();

    if (scoreVal === "") {
      alert("Please enter a score.");
      return;
    }

    hiddenScore.value = scoreVal;

    overlay.style.opacity = "1";
    overlay.classList.remove("hide");
    overlayText.textContent = "Submitting…";

    const fd = new FormData(scoreForm);
    const payload = Object.fromEntries(fd.entries());

    payload._form = "speed";

    apiPost(payload)
      .then(() => {
        overlayText.textContent = "Saved ✔";
        setTimeout(() => location.href = returnURL, 120);
      })
      .catch(() => {
        overlayText.textContent = "Submit failed";
        setTimeout(() => overlay.classList.add("hide"), 800);
      });
  });

})();
