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

  let lastAction = null; // { level: "4", prev: 2 }

  const totalScoreEl = document.querySelector("#totalScore");

  /* ============================================================
     UPDATE DISPLAY
     ============================================================ */
  function updateUI() {
    // Update each counter block
    for (const lvl in counts) {
      const el = document.querySelector(`#count${lvl.replace(".", "")}`);
      if (el) el.textContent = counts[lvl];
    }

    // Calculate total score
    let total = 0;
    for (const lvl in counts) {
      total += counts[lvl] * POINTS[lvl];
    }

    totalScoreEl.textContent = total.toFixed(2);
  }

  /* ============================================================
     SKILL BUTTON — SUPER SENSITIVE (pointerdown) + VIBRATION
     ============================================================ */
  function addClickEvents() {
    document.querySelectorAll(".skill-btn").forEach(btn => {
      btn.style.touchAction = "manipulation";   // improve touch response

      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault(); // removes delay

        // 🔥 VIBRATION ONLY HERE
        if (navigator.vibrate) navigator.vibrate(15);

        const level = btn.dataset.level;

        // Tap feedback
        btn.classList.add("pressed");
        setTimeout(() => btn.classList.remove("pressed"), 120);

        // Store last action (for undo)
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
     UNDO (ONE STEP ONLY) — NO VIBRATION
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
     RESET — NO VIBRATION
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
     SUBMIT RESULT — NO VIBRATION
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
