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

          // Remove leading zero
          if (current === "0") current = "";

          // Prevent typing more than 3 digits
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
     DIFFICULTY (FREESTYLE) — Full UI Logic + Scoring
     Based on the user's old freestyle-difficulty.js
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

      /* -------------------------------------------
         SKILL BUTTONS
      ------------------------------------------- */
      document.querySelectorAll(".skill-btn").forEach(btn => {
        btn.addEventListener("pointerdown", () => {
          const lvl = btn.dataset.level;

          this.lastAction = { level: lvl, prev: this.counts[lvl] };
          this.counts[lvl]++;

          this.updateUI();

          if (navigator.vibrate) navigator.vibrate([80]);
          btn.classList.add("pressed");
          setTimeout(() => btn.classList.remove("pressed"), 150);
        });
      });

      /* -------------------------------------------
   UNDO ACTION — High Sensitivity Patch
------------------------------------------- */
const undoHandler = () => {
  if (!this.lastAction) return;

  this.counts[this.lastAction.level] = this.lastAction.prev;
  this.lastAction = null;
  this.updateUI();
};

// Touchstart = instant response (mobile)
this.undoBtn.addEventListener("touchstart", undoHandler, { passive: true });

// Pointerdown = covers mouse, stylus, some Android
this.undoBtn.addEventListener("pointerdown", undoHandler);


      /* -------------------------------------------
         RESET ALL COUNTS
      ------------------------------------------- */
      this.resetBtn.addEventListener("click", () => {
        for (let lvl in this.counts) this.counts[lvl] = 0;
        this.lastAction = null;
        this.updateUI();
      });

      this.updateUI();
    },

    /* -------------------------------------------
       Update Displayed Counts + Total Score
    ------------------------------------------- */
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

    /* -------------------------------------------
       Return Score to judge-core.js
    ------------------------------------------- */
    getScore() {
      return {
        DIFF: Number(this.totalScoreEl?.textContent || 0)
      };
    }
  };


/* ------------------------------------------------------------
   TECHNICAL (FREESTYLE) — IJRU STYLE UNDO
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

    // Hide UNDO initially
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
    });

    /* === UNDO === */
    undoBtn.addEventListener("click", () => {
      if (!this.lastAction) return;

      window.technicalMisses = this.lastAction.prevMiss;
      window.technicalBreaks = this.lastAction.prevBreak;

      missEl.textContent  = window.technicalMisses;
      breakEl.textContent = window.technicalBreaks;

      // Hide after undo (IJRU behavior)
      undoBtn.classList.add("hidden");

      this.lastAction = null;
    });

    /* === RESET === */
    resetBtn.addEventListener("click", () => {
      window.technicalMisses = 0;
      window.technicalBreaks = 0;

      missEl.textContent  = 0;
      breakEl.textContent = 0;

      undoBtn.classList.add("hidden");
      this.lastAction = null;
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


  /* ------------------------------------------------------------
     PRESENTATION (FREESTYLE)
------------------------------------------------------------ */
  JudgeForms.presentation = {

    init() {
      console.log("[JudgeForms] PRESENTATION init");

      if (window.presentationScore == null) window.presentationScore = 0;
    },

    getScore() {
      return { PRESENTATION: window.presentationScore };
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
