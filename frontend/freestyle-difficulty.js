(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);

  /* ============================================================
     PRELOAD + WARMUP (same as speed)
  ============================================================ */
  const returnURL =
    `freestyle-station.html?station=${params.get("station")}&key=${params.get("key")}`;

  fetch(returnURL).catch(()=>{});
  fetch(window.CONFIG.APPS_SCRIPT_URL + "?warmup=1").catch(()=>{});

  /* ============================================================
     SCORING SYSTEM (unchanged)
  ============================================================ */
  const POINTS = {
    "0.5": 0.12, "1": 0.15, "2": 0.23, "3": 0.34,
    "4": 0.51, "5": 0.76, "6": 1.14, "7": 1.71, "8": 2.56
  };

  let counts = { "0.5":0, "1":0, "2":0, "3":0, "4":0, "5":0, "6":0, "7":0, "8":0 };
  let lastAction = null;

  const totalScoreEl = $("#totalScore");
  const undoBtn = $("#undoBtn");
  const resetBtn = $("#resetBtn");
  const btnSubmit = $("#btnSubmit");

  function updateUI() {
    for (const lvl in counts) {
      let el = document.querySelector("#count" + lvl.replace(".", ""));
      if (el) el.textContent = counts[lvl];
    }
    let total = 0;
    for (const lvl in counts) total += counts[lvl] * POINTS[lvl];
    totalScoreEl.textContent = total.toFixed(2);
  }

  document.querySelectorAll(".skill-btn").forEach(btn => {
    btn.style.touchAction = "manipulation";

    btn.addEventListener("pointerdown", () => {
      const lvl = btn.dataset.level;

      lastAction = { level: lvl, prev: counts[lvl] };
      counts[lvl]++;

      updateUI();
      if (navigator.vibrate) navigator.vibrate([80]);

      btn.classList.add("pressed");
      setTimeout(() => btn.classList.remove("pressed"), 150);
    }, { passive:true });
  });

  undoBtn.addEventListener("click", () => {
    if (!lastAction) return;
    counts[lastAction.level] = lastAction.prev;
    lastAction = null;
    updateUI();
  });

  resetBtn.addEventListener("click", () => {
    for (let lvl in counts) counts[lvl] = 0;
    lastAction = null;
    updateUI();
  });

  /* ============================================================
     SUBMIT (IDENTICAL TO Speed behavior)
  ============================================================ */

  const overlay = $("#submitOverlay");
  const overlayText = $("#overlayText");

  btnSubmit.addEventListener("click", async () => {

    // prevent double tap
    if (btnSubmit.dataset.lock === "1") return;
    btnSubmit.dataset.lock = "1";

    const diffScore = Number(totalScoreEl.textContent);

    overlay.style.opacity = "1";
    overlay.classList.remove("hide");
    overlayText.textContent = "Submitting…";

    const payload = {
      judgeType: "difficulty",
      ID: params.get("id"),
      NAME1: params.get("name1"),
      TEAM: params.get("team"),
      STATE: params.get("state"),
      HEAT: params.get("heat"),
      STATION: params.get("station"),
      EVENT: params.get("event"),
      DIVISION: params.get("division"),
      DIFF: diffScore,
      REMARK: ""
    };

    apiPost(payload)
      .then(() => {
        overlayText.textContent = "Saved ✔";

        /* ============================================================
           INSTANT CACHE UPDATE — MATCH SPEED EXACTLY
        ============================================================ */
        try {
          const station = params.get("station");
          const entryId = params.get("id");
          const CACHE_KEY = "station_cache_" + station;

          const raw = localStorage.getItem(CACHE_KEY);
          if (raw) {
            const cacheData = JSON.parse(raw);

            cacheData.entries = cacheData.entries.map(e =>
              e.entryId === entryId ? { ...e, status:"done" } : e
            );

            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
          }
        } catch (err) {}

        /* ============================================================
           SAME REDIRECT AS SPEED
        ============================================================ */
        setTimeout(() => {
          location.href = returnURL;
        }, 150);
      })

      .catch(() => {
        overlayText.textContent = "Submit failed";
        setTimeout(() => overlay.classList.add("hide"), 800);

        btnSubmit.dataset.lock = "0";
      });
  });

  updateUI();

})();
