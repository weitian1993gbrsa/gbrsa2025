(function () {

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const reps = {
    0: 0,
    0.5: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0
  };

  const points = {
    0: 0.00,
    0.5: 0.12,
    1: 0.15,
    2: 0.23,
    3: 0.34,
    4: 0.51,
    5: 0.76,
    6: 1.14,
    7: 1.71,
    8: 2.56
  };

  let undoLevel = null;

  const totalScoreEl = $("#totalScore");
  const undoBtn = $("#undoBtn");
  const resetBtn = $("#resetBtn");
  const submitBtn = $("#btnSubmit");

  /* =======================================
     PARSE URL + Fill hidden fields
  ======================================= */
  const qs = new URLSearchParams(location.search);
  const set = (id, val) => { const el = $(id); if (el) el.value = val || ""; };

  set("#fID", qs.get("id"));
  set("#fNAME1", qs.get("name1"));
  set("#fNAME2", qs.get("name2"));
  set("#fNAME3", qs.get("name3"));
  set("#fNAME4", qs.get("name4"));
  set("#fTEAM", qs.get("team"));
  set("#fSTATE", qs.get("state"));
  set("#fHEAT", qs.get("heat"));
  set("#fSTATION", qs.get("station"));
  set("#fEVENT", qs.get("event"));
  set("#fDIVISION", qs.get("division"));
  set("#fKEY", qs.get("key"));

  /* =======================================
     CALCULATE TOTAL SCORE
  ======================================= */
  function updateScore() {
    let total = 0;
    for (let lvl in reps) {
      total += reps[lvl] * points[lvl];
    }
    totalScoreEl.textContent = total.toFixed(2);
  }

  /* =======================================
     LEVEL BUTTON TAP
  ======================================= */
  $$(".level-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lvl = btn.dataset.level;
      reps[lvl]++;

      $(`#rep${lvl.replace(".", "_")}`).textContent = reps[lvl];

      undoLevel = lvl;
      undoBtn.disabled = false;

      updateScore();
    });
  });

  /* =======================================
     SINGLE UNDO (1-step)
  ======================================= */
  undoBtn.addEventListener("click", () => {
    if (!undoLevel) return;

    if (reps[undoLevel] > 0) {
      reps[undoLevel]--;
      $(`#rep${undoLevel.replace(".", "_")}`).textContent = reps[undoLevel];
    }

    undoLevel = null;
    undoBtn.disabled = true;
    updateScore();
  });

  /* =======================================
     RESET
  ======================================= */
  resetBtn.addEventListener("click", () => {
    for (let lvl in reps) {
      reps[lvl] = 0;
      $(`#rep${lvl.replace(".", "_")}`).textContent = "0";
    }
    undoLevel = null;
    undoBtn.disabled = true;
    updateScore();
  });

  /* =======================================
     SUBMIT SCORE
  ======================================= */
  submitBtn.addEventListener("click", async () => {

    const payload = {
      _form: "freestyle_difficulty",
      ID: $("#fID").value,
      STATION: $("#fSTATION").value,
      EVENT: $("#fEVENT").value,
      DIVISION: $("#fDIVISION").value,
      KEY: $("#fKEY").value,
      TOTAL_DIFFICULTY: totalScoreEl.textContent,

      LEVEL_0: reps[0],
      LEVEL_0_5: reps[0.5],
      LEVEL_1: reps[1],
      LEVEL_2: reps[2],
      LEVEL_3: reps[3],
      LEVEL_4: reps[4],
      LEVEL_5: reps[5],
      LEVEL_6: reps[6],
      LEVEL_7: reps[7],
      LEVEL_8: reps[8]
    };

    try {
      await apiPost(payload);

      // return to freestyle station
      location.href = `freestyle-station.html?station=${qs.get("station")}&judgeType=difficulty&key=${qs.get("key")}`;
    } catch (e) {
      alert("Submit failed. Check connection.");
      console.error(e);
    }
  });

})();
