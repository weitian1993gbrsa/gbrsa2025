(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);

  /* ============================================================
     RETURN URL (secure) + PRELOAD
  ============================================================ */
  const returnURL =
    `station.html?station=${params.get("station")}&key=${params.get("key")}`;

  fetch(returnURL).catch(()=>{}); // preload

  /* ============================================================
     PRE-WARM BACKEND
  ============================================================ */
  fetch(window.CONFIG.APPS_SCRIPT_URL + "?warmup=1").catch(()=>{});

  /* ============================================================
     LOAD PARTICIPANT DATA INTO HIDDEN FIELDS
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
   NUMBERPAD + SCORE SCREEN (MAX 3 DIGITS)
============================================================ */
const scoreScreen = $("#scoreScreen");
const hiddenScore = $("#hiddenScore");

const numButtons = document.querySelectorAll(".numpad-grid button");

numButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;

    // CLEAR
    if (key === "clear") {
      scoreScreen.textContent = "0";
      hiddenScore.value = "";
      return;
    }

    // ENTER → submit
    if (key === "enter") {
      const form = $("#scoreForm");
      form.dispatchEvent(new Event("submit"));
      return;
    }

    // DIGITS 0–9 with MAX LENGTH = 3
    if (/^[0-9]$/.test(key)) {
      let current = scoreScreen.textContent.trim();

      // If current already has 3 digits → stop
      if (current.length >= 3) return;

      // Replace leading zero
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
     FORM SUBMISSION (TURBO MODE)
  ============================================================ */
  const scoreForm = $("#scoreForm");
  const overlay = $("#submitOverlay");
  const overlayText = $("#overlayText");

  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ensure score is not empty
    const scoreVal = scoreScreen.textContent.trim();
    if (scoreVal === "" || scoreVal === "0") {
      alert("Please enter a score before submitting.");
      return;
    }

    hiddenScore.value = scoreVal;

    // Show overlay
    overlay.style.opacity = "1";
    overlay.classList.remove("hide");
    overlayText.textContent = "Submitting…";

    const fd = new FormData(scoreForm);
    const payload = Object.fromEntries(fd.entries());

    payload["FALSE START"] = fd.get("FALSE START") ? "YES" : "";
    payload._form = "speed";

    apiPost(payload)
      .then(() => {
        overlayText.textContent = "Saved ✔";

        setTimeout(() => {
          location.href = returnURL;
        }, 120);
      })
      .catch((err) => {
        console.error(err);
        overlayText.textContent = "Submit failed";
        setTimeout(() => overlay.classList.add("hide"), 800);
      });
  });

})();
