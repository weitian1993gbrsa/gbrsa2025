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
     SKILL BUTTON — SUPER SENSITIVE + EXTREME VIBRATION + FIRST TAP FIX
     ============================================================ */
  function addClickEvents() {
    document.querySelectorAll(".skill-btn").forEach(btn => {
      btn.style.touchAction = "manipulation";

      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();

        // 🔓 FIX: unlock iOS vibration on first tap
        if (navigator.vibrate) navigator.vibrate(1);

        // 🔥 EXTREME VIBRATION
        if (navigator.vibrate) navigator.vibrate([120, 80, 40]);

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
     UNDO — unchanged
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
     RESET — unchanged
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
     SUBMIT RESULT — unchanged
     ============================================================ */
  document.querySelector("#btnSubmit").addEventListener("pointerdown", (e) => {
    e.preventDefault();

    const payload = {
      type: "difficulty",
      score: Number(totalScoreEl.textContent),
      counts: { ...counts }
    };

    console.log("🚀 SUBMIT DATA:", payload);
    alert("Difficulty score submitted!\n(Backend WIP)");
  });

  /* ============================================================
     INIT
     ============================================================ */
  addClickEvents();
  updateUI();

})();
