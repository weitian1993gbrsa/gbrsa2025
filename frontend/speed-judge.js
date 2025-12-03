(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);

  /* =====================================================
     RETURN URL + PRELOAD
  ====================================================== */
  const returnURL =
    `station.html?station=${params.get("station")}&key=${params.get("key")}`;

  fetch(returnURL).catch(()=>{});

  /* Warm backend */
  fetch(window.CONFIG.APPS_SCRIPT_URL + "?warmup=1").catch(()=>{});

  /* Load participant hidden values */
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

  /* =====================================================
     NUMBERPAD LOGIC (MAX 3 DIGITS)
  ====================================================== */
  const scoreScreen = $("#scoreScreen");
  const hiddenScore = $("#hiddenScore");
  const numButtons = document.querySelectorAll(".numpad-grid button[data-key]");

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
        let cur = scoreScreen.textContent.trim();

        if (cur.length >= 3) return;

        if (cur === "0") {
          scoreScreen.textContent = key;
        } else {
          scoreScreen.textContent = cur + key;
        }

        hiddenScore.value = scoreScreen.textContent;
      }
    });
  });

  /* =====================================================
     FALSE START TOGGLE BUTTON
  ====================================================== */
  const fsBtn = $("#falseStartBtn");
  const fsVal = $("#falseStartValue");

  fsBtn.addEventListener("click", () => {
    if (fsVal.value === "NO") {
      fsVal.value = "YES";
      fsBtn.textContent = "YES";
      fsBtn.classList.remove("fs-no");
      fsBtn.classList.add("fs-yes");
    } else {
      fsVal.value = "NO";
      fsBtn.textContent = "NO";
      fsBtn.classList.remove("fs-yes");
      fsBtn.classList.add("fs-no");
    }
  });

  /* =====================================================
     FINAL SUBMIT HANDLER
  ====================================================== */
  const scoreForm = $("#scoreForm");
  const overlay = $("#submitOverlay");
  const overlayText = $("#overlayText");

  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const score = scoreScreen.textContent.trim();

    if (score === "") {
      alert("Please enter a score before submitting.");
      return;
    }

    hiddenScore.value = score;

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
        setTimeout(() => overlay.classList.add("hide"), 1000);
      });
  });

})();
