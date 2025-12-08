(function () {

  /* ============================================================
     POINT TABLE (IJRU)
  ============================================================ */
  const POINTS = {
    "0.5": 0.12, "1": 0.15, "2": 0.23, "3": 0.34,
    "4": 0.51, "5": 0.76, "6": 1.14, "7": 1.71, "8": 2.56
  };

  let counts = { "0.5":0, "1":0, "2":0, "3":0, "4":0, "5":0, "6":0, "7":0, "8":0 };
  let lastAction = null;

  const $ = (q) => document.querySelector(q);

  const totalScoreEl = $("#totalScore");
  const btnSubmit    = $("#btnSubmit");
  const undoBtn      = $("#undoBtn");
  const resetBtn     = $("#resetBtn");

  /* ============================================================
     UPDATE UI
  ============================================================ */
  function updateUI() {
    for (const lvl in counts) {
      const el = document.querySelector("#count" + lvl.replace(".", ""));
      if (el) el.textContent = counts[lvl];
    }

    let total = 0;
    for (const lvl in counts) total += counts[lvl] * POINTS[lvl];
    totalScoreEl.textContent = total.toFixed(2);
  }

  /* ============================================================
     SKILL BUTTONS
  ============================================================ */
  document.querySelectorAll(".skill-btn").forEach(btn => {
    btn.addEventListener("pointerdown", () => {
      const lvl = btn.dataset.level;

      lastAction = { level: lvl, prev: counts[lvl] };
      counts[lvl]++;

      updateUI();
      if (navigator.vibrate) navigator.vibrate([80]);

      btn.classList.add("pressed");
      setTimeout(() => btn.classList.remove("pressed"), 150);
    });
  });

  /* ============================================================
     UNDO
  ============================================================ */
  undoBtn.addEventListener("click", () => {
    if (!lastAction) return;
    counts[lastAction.level] = lastAction.prev;
    lastAction = null;
    updateUI();
  });

  /* ============================================================
     RESET
  ============================================================ */
  resetBtn.addEventListener("click", () => {
    for (let lvl in counts) counts[lvl] = 0;
    lastAction = null;
    updateUI();
  });

  /* ============================================================
     SUBMIT (COMPLETE FIXED VERSION)
  ============================================================ */
  btnSubmit.addEventListener("click", async () => {

    // Logic lock only
    if (btnSubmit.dataset.lock === "1") return;
    btnSubmit.dataset.lock = "1";

    const params = new URLSearchParams(location.search);
    const station = params.get("station");
    const judgeType = params.get("judgeType");
    const key = params.get("key");

    /* ------------------------------------------------------------
       SHOW SUBMIT OVERLAY (speed-style)
    ------------------------------------------------------------ */
    const overlay = document.getElementById("submitOverlay");
    const overlayText = document.getElementById("overlayText");

    overlay.classList.remove("hide");
    overlay.style.opacity = "1";
    overlayText.textContent = "Submitting…";

    // DO NOT change button text or style anymore

    /* ------------------------------------------------------------
       BUILD PAYLOAD
    ------------------------------------------------------------ */
    const payload = {
      judgeType: "difficulty",

      ID: params.get("id") || "",
      NAME1: params.get("name1") || "",
      TEAM: params.get("team") || "",
      STATE: params.get("state") || "",
      HEAT: params.get("heat") || "",
      STATION: station,
      EVENT: params.get("event") || "",
      DIVISION: params.get("division") || "",

      DIFF: Number(totalScoreEl.textContent),
      REMARK: ""
    };

    try {
      const result = await apiPost(payload);
      if (!result || !result.ok) throw new Error(result?.error || "Server error");

      /* ------------------------------------------------------------
         SPEED-STYLE SUCCESS
      ------------------------------------------------------------ */
      overlayText.textContent = "Saved ✔";

      /* ------------------------------------------------------------
         UPDATE LOCAL CACHE (BLUE CARD)
      ------------------------------------------------------------ */
      try {
        const CACHE_KEY = "freestyle_cache_" + station;
        const entryId = params.get("id");

        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cacheData = JSON.parse(raw);

          cacheData.entries = cacheData.entries.map(e =>
            e.entryId === entryId ? { ...e, status: "done" } : e
          );

          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        }
      } catch (err) {
        console.warn("Cache update failed:", err);
      }

      /* ------------------------------------------------------------
         ⭐ MOBILE FIX:
         Use location.href instead of history.back()
         → Forces full reload
         → Loads updated BLUE card
      ------------------------------------------------------------ */
      setTimeout(() => {
        location.href =
          `freestyle-station.html?station=${station}&judgeType=${judgeType}&key=${key}`;
      }, 300);

    } catch (err) {

      overlayText.textContent = "Submit Failed";

      setTimeout(() => overlay.classList.add("hide"), 700);

      // unlock logic only
      btnSubmit.dataset.lock = "0";
    }
  });

  updateUI();

})();
