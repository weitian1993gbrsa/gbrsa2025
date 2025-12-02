(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);

  /* ============================================================
     RETURN URL
  ============================================================ */
  const returnURL =
    `station.html?station=${params.get("station")}&key=${params.get("key")}`;

  fetch(returnURL).catch(()=>{}); // preload next page

  /* ============================================================
     PRE-WARM BACKEND
  ============================================================ */
  fetch(window.CONFIG.APPS_SCRIPT_URL + "?warmup=1").catch(()=>{});

  /* ============================================================
     LOAD PARTICIPANT INTO HIDDEN FIELDS
  ============================================================ */
  const set = (sel, val) => {
    const el = $(sel);
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
     NUMBERPAD (MAX 3 DIGITS)
  ============================================================ */
  const scoreScreen = $("#scoreScreen");
  const hiddenScore = $("#hiddenScore");

  const buttons = document.querySelectorAll(".numpad-grid button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      const key = btn.dataset.key;
      if (!key) return;  // safety

      /* CLEAR */
      if (key === "clear") {
        hiddenScore.value = "";
        scoreScreen.textContent = "···";
        return;
      }

      /* ENTER */
      if (key === "enter") {
        $("#scoreForm").requestSubmit();
        return;
      }

      /* DIGIT ENTRY */
      if (/^[0-9]$/.test(key)) {

        let value = hiddenScore.value;

        if (value.length >= 3) return;

        value += key;
        hiddenScore.value = value;

        // masked UI preview
        scoreScreen.textContent =
          "•".repeat(value.length).padEnd(3, "·");
      }
    });
  });

  /* ============================================================
     SUBMIT HANDLER
  ============================================================ */
  const scoreForm = $("#scoreForm");
  const overlay = $("#submitOverlay");
  const overlayText = $("#overlayText");

  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const scoreVal = hiddenScore.value.trim();
    if (scoreVal === "") {
      alert("Please enter a score.");
      return;
    }

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
      .catch(err => {
        console.error(err);
        overlayText.textContent = "Submit failed";
        setTimeout(() => overlay.classList.add("hide"), 800);
      });
  });

})();
