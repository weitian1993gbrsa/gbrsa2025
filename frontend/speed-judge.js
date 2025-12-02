(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);

  /* ============================================================
     RETURN URL + PRELOAD
  ============================================================ */
  const returnURL =
    `station.html?station=${params.get("station")}&key=${params.get("key")}`;

  fetch(returnURL).catch(() => {});

  /* ============================================================
     PRE-WARM BACKEND
  ============================================================ */
  fetch(window.CONFIG.APPS_SCRIPT_URL + "?warmup=1").catch(() => {});

  /* ============================================================
     LOAD PARTICIPANT DATA
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
   NUMBERPAD SAFE HANDLER (NO AUTO SUBMIT)
============================================================ */
const scoreScreen = $("#scoreScreen");
const hiddenScore = $("#hiddenScore");
const numberButtons = document.querySelectorAll(".simple-pad button");

numberButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;

    // If no key assigned → ignore completely
    if (!key) return;

    /* CLEAR BUTTON */
    if (key === "clear") {
      hiddenScore.value = "";
      scoreScreen.textContent = "···";
      return;
    }

    /* ENTER BUTTON — manually submit */
    if (key === "enter") {
      $("#scoreForm").requestSubmit();
      return;
    }

    /* DIGITS ONLY */
    if (/^[0-9]$/.test(key)) {
      let stored = hiddenScore.value;

      // MAX 3 digits
      if (stored.length >= 3) return;

      stored += key;
      hiddenScore.value = stored;

      // Update screen — dots only
      scoreScreen.textContent =
        "•".repeat(stored.length).padEnd(3, "·");

      return;
    }

  });
});


  /* ============================================================
     SUBMIT FORM
  ============================================================ */
  const scoreForm = $("#scoreForm");
  const overlay = $("#submitOverlay");
  const overlayText = $("#overlayText");

  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const scoreVal = hiddenScore.value.trim();

    if (scoreVal === "" || scoreVal.length === 0) {
      alert("Please enter a score before submitting.");
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
        setTimeout(() => {
          overlay.classList.add("hide");
        }, 800);
      });
  });

})();
