(function () {

  /* ============================================================
     TECHNICAL JUDGE COUNTERS
     (Matching behavior of freestyle-difficulty.js)
  ============================================================ */

  let counts = {
    MISS: 0,
    BREAK: 0
  };

  let lastAction = null;
  const $ = (q) => document.querySelector(q);

  const missEl  = $("#countMiss");
  const breakEl = $("#countBreak");

  const btnSubmit = $("#btnSubmit");
  const undoBtn   = $("#undoBtn");
  const resetBtn  = $("#resetBtn");

  /* ============================================================
     UPDATE UI
  ============================================================ */
  function updateUI() {
    missEl.textContent  = counts.MISS;
    breakEl.textContent = counts.BREAK;
  }

  /* ============================================================
     TAP BUTTONS (MATCH DIFFICULTY BEHAVIOR)
  ============================================================ */
  document.querySelectorAll(".tech-btn").forEach(btn => {
    btn.addEventListener("pointerdown", () => {
      const type = btn.dataset.type; // "MISS" or "BREAK"

      lastAction = {
        type,
        prev: counts[type]
      };

      counts[type]++;

      updateUI();

      if (navigator.vibrate) navigator.vibrate([80]);
      btn.classList.add("pressed");
      setTimeout(() => btn.classList.remove("pressed"), 150);
    });
  });

  /* ============================================================
     UNDO (MATCH DIFFICULTY)
  ============================================================ */
  undoBtn.addEventListener("click", () => {
    if (!lastAction) return;

    counts[lastAction.type] = lastAction.prev;
    lastAction = null;
    updateUI();
  });

  /* ============================================================
     RESET (MATCH DIFFICULTY)
  ============================================================ */
  resetBtn.addEventListener("click", () => {
    counts.MISS  = 0;
    counts.BREAK = 0;
    lastAction = null;
    updateUI();
  });

  /* ============================================================
     SUBMIT — SAME BEHAVIOR AS freestyle-difficulty.js
  ============================================================ */
  btnSubmit.addEventListener("click", async () => {

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Saving...";

  const params = new URLSearchParams(location.search);

  const payload = {
    _form: "freestyle",

    ID: params.get("id") || "",
    NAME1: params.get("name1") || "",
    NAME2: params.get("name2") || "",
    NAME3: params.get("name3") || "",
    NAME4: params.get("name4") || "",
    TEAM: params.get("team") || "",
    STATE: params.get("state") || "",
    HEAT: params.get("heat") || "",
    STATION: params.get("station") || "",
    EVENT: params.get("event") || "",
    DIVISION: params.get("division") || "",

    MISSES: counts.MISS,
    BREAKS: counts.BREAK,

    DIFF: "",
    MissRE: "",
    PRESENTATION: "",
    REMARK: ""
  };

  try {
    const result = await apiPost(payload);
    if (!result || !result.ok) throw new Error(result?.error || "Server rejected");

    btnSubmit.textContent = "Saved ✔";

    // ⭐ GO BACK TO TECHNICAL STATION PAGE
    const station = params.get("station");
    const key = params.get("key");

    setTimeout(() => {
      location.href =
        `freestyle-station.html?station=${station}&key=${key}&judgeType=technical`;
    }, 350);

  } catch (err) {
    console.error(err);
    alert("Submit failed — " + err.message);
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Submit";
  }
});


  updateUI();

})();
