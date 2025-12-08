/* ============================================================
   JUDGE FORMS — Scoring Logic for ALL Judge Types
   Used by judge-core.js
   - Speed
   - Difficulty
   - Technical
   - RE
   - Presentation
============================================================ */

(function () {

  window.JudgeForms = {};

  /* ------------------------------------------------------------
     SPEED JUDGE — Full UI functionality + 3-digit limit
------------------------------------------------------------ */
  JudgeForms.speed = {

    init() {
      console.log("[JudgeForms] SPEED init");

      this.scoreScreen   = document.querySelector("#scoreScreen");
      this.falseStartBtn = document.querySelector("#falseStartBtn");
      this.falseStartVal = document.querySelector("#falseStartVal");
      this.numpadButtons = document.querySelectorAll(".numpad-grid button");

      const MAX_DIGITS = 3;

      /* ---------------------------
         FALSE START TOGGLE LOGIC
      --------------------------- */
      this.falseStartBtn.addEventListener("click", () => {
        if (this.falseStartVal.value === "YES") {
          this.falseStartVal.value = "";
          this.falseStartBtn.textContent = "False Start: No";
          this.falseStartBtn.classList.remove("fs-yes");
          this.falseStartBtn.classList.add("fs-no");
        } else {
          this.falseStartVal.value = "YES";
          this.falseStartBtn.textContent = "False Start: Yes";
          this.falseStartBtn.classList.remove("fs-no");
          this.falseStartBtn.classList.add("fs-yes");
        }
      });

      /* ---------------------------
         NUMBER PAD LOGIC (3-digit max)
      --------------------------- */
      this.numpadButtons.forEach(btn => {
        const key = btn.dataset.key;

        if (!key) return;

        btn.addEventListener("click", () => {

          if (key === "clear") {
            this.scoreScreen.textContent = "0";
            return;
          }

          let current = this.scoreScreen.textContent.trim();

          if (current === "0") current = "";
          if (current.length >= MAX_DIGITS) return;

          this.scoreScreen.textContent = current + key;
        });
      });
    },

    getScore() {
      return {
        SCORE: Number(this.scoreScreen?.textContent || 0),
        "FALSE START": this.falseStartVal?.value || ""
      };
    }
  };


  /* ------------------------------------------------------------
     DIFFICULTY (FREESTYLE)
------------------------------------------------------------ */
  JudgeForms.difficulty = {

    POINTS: {
      "0.5": 0.12, "1": 0.15, "2": 0.23, "3": 0.34,
      "4": 0.51, "5": 0.76, "6": 1.14, "7": 1.71, "8": 2.56
    },

    counts: { "0.5":0, "1":0, "2":0, "3":0, "4":0, "5":0, "6":0, "7":0, "8":0 },
    lastAction: null,

    init() {
      console.log("[JudgeForms] DIFFICULTY init");

      this.totalScoreEl = document.querySelector("#totalScore");
      this.undoBtn = document.querySelector("#undoBtn");
      this.resetBtn = document.querySelector("#resetBtn");

      /* SKILL BUTTONS */
      document.querySelectorAll(".skill-btn").forEach(btn => {
        btn.addEventListener("pointerdown", () => {
          const lvl = btn.dataset.level;

          this.lastAction = { level: lvl, prev: this.counts[lvl] };
          this.counts[lvl]++;

          this.updateUI();

          if (navigator.vibrate) navigator.vibrate([80]); // vibration
          btn.classList.add("pressed");
          setTimeout(() => btn.classList.remove("pressed"), 150);
        });
      });

      /* UNDO (high sensitivity) */
      const undoHandler = () => {
        if (!this.lastAction) return;

        this.counts[this.lastAction.level] = this.lastAction.prev;
        this.lastAction = null;
        this.updateUI();

        if (navigator.vibrate) navigator.vibrate([40]);
      };

      this.undoBtn.addEventListener("touchstart", undoHandler, { passive: true });
      this.undoBtn.addEventListener("pointerdown", undoHandler);

      /* RESET */
      this.resetBtn.addEventListener("click", () => {
        for (let lvl in this.counts) this.counts[lvl] = 0;
        this.lastAction = null;
        this.updateUI();

        if (navigator.vibrate) navigator.vibrate([120]); // strong vibration
      });

      this.updateUI();
    },

    updateUI() {
      for (const lvl in this.counts) {
        const id = "#count" + lvl.replace(".", "");
        const el = document.querySelector(id);
        if (el) el.textContent = this.counts[lvl];
      }

      let total = 0;
      for (const lvl in this.counts) total += this.counts[lvl] * this.POINTS[lvl];

      this.totalScoreEl.textContent = total.toFixed(2);
    },

    getScore() {
      return { DIFF: Number(this.totalScoreEl?.textContent || 0) };
    }
  };


/* ------------------------------------------------------------
   TECHNICAL — patched vibration + IJRU undo behavior
------------------------------------------------------------ */
JudgeForms.technical = {

  lastAction: null,

  init() {
    console.log("[JudgeForms] TECHNICAL init");

    window.technicalMisses = 0;
    window.technicalBreaks = 0;

    const missEl  = document.getElementById("missCount");
    const breakEl = document.getElementById("breakCount");

    const missBtn  = document.querySelector("[data-type='miss']");
    const breakBtn = document.querySelector("[data-type='break']");

    const undoBtn  = document.getElementById("undoBtn");
    const resetBtn = document.getElementById("resetBtn");

    undoBtn.classList.add("hidden");

    /* === MISSES TAP === */
    missBtn.addEventListener("pointerdown", () => {
      this.lastAction = {
        prevMiss: window.technicalMisses,
        prevBreak: window.technicalBreaks
      };

      window.technicalMisses++;
      missEl.textContent = window.technicalMisses;

      undoBtn.classList.remove("hidden");

      // vibration + animation
      if (navigator.vibrate) navigator.vibrate([80]);
      missBtn.classList.add("pressed");
      setTimeout(() => missBtn.classList.remove("pressed"), 150);
    });

    /* === BREAKS TAP === */
    breakBtn.addEventListener("pointerdown", () => {
      this.lastAction = {
        prevMiss: window.technicalMisses,
        prevBreak: window.technicalBreaks
      };

      window.technicalBreaks++;
      breakEl.textContent = window.technicalBreaks;

      undoBtn.classList.remove("hidden");

      if (navigator.vibrate) navigator.vibrate([80]);
      breakBtn.classList.add("pressed");
      setTimeout(() => breakBtn.classList.remove("pressed"), 150);
    });

    /* === UNDO === */
    undoBtn.addEventListener("click", () => {
      if (!this.lastAction) return;

      window.technicalMisses = this.lastAction.prevMiss;
      window.technicalBreaks = this.lastAction.prevBreak;

      missEl.textContent  = window.technicalMisses;
      breakEl.textContent = window.technicalBreaks;

      undoBtn.classList.add("hidden");
      this.lastAction = null;

      if (navigator.vibrate) navigator.vibrate([40]); // light vibration
    });

    /* === RESET === */
    resetBtn.addEventListener("click", () => {
      window.technicalMisses = 0;
      window.technicalBreaks = 0;

      missEl.textContent = 0;
      breakEl.textContent = 0;

      undoBtn.classList.add("hidden");
      this.lastAction = null;

      if (navigator.vibrate) navigator.vibrate([120]); // strong vibration
    });
  },

  getScore() {
    return {
      MISSES: window.technicalMisses,
      BREAKS: window.technicalBreaks
    };
  }
};



  /* ------------------------------------------------------------
     RE (FREESTYLE)
------------------------------------------------------------ */
  JudgeForms.re = {

    init() {
      console.log("[JudgeForms] RE init");

      if (window.reMiss == null) window.reMiss = 0;
    },

    getScore() {
      return { MISSRE: window.reMiss };
    }
  };


/* ============================================================
   PRESENTATION (PAGE 1 + PAGE 2)
============================================================ */
JudgeForms.presentation = {

    /* IJRU Weights */
    WEIGHTS: {
        creativity: 0.15,
        musicality: 0.20,
        entertainment: 0.25,
        form: 0.25,
        variety: 0.15
    },

    /* Storage for Page 1 */
    page1Data: {
        creMinus: 0, crePlus: 0,
        musMinus: 0, musPlus: 0,
        entMinus: 0, entPlus: 0,
        formMinus: 0, formPlus: 0,
        varMinus: 0, varPlus: 0,
        misses: 0
    },

    /* Detect Page 1 or Page 2 */
    init() {
        const isPage2 = document.body.dataset.page === "presentation-summary";
        if (isPage2) this.initPage2();
        else this.initPage1();
    },

    /* ============================
       PAGE 1
    ============================ */
    initPage1() {
        console.log("[Presentation] Page 1 Init");

        const map = {
            "creativity-minus": "creMinus",
            "creativity-plus": "crePlus",
            "musicality-minus": "musMinus",
            "musicality-plus": "musPlus",
            "entertain-minus": "entMinus",
            "entertain-plus": "entPlus",
            "form-minus": "formMinus",
            "form-plus": "formPlus",
            "variety-minus": "varMinus",
            "variety-plus": "varPlus"
        };

        Object.keys(map).forEach(type => {
            const btn = document.querySelector(`[data-type='${type}']`);
            if (!btn) return;

            const key = map[type];
            const label = document.getElementById(key);

            btn.addEventListener("pointerdown", () => {
                this.page1Data[key]++;
                label.textContent = this.page1Data[key];
                btn.classList.add("pressed");
                setTimeout(()=>btn.classList.remove("pressed"),120);
            });
        });

        const missBtn = document.getElementById("missBtn");
        const missLabel = document.getElementById("missCount");

        missBtn.addEventListener("pointerdown", () => {
            this.page1Data.misses++;
            missLabel.textContent = this.page1Data.misses;
        });

        /* FIXED — Save FULL page1Data, not getScore() */
        document.getElementById("nextBtn").addEventListener("click", () => {
            localStorage.setItem("presentationPage1",
                JSON.stringify(this.page1Data)
            );
            window.location.href = "presentation-summary.html";
        });
    },

    /* ============================
       PAGE 2
    ============================ */
    initPage2() {
        console.log("[Presentation] Page 2 Init");

        const data = JSON.parse(localStorage.getItem("presentationPage1") || "{}");
        this.page1Data = data;

        this.finalScore = this.computeWeightedScore(data);

        if (document.getElementById("scoreText"))
            scoreText.textContent = `Score (${this.finalScore})`;

        if (document.getElementById("missText"))
            missText.textContent = `Misses (${data.misses || 0})`;

        const cats = ["cre","mus","ent","form","var"];

        cats.forEach(key => {
            const minus = data[key+"Minus"] || 0;
            const plus  = data[key+"Plus"]  || 0;

            const finalVal = 12 + plus - minus;

            const slider = document.getElementById(`slider_${key}`);
            const center = document.getElementById(`center_${key}`);

            if (slider) slider.value = finalVal;
            if (center) center.textContent = finalVal;
        });
    },

    /* Weighted score */
    computeWeightedScore(d) {
        let sum =
            (12 + d.crePlus - d.creMinus) * this.WEIGHTS.creativity +
            (12 + d.musPlus - d.musMinus) * this.WEIGHTS.musicality +
            (12 + d.entPlus - d.entMinus) * this.WEIGHTS.entertainment +
            (12 + d.formPlus - d.formMinus) * this.WEIGHTS.form +
            (12 + d.varPlus - d.varMinus) * this.WEIGHTS.variety;

        sum -= d.misses * 1;

        return Number(sum.toFixed(1));
    },

    /* IMPORTANT — return ONLY page1Data for Next Page usage */
    getScore() {
        return this.page1Data;
    }
};

  /* ------------------------------------------------------------
     AUTO INIT API
  ------------------------------------------------------------ */
  window.initJudgeForm = function (judgeType) {
    const block = JudgeForms[judgeType];
    if (!block) {
      console.error("[JudgeForms] Unknown judge type:", judgeType);
      return null;
    }
    if (typeof block.init === "function") block.init();
    return block;
  };

})();
