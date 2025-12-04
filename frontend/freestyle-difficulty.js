(() => {

  /* ============================================================
     POINT TABLE (IJRU OFFICIAL)
     ============================================================ */
  const POINTS = {
    "0.5": 0.12,
    "1":   0.15,
    "2":   0.23,
    "3":   0.34,
    "4":   0.51,
    "5":   0.76,
    "6":   1.14,
    "7":   1.71,
    "8":   2.56
  };

  /* ============================================================
     STATE
     ============================================================ */
  let counts = {
    "0.5": 0,
    "1":   0,
    "2":   0,
    "3":   0,
    "4":   0,
    "5":   0,
    "6":   0,
    "7":   0,
    "8":   0
  };

  let lastAction = null;

  const totalScoreEl = document.querySelector("#totalScore");

  /* ============================================================
     UPDATE DISPLAY
     ============================================================ */
  function updateUI() {
    for (const lvl in counts) {
      const el = document.querySelector(`#count${lvl.replace(".", "")}`);
      if (el) el.textContent = counts[lvl];
    }

    let total = 0;
    for (const lvl in counts) {
      total += counts[lvl] * POINTS[lvl];
    }

    totalScoreEl.textContent = total.toFixed(2);
  }

  /* ============================================================
     SKILL BUTTON — SUPER SENSITIVE (pointerdown) + EXTREME VIBRATION
     ============================================================ */
  function addClickEvents() {
    document.querySelectorAll(".skill-btn").forEach(btn => {
      btn.style.touchAction = "manipulation";

      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();

        // iOS vibration unlock
        if (navigator.vibrate) navigator.vibrate(1);

        // Extreme vibration
        if (navigator.vibrate) navigator.vibrate([120, 80]);

        const level = btn.dataset.level;

        btn.classList.add("pressed");
        setTimeout(() => btn.classList.remove("pressed"), 120);

        lastAction = {
          level,
          prev: counts[level]
        };

        counts[level]++;
        updateUI();
      }, { passive: true });
    });
  }

  /* ============================================================
     UNDO
     ============================================================ */
  document.querySelector("#undoBtn").addEventListener("pointerdown", (e) => {
    e.preventDefault();

    const btn = e.currentTarget;
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 120);

    if (!lastAction) return;

    const { level, prev } = lastAction;
    counts[level] = prev;

    lastAction = null;
    updateUI();
  });

  /* ============================================================
     RESET
     ============================================================ */
  document.querySelector("#resetBtn").addEventListener("pointerdown", (e) => {
    e.preventDefault();

    const btn = e.currentTarget;
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 120);

    for (const lvl in counts) counts[lvl] = 0;
    lastAction = null;
    updateUI();
  });

  /* ============================================================
   SUBMIT — Difficulty Judge ONLY (DIFF only)
   ============================================================ */
document.querySelector("#btnSubmit").addEventListener("pointerdown", async (e) => {
  e.preventDefault();

  if (navigator.vibrate) navigator.vibrate([60, 40, 60]);

  const params = new URLSearchParams(location.search);

  // ⭐ DIFF judge sends ONLY DIFF
  const payload = {
    _form: "freestyle",

    ID: params.get("id"),
    NAME1: params.get("name1"),
    TEAM: params.get("team"),
    STATE: params.get("state"),
    HEAT: params.get("heat"),
    STATION: params.get("station"),
    EVENT: params.get("event"),
    DIVISION: params.get("division"),

    DIFF: Number(totalScoreEl.textContent),

    // ⭐ All other freestyle fields EMPTY
    MISSES: "",
    BREAKS: "",
    PRESENTATION: "",
    "Missed RE": "",
    REMARK: ""
  };

  const btn = document.querySelector("#btnSubmit");
  btn.disabled = true;
  btn.textContent = "Saving...";

  try {
    const res = await fetch(window.CONFIG.APPS_SCRIPT_URL + "?t=" + Date.now(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!json.ok) throw new Error("Backend rejected");

    btn.textContent = "Saved ✔";
    setTimeout(() => history.back(), 300);

  } catch (err) {
    alert("Submit failed, try again.");
    btn.disabled = false;
    btn.textContent = "Submit";
  }
});

  /* ============================================================
     INIT
     ============================================================ */
  addClickEvents();
  updateUI();

})();
