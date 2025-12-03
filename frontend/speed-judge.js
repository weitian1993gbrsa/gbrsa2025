(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);

  /* ============================================================
     RETURN URL (secure) + PRELOAD
  ============================================================ */
  const returnURL =
    `station.html?station=${params.get("station")}&key=${params.get("key")}`;

  fetch(returnURL).catch(()=>{}); // Preload station page


  /* ============================================================
     PRE-WARM BACKEND
  ============================================================ */
  fetch(window.CONFIG.APPS_SCRIPT_URL + "?warmup=1").catch(()=>{});


  /* ============================================================
     FILL HIDDEN FIELDS FROM URL
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
     FALSE START TOGGLE BUTTON
  ============================================================ */
  const fsBtn = $("#falseStartBtn");
  const fsHidden = $("#fFALSESTART");

  if (fsBtn && fsHidden) {
    fsHidden.value = "NO"; // default

    const setNo = () => {
      fsHidden.value = "NO";
      fsBtn.textContent = "FALSE START: NO";
      fsBtn.style.background = "#2ecc71"; // green
      fsBtn.style.color = "#fff";
    };

    const setYes = () => {
      fsHidden.value = "YES";
      fsBtn.textContent = "FALSE START: YES";
      fsBtn.style.background = "#d83131"; // red
      fsBtn.style.color = "#fff";
    };

    // default UI
    setNo();

    fsBtn.addEventListener("click", () => {
      if (fsHidden.value === "NO") setYes();
      else setNo();
    });
  }


  /* ============================================================
     NUMBERPAD + SCORE SCREEN (MAX 3 DIGITS)
  ============================================================ */
  const scoreScreen = $("#scoreScreen");
  const hiddenScore = $("#hiddenScore");

  const numButtons = document.querySelectorAll(".numpad-grid button");

  numButtons.forEach(btn => {
    btn.addEventListener("click", () => {

      const key = btn.dataset.key;

      /* ---------------- CLEAR BUTTON ---------------- */
      if (key === "clear") {
        scoreScreen.textContent = "0";
        hiddenScore.value = "";
        return;
      }

      /* ---------------- SUBMIT BUTTON ---------------- */
      if (key === "enter") {
        const form = $("#scoreForm");
        form.dispatchEvent(new Event("submit"));
        return;
      }

      /* ---------------- DIGIT BUTTONS ---------------- */
      if (/^[0-9]$/.test(key)) {

        let current = scoreScreen.textContent.trim();

        if (current.length >= 3) return; // max 3 digits

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
     FORM SUBMISSION
  ============================================================ */
  const scoreForm = $("#scoreForm");
  const overlay = $("#submitOverlay");
  const overlayText = $("#overlayText");

  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const scoreVal = scoreScreen.textContent.trim();

    if (scoreVal === "") {
      alert("Please enter a score before submitting.");
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
