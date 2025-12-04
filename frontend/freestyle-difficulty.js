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
     SKILL BUTTON EVENT
  ============================================================ */
  function addClickEvents() {
    document.querySelectorAll(".skill-btn").forEach(btn => {
      btn.style.touchAction = "manipulation";

      btn.addEventListener("pointerdown", (e) => {
        if (navigator.vibrate) navigator.vibrate([100]);

        const level = btn.dataset.level;

        btn.classList.add("pressed");
        setTimeout(() => btn.classList.remove("pressed"), 120);

        lastAction = { level, prev: counts[level] };
        counts[level]++;

        updateUI();
      });
    });
  }

  /* ============================================================
     UNDO
  ============================================================ */
  document.querySelector("#undoBtn").addEventListener("click", () => {
    if (!lastAction) return;
    const { level, prev } = lastAction;
    counts[level] = prev;
    lastAction = null;
    updateUI();
  });

  /* ============================================================
     RESET
  ============================================================ */
  document.querySelector("#resetBtn").addEventListener("click", () => {
    for (const lvl in counts) counts[lvl] = 0;
    lastAction = null;
    updateUI();
  });

  /* ============================================================
     SUBMIT — FIXED (must use CLICK, not pointerdown)
  ============================================================ */
  document.querySelector("#btnSubmit").addEventListener("click", async () => {

    const params = new URLSearchParams(location.search);

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

      MISSES: "",
      BREAKS: "",
      MissRE: "",
      PRESENTATION: "",
      REMARK: ""
    };

    const btn = document.querySelector("#btnSubmit");
    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
      const res = await fetch(window.CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.ok) throw new Error(json.error || "Submit error");

      btn.textContent = "Saved ✔";

      setTimeout(() => history.back(), 350);

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
